# Owner requests and follow-up tracker

Maintain this file alongside the detailed app documents so the owner does not
have to repeat suggestions. Seeded from the conversation on 2026-10-24.
Historical implementation summaries below are not fresh runtime verification.
Add new requests as they arrive, keep unresolved work visible and update status
after implementation and validation. Record superseding decisions explicitly.
Never record credentials, tokens or cookies.

## Current priorities (2026-10-25)

My Predictions first native screen implemented at owner's request: own title,
expandable API moreOnCycles introduction, Primary Cycles (year/month/day), expanded
Additional Cycles (generation/epoch/hour), shared energy/artwork cards and detail
modal with per-period help and separate scope readings. No summary, second login,
credit POSTs or calculator submission. Reusable Predictions component supports
future calculator hosts. API reading titles are shown verbatim; short period labels
remain unavailable and must not be claimed as implemented. Existing enum metadata
supplies scope disclosure labels; no guessed cycleLabels field.
Live validation blocked: Integration predictions/me, readings/predictions/me/free
and metadata/options all returned HTTP 500 HTML ASP.NET Runtime Error, not JSON.
Recheck also hit the 15-second timeout on each endpoint. Local validation: 129 tests,
lint, typecheck and targeted whitespace check all passed. No signed-in live or
iPhone result is claimed.
Source issue also identified: FreePredictions calls FreeYear(global year) without
global=true, selecting personal CycleDescription. Free global reading is withheld
in UI pending backend correction/verification. Full global prose stays distinct.
Next: backend restores Integration and confirms labels/global-text fix, then owner
opens My Predictions for the first signed-in device check. Detailed handover and
validation in my-predictions.md. Retained day variants are not yet exposed as UI
choices pending proper API labels; no variants are merged into another reading.

Calculator help implemented using owner's clarified source/flow: data.help.overview,
not personalised data.overview. Existing GET personal-chart/me/free supplies generic
help before any arbitrary-person POST; discard its readings/numbers. ContextualHelp
appears below form title, preserves authored headings/emphasis/API title, and is
hidden when results show. Edit Calculation restores it with retained inputs.
Optional help failure never blocks/resets the form; session generation/alive guards
reject stale updates. No new content route or backend change is required for this
signed-in flow. This supersedes the previous lightweight-endpoint blocker below.
Validation: 122 tests passed; lint, typecheck and targeted whitespace check passed.
Next: owner reloads calculator and expands introduction, then calculates to confirm
it disappears; My Predictions follows after this check. See calculator report.

Owner flagged missing calculator help again. Rechecked Integration on 2026-10-25:
GET content/personal-chart returns HTTP 404 content_not_found. Local shared
contract and MobileContentController also still lack this content page. Therefore
the requested pre-calculation helper remains unimplemented, not a rendering bug.
Existing knowledge-base content is available but its 719 KB graph/title mismatch
remain documented. Next concrete backend handover: expose the proposed lightweight
content page with Dictionary-backed About 9 Star Ki Personal Chart title, existing
Dictionary.personal_chart HTML and culture, without calculation or membership
changes; document the agreed route before mobile wiring. No speculative client
route, hardcoded prose or backend edits introduced during this recheck.

Owner confirmed next feature after Personal Chart Calculator help: My Predictions,
with page title, expandable API help, Primary Cycles and Additional Cycles in
that order, following My Chart's shared widgets and detail modals. No summary.
Reuse the same prediction results for the later calculator. See my-predictions.md
for the outstanding cycle-label contract check; do not invent labels. Next: finish
calculator help when lightweight content is exposed, then recheck latest prediction
contract/Integration and implement the native own-predictions screen.

Calculator default correction: never prefill account name/DOB/time/gender. First
use has blank name, local today minus 22 calendar years, time 00:00 with birth time
unknown, and random selection among API gender options. February 29 clamps to
February 28. Calculation preferences/current timezone still seed options, with
current zone initially used for birth zone. Shared input memory retains edits
and submitted inputs across reopen/restart, isolated by environment/account/feature;
no automatic recalculation. This follows website calculatorMemory.js input/change
and submit retention and supersedes initial own-details prefill/memory-only notes.
Uses existing Expo FileSystem app-private documents, no dependency additions.
No credentials, chart results, tokens, access or My Account drafts retained.
Pending device check: fresh default, change inputs, leave/reopen and restart.
119 automated tests passed, including defaults, leap day, restart restoration,
latest-write ordering and account/environment isolation. First defaults are
remembered immediately, so reopening without edits also keeps the chosen gender.
See personal-chart-calculator.md for automated results and limitations.

