# Own development build

Current status: owner confirms membership still pending and parks build/signing
until activation. Local prep/checks below are complete; continue Expo Go work
without repeating these steps. Resume when owner reports active membership.

Owner reports Individual Apple Developer enrollment is pending (2026-10-25).
Do not treat enrollment/payment as active membership or attempt to sign until
activation is confirmed. Prior payment deferral is superseded.

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
fingerprint or EAS project ID. EAS project has not been created/linked by this
preparation. No cloud build, provisioning, device registration or deployment run.
No ios/android folders created; native configuration remains in Expo config.

Next concrete steps: confirm active Apple membership; then
check EAS CLI login as simonglantz, link the intended Expo project, configure app
identity and signing, register the owner's iPhone and run the development build.
Use npx eas-cli@latest for EAS CLI. Apple authentication must be handled by the
owner through CLI/browser, never passwords or verification codes in docs/chat.

Full website-password autofill additionally needs matching webcredentials domain
association on the app and apple-app-site-association hosted by the website using
the actual Team ID/bundle ID. Coordinate with website owner; do not deploy those
files from this workspace or enable an unverified association. See
login-persistence.md. Integration remains the API environment until explicitly
switching to production. Keep remembered-login/server-access checks unchanged.

Validation: Expo CLI install --fix aligned seven existing SDK patch dependencies:
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
