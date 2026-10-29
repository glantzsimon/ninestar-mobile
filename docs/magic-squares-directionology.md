# Magic squares and Directionology: website review and mobile plan

Superseding owner refinement (2026-10-29): display-mode selection is removed.
Cards/details keep ordinary artwork; squares are Directionology-only, summary
first. Shared SVG number alignment is central. Bottom own-Predictions shortcuts
group Directionology/Calendar. See directionology-validation.md for current
behaviour and calendar-zoom-review.md for the researched future hierarchy.
Earlier Graphical/MagicSquare feature plans below are retained as history.

Current status (2026-10-29): the revised feature/ui-artwork-refresh contract
resolves the initial display-label and hourly-summary gaps. The app now uses
data.labels.controls/displayOptions and renders travelSummary only when periods
contains exactly year/month/day. Temporary local labels were removed. See
directionology-validation.md for current implementation, deployment gate and
validation results. The 2026-10-28 review/partial-implementation history below is
superseded where it describes missing labels or an hourly-inclusive summary.

2026-10-28. Initial source review followed by partial native implementation against
the shared contract's Travel summary and magic-square rendering section. No
backend edits, schema changes or deployment. Initial proposals below are retained
as review history; current status and remaining blockers follow here.

## Initial implementation and contract review (2026-10-28)

Read the new shared contract and Helpers/MobileTravelMapper.cs. Full Predictions
now documents authoritative ordered cells, highlights, plate artwork, explicit
south-up endpoints, four arrows with resolved text, dual/split handling and an
aggregated travelSummary. Default projections deny details unless explicitly
authorised; free responses are unchanged. These resolve the square/arrow payload
gaps in the initial review. Mobile parses only full-response squares; null,
missing or malformed data leaves existing graphical readings usable.

Implemented shared Predictions presentation (own and calculated results):

- Advanced Options disclosure with a two-option display selector. The owner's
  approved headings and exact existing website resource wording (Display,
  Graphical Display, Magic Square) are centralised in ui-copy. Metadata still
  lacks their API labels/options; no speculative response field names were wired.
- Graphical remains default. A session-only display store shares the choice
  across both hosts, resets on session generation changes, and never saves
  calculation/account settings, protected responses or credentials. App restart
  resets it. Changing the choice performs no request or calculation.
- In Magic Square mode, available cycle cards replace only their image with a
  compact square, preserving influence sizing, existing captions and navigation.
  Opening a cycle shows its full square. The reusable EnergyCard artwork slot
  leaves chart/other graphical hosts unchanged when no slot is supplied.
- A Directionology button opens the shared modal with available personal year,
  month and day squares only, regardless of main card display mode. No hour grid.
  The button appears only with corresponding full-response square data.
- MagicSquare draws server coordinates as supplied, without compass-key rotation
  or recalculating numbers. Number colours/highlight flags come from the response.
  Centre draws a ring; overlapping arrows remain separate. Supplied plate artwork
  uses the shared resolver/cache. Dual highlights stay on one grid; split days
  show the independently supplied secondary grid and its separate arrow texts.
  API arrow titles, direction labels and rich explanations use disclosures for
  touch/accessible reading rather than desktop-only hover tooltips.

### Original blocker: summary included Hour (resolved in revised contract)

The new contract explicitly says travelSummary uses year/month/day/hour weights
5/3/2/1. MobileTravelMapper.Summary still calls the website's four-period
GetDrectionsChartViewModel. This conflicts with the owner's explicit decision
that BOTH grids AND summary must use year/month/day only. The app therefore
does not parse/display that summary as mobile three-period guidance. Do not
subtract hourly scores or regenerate severity/guidance on the device.

Backend handover: expose/document a year/month/day-only mobile summary, retaining
server grouping, centre penalties, colours, warnings, resolved labels/guidance
and display endpoints. Preserve existing website four-period behavior. Explicit
included-period metadata is recommended so clients can verify summary scope;
its field name remains a proposed addition, not implemented client contract.
Also expose/document display option values/labels, Advanced Options and the
Directionology button label. Owner was notified through an asynchronous question.
Chart magic-square data is not part of this Predictions-only extension, so own
Personal Chart rendering remains unchanged pending a separate documented payload.