Calculator heading changed to Personal Chart Calculator; removed introductory
sentence at owner's request. Requested expandable About 9 Star Ki Personal Chart
help before the form: exact body already exists as Dictionary.personal_chart.
Integration GET knowledge-base verified HTTP 200, help.personalChart has matching
opening and strong HTML, culture en-GB, but title Personal Chart and whole response
719,203 bytes. Chart help.overview exposes the same body only with a chart result,
title About Your Personal Chart. Proposed (not implemented) small public content
route content/personal-chart with Dictionary-backed About 9 Star Ki Personal Chart
title and existing body/culture, avoiding a full knowledge-base fetch or calculation
solely for help. Backend owner to agree/expose lightweight content, then mobile
consumes it with ContextualHelp above form. No backend contract/code edits made.

Personal Chart calculator is now the owner's first native Explore feature.
Inspected the website's shared NineStarKi calculator form, Personal Chart and
Predictions wrappers, and mobile request/controller contract. Added shared
CalculationForm and CalculationDraft/buildCalculation with optional selected-date
extension; Explore has a nested native stack and Personal Chart form/results.
Starts from a separate copy of server-saved details; edit/recalculate keeps that
draft without saving account data. Full results reuse PersonalChart and all
existing energy details. Fresh CSRF, 15-second deadline and session cancellation
remain shared. No automatic preview, own/free substitution or credit redemption.
Integration metadata 200, synthetic public preview 200, anonymous full calculate
401 authentication_required. Signed-in full calculation needs owner iPhone check.
Final automated validation: 114 tests passed; lint/typecheck passed. Initial
effect-lint issue fixed and stale generated Router types refreshed locally.
See personal-chart-calculator.md for results, limitations and next step. This
supersedes the previous next-feature priority below; Predictions remains pending.

Explicit owner architecture decision: every feature screen will be built in the
app and talk to the API. No website screens, browser wrappers or website fallback
for any Explore/My Predictions feature. One shared app sign-in. This supersedes
all earlier website-access proposals and implementation history. Current website
fallback already removed. Next: finish native My Predictions after documented
cycle labels, then implement remaining native feature flows one by one using
shared result components. Added lasting rule to AGENTS.md.

Owner rejected website fallback/second sign-in: app features must share one native
authenticated session. Removed website notice, Opens website captions, redirects,
browser hook and URL configuration. Other Explore text/grouping unchanged.
Unbuilt feature buttons now open native Coming soon panels; My Predictions also
stays in-app pending actual cycle UI. Supersedes website-access implementation
and checks below. Next: implement native features against existing API, starting
with cycle-label contract for predictions; no browser login workaround.

Explore validation: 108 tests, lint and typecheck passed. All eight public website
feature GETs returned 200 at expected paths; own-predictions URL redirected to
login anonymously as expected. HEAD initially timed out, so do not claim HEAD
success. Browser/iPhone presentation and separate sign-in still need owner check.

Explore hub and four visible tabs implemented at owner's request to see other
features. Order Explore, My Chart, My Predictions, My Account. Existing native
chart/account preserved. Other feature cards explicitly open their website views
through system browser, with separate browser authentication; no claim of native
feature completion. My Predictions temporarily offers website access while cycle
labels/native UI are pending. Style Guide moved to hidden /style-guide. See
explore-navigation.md. Next: owner checks Explore and one website feature on iPhone.

Account naming consistency: bottom navigation remains My Account; account page
heading now Your Account across signed-out, native form and web fallback states,
matching My Chart / Your Personal Chart convention. Central uiCopy resource;
no changes to account drafts, login or entitlements. Pending visual confirmation.

