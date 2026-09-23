import {getChoice, type CameraState, type Parameter} from './data';

export function CameraExplanation({state, parameter}: {state: CameraState; parameter: Parameter}) {
  const choice = getChoice(parameter, state[parameter]);
  return <section className="camera-explanation" aria-live="polite" aria-atomic="true" aria-label="Current setting explained">
    <p>{choice.description}</p>
  </section>;
}

