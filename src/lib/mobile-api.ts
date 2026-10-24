import { entitlementSnapshotsAgree, parseEntitlements } from './entitlements';
import { session } from './session';
import { requestDiagnostics } from './request-diagnostics';

export const API_BASE_URL = 'https://int.9starkiastrology.com/api/mobile/v1';

export class MobileApiError extends Error {
  constructor(public readonly code: string, public readonly status?: number, public readonly endpoint?: string) {
    super(code);
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

type Endpoint = 'metadata/options' | 'metadata/timezones' | 'account/me' | 'account/csrf' |
  'account/login' | 'account/logout' | 'account/update' | 'membership/entitlements' |
  'personal-chart/me' | 'personal-chart/me/free';
type Post = { body: Record<string, unknown>; csrfToken: string };

const activeRequests = new Map<number, () => void>();
let requestGeneration = session.getSnapshot().generation;
session.subscribe(() => {
  const next = session.getSnapshot().generation;
  if (next === requestGeneration) return;
  requestGeneration = next;
  // Cancel obsolete transport work too, rather than only ignoring its reply.
  for (const cancel of activeRequests.values()) cancel();
});

// Native fetch owns the cookie jar. Never log request bodies, cookies or CSRF tokens.
async function request(endpoint: Endpoint, post?: Post): Promise<{ status: number; data: unknown }> {
  const generation = session.getSnapshot().generation;
  const controller = new AbortController();
  const startedAt = Date.now();
  const id = requestDiagnostics.start(endpoint, post ? 'POST' : 'GET', generation);
  let status: number | undefined;
  let finished = false;
  let outcome = 'success';
  let rejectCancellation: (error: MobileApiError) => void = () => {};
  const cancellation = new Promise<never>((_resolve, reject) => { rejectCancellation = reject; });
  const cancel = (code: string) => {
    rejectCancellation(new MobileApiError(code, status, endpoint));
    controller.abort();
  };
  activeRequests.set(id, () => cancel('session_changed'));
  const timeout = setTimeout(() => cancel('request_timeout'), 15000);
  try {
    const operation = async () => {
      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: post ? 'POST' : 'GET',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          ...(post && { 'Content-Type': 'application/json', 'X-CSRF-Token': post.csrfToken }),
        },
        ...(post && { body: JSON.stringify(post.body) }),
        signal: controller.signal,
      });
      if (finished) throw new MobileApiError('request_cancelled');
      status = response.status;
      requestDiagnostics.update(id, { status, phase: 'body' });
      const envelope: unknown = await response.json();
      if (finished) throw new MobileApiError('request_cancelled');
      if (generation !== session.getSnapshot().generation) throw new MobileApiError('session_changed');
      if (!isObject(envelope)) throw new MobileApiError('invalid_response', status);
      if (!response.ok || envelope.success !== true) {
        const code = isObject(envelope.error) && typeof envelope.error.code === 'string'
          ? envelope.error.code
          : 'invalid_response';
        if (status === 401 && code === 'authentication_required') {
          activeRequests.delete(id); // Preserve this request's actual 401; cancel its siblings.
          session.change();
        }
        throw new MobileApiError(code, status);
      }
      if (envelope.data == null || envelope.error !== null) {
        throw new MobileApiError('invalid_response', status);
      }
      return { status, data: envelope.data };
    };
    return await Promise.race([operation(), cancellation]);
  } catch (error) {
    if (generation !== session.getSnapshot().generation &&
      !(error instanceof MobileApiError && error.code === 'authentication_required')) {
      outcome = 'session_changed';
      throw new MobileApiError('session_changed', status, endpoint);
    }
    if (error instanceof MobileApiError) {
      outcome = error.code;
      throw new MobileApiError(error.code, error.status, endpoint);
    }
    outcome = controller.signal.aborted ? 'request_timeout' : status ? 'invalid_response' : 'network_error';
    throw new MobileApiError(
      outcome, status, endpoint
    );
  } finally {
    finished = true;
    clearTimeout(timeout);
    activeRequests.delete(id);
    requestDiagnostics.update(id, { elapsedMs: Date.now() - startedAt, outcome });
  }
}

export async function mobileApiRequest(
  endpoint: Exclude<Endpoint, 'metadata/timezones'>, post?: Post
): Promise<{ status: number; data: Record<string, unknown> }> {
  const response = await request(endpoint, post);
  if (!isObject(response.data)) throw new MobileApiError('invalid_response', response.status);
  return { ...response, data: response.data };
}

