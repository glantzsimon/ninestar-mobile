# Predictions controls and three-period Directionology

2026-10-29

Latest owner refinement: remove the Graphical/Magic Square Advanced Options
feature from mobile. Predictions cards/details now always retain ordinary energy
artwork. Squares appear only in Directionology, with travelSummary first, then
personal year/month/day squares. The unused display-mode store/hook and its
obsolete unit test were removed. API label parsing remains compatible.

Numbers now use the exact cell centre plus SVG central baseline, replacing the
manual +6 baseline offset in shared MagicSquare; iPhone visual confirmation is
still needed. No cell values, active flags, server colours or arrows changed.

Your Predictions groups Directionology and Calendar in the existing bottom
SectionWidgets convention. Calendar reuses /my-chart/calendar. Public artwork
catalogue check found no dedicated arrows/compass/directionology image; the new
Directionology navigation icon is a decorative themed four-arrow SVG, not a
fabricated API artwork ID or calculated directional guidance. Calendar retains
FeatureArtwork.calendar (ui.monthly-planner). No extra login or requests on render.

Calendar hierarchy feasibility and the exact website/API gaps are recorded in
calendar-zoom-review.md. Zoom itself is not implemented by this refinement.
Earlier display-mode notes below are historical and superseded.

Refinement validation: all 218 remaining automated tests passed, lint and
typecheck passed, and scoped git diff --check passed. The deleted 219th test
covered the deliberately removed display-mode state store; domain parsing,
three-period summary, access/session and calendar transport tests remain.
Native text centring, arrow appearance and the paired buttons still need iPhone
visual confirmation; no screenshot-based rendering parity is claimed.
Offline iOS export also passed: 1869 modules, 46 assets and a 2.9 MB JavaScript
bundle in ignored .expo/predictions-navigation-validation. No app deployment.

Later public recheck during signed-build preparation: Integration metadata/options
now returns energyDisplays (Graphical/0/Graphical Display and MagicSquare/1/Magic
Square) and predictionControls (Display, Advanced Options, Directionology,
Show Directions), all en-GB. This resolves the public deployment gate recorded
below. It does not verify authenticated magicSquares or travelSummary.periods;
the signed-in iPhone check remains next. No membership or purchasing changes.

## Contract evidence

Local ninestar/docs/mobile-api.md still described hourly scoring and lacked the
new controls. Read the updated shared contract directly from GitHub branch
feature/ui-artwork-refresh (Predictions display and Directionology controls /
Travel summary and magic-square rendering), plus MobileTravelMapper.Summary.
No backend pull, edits, build, migrations or deployment performed.

Documented sources:

- metadata/options: data.energyDisplays and data.predictionControls.
- Full/free Predictions: identical data.labels.displayOptions and controls.
- Controls: display, advancedOptions, directionology, showDirections.
- Display choices: value Graphical / MagicSquare, number 0 / 1 and Dictionary
  label. Use identifiers for selection, never as display-label replacements.
- Authorised travelSummary.periods: year/month/day. Revised backend contract
  states Hour/Generation/Epoch contribute nothing to summary scoring; website
  and API now share this rule. Its hourly square/arrows remain independent.

## Implemented

The shared Predictions component (own and calculator) uses labels from its
response, avoiding an extra metadata request per result. The same pure parser
supports the metadata fields for future form hosts. Temporary local display
labels were removed from ui-copy. Missing/invalid labels or incomplete options
hide their controls rather than inventing translations. Existing graphical
readings remain usable; labels in a free response do not confer access.

TravelSummary validates full access, exact three-period membership (no duplicates,
extra Hour or missing evidence), API title/labels, safe integer scores, colours,
warning booleans, resolved guidance and normalised direction endpoints. Invalid
groups reject the whole summary, rather than silently omitting a potentially
important direction. No scores, severity or guidance are computed/subtracted.
API grouping/order, values, colours and showWarning flags are preserved.

Directionology displays personal year/month/day squares and then the summary in
shared panels. Status icons use the same supplied south-up endpoints as square
arrows; Centre is a ring. API direction/score/guidance labels and rich prose
remain visible beside the decorative status graphics. Shared WarningIcon uses
the server warning flag. No extra explanatory product copy was added.

Square rendering, split/dual handling, reading sizes, session-only display mode,
15-second timeout, authentication, entitlements and unsaved account drafts are
unchanged. No new dependency or persistent protected-data cache was introduced.

## Validation

- Live Integration metadata/options GET: 200, but energyDisplays and
  predictionControls both absent/null. This does not establish deployment of the
  revised backend. Earlier anonymous Predictions 401 remains the last auth
  boundary check; no new authenticated request or stored credentials used.
- Five new tests cover summary data/HTML/coordinates, rejection of hourly or
  ambiguous periods, malformed-group handling, exact translations from both
  documented sources, and full/free/older response isolation. The prior square
  regression now expects absent summaries to parse as null.
- All 211 automated tests passed; lint, final typecheck and tracked-file
  whitespace checks passed. Route declarations were regenerated with the
  installed Expo CLI helper before typecheck; no route types were bypassed.
- Offline iOS export passed: 1865 modules, 46 assets, 2.9 MB JavaScript bundle.
  No development server, deployment or native build was started.

## Remaining device checks and next step

Source-contract blockers and the public metadata deployment gate are resolved.
Authenticated summary/square availability and native appearance remain unverified
here. Confirm a full authorised response includes periods year/month/day.

First iPhone step: My Chart → Your Predictions, scroll to the bottom and open
Directionology. Confirm the summary is first, then year/month/day squares, with
numbers visually centred. Regular cycle details must show no squares or display
selector. Next check the neighbouring Calendar shortcut opens the existing shared
calendar without another sign-in. No membership changes are needed.
