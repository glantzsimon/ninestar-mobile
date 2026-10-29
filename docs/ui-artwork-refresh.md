# Antique gold UI artwork refresh

2026-10-27. Prepared against ninestar feature/ui-artwork-refresh, ec40fa6d.
Read local docs/ui-artwork-report.md and fetched the same report at the exact
commit through GitHub. Shared contract remains ninestar/docs/mobile-api.md.
No backend code, dependencies, images or deployment changed here.

## App mappings

FeatureArtwork owns the stable catalogue IDs. Existing display labels, layout,
button/image dimensions, spacing and theme colours are unchanged.

| Use | ID |
| --- | --- |
| Constitution / compatibility core-elements icon | ui.constitution |
| Character / compatibility character-elements icon | ui.character |
| Knowledge Base | ui.knowledge-base |
| Articles | ui.articles |
| AI Astrologer | ui.ai-astrologer |
| Personal Chart, own hub and calculator navigation | ui.personal-chart |
| Predictions, own hub and calculator navigation | ui.predictions |
| Compatibility / Relationships | ui.relationships |
| Origins | ui.origins |
| Cycles of Light and Dark | ui.daily-cycle |
| Yin and Yang | ui.yinyang |
| Nine Core Energies | ui.nine-core-energies |
| Nine Character Energies | ui.nine-character-energies |
| Yearly Predictions | ui.sun |
| Monthly Predictions | ui.moon |

Essence retains ui.fundamental-nature, rather than accidentally changing to the
new Personal Chart wheel. Actual numbered energy images, Facts and cycle reading
images remain server-selected domain artwork. Origins details remains text only.
The app header/bundled logo stays the gold/blue brand mark; ui.origins is a
navigation illustration, not a replacement brand logo. Modalities and cycle-five
diagrams keep their previous IDs. AI Astrologer's feature remains parked during
plugin review; only its navigation artwork is mapped.

## Resolution and caching

For ui.* IDs resolve the exact data.assets[id].variants.default.url in both
themes. Other artwork keeps its existing dark/default behavior, including
cycle-five diagrams. No URLs are constructed from filenames, IDs or labels.
LegacyUiArtwork allows missing new IDs to resolve corresponding previous
catalogue IDs during rollout, followed by the existing legacy/bundled image
fallbacks. Canonical entries always take priority as soon as available.

The image control still sends original URLs to expo-image with memory/disk
cachePolicy and revision-bearing URL cache keys. There is no tint, flattening,
opaque background baked into the asset, re-encoding or image resizing. Thus
transparency is retained by the original supported PNG rendering path; live
alpha-channel/pixel validation is not claimed before deployment.

The existing store refreshes at startup, foreground and five-minute intervals.
Freshness, per-environment metadata+ETag persistence, conditional GET/304 reuse,
request deduplication, last-good failure recovery and the 15-second timeout are
unchanged. A deliberate post-deploy check can call refresh(environment, true),
which still uses the stored ETag. Do not clear caches or add bypass query strings.
New catalogue revisions update image URL cache keys naturally.

## Validation and deployment gate

### Live recheck: catalogue updated, media still old (2026-10-27)

Triggered by owner asking whether the light/dark and Yin/Yang icons were made
locally. They are not app-generated: mappings are ui.daily-cycle and ui.yinyang,
resolved through the exact default URLs supplied by the API.

Integration catalogue now returns 200 with public, max-age=300; matching ETag
returns 304 with public, max-age=300. All 15 distinct requested IDs have default
URLs. This supersedes the earlier assumption that no refreshed catalogue is live.
The returned URLs point at https://9starkiastrology.com/Images/ui/, not the
Integration host. No app environment or media host was manually switched.

Both representative image downloads returned 200 PNG, max-age=2592000, but their
bytes do NOT match the catalogue revisions:

| ID | Catalogue revision | Actual downloaded SHA-256 |
| --- | --- | --- |
| ui.daily-cycle | c0551de9a15386cc579ffc4880955b676a6ae76b5cb8e703e386909119fbfffe | 52be5aae23108770cfec98cbd551fb81c1b9b7cc79298ebaa74754b4c9b1fbd3 |
| ui.yinyang | 3495413cba4af1db9618f3c28e95008c5a6aef2d3d6b8e78922bf0ec671c86c5 | c552a9bb6ef1c1024b838b6ee89e7fcf2e73fc7cb9c551bebdbcb56acb6dbe40 |

Visual inspection confirms the previous flat gold medallions (cartoon day/night
scene and black Yin/Yang), rather than the redesigned antique engraving. These
actual hashes also match the previous catalogue inventory. Files saved only to
ignored .expo/artwork-live-check for inspection; no source images were replaced.

Remaining blocker: deploy refreshed images to the actual returned media host
and invalidate any intermediary cache serving the wrong bytes. Recheck exact
revision-bearing URLs and hashes before claiming artwork deployment complete.
Because wrong bytes were served under new revision URLs, existing device image
caches may also contain them; assess targeted recovery after the server returns
correct bytes, without adding guessed URLs or clearing unrelated app state.
No app code, cache reset, upload or deployment performed during this diagnosis.

All 198 automated tests, lint, final typecheck and tracked-file whitespace checks
passed. Offline iOS export passed (1858 modules, 46 assets, 2.9 MB JavaScript).
Generated route declarations were refreshed with the installed Expo CLI helper
before typecheck; no application route types were bypassed. New regression coverage checks UI
default versus non-UI dark variants, pre-deploy fallback to existing IDs,
canonical priority, and forced conditional refresh changing image cache keys
without dropping its ETag or public request behavior.

At initial preparation the owner said this backend commit was not deployed.
The subsequent live recheck above now establishes a refreshed catalogue but
stale media responses. Backend's source/alpha checks do not establish correct
bytes on the running media host.

Next concrete step: backend/media owner uploads the refreshed images to the
returned host and resolves stale cache responses. Then recheck representative
hashes/PNG transparency, conditionally revalidate the catalogue through existing
ETag handling and guide an iPhone Explore/Knowledge Base check.
Backend artwork and catalogue must be deployed together, including any separate
media host. Never switch the API environment or deploy from this task.
