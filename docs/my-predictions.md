# My Predictions and reusable result screens

Owner-confirmed naming (2026-10-27): Your Chart hub uses Your Predictions; the own
prediction page title is Your Predictions. Display API help.overview next, then Houses You Currently
Occupy as a shared sectionTitle above the reading groups. Shared chart/prediction
results omit person-name subtitles, including calculator hosts; functional name
fields and data remain. Lint, typecheck and targeted whitespace checks passed
for this refinement; native visual confirmation remains pending. Website resource
Dictionary.HousesYouCurrentlyOccupy exists and is used by PersonalChart/MyProfile
and Predictions/Index. Owner now supplied data.labels.yourPredictions and
data.labels.housesYouCurrentlyOccupy: both are parsed in full/free results and
used for the own page title and post-help subtitle. Existing approved uiCopy is
retained only while loading or on older/missing-label responses. My Predictions
navigation remains central. Local shared API documentation did not yet list
these fields at inspection; backend owner should document the supplied contract.
No help-title substitution or access change. Routes remain /my-chart/cycles and
/predictions alias. All 11 Predictions tests, lint, typecheck and targeted whitespace
checks passed for this wiring. Next: reopen My
Predictions on iPhone and verify the response's headings.

## Current implementation and contract (2026-10-26)

2026-10-27: Explore → Predictions now provides the arbitrary-person calculator.
It shares CalculatorScreen/CalculationForm with Personal Chart and this same
Predictions result control; own Predictions remains a separate read-only GET
host. See predictions-calculator.md for endpoint, memory and validation details.

My Predictions is native and shares its result component with future calculator
hosts. It is now hosted as My Chart → Your Predictions (/my-chart/cycles), with the
central page heading Your Predictions. /predictions redirects there; the separate bottom
tab is removed. Existing own-reading/auth logic stays in OwnPredictionsScreen.
Screen order: own title, expandable API help.overview, Houses You Currently
Occupy subtitle, Primary Cycles,
Additional Cycles, Global Cycles, then the global extended group. No summary panel.
help.moreOnCycles stays parsed as supplementary data but is not displayed.
ReadingGroups, EnergyCards/EnergyCard,
ContextualHelp, ChartReading and AppModal are shared with charts.
Additional Cycles starts expanded. See design-system.md for influence sizing,
aligned profile image columns and accessible vertical-list layouts.

Read the authoritative `ninestar/docs/mobile-api.md` sections Predictions short
period and scope labels and Predictions cycle cards matching the website. The
owner reports backend commit a67fc0a3 on master plus the documented card additions;
Integration deployment is owner-confirmed. Local source confirms PredictionLabels,
cycle houseName and FreeYear(global: true). No backend code/contract edits here.

The client now consumes the exact documented fields:

| API field | App use |
| --- | --- |
| labels.groups.primary / additional / global / extendedGlobal | Group panel headings |
| labels.cycleTitles[period] | Card heading, e.g. Yearly Ki |
| cycle.houseName | House line, e.g. 7 Metal House |
| cycleDescriptiveName; free yearly title | Primary card caption and combined artwork/reading-panel title |
| labels.predictionTitles[period] | Detail modal title, e.g. Yearly Prediction |
| labels.periods[period] | Short period labels; older-server modal fallback |
| labels.scopes[scope] | Personal/lunar/global disclosure headings |
| help[period] | Longer explanatory introduction only |
| help.overview | General introduction above cycle groups |
| help.globalKi | First introduction inside each global detail |

The owner's later style correction uses exactly the same EnergyCard row as My
Chart: artwork beside a text column containing Yearly Ki, 7 Metal House and
Harvest / Abundance and Celebration, plus the shared right-hand chevron. There
is no cycle-only stacked variant or image size. This supersedes the earlier
centered label/house/image/caption layout while keeping every API field's meaning.
Primary periods year/month/day show the caption; additional periods
generation/hour (personal) and epoch/generation (global) use compact cards. Labels and
house captions are parsed as authored display strings, including translations.
No About stripping, protocol-key formatting, guessed fields, House suffix or
number/element concatenation for Predictions. Natal chart labels stay separate.

Prediction details combine the API descriptive cycle heading (for example,
Harvest / Abundance and Celebration), energy artwork and reading into one shared
ChartReading/AppPanel beneath help. No standalone EnergyBanner, duplicate title,
or Personal Houses/Global Ki wrapper around the selected reading. ChartReading's
optional energy prop uses the existing catalogue/legacy/bundled fallback chain;
safe HTML, summary handling and unavailable messages retain their shared paths.
Optional lunar content stays separately disclosed under its API title. This
applies to all prediction periods/scopes and future calculator hosts; main-screen
widgets and chart energy details remain unchanged. Missing descriptive titles
stay absent rather than falling back to natal wording.

