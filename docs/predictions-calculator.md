# Shared Predictions Calculator — 2026-10-27

Explore's Predictions feature now opens /explore/predictions rather than Coming
soon. Both personal-chart and prediction routes are thin CalculatorScreen hosts.
Shared CalculationForm, API/session loading, memory, Back/Edit controls and Edit
scrolling are implemented once. Personal Chart result presentation remains
PersonalChart; prediction results render Predictions exactly as own readings do.
This includes Primary / Additional / Global / Extended Global groups, artwork
hierarchy, supplied house/descriptive captions, help and the same detail modals.
Arbitrary-person results keep neutral titles and omit names, matching the prior
shared-result convention. Predictions Calculator is central mobile page copy;
a dedicated Dictionary-backed calculator-page title remains a label-contract gap.

## Existing contract used

- POST predictions/calculate, using MobileCalculationRequest and full Predictions
  output. The controller applies the existing paid check and stores its last
  request; it does not update account preferences or spend complementary credits.
- Shared transport obtains fresh account/csrf, checks session generation, then
  POSTs once. The 15-second deadline is unchanged. No fallback to paid-credit
  routes, own-user readings for results, or automatic POST retry on failure.
- Initial generic introduction comes from GET readings/predictions/me/free,
  selecting only data.help.overview. Never display that own reading's profile/
  personalised prose as calculator content. Help failure omits the optional box
  without blocking or overwriting form edits. Result help comes from the submitted
  calculation response, using the existing supplied HTML renderer.
- Full result parser uses API period/card/group/scope/detail labels and returned
  artwork IDs through the existing catalogue/cache/fallback system.

Backend source/contract checked: MobilePredictionsController.Calculate,
MobileCalculationMapper.Predictions, MobileCalculationRequest.GetSelectedDate,
MobileMetadataController and shared docs/mobile-api.md. No new backend fields,
endpoint or schema changes are required for this implementation.

## Inputs and state

Predictions uses its own predictions memory key; Personal Chart retains its
personal-chart key, scoped by API environment and account. First-use name/birth
defaults remain blank name, today minus 22 calendar years, 00:00 birth time and
metadata-random gender. Own profile birth details are not copied into the form.
Saved account preferences supply calculation method, zones and hemisphere flags;
calculator edits remain separate from unsaved My Account fields.

Predictions adds current timezone, house display, cycle inversion and selected
date/time to collapsed Advanced Calculation Preferences. Both selected-date
fields empty sends null; the backend uses current time in UserTimeZoneId. Filling
either requires a valid pair, sent as an unspecified local timestamp without Z
or device-timezone conversion. Existing selected local values are remembered;
clearing both returns to current time. This supersedes the previously unused
future-host rule requiring a selected date for every prediction submission.
No client cycles, solar dates or astrology calculations are introduced.

Mobile always sends Advanced, so explicit preferences apply. Existing known-time
and method/gender field visibility remain. Inputs stay editable after failures;
loading and submit guards prevent duplicates. Generation changes remount the
calculator and stale work cannot display another account's result.

The website's separate DisplayDataForPeriod enum labels are not currently in
mobile metadata; no invented domain selector was added. Blank/custom local inputs
use the already documented nullable selectedDateTime behavior. An exact separate
mode-selector UI would require Dictionary-backed labels to be agreed first.

## Validation and next step

All 153 tests passed, including 70 focused calculator/transport/memory/Predictions
checks. Lint, typecheck and targeted whitespace checks passed. Offline iOS Metro
export passed (1,670 modules, 46 assets, 2.6 MB JavaScript bundle) in ignored
.expo/predictions-calculator-validation. This verifies bundling, not a signed
build/deployment or a live API calculation. Tests added for generic pre-result help isolation,
exact Predictions endpoint/body/CSRF, failure without retry/credits, session switch
before POST, server-current default and complete custom local date pairs. Existing
tests cover memory isolation and shared full/free result access/formatting.
No authenticated Integration calculation was submitted by tools; the owner signs
in on iPhone. No membership changes, purchasing, migrations or deployment.

First device check: Explore → Predictions should open Predictions Calculator with
the initial generic introduction when available, blank/default birth inputs and
collapsed Advanced preferences. Then calculate, verify shared result format and
use Edit Calculation to check retained inputs and flush-top return. Native
appearance and a successful live calculation remain pending.
