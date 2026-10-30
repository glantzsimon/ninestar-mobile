# Explore availability and AI Astrologer handoff

Updated 2026-10-30

## Current implementation

Removed the Karmic Numerology entry from exploreFeatures at the owner's request.
Its unused central label and artwork ID remain available for a later return.
Explore opens `/explore/ai-astrologer`. Each screen focus fetches
`GET /api/mobile/v1/content/ai-astrologer` through the normal cookie-aware
15-second/session-aware API transport. The response's root `title`, `htmlBody`
and `culture` form the shared expandable ContextualHelp panel; its nullable
`externalUrl` is the only launch destination. The button uses the existing
Dictionary-backed AI Astrologer navigation label and is omitted for null or
invalid non-web URLs. A fetch/open failure uses the shared error dialog. No URL
is hardcoded, cached between opens, or augmented with profile data, credentials,
prompts or query parameters. The endpoint schema was provided by the owner for
this task but is not yet present in the shared `ninestar/docs/mobile-api.md`;
the shared contract documentation should be updated by its owner. No Integration
response or native handoff was verified in this implementation pass.
The screen's return action uses the API-backed “Back to Explore” label.

The earlier temporary GPT destination was removed from `website-links.ts`.
Its previous website observation below is historical evidence only and does not
authorize fallback behavior if the API omits a URL. Native calculators remain
native.

## ChatGPT plugin proposal

The owner is developing a plugin to replace their old GPT and asks whether the
AI Astrologer card can open it in ChatGPT. This specific proposed external handoff
is distinct from native API-backed calculator features.

Official documentation consulted:

- https://learn.chatgpt.com/docs/plugins : plugins available to the user's account
  can run on supported web, desktop and mobile surfaces; installation and any
  required service connection precede use, and an @ mention selects a plugin.
- https://learn.chatgpt.com/docs/reference/commands : the desktop app supports
  codex://new?prompt= with a URL-encoded prompt containing a plugin mention.
  It prefills the composer, does not send automatically, and may require install
  and connection steps. This is documented as a desktop feature, not a verified
  iOS/Android URL contract.
- https://developers.openai.com/plugins/build/extensions : extension deep links
  target pages/items in a sidebar app; this does not establish a mobile
  plugin-selected conversation launch URL.

Do not assume desktop codex:// links work on phones. Do not promise silent
installation, automatic message submission, shared NineStar/ChatGPT login or
automatic access to the user's chart. Never include credentials, tokens or birth
details in launch URLs. A normal plugin share/install link is the candidate
starting point once the owner supplies it; its mobile behavior must be tested.

## Blockers and next step

Owner update: plugin is under review, so the replacement handoff remains parked.
The server-controlled external destination is now wired; its live value and
phone handoff still need validation. Do not restore the former static GPT URL.
Articles is separately approved as a website blog link; see knowledge-base.md.

Need the exact plugin share/install link and its availability to intended users.
Then test an iPhone handoff: correct plugin destination, first-time installation
and connection, returning-user behavior, and whether a conversation can be
prefilled with that plugin selected. Only wire supported, verified behavior.
Automatic chat selection on mobile remains unconfirmed, not declared impossible.

## Validation

The parser is covered by `tests/ai-astrologer.test.cjs` (valid response, preserved
HTML/title/culture, null/malformed URL and missing content). All 230 project
tests, lint, TypeScript and `git diff --check` passed. Initial prior typecheck encountered the known stale generated
Router declaration issue; regenerated declarations from src/app with the installed
Expo CLI helper, then typecheck passed. Tracked-file whitespace check passed.
No new tests were added for removing a feature-list entry. No iPhone
handoff or plugin invocation has been performed. Existing 15-second API timeout,
authentication, entitlements and unsaved account edits are untouched.
