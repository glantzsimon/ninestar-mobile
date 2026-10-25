# Owner requests and follow-up tracker

Maintain this file alongside the detailed app documents so the owner does not
have to repeat suggestions. Seeded from the conversation on 2026-10-24.
Historical implementation summaries below are not fresh runtime verification.
Add new requests as they arrive, keep unresolved work visible and update status
after implementation and validation. Record superseding decisions explicitly.
Never record credentials, tokens or cookies.

## Current priorities (2026-10-25)

| Item | Current status | Next step |
| --- | --- | --- |
| Remembered login | Stay signed in control implemented, default on; OS autofill hints configured; 100 tests passed. Device persistence not yet verified. | Owner signs out/in with option enabled; then check full app restart and logout. See login-persistence.md. |
| Website-password autofill | Basic hints available. Full association needs standalone app IDs, signing identity and website files; Expo Go cannot establish our own app identity. | Agree bundle/package IDs and coordinate signed development build/domain association. |
| Adult/Child details heading | Owner will expose “Your Adult Child relationship” via API. | Await owner update, read contract and verify field before wiring. |
| Translation labels | Some nav/table/account/common UI labels still absent from API; legacy copy migration incomplete. | Agree remaining label/culture contract. See localisation.md. |
| Free chart title/symbol projection | Full title and four symbol labels/artwork remain a documented API gap. | Discuss allowlisted additions; do not infer protected content. |
| Device validation | Health/organ parity and lifecycle/reduced-motion/Android checks still need explicit verification. | Use existing signed-in accounts and relevant validation reports. |
| Apple purchasing | Intentionally deferred; shared entitlements already integrated. | Resume only when requested after account/chart work. |
| Production switch | Pending going live. | Remind owner to drop int. for API/media and follow production-switch.md. |

Character API titles, Essence button/header/help placement and portrait stars
background have been addressed. Preview control removed. Half-speed video is
implemented; pending motion check is distinct from approved background appearance.
Current summaries above supersede outdated pending flags in the history below.

## Historical request updates (retained for continuity)

Saved login UX: owner asks for browser-like remembered credentials. Existing
login fields already expose username/password autofill hints; signIn currently
sends rememberMe:false. Distinguish OS password-manager autofill from persistent
authenticated sessions. Recommend platform-managed passwords plus backend-backed
session persistence, not app-stored plaintext passwords. Next: agree remembered
session policy, inspect backend cookie expiry/logout behavior and configure app/
website associations in the standalone build for shared website credentials.
No login/session behavior changed by this advice.

Character Essence consistency: both round button and selected reading-panel
heading now use the shared Essence resource and icon, matching Core. Supersedes
the prior full energy-title reading heading requirement for this panel; the
separate energy banner still uses the API energy title. Button already used
Essence; corrected remaining panel heading. Pending iPhone confirmation.

Adult/child heading decision superseded: owner now prefers “Your Adult Child
relationship” for the details panel and will update the API, then notify us.
Do not pursue the earlier personalised transformation heading proposal. Keep
existing navigation/help labels separate. Next: read the updated contract and
verify the supplied API field when owner confirms readiness, then wire it in.
No client wording or backend changes made now.

Adult/Child details heading gap: owner wants the personalised relationship
heading (e.g. child supports adult), not repeated generic navigation title.
Website second panel uses Model.AdultChildRelationsihpTitle, calculated from
child-to-adult transformation. Current API maps body only from personalised
description and title from generic Dictionary.AdultChildRelationshipTitle.
Personalised heading is not exposed by the current documented DTO. Next: propose
a separate reading heading field to backend owner, retaining title for navigation;
do not calculate or invent relationship text in mobile. No UI change yet.

Character UI refinement implemented: second button Essence with shared Essence
icon, overriding the previous energy-specific button label by explicit request.
Generic Character/Inner Child help now sits above energy banner/menu, matching
Core, rather than inside Essence details. Other API navigation titles unchanged.
Next: iPhone check intro placement and Essence icon/reading.

Character navigation 02992d44 completed after owner-provided authenticated
Integration title verification. Four direct API-titled reading buttons replace
invented child/stress groups; Overview stays. One stress panel contains all three
bodies in order. Generic help and full energy heading remain separate. Supersedes
the earlier title/deployment blockers below. Next: owner checks Character on
iPhone; see character-navigation-validation.md.

Character navigation contract 02992d44 reviewed: use sections.character.title,
childNature.title, adultChildRelationship.title and stressResponse.title as
navigation labels. Keep help.character.title for introduction and
energies.character.title for full reading heading. Replace invented groups with
direct items; combine stressResponse, natalHouseStressResponse and
childStressResponse bodies in that order under one Stress Response panel.
Implementation gate: owner requires authenticated Integration title verification
first. No authenticated session is available to the agent; request a read-only
title-only check from the owner's signed-in browser. Do not request credentials
or tokens. Missing titles must not acquire invented fallback labels. Not wired yet.

