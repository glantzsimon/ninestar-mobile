# Explore availability and AI Astrologer handoff

Updated 2026-10-29

## Implemented

Removed the Karmic Numerology entry from exploreFeatures at the owner's request.
Its unused central label and artwork ID remain available for a later return.
AI Astrologer now opens the owner's explicitly approved temporary existing GPT
destination using Expo Linking, with the shared external-link error dialog.
Source: website Views/Shared/_Navbar.cshtml uses
ApiConfiguration.Instance.NineStarKiAstrologerGptUrl; Config/appsettings.json sets
https://chatgpt.com/g/g-67b146c065ec8191b7ec0850404fef33-9-star-ki-astrologer.
website-links.ts owns that exact public URL. No credentials, chart/profile data,
prefilled messages or query parameters are passed. OS browser/app handling is
platform-controlled; iPhone handoff is still unverified. No expiry date was
independently established. The native calculators remain native.
The public Integration homepage was also checked on 2026-10-29 and contains
the identical GPT URL. This verifies the deployed website destination, not
ChatGPT availability, sign-in or an iPhone launch.

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
The temporary existing-GPT destination is now explicitly authorised and wired.
Articles is separately approved as a website blog link; see knowledge-base.md.

Need the exact plugin share/install link and its availability to intended users.
Then test an iPhone handoff: correct plugin destination, first-time installation
and connection, returning-user behavior, and whether a conversation can be
prefilled with that plugin selected. Only wire supported, verified behavior.
Automatic chat selection on mobile remains unconfirmed, not declared impossible.

## Validation

Lint and typecheck passed. Initial typecheck encountered the known stale generated
Router declaration issue; regenerated declarations from src/app with the installed
Expo CLI helper, then typecheck passed. Tracked-file whitespace check passed.
No new tests were added for removing a feature-list entry. No iPhone
handoff or plugin invocation has been performed. Existing 15-second API timeout,
authentication, entitlements and unsaved account edits are untouched.
