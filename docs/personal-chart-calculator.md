# Shared calculator and Personal Chart

2026-10-27: Personal Chart and the new Predictions Calculator now share
CalculatorScreen for state/loading/submit/help/memory/Back/Edit flow, in addition
to CalculationForm. Routes remain thin; results reuse PersonalChart or Predictions
as the own-reading screens do. See predictions-calculator.md and
calculator-flow-refinement.md for current behavior and device checks.

Implemented 2026-10-25 against the existing shared contract in
`ninestar/docs/mobile-api.md`; no backend edits or proposed transport fields.

## Website audit

`webapp/WebApplication/Views/PersonalChart/_CalculatorForm.cshtml` and
`Views/Predictions/_CalculatorForm.cshtml` both render
`Views/NineStarKi/_CalculatorForm.cshtml`. Shared fields are birth date, known-time
choice, separate birth time/zone, gender and calculation preferences. Predictions
adds house display/current zone and selected local date/time controls. The website
also conditionally exposes advanced controls according to membership/calculator
type. Mobile currently groups all existing preferences in one disclosure; server
authorization remains authoritative. This is not a client entitlement grant.

`MobileCalculationRequest` carries person, selectedDateTime, userTimeZoneId,
calculationMethod, calculatorType, housesDisplay and both hemisphere flags.
`MobilePersonRequest` keeps birth date date-only and combines its separate time
exactly once on the backend. Dates and local selected timestamps must never be
converted through JavaScript UTC Date parsing. The API accepts validated Windows
and IANA timezone identifiers.

## App implementation

Calculator form heading is Personal Chart Calculator (central resource). The
previous introductory sentence has been removed at the owner's request. Result
heading remains the reusable Personal Chart.
Validation for this wording change: lint and typecheck passed. The running Windows
Router watcher again generated stale route declarations; refreshing ignored types
with the installed SDK generator restored the correct routes. No dependency or
generated-source changes. No additional tests added for this text-only edit.

- Explore now has a nested Router stack; Personal Chart opens its native
  `/explore/personal-chart` screen, keeping the four visible tabs unchanged.
- `CalculationForm` is controlled and reusable; `calculation.ts` owns its draft
  parsing and pure request validation. Optional selected-date inputs are prepared
  for Predictions, without implementing a prediction submission or result screen.
- First use starts with blank name, local today's date minus 22 calendar years,
  birth time 00:00 with unknown-time selected and a random API metadata gender.
  February 29 clamps to February 28. Never seed account personal birth details.
  Existing saved calculation preferences and current timezone still seed the
  options; initially use current timezone for birth timezone too. Missing saved
  calculation preferences remain unselected. Server-returned saved timezone
  aliases are retained in the selector.
- Match website Scripts/k9/calculatorMemory.js by remembering edited/submitted
  inputs locally. Shared calculator-memory.ts serializes writes and allowlists
  input strings only, scoped by API environment, signed-in account and calculator.
  Native uses existing SDK 58 FileSystem in app-private Documents; web adapter
  uses localStorage (the calculator itself remains native). Last used inputs survive
  route closure and app restart. Restoring does not calculate or fetch paid results.
  No credentials/tokens, results, entitlements or My Account drafts are persisted;
  no account updates occur. Visible drafts/results still unmount on session change.
  Signing out hides inputs; signing back into the same account can restore them.
  Other accounts/environments cannot load that entry. Corrupt/unavailable storage
  falls back to defaults and never blocks form/calculation; retention is unavailable
  if the device refuses writes. Actual device persistence still needs owner check.
- Full calculation explicitly obtains CSRF and posts once to
  `personal-chart/calculate`, using the existing session, cancellation and
  15-second per-request deadline. Loading guards prevent double submission;
  initial sibling requests all settle before retry becomes available. No automatic
  POST replay, complementary-reading debit or membership mutation.
- Results use the existing `parsePersonalChart(..., 'full')`, `PersonalChart`,
  ReadingGroups, energy cards, catalogue artwork, help, HTML formatting and one
  detail modal. API role labels and headings remain authoritative. Edit Calculation
  keeps entries and resets screen scroll; another calculation is explicit.
- Session generation changes unmount the calculator state/results, and existing
  transport protection rejects obsolete replies. Public media stays independent.

## Validation

Integration checks used synthetic inputs only, without login credentials:

- GET metadata/options: HTTP 200; expected gender/calculator/method/house enum
  values and Dictionary-backed labels were present.
