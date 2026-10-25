This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Documentation continuity

Login persistence uses the existing account/login rememberMe flag via the user's Stay signed in choice (default on), not app-stored passwords or cached entitlements. Preserve CSRF/session generation protections and the 15-second timeout. OS password-manager autofill belongs to platform field hints and standalone website/app associations; do not invent app IDs/signing identities or claim Expo Go validates domain association. See docs/login-persistence.md for device checks and remaining configuration.

Before switching to production, explicitly remind the owner that Integration URLs lose the `int.` prefix: `https://int.9starkiastrology.com` becomes `https://9starkiastrology.com` for API and media. Follow `docs/production-switch.md`; do not switch URLs prematurely or assume returned catalogue URLs have changed. Keep environment caches isolated and verify production responses/media before release.

Do not invent or paraphrase website section/category names (for example, “Stress and Balance” or “Childhood and Growth”). Use the website's exact Dictionary-backed API label where exposed; flag missing labels for discussion rather than introducing a new category or replacement wording.

Read `docs/request-tracker.md` at the start of relevant work. Keep the owner's suggestions, requested changes and unresolved questions there with status, supporting document and next concrete step. Update it as requests arrive or are resolved; do not silently drop requests, mark unverified work verified, or revive superseded preferences. Record lasting conventions here and detailed evidence in the relevant report. Never store credentials or tokens in the tracker.

Use API-provided Dictionary-backed display titles/content whenever available; never derive labels by formatting JSON keys. Main chart/profile energy cards and modal titles use response help titles (core is Dictionary.MainEnergyLabel), with only API energy names as older-response fallback. Flag missing backend labels before proposing contract additions. Keep any necessary mobile/offline wording in central translatable resources (initial touched copy is src/lib/ui-copy.ts), not new component literals. See docs/localisation.md for remaining legacy wording and API gaps.

Keep documentation current as work proceeds. Record lasting app conventions in this file; app-specific decisions, implementation progress and outstanding work belong in `docs/`. Update the relevant validation report with exact results, verification limits, unresolved blockers and the next concrete step. Distinguish proposed, implemented and verified behavior, and replace superseded guidance rather than leaving contradictory current instructions. Never record credentials, authentication tokens or session cookies.

The shared API contract remains authoritative in `D:/Workspace/ninestar/docs/mobile-api.md`. Keep app consumption notes here, and flag proposed contract changes to the owner before implementing them; do not silently redefine the backend contract in mobile documentation.

Public artwork uses the shared per-environment catalogue store and ArtworkImage resolver; see `docs/artwork-integration.md`. Use returned domain artwork IDs and exact revision-bearing catalogue URLs, choosing dark/default variants without constructing paths. Download visible images on demand with shared URL cache keys. Preserve legacy/bundled fallbacks and last-good catalogue on failure. Artwork is account-independent and must never mutate session, entitlements or account drafts.

Reuse EnergyFacts as the element-info widget for chart/calculator details: Energy, Yin/Yang, Element, Group and Trigram form one ordered row of equal-width columns with proportional square artwork. Labels/values may wrap without splitting symbols into multiple rows. The fact table is a collapsed More Details disclosure directly beneath, inside the same owning panel. Omit unavailable server facts rather than inferring them.

Full and free chart overview metadata supplies nine table display strings, including the six additive fields documented in docs/energy-metadata-validation.md. Read free table facts only from the allowlisted energies projection; keep paid prose and symbol fields separate. Combination strings are server-authored display values, not arrays or client compatibility calculations. Older responses may omit rows. The free projection's four extra symbol labels/artwork references remain a separate API gap.

SectionWidgets are large rounded pressable cards with artwork above centred text. Every energy modal starts with buttons only and no selected detail. Core uses the flat ten-button menu below; other energies use their own sections. Use shared AppModal measured scrolling; reuse widgets for calculator results without stacked modals.

## NineStar visual system

Character's primary reading uses the shared Essence label/icon for both its round button and selected reading-panel header, matching Core. This supersedes the previous API energy-title requirement for that panel header only; retain the full API title in EnergyBanner.

Character navigation uses optional data.sections titles for childNature, adultChildRelationship and stressResponse; omit missing-title items without invented wording. Explicit owner exception: the primary Character reading button and panel header use Essence with the same shared resource/icon as Core, while its API navigation title remains parsed. Place Character help above the energy banner/menu, matching Core; keep help.character.title as its introduction title and energies.character.title in the energy banner. Combine the three stress bodies in contract order under one Stress Response item/panel, never three navigation buttons. See docs/character-navigation-validation.md.

Stars background now uses the owner's portrait stars-bg-mobile.mp4 (720x1280), bundled video-only with a matching extracted poster. Use minimum cover scaling, horizontal centre and bottom alignment through AppBackground. This supersedes the unsuccessful landscape contain/cover experiments; see docs/video-background-validation.md.

AppScreen and chart AppModal bodies share AppBackground: muted looping portrait stars video under a 75% darkest-teal overlay, with a matching bundled poster. Only focused, active screens play; reduced motion uses the static image. Use the bundled H.264/yuv420p mobile asset. Keep decorative media separate from authentication, account drafts and API deadlines. See docs/video-background-validation.md.

All energy detail screens use shared EnergyBanner before round section buttons, after any introductory help. Use the API energies[role].title verbatim and the existing catalogue/legacy/bundled artwork chain. Full-width rounded surface and spacing match shared widgets. Do not manufacture a missing full title from numbers/labels; flag a missing free-projection title for the backend. Reuse for calculator details.

Your Summary uses the same ContextualHelp expandable-rich-text widget as help panels (three-line faded preview, tap/header action, in-place expansion). Its content stays the personalised API summary; do not open a separate summary modal or substitute a generic help introduction.

