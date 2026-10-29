# Domain UI label audit — 2026-10-26

Source audit of the rendered app, central uiCopy, chart/prediction/calendar
parsers, shared ninestar/docs/mobile-api.md and backend mappers/Dictionary.resx.
This reports source/contract availability, not authenticated Integration payload
verification. No backend or contract changes made. Your Predictions page-title
correction is the only product change in this audit; navigation stays My Predictions.

## Missing API labels used by visible UI

I Ching note (2026-10-27): result name/info/interpretation text comes
from the cast response. First-visit help now uses public iching/help. Dictionary-backed Generate, primary/
transformed panel labels, Detailed Interpretation and a formatted hexagram heading
are not exposed yet. Owner is requesting additions. Existing feature/action copy
is central, no enum-derived labels; see iching-api-handover.md.

| Area / local wording | App source | Backend status / next step |
| --- | --- | --- |
| Your Personal Chart, Personal Chart, Personal Chart Calculator, Predictions Calculator | ui-copy.ts; PersonalChart/CalculatorScreen hosts | Dedicated chart/calculator titles absent from current contract. Expose approved labels separately from About help. Predictions Calculator added 2026-10-27 as central mobile copy. |
| Your Chart hub and Your Personal Chart / Your Predictions / Your Calendar cards | ui-copy.ts; My Chart hub | Owner naming refinement 2026-10-27. Hub still uses central resources pending navigation metadata. data.labels.yourPredictions and .housesYouCurrentlyOccupy drive loaded prediction page/subtitle in full/free results, retaining approved loading/older-server copy. |
| Core Energies, Extended Profile, Summary | ui-copy.ts; PersonalChart | Resources CoreEnergies, ExtendedProfile, SummaryLabel exist; chart response supplies values/readings but not these group labels. |
| Overview, Essence, Intellectual Qualities, Interpersonal Qualities, Emotional Landscape, Relationships, Career, Finances, Health, Spirituality | ui-copy.ts/core-menu.ts; chart-details.tsx | Core menu is local English. Corresponding Dictionary resources exist (OverviewLabel, Essence and the named section resources). Character/other-energy Overview and Essence are also local, with some duplicate literals. Need neutral navigation labels; energy-specific character.title and long About titles are not substitutes. |
| Common Health Challenges | ui-copy.ts; chart-health.tsx | Illnesses body is exposed; its display heading is not populated by the current mapper. Health heading is also local. Organ/expansion titles are already supplied and must stay separate. |
| Energy, Yin/Yang, Element, Group, Trigram | energy-facts.tsx and personal-chart.ts | Symbol values/artwork are exposed; these five headings are not. Resource mapping needs care: Dictionary.TrigramLabel currently says Trigram Interpretation, not the short Trigram column label. Backend should choose the exact website resource; do not assume a near-matching resource name. |
| Colour, Direction, Family Member, Season, Internal Representation, Physiognomy, Primary Attributes, Most Harmonious Combinations, Most Challenging Combinations | personal-chart.ts | All nine display values are server-authored, but field headings are local English. Existing named Dictionary resources cover these labels. |
| Advanced Calculation Preferences; Calculation method; House display; natal/cycle southern-hemisphere inversion labels | ui-copy.ts, CalculationForm, account.tsx | Metadata supplies option labels, not field headings. Expose approved control labels; website resources include CalculationMethodLabel and PersonalHouses, with distinct inversion resources. Several resources say Use Ascending Ki / Invert Daily Ki, so do not silently substitute them for owner-approved wording. No Simple/Advanced selector should return. |
| Personal Chart, Predictions, Compatibility, I Ching, Karmic Numerology, AI Astrologer, Knowledge Base | ui-copy.ts / Explore | Feature/domain names are local, not a shared API navigation catalogue. Add approved feature labels when a navigation label contract is agreed. Articles and Readings/Ask/Learn are general mobile navigation, lower priority. |
| Membership type/name | MembershipStatus | Current account projection lacks a display name. Entitlement subscriptionType is an enum identifier. Normal panel is hidden pending an approved server display label; access refresh remains. |
| Compatibility form/analysis/metric labels | compatibility-form.tsx, compatibility.tsx; updated 2026-10-27 | Result navigation/panels use labels.sections and labels.results; metrics use gauges[].label/range/value. Strengths subtitle and Yin/Yang prose are server-authored. First/Second Person use API labels where returned; initial form/privacy labels remain approved central resources. First-use help now reads the public compatibility/help endpoint and preserves title/HTML/culture; see compatibility-calculator.md. |

Functional birth date/time, gender and timezone field headings also remain local
in uiCopy/account.tsx. These are shared form/localisation concerns rather than
unique 9 Star Ki terms, but exposing website-backed field labels alongside the
calculation controls would prevent duplicated translations.

## Already supplied and consumed

- Six short role labels: data.roleLabels; full energy banner: energies[role].title.
- Character Child Nature, Adult / Child Relationship and Stress Response titles:
  sections titles. Essence remains the owner's explicit shared-menu exception.
- Generic introductions: data.help title/htmlBody/culture, separate from readings.
- Personalised prose and summaries: sections/readings; HTML emphasis is retained.
- Predictions: groups, cycleTitles, predictionTitles, periods, scopes and houseName.
- Health: expansion title, strong/weak organ panel titles and each organ label.
- Calendar: label map, weekdays, formatted dateLabel/houses, Google Calendar Link.
- Metadata option labels for methods, genders, house displays and timezones.

No equivalent existing API field was found that the app could simply switch to
for the missing domain labels above. Generic sections.title is already parsed,
but backend currently populates Character titles, not the Core menu labels.

## Translation risks beyond missing wording

1. EnergyFacts identifies its four symbols by English label equality, and changes
   Yin / Yang to Yin/Yang locally. Give facts stable field identifiers; translate
   only their display labels. Otherwise translated captions can break layout/order.
2. accountOptions falls back to raw enum values when a label is empty. Backend
   should provide valid labels; agree graceful missing-label behavior rather than
   treating enum keys as translated copy. This audit does not change that fallback.
3. chart-sections.ts still defines legacy English groups (Your Nature, People and
   Relationships, Work and Direction, Wellbeing and Balance) and alternate reading
   names (How You Think, Connecting With Others, Health Tendencies). The current
   CoreDetails flat menu does not render these group titles: do not request new
   resources for obsolete group names. Remove/rework unused presentation metadata
   in a separately scoped cleanup while retaining reading lookup behavior.
4. Some English remains scattered in components: Overview/Essence, More Details,
   View Full Text/View Summary, missing-reading messages. General controls/errors
   need bundled locale resources, even if shared translations originate in the
   website dictionary; offline/login failure UI cannot depend on a successful API.
5. Existing resource names are not proof of the right display wording: keep role,
   help, page, menu and reading headings distinct. Do not strip About or concatenate
   translated words to manufacture a title.

## Proposed backend work — not an agreed contract

First expose the requested page/navigation labels and membership display name;
then chart group/menu and energy-fact field labels; then calculator/feature labels.
Agree exact fields and scopes in ninestar/docs/mobile-api.md before implementation.
Keep stable identifiers separate from display values, include culture, define
missing-label fallback, and clarify how culture is selected. Labels do not grant
reading access; full/free projections must preserve their existing restrictions.
Keep API/media caches culture-aware if culture can change their contents.

Validation: source audit completed; title change lint, typecheck and targeted
whitespace checks passed. No live
membership updates, authenticated probes, backend edits or new contract fields.
Next: owner/backend AI reviews the inventory and documents the additive labels;
mobile then consumes the agreed fields, preserving current rendering fallbacks.
