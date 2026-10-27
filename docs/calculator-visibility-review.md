# Advanced calculation preferences (2026-10-26)

The owner explicitly superseded the earlier website Basic/Advanced UI parity
request: mobile exposes all applicable settings and always sends Advanced mode.
The website still supports Simple mode, which forces Chinese calculation there.
No shared API contract or backend change is required: Advanced is an existing
metadata enum value and request property.

## Current implementation

- My Account uses a visible AppPanel titled Advanced Calculation Preferences.
  CalculationForm uses the same title in a collapsed-by-default AppDisclosure
  (owner refinement 2026-10-27). No Simple/Advanced mode selector; expanding only
  changes visibility, not calculation mode. Copy comes from central uiCopy.
- MobileCalculatorType in account.ts supplies Advanced to both buildAccountUpdate
  and buildCalculation. Metadata still validates support for that protocol value.
  Do not remove calculatorType from the wire contract.
- Editable AccountDraft/CalculationDraft and calculator memory omit calculatorType.
  Old saved drafts remain readable: the allowlist ignores their old mode while
  retaining names, dates, methods, zones and all other input values.
- Host-applicable calculator preferences are shown directly. Personal Chart shows
  method and natal hemisphere inversion. Prediction hosts additionally expose
  current timezone, house display, selected date/time and cycle inversion.
- Birth time/zone still depend on time-known; Traditional hides gender as before.
  FadeCollapse retains the input values and respects reduced motion. Hidden
  fields retain existing API validation; no preferences are inferred or erased.
- Prediction hosts send selectedDateTime null when both date/time are empty,
  letting the server select current time in the chosen timezone; a custom selection
  requires a valid local pair. Personal Chart always sends selectedDateTime null.
- My Account shows method, house display and both hemisphere settings. Opening
  a screen does not save anything. Explicit Save Changes sends Advanced together
  with the user's draft; until then own readings/calendar still use the server's
  existing saved account preferences. Calculator submissions are independent.
- Preserve authentication, entitlements, account drafts, field defaults, account/
  environment memory isolation and the 15-second timeout. UI visibility does not
  grant membership access; server checks remain authoritative.

## Validation and next step

20 focused account/calculation/memory tests passed, including legacy Simple-mode
restoration, forcing Advanced without mutating server objects, unsupported-mode
validation, selected-date requests, and preserved API-required fields. All 147
tests, lint, typecheck and targeted whitespace checks passed. Ignored Expo route
declarations were regenerated before typecheck. No live account preferences were
changed by tools.
Next: open Personal Chart Calculator on iPhone, check the visible preferences and
calculate with a chosen method. Then inspect My Account without saving unwanted
changes. Native appearance/calculation confirmation remains pending.