This replaces the initial reading-title-only cards and metadata enum-label
workaround. The extra metadata/options request and local group-heading strings
have been removed. Older/malformed responses omit missing labels/captions without
invented replacements. ReadingGroups shows an unheaded panel rather than a blank
disclosure header when the additional group label is absent. Existing chart
headings/disclosures remain unchanged.

## Requests, access and account state

### Dedicated detail-screen headings (2026-10-26)

Owner requests Yearly Prediction instead of Year in the fixed modal header,
systemically for all periods. Owner now confirms data.labels.predictionTitles
in full/free responses, backed by existing Dictionary resources. The shared
Predictions modal centrally consumes that map for personal/global detail. Help
titles are never stripped or repurposed. Main card labels remain unchanged.

Owner-confirmed `data.labels.predictionTitles`:

| Key | Existing Dictionary resource | Current English value |
| --- | --- | --- |
| year | YearlyPrediction | Yearly Prediction |
| month | MonthlyPrediction | Monthly Prediction |
| day | DailyPrediction | Daily Prediction |
| generation | NineYearlyPrediction | 9-Year Prediction |
| epoch | EightyOneYearlyPrediction | 81-Year Prediction |
| hour | HourlyPrediction | Hourly Prediction |

Older servers retain their supplied short period heading without invented wording.
The owner subsequently reported the API refreshed. The latest local contract now
documents predictionTitles; authenticated device verification is still required.
No backend files changed here.
Validation: all ten prediction tests, lint, typecheck and targeted whitespace
checks passed. Fixtures cover all six titles, full/free parsing, translation and
missing/malformed titles. Ignored route declarations regenerated before typecheck.
Next: after deployment,
refresh My Predictions and confirm the fixed yearly modal heading. Other period
labels do not grant free users extra readings; actual returned cycles still gate UI.

The route checks GET account/me, then GET predictions/me. Only HTTP 403
membership_required falls back to GET readings/predictions/me/free; a denial
clears stale paid entitlements before the fallback. Authentication, network and
server errors never trigger another access route or a credit-consuming POST.
There is no second login, arbitrary-person calculation or membership mutation.

Full payloads retain personal/lunar/global collections. Free parsing allowlists
only year, lunarYear and globalYear. All six labels in a free response do not
create Month/Day/Hour or other readings; cards, detail selection and scope panels
require an actual valid returned reading. Invalid/missing cycles are omitted;
no valid cycles is an invalid response. No natal energy prose is substituted for
cycle.description. There is no distinct API summary, so no fabricated summary or
summary/full-text toggle. HTML headings/bold render through existing native text.

Personal primary periods are year/month/day, additional generation/hour. Global
primary periods are year/month/day; global extended is epoch/generation, in that
order. Each group uses the same ReadingGroups/EnergyCards styling and influence
sizes. Missing groups are omitted rather than rendering empty panels. Epoch is
shown only in global navigation. Selection includes scope and period: global
cards, banner and body all use the global cycle with no personal fallback.
Personal details show the combined personal reading and an optional lunar disclosure.
Global details show the combined global reading, with no scope wrapper. They show
help.globalKi only; period help is personal-only. globalKiWarning appears only for Epoch.
Global introduction HTML uses the existing safe renderer, never warning prose.
Owner confirms help.globalKi.htmlBody now uses Dictionary.GlobalKiIntroduction
for collective/planetary Ki versus personal houses, replacing promotional text.
The client already consumes the supplied title and HTML without local wording;
refresh after deployment to retrieve it. Older/absent help remains omitted.
Global-help follow-up validation: lint, typecheck and targeted whitespace checks
passed after regenerating stale ignored route declarations. The local backend
contract still names the old resource; the new mapping is owner-confirmed,
not an independently verified Integration payload. Next: reopen a global yearly
reading after deployment and verify its single dedicated introduction.
Afternoon/invertedDay/invertedAfternoon
remain distinct in the parsed model; the first UI exposes main day only, pending
appropriately labelled variant controls. Dual-house combined cards, combined
readings, calendar/planner, directions and moon panels remain follow-up work.

Focus and returning from background refresh the server-owned snapshot. No local
cycle calculation or expiry-derived permissions. Session generation changes
unmount old readings/modals, stale responses are rejected, loading guards prevent
overlap and errors clean up loading. My Account edits and retained calculator
inputs are unaffected. The existing 15-second per-request deadline is unchanged.

## Deployment gates and global groups

