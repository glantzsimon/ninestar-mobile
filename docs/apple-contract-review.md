# Mobile review: Apple subscription contract, Revision 2

Reviewed 23 October 2026 against Contract Revision 2 introduced in backend commit
`d8249baa70544befc610427fb9475e8f619e512b`, then checked against
`9225273f0e7d7b6c3ebde949d9b8ffaa8c6373f0` on `feature/mobile-json-api`.
The later commit adds a compatibility-assessment reference without changing the
Revision 2 protocol. The local website checkout was already at each revision and
clean; no pull or backend edit was needed. Read the full shared-contract section, including every
`Revision 2` subsection, in `D:/Workspace/ninestar/docs/mobile-api.md`.

## Verdict

**All five findings from the review of efe0d438 are resolved. The contract is
ready for owner agreement from the mobile side. No remaining contract ambiguity
blocks the planned implementation.**

This is not approval to deploy, change schema, configure products or make purchases.
It does not assert that the proposed endpoints or Apple verifier already work.
Keep the current client HTTP timeout at **15 seconds**. Implementation order is
shared entitlements for existing website memberships first, Apple billing later.

The standalone probe was also built with the installed Windows VS2017 tools and
run directly on Windows .NET Framework: **0 build warnings/errors, build exit 0,
15 primitive checks passed, run exit 0**. See
[exact Windows results](apple-verifier-windows-validation.md). This passes the
Windows primitive compatibility check, not the complete Apple verifier gate.

## Resolution of the five findings

| Earlier finding | Revision 2 resolution | Result |
| --- | --- | --- |
| Missing-token 403 versus tokenless-recovery 409 | `deterministic account-link errors` supplies ordered rules. Another owner's chain, unsupported ownership and wrong/malformed tokens give 403. Verified supported unbound/tokenless evidence gives 409. A tokenless chain already owned by this account requires explicitly approved legacy recovery status. | Resolved |
| Incomplete state/response schemas | `response schemas and state definitions` and `operation response schemas` specify required fields, nullability, provider/subscription enums, five Apple states, time-bounded projections, asOfUtc/verifiedAtUtc, and complete free/website/lifetime/expired/overlap examples. Empty sources are explicitly supported. | Resolved |
| Unfinished purchases across restart/session/account changes | `unfinished purchase and account recovery` defines launch-time StoreKit recovery, account-token/environment binding, auth-session generations, discarded late responses, single CSRF retry, 401/403/409 handling, and matching-ID committed verification before transaction completion. | Resolved |
| Duplicate blocking versus plan changes and retired products | `plan changes and retired products` separates new-purchase permission from native Apple management, projects verified pending changes, preserves current benefits until the actual transition, and retains recognised retired mappings with availableForPurchase false. Context exposes management flags and recognised restore IDs. | Resolved |
| Timeout, retry delays and partial refresh | `deadlines, retries and partial refresh` preserves the 15-second client timeout, specifies a 12-second aggregate server budget, clipped 5-second outbound calls, rate limits/Retry-After, bounded backoff, three automatic retries per foreground cycle, per-chain commits and explicit partial-success fields. | Resolved |

## Detailed mobile interpretation

### Ownership and completion

Apply the ordered error table after authenticating and verifying supported evidence.
Do not confuse transient evidence-verification failure with tokenless recovery.
A matching token is an account association, not a standalone login credential.

Keep pending transaction references associated with the purchase-time account token
and server environment. StoreKit unfinished transactions are the recovery source;
local queue storage is supplementary. After logout/account switch, old-generation
responses must never update the new account's state. A server operation already
accepted for the old account may nevertheless commit for that original account.

Only same-account verify with `processed: true` and an exact echoed transaction ID
acknowledges durable processing and permits finishing that transaction. Apply the
returned entitlement snapshot for current access. Expired/revoked processing may
finish without unlocking. Context, GET and partial/complete refresh responses are
not transaction-completion acknowledgements. Never start a new purchase to retry
verification or silently finish an ownership failure.

### Snapshot parsing

All fields listed in Revision 2 are required, including explicit nulls. Parse
unknown input at the boundary; tolerate additive fields. The source state values
are active/grace/billing_retry/expired/revoked; website Free may be active while
all paid-access booleans remain false. Cancellation is represented by active
access with autoRenewEnabled false until its verified boundary.

Use top-level server access booleans and retain route-side authorisation. Do not
calculate paid access from sources, device time or local receipts. Handle a future
unrecognised provider/state as an unknown management display state, never as a
reason to enable a purchase or manufacture access; invalid/missing authoritative
fields require a fresh valid snapshot. This is a defensive client policy rather
than a request for another backend endpoint or enum expansion now.

