# Point of Lens (v1.0)

A small camera-language experiment, corrected in the existing React + TypeScript + Vite project. The supplied sketch remains the layout reference.

## Run and check

- `npm install`
- `npm run dev`
- `npm run check:camera`
- `npm run check:assets`
- `npm run build`

The camera and asset checks require Node 22.18+ for native TypeScript type stripping.

## One camera model

The shared CameraState has four named fields: size, angle, position and roll. The anchor is Medium / Eye level / Three-quarter front / Level.

- Tweak individually: discrete buttons; changing one parameter resets all others to the anchor.
- Use combinations: draggable rails with named snap points; other settings are preserved.
- Rail labels support click/tap. Focused rails support arrow keys, Home and End. Accessible value text contains the selected name.
- Tabs share state. Compare temporarily shows the anchor without editing the current selection.
- Returning to individual mode isolates the last studied parameter and resets the others to the anchor.
- The contextual diagram is read-only. It explains the last parameter selected or focused.
- Movement is a separate animated diagram module. It never changes the static camera state or still-image asset. Reduced motion shows a representative static diagram.

## Photographic views

Place WebP images in `public/assets/western/views/` using these exact names:

| Angle | Front | Three-quarter front | Profile |
| --- | --- | --- | --- |
| Bird’s-eye | birds-eye__front.webp | birds-eye__three-quarter.webp | birds-eye__profile.webp |
| High | high__front.webp | high__three-quarter.webp | high__profile.webp |
| Eye level | eye__front.webp | eye__three-quarter.webp | eye__profile.webp |
| Low | low__front.webp | low__three-quarter.webp | low__profile.webp |
| Worm’s-eye | worms-eye__front.webp | worms-eye__three-quarter.webp | worms-eye__profile.webp |

All 11 core learning photographs are installed as lossless WebP conversions of the supplied PNGs, with decoded pixels verified unchanged. Seven angle-position views are available: all three eye-level positions, plus bird’s-eye, high, low and worm’s-eye at three-quarter front. The remaining eight combinations show “VIEW ASSET NEEDED” and their exact filename.

Individual shot-size lessons use `shot-size__extreme-wide.webp`, `shot-size__wide.webp`, `eye__three-quarter.webp` (medium), `shot-size__close.webp` and `shot-size__extreme-close.webp`. Individual angle and position lessons use their exact viewpoint photograph. Roll uses the anchor with image-plane rotation. Photographs fill the existing preview frame proportionally, cropping to its aspect ratio without stretching faces or adding side gaps. Individual lessons apply no additional shot-size zoom.

Drop each new file into the folder, then reload or use “Check again” on its placeholder. No source-code or manifest edits are required. For a deployed static site, include the new files in the next build/deployment. Files should belong to the same photographic series: identity, poncho, hat, pose, holster, geography, lighting and treatment.

The older files directly under `public/assets/western/` are retained as unused legacy assets. They are not selected by the resolver and do not match the new canonical identity.

`npm run check:assets` reports the 11 unique V1 core individual-learning assets in `public/assets/western/views/`, including the four dedicated shot-size filenames. It reads the same manifest as the preview. It checks presence, not visual quality. See the [Western asset audit and integration record](docs/western-asset-audit.md) for the legacy mapping decisions and supplied assets.

## Rendering and limitations

In individual mode, the deterministic resolver selects a dedicated learning photograph at scale 1. In combinations, it selects the angle × position photograph, then applies the shot-size crop and roll. `westernAssets.ts` defines the core mappings, combination paths and exact-image loading check; a missing or undecodable image never falls back to another photograph. There are no perspective, horizontal/vertical rotation, or skew transforms to simulate viewpoints.

Shot size in combinations remains an intentional framing simplification: wider settings show more of the selected photograph, not unseen scenery. Individual mode uses the dedicated wider and closer photographs. Future combination photographs should use consistent composition, subject position and headroom; the framing table remains centralized for calibration.

## Code map

- `cameraTaxonomy.ts`: semantic types, labels and educational copy.
- `cameraState.ts`: anchor, state transitions, validation, snapping and keyboard rules.
- `westernAssets.ts`: core learning assets, all 15 combination paths and exact-image availability checks.
- `previewResolver.ts`: source selection, shot-size framing and roll.
- `CinematicPreview.tsx`: keyed image loading and honest missing-view state.
- `IndividualControls.tsx`, `CameraPanel.tsx`, `DiscreteParameterRail.tsx`: the two interaction modes.
- `Diagram.tsx`, `diagramConfig.ts`: read-only contextual camera illustrations.
- `MovementDemo.tsx`: separate movement demonstrations.
- `CameraExplanation.tsx`: one concise explanation of the current parameter.

The draggable-rail interaction takes inspiration from Josh Puckett’s DialKit, but uses a small purpose-built semantic control rather than numeric sliders. The UI uses sans-serif type with headings capped at 18px, compact filled parameter rows inspired by DialKit, and the requested #faf9f6 / #111111 palette. The redundant image caption is removed. Diagram and movement sections start collapsed; a concise explanation appears after selection. Mobile order is preview, controls, diagram, explanation.



Interaction polish: both camera disclosures start collapsed; their labels are 16px/500 at every breakpoint. Phosphor supplies the icons. Pointer press feedback uses 160ms CSS transitions, disclosures 200ms, and dialogs 250ms with the shared strong ease-out curve. Keyboard actions and active rail dragging remain immediate. Reduced motion uses short opacity transitions without movement. Browsers without intrinsic-size transitions retain native instant disclosure behavior.

## Community controls and typography

Roboto Mono is bundled locally through Fontsource, including diagram labels. Its font license and the adapted Kokonut UI Smooth Tab notice ship under `public/licenses/`. The tab navigation uses Kokonut's measured sliding indicator and Motion spring (400 stiffness / 30 damping), adapted to controlled camera modes, keyboard navigation and reduced motion. Source attribution is in `THIRD_PARTY_NOTICES.md`.

The header follows the supplied feedback-link / outlined-like-button reference. GitHub and the information button live in the footer. Buttons share the same quiet outlined treatment; selected camera choices and tabs remain filled for clarity.

Likes count clicks on the current browser, not a shared visitor total. The numeric count is stored at `point-of-lens:likes:v1` in localStorage; blocked storage falls back to the current visit. The count appears for 2.2 seconds after a click. A bounded 18-piece, 650ms confetti burst provides pointer feedback and is skipped for keyboard input or reduced motion. Repeated clicks replace the previous burst and extend the count display.

Feedback opens a native modal with an editable, 1,000-character message. **Open email draft** opens the visitor's email app addressed to `adisadashiv44@gmail.com`; the visitor sends it there. No delivery is claimed or performed by the site. The draft remains only in React memory until a reload. Voice input uses the browser's optional SpeechRecognition API only after pressing **Use voice**. It requires browser support and microphone permission, may use the browser provider's speech service, and is stopped on closing, switching away from the page, unmounting, error, or a 60-second limit. No audio is stored by this app. Typing remains available when voice is unavailable.

Run `npm run check:feedback` to verify email query isolation, length/Unicode handling and corrupt like-count recovery. See `docs/security-audit.md` for the follow-up security review and testing limitations.
