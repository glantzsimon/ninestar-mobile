# Explore navigation and native feature availability

Owner requested the remaining buttons/features after agreeing Explore first.
Native/web tab order is now Explore, My Chart, My Account. My Chart contains its
own Your Chart hub and stack for Your Personal Chart, Your Predictions and Your Calendar; see
personal-calendar.md. The old root and Predictions routes redirect into this stack.
This supersedes the earlier separate My Predictions tab. The old hidden Style
Guide moved from /explore to /style-guide and stays hidden from native tabs.

Explore uses AppScreen, AppPanel and SectionWidgets to group Personal Chart,
Predictions, Compatibility, I Ching and Karmic Numerology under Readings; AI
Astrologer under Ask; Knowledge Base and Articles under Learn. Existing catalogue
artwork IDs are used where suitable, with bundled NineStar mark fallback; no
bulk media download. Group/feature labels are central translatable uiCopy values
matching owner-approved website names, not an invented API feature-label payload.
An eventual API-provided feature catalogue/labels would replace these fallbacks.

Personal Chart opens /explore/personal-chart and Predictions opens
/explore/predictions in Explore's nested Router stack. Both use shared
CalculatorScreen/CalculationForm and existing PersonalChart/Predictions results.
See personal-chart-calculator.md and predictions-calculator.md for access rules
and validation. Other Explore
features remain availability placeholders. My Chart and My Account retain their
existing result/forms. Owner
requires one app sign-in, so the initial website fallback was removed completely,
not just its notice. Explore's introduction and groups are unchanged; no Opens
website badges, browser redirects, URL builder or browser-opening hook remain in
this flow. Cards for unbuilt features open a native AppModal with a central
Coming soon message and Close control. No extra authentication, API calls, reading
credits, payments or calculator submissions occur when these placeholders open.

2026-10-27: Compatibility now opens /explore/compatibility using the same
CalculatorScreen and shared birth fields, with two independent people. It renders
available API prose and both returned charts; named analysis menus, scores and
first-use help await documented API display additions. See
compatibility-calculator.md and compatibility-api-handover.md. Remaining unbuilt
features retain the native placeholders described above.

Own Predictions and the calculator share the current API cycle/group/period
labels and result components; see my-predictions.md. Earlier Integration failure
notes are superseded by that report and the owner's working own-reading checks.
The new calculator's live calculation still needs iPhone confirmation. Other feature placeholders
remain native, sharing the established app session as they are implemented.
No new dependencies or backend changes; 15-second API timeout unchanged.

Personal Chart addition: 114 tests, lint and typecheck passed. Integration metadata
and synthetic preview returned 200; anonymous full calculate returned 401 as
required. Signed-in full calculation and nested navigation need the owner's
iPhone check. Earlier 106-test results below describe the preceding placeholder
cleanup, not a device validation of this calculator.

Validation after correction: all 106 remaining tests and typecheck passed. Two
tests for the deleted website URL builder were removed with that code. Lint found
an import-order warning, corrected by moving useState to the top; final rerun
passed without warnings. Earlier public website route checks are no longer validation of the
native feature flow. iPhone availability-modal/Close and four-tab layout checks
remain. Next: owner checks Explore > Personal Chart calculator as documented in
personal-chart-calculator.md; later continue native My Predictions after the
cycle-label contract update.
Apple build stays parked. No second sign-in workaround should be reintroduced.
