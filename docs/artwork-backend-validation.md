# Artwork catalogue validation — 24 October 2026

## Current status: deployed freshness verified; mobile integrated

Rechecked Integration after the owner's latest cache correction. An initial
request timed out at 15 seconds; the subsequent complete check passed:

| Request | Result | Emitted Cache-Control |
| --- | --- | --- |
| GET metadata/artwork | 200, 424 IDs, weak ETag | `public, max-age=300` |
| Matching If-None-Match | 304, zero body bytes | `public, max-age=300` |
| Old If-None-Match | 200, 138272 bytes | `public, max-age=300` |
| Anonymous account/me | 401 | `no-cache, no-store` |
| Anonymous membership/entitlements | 401 | `no-cache, no-store` |

The weak catalogue ETag is unchanged, as the image catalogue itself did not
change. The same seven representative image HEAD requests listed below passed:
200, image MIME, ETag and `max-age=2592000`. Earth/stable share their exact URL.
Evidence: `.expo/artwork-validation/deployed-cache-results.json` (latest run).
No catalogue header failure remains observed; the previous blocker is resolved.
No local website/IIS was started and no migration or deployment was performed.

The app catalogue cache/resolver and current chart consumers are implemented.
**71 tests, lint and typecheck pass**; live catalogue parsing passes for 424 IDs.
See [artwork integration](artwork-integration.md) for behavior, scope and remaining
device checks. Next concrete step: reload My Chart on iPhone and verify primary
energy artwork and Core section widgets. Device persistence/offline behavior,
authenticated catalogue parity and forced backend media fallback remain unverified.

The sections below are historical evidence, not current implementation blockers.

## Latest verification: deployed cache correction

This section supersedes the historical private-cache failure below.

Backend checkout `feature/mobile-json-api` is at `c403464c`, containing the
requested `0d5329aa`; fast-forward pull reported already up to date. The existing
local modification to `deploy/last_run.txt` was preserved.

VS2017 Community MSBuild 15 full Debug rebuild, .NET Framework, Any CPU,
C# 7.3, DeployOnBuild=false: **exit 0, 0 errors, 361 warnings**, 38.21 seconds.
Windows desktop xUnit 2.3.1: **609 passed, 0 failed, 0 skipped, 0 errors**
(606 WebApplication, 3 DataAccessLayer). Artwork classes account for 37 checks:
14 MobileArtworkCacheHelperTests cases, 6 MobileArtworkControllerTests cases,
17 MobileArtworkRegistryTests cases. The real HttpCachePolicy tests exercise
both NoCache (Debug) and ServerAndPrivate (Release) defaults inside the Debug
test build; this is not a separate Release build or an IIS pipeline test.
They confirm exact artwork GET exemption, private route/method/path boundaries,
public successful responses, five-minute GetMaxAge(), weak ETag and 304,
and unavailable-base no-store behavior. Private API base still applies
NoCache/SetNoStore; the full suite's entitlement/private-controller tests pass.
Logs: `.expo/artwork-validation/cache-fix-build.log`,
`cache-fix-build-console.log`, `cache-fix-tests.log`, `cache-fix-tests.xml`.

Read-only deployed Integration checks at approximately **15:08 UTC, 24 October**:

| Request | Result | Actual Cache-Control |
| --- | --- | --- |
| GET metadata/artwork | 200, 424 logical IDs, weak ETag | `public` |
| GET with matching If-None-Match | 304, zero body bytes | `public` |
| GET with old If-None-Match | 200, 138272 body bytes | `public` |
| GET account/me, anonymous | 401 | `no-cache, no-store` |
| GET membership/entitlements, anonymous | 401 | `no-cache, no-store` |

**Remaining failure:** catalogue 200/304 responses omit `max-age=300`.
A second unconditional request confirmed this, with no Expires header either.
The documented five-minute HTTP freshness lifetime is therefore not verified
and is absent from the observed headers, despite passing in-memory GetMaxAge()
assertions. Public caching and ETag correction are verified; investigate the
hosted response header generation before declaring the full contract passed.
Do not infer which IIS/module/proxy stage causes this from unit tests alone.

Representative exact returned image URLs were checked using HEAD (no large GIF
download): water energy, earth element, stable modality, water square trigram,
career UI, animated spinner GIF and the about.light dark variant. All returned
200, image/png or image/gif as appropriate, an ETag and
`Cache-Control: max-age=2592000` (30 days). Earth and stable share the identical
URL including revision query. These checks verify metadata/availability, not a
fresh visual inspection or GET-body validation of every image. Evidence:
`.expo/artwork-validation/deployed-cache-results.json`.

