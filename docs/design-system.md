# NineStar mobile design system

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
- `Images/company/logo-notext.png`: original multicolour yin-yang brand mark.

## Tokens

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
| Border | `#dddddd` | `#ffffff` |

The website Candara regular, bold and light files are bundled locally in
`assets/fonts`, loaded once with the already-installed `expo-font`. No runtime
font download is needed. Distinct family aliases avoid platform-specific
weight selection. Heading/body/small sizes are 34/17/15, with line heights
42/27/23. Heading styles use Title Case, following the website convention.

Mobile adaptations: controls are at least 48 px tall, text retains system scaling,
and screens scroll and adjust for the keyboard. Panels use solid colours instead
of website gradients; no extra dependency is required. Dark primary buttons use
dark text against light blue for contrast. Feedback includes text rather than
relying on colour alone. Fonts and mark add roughly 0.6 MB before compression.

## Reusable screen template

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
  starts collapsed unless explicitly controlled. Related panels can share an
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
- `AppSelect`: selected values use the same 16 px horizontal inset as text inputs,
  including Yes/No fields, enum selectors and timezone selectors.

Keep non-route components outside `src/app`. Use shared components when adding
account, chart and prediction screens. Keep new copy together for localisation.
The Style Guide screen (`src/app/explore.tsx`) is a retained development reference,
hidden from the main navigation after UI cleanup. It shows palette,
typography, editable input, buttons and feedback. Home uses the same components
for login and chart reading. Main navigation contains My Chart and My Account;
development connection controls and the starter web Docs link are removed.
No backend/authentication contract
was changed by the visual work.

## Validation

Run lint and typecheck for changes. Review Home and Style Guide on the iPhone in
the default dark appearance, including large text, keyboard navigation and password
entry. Native font rendering, VoiceOver and Android need device verification;
browser rendering does not establish native parity. Native launch icons and
splash configuration remain a separate task from this in-app template.
