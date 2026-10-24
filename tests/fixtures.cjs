exports.snapshot = (paid = true) => ({
  asOfUtc: '2026-10-23T20:00:00Z', paid, unlimited: paid, websiteAccess: paid, mobileAccess: paid,
  sources: [{ provider: 'website', subscriptionType: paid ? 'LifeTimePlatinum' : 'Free',
    state: 'active', endsOn: null, expiresAtUtc: null, autoRenewEnabled: null, productId: null,
    nextProductId: null, nextSubscriptionType: null, changeEffectiveAtUtc: null, verifiedAtUtc: null }],
});