Background motion refinement: set shared video playbackRate to 0.5 (half speed)
at owner's request. Ten-second asset now loops in about twenty seconds. Pending
iPhone motion check; framing, tint and fallback unchanged.

Background visual tuning completed: owner approved portrait stars with 75%
darkest-teal overlay (“Nice perfect”, 2026-10-25). Temporary Preview background
button, modal state and copy removed as requested. Supersedes pending visibility
checks and preview-removal tasks below. Keep this background as the baseline;
cross-platform and lifecycle verification remain separate checks.

Owner requested more visible stars: shared teal overlay reduced from 85% to 75%.
Implemented across screen/modal backgrounds; pending owner visual confirmation.

Owner accepted portrait video framing on iPhone (“Way better”, 2026-10-25).
Keep portrait asset as baseline. Supersedes pending iPhone framing status below.
Remaining: lifecycle/reduced-motion/cross-platform checks and eventual removal
of the temporary Preview background button.

Portrait replacement connected: bundled video-only copy of stars-bg-mobile.mp4
and matching extracted poster; 720x1280 framing with minimum cover, bottom-centre.
Supersedes landscape trial. Pending owner Preview background check on iPhone.

Replacement mobile video found on 2026-10-25: website
Videos/Shared/stars-bg-mobile.mp4 and public Integration URL both exist (HEAD
200, video/mp4, 3,537,854 bytes). ffprobe: primary H.264/yuv420p 720x1280,
10.042 seconds, AAC audio and attached MJPEG image. Not yet integrated. Next:
replace the landscape app asset with a video-only copy and update aspect-ratio
framing/poster consistently; retain mute, dark tint and reduced-motion fallback.

Background preview screenshot revealed simultaneous poster/video layers. Poster
now hides after the first frame and returns for fallback. Next: owner reopens
preview to verify one stars composition, with plain teal above the full frame.

Temporary background diagnostic: added Preview background button beneath My
Chart guidance. Opens shared AppModal with no content panels, leaving the same
video/poster/tint visible and normal Close control. Next step: owner opens it
and provides screenshot to diagnose reported unchanged/zoomed framing. Remove
temporary button once background is agreed.

Current video framing correction: owner finds full-screen cover too zoomed in.
Changed to show the entire landscape frame without cropping, bottom-centred,
with darkest teal in unused space. This supersedes minimum-cover scaling.
Pending iPhone visual check; see video-background-validation.md.

Latest video framing request: horizontal centre and vertical bottom, replacing
vertical centre. Implemented in shared video and poster. Keep minimum cover
zoom; in portrait there may be no visible difference because full video height
already fits. Pending owner visual check.

Background colour preference implemented: darkest teal (#091a22 via shared
theme.backgroundElement) beneath stars and in its tint overlay. Keep this choice
for the shared app/modal background. Visual confirmation pending.

Video framing: owner requests maximum zoom-out while fully covering the screen,
cropped from the exact centre. Shared background now measures the viewport and
explicitly centres a minimum-cover rectangle. Pending iPhone framing check.

Video first iPhone check failed (QuickTime mark). Original file is VP9 in MP4;
converted and switched to a bundled H.264/no-audio copy. Retest pending. Bundling
is now implemented; it supersedes the earlier remote-trial/offline-future notes.

Stars background trial implemented in shared AppScreen/chart-modal backgrounds
using expo-video, theme tint and bundled website poster. Remote source follows
API origin. Pending iPhone playback/readability checks; see
video-background-validation.md. This supersedes the earlier “not added yet”
status in the original suggestion row; offline MP4 bundling remains future work.

Production reminder: when the owner requests going live, explicitly remind them
to drop `int.` from API and media hosts. Follow production-switch.md, verify
returned artwork URLs and isolate environment caches. Pending the live switch;
no URLs changed now.

Stress navigation follow-up: the owner rejects the invented “Stress and Balance”
group and “Responding to Stress” wording. Website uses Dictionary.StressResponse
(“Stress Response”). Local backend mapper provides sections.stressResponse.body,
but its DTO has only body/summary and the help mapper has no stressResponse entry.
The label is missing from the documented API. Next step: include
Dictionary.StressResponse alongside Dictionary.ChildNature in the proposed
section/menu title addition; discuss this gap before replacing category wording.
No UI or backend change made by this review.

