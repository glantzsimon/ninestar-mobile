# Stars video background trial

Half-speed refinement: shared player sets playbackRate=0.5 before play, supported
by SDK 58 expo-video. Approximately 20-second loop from the 10-second asset;
no asset re-encoding. Lint and typecheck passed. Pending iPhone motion verification.

2026-10-25: owner approved the portrait background at 75% overlay (“Nice perfect”).
Removed temporary Preview background button, blank modal state and resource
string. Normal screen/chart-modal backgrounds remain. This supersedes earlier
instructions to keep the diagnostic control pending approval.
Lint and typecheck passed after preview removal.

Current visibility refinement (2026-10-25): lowered the shared darkest-teal
overlay from 85% to 75% at the owner's request, making video/poster more visible.
Supersedes earlier 85% values below. Applies to screens, chart modals and preview.
Lint and typecheck passed. Pending owner readability/visibility check.

## Current asset: owner's portrait video

Owner iPhone feedback on 2026-10-25: “Way better.” Portrait asset/framing visual
check accepted. Keep this version as the baseline; this does not verify Android,
browser playback, reduced-motion or inactive/resume checks. Temporary Preview
background control remains until the diagnostic UI cleanup is requested.

2026-10-25: replaced bundled video with the website's
Videos/Shared/stars-bg-mobile.mp4, primary H.264 stream copied unchanged; removed
audio and attached thumbnail, enabled faststart. Output 720x1280, 10.042 seconds,
3,336,687 bytes. Extracted matching first-frame poster. Shared sizing now uses
720x1280 minimum cover, horizontal centre/bottom alignment, replacing landscape
dimensions and contain experiment. Aspect-ratio differences may still crop edges
slightly; no additional zoom. Preserve 85% darkest-teal tint, poster readiness,
reduced motion and focused/foreground lifetime. Website original unchanged.
Full decode, lint and typecheck passed. Pending iPhone visual validation: reload
and open Preview background.

Preview screenshot diagnosis: poster remained visible around the smaller
landscape video, producing two different stars layers and a horizontal seam.
Poster now hides when the first video frame renders and returns on failure or
player unmount. Plain darkest teal fills space outside the video during playback.
Full-frame bottom-centred video remains unchanged. Lint and typecheck passed.
Pending visual retest.

Temporary diagnostic: My Chart's Preview background button opens an empty
shared AppModal, preserving the actual background implementation and Close
control. No independent preview renderer or mock video. Pending owner screenshot
to investigate the report of unchanged framing. Remove diagnostic after review.
Lint and typecheck passed for the preview control.

## Current framing: full composition, no cropping

Owner reports the cover treatment is too zoomed in compared with the original
landscape frame. Supersedes all cover/minimum-cover instructions below: use
min(viewportWidth/960, viewportHeight/540) to show the complete video, horizontal
centre and vertical bottom. Static poster uses contain/bottom too. Unused space
is darkest teal. The video now occupies a shorter landscape area on portrait
screens; filling the whole portrait surface would require cropping or distortion.
Lint and typecheck passed. Next check: owner verifies full stars/yin-yang
composition on iPhone.

Current framing preference: horizontal centre, vertical bottom. Video rectangle
uses left=(viewportWidth-videoWidth)/2 and top=viewportHeight-videoHeight;
poster also uses bottom-centred cover. This supersedes the centred vertical
framing below. On a portrait viewport the landscape video already fits the
height exactly, so there is no vertical crop to shift and the result may look
identical. Keep minimum cover zoom; do not add zoom merely to create a shift.
Lint and typecheck passed. Owner iPhone visual check pending.

Owner colour refinement: shared background base and 85% tint now use
theme.backgroundElement (darkest teal #091a22 in the default dark theme), across
screens and chart modal bodies. Video framing and fallback behavior unchanged.
Lint and typecheck passed for this colour change; iPhone visual check pending.

Framing follow-up: explicitly measure the background viewport and scale the
960x540 asset by max(viewportWidth/960, viewportHeight/540). Centre the resulting
rectangle in both axes and clip overflow. This is the minimum zoom that covers
the entire viewport without distortion; portrait screens necessarily crop the
landscape video's sides. Poster uses centred cover. Applies to shared screen and
modal backgrounds and recomputes on layout/orientation changes. iPhone framing
retest pending. Lint and typecheck passed for this framing change.

## iPhone playback correction

The first owner check showed a QuickTime mark instead of playback. ffprobe of
the website checkout's original (same 5,385,680-byte size as remote HEAD) found
VP9 video, 960x540 yuv420p, AAC audio, duration 32.469 seconds. An extracted frame
showed stars and a faint yin-yang graphic, no QuickTime logo. Codec compatibility
is the suspected cause; a device error code was not captured.

Converted a separate app asset to H.264 with libx264 CRF 25, yuv420p, faststart,
no audio. Shared source now uses assets/videos/stars-background.mp4 through
require, supported by expo-video. Website original remains unchanged. Bundled
video works offline and has no Integration hostname to switch. ffprobe confirms
H.264, 960x540 yuv420p, 32.433 seconds, 604,909 bytes, no audio stream; full ffmpeg
decode completed without errors. Lint and typecheck passed after the source change.
This supersedes
the remote-streaming/source-origin notes below. iPhone retest pending.

Implemented 2026-10-24 using SDK 58-compatible expo-video installed through Expo
CLI. Included in Expo Go; no background audio/Picture-in-Picture enabled.

Shared AppBackground is fixed behind AppScreen content and chart AppModal bodies.
It plays /Videos/Shared/stars-bg.mp4 from the configured API origin, muted and
looping with native controls disabled and an 85% theme-colour overlay. Existing
panel backgrounds stay opaque for readability. The bundled poster is the website
Images/background/stars.jpg, copied unchanged. It stays visible while loading,
on errors and for reduced motion. No arbitrary new media catalogue contract.

Only focused foreground screens mount video players; hiding a tab, enabling
reduced motion or leaving the app releases its player through useVideoPlayer.
Opening a native modal can leave the underlying focused screen mounted, so up to
two decorative players may exist during a chart modal. Assess device performance
before expanding this trial. Playback resumes from the start after remount.
Native video cache requested; browser HTTP caching follows server headers.
This trial streams the MP4; it is not bundled for offline playback. Static poster
works offline. No autoplay failure should block content or display an error banner.

Validation: TypeScript passed and all 97 existing automated tests passed before
the final first-frame visibility refinement; final lint/typecheck results follow
below. Final lint and TypeScript checks both passed after the refinement.
Existing tests cover API/session/reading behavior, not native video playback.
No authentication, entitlement, account draft or 15-second request timeout changes.

Pending iPhone verification: reload Expo Go and inspect motion in the gaps around
My Chart panels; then check modal playback, scrolling/readability, tab switching,
inactive/resume, Reduce Motion and offline poster. Browser autoplay and Android
remain unverified. Next concrete step: owner checks My Chart on iPhone.
