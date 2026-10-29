# I Ching API presentation handover — 2026-10-27

Owner confirmed that the backend AI will expose/document the missing introduction
and labels while mobile implements the existing public cast flow. This is a
request inventory, not new agreed endpoint/field names. Keep the shared contract
in ninestar/docs/mobile-api.md and tell mobile the exact deployed shape.

1. **Resolved:** public GET iching/help now returns the existing help.overview
   title/htmlBody/culture from AboutTheIChing and i_ching_info. Anonymous
   Integration verification returned 200 JSON; mobile displays it above Generate
   only. Fetching help does not cast, require login or consume credits.
2. Dictionary-backed page/action labels: IChing, GenerateHexagram (and Generate
   if the short website mobile variant should be used). Initial action should
   match the screenshot's Generate Hexagram.
3. Result panel labels: YourHexagram for one result, MainHexagram when there is a
   transformed result, and TransformedHexagram for that second panel. The website
   resources include the parenthetical Present Path / Path of Transformation
   wording shown by the owner; send their exact strings rather than mobile
   constructing them. Keep these separate from info.name and the hexagram name.
4. DetailedInterpretation for the collapsible full reading. Changing-line HTML
   already includes its resource-backed headings; preserve it as supplied.
5. A localised formatted hexagram heading (equivalent to the website's currently
   hardcoded Hexagram {number}: {name}) so mobile does not invent that prefix or
   formatting. If accessible line descriptions are exposed, send their final
   labels too; protocol line enum values are not display labels.

Preserve existing public POST iching/cast with standard CSRF, primary/transformed
objects, six top-to-bottom lines, info fields and conditional transformed result.
No request birth/settings form is needed. The app must not derive a new hexagram
number, reverse lines, choose translations or recalculate transformed readings.
Keep the existing endpoint's membership-free behaviour and no complementary-credit
fallback. Existing info strings are used verbatim; their future translation is a
backend resource concern, not local app interpretation copy.

Current mobile uses the approved central I Ching feature label and exact website
functional Generate Hexagram text. Until the new contract is supplied, panels
show their API hexagram names and the existing Read More disclosure label. This
is a declared first pass, not final website label parity. No speculative label
transport or help route has been consumed.
