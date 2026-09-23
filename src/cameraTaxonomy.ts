export const shotSizes = ['extreme-wide', 'wide', 'medium', 'close', 'extreme-close'] as const;
export const cameraAngles = ['birds-eye', 'high', 'eye', 'low', 'worms-eye'] as const;
export const cameraPositions = ['front', 'three-quarter', 'profile'] as const;
export const cameraRolls = ['dutch-left', 'level', 'dutch-right'] as const;
export type ShotSize = typeof shotSizes[number];
export type CameraAngle = typeof cameraAngles[number];
export type CameraPosition = typeof cameraPositions[number];
export type CameraRoll = typeof cameraRolls[number];
export type CameraState = {size: ShotSize; angle: CameraAngle; position: CameraPosition; roll: CameraRoll};
export type Parameter = keyof CameraState;
export type Movement = 'push-in' | 'pan' | 'tilt';
export const parameters = ['size', 'angle', 'position', 'roll'] as const;
type Choice<T extends string> = {id: T; label: string; short: string; description: string};
type Taxonomy = {[K in Parameter]: {title: string; index: string; choices: Choice<CameraState[K]>[]}};

export const taxonomy: Taxonomy = {
  size: {title: 'Shot size', index: '01', choices: [
    {id: 'extreme-wide', label: 'Extreme wide', short: 'Extreme wide', description: 'The environment dominates the frame while the subject appears relatively small.'},
    {id: 'wide', label: 'Wide', short: 'Wide', description: 'A wide shot gives the subject room within the surrounding environment.'},
    {id: 'medium', label: 'Medium', short: 'Medium', description: 'A medium shot frames the subject around the waist, keeping gesture and expression in view.'},
    {id: 'close', label: 'Close-up', short: 'Close-up', description: 'A close-up brings the face into focus and leaves less of the surroundings in view.'},
    {id: 'extreme-close', label: 'Extreme close-up', short: 'Extreme close-up', description: 'An extreme close-up isolates a small detail, such as the eyes.'},
  ]},
  angle: {title: 'Camera angle', index: '02', choices: [
    {id: 'birds-eye', label: 'Bird’s-eye / Overhead', short: 'Bird’s-eye', description: 'The camera looks straight down at the subject from overhead.'},
    {id: 'high', label: 'High angle', short: 'High', description: 'The camera sits above the subject and looks downward.'},
    {id: 'eye', label: 'Eye level', short: 'Eye level', description: 'The camera meets the subject at eye level.'},
    {id: 'low', label: 'Low angle', short: 'Low', description: 'The camera sits below the subject and looks upward.'},
    {id: 'worms-eye', label: 'Worm’s-eye / Extreme low', short: 'Worm’s-eye', description: 'The camera looks steeply upward from close to the ground.'},
  ]},
  position: {title: 'Camera position', index: '03', choices: [
    {id: 'front', label: 'Front', short: 'Front', description: 'The camera faces the subject directly, along their frontal axis.'},
    {id: 'three-quarter', label: 'Three-quarter front', short: 'Three-quarter front', description: 'The camera sits between the front and side, revealing more of the subject’s form.'},
    {id: 'profile', label: 'Profile', short: 'Profile', description: 'The camera is positioned roughly a quarter-turn around the subject from the frontal axis.'},
  ]},
  roll: {title: 'Camera roll', index: '04', choices: [
    {id: 'dutch-left', label: 'Dutch left', short: 'Dutch left', description: 'The camera is rolled around its viewing axis, tilting the horizon to the left.'},
    {id: 'level', label: 'Level', short: 'Level', description: 'The camera remains upright and the horizon stays level.'},
    {id: 'dutch-right', label: 'Dutch right', short: 'Dutch right', description: 'The camera is rolled around its viewing axis, tilting the horizon to the right.'},
  ]},
};

export const movementChoices: {id: Movement; label: string; description: string; view: string}[] = [
  {id: 'push-in', label: 'Dolly / Push in', description: 'The physical camera moves toward the subject; a real dolly changes perspective, unlike a simple zoom.', view: 'Camera travels forward'},
  {id: 'pan', label: 'Pan', description: 'The camera stays in place and rotates horizontally, looking left or right.', view: 'Top-down view'},
  {id: 'tilt', label: 'Tilt', description: 'The camera stays in place and rotates vertically, looking up or down.', view: 'Side view'},
];

export function getChoice<K extends Parameter>(parameter: K, value: CameraState[K]) {
  return taxonomy[parameter].choices.find(choice => choice.id === value)!;
}

