# Compatibility calculator — 2026-10-27

Explore → Compatibility uses the shared CalculatorScreen, CalculationPersonFields,
person validation, account/environment-scoped two-person memory and paid
CSRF-protected compatibility/calculate POST. Keep the 15-second timeout,
session-generation cancellation, independent account drafts, Advanced calculation
mode and no automatic retry/complementary-credit fallback.

## Results and navigation

Results go straight to shared SectionWidgets, initially with no selected detail.
There is no energy picker, energy-name banner or extra modal step. The page heading
uses labels.results when supplied. Buttons use labels.sections[key].navigationTitle;
panels use the corresponding title. Missing labels/content omit a button rather
than inventing wording.

The short personalised sections.strengthsAndChallenges.subtitle appears directly
under the page heading, using shared subtitle typography and related-heading
spacing. It is also retained within its reading section; no text is inferred
from scores or HTML. Missing subtitle simply omits that line.
Available analysis sections are flattened into this menu:
Overview, Strengths/Challenges, solar elements, lunar elements, all elements,
Yin/Yang, birth month and permitted chemistry. The website's inDepth grouping label
is parsed but does not become a duplicate empty reading.

Selecting a section replaces the previous detail, measures it and scrolls its
header flush top. AppScreen ensureSpace supports short sections, just as AppModal
does for chart energies. Screen and modal hosts share AppMenuNavigation: Back to
Menu fades/collapses as the user scrolls and returns to the actual buttons.
No guessed spacers or extra nested modal were introduced.

Overview displays the returned gauges. Existing First/Second Person chart
access is retained through collapsed disclosures beneath the gauges, using
PersonalChart and server labels. Strengths/Challenges uses its supplied subtitle
verbatim, alongside its exact reading body. Other readings retain their existing
HTML paragraphs, emphasis and headings through ReadingContent; Yin/Yang consumes
only details.gender.description, never locally interpreted flags.

The existing rich-text renderer deliberately leaves links inert. Resolved Yin/Yang
link text displays, but native Knowledge Base navigation/link handling remains a
follow-up; no website-opening feature fallback is introduced.

Older responses without usable navigation metadata retain the previous prose and
profile disclosures. No gauges or labels are manufactured from enum names.

## Native gauges

Core/Character Elements now include their explicit API-selected catalogue diagrams,
and Total Elements includes the API-segment native pie/legend. Embedded HTML images
are suppressed while text remains intact. See compatibility-element-visuals.md
for contract details, public media checks and the 178-test validation report.

CompatibilityGauges draws live native SVG arcs and needles, using react-native-svg
15.16.0 installed through Expo SDK 58's expo install. This module is bundled in
Expo Go; an existing custom development build needs rebuilding to add it.
The layout uses two columns on narrow phones, three at 600+ points, with centred
remaining items. Website colours live centrally in GaugeColors. Each gauge has
its API label and accessible numeric range/value.

The parser preserves returned order and accepts only known unique keys, finite
in-range values, nonempty labels, valid increasing ranges and Boolean inversion.
Needle position is (value-min)/(max-min). Colour desirability alone is reversed
for inverted gauges. Standard 0–9 and chemistry 0–15 ranges come from the payload;
no score enum conversion, zero substitution, entitlement inference or astrology
calculation occurs on the client.

Both sexual-chemistry prose and gauges require explicit input opt-in and affirmative
isSixteenOrOver flags for both returned people. Hidden/underage/unknown-age chemistry
labels are also discarded. Server access restrictions remain authoritative.

## Helper location

Compatibility results never render help.overview. CalculatorScreen now calls
getCompatibilityIntroduction on entry, using the public GET compatibility/help.
It parses data.help.overview.title/htmlBody/culture through the shared help parser
and displays ContextualHelp above the two-person form, including the initial visit.
The same introduction is available again on Edit Calculation. No calculation,
retrieve-last, sign-in or credit-consuming call is used to fetch it.

The existing optional-help loader ignores stale session replies, omits missing or
malformed help and leaves the form usable on failure without resetting inputs.
It retains the shared 15-second transport timeout. This resolves the earlier
first-use-help API blocker.

After the owner's requested three-minute deployment wait on 2026-10-27, an
anonymous Integration GET returned HTTP 200, application/json; charset=utf-8,
Cache-Control: no-store, no-cache, success true, error null. The introduction
title was About The Compatibility Calculator, culture en-GB, HTML body 991
characters. This check sent no credentials and did not calculate a reading.

## Contract and validation

The local ninestar/docs/mobile-api.md was older at inspection. Read the current
master contract via the connected GitHub tool: Compatibility presentation and
gauges section, document blob 1fb3393bed272afa53a94432260f7235f25e251a.
Owner supplied the same field contract in chat. No backend files were changed.

165 automated tests passed, including four new gauge/menu/privacy tests. Lint
and typecheck passed. Offline iOS export passed (1,789 modules, 46 assets, 2.8 MB
JavaScript), output under ignored .expo/compatibility-gauges-validation. This is
bundle validation, not a signed native build or live authenticated response check.
Npm installation reported four high-severity dependency advisories; no unrelated
automatic dependency upgrades were applied.

Authenticated Integration field presence, gauge appearance, short-section scroll
alignment and Back to Menu transitions remain iPhone checks. No credentials,
account changes, memberships, backend dependencies, migrations, deployment or
purchasing changes were involved.

Help follow-up validation: 167 automated tests, lint, typecheck and targeted
whitespace checks passed. Two new transport tests verify the exact read-only GET,
API title/culture/HTML formatting, missing/invalid help and failure without POST
or automatic retry. The earlier iOS export above predates this small wiring change.

Next concrete device step: reopen Explore → Compatibility and check the expandable
About The Compatibility Calculator panel appears above First Person. Then check
calculation hides it and Edit restores it. Native appearance remains unverified.
