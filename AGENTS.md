This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Documentation continuity

Keep documentation current as work proceeds. Record lasting app conventions in this file; app-specific decisions, implementation progress and outstanding work belong in `docs/`. Update the relevant validation report with exact results, verification limits, unresolved blockers and the next concrete step. Distinguish proposed, implemented and verified behavior, and replace superseded guidance rather than leaving contradictory current instructions. Never record credentials, authentication tokens or session cookies.

The shared API contract remains authoritative in `D:/Workspace/ninestar/docs/mobile-api.md`. Keep app consumption notes here, and flag proposed contract changes to the owner before implementing them; do not silently redefine the backend contract in mobile documentation.

Public artwork uses the shared per-environment catalogue store and ArtworkImage resolver; see `docs/artwork-integration.md`. Use returned domain artwork IDs and exact revision-bearing catalogue URLs, choosing dark/default variants without constructing paths. Download visible images on demand with shared URL cache keys. Preserve legacy/bundled fallbacks and last-good catalogue on failure. Artwork is account-independent and must never mutate session, entitlements or account drafts.

Reuse EnergyFacts as the element-info widget for chart/calculator details: Energy, Yin/Yang, Element, Group and Trigram form one ordered row of equal-width columns with proportional square artwork. Labels/values may wrap without splitting symbols into multiple rows. The fact table is a collapsed More Details disclosure directly beneath, inside the same owning panel. Omit unavailable server facts rather than inferring them.

SectionWidgets are large rounded pressable cards with artwork above centred text. Every energy modal starts with buttons only and no selected detail. Core uses the flat ten-button menu below; other energies use their own sections. Use shared AppModal measured scrolling; reuse widgets for calculator results without stacked modals.

## NineStar visual system

For in-flow content appearing/disappearing, use shared FadeCollapse so opacity and occupied height animate together; surrounding UI must slide smoothly rather than jump after a fade. Back to Menu and AppDisclosure use this by default. Hidden content is noninteractive and hidden from accessibility; measurement content remains mounted until its owning screen unmounts. Respect OS Reduce Motion, and never delay clearing account/session state for animation.

Shared modal scroll-to-section behavior must top-align short and long detail panels alike. AppModal measures its viewport and selected target and extends content minimum height with empty space below as needed, waiting for content layout before scrolling. Target the actual detail panel, excluding submenu buttons. Do not add screen-specific fixed bottom spacers. Back to Menu returns to the button grid without resetting content.

Core uses one flat menu in exactly this order: Overview, Essence, Intellectual Qualities, Interpersonal Qualities, Emotional Landscape, Relationships, Career, Finances, Health, Spirituality. Do not add The Pioneer/energy-title category or an intermediate Core submenu. Preserve website UI icons, server-owned readings and relationship age gates. See docs/core-navigation.md for API gaps.

Appearing/disappearing UI uses shared FadeView transitions (180 ms in, 140 ms out), respecting OS Reduce Motion. Apply through shared components rather than per-screen animation values. Panels fade in; disclosures, reading-mode content and scroll navigation fade in/out. Do not delay clearing protected/account state to animate it away.

Energy detail modals expose Back to Menu navigation beneath the title via AppModal's optional backToTopLabel only after scrolling more than 24 px from the top. Fade it in/out when changing visibility. It scrolls back to the round buttons without closing the sheet or resetting selected reading/full-text mode. Reuse this navigation for calculator details.

Apply visual changes through shared components, typography and spacing tokens so they remain consistent across screens. Avoid local styling exceptions for headings, body text, inputs or panels when the same role exists elsewhere. Primary chart energies must each have a corresponding detail panel; unavailable server readings need an honest availability message, never invented interpretation or bypassed membership checks.

For subscription work, read `docs/app-subscriptions.md` and the authoritative shared contract in `D:/Workspace/ninestar/docs/mobile-api.md`. The owner's final direction is one existing account with shared website/app membership access and separate billing-provider records; the app-only identity proposal is superseded. Backend implementation belongs to the website chat. Never trust a client-paid flag, calculate access from local expiry dates, or fulfil Apple purchases through legacy methods that terminate website memberships. Keep proposed endpoints/product policies distinct from implemented support.

Mobile UX should be simpler than the expert website: lead with the user's own chart and three main energies, group related readings, and reveal detail through accessible disclosures. Read `docs/mobile-chart.md` before chart/auth changes; use server-owned own-chart routes and preserve full/free access checks. Keep connection diagnostics out of the main reading flow.

Keep My Chart high level: header energy widgets open details in one closable, vertically scrolling AppModal sheet, never an inline reading below the chart. Keep the title and Close control outside the scrolling content. Navigate subsections inside the same sheet rather than stacking modals; default to summaries with optional full text. Summary Read More also opens a sheet. Closing preserves the underlying chart position and disclosures. Reuse PersonalChart, EnergyCard, ChartDetails, AppModal and chart-sections ownership for future profile calculator results; do not build duplicate widgets or infer missing server readings.

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
