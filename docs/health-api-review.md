# Health sections: API exposure review

## Current integration: commit ece49172

Local backend branch feature/mobile-json-api is at the requested ece49172.
Read the shared contract's Health panel parity section and checked the mapper,
DTO and website Health partials. No backend code, deployment or migration changed.

Integration verification: two initial public knowledge-base attempts timed out
at the retained 15-second deadline. A subsequent check succeeded: metadata/options
200; personal-chart/me anonymously 401; knowledge-base 200 with 72 full-energy
projections, all 72 containing the new nonempty yinYangExpansionTitle. All used
no-cache, no-store. This verifies the additive energy field is deployed, **not**
an authenticated own-chart health.strongOrgans/weakOrgans response. Evidence:
.expo/artwork-validation/health-deployment-check.json. No credentials or account
cookies were accessed; the owner signs in on iPhone.

App implementation: the full-chart parser validates new panel titles/htmlBody and
organ value/label/artworkId shapes before use. It ignores malformed/missing organ
entries rather than generating a display name from value. Free parsing explicitly
discards all new health/expansion fields even if unexpected data supplies them.
Core's Health selection uses the shared chart/modal UI and website panel order:
health reading (summary-first/full optional), common challenges body, expansion
group, Strong Organs, Weak Organs. Organ lists preserve Yin then Yang order and
each array's order. The shared resolver downloads only displayed organ artwork;
missing artwork keeps the supplied translated label, without invented paths.
ReadingContent preserves native headings/paragraphs/bullets/bold and ignores
inline HTML colours, retaining the app's themed text colour.

Older full responses retain existing readings; expansion/organ panels without
their required new title/content are omitted. New full fields never infer or
grant membership access. The existing server full/free check remains the owner.
No new API call, account-edit flow, purchasing or timeout change.

Label gap: the organ-panel titles/labels and expansion title now come from the
API. The first Health reading keeps its existing central-resource Health label;
Common Health Challenges uses the owner's requested wording in the central
translation resource. Their source sections currently have only body/summary,
not Dictionary-backed title fields. Flag those two title fields for a future
agreed backend addition; do not fabricate energy-specific website titles.

Next concrete step and remaining verification: on a signed-in account that already
has full chart access, open Constitution → Health and verify all five panels,
their translated labels and organ images. This confirms the private new fields
actually arrive; source parity/public rollout signals are not a substitute for
that check. The user's free overview remains unchanged; no membership should be
altered for testing. If only free access is available, authenticated full-field
verification remains blocked until an existing authorised session is available.

The earlier source-gap review below is historical; ece49172 resolves organ labels,
organ explanations/titles and the expansion title, not the first two panel titles.

Latest automated validation: 94/94 app tests passed; Expo lint and TypeScript
noEmit passed. Five new cases cover translated labels versus enum identifiers,
organ order/artwork references, rich HTML/theme-safe normalization, free-response
exclusion, malformed/older fields and unchanged health/challenge readings.

## Historical source review before ece49172

Read against the website _ProfileHealth.cshtml, its Strong/Weak organ partials,
MobilePersonalChartMapper and MobilePersonalChartResponse. Source inspection;
no authenticated Integration request was replayed and no implementation changed.

Full GET personal-chart/me already contains:

| Website section | Existing JSON fields |
| --- | --- |
| Health and physical wellbeing | sections.health.summary / body |
| Common Health Challenges | sections.illnesses.body |
| Expanding or contracting group | energies.core.yinYangExpansionDescription |
| Strong organs | strongYinOrgan, strongYangOrgan, matching singular artwork IDs |
| Weak organs | weakYinOrgans, weakYangOrgans, matching artwork ID arrays |

Artwork fields: strongYinOrganArtworkId, strongYangOrganArtworkId,
weakYinOrganArtworkIds, weakYangOrganArtworkIds. Resolve exact returned IDs in
the shared artwork catalogue and retain array order. Missing IDs need graceful
fallbacks; never derive image paths from raw organ names.

The free own-chart projection does not contain these paid Health readings,
expansion prose or strong/weak organ selections. It includes only previously
granted reading sections and allowlisted overview metadata. Do not widen access
or infer personalised organs from energy numbers.

Exact website parity/localisation gaps: DTO organ values use enum ToString(),
not a dedicated Dictionary-backed display label. The website organ panels also
include StrongOrgansDescription / WeakOrgansDescription, currently not exposed
by chart help. Section titles (including energy-specific health/challenge and
expansion/contraction titles, and Strong/Weak Organs) are not projected as
Dictionary-backed title fields. These gaps must be flagged for agreed additive
backend metadata/help before reproducing those texts; do not invent/split enum
names or hardcode translations. Existing UI label gaps are in localisation.md.

The app currently consumes Health/illnesses readings but not expansion or organ
DTO fields. Next concrete step: agree/expose the missing titles, localized organ
labels and generic organ explanations, then add shared health section widgets
and organ rendering using the existing full DTO and artwork resolver. Preserve
15-second timeout, authentication/entitlements and unavailable free states.
No tests needed/run for this read-only review; no migrations/deployment/purchasing.
# Owner device follow-up

2026-10-25: owner confirmed Health is looking good after being asked to check the
five panels and organ images. Treat as owner visual acceptance, not a new
automated/private-response inspection. Continue Character review next.

