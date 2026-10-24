const assert = require('node:assert/strict');
const test = require('node:test');
const library = require('./load-library.cjs');
const { snapshot } = require('./fixtures.cjs');

function client(responses) {
  const calls = [];
  const load = library({
    fetch: async (url, options) => {
      calls.push({ url, options });
      assert.equal(options.credentials, 'include');
      assert.equal(options.headers.Accept, 'application/json');
      let response = responses.shift();
      assert.ok(response, 'Unexpected additional request (possible retry)');
      if (typeof response === 'function') response = await response();
      if (response instanceof Error) throw response;
      return {
        status: response.status,
        ok: response.status >= 200 && response.status < 300,
        json: async () => response.body,
      };
    },
  });
  return { ...load('mobile-api'), session: load('session').session, calls };
}

const success = (data) => ({ status: 200, body: { success: true, data, error: null } });
const failure = (status, code) => ({
  status, body: { success: false, data: null, error: { code } },
});

test('login sends CSRF and credentials once, refreshes CSRF, then verifies the session', async () => {
  const api = client([
    success({ requestToken: 'before-login' }),
    success({ authenticated: true, refreshCsrfToken: true }),
    success({ requestToken: 'after-login' }),
    success({ emailAddress: 'test@example.test', entitlements: snapshot() }),
  ]);
  const result = await api.signIn(' test-user ', ' password with spaces ');
  assert.equal(result.status, 200);
  assert.deepEqual(api.calls.map(({ url }) => new URL(url).pathname), [
    '/api/mobile/v1/account/csrf', '/api/mobile/v1/account/login',
    '/api/mobile/v1/account/csrf', '/api/mobile/v1/account/me',
  ]);
  const login = api.calls[1].options;
  assert.equal(login.method, 'POST');
  assert.equal(login.headers['X-CSRF-Token'], 'before-login');
  assert.equal(login.headers['Content-Type'], 'application/json');
  assert.deepEqual(JSON.parse(login.body), {
    username: 'test-user', password: ' password with spaces ', rememberMe: false,
  });
});

test('failed login is not retried or followed by authenticated requests', async () => {
  const api = client([success({ requestToken: 'token' }), failure(401, 'invalid_credentials')]);
  await assert.rejects(api.signIn('user', 'bad-password'), (error) =>
    error.code === 'invalid_credentials' && error.status === 401);
  assert.equal(api.calls.length, 2);
});

test('missing CSRF token prevents sending credentials', async () => {
  const api = client([success({})]);
  await assert.rejects(api.signIn('user', 'password'), (error) => error.code === 'invalid_response');
  assert.equal(api.calls.length, 1);
});

test('lost response after login does not replay the POST', async () => {
  const api = client([success({ requestToken: 'token' }), new Error('Connection lost')]);
  await assert.rejects(api.signIn('user', 'password'), (error) => error.code === 'network_error');
  assert.equal(api.calls.filter(({ options }) => options.method === 'POST').length, 1);
});

test('session verification failure is not reported as successful login', async () => {
  const api = client([
    success({ requestToken: 'token' }), success({ authenticated: true }),
    success({ requestToken: 'fresh-token' }), failure(401, 'authentication_required'),
  ]);
  await assert.rejects(api.signIn('user', 'password'), (error) =>
    error.code === 'authentication_required' && error.status === 401);
});

test('own chart reads the protected full route without posting calculation inputs', async () => {
  const api = client([success({ energies: {} })]);
  const chart = await api.getOwnChart();
  assert.equal(chart.access, 'full');
  assert.equal(api.calls.length, 1);
  assert.equal(api.calls[0].options.method, 'GET');
  assert.ok(api.calls[0].url.endsWith('/personal-chart/me'));
});

test('only explicit membership denial selects the free own chart route', async () => {
  const api = client([failure(403, 'membership_required'), success({ core: 1 })]);
  assert.equal((await api.getOwnChart()).access, 'free');
  assert.ok(api.calls[1].url.endsWith('/personal-chart/me/free'));
});

test('expiry and unrelated access failures do not fall back to another chart', async () => {
  for (const [status, code] of [[401, 'authentication_required'], [403, 'administrator_required'], [409, 'birth_details_required']]) {
    const api = client([failure(status, code)]);
    await assert.rejects(api.getOwnChart(), (error) => error.status === status && error.code === code);
    assert.equal(api.calls.length, 1);
  }
});

test('account save obtains fresh CSRF and posts exactly the supplied allowlisted request once', async () => {
  const api = client([success({ requestToken: 'fresh' }), success({ updated: true })]);
  await api.updateOwnAccount({ firstName: 'Test', settings: { person: { dateOfBirth: '1984-02-29' } } });
  assert.equal(api.calls.length, 2);
  const saved = api.calls[1];
  assert.ok(saved.url.endsWith('/account/update'));
  assert.equal(saved.options.method, 'POST');
  assert.equal(saved.options.headers['X-CSRF-Token'], 'fresh');
  assert.equal(JSON.parse(saved.options.body).settings.person.dateOfBirth, '1984-02-29');
});

