# NineStar mobile design system

Predictions navigation refinement (2026-10-29): the bottom Directionology/Calendar
actions use shared SectionWidgets, including equal-width pairing and the existing
72-point artwork frame. SectionWidgets accepts an optional decorative React icon
in that same frame; this is used for Directionology's arrows because no dedicated
catalogue artwork exists. Do not invent an artwork ID or display labels. Other
menus retain their current catalogue images and alignment. In shared MagicSquare,
the supplied plate is uniformly enlarged until its gold border meets the grid's
outer edge; server arrows use a 1.16x overlay extending beyond both. Digits remain
at API cell centres. Do not distort or alter the source artwork.
Regular prediction cards/details retain energy artwork; square rendering belongs
only to Directionology, whose summary precedes its year/month/day panels.

Submission failures use the shared warning dialog; field errors remain inline
and scroll to the first invalid field. Success and background loading errors
remain contextual. See [submission-error-feedback.md](submission-error-feedback.md).

Shared field validation and native date/time conventions are documented in
[native-input-validation.md](native-input-validation.md). Inputs display their
errors above the control through AppField; AppDateTimeField owns native picker
presentation and date/local-clock string bridging across all form hosts.

The mobile app adapts the existing website's identity. The server remains the
owner of calculations, descriptions and entitlements; these components only
standardise presentation. The website checkout is unchanged.

## Source of truth

Website files under `D:/Workspace/ninestar/webapp/WebApplication`:

- `Content/less/config/colours.less`: brand palette and light/dark variables.
- `Content/sections/account.css`: compiled hex values for LESS colour calculations.
- `Content/less/main/elements.less`: Candara body type, blue headings and generous leading.
- `Content/less/main/style.less`: local Candara font registration and pale wells.
- `Content/less/main/dark.less`: teal panels and light text.
- `Content/less/controls/panel.less`: 8 px corners, tinted headings, borders and soft shadows.
- `Images/company/logo-notext.png`: current gold/blue yin-yang brand mark.
  Bundled unchanged as assets/images/ninestar-mark.png, shared by the chart header
  and all existing navigation/artwork fallbacks. Do not restore the older
  multicolour mark. Origins now uses ui.origins; company.logo-notext remains its
  older-catalogue fallback. See ui-artwork-refresh.md for current UI icon mappings.
  Runtime logo replacement was visually inspected and its SHA-256 verified equal
  to the website asset (517dd2ff186840307da5e7ecaf6435a8921de84e4a221595a598fb88ec414f76).
  Lint, typecheck and whitespace checks passed for this asset-only change; no new
  tests or native build were needed. iPhone header verification remains pending.
  Native launcher icons and splash imagery remain separate build-time template
  assets in app.json; they require their own final branding pass and a new build.

## Tokens

SectionWidgets uses explicit two-card rows with equal flex widths and shared
spacing. An odd final card after paired rows is centred between two half-flex
spacers with half-size gaps, giving exactly the same width as paired cards:
(available width minus the normal column gap) / 2. Single-card menus retain
full width. This applies across every SectionWidgets host; no local margins or
screen-width measurements are needed. Native text scaling and minimum touch
targets are retained. Device visual check remains pending.
Validation: project lint passed, followed by a focused lint check and final
typecheck after the card-width wrapper refinement; whitespace check passed.
No new tests or bundle export for this reversible layout-only adjustment.

Calculator/navigation refinement (2026-10-27): related vertical actions reuse
AppActionGroup with LayoutSpacing.relatedActions = 4 points. Shared AppScreen
uses automatic native scroll insets plus LayoutSpacing.bottomClearance = 4;
Android NativeTabs already applies its bottom safe area, web reserves its own
overlaid bar footprint. AppScrollTarget reuses zero-inset measured scrolling after
mount, including minimum height for short content. Calculator Edit targets Birth
Details, not the page introduction. See calculator-flow-refinement.md for checks.