### Current validation

- Public Integration metadata/options: 200, no energyDisplays field.
- Anonymous Integration predictions/me: 401 authentication_required.
- No authenticated full response inspected; no credentials requested. Deployment
  and unlimited/admin field availability need the owner's existing iPhone login.
- All 206 automated tests passed. Eight new tests cover cell/colour/active-house
  preservation, direct south-up endpoints, dual versus split, overlapping/Centre
  arrows, malformed grids/endpoints, old/restricted/free responses, withholding
  the hourly summary and independent presentation-state reset.
- At the initial square-renderer stage, lint, typecheck and offline iOS export
  passed (1862 modules). The newer controls/summary checks are documented in
  directionology-validation.md.

Next: backend corrects summary scope and documents display labels. Meanwhile,
first iPhone check is My Chart → Your Predictions: does Advanced Options appear?
If absent, inspect whether the deployed full response contains eligible squares;
do not relax server access or manufacture them from existing cycle numbers.

## Website implementation reviewed

Paths below are under ninestar/webapp/WebApplication:

- Enums/EEnergyDisplay.cs: exactly Graphical = 0 and MagicSquare = 1, with
  Dictionary.Graphical / Dictionary.MagicSquare enum display resources.
- Models/NineStarKi/NineStarKiModel.cs: EnergyDisplay is labelled with
  Dictionary.EnergyDisplayLabel; ShowDirections with Dictionary.ShowDirectionsLabel.
  Both initialise from SessionHelper. GetCycleMagicSquares creates year/month/day
  grids, optional dual solar/lunar highlighting, and optional split-day grids.
- Views/Shared/EditorTemplates/EnergyDisplay.cshtml: enum dropdown.
- Views/Predictions/_PersonalCycles.cshtml: independent energy-display selector
  and ShowDirections checkbox; display changes do not define birth calculations.
  Controls are gated by unlimited membership, complementary result or admin.
- Helpers/SessionHelpers.cs and Scripts/k9/ninestarki.js: session-backed display
  selection and directions visibility. Default energy display is enum zero.
- Views/NineStarKi/_MagicSquareDisplay.cshtml: period/house headings, one grid,
  optional second split grid, or dual-view house captions/highlights.
- Views/NineStarKi/_MagicSquare.cshtml: nine cells populated from global Ki, with
  personal-house highlights and optional lunar highlights. Row-major rendering
  indexes are [3,8,1; 2,centre,6; 7,0,5] of GetMagicSquareNumbers(). Do not treat
  that existing array as row-major or substitute the person's own energy as the
  global centre. Personal charts/global-only views use different highlight rules.
- Content/less/sections/ninestar.less: gold grid plate, active/active-lunar styles,
  number colours and four arrow types. Traditional south-up orientation matters:
  CSS North points down, South up, East left and West right. Centre is an enclosing
  circle, not a guessed compass arrow. Do not rotate to conventional north-up.
- ViewModels/MagicSquareViewModel.cs and Models/NineStarKi/NineStarKiDirections.cs:
  server derives Five Yellow Killing, Dark Sword Killing, Self Life Killing and
  Target Killing; resolved explanations handle Centre specially.
- Models/NineStarKi/NineStarKiDirection.cs: period score weights year 5, month 3,
  day 2, hour 1. Scoring is server logic, not mobile arithmetic.
- Models/NineStarKi/NineStarKiModel.GetDrectionsChartViewModel: aggregates year,
  month, day AND hour. ViewModels/NineStarKiDrectionsChartViewModel groups scores,
  handles centre effects, sorts worst first and supplies guidance/severity.
- Views/Predictions/_DirectionsChart.cshtml: Dictionary.WorstDirectionsToTravelIn,
  direction names, status-circle arrows and guidance. Mobile website already
  stacks direction headings over their status/guidance. Same access gate as above.

Registry includes ninestar.magic-square-plate (512x512). Resolve via catalogue,
preserving its dimensions/aspect and the shared domain-artwork cache path.

## Requested native flow

