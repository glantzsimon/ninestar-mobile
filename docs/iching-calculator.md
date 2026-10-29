# I Ching calculator — first pass, 2026-10-27

Explore → I Ching opens /explore/iching in the existing Router stack. This is a
working public casting/result flow with first-visit help. Final website
presentation labels remain pending the backend additions requested by the owner.
See iching-api-handover.md for the exact resource inventory; no speculative
response fields have been consumed; the help route is now documented/deployed.

## Native flow

The initial page uses AppScreen/AppPanel, the shared catalogue's iching.iching
artwork (dark/default, cached on demand, existing brand fallback) and the website's
exact Generate Hexagram action text, centrally stored in ui-copy.ts. It does not
request birth details, sign-in or a second account session.

Generate explicitly gets fresh account/csrf then posts {} to iching/cast once.
The existing public controller still requires anti-forgery; no account/membership
load, credit route, initial/background cast or automatic replay is introduced.
The request uses the shared 15-second transport, cookie jar and generation
cancellation. A synchronous pending guard prevents duplicate taps. Failures use
the shared warning dialog and retain any previous successful reading. Busy state
is cleared in finally. Visible results clear on session-generation change.

Results render directly in primary/transformed order, in one AppPanel or two
when transformed is supplied. No menu button/energy selection/modal is required
to see the reading. A measured AppScrollTarget brings each new result to the top;
the back/generate actions reuse AppActionGroup. Recasting never happens on focus.

HexagramDiagram draws the six supplied line identifiers using native Views:
Yin/ChangingYin are broken; Yang/ChangingYang are solid; changing lines use the
website's dark-theme orange (#ffb74d) on a high-contrast paper background. Array
order is rendered top-to-bottom, matching Hexagram.ToHtml. The client never
computes King Wen numbers, coin tosses, transformed lines or interpretation text.
The server's transformed result is authoritative, even when absent.

Returned name, info.name/stage/title/summary/details and changingLinesInterpretation
are preserved through safe native text. Full details use the existing collapsed
AppDisclosure; changing-line HTML headings/body remain directly visible beneath.
Empty optional bodies omit their widgets rather than creating blank panel gaps.
Unknown line identifiers or malformed present hexagrams reject the response rather
than displaying a misleading partial reading. No reading results are persisted.

## Remaining API gates

The first-visit help gate is resolved: public GET iching/help supplies
data.help.overview title/htmlBody/culture. The app fetches it once on entry and
uses ContextualHelp above Generate, hiding it once results are displayed. Missing,
malformed or failed optional help does not block casting. Stale/unmounted/session-
changed replies are ignored. No CSRF request or cast is triggered for the helper.

Until label additions are documented/deployed, result panels use supplied
hexagram names rather than invented Main/Transformed labels,
full text uses the existing generic Read More label, and number/name use simple
punctuation without inventing a translated Hexagram prefix. The temporary functional
Generate Hexagram and existing I Ching feature name remain central resources.
These are known incomplete presentation requirements, not claimed website parity.
Help returned with a cast is parsed but not displayed on results.

The backend request names existing resources: IChing, GenerateHexagram/Generate,
YourHexagram, MainHexagram, TransformedHexagram, DetailedInterpretation, plus a
formatted/localised hexagram heading and any final accessible line descriptions.
Backend owns translations of current info/name strings. Never translate enum keys
or derive panel titles by stripping words from a help heading.

## Public Integration validation

One anonymous probe used a temporary cookie jar (no login/credentials):
account/csrf returned 200; iching/cast returned 200 JSON success, primary number
54 with six recognised lines, nonempty interpretation details and a transformed
hexagram. Supplied help title was About The I Ching, culture en-GB. The response
had no labels property. No account, membership or credit service is called by the
inspected public controller/service; the probe did not save account preferences.
Tokens/cookies were kept only in probe memory and are not recorded here.

Public catalogue iching.iching dark/default URLs both passed HEAD checks:
HTTP 200, image/png, 200 × 200 catalogue dimensions. No new image assets,
dependencies, backend changes, migrations, deployments or purchasing work.

## Validation and next step

185 tests, lint and typecheck passed. New tests cover one/two-result parsing,
missing optional prose/help, valid six-line types, order preservation, rich HTML,
input immutability, independent transformed readings, malformed results, fresh
CSRF while signed out, generation changes preventing POST and failure without
retry. Offline iOS Metro export passed in ignored
.expo/iching-calculator-validation; this is bundle validation, not a signed build
or iPhone interaction check.

Help follow-up: anonymous Integration GET iching/help returned 200 JSON,
Cache-Control no-store, no-cache, success true, title About The I Ching,
culture en-GB, HTML length 2702 and null error. 187 tests, lint and typecheck
passed after wiring the new source. Two added tests verify one public help GET,
API formatting/culture, absent/malformed help and failure without casting/retries.
The earlier iOS export predates this small help-loading change.

Next device check: reopen Explore → I Ching and confirm About The I Ching appears
above Generate, using the usual collapsed preview/expansion control.
Then generate one reading and verify the directly visible panels and collapsed
full text. Native appearance, accessible diagram descriptions and user-side
casting remain unverified. Next implementation step: read the new deployed
introduction/label contract and connect those fields to complete the requested
first-visit help and panel wording.