Shared main chart/profile presentation order is energies, summary, Extended Profile. Extended Profile starts expanded, with no subtitle and the same sectionTitle heading style as normal panels; AppDisclosure's defaultExpanded supports this without changing its general collapsed default. Keep UI guidance in central translation resources pending API labels.

Health detail uses full chart data only and preserves website order: health reading, common challenges, expansion/contraction group, strong organs, weak organs. Use API organ-panel titles and organ.label for display; value is an identifier, artworkId goes through the shared resolver. Never infer organ names/selections from enums or free energy numbers. HTML is inert rich native text in theme colour. Missing old-server fields are omitted. See docs/health-api-review.md for deployment checks and remaining private-response verification.

Expandable contextual-help panels toggle from either the header Read More/Show Less action or a tap on the text body. Keep both paths on the same state/animation and expose expanded state/accessibility labels. Body tapping must coexist with scrolling; do not wrap forms or independent nested controls in toggle touch targets.

Section introductions use response-level help entries (title/htmlBody/culture), parsed through the shared safe reading renderer and kept separate from personalised/paid readings. ContextualHelp previews three lines with a bottom gradient and smoothly expands to full rich text. Missing help omits the panel, never changes access. Core card/modal titles use help.core.title (Constitution); Relationships uses help.relationships at its section top when supplied and age-eligible. See docs/contextual-help.md.

Preserve server-authored strong/b inline emphasis through readingBlocks spans and shared ReadingContent native Text using Candara Bold at inherited body size/leading. Keep plain text alongside spans for existing consumers, clip both in summary previews, and never execute arbitrary HTML or introduce a WebView for reading formatting. See docs/reading-formatting-validation.md.

For in-flow content appearing/disappearing, use shared FadeCollapse so opacity and occupied height animate together; surrounding UI must slide smoothly rather than jump after a fade. Back to Menu and AppDisclosure use this by default. Hidden content is noninteractive and hidden from accessibility; measurement content remains mounted until its owning screen unmounts. Respect OS Reduce Motion, and never delay clearing account/session state for animation.

Shared modal scroll-to-section behavior must top-align short and long detail panels alike. AppModal measures its viewport and selected target and extends content minimum height with empty space below as needed, waiting for content layout before scrolling. Target the actual detail panel, excluding submenu buttons. Do not add screen-specific fixed bottom spacers. Back to Menu returns to the button grid without resetting content.

Core uses one flat menu in exactly this order: Overview, Essence, Intellectual Qualities, Interpersonal Qualities, Emotional Landscape, Relationships, Career, Finances, Health, Spirituality. Do not add The Pioneer/energy-title category or an intermediate Core submenu. Preserve website UI icons, server-owned readings and relationship age gates. See docs/core-navigation.md for API gaps.

Appearing/disappearing UI uses shared FadeView transitions (180 ms in, 140 ms out), respecting OS Reduce Motion. Apply through shared components rather than per-screen animation values. Panels fade in; disclosures, reading-mode content and scroll navigation fade in/out. Do not delay clearing protected/account state to animate it away.

Energy detail modals register the round button grid with AppModal. Back to Menu scrolls to that measured grid, below introductory help, and fades/collapses away when scrolling above the grid's first row (24 px tolerance). Do not use absolute scroll zero when help is above the menu. Keep the selected reading/full-text mode; reuse this navigation for calculator details.

Apply visual changes through shared components, typography and spacing tokens so they remain consistent across screens. Avoid local styling exceptions for headings, body text, inputs or panels when the same role exists elsewhere. Primary chart energies must each have a corresponding detail panel; unavailable server readings need an honest availability message, never invented interpretation or bypassed membership checks.

For subscription work, read `docs/app-subscriptions.md` and the authoritative shared contract in `D:/Workspace/ninestar/docs/mobile-api.md`. The owner's final direction is one existing account with shared website/app membership access and separate billing-provider records; the app-only identity proposal is superseded. Backend implementation belongs to the website chat. Never trust a client-paid flag, calculate access from local expiry dates, or fulfil Apple purchases through legacy methods that terminate website memberships. Keep proposed endpoints/product policies distinct from implemented support.

Mobile UX should be simpler than the expert website: lead with the user's own chart and three main energies, group related readings, and reveal detail through accessible disclosures. Read `docs/mobile-chart.md` before chart/auth changes; use server-owned own-chart routes and preserve full/free access checks. Keep connection diagnostics out of the main reading flow.

Keep My Chart high level: header energy widgets open details in one closable, vertically scrolling AppModal sheet, never an inline reading below the chart. Keep the title and Close control outside the scrolling content. Navigate subsections inside the same sheet rather than stacking modals; default to summaries with optional full text. Your Summary expands in place using the shared help-style widget. Closing preserves the underlying chart position and disclosures. Reuse PersonalChart, EnergyCard, ChartDetails, AppModal and chart-sections ownership for future profile calculator results; do not build duplicate widgets or infer missing server readings.

Read `docs/mobile-account.md` for My Account. Prefill server-saved values, use metadata enum/timezone choices, retain independent birth/current zones and all calculation flags, and never invent missing saved preferences. Account saves are explicit CSRF-protected POSTs; uncertain outcomes require read-back before another save. Birth dates stay date-only and birth times stay separate. Missing chart details link to My Account in the app.

Read `docs/design-system.md` before UI work. Reuse semantic tokens in `src/constants/theme.ts` and `AppScreen`, `AppPanel`, `AppButton`, `AppInput`, and `ThemedText`. The local Candara faces and original NineStar mark come from the website checkout; load fonts centrally in the root layout. Default to the owner's chosen dark blue/teal theme through the shared colour-scheme hook, preserve scalable text and 48 px controls, and keep the Style Guide tab current. Keep the website unchanged when adapting its design for mobile.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md