Main My Chart title correction: owner explicitly wants Your Personal Chart,
not About Your Personal Chart. Home now passes that central resource to reusable
PersonalChart; generic calculator default is Personal Chart. Never reuse API
help.overview.title as the page heading. Dedicated API page titles remain missing;
these explicit owner-approved strings live in uiCopy pending that addition.
Next: owner checks main heading on iPhone. Other widget headings stay neutral.

Owner clarified “Update buttons also” means energy/cycle buttons inside result
screens, not bottom navigation. Existing energy buttons already use neutral
API roleLabels verbatim and match destination headings. Keep My Chart/My
Predictions/My Account for personal top-level destinations. Apply the same
neutral API cycle-label behavior to prediction/calculator buttons once the
pending cycle-label contract exists; do not strip Your/About from server strings
or fabricate a client cycleLabels field. No additional UI mutation needed for
existing energy buttons after inspection.

My Predictions development begun: owner specifies Primary Cycles / Additional
Cycles, no summary, and same reusable result UI for calculators without Your
headings. Extracted ReadingGroups and connected My Chart; headings now Core
Energies and Summary. Added read-only own-predictions client with membership-only
free yearly fallback; tests verify no credit POSTs. Prediction tab/result UI awaits
short cycle-period labels missing from API (About help is not navigation). Exact
proposed backend handover in my-predictions.md; no guessed contract fields or
backend edits. Next: backend adds documented labels, then finish prediction UI.

Owner's latest navigation preference: Explore first. Proposed bottom order is
Explore, My Chart, My Predictions, My Account, superseding earlier ordering.
Explore is the grouped feature hub. Order preference recorded; initial launch
route and implementation have not yet changed. Do not infer an explicit default
landing-screen decision solely from tab ordering.

Navigation expansion discussion: screenshot lists Personal Chart, Compatibility,
Predictions, I Ching, Karmic Numerology, AI Astrologer, Knowledge Base and Articles.
Recommend four bottom destinations: My Chart, My Predictions, Explore, My Account.
Explore is a proposed hub (broader than Calculators) with grouped reusable cards:
reading/calculation tools, AI Astrologer, and learning content (Knowledge Base,
Articles). Personal own-chart/predictions stay direct; calculators for other people
can live in Explore without duplicating the main personal destinations. Feature
names should retain API labels; group names are UX proposals, not API contract
changes. Proposal awaiting agreement; no navigation/routes implemented yet.

New feature request: My Predictions as a main destination. Owner asks whether
bottom buttons scroll horizontally and can scale to many features. Current
native bottom tabs do not implement horizontal scrolling; keep top-level
destinations few. Proposed (not yet agreed/implemented): My Chart, My Predictions,
My Account now; later a Tools hub for calculators/other less frequent functions,
avoiding an overflowing bottom tab bar. Before implementation read predictions
contract, preserve grants/entitlements and reuse chart/help/detail components.
Next: agree navigation and implement My Predictions against existing API content.

Extended Profile helpers added consistently: Day Star, Generation and Epoch now
use the same ContextualHelp widget beneath the title bar, above energy banner
and menu, matching all primary energies. API content only; omit absent help.
Next: owner verifies placement/expand-collapse on those three screens.

Role-label gap resolved in latest contract and implemented: six API roleLabels
now name energy cards and destination title bars. Temporary local labels removed;
About help and full energy headings remain separate. All 103 tests, lint and
typecheck passed. Next: owner checks Extended Profile labels and matching
screen title on iPhone. Authenticated Integration payload not inspected by agent.
Supersedes older unresolved role-label proposals below.

Extended Profile owner request: Day Star/Generation/Epoch role labels must come
from API and match destination title bars. Website resources are DayStarLabel
(Day Star), GenerationalEnergyLabel (Generational Ki), EpochEnergyLabel (Epoch Ki).
Current contract exposes About help titles and individual energy titles/names,
but not these short role labels. Do not add local 9 Star Ki wording or strip About.
Next: backend exposes Dictionary-backed short role labels for all six energies,
then shared resolver uses one API label for cards and screens. No speculative
client/contract field added in this review. Existing primary local fallbacks should
also be replaced when this field is available.

