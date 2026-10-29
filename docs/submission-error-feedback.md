# Submission errors and field feedback — 2026-10-27

## Agreed interaction pattern

Field errors stay directly above their controls with a warning icon and accessible
text. Scroll to the first invalid field in visual order; do not show a dialog for
ordinary field validation. General failures from explicit user submissions/actions
show one dismissible AppErrorDialog. Success feedback and background-load failures
remain inline. Colour or an icon alone must never carry the error meaning.

This follows the distinction between contextual field correction and an important
submission failure requiring acknowledgement. Accessibility reference:
https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/
An error dialog interrupts work, so do not use it for success, every keystroke,
optional help/artwork refresh failures, or normal background loading.

## Shared implementation

AppErrorDialog uses a compact themed surface, shared WarningIcon, a central
translatable title and existing Close label. Body text retains the existing
operation-specific message. Long messages scroll; Android Back, accessibility
escape and Close dismiss the dialog. Dismissal does not submit, retry, discard,
navigate or save. The underlying form and its scroll position remain mounted.
Web uses alertdialog/modal semantics with an accessible description; focus and
VoiceOver behaviour still require platform checks.

useSubmissionError owns feedback per screen. It ignores reports when the screen
is unfocused, clears on blur/unmount, hides old-generation messages on account
switch, and dismisses the keyboard when displaying a submission failure. Error
messages and dialog state are not persisted. There is no global alert queue or
automatic retry. Callers retain their existing alive/session checks.

Connected to:

- Personal Chart, Predictions and Compatibility submissions, including non-field
  request-building failures. Initial account/metadata-load failures stay inline
  with the existing retry action.
- My Account saves, read-back failures and sign-out failures. email_unavailable
  remains an inline email-field error. An uncertain save still disables another
  save and retains the existing Check Saved Details recovery action and inline
  explanation after the popup is dismissed. A successful write followed by a
  failed read-back must not be described as definitely unsaved.
- Sign-in submission failures, preserving chart/account recovery actions.
- Explicit calendar Copy Link and Disable Link failures, including a clipboard
  false result. Existing success feedback, private-link lifecycle, denial clearing
  and destructive confirmation are preserved.
- Style Guide has a safe Preview error dialog control; it performs no request.

AppFieldErrors supplies a validation-attempt context so resubmitting the same
invalid values scrolls again. AppScreen batches invalid field measurements and
chooses the topmost/leftmost active field rather than the last mounted error.
Removed targets and obsolete measurement batches are ignored. Current local
validators still stop at the first invalid field; the shared layout mechanism
also supports multiple supplied errors. Existing preference/hidden-control
reveal behaviour and native date/time controls remain in place.

## Preserved boundaries

The 15-second timeout, auth/CSRF, account/session-generation guards, entitlements,
input memory, uncertain-save protections and independent unsaved drafts are
unchanged. No backend/API contract, memberships, purchasing, migrations or
deployment changes. No live submissions or account changes were made by tools.

## Validation and remaining checks

173 regression tests, lint and typecheck passed. Offline iOS bundle export passed
in ignored .expo/submission-error-validation. These checks validate code/bundling;
they do not verify real native modal focus, screen-reader announcements,
multiple-field scrolling through animated disclosures or focus restoration on web.
No UI interaction or accessibility checks are claimed as automated.

Next concrete check: preview the dialog through Style Guide → Preview error dialog.
Confirm the warning/text are visible, Close returns to the unchanged screen,
and Android Back/accessibility escape dismiss where supported. Then check a local
invalid account field stays inline and does not display the popup, before testing
a genuine transport failure in a calculator. Never replay an uncertain account
save just to test an alert; use its existing read-back recovery.
