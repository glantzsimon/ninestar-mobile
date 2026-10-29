# My Chart hub and native personal calendar

Calendar zoom added 2026-10-29: the shared own-calendar controller now combines
the existing Gregorian GET month/day grid with POST planner Year/NineYear/
EightyOneYear views. API metadata labels, server bounds, local interior anchors,
single-overview requests and bounded in-memory Back history are documented in
calendar-zoom-validation.md. No local Ki calculation, profile save, extra login
or feed action is introduced by navigation. Both standard and expanded views
use the same state and controls.

## Implementation (2026-10-26)

Selected-day typography now follows chart details: the date retains AppPanel's
sectionTitle header, and the server-authored houses line uses the same shared
sectionTitle (Candara Bold 22/28, semantic heading colour) instead of small grey
metadata. Both hosts use PersonalCalendar; the reading still uses shared
ReadingContent, including HTML headings and bold spans. No API/prose, selection,
scroll or cell changes. Lint, typecheck and targeted whitespace checks passed.
Next: tap a day on iPhone and
check the houses heading; native visual confirmation remains pending.

Sunday wrapping correction: explicit seven-cell nonwrapping flex rows replace
percentage-width cells in a wrapping container. This removes the fractional-width
rounding risk at the seventh column. Weekday headers use the same equal columns,
single-line short labels and font fitting; full API weekday labels remain their
accessibility names. Final-week empty cells preserve alignment. Normal/expanded
hosts share this, preserving the latest cell height and artwork offsets.
Lint, typecheck and targeted whitespace checks passed. Owner confirmed on iPhone
that Sunday no longer wraps. Both normal and expanded views use this fix;
separate confirmation of each host was not specified. Next: include both hosts
in the next calendar visual pass; no remaining reported wrapping blocker.

Latest cell refinement: PersonalCalendar uses a width-driven square artwork
frame plus 2 points of top margin, making the bordered cell 2 points taller
than square. Date remains absolute top zero. The artwork frame follows the
bottom edge; image translation is now 5 points, including the owner's latest
2-point downward refinement from 3 points. Both calendar hosts share this layout. Lint, typecheck and
targeted whitespace checks passed; next: check normal and expanded appearance
on iPhone. Native visual confirmation remains pending.

The subscription panel heading now comes from data.labels.googleCalendarLink
(Dictionary.GoogleCalendarLink), as documented in the shared API contract.
Its expandable instructions still use help.subscription HTML/blocks; the generic
AboutPersonalCalendar help title is not used as this panel heading. Older servers
without the label omit the heading rather than inventing one. Copy/revoke actions
and private link handling are unchanged. Six calendar tests, typecheck and lint
passed. Next: reopen My Calendar and check Google Calendar Link on
iPhone. Authenticated live label presence is a device check, not claimed verified.

Visible tabs are Explore, My Chart and My Account. My Chart is a native nested
Expo Router stack with the same SectionWidgets/AppPanel layout as Explore:
Your Personal Chart, Your Predictions and Your Calendar under Your Chart.
Existing own-chart/login and
prediction screen logic moved intact into reusable screen components, with a
Back to My Chart action. Root / redirects to /my-chart; legacy /predictions
redirects to /my-chart/cycles. Sign-in links go directly to the existing personal
chart/login screen. My Account remains the same tab/component, preserving its
independent draft. The calendar does not introduce another login or website UI.

Routes: /my-chart, /my-chart/personal-chart, /my-chart/cycles, /my-chart/calendar.
My Cycles reuses Predictions unchanged apart from its host title (Your Cycles).
Main chart/prediction widgets and their detail modals remain shared with calculators.

## Website and API audit

Inspected backend AGENTS.md, mobile-app-handover.md, mobile-api.md and route list;
the owning code is Views/PersonalChart/_PersonalCalendar.cshtml,
Scripts/k9/personalCalendar.js, PersonalCalendarController, MobileCalendarController
and GoogleCalendarService. No backend files were modified or website started.

The website loads one Gregorian month, Monday first, through GetCalendarEntries.
GoogleCalendarService uses saved birth/current timezones, calculation/calculator/
house/hemisphere preferences and existing batched planner calculations. It reuses
year/month period boundaries, preserves afternoon cycles and chooses full combined
website descriptions. The app never calculates houses, solar boundaries or prose.
Today comes from the server's member timezone, not the phone's timezone.

