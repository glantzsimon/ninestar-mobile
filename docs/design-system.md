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
- `EnergyCard`: shared artwork, labels, contextual hints and optional detail
  action for core and extended profile energies. Its compact variant uses 56 px
  artwork instead of 80 px, with the same shared colours/type/spacing tokens.
  Selected cards share an accent border/background and selected accessibility
  state. Chart header cards select one detail area; they do not reveal a full
  page of all energies' readings.
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
