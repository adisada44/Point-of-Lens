import {type CameraState, type CameraRoll, type ShotSize} from './cameraTaxonomy.ts';
import {type InteractionMode} from './cameraState.ts';
import {anglePositionAssets, coreLearningAssets} from './westernAssets.ts';

// Framing study only: the available photograph cannot reveal more of the scene.
// The new canonical image needs gentler crops than the old full-body asset.
export const shotSizeTransforms: Record<ShotSize, {scale: number; origin: string}> = {
  'extreme-wide': {scale: 1, origin: '46% 0%'},
  wide: {scale: 1.08, origin: '46% 0%'},
  medium: {scale: 1.28, origin: '46% 0%'},
  close: {scale: 2.3, origin: '46% 8%'},
  'extreme-close': {scale: 4.6, origin: '46% 22%'},
};
export const rollTransforms: Record<CameraRoll, number> = {'dutch-left': -10, level: 0, 'dutch-right': 10};

export function resolvePreview(state: CameraState, mode: InteractionMode) {
  const roll = rollTransforms[state.roll];
  const radians = Math.abs(roll) * Math.PI / 180;
  // Individual selections have one non-anchor variable. Size lessons use their
  // own photographs; angle/position lessons use the exact viewpoint at scale 1.
  const asset = mode === 'explore' && state.angle === 'eye' && state.position === 'three-quarter'
    ? coreLearningAssets.size[state.size]
    : anglePositionAssets[state.angle][state.position];
  return {
    asset,
    framing: mode === 'explore' ? {scale: 1, origin: '50% 50%'} : shotSizeTransforms[state.size],
    // Fill the existing viewport without side gaps or distorting the photograph.
    fit: 'cover' as const,
    roll,
    // Overscan covers the corners of a rotated 16:9 viewport.
    rollScale: Math.cos(radians) + (16 / 9) * Math.sin(radians),
  };
}

