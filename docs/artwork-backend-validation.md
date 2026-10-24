# Artwork catalogue validation — 24 October 2026

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
