# Calculator flow and shared screen spacing — 2026-10-27

Implemented the five owner requests sent before the limit:

1. My Chart's hub heading is Your Chart. Cards say Your Personal Chart, Your
   Predictions and Your Calendar, using approved central uiCopy. Bottom tabs stay
   Explore / My Chart / My Account. Existing routes and API page labels are unchanged.
2. CalculationForm uses AppDisclosure for Advanced Calculation Preferences,
   collapsed by default. Expanded settings are the existing host-applicable
   controls. Advanced remains the protocol mode; there is no Simple/Advanced
   selector. My Account retains its visible preferences panel.
3. Shared AppScreen explicitly enables automatic iOS scroll inset adjustment.
   Noncollapsable native wrappers preserve scroll discovery. NativeTabs handles
   Android bottom insets. Removed guessed native 50/80-point tab reservations;
   retained the custom web bar's 96-point footprint (48 controls + 16 internal
   padding + 32 outer padding). Added LayoutSpacing.bottomClearance = 4 logical
   points beyond the bar. No reduced touch targets or screen-specific spacers.
4. AppActionGroup uses LayoutSpacing.relatedActions = 4 points for related
   vertically stacked actions. Calculator result Back to Explore and Edit
   Calculation now use it, with normal spacing before the result heading.
5. Edit Calculation preserves the current draft and returns to the form, with
   shared AppScrollTarget measuring its mounted view before requesting zero-inset
   AppScreen scrolling and sufficient minimum height. Birth Details aligns with
   the viewport top; title/help/navigation remain available above it. Initial
   calculator entry does not auto-scroll past its introduction.

The native inset approach follows installed Expo SDK 58 and its
[native tab safe-area guidance](https://docs.expo.dev/router/advanced/native-tabs/#safe-area-handling),
plus React Native's ScrollView contentInsetAdjustmentBehavior. Pixel-perfect
clearance in a nested native stack still requires the iPhone check; automated
typechecking cannot establish the exact native bar geometry.

Preserved calculator defaults/memory, unsaved account drafts, HTML/help, artwork,
authentication, entitlements, server access restrictions and the 15-second timeout.
No API requests added, backend edits, live preference writes or deployment.

Validation: all 148 existing tests passed; final lint, typecheck and targeted
whitespace checks passed. The first lint run caught reading an edit-intent ref
during render; replacing it with React state resolved the error. Ignored Expo
route declarations were regenerated before typecheck. Native pixel clearance
and scroll placement remain unverified until the device check. Next: open
Personal Chart Calculator and scroll fully down with the keyboard closed; Calculate
must sit above the tab bar. Then check collapsed preferences, Back/Edit spacing,
and Edit returning Birth Details flush top with the entered values retained.
