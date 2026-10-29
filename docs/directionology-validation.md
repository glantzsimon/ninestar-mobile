# Predictions controls and three-period Directionology

2026-10-29

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

## Remaining deployment gate and next step

Source-contract blockers are resolved. Integration still lacks the public
metadata additions, and authenticated summary/square availability has not been
verified. Backend owner deploys the revised branch, then recheck the two metadata
fields and confirm a full authorised response includes periods year/month/day.

First iPhone step after deployment: My Chart → Your Predictions, expand Advanced
Options and confirm its two API-labelled display choices. Then check Magic Square
mode and Directionology summary, without signing in again or changing memberships.
