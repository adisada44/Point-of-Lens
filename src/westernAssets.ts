import {cameraAngles, cameraPositions, cameraRolls, shotSizes, type CameraAngle, type CameraPosition, type CameraState, type Parameter} from './cameraTaxonomy.ts';

export type ViewAsset = {src: string; filename: string; key: string};
const asset = (key: string): ViewAsset => ({key, filename: `${key}.webp`, src: `/assets/western/views/${key}.webp`});
// Expected paths, not an inventory of available files: adding a photograph
// makes it available on refresh without changing this manifest.
export const anglePositionAssets = Object.fromEntries(cameraAngles.map(angle => [angle,
  Object.fromEntries(cameraPositions.map(position => [position, asset(`${angle}__${position}`)])),
])) as Record<CameraAngle, Record<CameraPosition, ViewAsset>>;

const anchor = anglePositionAssets.eye['three-quarter'];
type LearningAssets = {[K in Parameter]: Record<CameraState[K], ViewAsset>};
export const coreLearningAssets: LearningAssets = {
  size: Object.fromEntries(shotSizes.map(size => [size, size === 'medium' ? anchor : asset(`shot-size__${size}`)])) as LearningAssets['size'],
  angle: Object.fromEntries(cameraAngles.map(angle => [angle, anglePositionAssets[angle]['three-quarter']])) as LearningAssets['angle'],
  position: anglePositionAssets.eye,
  roll: Object.fromEntries(cameraRolls.map(roll => [roll, anchor])) as LearningAssets['roll'],
};

// Shared with the CLI audit: each photograph is counted once, including the anchor.
export const requiredCoreAssets = [...new Map(Object.values(coreLearningAssets)
  .flatMap(group => Object.values(group)).map(view => [view.key, view])).values()];

export function assetSource(view: ViewAsset, attempt = 0) {
  return view.src + (attempt ? `?retry=${attempt}` : '');
}

// Probe the exact photograph, including decoding. No allowlist or fallback can
// hide a missing/corrupt file, and newly added views work without source edits.
export function loadViewAsset(view: ViewAsset, attempt = 0): Promise<'ready' | 'missing'> {
  return new Promise(resolve => {
    const image = new Image();
    image.onload = () => resolve(image.naturalWidth > 0 ? 'ready' : 'missing');
    image.onerror = () => resolve('missing');
    image.src = assetSource(view, attempt);
  });
}

