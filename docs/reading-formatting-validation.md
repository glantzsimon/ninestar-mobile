# Shared reading inline emphasis

Validation: 83/83 app tests passed; Expo lint and TypeScript noEmit passed.
Five new cases cover inline normal/bold boundaries, nested/cross-paragraph
emphasis, bullets, inert HTML/escaped tags and rich summary preview clipping.

The previous readingBlocks parser kept structural headings, paragraphs and
bullets but discarded inline bold markup. ReadingContent now renders strong/b
emphasis as nested native Text spans using the shared Candara Bold font, while
retaining the surrounding body's font size/line height. The unformatted text
property remains available for existing comparison and fallback consumers.

This applies to Essence, all chart reading sections, full/summary modes and the
narrative summary. Headings retain their existing shared heading style. Scripts,
styles, images, event handlers and arbitrary HTML remain inert; no WebView or
HTML execution is introduced. Only bold inline emphasis is added in this change.
Nested emphasis and emphasis spanning paragraphs are preserved. Summary previews
clip rich spans together with plain text so expansion remains explicit and the
original server content stays intact.

Next concrete step: open Core → Essence on iPhone and compare the bold introductory
phrases and following normal dash/text with the website in summary/full modes.
Check bullets, long paragraphs, selectable text and larger font sizes. Native
visual verification remains pending. No API contract, authentication, entitlement,
timeout, account draft, purchasing or backend changes.
