# Calendar parent and card actions — 2026-10-30

- Superseding the earlier double-tap/icon experiment below: one tap on a parent
  or child immediately selects it and scrolls its reading into view. Each
  drillable child has two 32-point circular buttons, right-aligned with a small
  inset, beneath
  its full-width card content: eye/view on the left selects and shows details;
  downward chevron on the right drills into the next API view. Its accessible
  label uses “See ” plus the exact API destination view label. There is no
  double-tap drill gesture. Parent details use the parent's single tap and retain
  their right-side chevron for consistency. Card content uses half the former vertical padding above;
  the other half sits below the buttons.
- Navigation helper now tells users to tap for details and use the arrow below a
  period to open the named API view. No extra request is made for selection.
- Latest refinement retains the parent chevron, pairs eye/view and down
  drill buttons beneath children, with half the former top padding and more
  bottom padding to centre the controls in the card's lower space.
- The card has no extra gap between content and controls, with 12-point bottom
  padding so the buttons sit closer to the text while retaining space below.
- The circles are 32 points wide/high with unchanged icons and 44-point
  effective touch targets.
- Selected-period detail panels end with centralised “Back to top”, returning to
  the planner controls/card list in either the screen or expanded modal host.
- Buttons use theme action-surface/pressed/border tokens and white icons: dark
  teal in the app's default dark theme, with a contrast-safe teal counterpart in
  light mode.
- Validation: lint, TypeScript (`tsc --noEmit`) and scoped `git diff --check`
  pass. Native visual/touch verification remains pending on iPhone.

- Historical implementation (superseded above): selection was delayed 300ms to
  support double-tap drilling, with separate detail and magnifier icons. This
  behavior was removed by the owner’s latest interaction preference.
- Child period cards no longer show cycle-descriptive captions; those remain on
  the parent summary/details. Parent boundaries remain inside the prominent card.
- Owner correction (2026-10-30): Gregorian Month is a calendar month and has no
  parent card. It retains the existing month controls/grid and selected-day detail
  panel. Drilling from a planner month opens this grid; Back restores the previous
  planner view without a month parent summary.
- Two shared-theme dividers bracket the central localised instruction. Overview wording names the destination view using its API plannerViews label;
  the Gregorian month instruction mentions detail selection only. These functional strings live in central uiCopy.
- Selected day remains the Gregorian month detail anchor. Back restores the prior
  planner snapshot; no parent period is added to the Gregorian month page.

Validation after these layout reversals: project lint, TypeScript and scoped
`git diff --check` pass. No dependency, API or purchasing changes. Native gesture,
symbol, scroll, and visual checks remain pending on iPhone.

---

# Calendar interaction refinement — 2026-10-30

Implemented the owner's queued changes in CalendarOverview shared by normal and
expanded modes at Year/NineYear/EightyOneYear levels. Gregorian Month is unchanged.
The planner parent card contains its server boundary range and uses larger artwork.
No new labels.

Single tap selects a period and displays its combined HTML, falling back to its
existing energy reading, in the standard panel beneath. Parent is selectable too.
Selected descriptions scroll flush-top through the existing screen/modal measured
scroll helpers. Double tap drills using the existing safe server-bound anchor and
one request. Single activation waits 300ms so the first tap cannot scroll the
second tap's target away. Pending activation cancels on unmount/disabled changes;
ordinary EnergyCards retain immediate single-tap behavior. Accessibility exposes
a separate drill action labelled with the API child-view caption. Native assistive
technology behavior remains a device check. Out-of-range children allow reading
selection while omitting drilling. Back snapshots and same-period refresh retain
the selected item; no private content is newly persisted or fetched on selection.

Automated validation: all 227 tests passed (0 failed), lint and typecheck passed,
and scoped git diff --check passed. History regression coverage now explicitly
checks selected-period restoration. Native gestures/visuals remain unverified. No backend change, new dependency,
deployment or signing action in this refinement. Existing API/access safeguards
remain unchanged. Next iPhone check: open Year View, single-tap a month and confirm
its description appears below; return to the cards and double-tap that month to
open the Gregorian calendar. Repeat in expanded view, then test larger levels.

---

# Shared calendar zoom — 2026-10-29

## Implemented flow

Owner explicitly authorised the existing planner contract, superseding the
earlier proposal to wait for extra presentation fields. No backend changes.

- Gregorian Month keeps GET calendar/month and the existing PersonalCalendar,
  day selection, full reading, normal/expanded layouts and flush detail scrolling.
- The up control uses the API target-view caption and follows Month → Year →
  NineYear → EightyOneYear. It disappears at the top level.
- Each higher level uses one POST predictions/planner with fresh CSRF, existing
  cookies/session guards and a 15-second deadline. No automatic POST retries,
  complementary-credit routes, child-calendar fan-out or local Ki calculations.
- A double-tapped 9-year period fetches NineYear (its yearly overview); a double-tapped year
  fetches Year (its monthly overview); a double-tapped month returns to GET calendar/month
  for the Gregorian month containing the safe selected date. No solar-month rows
  are passed to the strict Gregorian month parser.
