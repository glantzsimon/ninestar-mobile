# Own development build

Current status (2026-10-29): owner confirms the iPhone is registered with EAS,
which reported “Your device is ready to run internal distribution builds.”
Registration is complete; signing, build and installation remain unverified.

Attempted the configured development profile using EAS CLI 27.1.0, remote
credentials, non-interactive mode and --refresh-ad-hoc-provisioning-profile
(to include newly registered devices). EAS resolved the development environment,
then exited 1: no credentials suitable for internal distribution were found.
No cloud build was queued and no installation artifact was produced.

Next concrete step: in the owner's interactive PowerShell window run:

```powershell
cd D:\Workspace\ninestar-mobile
npx.cmd eas-cli@latest build --platform ios --profile development
```

Complete Apple sign-in and two-factor prompts privately. Allow EAS-managed signing
and include the registered iPhone when selecting devices. Do not send passwords,
verification codes, device identifiers or registration links through chat. This
first credential setup cannot be completed by the non-interactive agent process.
After the build is queued, record its build-page URL/status (no private device
information), then install on the phone and use npm run start:dev for Metro.

EAS account/project remains @simonglantz/ninestar-mobile:
https://expo.dev/accounts/simonglantz/projects/ninestar-mobile
Project ID 44a130c1-bfdd-4f58-b529-544d46ddcf88 is saved in app.json with owner
simonglantz. Identifier remains com.ninestarkiastrology.mobile. No App Store
submission or production environment switch was performed.

EAS also reported unset cli.appVersionSource and absent
ITSAppUsesNonExemptEncryption. These were not the credential failure. No export
compliance declaration was guessed; review before TestFlight/App Store work.

Pre-build diagnostics initially reported 17/20: an online Expo-schema TLS failure,
Git missing from this tool shell's PATH (so a false .expo ignore warning), and
new SDK 58 patch expectations. Explicit git check-ignore confirmed .expo and
its contents are ignored. Expo install --fix then aligned the app's SDK patches
and React Native 0.88.1; Expo automatically added expo-web-browser's config plugin.
No website dependencies were touched. Rerun Expo Doctor passed 20/20 checks;
all 219 automated tests and lint passed after alignment. Offline iOS bundle
passed (1870 modules, 46 assets, 2.9 MB JavaScript), using ignored
.expo/development-build-validation. Typecheck passed after regenerating Router
declarations with the installed CLI helper. Scoped git diff --check passed.
The initial TLS/ignore issues are
resolved, not remaining build blockers.

Dependency audit separately reports 8 findings (5 low, 3 high), involving Expo
tooling/configuration and zod. Its suggested major Expo change targets 51.0.39,
which would downgrade this SDK 58 app; no audit fix/force or incompatible override
was applied. Raw public-package audit is in ignored .expo/development-dependency-
audit.json. Review an SDK-compatible remedy separately; Doctor passing does not
constitute a vulnerability clearance.

Native launcher/splash are still template assets; the runtime logo is updated but
only 173×173. Do not claim polished launcher branding is included in this build.
The complete open-work summary is outstanding-tasks.md.

Prepared locally:

- SDK-compatible expo-dev-client installed through Expo CLI.
- eas.json development profile: developmentClient true, distribution internal,
  targeting a physical phone (no simulator profile).
- npm start explicitly targets Expo Go; npm run start:dev targets our own build
  once installed. Installing dev-client otherwise changes Expo CLI's default
  launch target, so use these explicit scripts.

Owner agreed identifier: com.ninestarkiastrology.mobile, now configured as both
ios.bundleIdentifier and android.package in app.json. Display name is NineStar;
Expo slug remains ninestar-mobile. Do not invent an Apple Team ID, signing identity, Android
fingerprint. EAS project ID above came from EAS init, not a guess.
Device registration is owner-confirmed; no cloud build, provisioning or deployment completed yet.
No ios/android folders created; native configuration remains in Expo config.

Full website-password autofill additionally needs matching webcredentials domain
association on the app and apple-app-site-association hosted by the website using
the actual Team ID/bundle ID. Coordinate with website owner; do not deploy those
files from this workspace or enable an unverified association. See
login-persistence.md. Integration remains the API environment until explicitly
switching to production. Keep remembered-login/server-access checks unchanged.

Earlier validation (2026-10-25): Expo CLI install --fix aligned seven existing SDK patch dependencies:
@expo/ui ~58.0.23, expo ~58.0.19, expo-file-system ~58.0.11,
expo-font ~58.0.10, expo-glass-effect ~58.0.5, expo-image ~58.0.17,
expo-router ~58.0.26. CLI also added the expo-image config plugin. Online Expo
dependency check now passes (Dependencies are up to date). Public config confirms
NineStar and both agreed identifiers. All 100 tests, lint, typecheck and scoped
diff whitespace check passed after alignment. Device build/install not yet
performed. Current Expo Go login restart/logout checks remain the only verified
persistence results; retest in our own build after installation.

Identifier discussion resolved: owner accepted the suggested visible name and
internal reverse-DNS-style bundle/package identity. Apple fixes the
App Store bundle ID after first build upload, so choose deliberately before that.
