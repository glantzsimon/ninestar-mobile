# Saved login and session persistence

## Implemented 2026-10-25

AccountLogin now offers Stay signed in, enabled by default and disabled while
submitting. It passes the user's boolean choice through HomeScreen to signIn
and the existing account/login rememberMe field. No new backend contract or
dependency. The setting is per login form; it is not saved with the password.
Login labels now live in the central uiCopy resource. Shared AppSwitch provides
theme styling and a labelled native control with a 48px minimum row height.

iOS fields use textContentType username/password; Android/web use autoComplete
username/current-password, without setting both hint types on iOS. Native autofill
importance is explicit. Password input remains secure and clears after an attempt;
no password, cookie or entitlement snapshot is written to app files/storage.
The native HTTP cookie jar owns server cookies. Its actual process-restart
persistence must be tested; rememberMe=true alone is not proof it works.

Existing CSRF-before-login, CSRF-refresh-after-login and server account/entitlement
verification remain. Cold launch uses the existing unknown session state and
server reads. Logout/account switch clear account-scoped state, failed logout
still reports that server sign-out was not confirmed. The 15-second deadline,
no automatic POST replay and unsaved My Account handling are unchanged.

## Backend source review (read-only)

MobileLoginRequest.RememberMe is forwarded by MobileAccountController to
AccountService.Login and My.Authentication.Login's persistence argument. Backend
Web.config Forms Authentication timeout is 2880 minutes (48 hours), separate from
the 60-minute ASP.NET session state. Deployed overrides, underlying provider
behavior, rolling renewal and cookie expiry have not been verified. Do not promise
an unlimited or exact sign-in lifetime. Logout calls AccountService.Logout and
clears/abandons session state; actual cookie deletion needs device verification.
No backend dependencies, settings, deployments or memberships changed.

## Standalone password-manager integration still required

Current enrollment status: owner enrolled, membership pending. Local dev-client
and EAS profile preparation done; see development-build.md. Earlier payment
deferral below is historical. App identifiers, signing and website association
remain unconfigured pending owner details/Apple activation.

Owner deferred Apple Developer membership payment on 2026-10-25. Defer signed
iPhone build/domain-autofill completion until enrollment resumes; continue Expo
Go development. Persistent-login and logout restart behavior already passed on
the owner's iPhone; this dependency does not block chart/UI work.

app.json currently has no ios.bundleIdentifier or android.package. Do not invent
permanent identifiers, Apple Team ID or signing certificate fingerprints. Before
website-linked autofill can be completed, agree those identifiers and obtain
non-secret public signing identity details from the configured build.

- iOS: configure the webcredentials associated domain and coordinate the website's
  apple-app-site-association webcredentials apps entries using the actual Team ID
  and bundle ID. Verify in our own signed build, not Expo Go's identity.
- Android: configure website/app Digital Asset Links for credential sharing with
  the actual package and signing SHA-256 certificate. Test the selected password
  manager's autofill in a signed build. A dedicated Credential Manager save/sign-in
  integration is a separate implementation if field autofill proves insufficient.
- Integration and production are distinct hosts; decide which development build
  trusts Integration and which release build trusts the production site. Follow
  production-switch.md. Server association files belong to backend/website owner.

References consulted: SDK 58 docs/config, React Native TextInput/Switch,
[Apple Password AutoFill](https://developer.apple.com/documentation/security/password-autofill),
[Android Credential Manager/autofill](https://developer.android.com/identity/autofill/credential-manager-autofill).

## Validation and next checks

Second owner iPhone result: after explicit sign-out and fully closing/reopening
Expo Go, the app required sign-in. Logout restart check passed. Owner reported
empty username/password fields and manual re-entry; OS credential autofill is
not yet verified. Do not describe persistent-session success as password saving.
Next diagnostic: focus password input and check for the system Passwords/key
autofill option. Standalone app/domain association remains outstanding.

Owner iPhone result (2026-10-25): signed out, signed in with Stay signed in
enabled, fully closed Expo Go, reopened it and opened ninestar-mobile. Chart
auto-signed in without credential entry. Persistent-login restart check passed
on this device/Expo Go session. This does not establish expiry lifetime or
Android/standalone behavior. Next: explicit sign-out followed by the same restart
must remain signed out.

All 100 automated tests passed, including rememberMe default and explicit opt-out,
unchanged CSRF sequencing and successful server identity verification. Existing
session tests cover clearing state on logout/switch and stale-reply rejection.
Native cookie retention and OS password-save prompts are not automated by these
tests. Lint and typecheck both passed.

First iPhone step: sign out, then sign back in with Stay signed in enabled.
Next, fully close/reopen Expo Go and reopen this project, with no new login; verify
the chart loads via server authentication. Then sign out and repeat the restart
to verify it stays signed out. Test opt-out separately. If cookie persistence
fails, capture only request status/session state, never passwords or cookie values;
investigate native cookie handling before adding a storage dependency.

Full website-password autofill remains blocked on agreed standalone app/build
identifiers and website association configuration. No credentials are required
in chat. No changes to billing/purchasing.
