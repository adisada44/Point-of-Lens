import {useId} from 'react';
import {cameraAngles, cameraPositions, getChoice, rollTransforms, shotSizes, type CameraState, type Parameter} from './data';
import {anglePoints, diagramViews, positionPoints, sizePoints} from './diagramConfig';

export function CameraGlyph({x, y, direction = 0, selected = true}: {x: number; y: number; direction?: number; selected?: boolean}) {
  return <g className={`camera-glyph ${selected ? 'is-selected' : ''}`} transform={`translate(${x} ${y}) rotate(${direction})`}>
    <rect x="-14" y="-9" width="24" height="18" rx="1"/>
    <path d="M10-5 20-9V9L10 5Z"/><path d="M-10-13H4" className="camera-top"/>
  </g>;
}
export function SubjectGlyph({x, y}: {x: number; y: number}) {
  return <g className="subject-glyph" transform={`translate(${x} ${y})`}>
    <circle cy="-23" r="11"/><path d="M-14-8Q0-16 14-8L20 35 13 38 8 3M-8 3-13 38-20 35-14-8M-10 30V74M10 30V74M-10 30H10"/>
  </g>;
}
export function CameraDiagram({state, parameter}: {state: CameraState; parameter: Parameter}) {
  const id = useId();
  const name = getChoice(parameter, state[parameter]).label;
  return <div className="camera-diagram" data-parameter={parameter}>
    <div className="diagram-meta"><span>{diagramViews[parameter]}</span><span>{name}</span></div>
    <svg viewBox="0 0 600 250" className="setup-svg" role="img" aria-labelledby={id}>
      <title id={id}>{`${diagramViews[parameter]}: ${name}. Read-only camera illustration.`}</title>
      {parameter === 'position' && <>
        <path className="guide" d="M310 192A108 108 0 0 0 418 84M310 84V190"/>
        <g className="subject-glyph" transform="translate(310 84)"><ellipse rx="27" ry="12"/><circle r="15"/><path d="M-5 20 0 30 5 20"/></g>
        <text x="260" y="64">Subject</text><text x="215" y="145">Facing ↓</text>
        {cameraPositions.map(position => {
          const p = positionPoints[position], selected = position === state.position;
          return <g key={position} className={selected ? 'diagram-selection' : 'diagram-option'}>
            <path className="sight-line" d={`M${p.x} ${p.y}L310 84`}/>
            <CameraGlyph x={p.x} y={p.y} direction={Math.atan2(84 - p.y, 310 - p.x) * 180 / Math.PI} selected={selected}/>
            <text x={p.labelX} y={p.labelY} textAnchor="middle">{getChoice('position', position).short}</text>
          </g>;
        })}
      </>}
      {parameter === 'angle' && <>
        <path className="ground-line" d="M375 215H515"/>
        <SubjectGlyph x={430} y={141}/><text x="490" y="160">Subject</text>
        {cameraAngles.map(angle => {
          const p = anglePoints[angle], selected = angle === state.angle;
          return <g key={angle} className={selected ? 'diagram-selection' : 'diagram-option'}>
            <path className="sight-line" d={`M${p.x} ${p.y}L430 115`}/>
            <CameraGlyph x={p.x} y={p.y} direction={Math.atan2(115 - p.y, 430 - p.x) * 180 / Math.PI} selected={selected}/>
            <text x={p.labelX} y={p.labelY} textAnchor="middle">{getChoice('angle', angle).short}</text>
          </g>;
        })}
      </>}
      {parameter === 'size' && <>
        <path className="guide" d="M75 135H465"/><path className="ground-line" d="M450 205H520"/>
        <SubjectGlyph x={485} y={131}/><text x="485" y="50" textAnchor="middle">Subject</text>
        {shotSizes.map(size => <path key={size} className="guide-tick" d={`M${sizePoints[size]} 127v16`}/>)}
        <path className="view-cone" d={`M${sizePoints[state.size]} 135L485 ${135 - (485 - sizePoints[state.size]) * .24}V${135 + (485 - sizePoints[state.size]) * .24}Z`}/>
        <CameraGlyph x={sizePoints[state.size]} y={135}/>
        <text x={sizePoints[state.size]} y="101" textAnchor="middle">Camera</text>
        <text x="85" y="193">Farther · Wider</text><text x="330" y="193" textAnchor="middle">Closer · Tighter</text>
        <path className="ground-line" d="M170 213H320M178 209 170 213 178 217M312 209 320 213 312 217"/>
      </>}
      {parameter === 'roll' && <>
        <path className="guide" d="M140 125H460"/>
        <g transform={`rotate(${rollTransforms[state.roll]} 300 125)`}>
          <rect className="frame-outline" x="198" y="63" width="204" height="124"/>
          <path className="ground-line" d="M202 125H398"/>
          <g className="subject-glyph" transform="translate(300 119)"><circle cy="-10" r="12"/><path d="M-25 50V14Q0-4 25 14V50"/></g>
        </g>
        <text x="135" y="117" textAnchor="end">Level horizon</text><text x="300" y="226" textAnchor="middle">{name}</text>
      </>}
    </svg>
    {parameter === 'size' && <p className="diagram-note">Illustrative spacing. Framing also depends on the lens.</p>}
  </div>;
}

