# Native Knowledge Base and Articles

2026-10-27

## Sources and implementation

Current artwork mapping is prepared for backend ec40fa6d, awaiting deployment;
see ui-artwork-refresh.md. It supersedes the earlier icon choices documented
below: Origins ui.origins, light/dark ui.daily-cycle, Yin/Yang ui.yinyang, nine
core/character ui.nine-core-energies/ui.nine-character-energies and Personal Chart
ui.personal-chart. Year/month remain ui.sun/ui.moon. Domain element/modality
images and cycle-five remain unchanged. Labels, layouts and sizes are preserved.

Read ninestar/docs/mobile-api.md (contextual explanatory help and knowledge-base
access rules), WebApplication/Views/KnowledgeBase/Index.cshtml and _Navigation,
_NineEnergiesOverview, _ModalityDetails/_ModalityBody, _YearlyCyclesOverview,
MobileKnowledgeBaseController, MobileCalculationMapper.KnowledgeBase and
MobileHelpMapper.KnowledgeBase. No website files were changed.

Explore opens /explore/knowledge-base. SectionWidgets preserve website category
order: origins, lightAndDark, yinYang, modalities, elements, mainEnergies,
characterEnergies, year, month, personalChart, relationships. Origins is first in website content,
although omitted from its abbreviated anchor menu. Display titles come directly
from data.help, never from these protocol keys.

Owner-requested intermediate menus supersede the initial flat/disclosure layout:
modalities, elements, core/character energies, yearly/monthly predictions and
Relationships navigate through /explore/knowledge-base/[section] in a nested
Expo Router stack. All use the same SectionWidgets and ContextualHelp. The five
element articles appear in website order beneath Five Elements, followed by Five
Transformations. Reference menus preserve server order (three modalities and nine
energies/readings per respective collection). Individual buttons open shared
AppModal with native ReadingContent; Close returns to that menu. Back returns
to the main Knowledge Base. Standalone topics retain their direct detail modal.
No extra epoch/day/hour sections are invented. Article illustrations
use existing stable catalogue IDs for light/dark, Yin/Yang and element artwork;
all variants, URLs and caching remain owned by the shared resolver.

The Modalities intermediate screen groups its three topic buttons inside one
standard AppPanel beneath the introduction. It uses normal shared panel spacing,
borders and the centred odd final button; detail selection stays unchanged.
Lint, typecheck and whitespace checks passed for this container-only refinement.
No new tests or bundle export; iPhone visual confirmation remains pending.

Relationships uses help.relationships title/htmlBody/culture for its short,
collapsible introduction. The separate help.sexuality article renders beneath
in a titled AppPanel with its full supplied text. A transformations button opens
the same help.transformations article used by Five Elements, with the cycle-five
artwork. Sexuality/transformations are omitted unless returned by the server;
the app does not replace absent member content with personalised chart prose.
No new contract field is required for this grouping.

Additional owner-selected menu icons: mainEnergies and personalChart reuse
FeatureArtwork.personalChart (ui.fundamental-nature, the existing Essence icon),
characterEnergies uses the website character/lunar-nature icon, year uses ui.sun
and month uses ui.moon (confirmed in Views/Predictions/_CyclesPills.cshtml).
Relationships retains ui.relationships and transformations uses cycle-five.
Modality detail buttons resolve artwork from the matching returned mainEnergy's
modalityArtworkId using the modality's numbers, never its translated name.

Owner's artwork refinement: Origins uses company.logo-notext (the new gold/blue
symbol without its wordmark), The 3 Modalities uses ninestar.modalities.dynamic,
and The 5 Elements uses ninestar.elements.cycle-five, replacing cycle. These
shared article IDs apply to buttons and the owning section's figure; button
artwork retains the standard 72-point contained sizing. Integration catalogue
verified all three IDs, with 173x173 logo, 160x160 dynamic and 440x440 cycle-five
artwork. Cycle-five has both dark/default variants; no backend update required.

Later Origins refinement supersedes the owning-section figure for Origins only:
the menu button retains its assigned artwork (now ui.origins), but Origins details render text only, without
a leading image. Other article figures remain unchanged.
Lint and final typecheck passed for this rendering-only refinement; the existing
stale Router declarations were regenerated before the successful typecheck.
No tests or bundle export repeated. Next: reopen Origins on iPhone.
Validation for this artwork-only refinement: lint, typecheck and whitespace check
passed. No tests or bundle export repeated for these catalogue-ID substitutions.
Visual confirmation on iPhone remains the next step.