test('lost save response is not retried', async () => {
  const api = client([success({ requestToken: 'fresh' }), new Error('Lost connection')]);
  await assert.rejects(api.updateOwnAccount({}), (error) => error.code === 'network_error');
  assert.equal(api.calls.length, 2);
});

test('timezones accept the list envelope and reject malformed options', async () => {
  const api = client([success([{ label: 'London', value: 'Europe/London' }, { label: 'London duplicate', value: 'Europe/London' }])]);
  assert.equal((await api.getTimezones()).length, 1);
  const invalid = client([success([{ label: 'Missing identifier' }])]);
  await assert.rejects(invalid.getTimezones(), (error) => error.code === 'invalid_response');
});

test('shared snapshots compare equal while retaining the latest dedicated response', async () => {
  const latest = { ...snapshot(), asOfUtc: '2026-10-23T20:01:00Z' };
  const api = client([success({ emailAddress: 'test@example.test', entitlements: snapshot() }), success(latest)]);
  assert.equal(await api.compareEntitlementSnapshots(), true);
  assert.equal(api.session.getSnapshot().entitlements.asOfUtc, latest.asOfUtc);
  assert.deepEqual(api.calls.map(({ options }) => options.method), ['GET', 'GET']);
});

test('snapshot comparison reports actual disagreement instead of masking benefit changes', async () => {
  const api = client([success({ emailAddress: 'test@example.test', entitlements: snapshot() }), success(snapshot(false))]);
  assert.equal(await api.compareEntitlementSnapshots(), false);
  assert.equal(api.session.getSnapshot().entitlements.paid, false);
});

test('anonymous 401 clears all entitlement and identity state', async () => {
  const api = client([failure(401, 'authentication_required')]);
  api.session.acceptAccount(api.session.beginRead(), 'test@example.test', snapshot());
  await assert.rejects(api.mobileApiRequest('membership/entitlements'), (e) => e.status === 401);
  assert.equal(api.session.getSnapshot().entitlements, null);
  assert.equal(api.session.getSnapshot().identity, null);
});

test('logout clears local access immediately and sends one CSRF-protected logout', async () => {
  let finish;
  const api = client([() => new Promise((resolve) => { finish = resolve; }), success({ authenticated: false })]);
  api.session.acceptAccount(api.session.beginRead(), 'test@example.test', snapshot());
  const logout = api.signOut();
  assert.equal(api.session.getSnapshot().entitlements, null);
  finish(success({ requestToken: 'logout-token' }));
  await logout;
  assert.equal(api.session.getSnapshot().status, 'signed-out');
  assert.equal(api.calls[1].options.headers['X-CSRF-Token'], 'logout-token');
  assert.equal(api.calls[1].options.method, 'POST');
  assert.ok(api.calls[1].url.endsWith('/account/logout'));
});

test('a late paid-account response cannot restore access after switching accounts', async () => {
  let finish;
  const api = client([() => new Promise((resolve) => { finish = resolve; })]);
  const read = api.getOwnAccount();
  api.session.change('changing');
  api.session.acceptAccount(api.session.beginRead(), 'free@example.test', snapshot(false), true);
  finish(success({ emailAddress: 'paid@example.test', entitlements: snapshot() }));
  await assert.rejects(read, (e) => e.code === 'session_changed');
  assert.equal(api.session.getSnapshot().entitlements.paid, false);
  assert.equal(api.session.getSnapshot().identity, 'free@example.test');
});

test('an old-account 401 cannot sign out the newly signed-in account', async () => {
  let finish;
  const api = client([() => new Promise((resolve) => { finish = resolve; })]);
  const read = api.getOwnAccount();
  api.session.change('changing');
  api.session.acceptAccount(api.session.beginRead(), 'next@example.test', snapshot(false), true);
  finish(failure(401, 'authentication_required'));
  await assert.rejects(read, (e) => e.code === 'session_changed');
  assert.equal(api.session.getSnapshot().status, 'signed-in');
  assert.equal(api.session.getSnapshot().identity, 'next@example.test');
});

test('failed logout never restores local paid access or retries the POST', async () => {
  const api = client([success({ requestToken: 'logout-token' }), new Error('Connection lost')]);
  api.session.acceptAccount(api.session.beginRead(), 'test@example.test', snapshot());
  await assert.rejects(api.signOut(), (e) => e.code === 'network_error');
  assert.equal(api.session.getSnapshot().status, 'signed-out');
  assert.equal(api.session.getSnapshot().entitlements, null);
  assert.equal(api.calls.length, 2);
});

