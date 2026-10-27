# Localisation and API label gaps

Current source inventory: [UI label audit](ui-label-audit.md), reviewed 2026-10-26.
It supersedes earlier proposals and historical gap lists in this document.
The shared contract remains D:/Workspace/ninestar/docs/mobile-api.md.

Use API Dictionary-backed labels/content where exposed; never format JSON keys
into display names, remove About from a help title, or replace navigation labels
with longer introductory titles. Keep approved mobile wording in central uiCopy;
legacy scattered literals are listed in the audit for later migration.

Resolved API consumption includes six roleLabels, full energy banner titles,
Character child/adult-child/stress titles, contextual help, personalised readings,
Predictions period/cycle/group/scope/detail titles, organ/expansion titles and
labels, calendar labels/formatted dates/houses, and metadata enum options.
See role-label-validation.md, character-navigation-validation.md, health-api-review.md,
my-predictions.md and personal-calendar.md for exact behavior and verification limits.

Remaining domain labels include chart page/group/menu headings, energy-fact field
headings, calculation-control headings, feature navigation and membership names.
Your Predictions is the own page title and the Your Chart hub card label. The API
help.overview is followed by Houses You Currently Occupy as a section heading.
The page/subtitle now use owner-supplied data.labels.yourPredictions and
data.labels.housesYouCurrentlyOccupy; approved central copy is a loading/older-server
fallback. Hub heading Your Chart and the Your Personal Chart / Your Calendar
card labels remain owner-approved central resources pending navigation metadata.
Adult / Child Relationship's personalised heading remains separate from navigation
and help; retain the existing API heading rather than inventing a transformation
label. Any requested new personalised heading requires a documented backend field.

The audit also records English-label comparisons in EnergyFacts and raw enum
fallback in accountOptions. Stable IDs and translated labels must be distinct.
Some legacy chart group titles are inactive presentation metadata; do not expose
new resources for obsolete groups merely because their strings remain in source.

Proposed contract changes must be agreed/documented in ninestar before wiring.
Discuss field placement, full/free scopes, culture selection and missing labels.
Do not infer reading access from labels. Keep login/offline/error and generic
mobile controls in bundled locale resources so API failures remain usable.
No new language selector, culture override or cache behavior is implemented.
Next: backend AI reviews docs/ui-label-audit.md and documents the additive labels;
then migrate app consumers while preserving approved wording and access checks.