Authenticated catalogue equality and forced media-base fallback were not tested;
no credentials, memberships or service configuration were changed. No local
website/IIS startup, migrations or deployment occurred. The app's 15-second
timeout, authentication, entitlements and account edits remain untouched.

Catalogue client/cache/resolver integration remains deferred under the user's
validation gate because the emitted five-minute lifetime still fails the agreed
contract. Once corrected, recheck 200/304 freshness headers before implementation.

**Next concrete step:** the backend owner should investigate why the deployed
catalogue omits max-age despite SetMaxAge and passing real-policy tests, correct
the emitted HTTP lifetime, and notify the mobile work when Integration is ready.
Then repeat unconditional, matching-ETag and stale-ETag GETs, requiring
`Cache-Control: public, max-age=300` on 200/304 before adding the app catalogue
client/cache/resolver. This is a correction to the existing contract, not a
proposed contract change. Deployment remains the owner's separate workflow.

## Historical verification before cache correction

Backend branch `feature/mobile-json-api`, commit `e562ad10`. Fast-forward pull
reported already up to date. Read the Public artwork catalogue contract and
`docs/mobile-artwork-validation.md` in the backend checkout.

## Windows results

VS2017 Community MSBuild 15 full Debug solution rebuild, .NET Framework,
Any CPU, C# 7.3, DeployOnBuild=false: exit 0, 0 errors, 361 warnings.
Windows xUnit console 2.3.1: 591 passed, 0 failed, 0 skipped, 0 errors
(588 WebApplication, 3 DataAccessLayer). This includes 17 artwork registry
tests and 2 artwork controller tests. Local ignored logs:
`.expo/artwork-validation/build.log`, `build-console.log`, `tests.log`, `tests.xml`.

Optional generator check `python tools/update-mobile-artwork.py --check` could
not run: installed Python lacks Pillow (`ModuleNotFoundError: PIL`).

## Contract blocker

Read-only anonymous HTTP checks against the already deployed Integration URL
returned 200 with 424 logical IDs / 431 variants, absolute image URLs, a weak
ETag, 304 with an empty body for the current validator, and 200 for an old
validator. Earth and stable assets share their exact URL. Representative energy,
trigram, element, modality, moon, flag, organ, numerology, animated and dark
variant image URLs returned 200 with image MIME types.

However, 200 and 304 responses return `Cache-Control: private, max-age=300`
(one cached 200 had max-age=250). The required policy is **public**.
Evidence is in `.expo/artwork-validation/live-results.json`.

`webapp/WebApplication/Global.asax.cs` Application_BeginRequest calls
SetCacheBehaviour, which applies NoCache under DEBUG and ServerAndPrivate in
Release. ASP.NET cache policy cannot subsequently be loosened by the public
controller; controller-only mock tests do not exercise that pipeline.

Recommended backend correction: exempt only the public artwork GET from the
global restrictive policy so its controller owns public 200/304 caching and
no-store 503 errors. Preserve private API cache rules. Add pipeline verification
in Debug and Release, including conditional GET and invalid media-base behavior.
No backend source was changed here.

## Local HTTP validation remains outstanding

Unit tests exercise the local compiled controller and registry, not IIS.
Normal DEV startup calls DbMigrator.Update in App_Start/DataConfig.cs. The user
prohibits migrations, so the full website was not started. A migration-free
hosting path is needed for genuine local HTTP validation. No deployment occurred.
Authenticated versus anonymous catalogue equality also remains unverified over
HTTP; the public controller is marked AllowAnonymous and session-disabled.

The requested backend validation gate has **not passed**. Catalogue client,
ETag/body cache and artwork resolver implementation remain deferred until the
cache policy and local HTTP checks pass. Existing bundled/legacy rendering stays.

## Independent mobile UI work

Core/Extended Profile use normal shared spacing. Your Summary has a short
expandable preview. Detail section widgets show one reading at a time, grouped
by topic; available summaries are the default, with optional full text replacing
the summary. These are shared presentation components and add no requests.

Illustrated energy facts remain pending catalogue integration. The current DTO
contains element, Yin/Yang, modality, trigram, colour, direction and family member,
but does not expose all website fact rows: season text, internal representation,
physiognomy, primary attributes and harmonious/challenging combinations. Those
need explicit server fields; the app must not invent them or derive asset URLs.

The 15-second request timeout, authentication, entitlements and account draft/save
behavior were untouched. No purchasing, membership change or migration was made.

Mobile automated verification: 62/62 tests passed; TypeScript noEmit passed.

Expo lint passed.
