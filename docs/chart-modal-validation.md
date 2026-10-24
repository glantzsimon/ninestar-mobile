# Chart detail modal validation

Latest motion refinement: Back to Menu and all shared disclosures now animate
occupied height and opacity together via FadeCollapse. Content moves continuously
as the control collapses/expands; no end-of-fade unmount causes a layout jump.
Natural content remains mounted for measurement; hidden content cannot receive
pointer or accessibility focus. OS Reduce Motion is respected. Next iPhone check:
scroll back to the menu and verify the return control fades while the content
slides upward, then test More Details expansion/collapse. Device validation pending.
Lint and typecheck passed after the shared FadeCollapse change.

Current Core navigation supersedes the earlier six-category hierarchy below:
one flat ten-button menu in the owner's exact order (see core-navigation.md).
No The Pioneer level or intermediate Core submenu. Four targeted menu/access/
content tests, lint and typecheck passed. Next concrete step: reopen Core on
 iPhone, check order/icons and select Overview directly. No API or membership
change; missing free metadata/readings remain unresolved backend limitations.


My Chart remains a high-level view of Core Energies, collapsed Extended Profile
and a narrative summary preview. Energy cards and summary Read More open one
closable scrollable AppModal. ChartDetails retains existing topic widgets,
energy facts, availability messages and summary/full-text selection inside it.
The fixed title and Close control remain above the scroll area. iOS uses a
page sheet with swipe dismissal; Android Back uses onRequestClose. Closing
unmounts detail and resets selection; underlying chart/disclosure state remains.

PersonalChart, EnergyCard, ChartDetails, chart-sections and AppModal are shared
building blocks for the future profile calculator; no separate calculator UI
or navigation/data flow was introduced. No API contract, request timeout,
authentication, entitlements, artwork caching or account draft code changed.
No dependencies, migrations, deployment or purchasing changes.

Automated verification: 71 existing tests pass, Expo lint passes and TypeScript
noEmit passes. These checks cover existing data ownership/fallback/access logic
and static correctness, not device gestures or visual modal behavior.

No known implementation blocker. Device validation is pending. Next concrete
step: on iPhone, tap Core, scroll within the sheet, then Close and confirm the
chart remains at its prior position without an inline reading. Follow with
Character/Social/Extended Profile, summary Read More, swipe dismissal, larger
text and VoiceOver. Every modal now reopens with only section buttons and no
selected overview or reading; readings start in summary mode when opened.

Header refinement: all AppModal headers now share 28/36 px Candara Bold
modalTitle typography and a darker backgroundElement surface above the accent
divider. Teal remains behind scrolling content. Next iPhone check: open Core
and confirm the title/header contrast, then check a longer title with larger
system text. This is a shared visual change with no new behavior or API contract.
Modal titles remain left aligned with Close on the right; the owner preferred
this layout after trying centred titles. Verify long-title wrapping on iPhone.

Reading mode now uses AppPanel's shared right-aligned headerAction rather than
a button in the body. ChartReading owns its panel and mode, resetting to summary
when the selected reading changes. Next iPhone check: open Core and toggle View
Full Text / View Summary in the Essence panel header; check narrow/large-text
wrapping and that only one version appears. Static checks and existing reading
mode tests passed (5/5), along with lint and typecheck; device appearance remains pending.

Core overview refinement: shared panel titles use medium 22/28 px Candara Bold.
Overview (formerly Energy at a Glance) is now a rounded image button, not an
initially open panel. Tapping it shows the element-info panel below the buttons
and scrolls to it; selecting a reading replaces that overview panel.
The reusable EnergyFacts element-info view has one ordered row of equal-width
symbols (Energy, Yin/Yang, Element, Group, Trigram when supplied). Square artwork
scales proportionally to the available width; aligned label/value rows wrap text
without moving symbols to a second row. A collapsed More Details disclosure
directly beneath reveals the bordered two-column fact table within the same
panel. Energy artwork retains bundled/legacy fallbacks, including free charts.
Missing server facts are omitted. Additional screenshot rows still need proposed
API fields agreed with the backend owner: season text, internal representation,
physiognomy, primary attributes, harmonious/challenging combinations. No contract
or backend change is implemented. Next concrete step: check Core's initial panel
and title size on iPhone, then agree those API additions if all rows are wanted.
Lint and typecheck passed after this overview/panel-title refinement. Device
visual verification remains pending; no new calculations or request paths added.
The subsequent single-row/scaling and collapsed-table refinement also passed
lint and typecheck. Next iPhone check: confirm all five available symbols remain
on one row, then expand More Details within the same panel; check landscape too.

