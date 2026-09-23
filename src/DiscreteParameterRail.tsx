import {useId, useRef, type CSSProperties, type PointerEvent} from 'react';
import {ANCHOR_STATE, getChoice, railKeyIndex, snapIndex, taxonomy, type CameraState, type Parameter} from './data';

type Props = {
  parameter: Parameter;
  value: CameraState[Parameter];
  onChange: (value: CameraState[Parameter]) => void;
  onFocus: () => void;
};
export function DiscreteParameterRail({parameter, value, onChange, onFocus}: Props) {
  const id = useId();
  const track = useRef<HTMLDivElement>(null);
  const pointer = useRef<number | null>(null);
  const group = taxonomy[parameter];
  const index = group.choices.findIndex(choice => choice.id === value);
  const anchor = group.choices.findIndex(choice => choice.id === ANCHOR_STATE[parameter]);
  const chooseAt = (event: PointerEvent<HTMLDivElement>) => {
    const rect = track.current!.getBoundingClientRect();
    if (rect.width) onChange(group.choices[snapIndex((event.clientX - rect.left) / rect.width, group.choices.length)].id);
  };
  const release = (event: PointerEvent<HTMLDivElement>) => {
    if (pointer.current !== event.pointerId) return;
    pointer.current = null;
    delete event.currentTarget.dataset.dragging;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };
  return <section className="discrete-parameter" style={{'--stops': group.choices.length} as CSSProperties}>
    <div className="rail-track" ref={track} role="slider" tabIndex={0}
      aria-labelledby={id} aria-valuemin={0} aria-valuemax={group.choices.length - 1}
      aria-valuenow={index} aria-valuetext={getChoice(parameter, value).label} aria-orientation="horizontal"
      onFocus={onFocus}
      onPointerDown={event => {
        if (event.button !== 0 || pointer.current !== null) return;
        event.currentTarget.focus();
        pointer.current = event.pointerId;
        event.currentTarget.dataset.dragging = 'true';
        event.currentTarget.setPointerCapture(event.pointerId);
        chooseAt(event);
      }}
      onPointerMove={event => {if (pointer.current === event.pointerId) chooseAt(event);}}
      onPointerUp={release} onPointerCancel={release}
      onLostPointerCapture={event => {pointer.current = null; delete event.currentTarget.dataset.dragging;}}
      onKeyDown={event => {
        if (event.ctrlKey || event.metaKey || event.altKey) return;
        const next = railKeyIndex(event.key, index, group.choices.length);
        if (next === null) return;
        event.preventDefault();
        onChange(group.choices[next].id);
      }}>
      <span className="rail-fill" style={{transform: `scaleX(${index / (group.choices.length - 1)})`}} aria-hidden="true"/>
      <span id={id} className="rail-title">{group.title}</span><span className="rail-current">{getChoice(parameter, value).short}</span>
      <span className="rail-stops" aria-hidden="true">{group.choices.map((choice, i) => <span className={`rail-tick ${i === anchor ? 'is-anchor' : ''}`} key={choice.id} style={{left: `${i / (group.choices.length - 1) * 100}%`}}/>)}</span>
      <span className="rail-handle" style={{left: `clamp(3px, ${index / (group.choices.length - 1) * 100}%, calc(100% - 4px))`}} aria-hidden="true"/>
    </div>
    <div className="rail-labels">
      {group.choices.map((choice, i) => <button key={choice.id} className="rail-label"
        aria-label={choice.label} aria-pressed={choice.id === value} title={i === anchor ? 'Anchor setting' : undefined} onClick={() => onChange(choice.id)}>
        <span>{choice.short}</span>{i === anchor && <span className="rail-anchor-dot" aria-hidden="true"/>}
      </button>)}
    </div>
  </section>;
}

