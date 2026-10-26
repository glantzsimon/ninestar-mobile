# Explore navigation and native feature availability

Owner requested the remaining buttons/features after agreeing Explore first.
Native/web tab order is Explore, My Chart, My Predictions, My Account. Tab order
does not change the existing root route's launch behavior. The old hidden Style
Guide moved from /explore to /style-guide and stays hidden from native tabs.

Explore uses AppScreen, AppPanel and SectionWidgets to group Personal Chart,
Predictions, Compatibility, I Ching and Karmic Numerology under Readings; AI
Astrologer under Ask; Knowledge Base and Articles under Learn. Existing catalogue
artwork IDs are used where suitable, with bundled NineStar mark fallback; no
bulk media download. Group/feature labels are central translatable uiCopy values
matching owner-approved website names, not an invented API feature-label payload.
An eventual API-provided feature catalogue/labels would replace these fallbacks.

Personal Chart now opens /explore/personal-chart in Explore's nested Router stack,
using shared CalculationForm and existing PersonalChart results. See
personal-chart-calculator.md for access rules and validation. Other Explore
features remain availability placeholders. My Chart and My Account retain their
existing result/forms. Owner
requires one app sign-in, so the initial website fallback was removed completely,
not just its notice. Explore's introduction and groups are unchanged; no Opens
website badges, browser redirects, URL builder or browser-opening hook remain in
this flow. Cards for unbuilt features open a native AppModal with a central
Coming soon message and Close control. No extra authentication, API calls, reading
credits, payments or calculator submissions occur when these placeholders open.

My Predictions now has the first native own-cycle screen with shared result
components; see my-predictions.md. It uses actual API reading titles pending the
short cycle-label contract. Integration returned 500 HTML and then timed out in
validation, so signed-in/device checks remain blocked. Other feature placeholders
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
