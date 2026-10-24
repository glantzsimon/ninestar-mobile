# Shared NineStar subscriptions

## Agreed product direction

One existing NineStar account works across website and mobile. Eligible website
membership grants corresponding app access, and a server-verified Apple subscription
grants corresponding website/API benefits. Payment-provider records remain separate.
This replaces the earlier app-only account/subscription proposal; do not implement
separate identities or prevent app users from signing into the website.

The authoritative backend contract is:
`D:/Workspace/ninestar/docs/mobile-api.md`, section
`Shared website/app membership and Apple subscriptions: proposed contract`.

Remote reference:
https://github.com/glantzsimon/ninestar/blob/feature/mobile-json-api/docs/mobile-api.md#shared-websiteapp-membership-and-apple-subscriptions-proposed-contract

Reviewed against backend Revision 2, commit `d8249baa`, and compatibility assessment
commit `9225273f` on `feature/mobile-json-api`. Existing website shared-entitlement
support in `fe6c781e` has since passed Windows build/tests and been deployed to
Integration by the owner. The app now reads that snapshot; see
[shared-entitlements.md](shared-entitlements.md) for behaviour and validation limits.
Apple endpoints, verifier and billing schema remain a later phase.
Read the current backend file before billing work; this app note is not a second
independently maintained contract.

Mobile review findings are in [apple-contract-review.md](apple-contract-review.md).
Revision 2 resolves all five prior contract findings and is ready for owner
agreement from the mobile side. Keep the client timeout at 15 seconds. Implement
shared entitlements for existing website memberships first; Apple billing follows
later after its verifier, product, native-build and backend readiness gates.
Contract agreement is not a claim that purchasing has been implemented or tested.
The standalone Windows VS2017/Framework primitive probe now passes all 15 checks;
see [Windows validation](apple-verifier-windows-validation.md). Full Apple policy,
IIS, real provider and membership integration remain separate gates.

## Mobile integration agreement

All paths are relative to `/api/mobile/v1`, with the existing JSON envelope,
HTTPS, authenticated cookies and CSRF on every POST.

| Endpoint | Mobile responsibility |
| --- | --- |
| GET `membership/entitlements` | Read shared server-derived access, not a locally calculated paid flag. |
| POST `subscriptions/apple/context` | Obtain the stable server-issued appAccountToken, environment, recognised/saleable product mappings, purchase permission and management flags before a new purchase. |
| POST `subscriptions/apple/verify` | Submit `{ transactionId }` after a verified StoreKit purchase or restore; keep IDs as strings and check the echoed ID before finishing. |
| POST `subscriptions/apple/refresh` | Reconcile linked chains with the documented retry cap; respect partial-success counts, retryAfterSeconds and returned persisted entitlements. |

`GET account/me` adds `entitlements` without changing the existing membership
fields. Current own-chart calls continue to rely on server enforcement. Do not
infer entitlements from email, an Apple receipt's decoded contents, local expiry
calculations, or a posted active/isPaid flag. Paid access does not confer admin roles.

Use StoreKit-localised prices and periods for the App Store purchase UI. The
context response supplies allowed product mappings, not price quotes. A blocked
new purchase should offer existing access or provider management. Do not block
verification/restoration of a rightful already-paid transaction merely because
another eligible membership exists.

Finish a StoreKit transaction only after verify reports committed processing
success. A processed expired/revoked transaction may finish without unlocking.
Pending, cancelled or unverified purchases never unlock access. On transport/provider
failure retain the transaction for controlled same-ID retry; never create a new
purchase as a retry. Handle account mismatch, support-recovery, rate-limit and
verification-unavailable errors using the backend's documented codes.

After verification/restoration, refresh the shared account/entitlement snapshot.
A server membership-required response still overrides previously displayed access.
The same account and settings are used on both platforms; do not migrate existing
users to a new app-only identity scheme.

## Proposed product policies awaiting owner agreement

The backend draft recommends monthly/annual Apple products mapping to the existing
MonthlyPlatinum/AnnualPlatinum benefits, one subscription group, no initial Apple
lifetime product, and Family Sharing disabled initially. Block known duplicate
purchase starts on both platforms; preserve independently valid purchases if an
overlap still occurs. Cancellation keeps the remaining paid interval. Honour only
Apple-verified grace periods; retry without a valid paid/grace interval does not
unlock access. These recommendations are not approval to configure products or
change existing billing.

Exact product IDs, bundle ID, numeric Apple app ID and subscription-group ID remain
to be confirmed. Production and Integration/Sandbox evidence and users must remain
isolated as specified by the backend contract. Do not invent identifiers.

## Backend ownership and technical gates

The website chat owns backend implementation. Its contract identifies that
`CreateMembership`/`AssignMembershipToUser` terminate other memberships. Apple
fulfilment needs its own atomic provider-managed grant path; it must not call
those methods or terminate independent website purchases. Preserve existing
benefits, counters, lifetime rights, ownership and age gates.

The proposed Apple binding/subscription/transaction/notification records and grant
fields belong to the existing DataAccess/LocalDb migration history. The backend
must establish a .NET Framework 4.7.2/C# 7.3/VS2017-compatible signed-data verifier
before implementing storage/fulfilment. No app change substitutes for that gate.
No separate verification host, database or scheduler is implicitly authorised.

## Work synchronisation

- Backend chat updates the authoritative API contract and commits to the website branch.
- Local mobile work pulls/reads the contract, records the reviewed revision here,
  and implements against endpoints only once they exist on the test server.
- Bring proposed request/response changes back to the backend owner instead of
  maintaining contradictory local schemas or editing billing in both chats.
- Product-policy acceptance, verifier results and Integration deployment status
  must be handed back explicitly. The chats do not share live conversation state.
- Keep My Account/chart device testing moving independently of purchase integration.

The current app has no Apple purchase SDK, purchase UI or calls to these proposed
endpoints. No live purchase, account mutation, database migration or deployment
was performed while reviewing this contract.