| Existing API | Mobile use |
| --- | --- |
| GET calendar/month | Current member-local month, with optional year/month (1900–2100) |
| POST calendar/subscription | Explicit Copy Calendar Link action, fresh CSRF; get/create existing private ICS feed |
| POST calendar/revoke | Explicit confirmed disable action, fresh CSRF; revoke existing feed |
| Returned URL | Exact case-sensitive HTTPS feed URL copied through Expo Clipboard |

Calendar GET and subscription creation retain paid/admin restrictions. Revoke
uses existing signed-in ownership rules. No credit-consuming calculate route,
membership change or purchasing is involved. No link is created on load. The feed
still belongs to the website's existing personal-calendar/feed service, including
membership rechecks, saved culture, event IDs and subscription-format prose.

The website's subscription help explains Google Calendar's desktop Other
calendars → From URL flow; the app renders that API help unchanged. It copies the
ICS URL, without opening a website feature or claiming a Google account import.
Google's eventual feed refresh is external and not proven by a successful copy.

## Updated presentation contract

The initial API lacked the website's display metadata. Owner's backend AI added
and documented Native personal calendar presentation while app work continued;
read that authoritative section in ninestar/docs/mobile-api.md. The app now parses
and uses its exact labels.title, previousMonth, nextMonth, today, copyCalendarLink,
disableCalendarLink, copied, copyError, expand, revoked and myAccount where relevant.
Weekday label/shortLabel uses ISO dayOfWeek 1–7, sorted Monday first. Days use
dateLabel, houses and returned artworkId through ArtworkImage/catalogue caching.
Numeric year/month/day/afternoon, individual house labels and other artwork IDs
are retained without guessing or inventing a missing afternoon value.

Older responses keep bundled artwork, ISO identities/numbers, device-formatted
date/weekday fallbacks and central translatable UI copy. Returned API display
strings always take precedence; no energy name or media URL is manufactured.
The hub labels are the owner's explicit mobile wording, centralised in uiCopy;
generic loading, retry and confirmation copy remains translatable there too.
No further backend change is required for the implemented calendar UI. Deployment
and authenticated verification of these new fields are not established here.

## Native behaviour and safety

Shared PersonalCalendar renders previous/next, Today, a Monday-first seven-column
grid, today/selection highlights and selected date/houses/full reading. It retains
only the day-of-month and artwork within each square; year/month/day houses appear
in the selected-day details below (API houses string, numeric triple fallback).
This supersedes the initial three-number line inside grid squares. It retains
an existing selected date in a refreshed month, otherwise picks member-local today
or the first day. Expand Calendar opens the same calendar in AppModal, with shared
selection and month state and no second data request. Owner's later layout request
supersedes the fixed-width horizontally scrolling grid: all seven columns now
fit the available panel width, with square cells (aspectRatio 1), centred 64%-width
artwork and a floating top-left date using shared caption typography and muted
textSecondary colour. No horizontal scroll or minimum grid width. Small phones
necessarily have smaller square targets; existing accessibility labels, hitSlop
and the expanded modal remain available. Dates scale with the OS font setting.
Month arrows disable while a request is pending and at the API bounds.
Square taps reveal details using the host's shared measured scroll context:
useScreenScroll normally, useModalScroll in the expanded view. A changed date
waits for its keyed detail container to lay out before scrolling; tapping the
same date scrolls again. Initial load and automatic selection do not scroll.
The later flush-top refinement explicitly requests zero top inset in both hosts.
AppScreen's opt-in ensureSpace grows the shared content minimum height for short
readings; modal scrolling already supports this. Zero-inset paths measure current
native content height rather than trusting the previous reading's cached height,
and wait for content layout before scrolling when more space is needed. Existing
default 16-point scroll padding elsewhere is unchanged.

Expanded view opts into shared AppModal edgeToEdge (no body padding/gap/width cap)
and AppPanel flush surfaces (square corners, no shadow). Calendar and detail panels
touch directly, using joined on the second panel to avoid a doubled border seam.
Normal-view panel spacing/corners stay unchanged. Date top offset moves from 2 to
0 points; image is translated down 2 points to separate the two. Grey palette and
caption sizing remain shared. Native alignment/appearance checks are pending.
Follow-up lint, typecheck and targeted whitespace checks passed; ignored Expo
route declarations regenerated before typecheck. Next: tap a new day in both
views on iPhone; native scroll-position confirmation remains pending.
Compact-square follow-up: lint, typecheck and targeted whitespace checks passed;
next confirm day/image-only squares and selected-day house details on iPhone.
The subsequent auto-fit/floating-date follow-up uses shared Typography.caption
(12/16) in textSecondary, positioned independently from the centred image.
Final validation is recorded below; native appearance remains to be checked.

