import {parameters, type CameraState, type Parameter} from './data';
import {DiscreteParameterRail} from './DiscreteParameterRail';

type Props = {state: CameraState; onSelect: (parameter: Parameter, value: CameraState[Parameter]) => void; onFocus: (parameter: Parameter) => void};
export function CombinationPanel({state, onSelect, onFocus}: Props) {
  return <div className="combination-panel" role="group" aria-label="Combined camera settings">
    {parameters.map(parameter => <DiscreteParameterRail key={parameter} parameter={parameter} value={state[parameter]}
      onChange={value => onSelect(parameter, value)} onFocus={() => onFocus(parameter)}/>)}
  </div>;
}