Core section-card refinement: SectionWidgets now contains image and label in
one large rounded Pressable (image first, centred text beneath). Available
Essence, Intellectual Qualities, Interpersonal Qualities and Emotional Landscape
are direct selectors after Overview, followed by existing topic groups. No missing reading is
fabricated. One selected overview or reading is mounted below the buttons.
AppModal provides measured scroll-to-target after reading layout, including
reselecting the same card. The fixed modal Close header remains visible.
Lint, typecheck and 9 targeted section-ownership/reading-mode tests passed.
Device scroll/visual behavior remains pending. Next device step: tap Intellectual Qualities in Core, verify
the correct reading scrolls into view without a new modal, then test the other
three cards and full-text toggle. Calculator reuse uses the same components.

## Confirmed free-response limitation: only energy-number artwork visible

Short-section positioning: AppModal now measures viewport/target position and
extends content minimum height so a short panel can reach the top, waiting for
content-size layout before scrollTo. Core targets the actual reading/overview
panel below its submenu, rather than scrolling to the submenu container.
This shared behavior applies to other energy modals and calculator reuse without
fixed per-screen spacers. Next iPhone check: Core → energy-title → Overview;
confirm Overview aligns below fixed navigation with menus above the viewport,
then compare a long reading, Back to Menu and landscape/larger text.
Lint and typecheck passed; native measurement/scroll alignment is pending the
iPhone check above. No API, entitlement, account or timeout code changed.

Core main-menu correction implemented: six website categories with matching
English text and energy/UI images; Overview and nature cards moved inside the
energy-title category. Existing response content is reused. Free missing content
gets an availability message; explicit under-sixteen flag hides Relationships.
Typecheck passed. See core-navigation.md for scope, source mapping and next
iPhone check. No backend contract/membership change.
All 75 tests, lint and typecheck passed after this correction.

Latest motion/navigation refinement: visible return label is Back to Menu.
Shared FadeView supplies 180 ms entry/140 ms exit with OS Reduce Motion respected.
Return navigation and disclosures fade in/out; reading modes crossfade through
keyed content, and shared panels fade in. No delayed session/account-state reset.
Next iPhone check: scroll down/up in Core and verify the label/fade, toggle full
text and More Details, then repeat with iOS Reduce Motion enabled. Device motion
and exit-layout behavior remain pending validation.
Lint and typecheck passed after these shared transition changes.

Return-control visibility: AppModal now tracks its scroll offset and shows
backToTopLabel navigation only beyond 24 px. It is absent initially and hides
when returning to the top, including manual scrolling. No label change in this
step. Next iPhone check: open a detail, confirm the button appears after scrolling
down and disappears after tapping it or manually scrolling back to the top.
Lint and typecheck passed; device scroll/visibility behavior remains pending.

Reading header icon refinement: View Full Text uses a magnifier-plus icon and
View Summary a short-document icon, rendered through shared AppPanel headerAction.
Visible/accessible labels remain; SVG artwork is bundled with no new dependency.
Next iPhone check: toggle reading modes and verify both icons, tint and alignment.
Lint and typecheck passed; device appearance remains pending.

Back-to-sections navigation: energy AppModal provides a fixed Back to Sections
control below its title/Close row. It scrolls its own content to zero, revealing
the rounded buttons without clearing detail or reading mode. Summary modals do
not have this section-specific control. Next device check: open Essence, scroll
a long reading and tap Back to Sections; confirm the buttons return and Close
still dismisses the sheet. No API change or new dependency.
Lint and typecheck passed; device scrolling validation remains pending.

Buttons-only refinement: Overview replaces the former Energy at a Glance name
and uses ui.overview artwork. No panel opens until a button is selected; Overview
then uses the same measured scroll path as readings. Incomplete metadata displays
a brief availability message. Typecheck passed; next device step is to open Core,
confirm buttons-only initial state, then tap Overview. All five symbol data points
still require the agreed free-response API addition described below.

Section-widget alignment refinement: cards now top-align artwork, use a 16 px
image-to-label gap and 20 px label line height. Next device check: compare the
four Core buttons with one- and two-line labels; image tops should match.
Lint and typecheck passed for this refinement; iPhone visual validation pending.

The owner reports only the number 3 image in Energy at a Glance. Source review
confirms full Energy DTOs contain the four additional symbol labels/artwork IDs,
which the app parser retains. FreeProfile instead returns numbers and limited
reading sections, with no Energy DTOs; this renders only bundled energy artwork.
The owner confirmed the free-chart access notice on My Chart. That confirms the
free response is active, explaining absent symbol metadata. Next concrete step:
agree a narrow metadata-only free-response projection with the backend owner,
including Yin/Yang, Element, Group, Trigram, basic fact labels and returned artwork
IDs while preserving the existing paid prose boundary. This is a proposed API
addition, not implemented support; keep its agreed contract in backend mobile-api.md.
Do not collect credentials,
infer missing facts from numbers, change memberships or bypass full/free policy.
If free-chart basic symbols are desired, propose a narrow metadata-only API
projection before implementation; full Energy DTOs also contain paid prose and
must not simply be reused for the free endpoint. No API change made here.
