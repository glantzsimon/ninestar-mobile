# My Predictions and reusable result screens

Owner direction: use My Chart conventions throughout predictions/calculators.
Primary Cycles replaces Core Energies; Additional Cycles replaces Extended Profile;
no summary on predictions. Future calculator results must use the same result
components as personal screens. Generic headings should not contain “Your”.

Owner reconfirmed sequence on 2026-10-25: finish Personal Chart Calculator help,
then build My Predictions. Screen order is page title, expandable API-owned help,
Primary Cycles, Additional Cycles. Use the same help widget, ReadingGroups,
artwork cards and closable detail-modal conventions as My Chart. Additional
Cycles follows the existing expanded disclosure convention. No summary panel.
Recheck the latest shared contract/Integration for the label gap below before
implementation; this request schedules the work and does not claim it is built.

## Source review and implemented preparation

Read shared mobile-api.md, MobilePredictionsController, MobileReadingsController,
MobileCalculationMapper and website _CoreCycles/_AdditionalCycles/_CycleTitle.
Full own snapshot: GET predictions/me, paid/admin. Only membership_required 403
falls back to GET readings/predictions/me/free, which returns granted yearly
personal/lunar/global data. Both are read-only; never call credit-consuming
readings/predictions POST merely to open this tab. New getOwnPredictions client
implements those paths through existing cookie/session/deadline protections.

Full data: personal/lunar/global cycle collections; each entry has energy,
cycleDescriptiveName, season, seasonDescription and description. The embedded
profile has roleLabels for natal energies, which are not cycle-period labels.
Primary website cycles are year/month/day; additional are generation/epoch/hour.
Afternoon/inverted-day variants and solar/lunar/global selections must retain
their server values rather than being recalculated or silently conflated.

Extracted ReadingGroups from PersonalChart: shared primary panel, optional middle
slot and expanded additional disclosure, using existing components and spacing.
My Chart uses it immediately. Prediction/calculator hosts can pass the same
card/render slots and leave out the middle summary. My Chart's container labels
are now Core Energies and Summary in central uiCopy; API-owned reading/help text
is not edited or stripped of Your. Existing shared card/detail/help/artwork widgets
remain the base for the future predictions result component.

## Backend handover: proposed addition, not implemented contract

The current prediction contract lacks short cycle-period labels, unlike natal
roleLabels. Do not hardcode 9 Star Ki terminology or turn help About titles into
navigation. Request a documented Dictionary-backed cycleLabels map (exact field
name/shape to be agreed by backend owner), matching the website _CycleTitle:

| Period | Website Dictionary resource |
| --- | --- |
| year | YearlyCycle |
| month | MonthlyCycle |
| day | DailyCycleEnergy |
| hour | HourlyEnergy |
| generation | NineYearlyEnergy |
| epoch | EightyOneYearlyEnergy |

Expose relevant labels in full prediction responses/calculator/last projections
and the existing free yearly projection without adding paid data. Keep these
labels separate from help titles, cycleDescriptiveName and energy.title. Also
document Dictionary-backed scope labels for personal/lunar/global choices if
not already available elsewhere. Existing generic owner-requested Primary Cycles
and Additional Cycles may remain central translatable mobile layout copy; if the
backend already has equivalent resources, prefer documented response labels.

Cycle DTO currently has no distinct summary. Render existing authored description
until an actual summary is provided; never summarise or invent predictive prose.
If Summary/Full Text parity is desired, expose a resource-backed summary separately.
No fake hourly help: current API intentionally has none. About Your Personal
Chart/Constitution are server resource wording; neutralise those in the owning
Dictionary if the owner wants that language changed too, not by client stripping.

## First native implementation (2026-10-25)

Owner requested proceeding with My Predictions after calculator help. The native
tab now restores/checks the existing account, GETs own predictions and metadata,
and parses explicit full/free shapes. Focus and returning from background refresh
the server-owned current snapshot; no selected date is calculated client-side.
Session generation remounts discard all previous-account readings and selections;
stale replies are rejected. A full-route membership denial clears stale paid
entitlements before the free GET. Loading guards wait for sibling requests to
settle before retry; failures clean up loading. The 15-second deadline is unchanged.