Modal corners (2026-10-26): Radius.modal is 4 logical points. Shared AppModal
uses a clipped surface inside a transparent overFullScreen native Modal instead
of pageSheet, whose large iOS corner radius is system-controlled. The outer safe
area preserves the top inset; the surface preserves the bottom inset. Slide
entry, fixed Close, Android back, accessibility escape and measured scrolling
remain. Native sheet swipe dismissal is no longer available. This applies to
energy/prediction details and expanded calendar, without altering panel/control
radii. Lint, typecheck and targeted whitespace checks passed. Next: open an energy on iPhone and check corners,
safe-area clearance and Close; native appearance verification remains pending.

Screen margins (2026-10-26): shared AppScreen horizontal padding is now 16
logical points (Spacing.three), reduced from 24 per side. This gives phone
content 16 more points of total width and matches normal AppModal body margins.
Keep panel interior padding at 16, existing vertical spacing, safe-area/tab
clearance, 48-point controls and the 800-point maximum content width. The expanded
calendar's explicit edge-to-edge layout remains unchanged.

Guidance: [Android content composition](https://developer.android.com/design/ui/mobile/guides/layout-and-content/content-structure)
recommends 16 dp margins for compact screens; [Apple layout guidance](https://developer.apple.com/design/human-interface-guidelines/layout)
emphasises safe areas and adaptable, clearly grouped content. The shared 16-point
margin is our design choice across platforms, not an Apple-mandated measurement.
Validation: lint, typecheck and targeted whitespace checks passed. Typecheck
initially found stale generated Expo route declarations; regenerating the ignored
declarations with the installed SDK resolved those errors. iPhone visual review
remains pending. Next: inspect calendar and My Account for comfortable wider content.

Shared AppModal supports opt-in edgeToEdge body layout; shared AppPanel supports
flush square-corner surfaces and joined single-border seams. Expanded calendar
uses these together for adjacent full-width panels. Default card/modal styles
remain unchanged. Shared screen/modal scrolling accepts an optional top inset;
calendar uses zero, with enough measured content space below short details to
align them at the top. Keep this behavior in the shared hosts, not fixed spacers.

Boxed loading states use shared AppLoadingPanel. The existing panel/spinner remain;
message text uses Typography.small (15/23), centred, and theme textSecondary
(#aeaeae in dark mode). Copy comes from central uiCopy, not component literals.
My Chart is the first host. Styling does not affect request deadlines or cleanup.
Validation: lint, typecheck and targeted whitespace checks passed. Ignored Expo
route declarations regenerated before typecheck; native visual check remains on
iPhone. Next: switch back to My Chart and check the loading message.

Shared motion: FadeView uses 180 ms opacity entry and 140 ms exit, with
ReduceMotion.System. Use it for conditional controls/disclosures and reading
mode changes. AppPanel fades in without delaying protected-state removal.
Back to Menu fades in only after scrolling down and fades out at the top.
No new animation dependency; the project already uses Reanimated.
For in-flow visibility, use FadeCollapse: animate measured natural height and
opacity together using the same durations and ReduceMotion.System. Shared modal
return navigation and disclosures use it so neighboring content slides smoothly.
Hidden content remains mounted for measurement/state preservation, but has zero
occupied height, no pointer interaction and no accessibility exposure. Parent
screen/session unmount still removes everything immediately. FadeView remains
for content replacement that does not need occupied-height collapse.

`src/constants/theme.ts` owns semantic light/dark colours, typography, spacing,
corner radii and minimum control height. Components resolve colours through
`useTheme`; do not put separate palettes in screens. The owner's chosen default is
dark blue/teal regardless of device appearance. `DefaultColorScheme` owns this
choice for screens and navigation on native and web. `app.json` requests dark
native appearance and the status bar uses light text. The light palette remains
available for a future theme selector.

| Role | Light | Dark |
| --- | --- | --- |
| Page | `#ffffff` | `#14384a` |
| Panel | `#f9f9f9` | `#091a22` |
| Panel heading | `#f0f8ff` | `#0f2c3a` |
| Text | `#444444` | `#f9f9f9` |
| Heading | `#0a4070` | `#e7e7e7` |
| Primary | `#337ab7` | `#63a0d4` |
| Border | `#dddddd` | `#b8b8b8` |
| Action surface | `#276e93` | `#0f2c3a` |
| Action icon | `#ffffff` | `#ffffff` |

Owner's grey-border trial (2026-10-26): ordinary dark-theme outlines and dividers
use the shared border token #b8b8b8 instead of white. Panels, disclosures, fields,
section widgets, tables and calendar cells inherit it centrally. Focus/selection
and button accents keep the semantic primary colour. Do not hardcode border
colours per screen or change stroke widths for this brightness adjustment.
Calendar planner actions use the semantic action surface, faint action border,
pressed surface and white icon tokens from the theme palettes instead of screen-
local colours.
Validation: lint, typecheck and targeted whitespace checks passed; ignored Expo
route declarations regenerated before typecheck. iPhone appearance review pending.

The website Candara regular, bold and light files are bundled locally in
`assets/fonts`, loaded once with the already-installed `expo-font`. No runtime
font download is needed. Distinct family aliases avoid platform-specific
weight selection. Heading/body/small sizes are 34/17/15, with line heights
42/27/23. Heading styles use Title Case, following the website convention.
Caption typography is shared at 12/16 for compact metadata such as the calendar's
floating date, using textSecondary. Calendar cells auto-fit seven columns with
a square artwork frame plus 2 points of top margin; dates are absolute top-left
overlays. Artwork has a 5-point downward translation inside the frame, retaining
its bottom-relative placement when the cell grows.
My Calendar navigation uses the existing gold ui.monthly-planner catalogue image.

Mobile adaptations: controls are at least 48 px tall, text retains system scaling,
and screens scroll and adjust for the keyboard. Panels use solid colours instead
of website gradients; no extra dependency is required. Dark primary buttons use
dark text against light blue for contrast. Feedback includes text rather than
relying on colour alone. Fonts and mark add roughly 0.6 MB before compression.

## Reusable screen template

Owner confirmed this energy/cycle card style as system-wide on 2026-10-26.
All present and future energy/cycle header widgets, including calculator results,
must use EnergyCards/EnergyCard. Apply style changes centrally so every host
updates together. Screens supply their API content and influence rank; they do
not introduce alternate card layouts or duplicate the control. This standard
applies to this card family; panels, forms and other distinct controls retain
their own shared components.

Header energy lists use shared EnergyCards and EnergyCard, including My Chart,
My Predictions and calculator results. Source audit: website
Content/less/sections/ninestar.less sets normal/medium/small images to 100/62/38%
and very-small to 24%; PersonalChart core roles use normal/medium/small and
additional roles use medium/small/very-small. Predictions uses the same classes.

Mobile EnergyInfluenceScale gently adapts primary to 100/78/60% and additional
to 72/60/50% of a shared base size. Rank belongs to the role/period's original
position, even if another item is absent. Typography and tap targets never scale
with influence. Keep the list vertical, one full-width card per row, at every
screen/font size. Charts and Predictions both use the exact same image-beside-text
EnergyCard, with an 80 px image base. A fixed image-column frame per group keeps
text aligned while artwork shrinks. There is no separate stacked Predictions
variant or separate sizing. Additional artwork stays smaller
than the equivalent primary rank. Text wraps/scales normally without truncation.
The earlier responsive three-column grid changed more than the owner requested
and has been removed; do not reintroduce it when adjusting influence ratios.

Within the shared row's text column, show the chart's existing API role and
name/element, or Predictions labels.cycleTitles[period], reading.houseName and
primary cycleDescriptiveName/free title. Harvest / Abundance and Celebration
is the reading caption, never the period title. Prediction
group labels come from labels.groups; navigation/modal titles from labels.periods
and scope titles from labels.scopes, separate from long explanatory help titles.
Missing older fields stay absent, never rebuilt from English or full energy
titles. The documented additions are client-ready but pending backend deployment
verification. Whole cards remain buttons with shared VoiceOver labels/hints,
right-aligned chevron, spacing, fonts and press/selection styling. The owner's
latest requirement for identical controls supersedes the earlier centered
cycle-image/caption layout. Only content differs between domains.

`ContextualHelp` renders API-owned section introductions above their widgets.
It uses AppPanel and rich ReadingContent, with up to three preview lines and a
themed gradient fading the bottom edge. Full rich blocks expand/collapse through
measured-height/opacity animation with OS Reduce Motion respected. Current
consumers are help.core and help.relationships. Omit unavailable help gracefully.
Back to Menu targets the registered button grid below help, and disappears above
that grid rather than requiring the user to reach the help at absolute scroll top.

```tsx
<AppScreen>
  <ThemedText type="title">Screen Title</ThemedText>
  <AppPanel title="Section Heading">
    <ThemedText>Body content</ThemedText>
    <AppInput label="Field label" value={value} onChangeText={setValue} />
    <AppButton title="Continue" onPress={handleContinue} />
  </AppPanel>
</AppScreen>
```

- `AppScreen`: safe areas, scroll, keyboard behaviour, content width and spacing.
- `AppPanel`: bordered surface, optional tinted heading and consistent padding.
  Panel titles use shared `sectionTitle` typography (22/28 px Candara Bold),
  matching authored section headings at a medium size below modal titles.
  Its optional headerAction is a compact right-aligned control with a 48 px
  touch target. Use it for panel-level actions such as summary/full-text mode;
  the header wraps on narrow screens or with enlarged text.
  Optional action icons use bundled monochrome SVGs tinted with the primary
  colour: magnifier-plus for full text, short document for summary. Keep visible
  labels and hide decorative icons from assistive technology.
- `EnergyCard`: shared artwork, labels, contextual hints and optional detail
  action for core and extended profile energies. Its compact variant uses 56 px
  artwork instead of 80 px, with the same shared colours/type/spacing tokens.
  Selected cards share an accent border/background and selected accessibility
  state. Chart header cards open their reading in the shared AppModal sheet;
  reuse these cards for profile calculator results.
- `EnergyBanner`: full-width rounded section-widget surface with energy artwork
  and the exact API full title in shared sectionTitle typography. Display before
  section buttons on every primary/extended energy screen with standard gaps.
  It has no button action; images use the existing shared artwork fallbacks.
- `EnergyFacts`: reusable element-info widget. Five available symbols share one
  equal-column row, with artwork scaling to column width; labels/values wrap.
  Its fact table is a collapsed More Details disclosure below the symbols,
  inside the same panel. Reuse for profile calculator and other energy details.
- `SectionWidgets`: large rounded buttons with catalogue artwork inside the
  touch target above centred text. Selected/pressed surfaces use shared theme
  tokens. Every modal starts with buttons only. Core uses the flat ten-button
  menu documented in core-navigation.md, with no intermediate submenu. AppModal exposes a shared
  measured scroll context for revealing the selected reading within its sheet.
  Cards top-align their fixed-size artwork so labels of different lengths do
  not shift image positions. Labels sit beneath with a 16 px gap and tighter
  20 px line height; this treatment is shared by all section-widget consumers.
- `AppModal`: themed, safe-area-aware detail sheet with fixed title and Close
  control. Headers use the shared 28/36 px Candara Bold `modalTitle` role and
  the darker `backgroundElement` surface above the accent divider, including
  the safe-area surround; scrolling content retains the teal page background.
  The header treatment applies to all shared modals, including calculator reuse.
  Titles stay left aligned, with Close on the right, following the owner's
  preferred header layout.
  It has independent vertical scrolling. Reuse it for chart/calculator
  details and full summaries. Optional backToTopLabel adds fixed navigation beneath the title,
  returning to the round section buttons without resetting selected content.
  Show this control only while the modal is scrolled more than 24 px down;
  hide it at the top, including after using it to return.
  Keep subsection navigation inside one sheet.
  Scroll-to-target reserves sufficient trailing space through measured content
  minHeight (target offset plus viewport height), so even short panels reach
  the top below fixed navigation. The modal waits for layout before scrolling;
  consumers target the detail itself, excluding any submenu buttons.
- `AppDisclosure`: optional subtitle explains the content before opening; it
  starts collapsed unless defaultExpanded or explicitly controlled. Its heading
  uses the same sectionTitle role as AppPanel. Extended Profile starts expanded,
  without a subtitle, after Your Summary on the main chart. Related panels can share an
  8 px stack gap when appropriate; Core Energies and Extended Profile use the normal 24 px panel gap.
- `AppButton`: primary/secondary, pressed, disabled and loading states.
- `AppInput`: visible and accessible label, focus border, theme and ref forwarding.
  Single-line inputs use the body font/size without paragraph line-height,
  letting native text centre vertically inside the minimum 48 px control.
  Android font padding is disabled; multiline inputs retain paragraph spacing
  and align at the top. Font scaling and balanced vertical padding remain enabled.
- `ThemedText`: shared typography and semantic text colours.
  `sectionTitle` is a 22/28 px Candara Bold heading, used for authored reading
  headings with the header accessibility role. `ReadingContent` renders safe
  native heading/paragraph/bullet blocks with compact, explicit spacing.
  ReadingContent preserves inline strong/b emphasis as nested Candara Bold Text
  at the surrounding body size/leading. Use the shared parser/renderer rather
  than stripping bold locally or rendering executable HTML. Rich summary
  previews clip spans together with text; see reading-formatting-validation.md.
- `AppSelect`: selected values use the same 16 px horizontal inset as text inputs,
  including Yes/No fields, enum selectors and timezone selectors.

Keep non-route components outside `src/app`. Use shared components when adding
account, chart and prediction screens. Keep new copy together for localisation.
The Style Guide screen (`src/app/style-guide.tsx`) is a retained development reference,
hidden from the main navigation after UI cleanup. It shows palette,
typography, editable input, buttons and feedback. Home uses the same components
for login and chart reading. Main navigation contains Explore, My Chart, My Predictions and My Account;
development connection controls and the starter web Docs link are removed.
No backend/authentication contract
was changed by the visual work.

## Validation

Chevron follow-up (2026-10-26): interactive EnergyCard now uses existing SDK 58
expo-symbols SF/Material chevron.right/chevron_right, theme primary tint, 20 px,
vertically centred at the far right. Removed the extra Find out more line and
unused actionLabel/copy. The text column remains flexible; artwork sizes, card
minimum touch heights and entire-card onPress remain unchanged. Decorative icon
has no pointer events and is hidden from accessibility; parent label/hint remains.
No new dependency. Pending iPhone check: right/centre alignment on long-caption
Predictions and shorter Chart cards, preserved tappability and reduced height.
Validation: lint, typecheck and targeted whitespace check passed. This is a
presentation-only change; no new mirror-of-implementation tests were added.
Native positioning and VoiceOver still need the owner/device check.

Shared-control correction (2026-10-26): removed the stacked card branch and
Predictions-specific image base. Lint, typecheck and targeted whitespace check
passed; no remaining stacked/112 px variant exists in the shared card controls.
This changes presentation only, so no new implementation-mirroring tests were
added. API/parser/session behavior is unchanged. Pending iPhone check: compare
My Chart and My Predictions row layout, artwork tiers and shared action styling.

Vertical-list correction (2026-10-26): lint, typecheck and targeted whitespace
check passed. No API/parser/session changes; no new tests were added for this
layout-only correction. The earlier three-column geometry check below is
superseded. Pending owner iPhone check: Profile energies/Extended Profile show
one full-width row per energy, image beside text, with descending artwork sizes.
Prediction card contents retain their requested order within a vertical list.

Influence hierarchy follow-up (2026-10-26): all 129 automated tests passed;
lint, typecheck and targeted whitespace check passed. The Windows development
watcher initially generated stale route types again; regenerating ignored types
with the installed SDK generator restored the correct routes before the passing
typecheck. No dependency or API changes. Existing tests verify data/access/HTML
behavior, not native geometry. Pending iPhone check: three-column primary image
hierarchy and smaller descending additional images, then large-text/narrow-layout
fallback, header alignment and card/modal interaction. Exact cycle labels and
House caption were transport gaps during that layout check; the subsequent
documented labels/houseName additions are now consumed by the client, with
Integration deployment verification pending. See my-predictions.md.

Run lint and typecheck for changes. Review Home and Style Guide on the iPhone in
the default dark appearance, including large text, keyboard navigation and password
entry. Native font rendering, VoiceOver and Android need device verification;
browser rendering does not establish native parity. Native launch icons and
splash configuration remain a separate task from this in-app template.
