export type EntitlementSource = {
  provider: 'website' | 'apple'; subscriptionType: string; state: string;
  endsOn: string | null; expiresAtUtc: string | null; autoRenewEnabled: boolean | null;
  productId: string | null; nextProductId: string | null; nextSubscriptionType: string | null;
  changeEffectiveAtUtc: string | null; verifiedAtUtc: string | null;
};
export type Entitlements = {
  asOfUtc: string; paid: boolean; unlimited: boolean; websiteAccess: boolean;
  mobileAccess: boolean; sources: EntitlementSource[];
};
const object = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const utc = (value: unknown): value is string => typeof value === 'string' &&
  /^\d{4}-\d{2}-\d{2}T.*Z$/.test(value) && Number.isFinite(Date.parse(value));

// Validate the transport; benefit decisions remain the server's booleans.
export function parseEntitlements(value: unknown): Entitlements {
  if (!object(value) || !utc(value.asOfUtc) ||
    ['paid', 'unlimited', 'websiteAccess', 'mobileAccess'].some((key) => typeof value[key] !== 'boolean') ||
    !Array.isArray(value.sources)) throw new Error('Invalid entitlement snapshot');
  const sources = value.sources.map((source) => {
    if (!object(source) || !['website', 'apple'].includes(String(source.provider)) ||
      typeof source.subscriptionType !== 'string' || !source.subscriptionType ||
      !['active', 'grace', 'billing_retry', 'expired', 'revoked'].includes(String(source.state)) ||
      !(source.endsOn === null || (typeof source.endsOn === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(source.endsOn))) ||
      ['expiresAtUtc', 'changeEffectiveAtUtc', 'verifiedAtUtc'].some((key) => source[key] !== null && !utc(source[key])) ||
      ['productId', 'nextProductId', 'nextSubscriptionType'].some((key) => source[key] !== null && typeof source[key] !== 'string') ||
      !(source.autoRenewEnabled === null || typeof source.autoRenewEnabled === 'boolean')) {
      throw new Error('Invalid entitlement source');
    }
    return { ...source } as EntitlementSource;
  });
  return { asOfUtc: value.asOfUtc, paid: value.paid as boolean, unlimited: value.unlimited as boolean,
    websiteAccess: value.websiteAccess as boolean, mobileAccess: value.mobileAccess as boolean, sources };
}

export function entitlementSnapshotsAgree(left: Entitlements, right: Entitlements): boolean {
  // Compare every protocol field except the request-specific snapshot timestamp.
  const normalise = (snapshot: Entitlements) => ({ paid: snapshot.paid, unlimited: snapshot.unlimited,
    websiteAccess: snapshot.websiteAccess, mobileAccess: snapshot.mobileAccess,
    sources: snapshot.sources.map((source) => Object.fromEntries(Object.entries(source).sort(([a], [b]) => a.localeCompare(b)))) });
  return JSON.stringify(normalise(left)) === JSON.stringify(normalise(right));
}
