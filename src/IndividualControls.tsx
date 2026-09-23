import {ANCHOR_STATE, parameters, railKeyIndex, taxonomy, type CameraState, type Parameter} from './data';

type Props = {state: CameraState; onSelect: (parameter: Parameter, value: CameraState[Parameter]) => void};
export function IndividualControls({state, onSelect}: Props) {
  return <div className="parameters">
    {parameters.map(parameter => {
      const group = taxonomy[parameter];
      return <section className="parameter" key={parameter}>
        <div className="parameter-heading"><h2>{group.title}</h2></div>
        <div className="choice-buttons" role="group" aria-label={group.title}>
          {group.choices.map((item, index) => <button key={item.id} className="choice"
            aria-label={item.label} aria-pressed={state[parameter] === item.id}
            data-anchor={item.id === ANCHOR_STATE[parameter]}
            title={item.id === ANCHOR_STATE[parameter] ? 'Anchor setting' : undefined}
            onClick={() => onSelect(parameter, item.id)}
            onKeyDown={event => {
              if (event.ctrlKey || event.metaKey || event.altKey) return;
              const next = railKeyIndex(event.key, index, group.choices.length);
              if (next === null) return;
              event.preventDefault();
              onSelect(parameter, group.choices[next].id);
              (event.currentTarget.parentElement?.children[next] as HTMLElement)?.focus();
            }}>
            {item.short}{item.id === ANCHOR_STATE[parameter] && <span className="anchor-dot" aria-hidden="true">◇</span>}
          </button>)}
        </div>
      </section>;
    })}
  </div>;
}