HTML headings, paragraphs, lists and bold emphasis use the existing safe renderer
in theme colours. Existing renderer limitations apply: arbitrary embedded HTML
images and links are not interactive native content. Explicit catalogue figures
and reference images render separately; full website inline-illustration parity
is not claimed. Missing article titles/content are omitted, including articles
withheld by the server. Existing reference-array access is not changed or used
to reconstruct withheld help articles.

GET knowledge-base uses the existing cookie-aware transport, 15-second timeout
and session cancellation. No account/membership reads or writes are introduced.
The nested route layout owns KnowledgeBaseProvider: one in-memory response shared
by root and intermediate screens, avoiding another fetch per menu. It is
discarded on stack exit and session generation changes, together with modal state;
unmounted or obsolete replies are ignored. No persistent article cache is added. Loading,
failure/retry, typography, artwork and disclosures reuse shared controls.

Articles now opens the website's real BlogController Index route,
/latest-articles, through installed Expo Linking. The URL uses the configured
API origin, so production automatically drops int. when the API is switched;
still follow production-switch.md. No account details or tokens are passed in
the URL. Failure to launch uses the shared error dialog. This external link is
explicitly authorised for Articles; native calculators remain native.

## Validation

Grouped-menu revision:

- All 195 automated tests passed (three new grouping/Relationships/artwork tests,
  with existing order assertions updated). Coverage includes hidden member
  articles, separate introduction/intimacy text, identical transformations content
  across both destinations and label-independent modality artwork selection.
- Lint passed. Offline iOS export passed: 1858 modules, 46 assets, 2.9 MB JS.
  Metro recovered an unreadable file-map cache through its automatic full crawl;
  the export completed successfully without deleting files or restarting servers.
- Final typecheck passed after regenerating the known stale Router declarations
  from src/app. Initial attempts encountered the existing Metro watcher issue
  (non-route paths and /index aliases); no application route types were bypassed
  or hand-edited. Tracked-file whitespace check passed.
- Public Integration GET rechecked: 200, relationships title/body present
  (1461 HTML characters); sexuality absent anonymously. Three modalities returned
  Dynamic Group (3/6/9), Stable Group (2/5/8), Reflective Group (1/4/7).
  Authenticated articles and native back/gesture behavior remain iPhone checks.

Earlier initial flat-screen validation:

- Anonymous Integration GET /api/mobile/v1/knowledge-base: 200 JSON,
  Cache-Control no-store, no-cache. Ten public help entries with nonempty API
  titles/bodies. Reference collections: nine entries in each of mainEnergies,
  characterEnergies and six cycle arrays, plus three modalities.
- Public help titles include Origins, Cycles Of Light And Dark, Yin And Yang,
  The 3 Modalities / Groups, The 9 Core Energies, The 9 Character Energies,
  Yearly Predictions, Monthly Predictions, Personal Chart and
  9 Star Ki Relationships. Eight member-help entries absent anonymously, matching
  the documented server gating. Authenticated membership variants not exercised.
- Blog page GET timed out at 15 seconds; subsequent HEAD /latest-articles
  returned 200 text/html; route independently confirmed from BlogController.
  Full page usability remains a phone check, not established by HEAD.
- Five new automated checks cover article order/resource wording, HTML emphasis,
  omission of malformed/gated titles, independent reference/cycle prose/artwork,
  public cookie-aware one-GET transport and environment-specific blog routes
  (four parser/link tests plus one transport test).
- All 192 automated tests passed; lint passed after moving retry/loading state
  changes into the explicit retry action. Offline iOS export passed: 1855 modules,
  46 assets, 2.9 MB JavaScript bundle. No server was started or deployment made.
- Final typecheck passed after regenerating route declarations from src/app
  with the installed Expo CLI helper. Concurrent Metro export had reproduced
  the existing stale Router declaration issue; no route types were hand-edited.
  Tracked-file whitespace check passed.

## Gaps and next step

No contract change is needed for this screen/grouping. Shared Knowledge Base page
heading still uses the existing central mobile resource, because the response
does not expose a page-level label. Additional navigation/illustration metadata
would require a proposed backend addition before implementation; no local domain
titles were invented. API reference payloads keep their pre-existing access rules.

Next iPhone step: open Explore → Knowledge Base → Five Elements, then tap Fire;
Close should return to the element menu and Back to Knowledge Base to the root.
Then check modalities, core/character and year/month menus. Finally verify
Relationships introduction, separately titled Intimacy panel and transformations
button while signed in. These device behaviors are implemented, not yet verified.
AI Astrologer stays parked while its replacement plugin is under review.