test('a snapshot read during logout cannot repopulate the cleared account', async () => {
  const api = client([success({ emailAddress: 'test@example.test', entitlements: snapshot() })]);
  api.session.change('changing');
  await assert.rejects(api.getOwnAccount(), (e) => e.code === 'session_changed');
  assert.equal(api.session.getSnapshot().entitlements, null);
});

test('a missing additive snapshot fails closed instead of using legacy paid flags', async () => {
  const api = client([success({ emailAddress: 'test@example.test', membership: { paid: true } })]);
  await assert.rejects(api.getOwnAccount(), (e) => e.code === 'invalid_response');
  assert.equal(api.session.getSnapshot().entitlements, null);
});

test('network failure clears an unconfirmed snapshot without replaying a request', async () => {
  const api = client([success({ emailAddress: 'test@example.test', entitlements: snapshot() }), new Error('Offline')]);
  await assert.rejects(api.refreshEntitlements(), (e) => e.code === 'network_error');
  assert.equal(api.session.getSnapshot().entitlements, null);
  assert.equal(api.calls.length, 2);
});

test('the client aborts at exactly 15 seconds, clears its timer and does not retry', async () => {
  let expire;
  let cleared = false;
  let calls = 0;
  const api = library({
    setTimeout: (callback, delay) => { assert.equal(delay, 15000); expire = callback; return 123; },
    clearTimeout: (id) => { assert.equal(id, 123); cleared = true; },
    fetch: async (_url, options) => { calls++; return new Promise((_resolve, reject) => {
      options.signal.addEventListener('abort', () => reject(new Error('Aborted')));
    }); },
  })('mobile-api');
  const pending = api.mobileApiRequest('membership/entitlements');
  expire();
  await assert.rejects(pending, (e) => e.code === 'request_timeout');
  assert.equal(cleared, true);
  assert.equal(calls, 1);
});

test('deadline releases callers even if native fetch ignores abort, with endpoint diagnostics', async () => {
  let expire;
  const load = library({
    setTimeout: (callback, delay) => { assert.equal(delay, 15000); expire = callback; return 1; },
    clearTimeout: () => {}, fetch: () => new Promise(() => {}),
  });
  const pending = load('mobile-api').mobileApiRequest('metadata/options');
  expire();
  await assert.rejects(pending, (e) => e.code === 'request_timeout' && e.endpoint === 'metadata/options');
  const rows = load('request-diagnostics').requestDiagnostics.getSnapshot();
  assert.equal(rows.length, 1);
  assert.equal(rows[0].outcome, 'request_timeout');
  assert.equal(rows[0].phase, 'headers');
  assert.equal(rows.filter((row) => row.outcome === 'pending').length, 0);
});

test('a stalled response body is also bounded by the 15-second deadline', async () => {
  let expire;
  let bodyStarted;
  const started = new Promise((resolve) => { bodyStarted = resolve; });
  const load = library({
    setTimeout: (callback) => { expire = callback; return 1; }, clearTimeout: () => {},
    fetch: async () => ({ status: 200, ok: true, json: () => { bodyStarted(); return new Promise(() => {}); } }),
  });
  const pending = load('mobile-api').mobileApiRequest('metadata/timezones');
  await started;
  expire();
  await assert.rejects(pending, (e) => e.code === 'request_timeout' && e.status === 200);
  const row = load('request-diagnostics').requestDiagnostics.getSnapshot()[0];
  assert.equal(row.phase, 'body');
  assert.equal(row.outcome, 'request_timeout');
});

test('session changes abort obsolete fetches and release their callers promptly', async () => {
  let signal;
  const load = library({ fetch: (_url, options) => { signal = options.signal; return new Promise(() => {}); } });
  const pending = load('mobile-api').mobileApiRequest('account/me');
  load('session').session.change('changing');
  await assert.rejects(pending, (e) => e.code === 'session_changed' && e.endpoint === 'account/me');
  assert.equal(signal.aborted, true);
  assert.equal(load('request-diagnostics').requestDiagnostics.getSnapshot()[0].outcome, 'session_changed');
});

test('late responses after a timeout cannot expire a valid session or change finished diagnostics', async () => {
  let finish;
  let expire;
  const load = library({ setTimeout: (callback) => { expire = callback; return 1; }, clearTimeout: () => {},
    fetch: () => new Promise((resolve) => { finish = resolve; }),
  });
  const session = load('session').session;
  session.acceptAccount(session.beginRead(), 'test@example.test', snapshot());
  const pending = load('mobile-api').mobileApiRequest('metadata/options');
  expire();
  await assert.rejects(pending, (e) => e.code === 'request_timeout');
  finish({ status: 401, ok: false, json: async () => failure(401, 'authentication_required').body });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(session.getSnapshot().status, 'signed-in');
  assert.equal(load('request-diagnostics').requestDiagnostics.getSnapshot()[0].outcome, 'request_timeout');
});
