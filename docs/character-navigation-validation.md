# Character navigation: contract 02992d44

Latest owner refinement: selected Character Essence reading panel now says
Essence, matching its button and Core's shared label/icon. This supersedes use
of energies.character.title for that reading-panel heading only; EnergyBanner
continues to display the full API energy title. Readings and modes unchanged.
Lint and typecheck passed; iPhone confirmation pending.

Owner UI refinement: the primary Character reading button is now Essence with
the same ui.fundamental-nature icon and central Essence resource as Core. This
explicit owner preference overrides displaying sections.character.title on that
button; the API title remains parsed without alteration. Other three navigation
titles remain API-supplied. Generic Character introduction moved above the energy
banner and menu, matching Core, and removed from the selected Essence details.
Full personal reading heading still uses energies.character.title. Pending iPhone
layout check. Lint and typecheck passed for this presentation refinement.

2026-10-25. Read the latest shared mobile-api.md Character navigation section and
local mapper. Before wiring, owner supplied authenticated Integration inspection
showing sections.character.title = The Diplomat, childNature.title = Child Nature,
adultChildRelationship.title = Adult / Child Relationship, stressResponse.title =
Stress Response. This is owner-provided live evidence; no private session was
accessed by the agent. Anonymous endpoint check returned 401 as expected.

The normaliser retains optional section titles. Character navigation keeps
Overview and exposes the four API-titled readings directly, no intermediate
child/stress group or three separate stress navigation entries. Missing titles
omit affected buttons without fallback wording or JSON-key-derived labels.
Personal readings stay in the parsed chart; no input/chart mutation.

The main Character button uses sections.character.title; its reading panel uses
energies.character.title (no invented heading if absent). help.character.title
continues to label the explanatory introduction when that reading is selected.
Adult/child contextual help is shown with its matching reading when supplied.

Stress body blocks combine stressResponse, natalHouseStressResponse,
childStressResponse in that order inside one ChartReading. It initially displays
full body; summaries remain available through the shared mode toggle when
distinct. Combined summary uses each provided summary, otherwise that part's
body, so no complementary part disappears. Rich emphasis is retained in blocks.
Original individual summaries/bodies remain unchanged in the chart model.

Shared buttons, artwork resolver, modal scrolling, back navigation and panel
styles reused. Character's first button uses its energy artwork; child/adult/stress
use existing catalogue UI identifiers. Free responses only expose returned
sections; no paid prose, endpoints or access policy added. No changes to account
drafts, authentication, entitlements, 15-second timeout or purchasing.

Validation: all 99 automated tests passed, including API label/heading separation,
stress ordering, missing title omission, partial stress responses, free projection
and source immutability. Final lint/typecheck and git diff whitespace check passed.
No rejected legacy labels remain in src.

Next concrete step: reload iPhone and open Character. Verify the existing Overview
plus The Diplomat (or your returned energy label), Child Nature, Adult / Child
Relationship and Stress Response appear without the old group labels. Then open
Stress Response and check all three readings appear in order under one heading.
Older-server title omission is safe but makes those navigation items unavailable
until the server provides labels; this is intentional rather than inventing copy.
