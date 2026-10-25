# Contextual help: Constitution and Relationships

Character Essence now displays its response help.character introduction above
the personalised Character reading, using the same three-line faded expandable
ContextualHelp component. Its title/body/culture are server-owned, and missing
help simply omits the panel. Constitution/Relationships introductions and access
rules are unchanged. Next iPhone check: Character → Essence, confirm the generic
introduction appears before the personal reading and toggles by text/header action.
Six contextual-help tests, lint and typecheck passed. Native placement/gesture
verification remains pending the iPhone check above.

Your Summary now reuses this exact expandable widget on the main chart/profile,
using the existing API narrative summary blocks and central Your Summary title.
It has the same three-line faded preview, text/header-action toggle and smooth
motion, expanding in place instead of opening a summary modal. It remains
personalised summary data, not generic help; no API content/access semantics
change. Next iPhone check: expand/collapse Your Summary by text and header action,
then confirm Extended Profile stays below it and energy detail modals still work.
Lint and typecheck passed for the shared-summary-widget change; iPhone visual
and gesture verification remain pending.

Relationships label correction: the menu button and personalised reading panel
use Relationships from the existing central mobile resource. The API's longer
help title stays on the explanatory box only. A separate Dictionary-backed API
navigation label is still needed; no backend contract change was made. Next
iPhone check: reopen Constitution and verify Relationships on the menu, then
tap it and check the distinct help-box and reading-panel titles.
Validation: five targeted menu tests, lint and typecheck passed. Device title
comparison remains pending.

Help panels now toggle from either the header action or a tap on the text area
(collapsed preview or expanded body). Both use the same functional state toggle,
preserving smooth motion and Reduce Motion. The text touch target exposes an
accessible label including the visible reading, action and expanded state; no
extra gesture instruction is hardcoded. Next iPhone check: tap preview text to
expand, scroll without collapsing, then tap expanded text to collapse; confirm
Read More/Show Less still works and VoiceOver can read the content.
The older standalone SummaryPreview helper retains text/button parity; My Chart
now uses ContextualHelp for in-place summary expansion instead. Disclosures containing
independent cards/controls do not intercept child actions.
Lint and typecheck passed after this touch-target change. Device tap-versus-scroll
and VoiceOver behavior remain pending the iPhone check above.

Read the shared Contextual explanatory help contract in
`D:/Workspace/ninestar/docs/mobile-api.md`. No contract or backend changes made.
The owner reports Integration's authenticated free-chart response includes
data.help.core titled Constitution. Authenticated HTTP was not independently
replayed here; the user signs in on iPhone.

The shared parser accepts valid title/htmlBody/culture entries from response-level
help and normalizes resource HTML through readingBlocks. Missing/null/malformed
or empty entries are omitted; absence never implies membership state. Help is
kept separate from personalised sections, energy descriptions and entitlements.

Constitution (formerly Core Nature) uses data.help.core.title on both the main
energy card and detail modal. Other energy cards also use their corresponding
help title. An older response can fall back to its supplied energy name; there
is no invented English role label or display name derived from a JSON key.
If neither is available, omit the unavailable label while retaining the artwork.
A reusable ContextualHelp panel sits above the ten round Constitution buttons.
Collapsed help displays up to three lines of the first paragraph (or first
available block), with a themed gradient at its bottom edge. Expanded help
renders the complete resource blocks, including headings and bold emphasis.
Measured preview/full heights and opacity interpolate together using shared
motion durations and ReduceMotion.System. Hidden layers cannot receive pointer
or accessibility focus. No new dependency is required: RN88 supports gradient
backgrounds directly. No duplicated or fabricated introduction.
Titles, body and culture come from the API; no English help prose is bundled.
Native rendering preserves headings, paragraphs, bullets and strong/b emphasis;
scripts, attributes and embedded media are inert under the existing safe renderer.

Relationships now displays data.help.relationships above its personalised
reading when provided, guarded by the existing explicit age restriction. Its
help-box title comes from that resource-backed entry; navigation and reading
headings remain Relationships from the central resource. If help is absent, the
panel is omitted without inferring paid access. Other feature help screens are
not implemented here.
The 15-second timeout, authentication, free/full access, account drafts and
purchasing are unchanged; no new request, global help download or dependency.

Back to Menu now targets the measured first button grid rather than scroll zero.
It fades/collapses away when scrolling above that grid, even though the help
panel is further up. Help expansion remeasures the menu anchor through layout.
The shared short-section trailing space remains intact.

Next concrete step: reload My Chart, verify the first card's API title, then open
it and check the three-line faded introduction. Expand it, select Essence, and
use Back to Menu: the first buttons should align at the top with the return
control hidden. Scroll further up to reach help. Then open Relationships and
check the generic introduction separately from personalised content.
iPhone appearance, native gradient/motion and server culture comparison remain
pending. See localisation.md for remaining API label gaps.

Previous validation: 87/87 app tests passed, Expo lint passed and TypeScript noEmit passed.
New tests cover free-chart help/readings separation, rich emphasis preservation,
preview/remainder completeness, localized API titles, absent/malformed/empty help
and inert scripts/images. The legacy test loader was updated for the new parser
dependency; the final full-suite run is clean. No known implementation blocker.

Latest validation after pending-message reprocessing: 89/89 app tests passed;
lint and typecheck passed. Added cases cover relationship help/title reuse and
API-localized navigation labels. Main chart/profile energy labels and modal
titles have no literal Core Nature/Constitution fallback in app code. The top
chart title also uses help.overview.title unless the reusable caller supplies one.
Touched remaining interface copy is in ui-copy.ts pending API labels; no complete
UI localisation is claimed. Native three-line/gradient/anchor behavior remains
an iPhone check, not verified by the parser tests.