- GET account/csrf followed by POST personal-chart/preview: HTTP 200 success;
  returned summary, overview and numeric core/character/socialExpression,
  generation/epoch/dayStar/hour, matching the documented number-only projection.
- Same CSRF/session, POST personal-chart/calculate anonymously: HTTP 401,
  authentication_required. No full content returned.
- Focused validation/client suite: 38 tests passed. Full suite: 114 passed,
  zero failures. `npm run lint` and `tsc --noEmit` passed without warnings/errors.
  Initial lint rejected loading from a normal effect; moved that work into the
  existing focus-loading pattern. Typecheck initially saw stale generated routes
  after moving Explore into a stack; regenerated ignored `.expo/types` using the
  installed SDK 58 generator, then typecheck passed. No generated types committed.
  Git whitespace check passed; existing Windows line-ending notices are unchanged.

Defaults/retention follow-up: 119 tests passed, zero failures. Tests cover local
calendar defaults and leap-day clamp, metadata-based random gender, no account
person prefill, serialized latest-write retention, restoration after a new store
instance, environment/account/calculator isolation, allowlisted data and storage
failure handling. First generated defaults are also retained immediately so a
reopen does not rerandomize or move the default date. Existing validation/client,
account/session, chart/HTML and artwork tests remain passing. Device persistence
and visual checks are pending; automated store tests use an injected disk adapter,
not an iPhone filesystem. Final lint and typecheck passed without warnings/errors;
targeted Git whitespace check passed.

## Limits and next step

Owner clarification implemented: use data.help.overview as the general
introduction, separate from data.overview and all personal readings. Before an
arbitrary-person calculation, getPersonalChartIntroduction reads the existing
GET personal-chart/me/free and extracts only its parsed help.overview. It does not
use its personal chart as calculator results or consume credits. Shared contract
and MobileHelpMapper.Chart confirm the Dictionary.personal_chart content is in
both full and own/free chart help. No new endpoint or modified API contract.

ContextualHelp appears between calculator title and form, with its API-provided
title, three-line faded preview, tap/read-more expansion, native HTML headings,
bold spans and theme colours. Hide it in result mode; Edit Calculation restores
the form/help and retained inputs. A successful calculation can refresh the
introduction from its own help.overview for the next edit. No substitution from
data.overview, summary or another help key. Optional help GET runs independently
of the form load, is guarded against overlap/stale account replies, and cannot
block or reset input editing. Missing/invalid help or errors omit it gracefully.
The own/free help GET requires valid saved own birth details; a future public
lightweight help route could remove that dependency but is not required to use
the current signed-in flow. Signed-in live payload/device checks remain with owner.

This supersedes the previous content/personal-chart proposal as an implementation
blocker. That proposed endpoint returned 404 in an earlier Integration check;
the 719,203-byte Knowledge Base response is also not fetched for this screen.

Introduction validation: all 122 automated tests passed, lint and typecheck passed,
and targeted whitespace check passed. New client tests verify only the own/free
GET is used, generic help stays separate from personalised overview, HTML heading
and bold spans survive, missing help returns null and errors never trigger paid
or credit-consuming POSTs. These use representative payloads; the owner's signed-in
iPhone still needs to confirm visible introduction, expansion, result-mode hiding
and Edit Calculation restoration. No signed-in live request is claimed here.

The first native calculator supports authenticated full calculations, subject to
the server's paid/admin check. No credentials are available to automated checks;
signed-in Integration POST and device presentation remain unverified until the
owner tests with their existing session. No second sign-in is added.

Anonymous/free arbitrary-person preview is not wired to the result UI: its numeric
response lacks the roleLabels/energy headings used by the shared chart presentation.
It must not be treated as the own/free chart or given guessed labels/readings.
Discuss any public-preview label/projection extension before changing the shared
contract. Complementary credit redemption is a separate explicit future flow.

Metadata supplies enum labels, but not calculator field/action headings. These
generic form labels/errors are central translatable uiCopy.calculator resources,
matching existing account controls. No new Nine Star category names are invented.
A future Dictionary-backed form-label transport should be discussed with the
backend owner; it is not silently assumed here.

Next device step: while signed in, open Explore > Personal Chart and confirm the
form has a blank name, today minus 22 years, 00:00 and a gender selection. Change
entries, leave/reopen, then restart to check retention. Calculate and compare with My
Chart, check an energy modal, edit/recalculate, and confirm unsaved My Account
edits survive. Guide these separately, one step at a time. Apple build activation,
native Predictions cycle labels and other Explore features remain outstanding.

No deployment, migrations, purchasing, website dependencies or membership edits.
