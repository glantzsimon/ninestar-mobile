# Shared artwork integration

The authoritative public catalogue contract remains in
`D:/Workspace/ninestar/docs/mobile-api.md`. No contract changes were proposed or
implemented. Integration now emits public, max-age=300 on both 200 and 304;
see [validation report](artwork-backend-validation.md).

## App implementation

`artwork-catalogue.ts` owns typed parsing, per-environment memory entries,
concurrent request deduplication, five-minute freshness and conditional refresh.
Catalogue body and ETag are stored together. Unexpected 304 without a body retries
once unconditionally. Refresh failures retain last-good data; cold failures keep
legacy rendering and use a 30-second retry cooldown. Corrupt storage is ignored.
The 15-second deadline bounds headers and JSON body, even if fetch ignores abort.
Requests omit credentials and do not participate in session/authentication state.

`artwork-storage.ts` persists only public metadata in the native disposable cache
directory using Expo SDK58 FileSystem. Its web variant uses per-environment
localStorage with failure handled by the client. The dependency was added through
Expo install; FileSystem is already bundled in Expo Go. No native directories or
configuration plugins were changed. The root layout refreshes at startup, on
foreground and every five minutes; images never initiate catalogue requests.

`ArtworkImage` chooses an actual dark variant, falling back to default. It passes
exact returned URLs (including revision queries) to expo-image with memory/disk
caching and URL cache keys, so identical-content aliases share entries. It tries
catalogue, then legacy URL, then bundled fallback on image errors. It never
prefetches all images. Missing/unknown IDs leave existing rendering intact.

Full chart energy parsing preserves returned artworkId and available fact-image
IDs. EnergyCard uses catalogue artwork with unchanged legacy/bundled fallback.
Numbers-only free responses retain bundled energy artwork; no catalogue URL is
derived from a number. Shared section widgets use explicit stable UI catalogue
IDs. Energy at a Glance renders available Yin/Yang, element, group and trigram
illustrations plus colour, direction and family member. Missing facts are omitted.
No client interpretations or facts are inferred.

## Validation and remaining work

71 app tests pass, Expo lint passes and TypeScript noEmit passes. Nine new tests
cover initial/persisted load, freshness, conditional 304, missing-cache recovery,
changed host/version, environment isolation, concurrent callers, failures,
variants/missing IDs/shared URL entries and a transport that ignores cancellation.
The parser also accepted the actual 424-entry Integration catalogue.

No remaining observed catalogue header blocker. Device validation is pending:
first reload My Chart and confirm all three primary energy images appear and
opening Core shows illustrated section widgets. Then check Energy at a Glance,
foreground after five minutes, offline fallback and an unsaved My Account draft.
Check one step at a time with the owner. Authenticated full DTOs and browser CORS
remain device/browser checks; automated public requests do not log in as a user.

Cycles/planners, knowledge base, numerology and moon screens are not implemented
in the mobile app; their returned IDs can use the same resolver when added.
The six additional website table facts are now provided by the agreed contract
and connected to the shared Overview table for full/free charts; see
energy-metadata-validation.md. Free symbol labels/artwork IDs remain a separate
contract gap. There is no
change to purchasing, memberships, account saving, authentication or entitlements.