- Initial/drill/zoom calls use navigationDirection None; overview arrows use Back
  and Forward. All larger views set includeMoonPhases:false and display:PersonalKi.
- View captions come only from metadata/options plannerViews. Date ranges format
  returned bounds; cycle/house captions, artwork IDs and reading HTML remain
  server-authored. Adjacent controls use symbols plus the API view caption; no new
  English zoom/period labels were invented. Metadata failures do not prevent
  the existing month grid; absent captions hide unavailable zoom controls.

## Calculation and timestamp handling

The initial account read supplies calculation.person, birth/user timezones,
method, house display and both hemisphere flags. An explicit allowlist copies
only calculation fields, splits the date of birth from birth time without adding
it twice, and preserves the saved calculator type as explicitly requested for
this read-only browser, matching GET calendar/month. It does not restore a mode
selector or change the Advanced type used by explicit calculator/account saves.
It does not
read or replace My Account's unsaved draft, save settings or persist a profile.
Saved-setting changes on refresh invalidate previous calculated snapshots.

Unspecified server timestamps are floating wall-clock values. Arithmetic uses
UTC containers solely to avoid device-zone drift, never to append Z to a request.
An existing local selection strictly inside the target bounds is retained.
Otherwise a civil-noon date inside the server interval is chosen. For explicitly
offset-bearing bounds it must have 36-hour clearance on both sides, proving that
the new local noon remains interior across supported timezones. This is a new
interior anchor, not an existing UTC instant relabelled as local time. Mixed
timestamp kinds or unsafe/short intervals fail instead of guessing a mapping.

Outgoing selectedDateTime is always local to userTimeZoneId, with no Z/offset.
No January–December or fixed 9/81-year boundary is computed on the device.
Offset-bearing date captions use Intl with a supported IANA user zone; unknown
Windows aliases retain exact supplied offset timestamps rather than presenting
misconverted dates. Existing Gregorian bounds (1900–2100) and planner selected
year bounds (1800–2200) remain enforced; out-of-range drill targets are disabled.

## State, shared UI and access

Normal/expanded calendars share the same controller and current view. The Back
control restores the exact prior page/date from a bounded 24-entry screen-memory
history, without additional network requests. Nothing is persisted. Selected-day
changes update the current snapshot before zooming. The overview uses shared
AppPanel/EnergyCard/EnergyCards/ReadingContent and catalogue fallbacks, including
distinct second-energy artwork. Same-level siblings use equal artwork weight.
Shared card disabled states block repeated navigation while loading.

Foreground/focus refresh requests only the current view and rechecks the owning
account. Request guards ignore late/old-generation results. Authentication,
membership or profile-conflict denials clear calendar, planner context/history,
expanded view and private feed URL; account changes remount the owning screen.
History never restores a denied account's view. Network failures retain the
last good page with existing inline read-error/retry UI. Retry is explicit.

Calendar feed creation/copy/revocation remains separate, explicit and CSRF-
protected. No link is created by month/overview navigation, and private links
are still cleared on blur/session change and never logged or persisted.

## Validation

- Public Integration metadata/options returned the documented labels: 81-Year
  View, Nine-Year View, Year View, Month View and Day View. Only the four requested
  mobile levels are consumed; no hourly/day planner was added.
- Anonymous POST planner without CSRF returned 400 invalid_csrf_token. With a
  fresh anonymous CSRF cookie/token pair it returned 401 authentication_required.
  Tokens/cookies were memory-only and were not printed or stored. No authenticated
  live calculation, private account read or membership change was performed.
- New tests cover payload allowlisting, both hemisphere flags, split birth time,
  local/no-Z requests, safe solar-period anchors and extreme offsets/DST, parent/
  child metadata, combined HTML/split artwork, labels, Gregorian bounds, Back
  history and a single fresh-CSRF POST with no child fan-out or stale-account POST.

Final automated results: all 227 tests passed (0 failed), lint and typecheck
passed, and scoped git diff --check passed. Offline iOS export passed with 1871
modules, 46 assets and a 2.9 MB JavaScript bundle in ignored
.expo/calendar-zoom-validation. No native/cloud build, deployment, migration,
purchasing change or backend edit was performed.

Remaining device check:
open Your Calendar, select a day and use ↑ Year View, then ↑ Nine-Year View and
↑ 81-Year View. Drill back through periods and confirm the same Gregorian day
grid and Back-restored selections. Repeat once in expanded view. Confirm response
times fit the existing 15-second deadline; no timeout increase was made.

Source-only parity caveat for backend follow-up: the local
Services/GoogleCalendarService.cs snapshot resolves the cycle-inversion preference
with info.InvertDailyAndHourlyKiForSouthernHemisphere as its fallback, whereas
ReadOwnCalculationRequest uses info.InvertDailyAndHourlyCycleKiForSouthernHemisphere.
If those stored flags differ and no explicit cycle preference exists, the two
existing backend paths may differ. No authenticated mismatch was observed or
backend fix made here; reconcile the deployed backend if that case is tested.

Scope remains the existing own-account calendar reached from Your Chart and
Your Predictions. Arbitrary-person calculator calendars are not silently mapped
to the signed-in person's calendar and remain a separate context-adapter task.
