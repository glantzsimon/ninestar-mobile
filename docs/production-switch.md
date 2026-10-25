# Production switch checklist

Owner instruction: remind Simon when moving to live that all Integration host
references must move from `https://int.9starkiastrology.com` to
`https://9starkiastrology.com`. This includes API, artwork and other media.
This checklist records future work; no environment switch is authorised now.

- Remind the owner explicitly before making the production switch.
- Find Integration host references in source, configuration and bundled media
  metadata. Retain historical validation URLs in reports as historical evidence.
- Change the configured API base to
  `https://9starkiastrology.com/api/mobile/v1` through shared configuration.
- Switch the stars background source, if remote, to
  `https://9starkiastrology.com/Videos/Shared/stars-bg.mp4`.
- Verify the production artwork catalogue returns production media URLs. Continue
  using exact returned URLs; do not rewrite catalogue URLs inside the resolver.
- Keep artwork catalogue/cache state isolated by API environment; do not carry
  Integration authentication or entitlement snapshots into production.
- Verify production API connectivity, anonymous/private access, signed-in chart
  and account behavior, artwork 200/304/cache headers and representative media.
- Preserve the 15-second client timeout and account draft protections. Record
  exact results and unresolved failures in the relevant validation reports.

Next concrete step: use this checklist when the owner requests the live switch;
continue using Integration until then. Never record credentials or tokens.
