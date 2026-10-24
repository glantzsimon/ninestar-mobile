# First mobile chart slice

Home restores the current cookie session through account/shared-entitlement GETs
before the protected own-chart GET. See [shared-entitlements.md](shared-entitlements.md).
If signed out, it displays the login form. A successful login refreshes CSRF,
checks account/me and then loads the chart. No login POST is replayed automatically.
The app stores neither credentials nor chart data on disk.

`GET personal-chart/me` is the full response. Only HTTP 403 with
`membership_required` falls back to `GET personal-chart/me/free`. No client-side
membership prediction grants content. Both routes recheck identity on the server;
no arbitrary person, user ID or new calculation POST is supplied.

The full schema comes from `MobilePersonalChartResponse` and
`MobilePersonalChartMapper.Map`; the free schema comes from `FreeProfile`.
Normalisation in `src/lib/personal-chart.ts` checks the three primary numeric
energies and does not calculate any values or infer missing interpretations.
All settings, birth details, timezone handling, age gates and prose remain server-owned.

## Presentation

Extended Profile is collapsed by default, immediately below Your Core Energies
in a shared stack with the normal 24 px panel gap. It matches the website `_AdditionalEnergies`
order: Day Star, Generational Energy, Epoch Energy (not Hour). Its disclosure
header has the shared optional subtitle Day Star · Generation · Epoch. On open,
compact cards use the same EnergyCard component/artwork/typography as the main
energies. Find out more selects that energy in the single detail area below
the header and summary; extended descriptions no longer expand inside the
header. Numbers-only free responses do not acquire extra interpretations.
Missing optional energies are omitted, with a simple message if none were
returned. No calculation, new API call or backend change is introduced.

Your Summary renders the API's narrative `summary` using shared ReadingContent.
It starts as a short expandable preview above the selected detail, independent of selection.
It matches the website `_CoreEnergies.cshtml` Summary panel, including the
server's adult/child choice. API `overview` is a separate main-energy
Gifts/Challenges traits list and must not replace the narrative. Omit the summary
panel if no summary was returned; do not fabricate text or use the traits list.

The summary title is Your Core Energies, matching the website's Core Energies
resource and `_CoreEnergies.cshtml` panel. Lead with Core, Character and Social
Expression, using the original website energy artwork as the main visual. Each
image already includes the number in its correct colour; do not replace this
with a generic blue numeral. The nine original PNGs are bundled unchanged in
`assets/images/energies` (343,509 bytes total), mapped by number in
`src/constants/energy-artwork.ts`. Use the API's HTTPS image when supplied and
fall back to its matching bundled image on failure or for numbers-only free
responses. No API extension is required for these primary energy images.

Tapping a header energy selects only its corresponding detail below the header
and summary. Changing selection replaces the prior detail rather than mounting
all chart sections. No detail is selected initially. Card selection has shared
visual and accessibility states. The header and summary remain mounted on the
page above the detail, not pinned over the reading viewport. Back to My Energies
buttons above/below details scroll to the header without changing selection.
The new detail is measured after mounting and scrolled into view; reselecting
the current energy scrolls directly to it. No request or calculation is made
on selection. Cards open either server content or its availability message.
All three primary energies have a detail panel. Social Expression is the third;
its card selects its own panel without Core/Character content. The full response
already provides sections.socialExpression. FreeProfile currently omits it;
when a primary reading is missing, show an availability message without adding
an interpretation, copying another energy's prose or bypassing paid access.
All primary panels reuse AppPanel, AppDisclosure, ReadingContent and shared typography;
visual changes belong to those shared components/tokens rather than panel-specific
overrides. Tests cover full Social Expression content and missing/free responses.

`chart-sections.ts` owns section membership matching the website: Core owns
nature/intellectual/emotional/interpersonal, relationships, work/finances/
spirituality and health sections. Character owns childhood/adult-child and all
three stress-response sections, matching `_ProfileStressResponse.cshtml`.
Only the selected energy's groups are mounted, initially collapsed, with
individual readings disclosed inside them. Omit unavailable secondary sections.
Do not return to the
website's many nested tabs. Keep protocol details out of the main account flow;
development connection controls have been removed after device validation.

The app displays authored HTML as inert native blocks using `readingBlocks`;
`readingText` remains the plain-text normaliser. Heading tags become accessible
22 px Candara Bold section titles (for example Gifts, Challenges and Supportive
Strategies), paragraphs use body typography, and bullets are individual rows.
HTML source indentation is collapsed before structural breaks are applied;
plain-text paragraphs and explicit br breaks are preserved. This avoids treating
source newlines as blank visual lines. Blocks have an 8 px gap, with an extra
8 px above subsequent headings, rather than blank lines at the body line-height.
The energy-card action reads Find out more.

PersonalChart accepts a supplied normalized chart and optional title. Reuse it,
ChartDetails and selectChartDetail for future calculator results, rather than
duplicating the selection flow. A new calculator result should remount/key its
chart presentation to reset selection. The calculator itself is not implemented
by this UI change. Existing session generation/own-chart refresh still removes
previous account data before replacing a result.

Paragraphs, bullets and common/numeric entities are preserved. Decorative markup,
embedded media and interactive links are not rendered in this first slice.
There is no WebView or HTML execution. Energy artwork uses HTTPS URLs supplied
by the full response, with the bundled website originals as an offline fallback.

## Session and validation

Refresh clears previous chart content before requesting replacement data. Restore
on cold screen mount, tab focus and return from the background. HTTP 401
clears the chart and shows sign-in. Membership revocation can replace the full
chart with free sections. Other failures show a retry action without stale paid
content. Missing birth details/timezones now link to the in-app My Account screen;
see `mobile-account.md`. Chart data is refreshed on tab focus after account edits.

Tests cover request boundaries, explicit free fallback, rejected/expired sessions,
both response schemas and inert reading text. Lint/typecheck are required.
The owner has verified iPhone login; this chart UI still needs actual iPhone
comparison with the website's own chart, including membership/access variations,
large text and long readings. Android and browser authentication are not validated.

Artwork/navigation change: 45 automated tests pass; lint/typecheck pass. Native
tap-to-expand/scroll, image appearance, VoiceOver and large text still require
iPhone verification. AppScreen now provides its scroll context through an
explicit native content View; other screens keep their existing spacing.

Reading typography/spacing change: 47 tests pass, including indented website
markup, heading/list preservation, CRLF plain text, explicit breaks and inert
script/image content. Device verification should check Gifts and the spacing
between bullets/paragraphs, including larger accessibility text sizes.


Detail topic widgets now select a group and then one reading within it. ChartReading
shows available summary blocks by default and offers View Full Text / View Summary
when distinct versions exist; the two versions are never appended together.
SummaryPreview keeps the original narrative intact behind Read More / Show Less.
Catalogue integration and illustrated facts are gated on backend validation; see
[artwork-backend-validation.md](artwork-backend-validation.md).

