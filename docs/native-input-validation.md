# Shared input validation and native date/time — 2026-10-27

Owner request: field validation belongs above the input, and date/time entry
should use native controls throughout the app.

## Implemented

AppInput, AppSelect and AppDateTimeField share AppField: label, optional theme-
coloured validation message, then control. Errors are accessible alerts, supplied
as accessibility hints, and use the existing measured AppScreen scroll target to
bring the field into view. Error outlines use the theme error colour. This is a
shared convention for present and future forms.

FieldValidationError carries an internal field identity without changing API
requests. Account and calculator validators retain their rules and existing copy;
account wording touched here is centralised in ui-copy.ts. Compatibility adds
first./second. prefixes so errors target the correct person. The first invalid
field is reported on submission; editing clears the displayed field error. No
request is sent for failed local validation. Account email_unavailable also maps
to the email input. General transport/server errors without an authoritative
field are not attributed to a guessed input. Explicit submission failures use the shared warning
dialog described in submission-error-feedback.md; field-specific errors remain
inline. Existing uncertain-account-save handling and read-back protections
remain intact.

Advanced preferences reveal automatically for errors inside them. Hidden birth
fields reveal when needed to correct an existing invalid saved value, without
changing calculation-mode rules or silently replacing the draft. Preferences
remain open when edited. Both calculators and account retain independent drafts,
existing storage/session-generation guards and the 15-second API timeout.

## Native controls

Expo package is ~58.0.19. Checked SDK 58 docs and installed @expo/ui source before
using @expo/ui/community/datetime-picker. @expo/ui ~58.0.23 is already installed;
no package/dependency/native configuration change was needed. The control is
included in Expo Go.

AppDateTimeField is used for My Account birth date/time, shared Personal Chart /
Predictions / Compatibility birth fields, and optional Predictions selected
local date/time. Style Guide includes both controls. No remaining free-text
date/time inputs were found in app screens/components.

- iOS: native SwiftUI wheel inside a shared themed picker surface, with explicit
  Cancel and Done. Wheel movement updates temporary picker state only. Cancel
  preserves the existing draft; Done commits a local date or hour/minute value.
- Android: native Material date/time dialog, committing on confirmation and
  leaving the draft unchanged on dismissal.
- Web: browser-native date/time inputs via a platform-specific component, because
  @expo/ui's picker has no web renderer. Account/calculators retain their existing
  native-only authenticated-flow guard.
- Required dates keep the existing 1800–2200 bounds. Optional prediction fields
  can be cleared; both blank still sends selectedDateTime null. Account's unknown
  birth-time clearing remains available.

Date/clock strings remain YYYY-MM-DD and HH:mm; no UTC conversion or birth/current
zone reassignment occurs. Date picker bridging uses local calendar components at
noon. Time bridging uses a neutral January reference day, avoiding current-day DST
clock gaps. Untouched server seconds/fractions remain in drafts; explicitly
selecting a new time commits minute precision. Invalid existing date strings are
shown as-is until corrected, rather than displaying a fabricated valid date.

## Validation

173 tests passed, including new field-identity tests for account, calculator and
both Compatibility people, plus local date/time boundary/leap-day and multi-zone
round trips (Europe/London, America/Los_Angeles, Asia/Tokyo, Australia/Sydney).
The first run exposed the old isolated account-test loader's lack of imports;
it now uses the existing shared library loader, retaining the original cases.
Lint and typecheck passed. Offline iOS export passed (1,839 modules, 46 assets,
2.8 MB JavaScript) in ignored .expo/native-input-validation. This is bundle
validation, not a signed build or native interaction test. No live account save,
calculation, backend edit, migration, purchasing or deployment was performed.

Native picker appearance/cancellation, Android dialogs and scroll positioning
through animated disclosures still require device verification. Server responses
without field identities cannot safely be attributed to individual inputs; their
general submission messages now use the warning dialog; background-load messages
remain inline. No backend contract changes are
proposed or implemented in this task.

Next concrete iPhone check: open My Account, tap Birth date, change the wheel and
press Cancel; confirm the original value and any other unsaved edits are retained.
Then test local validation by clearing First name and tapping Save Changes,
without sending a valid account update. The error should appear above First name
and scroll that field into view. Test date/time confirmation in a calculator
before explicitly saving any real account change.
