# API role labels

Read shared mobile-api.md “Short energy role labels” on 2026-10-25. All six
Dictionary-backed labels are in data.roleLabels; full/free and full embedded
profiles retain them independently of help. No backend changes made here.

Normalisation reads string values into each corresponding energy.roleLabel.
Shared energyRoleTitle returns that label for cards and destination modal headers.
Removed uiCopy.energyRoles entirely. Missing/empty/malformed labels yield no role
caption/title, preserving other card content and usable close/navigation controls.
No About stripping, key formatting, local English or individual energy-name
fallback. EnergyBanner still uses energies[role].title; reading subsection labels
and explanatory help titles remain independent. No hourly label or paid content
added. Authentication, entitlements, drafts, timeout, artwork and billing unchanged.

All 103 tests passed. Added full/free coverage for six non-English role labels,
matching card/screen title, separate help/banner titles, input immutability and
older/malformed responses. Lint, typecheck and scoped diff whitespace check passed.
No authenticated Integration session was available to
inspect live roleLabels; fixture/source checks are not deployment verification.

Next concrete step: owner reloads iPhone and checks Extended Profile cards show
Day Star, Generational Ki and Epoch Ki (or API-selected locale values), then opens
one and confirms the same title in the modal header. If blank, inspect only the
signed-in response's roleLabels to establish deployment/response availability.
