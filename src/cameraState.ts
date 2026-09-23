import {parameters, taxonomy, type CameraState, type Parameter} from './cameraTaxonomy.ts';

export const ANCHOR_STATE: Readonly<CameraState> = Object.freeze({size: 'medium', angle: 'eye', position: 'three-quarter', roll: 'level'});
export type InteractionMode = 'explore' | 'combinations';

export function isCameraValue<K extends Parameter>(parameter: K, value: unknown): value is CameraState[K] {
  return taxonomy[parameter].choices.some(choice => choice.id === value);
}

export function selectParameter<K extends Parameter>(state: CameraState, mode: InteractionMode, parameter: K, value: CameraState[K]): CameraState {
  if (!isCameraValue(parameter, value)) throw new Error('Unknown camera setting.');
  return {...(mode === 'explore' ? ANCHOR_STATE : state), [parameter]: value};
}

export function validateCameraPatch(input: unknown): Partial<CameraState> {
  if (!input || typeof input !== 'object' || Array.isArray(input) || !Object.keys(input).length) throw new Error('Provide named camera settings.');
  for (const [key, value] of Object.entries(input)) {
    if (!parameters.includes(key as Parameter) || !isCameraValue(key as Parameter, value)) throw new Error('Unknown camera setting.');
  }
  return input as Partial<CameraState>;
}

export function snapIndex(position: number, count: number) {
  return Math.max(0, Math.min(count - 1, Math.round((Number.isFinite(position) ? position : 0) * (count - 1))));
}

export function railKeyIndex(key: string, index: number, count: number): number | null {
  if (key === 'Home') return 0;
  if (key === 'End') return count - 1;
  if (key === 'ArrowRight' || key === 'ArrowUp') return Math.min(count - 1, index + 1);
  if (key === 'ArrowLeft' || key === 'ArrowDown') return Math.max(0, index - 1);
  return null;
}