About-title correction implemented: shared primary energy card/modal labels no
longer reuse About help titles. Use central website labels pending distinct API
role labels. Constitution/Character retain helper panels; Social Expression now
also shows its API help above banner/menu. Next: owner checks three modal title
bars and Social Expression help. See contextual-help.md; API role-label gap is
still open in localisation.md.

Owner confirmed Health looks good on iPhone and is reviewing Character next.
Owner reports backend heading update ready. Latest contract separates About Adult
/ Child Relationship helper from Adult / Child Relationship navigation/details;
existing client already consumes those fields. This differs from earlier proposed
“Your Adult Child relationship”; keep server wording and flag difference, not
hardcode it. New About titles for all contextual help reveal another semantic
gap: main card/modal titles currently reuse help titles. Need separate generic
energy-role navigation labels from API rather than stripping About or deriving
keys. No speculative client label replacement made. Owner refreshing app hit a
problem; first diagnostic restart Metro with Ctrl+C then npm start (Expo Go).

Owner confirms Apple membership still pending (Apple advised up to 48 hours) and
explicitly parks signed-build work until activation. Local identity/config/SDK
preparation is complete and checked; no need to repeat it. Do not keep prompting
for membership status during unrelated work. Continue Expo Go chart/content/UI
review. Next proposed step: verify Core Health's five panels and artwork, then
review remaining chart sections one by one. Adult/Child heading still awaits
owner's API update notification. Resume signing when owner reports activation.

SDK alignment completed via Expo CLI install --fix. Online compatibility check,
public config (NineStar and agreed iOS/Android IDs), all 100 tests, lint and
typecheck passed. Supersedes earlier pending patch-alignment notes. No cloud
build/signing attempted; still awaiting active Apple membership and EAS setup.

App identity agreed and configured: displayed name NineStar; iOS bundle ID and
Android package com.ninestarkiastrology.mobile. Expo slug unchanged. Supersedes
earlier unconfirmed-identifier notes. SDK patch alignment in progress; next gate
remains active Apple membership and EAS project/signing setup.

Build preparation checks: local config, lint and typecheck passed. Online Expo
compatibility check found seven SDK patch alignments needed before cloud build;
recorded in development-build.md, not applied yet. Identifier discussion remains
open: owner asks about simple ninestar name versus internal app-store bundle ID.

Own build preparation: owner enrolled as Individual, Apple membership pending.
Installed SDK-compatible dev client and prepared internal EAS development profile;
npm start keeps Expo Go, npm run start:dev targets own build. Await identifier
choice and activation before provisioning/build. See development-build.md. Earlier
payment/login trouble and deferral notes are superseded by pending enrollment.

Apple enrollment purchase currently blocked: owner reports sign-in submit hangs.
Inspected supplied response title: Page Not Found - Apple (HTML, not evidence of
invalid credentials or a successful purchase). No membership/payment completion
confirmed. Next diagnostic: fresh normal Edge window, start from developer account
and resume enrollment rather than reusing the checkout redirect. Do not store
checkout URLs, session values, credentials or payment data in project docs.

Apple setup resumed: owner intends to pay for Individual Developer enrollment
through the browser and requests our own build. Previous payment deferral is
revoked. Enrollment/active membership not yet confirmed. Next: owner completes
official Apple enrollment; then agree app identifier and configure EAS development
build plus website association. No purchase or membership status assumed.

Owner deferred paid Apple Developer enrollment until funds are available.
Standalone signed iPhone build and website-linked password autofill are deferred
with it; do not repeatedly prompt for payment. Existing Expo Go development can
continue. Remembered session and logout restart checks passed on iPhone. Proposed
next no-cost step: verify the five Core Health panels and organ images, then
continue section-by-section chart review. Adult/Child heading awaits owner API
notification; Apple purchasing remains deferred.

Login device progress: explicit logout also survived Expo Go restart (sign-in
required). Session persistence and logout checks now passed on iPhone. Owner had
to reenter username/password; password-manager autofill is a separate open item.
Next: check system Passwords/key option when password input is focused.

Login device progress: owner confirmed auto sign-in after fully closing/reopening
Expo Go with Stay signed in enabled. iPhone restart persistence passed. Next:
sign out and repeat restart to confirm logout persists. Standalone, Android and
expiry behavior remain unverified.

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
