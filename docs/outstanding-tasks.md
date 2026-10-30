# Outstanding work — 29 October 2026

Current open-work summary. Older request-tracker pending flags are historical;
do not revive work completed later. Never record credentials or private device
identifiers. Shared API changes remain in ninestar/docs/mobile-api.md.

| Work | Current state and next concrete step |
| --- | --- |
| Own iPhone build | Owner resumes with Apple Developer account. EAS simonglantz verified and @simonglantz/ninestar-mobile linked. iPhone registration is owner-confirmed. Non-interactive build stopped before queuing: no suitable signing credentials. Next: owner runs the interactive development build in PowerShell, signs in privately and includes the registered phone. See development-build.md. |
| Password autofill | Stay signed in and explicit logout passed in Expo Go; password-manager autofill remains separate. Next: obtain actual Team ID during signing, coordinate website webcredentials association, configure/verify the signed app and test autofill after sign-out. Retest session persistence in our own build. |
| Launcher/splash branding | In-app gold/blue logo is updated; native launcher/splash still use Expo template assets. Prepare proper-resolution NineStar assets before a polished distributable build; current runtime mark is only 173×173. |
| Remaining labels | All 173 central labels and calculator/chart-menu/fact/Account fields are API-backed. Scattered legacy messages still need allowlisted resources: see ui-labels-validation.md. Backend exposes/documents those, then migrate consumers without client title casing. |
| Recent iPhone checks | Date-target selector/helper, offline labels, membership displayName, I Ching heading, retained Account drafts and temporary GPT handoff need current device confirmation. Start with Predictions Calculator Advanced preferences and switching Now/Selected Date while retaining values. |
| Magic squares/Directionology | Owner removed display-mode selection: squares are Directionology-only, summary first. Next: iPhone checks centred numbers, south-up arrows, split/dual grids and year/month/day-only summary. Your Predictions now has paired Directionology/Calendar shortcuts. |
| Calendar zoom | Own-calendar hierarchy implemented using the owner's existing-contract instructions: Gregorian Month plus planner Year/NineYear/EightyOneYear, safe anchors and Back history. Parent ranges/emphasis and single-tap reading/double-tap drilling implemented on 30 October. Next: signed-in iPhone gesture, selection, scroll and latency checks in normal/expanded views. Arbitrary-person calculator calendars remain separate. See calendar-zoom-validation.md. |
| Artwork rollout | Last recorded check found old bytes at ui.daily-cycle/ui.yinyang revision URLs; not freshly rechecked during build preparation. Recheck exact returned URLs/hashes, have media owner fix stale bytes if needed, then assess device caching. See ui-artwork-refresh.md. |
| Free chart metadata | Older report flags missing full energy headings/four extra symbol fields in free projection. Reconcile current response/contract and agree remaining allowlisted additions; public labels do not supply missing reading values or grant access. |
| Native quality checks | Large text, VoiceOver, Android, reduced motion/video lifecycle and broader session/account-switch checks remain device work. Run a focused pass after the first own-build installation. |
| Dependency audit | SDK-compatible patch alignment passes Doctor 20/20, but npm audit reports 8 findings (5 low, 3 high). Review SDK-compatible remedies; its proposed major Expo downgrade to 51.0.39 was not applied. See development-build.md. |
| Apple billing | Intentionally deferred; website shared entitlements are integrated and the Revision 2 review/15-check Windows primitive probe passed. No purchasing implemented. Resume only when requested: product agreement, real verifier/backend readiness, then StoreKit purchase/renewal/restore/refund/ownership tests. |
| AI replacement | Existing GPT link is wired and matches the website. Plugin replacement is under review; after approval obtain a supported share/install destination and verify mobile handoff. |
| Release/production | App Store/TestFlight setup, native branding and privacy/release review follow development testing. Before going live explicitly remind owner to remove int. from API/media hosts and follow production-switch.md. No production switch or submission requested. |

Karmic Numerology remains intentionally removed. Health and Constitution/Character
appearance were owner-approved; old validation notes do not establish new defects.
No app-owned password vault, second website login or website fallbacks for native
calculators are planned. Detailed evidence remains in each feature report.
