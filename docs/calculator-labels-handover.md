# Calculator labels and date selection — 2026-10-29

Status update: backend 46951b37 now documents these additions in
ninestar/docs/mobile-ui-labels.md and mobile-api.md. Source contract gap resolved;
Integration recheck now returns labels 200 and the documented date choices in
options. The shared catalogue and calculator wiring are implemented; see
ui-labels-validation.md for evidence, remaining gaps and the next iPhone check.
The original proposed handover below is retained as request history, not a change
to the shared API contract.

## Owner request

- Add a helper beneath Current Timezone: “The timezone of your current location.”
- Make the Predictions calculation target explicit: Display Data For, with Now
  and Selected Date and Time options. Show the native date/time inputs only for
  the selected-date option. The selector itself explains the choice without extra
  unsolicited prose.
- Use website/Dictionary casing throughout the application. Preserve translated
  API labels exactly; do not title-case strings on the device.
- All UI labels should originate from the API. Existing local copy is migration
  work, not permission to introduce more hard-coded labels.

## Evidence

Integration GET /api/mobile/v1/metadata/options returned HTTP 200 on 2026-10-29.
Its data keys were culture, calculationMethods, calculatorTypes, houseDisplays,
genders, plannerViews, scopes, forecastTypes and consultationDurations. No form
headings, current-timezone helper or Display Data For choices were returned.

Website sources in the local backend checkout:

- webapp/Globalisation/Dictionary.resx: DisplayDataForLabel = Display Data For;
  Now = Now; SelectedDateAndTime = Selected Date and Time.
- webapp/WebApplication/Enums/EDisplayDataForPeriod.cs: protocol values Now and
  SelectedDate use those Dictionary descriptions.
- webapp/WebApplication/Views/NineStarKi/_CalculatorForm.cshtml: selected-date
  controls are conditional on SelectedDate.

Mobile CalculationForm currently uses central uiCopy for field headings; metadata
supplies option labels. buildCalculation sends selectedDateTime:null when both
selected date/time fields are empty, and validates/sends a local timestamp when
either is populated. No explicit Now/Selected Date selector currently exists.
No UI or request behaviour changed during this audit.

## Backend handover

Please expose Dictionary-backed shared calculator field/group/action labels and
help through public metadata, available before the first calculation. Document
the exact additive fields in ninestar/docs/mobile-api.md before app wiring.

1. Display Data For label and options using DisplayDataForLabel, Now and
   SelectedDateAndTime; keep stable identifiers separate from display labels.
2. Current Timezone label (agree exact website spelling/casing) and a new shared
   resource: “The timezone of your current location.” This describes the selected
   timezone; it does not imply location permission or automatic GPS detection.
3. Shared calculator headings: Birth Details and Advanced Calculation Preferences;
   name/optional-name, birth date/time, birth-time-known, birth timezone, gender,
   calculation method, house display, selected date/time, both hemisphere options,
   Yes/No and Calculate/Edit Calculation actions. Reuse the website's actual
   resources; do not guess resource mappings from similarly named strings.
4. Provide culture and define culture selection/missing-label behaviour. Use
   approved website casing in the resources, including acronyms. Extend this
   migration to remaining navigation, chart/menu/fact headings and Account labels
   listed in ui-label-audit.md; calculator labels alone do not localise the app.

Retain existing request semantics: Now sends selectedDateTime:null, while a
selected date/time is a wall-clock value interpreted in userTimeZoneId. No new
calculation enum/request field is needed merely to display this selector; document
any backend semantic difference before changing requests. Labels never grant
reading access. Do not change membership or authentication protections.

## Next concrete step and validation

Owner/backend AI exposes and documents the labels/options/helper, then deploys.
Mobile verifies the public response and wires the shared form used by calculator
hosts. Preserve drafts when switching modes, keep date controls/validation hidden
for Now, and retain the existing 15-second timeout and account isolation.

App-wide API-label migration remains open; see ui-label-audit.md. No private
requests, backend edits, deployments or dependency changes were performed.
Validation: npm run lint and tsc --noEmit both passed; targeted git diff --check
passed. Documentation-only changes; no new runtime tests were needed.
