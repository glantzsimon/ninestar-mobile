# Calendar zoom hierarchy: website/API review — 2026-10-29

## Verdict

Superseding implementation (2026-10-29): owner supplied explicit instructions
to use the existing planner contract with a Gregorian Month leaf, local interior
anchors and metadata plannerViews. That flow is now implemented; the earlier
proposed presentation additions below do not block this slice. See
calendar-zoom-validation.md for current behaviour, evidence and device checks.

Feasible using the existing server planner; do not calculate Ki periods locally.
This task adds the Calendar shortcut to Your Predictions, opening the exact same
existing Calendar route/control as Your Chart. The initial hierarchy review below
is retained as source history. No backend or shared contract changes were made.

## Website behaviour and sources

- Enums/EPlannerView.cs defines EightyOneYear, NineYear, Year, Month and Day.
- ViewModels/PlannerViewModel.cs maps ChildView as 81-year → 9-year → year →
  month → day, with NextViewUp reversing those levels. The upper 81-year level
  must not offer further zoom-out. The website's Day screen contains hours;
  the owner's requested mobile scope stops at Month with its days.
- Views/Predictions/Planner/_GlobalPlannerView.cshtml displays a parent period,
  its dates/age/house, child periods and zoom-out plus previous/next controls.
  _DailyCalendar.cshtml supplies the Month grid; _CyclesJs.cshtml uses server
  view/date/navigation values to change levels and retrieve selected readings.
- Services/NineStarKiService.cs GetPlannerData supplies astronomical period
  boundaries and rows. Its Month branch calls
  GetNineStarKiMonthlyPeriodBoundaries and GetNineStarKiDailyEnergiesForMonth.
  These are solar Ki months, not simply Gregorian calendar months.
- PlannerViewModel/PlannerViewModelItem expose safe drill-in timestamp strings.
  For larger periods the website deliberately offsets the period start to avoid
  selecting the preceding period across timezones. Do not reproduce that offset
  as an undocumented mobile calculation.

## Existing API coverage

POST /api/mobile/v1/predictions/planner is an existing paid/authenticated,
CSRF-protected read calculation, using MobilePlannerRequest (ordinary calculation
body plus view/display/navigationDirection/includeMoonPhases). It preserves the
person and calculation preferences, including Advanced mode and current timezone.
The mobile wrapper does not yet call this endpoint.

MobileCalculationMapper.Planner returns view, display, selectedDateTime,
periodStartsOn/periodEndsOn, childView/nextViewUp, parent/second energy, combined
reading, moon data, and items with period boundaries, active flags, child view,
energy/second energy, combined reading, directions and magic-square numbers.
Artwork IDs already flow through the cycle/energy projections. Metadata options
supplies Dictionary-backed plannerViews. Existing help remains separate.

GET calendar/month is different: it uses the signed-in user's saved settings and
Gregorian year/month, with day entries, labels, help and private feed actions.
It cannot be passed an arbitrary calculator person. Current PersonalCalendar
validates complete Gregorian months and must not be fed solar planner rows as
though they were the same payload.

## Proposed additive backend handover — agree/document before wiring

Please document and expose the website's existing planner presentation values:

1. Parent period title, formatted date range and age range, and each child's
   formatted title/date/age captions. Use website formatter output/resources,
   keeping display text separate from identifiers and raw bounds.
2. Safe parent/child drill-in timestamps matching the website's existing
   PeriodStartsOnDateTimeString/EnergyStartsOnDateTimeString semantics; document
   which local timezone each request timestamp represents. Keep navigation
   direction and next/child views server-authored.
3. Dictionary-backed Zoom Out/Zoom In, Previous/Next Period labels and applicable
   boundary/availability information. Choose/document exact fields in
   ninestar/docs/mobile-api.md; these are proposed requirements, not invented
   transport paths consumed by the app.
4. Clarify the month experience: faithful solar-month planner versus a Gregorian
   month Calendar adapter. If the final level must remain the current Gregorian
   calendar, expose/document its context-aware projection for calculated people
   rather than silently using the signed-in user's saved details.

Suggested mobile interaction: Up goes to NextViewUp; tapping a child or Down
drills into the selected child (current active child initially). Stop zoom-out at
81 years and zoom-in at the requested month/day-grid level. Keep previous/next
period separate from zoom, preserve selected date/context and load one period at
a time through the existing 15-second/session guards. Reuse the existing shared
calendar day/detail styling, including flush scrolling, without duplicating
screens or treating a solar month as a complete Gregorian month.

## Scope and next concrete step

The new shortcut is on Your Predictions and reuses /my-chart/calendar. Calculated
Predictions retain normal readings and Directionology; no incorrect shortcut to
the signed-in user's own calendar is added for another calculated person.
Context-aware calculated calendars belong to the planner integration above.
Google feed actions remain own-account-only, explicit and protected.

Backend owner agrees/documents the presentation/context additions; mobile then
verifies authenticated Integration samples at all four requested levels and
implements a shared planner/calendar adapter. No hierarchy requests, credit
consumption, subscription changes, backend code, migrations or deployments here.
