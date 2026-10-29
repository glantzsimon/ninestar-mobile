# Compatibility element visuals — 2026-10-27

## Contract source

Read the owner's field contract and the current GitHub master
ninestar/docs/mobile-api.md, “Compatibility element diagrams and total-elements
pie” (document blob 84b42c11ee89127d4f189c17677be002df62bba0). Local backend
docs did not yet contain this section at inspection. No backend files, route,
service, dependencies, membership or contract fields were changed by mobile.

## Implementation

Owner follow-up clarified the spacing: ArtworkDiagram adds just 2 logical points
below each transformation diagram through LayoutSpacing.figureBottom; the
pie/legend group adds 16 through LayoutSpacing.chartBottom. This supersedes the
uniform 8-point trial. Existing panel gap and internal pie/legend spacing stay
intact. Lint/typecheck passed; device spacing check pending.

Compatibility parses details.elements.fundamentalTransformation.artworkId and
characterTransformation.artworkId independently. It never chooses supportive,
challenging or same artwork by interpreting type, kind or either person's energy.
CompatibilitySectionContent places one ArtworkDiagram at the first embedded HTML
image position. Text before/after that image and the following compatibility prose
keep their existing rich-text formatting. readingBlocks suppresses HTML image
tags, so no duplicate website image is rendered. Older responses without explicit
artwork retain the existing text. Missing/unavailable/failed images omit the visual
without hiding the reading or inventing replacement interpretation.

ArtworkDiagram is a shared responsive figure (100% available width, up to source
440 points, catalogue aspect ratio, contain fit). ArtworkImage and the existing
catalogue resolver own dark/default selection, exact revision-bearing URLs,
conditional catalogue refresh and memory/disk image caching. No constructed URLs
or new imagery are introduced. A catalogue revision can recover a failed image.
Normal section selection mounts just the selected reading/visual.

Total Elements renders ElementBreakdown above its existing prose, matching the
website. It consumes only details.elements.breakdown, not aggregate score fields.
The native SVG pie uses precise percentages, normalising visual slices only. The
legend retains supplied integer values, API labels, segment order and API colours;
33 + 11 + 55 stays 99. Zero segments remain in the legend; a 100% segment renders
a full circle correctly. The chart is decorative to accessibility because all
labels/values remain readable in the native-text legend, without relying on colour.

Parsing requires the three known unique segments, nonempty labels, finite
0–100 proportions, bounded integer values, allowed CSS hex/red colours and a
complete percentage distribution (100 within 0.1 for rounding). Malformed/partial
visual data stays absent while prose remains available. Labels alone still grant
no reading access. Visual-only sections require their supplied section labels.

## Public Integration validation

Anonymous metadata/artwork GET returned HTTP 200 and public, max-age=300.
All six catalogue URLs passed HEAD checks:

| Diagram | Variant | HTTP | Type | Catalogue dimensions |
| --- | --- | --- | --- | --- |
| supportive | dark | 200 | image/png | 440 × 440 |
| supportive | default | 200 | image/png | 440 × 440 |
| challenging | dark | 200 | image/png | 440 × 440 |
| challenging | default | 200 | image/png | 440 × 440 |
| same | dark | 200 | image/png | 440 × 440 |
| same | default | 200 | image/png | 440 × 440 |

These checks establish catalogue/media availability, not authenticated calculation
field presence or visual comparison against a particular pair. No credentials,
private payloads, cookies or account details were used or recorded.

## Automated validation and next step

178 tests passed, including three new breakdown/pie tests and two new Compatibility
visual tests. Coverage includes precise versus integer values, a 99 legend total,
zero/full-circle paths, malformed/partial distributions, independent core/character
IDs, preservation of text around embedded images, missing old-server fields and
labelled visual-only sections. Existing artwork-cache/variant tests also pass.
Lint/typecheck and targeted whitespace checks passed. Offline iOS export passed:
1,846 modules, 46 assets, 2.9 MB JavaScript, ignored output at
.expo/compatibility-elements-validation. No new dependencies were added.

The 15-second timeout, authentication/CSRF, entitlements, privacy/age gates,
remembered inputs, unsaved account edits and existing UI/scrolling remain intact.
No migrations, deployment, purchasing or live calculations were performed.

Next concrete iPhone check: calculate Compatibility, open Core Elements, and
confirm one transformation diagram appears with its reading. Then check Character
Elements independently, and Total Elements pie/legend against the same website
pair. If diagrams/pie are absent while prose remains, first confirm authenticated
Integration responses include the newly deployed fields; do not infer them locally.
Native layout/VoiceOver, actual private payloads and same-pair website comparison
remain unverified.