| Request | Status / evidence | Next concrete step |
| --- | --- | --- |
| Match website “Child Nature”; replace “Childhood and Growth”; prefer API labels | Open. Child reading body exists, but Dictionary.ChildNature label is absent from the API. Current group is mobile-only. See localisation.md. | Agree Dictionary-backed section/menu title transport with backend owner, then replace child wording and agree removal/replacement of invented grouping. |
| All UI text translatable and centrally managed; reuse website Dictionary strings | Partially implemented. API help/energy/organ titles used; touched mobile copy centralised in ui-copy.ts. Legacy literals and navigation/table/account/common labels remain. | Agree label inventory and culture/fallback contract; migrate remaining copy. See localisation.md. |
| Complete Character Nature, including Essence help | Essence help implemented using help.character; broader Character navigation still needs website parity review. | Check remaining character sections against website and resolve label gap above. See contextual-help.md. |
| Health panels and organ images in website order | Implemented; authenticated full-response/iPhone verification remains documented as pending. | Check with an existing full-access signed-in account. See health-api-review.md. |
| Full energy title and five overview symbols for free charts too | Backend projection gap; do not infer missing display data or paid prose. | Discuss additive free-projection title/symbol metadata. See localisation.md and energy-metadata-validation.md. |
| Faint website stars backdrop, static or video | Shared video trial implemented with poster and theme overlay. Source: https://int.9starkiastrology.com/Videos/Shared/stars-bg.mp4, 5,385,680 bytes; server supports byte ranges and 30-day caching. | Verify actual iPhone playback/readability and loop quality. See video-background-validation.md. |
| Shared website/app subscription access, then Apple billing | Shared entitlements integrated; Apple purchasing intentionally deferred. Separate billing records must preserve website purchases. | Follow app-subscriptions.md and apple-contract-review.md when explicitly resuming billing. |

## Implemented directions to preserve

| Owner direction | Current convention / reference |
| --- | --- |
| Dark blue/teal default; website fonts/artwork; systemic styling | Shared theme, Candara, shared components. design-system.md, artwork-integration.md. |
| Reuse chart widgets for the future profile calculator | PersonalChart, EnergyBanner, EnergyFacts, SectionWidgets and modal navigation are shared; avoid duplicate implementations. Calculator completion is not implied. |
| Main chart stays high level; details in a closable scrolling modal | Energies, collapsible Your Summary, expanded Extended Profile in that order. mobile-chart.md. |
| Summary and help share expandable preview behavior | Three-line faded preview, rich HTML emphasis, header action or body tap to toggle. contextual-help.md. |
| API Constitution label instead of Core Nature; relevant section help | Use help.core.title; help is generic and separate from personalised readings. Missing help is omitted. |
| Full-width energy title/image above section buttons on every energy screen | Shared EnergyBanner uses API energy title, normal spacing and artwork fallback chain. |
| Core menu: Overview, Essence, Intellectual Qualities, Interpersonal Qualities, Emotional Landscape, Relationships, Career, Finances, Health, Spirituality | Exact flat menu; supersedes earlier six-button/The Pioneer arrangement. core-navigation.md. |
| Relationships navigation stays “Relationships” | Long API help title only labels its help box; dedicated API navigation label still missing. localisation.md. |
| Five equal-width overview symbols; expandable full nine-row fact table in same panel | Shared EnergyFacts; six additional metadata fields connected. energy-metadata-validation.md. |
| Rounded image-first buttons, vertically aligned artwork, compact label leading | Shared SectionWidgets; website icons resolved through catalogue. |
| Back to Menu returns to buttons, hides above them; short sections top-align | Shared measured modal scrolling and minimum content height. chart-modal-validation.md. |
| Appearing/disappearing elements fade and collapse smoothly without layout jumps | Shared FadeCollapse/FadeView, reduced-motion support. design-system.md. |
| Larger consistent panel headings; full-text/summary action with icon in header right | Shared typography/header action. Modal title remains left aligned, superseding centred experiment. |
| Preserve website bold emphasis and theme text colour | Safe native rich-text renderer; no executable HTML. reading-formatting-validation.md. |
| Public artwork catalogue, conditional refresh, dark/default variants, on-demand cached images and fallbacks | artwork-integration.md and artwork-backend-validation.md. |
| My Account in app; preserve unsaved edits and clear account-scoped state on logout/switch | mobile-account.md and shared-entitlements.md. No intrusive diagnostic/refresh/reload controls in normal reading flow. |
| Keep client timeout at 15 seconds | Preserve bounded request cleanup; never increase timeout to mask failures. |

## Working constraints and next priority

Keep API contract changes in ninestar/docs/mobile-api.md through the backend
owner, flagging proposed additions first. No migrations, deployments, membership
changes or Apple purchasing are authorised by this tracker. Use existing signed-in
users for private iPhone checks; never request stored credentials.

Immediate next priority: validate remembered login on iPhone, then configure
standalone autofill with agreed app/domain identities. Detailed validation
results remain in their reports, not inferred from an implemented status here.