Shared Predictions component renders Your Predictions for own hosts, generic
Predictions by default for later calculators, API help.moreOnCycles through
ContextualHelp, and ReadingGroups Primary/Additional Cycles with no summary.
This reuses the website's More On Predictions explanation; no help.overview is
invented for prediction responses. Full help has year/month/day/generation/epoch
and globalKiWarning; absent free help is omitted. Existing API labels and HTML
remain unchanged.

Cards use EnergyCard and returned catalogue IDs/legacy/bundled fallbacks. A single
AppModal shows per-period help, EnergyBanner, API cycle reading and separate
personal/lunar/global disclosures. Epoch detail uses global reading only, matching
the website _CyclesPills; it never falls back to personal epoch prose. Reading
HTML uses ChartReading/ReadingContent; cycle.description is distinct from the
energy DTO's natal description. No invented summary/full-text toggle.

Short cycle-period labels are still not exposed. To avoid holding all native work
for that addition, cards/modal headings currently show the actual authored
cycleDescriptiveName (free projection title) such as Hibernation/Planning. They do
not pretend to be Yearly Cycle/Monthly Cycle labels. No speculative cycleLabels
field or JSON-key-derived names are consumed. Exact website period-label parity
remains pending the documented backend addition above. Scope disclosure titles
reuse actual metadata labels from houseDisplays SolarHouse/LunarHouse and scopes
GlobalKi. Missing metadata omits secondary scopes; it does not invent names.

Parser retains distinct afternoon/invertedDay/invertedAfternoon values for future
appropriately labelled choices; the first UI currently shows the main day value
only. No merging or automatic inversion. Dual-house combined cards, combined
prediction readings, calendar/planner, directions and lunar-phase panels remain
future work beyond this initial six-cycle layout. No new calculation/credit POST.

## Live validation failure and backend handover

Integration checks on 2026-10-25 returned HTTP 500 HTML ASP.NET Runtime Error for:

- GET /api/mobile/v1/predictions/me
- GET /api/mobile/v1/readings/predictions/me/free
- GET /api/mobile/v1/metadata/options

The page reports an exception during the request and another while executing the
custom error page. No JSON error code or authenticated payload could be validated.
Do not report expected anonymous 401 as passing. This affects metadata too, not
just new app parsing. Backend needs to restore the deployed application and its
JSON responses. No restart, deployment, migrations or backend edits performed.

Source review also found MobileReadingsController.FreePredictions sets GlobalYear
= FreeYear(model.GlobalCycleEnergies.Year) while FreeYear defaults global=false.
That chooses CycleDescription rather than GlobalCycleDescription. Proposed backend
correction: explicitly select global=true for that projection and add a regression
test proving free global/personal descriptions remain distinct. This is a source
finding, not an authenticated live-payload verification. The mobile parser retains
the supplied free payload but UI withholds the free global panel until corrected
and verified; full global readings are shown normally.

Next: backend restores Integration, documents/exposes short period labels, and
fixes/verifies free global text; then owner opens My Predictions on iPhone, checks
group order/artwork and one reading/Close at a time. No credentials are requested.
The app shares its existing login and all server access checks. Automated results
for this implementation: 129 tests passed, zero failures; lint and typecheck
passed without warnings/errors; targeted whitespace check passed. New parser
tests cover actual full/free shapes, rich HTML, artwork IDs, scope isolation,
global epoch selection, preserved day variants, invalid numbers and metadata
labels. Client tests also cover clearing stale paid access on membership denial.
These are automated fixture checks, not a signed-in live Integration validation.

A subsequent live recheck of all three endpoints reached the unchanged 15-second
deadline on each rather than returning usable JSON. The probe consequently had
no HTTP response headers/status to inspect; secondary null-response reporting
errors are not additional server responses. Integration remains unverified and
unavailable for the next device check; do not conflate local passing checks with
live availability. No arbitrary-person calculations or credit POSTs were sent.
