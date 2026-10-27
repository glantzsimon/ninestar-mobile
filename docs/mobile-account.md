# My Account

Removed the unrequested sentence about sharing details with the website beneath
the Your Account heading (2026-10-26). No replacement guidance added. Lint,
typecheck and targeted whitespace checks passed; next: check the heading/content
transition on iPhone.

Copy cleanup (2026-10-26): removed birth-details review guidance and calculation
preference save guidance; approved birth-time explanation remains. Do not add
new explanatory copy without owner agreement. MembershipStatus no longer shows
generic paid/free access prose. Its normal panel is hidden pending a proper
API-authored membership label, while existing refresh/error/retry remain active.
Source audit: MobileAccountController.Me membership projection has dates/flags/
counters but no name; MobileEntitlementsMapper exposes subscriptionType as an enum.
Neither is a localised display label. Proposed backend addition: expose the
website's membership display label and define the no-membership display state;
field location/contract must be agreed/documented before mobile wiring. No backend
change or invented label implemented. Lint, typecheck and targeted whitespace
checks passed. Next: inspect My
Account cleanup on iPhone and obtain the documented backend label.

Naming convention: My Account remains the navigation destination; page heading
is Your Account in every screen state, sourced from central uiCopy. This matches
My Chart / Your Personal Chart. Account behavior and drafts are unchanged.
Lint and typecheck passed after the heading change.

Login persistence and OS autofill: see login-persistence.md. Stay signed in now
passes the user's choice to existing rememberMe (default enabled). Access still
comes from fresh server checks; no password or entitlement persistence in app
storage. Native restart/logout validation and standalone domain association are
tracked separately from account editing.

The mobile account screen edits the same account as the website, through the
existing `GET account/me` and `POST account/update` contract. No backend changes
or alternative account store are introduced. Personal, birth and calculation
fields follow `MobileAccountUpdateRequest` and `MobileCalculationRequest`.

Load account, metadata/options and metadata/timezones. Populate the form from
saved values, including separate birth/current timezones, the birth-time-known
flag, both hemisphere flags and marketing preference. Enum values and timezone
choices come from the server. Retain server-saved timezone aliases that are not
represented by the selector's preferred identifier. Never silently substitute
calculation settings when account/calculation data is absent; ask the user to
choose missing options.

The chart's `birth_details_required` message is broad: the full route can report
missing user/profile/date or invalid birth time, and the free route also uses it
for invalid saved calculation input. It does not prove that the user's date of
birth itself is missing. My Account displays saved fields for review without
printing private data to logs. The actual cause still requires inspection of
the authenticated response on the device; no guessed backend fix is applied.

## Saving

Date input uses YYYY-MM-DD, validated as a real date and sent unchanged without
UTC conversion. Birth time accepts 24-hour HH:mm or HH:mm:ss with optional
fractional seconds. Only add seconds when needed; do not combine time with the
date. Explicitly unknown time can use midnight while preserving the known flag
as false; actual known midnight remains true. The server validates all inputs.

Only Save Changes performs a write. Validate the form, fetch fresh CSRF, send
one POST with cookies and X-CSRF-Token, then reload the server's account details.
Do not include user IDs, membership, roles, avatar or password fields. No save is
automatically replayed. Uncertain network/timeout/server outcomes require reloading
saved details before another save. A successful write followed by read failure
is reported as saved, with a separate reload prompt.

After saving, View My Chart navigates to the existing route. That screen refreshes
on focus and requests a newly authorised chart using saved server preferences.
The My Account form preserves unsaved edits while moving between tabs. Save
Changes and Discard Changes appear only when the draft differs from its saved
baseline. Discard restores that baseline locally without a request. An uncertain
save pauses editing/saving and offers Check Saved Details, explaining that this
replaces local edits. Initial load errors offer Try Again. Routine reload and
visible diagnostics were removed after device testing. Sign Out lives in My
Account. A 401 clears the form when encountered
and directs the user to sign in. Account editing is currently native-only due
to the existing browser CORS/cookie limitation.

The shared membership panel refreshes separately from the form, including on
focus/background return, preserving unsaved edits. Session-generation changes
remount the form on logout/account switch. See
[shared-entitlements.md](shared-entitlements.md).

This first screen covers personal/contact details, birth date/time/timezones,
gender, calculation preferences and marketing choice. Avatar uploads, password
changes, account deletion, promotions and billing use separate API operations
and are not included in this slice.

## Validation

Tests cover account round trips, date-only/leap-year handling, midnight versus
unknown time, seconds/fractions, enum checks, distinct timezones, fresh CSRF and
no automatic replay. Lint and typecheck are required. Device verification of
prefill, save, read-back and resulting chart parity remains outstanding. No
account data was read or changed using an authenticated desktop session.
