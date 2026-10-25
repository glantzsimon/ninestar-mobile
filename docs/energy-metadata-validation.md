# Overview metadata integration — 24 October 2026

Read the shared contract's Chart overview table metadata section in
`D:/Workspace/ninestar/docs/mobile-api.md`. No contract change was proposed or
made. Full energy DTOs add six strings; free own-chart `energies` entries contain
number plus nine allowlisted display strings. Existing top-level free numbers
and granted reading sections remain authoritative and unchanged.

## Live Integration checks

Read-only anonymous GET knowledge-base returned 200 with no-cache, no-store.
Its energy projections contain all six new fields as strings in 72 entries,
covering all nine energy numbers. Exact keys match the contract: season,
internalRepresentation, physiognomy, primaryAttributes,
mostHarmoniousCombinations and mostChallengingCombinations.
Evidence (public metadata only):
`.expo/artwork-validation/energy-metadata-live.json`.

Anonymous personal-chart/me and personal-chart/me/free both returned 401 with
no-cache, no-store. No authenticated session was available to this check; the
owner logs in on iPhone. Same-account full/free projection parity and website
row parity therefore remain unverified over authenticated HTTP. No credentials
were requested, accessed or recorded. No backend build/startup, migrations,
deployment, membership or purchasing action was performed in this task.

## App consumption

Automated results: 78/78 app tests passed; Expo lint and TypeScript noEmit passed.
New cases verify full/free nine-row mapping, exact combination display strings,
paid-prose exclusion and graceful missing/null/non-string/legacy metadata handling.

The shared chart parser now reads all nine table facts for full and free energy
metadata, in website order: Colour, Direction, Family Member, Season, Internal
Representation, Physiognomy, Primary Attributes, Most Harmonious Combinations,
Most Challenging Combinations. Existing EnergyFacts/More Details renders these
without screen-specific changes. Missing/null/non-string rows are omitted;
strings are rendered as inert native text. Combinations stay comma-separated
display strings; no compatibility calculation or array interpretation occurs.
Old free responses without energies still render their existing number fallback.
Free descriptions and symbol fields remain excluded from the fact list.

The free metadata projection does not include Yin/Yang, Element, Group, Trigram
labels/artwork IDs. That separate five-symbol limitation is not fixed by these
six table fields; it would require an agreed contract extension. No full paid
DTO is inferred or fetched to fill the gap. API timeout remains 15 seconds;
authentication, entitlements and unsaved account edits are untouched.

Next concrete step: reload My Chart on the signed-in iPhone, open Core → Overview
→ More Details and check all nine rows against the website for that energy.
If a row is absent, determine whether the authenticated endpoint omitted/returned
an empty string before treating it as an app rendering error.