The newest documented additions are labels.groups.global, help.overview and
help.globalKi. Their deployment was not confirmed in this request; absent help
or labels stay absent on older servers. Owner subsequently confirmed
labels.groups.extendedGlobal from Dictionary.ExtendedGlobalCycles (Extended
Global Cycles), in both full/free responses. It is now wired into the same
default-expanded disclosure as Additional Cycles. Missing labels retain an
unheaded panel. The latest local shared contract now includes this field; no
backend file edits were made here. The owner reported the API refreshed, while
authenticated response verification remains pending.
Follow-up validation: all ten prediction tests, lint, typecheck and targeted
whitespace checks passed. Tests cover full/free label parsing, translations and
missing old-server fields. Regenerated stale ignored route types for typecheck.
Next: refresh My Predictions after deployment and check the Extended Global Cycles
heading and its expanded 81-year/9-year cards, then collapse/reopen the panel.

Owner subsequently confirmed the label/card update is deployed to Integration.
Next diagnostic is switching away from and back to My Predictions to force the
existing focus GET and replace any pre-deployment in-memory snapshot. New private
fields and the free global prose fix still need signed-in verification; deployment
confirmation alone does not establish their actual returned values.

Owner reports missing labels on iPhone after client wiring. Recheck on 2026-10-26
confirmed public GET metadata/options 200 JSON and both predictions/me and
readings/predictions/me/free 401 authentication_required JSON. This independently
confirms the public transport checks now pass; it does not confirm labels or
houseName in authenticated responses. Local UI/parser consume the documented
fields at the Integration base. Deployment is owner-confirmed, but do not infer a deployed
private contract from metadata availability or anonymous 401. If deployment is
confirmed, next refresh the Predictions screen, then inspect only the label map
and house captions using the owner's existing signed-in session, not credentials
or full profile/reading payloads.

Backend source now fixes the earlier FreePredictions GlobalYear projection by
passing global: true to FreeYear, selecting GlobalCycleDescription. The new
owner-requested global navigation now renders returned free globalYear under
that corrected contract, superseding the temporary UI guard. This adds no
reading grants: free parsing still rejects injected full global month/day/etc.
Authenticated Integration prose verification remains pending; local fixtures
verify isolation, not live deployment or semantic correctness of server text.

Historical checks on 2026-10-25 returned HTTP 500 HTML for predictions/me,
readings/predictions/me/free and metadata/options, then 15-second timeouts on each.
The owner now reports anonymous metadata 200 and Predictions 401 JSON, and a
backend exception-filter fix preserving mobile JSON. Those public results do not
verify authenticated calculations, timeout resolution or the new private fields.
No authenticated live check of new label fields is claimed.

## Validation and next concrete step

Combined detail-panel update: lint, typecheck and targeted whitespace checks
passed; regenerated stale ignored route declarations to clear unrelated Explore
type errors. Visual check remains on iPhone. No data parsing, requests,
authentication, entitlements, 15-second timeout
or account drafts changed. First check: open yearly prediction and confirm a
single descriptive heading/image/reading panel beneath the helper text.

Global grouping update: all 133 tests passed, zero failures; lint, typecheck and
targeted whitespace checks passed. Stale ignored Expo route declarations initially
caused unrelated Explore path errors; SDK regeneration cleared them. Added coverage for explicit
scope selection across all global periods, no personal fallback, free yearly-only
access despite supplied paid data, global label parsing and separate help HTML.
No new requests, dependencies, account writes, purchasing or backend changes.
The 15-second timeout, session protections, entitlements and account drafts remain
unchanged. First next iPhone check: after deployment, reopen My Predictions and
confirm the overview introduction replaces More On Predictions. Then inspect the
global groups and one global yearly detail separately.

New fixtures cover distinct group/card/navigation/scope/help/reading labels,
translated houseName and old/malformed responses. Free responses with every
label still expose yearly data only. Existing coverage preserves scope isolation,
global epoch selection, day variants, artwork IDs, safe HTML and session guards.
Final automated results: 131 tests passed, zero failures; lint and typecheck
passed without warnings/errors. Targeted whitespace check passed after removing
a trailing blank line. These are fixture/local checks; no authenticated new-label
response or iPhone layout has been independently verified.

Detail-banner correction: lint, typecheck and all eight existing prediction parser
checks passed. Typecheck initially hit stale ignored Expo route declarations;
regenerating them with the installed SDK cleared those errors. No transport,
access, account state or main-card rendering changed. Device heading check pending.

Next: open the yearly prediction on iPhone and confirm its descriptive banner
heading, then another available period. Use existing signed-in sessions to check
full/free label maps, house captions and global versus personal free prose,
without changing memberships or sharing cookies/credentials. Retest actual
authenticated failures/timeouts and loading cleanup. First iPhone check: open
My Predictions and confirm the existing Yearly Ki, house and Harvest/… card text.
Then check period modal title, distinct help title and scope headings one at a
time. No deployment, migrations, purchasing or website dependency changes here.