My Calendar's feature artwork now uses catalogue ID ui.monthly-planner through
shared FeatureArtwork. Inspected the existing website monthly-planner.png: a gold
calendar icon. It is explicitly registered in MobileArtworkRegistry.Data.cs;
no guessed ID, asset URL or backend change. Initial public Integration catalogue
verification timed out at 15 seconds; one subsequent public check succeeded and
confirmed ui.monthly-planner is present. Device rendering remains to be checked.

Loading/error paths clean up in finally; focus/foreground refetch server-owned
state. A single pending guard prevents overlapping month loads. Previous month
content can remain while loading; access/birth-detail denials clear it. Responses
are rejected across session generations, and calendar/link state remounts on
account changes. No persistent calendar cache, feed URL, token or clipboard reads.
The exact existing 15-second request timeout and cookie/CSRF transport are reused.

Link generation/copy/revoke have their own guard, no automatic POST retry and
session/focus checks. The returned URL is validated as HTTPS on the configured
API origin and feed path, with a nonempty token; its exact bytes are preserved.
It stays in screen memory and clears on blur/account changes. Never log it or
include it in documentation/diagnostics. Android clipboard content is marked
sensitive. Revoke clears the local link even on an uncertain network outcome;
the next explicit copy consults the server again. Never clear the user's clipboard
automatically, which could overwrite unrelated content.

Added SDK-compatible expo-clipboard ~58.0.4 using expo install. SDK 58 documentation
confirms Expo Go includes it. Existing custom development builds need rebuilding
to include newly installed native code; no cloud build or deployment was run.

## Validation and next concrete step

Edge-to-edge/flush-top follow-up: lint, typecheck and targeted whitespace checks
passed; ignored Expo route declarations regenerated before typecheck. No API request,
account draft, authentication, membership or timeout change. First iPhone check:
tap a short day reading in normal view and confirm the detail header reaches the
top; then repeat expanded and check square-corner full-width panels with no gap.

Latest automated results: 145 tests passed, zero failures; lint and typecheck passed.
After the parser type correction, all six targeted calendar tests passed again.
Ignored Expo route declarations were regenerated to clear stale Explore/hub path
errors; no generated type file is committed. iOS Metro export passed: 1,666 modules,
46 assets, JavaScript bundle generated in ignored .expo/calendar-validation. This
is bundle validation, not a signed build, install, deployment or device UI test.
Targeted whitespace check passed. Final lint/typecheck rechecks also passed after
the last small error-message/touch-target cleanup. No automated failures remain.

New fixtures cover complete Gregorian grids,
leap years and month bounds, API artwork/translated labels, optional afternoon,
safe rich text, strict feed-URL validation and exact token-byte preservation.
Transport tests cover read-only months, validation before requests, membership
errors without a free-calendar fallback, fresh CSRF on explicit actions and
session change before POST; the existing timeout/session tests remain applicable.

Read-only anonymous Integration probes, 2026-10-26:

| GET | Result |
| --- | --- |
| calendar/month | 401 authentication_required, application/json |
| calendar/month?year=2026&month=10 | 401 authentication_required, application/json |

No signed-in session was accessed, and no live subscription was created/revoked.
Windows website build/tests and deployment belong to the backend AI/owner.
Authenticated month shape/prose, artwork and Google feed import remain device/
external checks. No claim of end-to-end calendar validation yet.

Next first iPhone check: reload once for changed routes, tap My Chart and confirm
exactly three hub buttons and no separate My Predictions tab. Then, one step at
a time: existing chart/login and My Cycles, My Calendar current month, select a
day/next month/Today, expanded view, copy link and paste privately into Google
Calendar on desktop, and confirmed disable only if the owner wants that test.
Do not share the private link in chat or screenshots. Verify unsaved My Account
edits survive hub/calendar navigation and logout/account switch clears readings.
