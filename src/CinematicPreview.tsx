import {useEffect, useState} from 'react';
import {assetSource, getChoice, loadViewAsset, resolvePreview, type CameraState, type InteractionMode} from './data';

type Props = {state: CameraState; mode: InteractionMode};
export function CinematicPreview({state, mode}: Props) {
  const preview = resolvePreview(state, mode);
  // A keyed loader prevents the previous view from appearing during a new request.
  return <div className="film-frame" data-camera={JSON.stringify(state)} data-view={preview.asset.key}>
    <PhotographicView key={preview.asset.key} preview={preview} state={state}/>
  </div>;
}
function PhotographicView({preview, state}: {state: CameraState; preview: ReturnType<typeof resolvePreview>}) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing'>('loading');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let current = true;
    loadViewAsset(preview.asset, attempt).then(result => {if (current) setStatus(result);});
    return () => {current = false;};
  }, [preview.asset, attempt]);
  return <>
    {status !== 'missing' && <div className="roll-plane" style={{visibility: status === 'ready' ? 'visible' : 'hidden', transform: `rotate(${preview.roll}deg) scale(${preview.rollScale})`}}>
      <img key={attempt} src={assetSource(preview.asset, attempt)}
        alt={`Western scene: ${getChoice('angle', state.angle).label}, ${getChoice('position', state.position).label}, ${getChoice('size', state.size).label}`}
        draggable={false} style={{objectFit: preview.fit, transform: `scale(${preview.framing.scale})`, transformOrigin: preview.framing.origin}}
        onError={() => setStatus('missing')}/>
    </div>}
    {status !== 'ready' && <div className="view-placeholder" role="status">
      <span className="eyebrow">{status === 'missing' ? 'View asset needed' : 'Loading view'}</span>
      <p>{preview.asset.filename}</p>
      {status === 'missing' && <button className="text-button" onClick={() => {setAttempt(value => value + 1); setStatus('loading');}}>Check again ↻</button>}
    </div>}
  </>;
}

