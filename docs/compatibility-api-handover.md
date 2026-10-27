# Compatibility display API gaps — proposed handover, 2026-10-27

## Current status after the presentation contract update

The GitHub master contract now documents labels.sections, labels.scores, gauges,
details.gender.description and sections.strengthsAndChallenges.subtitle. Mobile
consumption is implemented; see compatibility-calculator.md. This supersedes the
label/enum-scale/authored-prose gaps in the original assessment below. The owner
authorises use of the returned gauge projection; membership rules are not changed
by mobile, and authenticated Integration visibility remains a device check.

**First-visit helper blocker resolved, 2026-10-27.** The contract now documents
public GET compatibility/help, with data.help.overview.title/htmlBody/culture.
Anonymous Integration verification returned 200 JSON with the expected title,
en-GB culture and 991-character HTML body. Mobile now calls this source above
the initial form and on Edit, hiding help on results. No calculation, last-result
reopening or credit consumption is used. See compatibility-calculator.md for
validation and the next iPhone check.

Resolved links render as safe text under the existing rich-text convention;
native Knowledge Base destination handling remains a separate follow-up. The
original score-access policy question is not claimed independently verified by
mobile tools; backend owns projection/redaction and authenticated access tests.

## Original handover (historical)

This is an app-side source assessment, not an agreed contract or backend change.
Owner confirmed on 2026-10-27 that they will request these API additions.
The shared contract remains ninestar/docs/mobile-api.md; backend owner should
document and verify additive fields before the app consumes them.

Existing POST compatibility/calculate is sufficient for a working two-person
form, full returned charts and the currently supplied analysis prose. The following
gaps prevent faithful website analysis navigation and gauges:

1. **Dictionary-backed display labels.** Expose calculator/person/privacy field
   titles, overview/analysis menu and panel titles, and metric labels with culture.
   Website resources verified: CompatibilityCalculator, FirstPerson, SecondPerson,
   DoNotDisplaySexualityLabel, OverviewLabel, CompatibilityOverview,
   StrengthsWeaknesses (desktop) / GiftsTrials (mobile), InDepthAnalysis,
   FundamentalElementsAnalysis (Core Elements Analysis), CharacterElementsAnalysis,
   AllElementsBreakdown (Total Elements Breakdown), BirthMonthAnalysis,
   SexualChemistryDetails. Let the backend choose the website's intended desktop/
   mobile labels; do not substitute help.overview.title for navigation.
2. **Score representation.** MobileApiControllerBase uses StringEnumConverter.
   HarmonyScore, ConflictScore, SupportScore, MutualUnderstandingScore,
   ComplementarityScore, SparkScore, LearningPotentialScore and OverallScore
   therefore arrive as ECompatibilityScore identifiers; SexualChemistryScore is
   explicitly serialized with ToString. Return authorised numeric value, minimum/
   maximum (or an agreed normalised numeric gauge value), resource-backed display
   text and the metric's display label. Preserve direction semantics for Conflict
   rather than making the client reverse/guess the meaning. Existing supportive/
   same/challenging percentages are numeric but also need their display labels.
3. **Score access parity.** _CompatibilityGauges.cshtml restricts several metrics
   with unlimited-membership/admin/complementary predicates, whereas the existing
   full mapper includes all score fields after the general paid check. Verify
   intended policy and apply server-side redaction/authoritative per-field access.
   The app currently omits these metrics; it does not infer permission from an
   enum, a label or a client-side date. No backend access fix is implemented here.
4. **Authored Yin/Yang interpretation.** The API exposes IsFundamtenalGenderSame,
   IsCharacterGenderSame and IsBothGenderSame flags, but the website
   _CompatibilityYinYang.cshtml chooses resource prose using additional Yin/Yang
   values as well. Expose the final selected title/body on the server rather than
   asking mobile to recreate that selection or ship its interpretation resources.
   Existing modality booleans likewise must not become invented client prose.
5. **First-use generic introduction.** data.help.overview is available on successful
   compatibility results, backed by AboutCompatibilityCalculator and
   compatibility_subtitle. There is no current generic introductory GET for an
   untouched calculator. Provide/document a read-only generic help source so the
   first form visit can show it without a POST, credit use or recalculating last.

Keep request FirstPerson/SecondPerson, shared CalculationMethod/Advanced type and
HideSexualChemistry compatible. Preserve the server under-sixteen/privacy gate:
hidden chemistry must omit both prose and score. No label's presence grants
reading access. Retain existing authenticated paid versus complementary routes;
mobile must never fall back to a credit-consuming POST automatically.

Source reviewed: MobileCompatibilityController, MobileCalculationMapper.Compatibility,
MobileCompatibilityRequest, MobileHelpMapper.Compatibility, CompatibilityScoreModel,
MobileApiControllerBase serializer, Dictionary.resx and Views/Compatibility form,
overview, pills, analysis, Yin/Yang and gauge partials. This assessment does not
claim authenticated Integration verification or Windows build/test execution.

Next: backend AI agrees/document additions and validates source/build/tests plus
Integration payloads. Mobile can then replace its temporary compact Read More
presentation with API-labelled sections/gauges without changing the calculator
engine, shared person fields or existing chart widgets.
