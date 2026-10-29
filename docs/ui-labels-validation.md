# Public UI label catalogue validation — 2026-10-29

## Result

Deployment gate passed on recheck after the owner deployed. Integration labels
returns 200, success true, version 1, culture en-GB, shared/navigation/screens,
and Cache-Control no-store, no-cache. Options now returns Now/0/Now and
SelectedDate/1/Selected Date and Time, matching the labels catalogue.

Shared catalogue and UI wiring implemented; final automated results below.
The earlier 404 evidence is retained as deployment history, not current status.

Read backend docs/mobile-ui-labels.md and the Central UI label catalogue section
of docs/mobile-api.md from the local backend checkout, corresponding to the
owner-reported feature/ui-artwork-refresh change 46951b37. No backend files were
modified and no branch was pulled or deployed.

## Earlier public checks, before deployment

Both requests used a 15-second deadline without signing in or modifying data.

| Request | Actual result |
| --- | --- |
| GET https://int.9starkiastrology.com/api/mobile/v1/metadata/labels | HTTP 404 Not Found; documented catalogue JSON cannot be validated |
| GET https://int.9starkiastrology.com/api/mobile/v1/metadata/options | HTTP 200; application/json; charset=utf-8; success true; culture en-GB; Cache-Control no-store, no-cache |

Options returned calculationMethods, calculatorTypes, houseDisplays, genders,
plannerViews, scopes, forecastTypes and consultationDurations, alongside culture.
displayDataForPeriods was absent. These checks do not establish which backend
commit is running. Do not assume a push means deployment.

No authenticated account request or I Ching cast was performed: membership
displayName and result heading remain unverified. Casting is an explicit user
action and must not be used as a metadata probe.

Before deployment, documentation-only changes passed lint, tsc --noEmit and
targeted git diff --check. The subsequent implementation results follow below.

## Contract reviewed

- Public labels use schema version 1, authoritative culture, shared/navigation/
  screens groups and an explicit Dictionary allowlist. All 173 audited uiCopy
  mappings are documented, plus calculator, chart facts/menu and Account labels.
- Preserve exact casing and separate page/navigation labels from About help and
  personalised reading titles. Never derive display strings from identifiers.
- The catalogue remains no-store; artwork's public caching policy does not apply.
  Approved bundled/bootstrap and last-known catalogues are allowed, isolated by
  environment/culture/version. Partial or failed responses must not overwrite a
  working same-culture catalogue. No automatic culture negotiation is promised.
- shared.calculator fields/help supply Current Time Zone and its approved helper;
  displayDataForPeriods supplies Now and SelectedDate. Now sends
  selectedDateTime:null; SelectedDate sends local wall-clock time interpreted in
  userTimeZoneId. Preserve hidden drafts and ignore selected-date validation for
  Now. No new request enum or calculation mode is needed.
- account/me membership.displayName is private, server-authored display text;
  labels do not grant access. I Ching heading is server-formatted per result.

These documented additions resolve the earlier missing-label source contract.
The later public check also passes the deployment gate. The existing scattered-
label inventory remains relevant; not every component literal was in uiCopy.

## Implemented after the successful live recheck

- ui-label-bootstrap.ts is the exact public Dictionary data snapshot verified
  on Integration, containing no account/profile data. It supplies approved
  startup/offline labels without waiting for a network request.
- ui-labels.ts validates the complete registered schema before publishing,
  isolates last-good data by environment/culture/version and rejects malformed,
  partial or unsupported-version responses. No disk persistence was added.
- One in-flight label refresh per session generation uses the existing cookie-
  aware transport and 15-second deadline. Startup, foreground and session changes
  refresh; failed/obsolete results leave approved labels intact. No automatic
  culture negotiation or new account writes are introduced.
- All 173 documented uiCopy entries are live getters into the catalogue.
  Existing consumers subscribe without remounting screens/forms. Module-level
  calculator and Explore title captures are now getters too.
- Shared calculator fields/groups/actions, Account fields/actions, chart menus,
  fact labels and full-text controls use Dictionary values exactly. Fact identity
  uses stable keys rather than comparing translated English captions.
- Predictions' shared form shows Display Data For and the timezone helper.
  AppField/AppSelect share the helper placement, also used for Account's current
  timezone; no local field-specific typography or helper wording is introduced.
  SelectedDate reveals native date/time controls with the shared fade animation.
  Now hides/ignores their validation and sends null, retaining hidden values.
  Input memory retains the mode while migrating existing drafts without loss.
- Account membership panel shows only account/me's displayName, never an enum
  or inferred paid-access message. It stays scoped to the existing account form;
  catalogue refreshes never reload/replace account drafts. Older missing names
  keep the normal panel absent. Background entitlements remain independent.
- I Ching uses catalogue main/transformed/interpretation headings and optional
  result.heading verbatim, falling back to the existing API name on older servers.
  No cast was made for validation. Private displayName and cast heading still
  require device verification; public labels cannot establish reading access.

Automated results: all 219 tests passed (0 failed), including complete/partial
catalogues, culture/environment isolation, all 173 projections, translated fact
identities, live navigation getters, date-target payload semantics and draft
memory, plus server-formatted hexagram headings. Lint and typecheck passed.
Offline iOS export passed: 1870 modules, 46 assets, 2.9 MB JavaScript bundle in
ignored .expo/ui-labels-validation. No app deployment or device execution was
performed. git diff --check passed.

## Remaining label gaps

The audited central inventory is migrated. Some pre-existing scattered text is
not exposed in the new catalogue and remains approved legacy/bootstrap copy:
AppSelect Choose/Search/no-matches text; missing-symbol/missing-reading messages;
Account marketing opt-in, birth-time guidance, loading/saved/uncertain-save and
operation-error messages, View My Chart; chart sign-in/load errors and certain
older reading messages. These need explicit allowlisted Dictionary resources
and documented paths. No new device-authored replacements were introduced.
Do not claim every string in the app is now API-backed. Server values still
include some sentence-case wording; preserve it and adjust Dictionary resources
on the backend if different casing is desired.

## Next concrete step

First iPhone check: Explore → Predictions Calculator → expand Advanced Calculation
Preferences. Confirm Current Time Zone helper and Display Data For, with Now
hiding date/time and Selected Date and Time revealing both. Then check retained
values when switching back and forth. Further device checks: pending Account
edits survive label refresh/foreground, membership name, a deliberate I Ching cast
heading, and offline bootstrap. Backend owner exposes remaining gaps separately.
No migrations, purchasing, deployment or backend code changes by this app work.