asOfUtc is response evaluation time, not evidence freshness. verifiedAtUtc remains
separate. The server's projection handles expiry even before a notification/job
arrives. Provider state remains descriptive rather than a client authorisation rule.

### Timing and partial refresh

The existing `15000` ms timeout in `src/lib/mobile-api.ts` remains unchanged.
The 12-second server budget is an implementation target with margin, not a promise
that IIS/network delays can never cause a client timeout. Real timing tests remain
a rollout gate, not an unresolved wire-contract issue.

Future purchase transport must retain the integer-seconds Retry-After header.
For transient errors use the documented 2/4/8/16/30/60-second base schedule with
added jitter, honouring any longer valid Retry-After. At most three automatic
retries occur in one foreground recovery cycle. No retries while signed out/offline;
no automatic permanent-error retries except one same-session CSRF refresh/retry.

A refresh may commit some chains and return complete false, pending counts and
retryAfterSeconds. Show the returned currently verified snapshot and a pending
refresh status; keep successful independent grants. When nothing can commit and
work remains, 503 is not success; GET may still retrieve existing time-bounded
persisted access. Do not turn tab focus into a repeated Apple reconciliation loop.
A timed-out request has an unknown result; same-ID retry resolves durable state.

## Existing app compatibility and work still required

The new shared contract remains compatible with the app's cookie/CSRF transport,
additive account fields and server-enforced full/free chart routes. The current
account parser ignores extra fields safely, but does not yet consume entitlements.
Existing chart responses still govern which content is displayed.

These are implementation tasks, not remaining contract blockers:

- Add a validated, account-scoped entitlement snapshot separately from editable
  My Account drafts. Refresh without discarding unsaved profile edits.
- Introduce shared session-generation/clearing behaviour so old-account responses
  cannot populate current account UI. Provide explicit sign-out as the UI grows.
- When Apple work begins, add Retry-After handling and the bounded retry policy
  while retaining the 15-second timeout; ordinary account writes must not acquire
  a blanket automatic-retry policy.
- Evaluate an Expo SDK 58-compatible native StoreKit adapter and development build
  for token association, transaction updates, unfinished recovery, manual finish,
  restore and native management. Expo Go is sufficient for the current non-IAP slice,
  not proof that real purchases work.
- Configure explicit app identifiers/build/API/environment pairs and confirm product
  IDs. Add provider-management, restore and account-link recovery UX and device tests.
- The Windows primitive compatibility check now passes using VS2017 MSBuild
  15.9.30.58560 / Roslyn 2.10, targeting Framework 4.7.2/C# 7.3 and executing on
  installed Framework 4.8. Complete the remaining Apple signed-data policy, IIS
  package-loading and real provider/concurrency tests before Apple billing.
  Migration/deployment approval remains separate.

The proposed monthly/annual benefit mapping, single group, Family Sharing disabled
and product identifiers remain owner/product decisions to confirm during agreement.
They do not prevent proceeding with website-only entitlement implementation.

## Agreed implementation sequence

### First: shared entitlements for existing website memberships

Backend owner implements the proposed read-only `GET membership/entitlements` and
additive `account/me.entitlements` projection for existing website grants, preserving
legacy Free/paid/lifetime semantics and existing membership fields. Do not introduce
Apple bindings, subscription writes or placeholder Apple grants in this phase.

Once these reads are implemented on Integration, mobile consumes that schema in
account/session state, displays the current website membership and tests free,
paid, lifetime, expiry and account/session transitions. Preserve unsaved My Account
fields and keep server authorisation as the final authority. Do not synthesise
entitlements from legacy display dates or call proposed Apple endpoints early.
The existing My Account/birth-details/chart issue can be tested independently.

### Later: Apple billing

After product agreement, verifier feasibility and backend readiness, integrate
context, StoreKit, verify, refresh, restore/management and transaction recovery.
Use Revision 2 response shapes, manual completion and timing rules. Review database
migration and deployment plans under existing ownership/approval requirements.

## Evidence and limits

Compared Revision 2 with `src/lib/mobile-api.ts`, `src/lib/account.ts`,
`src/app/index.tsx`, `src/app/account.tsx`, `app.json`, `package.json` and the prior
five findings. Verified the literal client timeout is still 15000 ms. The schema
examples and transition rules are sufficient to write client models and fixtures
without inventing the previously missing behaviour.

This combines a source/contract review with the standalone Windows primitive
probe, not an executed billing integration test. Only app-side documentation and
local ignored probe build artifacts were written. No purchasing code, new
dependencies, timeout change, backend edit, schema execution or deployment.
No existing website or device account was read or updated as part of this review.
