# Shared website/app entitlements

Integration base: `https://int.9starkiastrology.com/api/mobile/v1`.
The authoritative contract remains `D:/Workspace/ninestar/docs/mobile-api.md`.
This phase reads existing website memberships; Apple billing is not implemented.

## App behaviour

`GET account/me` establishes the session and supplies its additive `entitlements`.
`GET membership/entitlements` refreshes the shared snapshot. The client validates
the response shape and renders server-owned benefits, without calculating access
from dates, legacy membership fields or receipts. Own-chart endpoints continue
server authorisation and the explicit membership-denied free fallback. A fresh
paid-route denial clears any previously displayed paid snapshot.

The memory-only store tracks identity, session generation, request order and
entitlements separately from editable account fields. Login/logout/account
switches clear previous access. Old-account replies, background reads during
logout and out-of-order access reads cannot restore stale access. Authentication
expiry clears local state. Transport/invalid-response failures clear unconfirmed
access without automatically replaying requests.

Account email is an internal change marker because `account/me` does not expose
an immutable account ID; it never selects an API owner or grants permissions.
Explicit sign-in always changes the generation. A changed saved email also
conservatively resets the local form. A future additive immutable ID could
improve this marker but is not required for this phase.

My Account keeps its draft while membership refreshes, tabs change or the app
returns from the background. A session-generation change remounts the form,
discarding the previous account's fields. Only explicit Check Saved Details recovery
or successful save read-back replaces the current account's draft. Refresh never
saves profile fields. My Chart refreshes access/chart on focus/background return;
My Account refreshes access alone. Background detection remembers iOS's
intermediate inactive state; listeners run only for the focused screen.

Your Membership refreshes automatically, offering Try Again only when access
cannot be confirmed. The visible refresh, snapshot comparison and diagnostics
controls were removed after device testing. Their transport/comparison helpers
remain available for automated tests. Sign Out lives in My Account and uses the
existing CSRF-protected API; local access
clears immediately, and an uncertain server outcome shows a retry message.

All requests retain the existing **15,000 ms timeout**. No dependencies, backend
code, memberships, migrations or deployment were changed.

## Validation — 23 October 2026

Live fresh anonymous requests to the configured Integration URL:

| Endpoint | Status | Error | Envelope/headers |
| --- | --- | --- | --- |
| GET membership/entitlements | 401 | authentication_required | success false, data null, JSON, no-cache/no-store |
| GET account/me | 401 | authentication_required | success false, data null, JSON, no-cache/no-store |

Local automated tests: **39 passed, 0 failed**. Lint and TypeScript checks pass.
Coverage includes server-owned
flags, malformed snapshots, comparison excluding only `asOfUtc`, logout races,
account switches, response ordering, CSRF/no replay and the exact timeout, plus
existing profile/chart cases. Tests confirm access refresh preserves the form's
generation; actual form interaction remains a device check.

The owner confirmed **HTTP 200 and matching snapshots on the iPhone** for its
signed-in account. Coverage across distinct free/paid/lifetime accounts remains
pending. The owner logs in on the phone; do not request or locate account
passwords for desktop validation. The app comparison action checks that session.
Expiry/deactivation checks were not manufactured by changing memberships.

## iPhone checks — guide one at a time

The following records the development validation sequence. The manual refresh,
comparison and diagnostics controls have since been removed from normal screens.

1. Open the updated app in Expo Go and sign in to an existing test account.
   Under My Chart → Connection Help, tap Compare Membership Snapshots.
   Confirm HTTP 200 for both and agreement apart from check timestamps.
2. Open My Account and check Your Membership. Edit a first-name field locally
   without saving; tap Refresh Membership and confirm the edit survives.
3. Background/reopen on My Account, then switch tabs and return. Confirm the
   unsaved edit survives. Explicitly reload saved details to discard that edit.
4. Sign out. Confirm chart/membership disappear and My Account no longer shows
   the previous profile. The comparison action reports signed-out HTTP 401
   (stopping at the first protected endpoint); both anonymous endpoints were
   independently checked above.
5. Sign into the next existing free/paid/lifetime account. Repeat comparison and
   check the membership/chart against its actual server permissions. Do not
   change any membership for testing.
6. If practical, interrupt a membership refresh with a network outage. Confirm
   failure offers retry without granting access or saving a profile.

Device checks are not yet recorded as passed. Membership benefits do not confer
administrative roles; chart permission remains server-owned.

## My Account timeout investigation

Historical investigation: diagnostics were subsequently removed from the normal
UI after the owner confirmed successful reload and requested UI cleanup. Keep
the bounded request lifecycle and automated regression tests.

The owner subsequently reported a My Account request timeout. Its old generic
message could not identify which of account/me, metadata/options or
metadata/timezones failed; a successful snapshot comparison does not exercise
the latter two. There is no evidence yet that logout caused the timeout.
Logout is called only by the explicit Sign Out action; session changes also
occur on sign-in, authentication-required responses and detected identity changes.

Confirmed client cleanup issues addressed:

- Account loading used Promise.all, releasing its guard on the first failure
  while siblings could still run. It now waits for all three to settle before
  releasing loading/retry state.
- Initial account loading had both mount and focus entry points (guarded, but
  redundant). Focus is now the single entry point.
- The membership panel reread account/me immediately after the initial account
  load. It now uses that fresh snapshot on its first focus; subsequent focus,
  foreground and explicit membership refresh remain supported.
- Timeout used abort alone. A deadline now also settles the client promise at
  15 seconds, including a stalled body or fetch that ignores abort. Late work
  cannot mutate session state after deadline completion. This cannot prove that
  IIS has stopped processing an aborted request.
- Generation changes actively cancel obsolete transports and release callers;
  they are reported as session_changed, separately from request_timeout. Timers,
  active entries and screen busy flags clear in finally blocks. Membership UI
  callbacks also avoid setting state after unmount.

My Account errors now include the failing endpoint. Its Request Diagnostics
disclosure shows recent request IDs, GET/POST paths, session generation,
HTTP status if received, outcome, elapsed milliseconds, waiting phase and
pending count. It stores no request/response bodies, cookies, tokens, emails
or passwords, and does not persist the trace. Diagnostics remain available
on the signed-out account screen. Parallel metadata calls and a chart already
in progress may still overlap; the trace measures that rather than assuming
server queuing/session locks are the cause.

45 automated tests pass; lint and typecheck pass. Coverage includes sibling cleanup, deadline/body timeout,
ignored abort, obsolete transport cancellation and late replies. Next device
step: open My Account once, wait for success/error, then report the timeout
row and pending count from Request Diagnostics. Keep the existing session;
do not log out, save profile fields or repeatedly retry during this capture.
