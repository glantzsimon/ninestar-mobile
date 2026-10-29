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
- A tapped 9-year period fetches NineYear (its yearly overview); a tapped year
  fetches Year (its monthly overview); a tapped month returns to GET calendar/month
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
