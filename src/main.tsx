import {useEffect, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {flushSync} from 'react-dom';
import {ArrowUpRightIcon} from '@phosphor-icons/react/dist/csr/ArrowUpRight';
import {InfoIcon} from '@phosphor-icons/react/dist/csr/Info';
import {PlusIcon} from '@phosphor-icons/react/dist/csr/Plus';
import {XIcon} from '@phosphor-icons/react/dist/csr/X';
import {ANCHOR_STATE, isCameraValue, parameters, selectParameter, taxonomy, validateCameraPatch, type CameraState, type InteractionMode, type Parameter} from './data';
import {CameraDiagram} from './Diagram';
import {CombinationPanel} from './CameraPanel';
import {IndividualControls} from './IndividualControls';
import {CinematicPreview} from './CinematicPreview';
import {CameraExplanation} from './CameraExplanation';
import {MovementDemo} from './MovementDemo';
import {useInputMethod} from './useInputMethod';
import {SmoothTab} from './SmoothTab';
import {LikeButton} from './LikeButton';
import {FeedbackDialog} from './FeedbackDialog';
import '@fontsource-variable/roboto-mono/wght.css';
import './style.css';
import './interaction.css';
import './community.css';

function App() {
  useInputMethod();
  const [camera, setCamera] = useState<CameraState>({...ANCHOR_STATE});
  const [mode, setMode] = useState<InteractionMode>('explore');
  const [activeParameter, setActiveParameter] = useState<Parameter>('size');
  const [compare, setCompare] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [info, setInfo] = useState(false);
  const [feedback, setFeedback] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const stateRef = useRef({camera, mode});
  stateRef.current = {camera, mode};

  const reset = () => {setCamera({...ANCHOR_STATE}); setCompare(false); setActiveParameter('size'); setHasInteracted(false);};
  const choose = (parameter: Parameter, value: CameraState[Parameter], interactionMode = mode) => {
    setCamera(current => selectParameter(current, interactionMode, parameter, value));
    setActiveParameter(parameter);
    setHasInteracted(true);
    setCompare(false);
  };
  const changeMode = (next: InteractionMode) => {
    // Returning to a lesson isolates the last studied parameter in shared state.
    if (next === 'explore') setCamera(current => selectParameter(current, 'explore', activeParameter, current[activeParameter]));
    setMode(next); setCompare(false);
  };

  useEffect(() => {
    if (info) {previousFocus.current = document.activeElement as HTMLElement; dialog.current?.showModal();}
    else {dialog.current?.close(); previousFocus.current?.focus();}
  }, [info]);

  useEffect(() => {
    type Tool = {name: string; description: string; inputSchema: object; annotations: object; execute: (input: unknown) => unknown};
    const context = (document as Document & {modelContext?: {registerTool: (tool: Tool, options: {signal: AbortSignal}) => Promise<void> | void}}).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const register = (tool: Tool) => {
      try {Promise.resolve(context.registerTool(tool, {signal: lifecycle.signal})).catch(() => {});}
      catch {/* Optional browser integration. */}
    };
    register({
      name: 'explore_camera_property',
      description: 'Select one named static camera setting and reset the other settings to the anchor.',
      inputSchema: {type: 'object', properties: {category: {type: 'string', enum: parameters}, value: {type: 'string'}}, required: ['category', 'value'], additionalProperties: false},
      annotations: {readOnlyHint: false},
      execute: input => {
        const data = input as {category: Parameter; value: CameraState[Parameter]};
        if (!data || Object.keys(data).some(key => !['category', 'value'].includes(key)) || !parameters.includes(data.category) || !isCameraValue(data.category, data.value)) throw new Error('Choose a valid named camera setting.');
        flushSync(() => {setMode('explore'); choose(data.category, data.value, 'explore');});
        return stateRef.current;
      },
    });
    register({
      name: 'set_camera_parameters',
      description: 'Combine named shot size, angle, position and roll settings without resetting other settings.',
      inputSchema: {type: 'object', properties: Object.fromEntries(parameters.map(key => [key, {type: 'string', enum: taxonomy[key].choices.map(choice => choice.id)}])), minProperties: 1, additionalProperties: false},
      annotations: {readOnlyHint: false},
      execute: input => {
        const patch = validateCameraPatch(input);
        flushSync(() => {
          setMode('combinations'); setCamera(current => ({...current, ...patch}));
          setActiveParameter(Object.keys(patch).at(-1) as Parameter); setCompare(false);
          setHasInteracted(true);
        });
        return stateRef.current;
      },
    });
    return () => lifecycle.abort();
  }, []);

  const shown = compare ? ANCHOR_STATE : camera;

  return <>
    <header className="masthead">
      <a href="/" className="wordmark" aria-label="Point of Lens (v1.0) home">Point of Lens <span className="version">(v1.0)</span></a>
      <nav aria-label="Share your thoughts"><button className="feedback-trigger" onClick={() => setFeedback(true)}>Got any precious feedback?</button><LikeButton/></nav>
    </header>
    <main className="workspace">
      <section className="view-column" aria-label="Cinematic preview">
        <div className="frame-top"><h1>{compare ? 'Anchor' : 'Preview'}</h1><button className="text-button compare-button" aria-pressed={compare} onClick={() => setCompare(value => !value)}>{compare ? 'Return to current' : 'Compare'}</button></div>
        <CinematicPreview state={shown} mode={mode}/>
      </section>

      <section className="control-column" aria-label="Camera controls">
        <SmoothTab value={mode} onChange={changeMode}/>
        <div className="controls-toolbar"><button className="text-button" onClick={reset}>Reset</button></div>
        <div id="controls-panel" role="tabpanel" aria-labelledby={`tab-${mode}`}>
          {mode === 'explore' ? <IndividualControls state={camera} onSelect={choose}/> : <CombinationPanel state={camera} onSelect={choose} onFocus={setActiveParameter}/>}
        </div>
        <details className="movement-disclosure"><summary>Camera movement<PlusIcon className="disclosure-symbol" size={18} aria-hidden="true"/></summary><MovementDemo/></details>
      </section>

      <section className="diagram-column" aria-label="Camera placement">
        <details className="diagram-disclosure">
          <summary className="setup-toggle"><span>How the camera is placed</span><PlusIcon className="disclosure-symbol" size={18} aria-hidden="true"/></summary>
          <div id="camera-setup"><CameraDiagram state={shown} parameter={activeParameter}/></div>
        </details>
      </section>
      {hasInteracted && <CameraExplanation state={shown} parameter={activeParameter}/>}
    </main>
    <footer><span>Created by Aditya</span><nav aria-label="Project links"><span className="built">Built using Codex</span><a className="button-link" href="https://github.com/adisada44" target="_blank" rel="noreferrer">GitHub<ArrowUpRightIcon size={14} aria-hidden="true"/></a><button className="info-button" onClick={() => setInfo(true)} aria-label="About this experiment"><InfoIcon size={18} aria-hidden="true"/></button></nav></footer>
    <FeedbackDialog open={feedback} onClose={() => setFeedback(false)}/>
    <dialog ref={dialog} onCancel={() => setInfo(false)} onClick={event => {if (event.target === event.currentTarget) setInfo(false);}} aria-labelledby="about-title">
      <div className="dialog-head"><h2 id="about-title">A study in camera language.</h2><button onClick={() => setInfo(false)} aria-label="Close notes"><XIcon size={18} aria-hidden="true"/></button></div>
      <p>Study one setting at a time, then combine them. The diagram explains the setting you last touched.</p>
      <p>Angle and position choose an exact photograph. A missing view shows its required filename; another photograph is never substituted.</p>
      <p>Individual lessons use dedicated photographs. In combinations, shot size crops the selected viewpoint; wider framing cannot reveal anything outside that source image. Roll rotates the image plane. The separate movement diagrams explain physical camera movement.</p>
      <p>The combinations panel takes inspiration from <a href="https://github.com/joshpuckett/dialkit" target="_blank" rel="noreferrer">DialKit</a>, with named snap points instead of numeric values.</p>
    </dialog>
  </>;
}
createRoot(document.getElementById('root')!).render(<App/>);

