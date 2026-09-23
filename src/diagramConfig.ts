import {type CameraAngle, type CameraPosition, type ShotSize, type Parameter} from './cameraTaxonomy.ts';
export type DiagramPoint = {x: number; y: number; labelX: number; labelY: number};
export const diagramViews: Record<Parameter, string> = {
  size: 'Framing relationship',
  angle: 'Side view',
  position: 'Top-down view',
  roll: 'Through the viewfinder',
};
export const positionPoints: Record<CameraPosition, DiagramPoint> = {
  front: {x: 310, y: 192, labelX: 310, labelY: 230},
  'three-quarter': {x: 430, y: 168, labelX: 449, labelY: 213},
  profile: {x: 490, y: 84, labelX: 510, labelY: 124},
};
export const anglePoints: Record<CameraAngle, DiagramPoint> = {
  'birds-eye': {x: 430, y: 30, labelX: 505, labelY: 33},
  high: {x: 280, y: 52, labelX: 270, labelY: 28},
  eye: {x: 150, y: 113, labelX: 110, labelY: 89},
  low: {x: 225, y: 167, labelX: 175, labelY: 174},
  'worms-eye': {x: 350, y: 208, labelX: 295, labelY: 235},
};
export const sizePoints: Record<ShotSize, number> = {'extreme-wide': 85, wide: 155, medium: 230, close: 305, 'extreme-close': 380};