export async function getTimezones(): Promise<{ label: string; value: string }[]> {
  const { data, status } = await request('metadata/timezones');
  if (!Array.isArray(data) || data.some((item) => !isObject(item) ||
    typeof item.label !== 'string' || typeof item.value !== 'string')) {
    throw new MobileApiError('invalid_response', status);
  }
  const zones = data as { label: string; value: string }[];
  return zones.filter((zone, index) => zones.findIndex((item) => item.value === zone.value) === index);
}

async function getCsrfToken() {
  const { data } = await mobileApiRequest('account/csrf');
  if (typeof data.requestToken !== 'string' || !data.requestToken) {
    throw new MobileApiError('invalid_response');
  }
  return data.requestToken;
}

export async function signIn(username: string, password: string) {
  session.change('changing');
  const generation = session.getSnapshot().generation;
  try {
    const csrfToken = await getCsrfToken();
    if (generation !== session.getSnapshot().generation) throw new MobileApiError('session_changed');
    const { data, status } = await mobileApiRequest('account/login', {
      body: { username: username.trim(), password, rememberMe: false },
      csrfToken,
    });
    if (data.authenticated !== true) throw new MobileApiError('invalid_response', status);
    // Refresh the token for the new identity before any subsequent POST.
    await getCsrfToken();
    return await getOwnAccount(true);
  } catch (error) {
    session.signedOut(generation);
    throw error;
  }
}

export async function getOwnAccount(login = false) {
  const ticket = session.beginRead();
  try {
    const result = await mobileApiRequest('account/me');
    if (typeof result.data.emailAddress !== 'string' || !result.data.emailAddress) {
      throw new MobileApiError('invalid_response', result.status);
    }
    const entitlements = readEntitlements(result.data.entitlements, result.status);
    const identity = result.data.emailAddress.trim().toLowerCase();
    if (!session.acceptAccount(ticket, identity, entitlements, login)) {
      const current = session.getSnapshot();
      if (current.generation !== ticket.generation || current.status !== 'signed-in' || current.identity !== identity) {
        throw new MobileApiError('session_changed');
      }
    }
    return result;
  } catch (error) {
    session.clearEntitlements(ticket.generation, ticket.read);
    throw error;
  }
}

function readEntitlements(value: unknown, status: number) {
  try { return parseEntitlements(value); }
  catch { throw new MobileApiError('invalid_response', status); }
}

export async function refreshEntitlements() {
  // Recheck identity as well as access, without replacing any editable form state.
  await getOwnAccount();
  const ticket = session.beginRead();
  try {
    const result = await mobileApiRequest('membership/entitlements');
    if (!session.acceptEntitlements(ticket, readEntitlements(result.data, result.status))) {
      throw new MobileApiError('session_changed');
    }
  } catch (error) {
    session.clearEntitlements(ticket.generation, ticket.read);
    throw error;
  }
}

export async function compareEntitlementSnapshots() {
  const account = await getOwnAccount();
  const ticket = session.beginRead();
  try {
    const dedicated = await mobileApiRequest('membership/entitlements');
    const snapshot = readEntitlements(dedicated.data, dedicated.status);
    if (!session.acceptEntitlements(ticket, snapshot)) throw new MobileApiError('session_changed');
    return entitlementSnapshotsAgree(readEntitlements(account.data.entitlements, account.status), snapshot);
  } catch (error) {
    session.clearEntitlements(ticket.generation, ticket.read);
    throw error;
  }
}

export async function signOut() {
  session.change('changing');
  const generation = session.getSnapshot().generation;
  try {
    const csrfToken = await getCsrfToken();
    const { data, status } = await mobileApiRequest('account/logout', { body: {}, csrfToken });
    if (data.authenticated !== false) throw new MobileApiError('invalid_response', status);
  } finally { session.signedOut(generation); }
}

export async function getOwnChart() {
  try {
    const result = await mobileApiRequest('personal-chart/me');
    return { ...result, access: 'full' as const };
  } catch (error) {
    if (!(error instanceof MobileApiError) || error.status !== 403 || error.code !== 'membership_required') {
      throw error;
    }
    if (session.getSnapshot().entitlements?.mobileAccess) {
      session.clearEntitlements(session.getSnapshot().generation);
    }
    const result = await mobileApiRequest('personal-chart/me/free');
    return { ...result, access: 'free' as const };
  }
}

export async function updateOwnAccount(body: Record<string, unknown>) {
  const generation = session.getSnapshot().generation;
  const csrfToken = await getCsrfToken();
  if (generation !== session.getSnapshot().generation) throw new MobileApiError('session_changed');
  const result = await mobileApiRequest('account/update', { body, csrfToken });
  if (result.data.updated !== true) throw new MobileApiError('invalid_response', result.status);
  return result;
}
