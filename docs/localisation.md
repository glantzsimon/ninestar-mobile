# Localisation and API label gaps

## Adult/child personalised reading heading

Owner's latest decision supersedes the personalised-title proposal below:
details panel should say “Your Adult Child relationship”. Owner will expose the
preferred heading through the API and notify us. Await the documented field;
do not hardcode it or implement the transformation-title proposal.

Website _ProfileAdultChildRelationship.cshtml uses generic Dictionary title for
the explanatory help and Model.AdultChildRelationsihpTitle for the second,
personalised reading panel. That model property selects a resource-backed title
using GetChildToAdultTransformation(). The mobile mapper currently supplies only
the personalised description plus generic navigation title; the personalised
heading is missing. Proposed additive contract field: a separate reading heading
on sections.adultChildRelationship (exact name to agree), sourced directly from
Model.AdultChildRelationsihpTitle. Do not replace the existing navigation title or
derive transformation labels client-side. Await backend agreement/availability.

## Character title contract update (02992d44)

Implementation update 2026-10-25: owner supplied signed-in Integration console
results: character “The Diplomat”, childNature “Child Nature”,
adultChildRelationship “Adult / Child Relationship”, stressResponse “Stress
Response”. This clears the deployment gate recorded below. Optional titles are
now parsed and used verbatim for the four direct Character buttons, with no
invented group names. Missing titled entries are omitted; help titles never
substitute for navigation. Full Character reading heading uses energy.title,
omitted when absent. See character-navigation-validation.md for current results.

The latest shared contract now resolves the Child Nature / Stress Response title
transport gap: optional MobileChartText.title populated for Character navigation
and stress subreadings. Local mapper matches the documented Dictionary mappings.
Earlier missing-field findings below are historical and superseded by this
contract. Deployment verification remains pending: requires authenticated full
Integration personal-chart/me, not an anonymous preview. Owner explicitly requires
verification before client wiring, so no navigation change made yet. Next step:
owner runs title-only inspection in a signed-in Integration browser; then parse
optional titles, flatten Character navigation and combine stress bodies in order.

## Character / Child Nature label review

Stress labels have the same gap: website character navigation uses
Dictionary.StressResponse (“Stress Response”). sections.stressResponse supplies
body/summary only, with no title, and help has no stressResponse entry. Both
“Stress and Balance” and “Responding to Stress” are mobile-created wording to
replace once the label/navigation contract is agreed. Include
Dictionary.StressResponse in the proposed backend label inventory. Verified by
local website view, MobilePersonalChartMapper, MobileChartText and MobileHelpMapper
inspection; this is not an authenticated Integration response check.

The website's character tabs and child reading panel use Dictionary.ChildNature,
displayed as “Child Nature”. The full chart API supplies sections.childNature.body
but MobileChartText currently exposes only body and summary, with no title.
The help mapper does not supply help.childNature. help.character.title names the
whole character energy and must not be substituted for the child reading label.

“Childhood Nature” and “Childhood and Growth” are existing mobile-only wording in
chart-sections.ts. The latter is an app grouping, not a website Dictionary label;
there is no equivalent API label to replace it directly. These remain unresolved
pending agreement rather than claiming they are server-supplied.

Proposed next step (not a contract change): expose Dictionary-backed reading/menu
titles, including Dictionary.ChildNature, in the shared contract. Then replace the
child label and remove the invented Childhood and Growth grouping in favour of
the website's direct child/adult-child navigation. Confirm the navigation shape
before that UI change. No backend or application behavior changed in this review.

Validation: inspected the website character tabs, child panel, MobileHelpMapper,
MobileChartText DTO and shared API contract locally. No runtime checks were needed
for this documentation-only review; authenticated Integration content was not
queried.

Relationships navigation/reading headings use the existing central resource
label Relationships. The longer help.relationships.title belongs only to its
explanatory box and must not label the menu or personalised reading. A separate
Dictionary-backed navigation label remains missing from the API; no shortening
or JSON-key-derived label is implemented. This supersedes the earlier title
reuse note below.

Use the authoritative shared contract in ninestar/docs/mobile-api.md. Response
help titles/bodies are Dictionary-backed, culture-tagged API display content.
JSON role/section keys are protocol identifiers, never labels to title-case.

Current app changes use help.core.title (Dictionary.MainEnergyLabel) for both
the first main chart/profile energy card and its modal title. Other energy cards
and modals use their corresponding help title, falling back only to an energy
name actually supplied by the API. The previous hardcoded role-title/hint map
and English Constitution modal fallback have been removed. Relationships help
is available via help.relationships; its longer title is used only by the help box.

## Missing labels to expose from the backend

EnergyBanner uses energies[role].title verbatim. The current free overview entry
allowlist has no full title; flag an additive Dictionary-backed title if banners
must show full titles for free charts too. The app keeps artwork and omits the
unavailable title rather than manufacturing a translated phrase.

Health update ece49172 now supplies organ-panel titles, organ display labels and
the expansion-group title. Those use API labels directly. Health/challenge
reading sections still lack Dictionary-backed title fields; retain the existing
central-resource Health / owner-requested Common Health Challenges wording until
that separate addition is agreed. See health-api-review.md.

The current contract has no complete Dictionary-backed UI-label payload. It does
not provide dedicated labels for the energy Overview, Essence, Intellectual
Qualities, Interpersonal Qualities, Emotional Landscape, Career, Finances, Health
and Spirituality menu items; overview help's title is Personal Chart and must not
be misused for the energy Overview. It also lacks the nine overview table field
labels, chart panel headings/hints, account field/action/error labels, and common
mobile controls/accessibility text (Close, Read More, Show Less, Back to Menu,
View Full Text, View Summary). Metadata enum option labels remain server-supplied.

Existing working wording is retained until the missing labels are available;
it is not claimed to be API-backed. The touched help/menu/common control wording
is centralised in src/lib/ui-copy.ts as an initial English translation resource,
instead of being newly scattered through components. Other existing screens
still contain legacy English strings and need a scoped migration. No new display
label has been invented from a JSON identifier.

Proposed next backend work (flagged, **not implemented or an agreed contract**):
expose a documented dictionary of stable UI label keys with resolved strings and
culture, using existing Dictionary resources where they exist. Agree how request
culture is selected and fallback rules before adding a client language selector
or changing cache keys. Offline/login/network-error UI also needs bundled locale
resources; it cannot rely on a successful API request. Keep any agreed transport
addition in the backend mobile-api.md, not just this app note.

No backend contract, dependencies, auth, entitlements, timeout or account drafts
were changed. Next concrete step: backend owner confirms the label inventory and
culture-selection contract; then replace the legacy fallbacks with supplied
labels and complete the remaining resource migration. Current help/navigation
visual behavior needs the iPhone checks in contextual-help.md.