Use a two-option dropdown, not a boolean toggle: Graphical / Magic Square,
with labels and option values from API metadata. Place it in a collapsed
Advanced Options container. It is presentation state and must not be added to
CalculationDraft, POST bodies, My Account birth/preferences drafts or server
calculation mode. Changing it must not calculate again or fetch a new reading.
Graphical remains the existing initial presentation. Proposed persistence is an
allowlisted local display preference, scoped by API environment/account and
cleared from visible state on logout/switch; exact ownership can be finalised
when the display contract is available. Do not persist protected reading data.

Reuse a shared display-options control and MagicSquare renderer in own and
calculator chart/prediction results. Renaming an existing options container to
Advanced Options should use the new API resource if exposed, otherwise the
owner-approved functional wording in central ui-copy; do not change titles
prematurely while the new setting has no data to render.

Add a Dictionary-backed Directionology button on the shared Predictions result
component, so own and calculated predictions match. Its detail modal shows
year, month, day squares with arrows and the server-authored direction summary.
No hourly square. This dedicated view can show its directional squares regardless
of the main card display mode, avoiding an empty Directionology screen in
Graphical mode. Use shared panels, scrolling and accessible text explanations
for arrow meanings instead of desktop hover-only tooltips. Preserve any server
restrictions; no new access inferred from option/label presence.

Owner confirmed: both the squares AND the direction summary use year/month/day
only. Hour must not contribute to summary scores, severity or guidance. This is
an intentional difference from the website's current four-period aggregation.
The backend must return the three-period summary; mobile must not subtract
hourly scores locally or reuse a four-period summary under this display.

## Current API gaps and handover to backend owner

Current local shared contract has no documented native magic-square/Directionology
payload. MobileCalculationMapper.Predictions exposes yearlyDirections and
monthlyDirections only, without square cells or aggregated summary.
Its Directions mapper returns e.Description, which may contain unresolved
resource placeholders, rather than the corresponding resolved per-direction
explanations. Planner items have magicSquareNumbers, but that does not establish
the Predictions layout/occupancy/arrows contract and is not a replacement endpoint.
Metadata/options omits EEnergyDisplay entirely.

Please expose/document additively (field names to be chosen by backend owner):

1. Dictionary-backed energy-display field label, both enum option values/labels,
   Advanced Options heading, Directionology navigation/panel title, period/house
   captions, arrow titles/explanations and summary labels. Optional artwork ID
   for Directionology should come from the catalogue rather than a guessed path.
2. Explicit server-selected square data for each available year/month/day,
   including ordered nine cells (or a documented orientation/index mapping),
   global centre, personal/lunar active cells, dual/split flags, optional second
   grid and captions. Reuse authoritative GetCycleMagicSquares logic.
3. Each available grid's four direction arrows with identity, direction/display
   orientation and resolved resource-authored text, including Centre behavior.
   Avoid returning raw CSS/HTML as the only arrow geometry definition.
4. The website summary's already-grouped ordered directions, scores/severity,
   display directions and resolved guidance. Include year/month/day only, as
   confirmed by the owner; exclude hourly contributions. Do not have mobile
   rebuild scoring or modify the website's existing summary implicitly.
5. Full/free access and missing-data rules, ensuring denied/free projections do
   not gain protected squares/guidance because labels are public. Cover arbitrary
   calculated predictions as well as own predictions, and chart responses if the
   display option is intended to apply to charts too. Keep existing fields intact.

## Initial source-review validation (superseded by current validation report)

Source inspection confirms the two enum values, rendering/arrow branches, access
checks and four-period summary. No authenticated request was made, no credentials
requested and no live availability claimed for this not-yet-announced API upgrade.
No app runtime code, preferences or rendering were changed by the initial review.
Project lint, typecheck and tracked-file whitespace checks passed. No tests or
bundle export repeated for the documentation-only work; feature/device behavior
had not yet been implemented or tested at that stage.

The owner subsequently supplied revised fields; implementation and current next
steps are now in directionology-validation.md. Preserve the existing 15-second
timeout, auth, entitlements, unsaved drafts and image fallbacks.
