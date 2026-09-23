import {useEffect, useId, useState} from 'react';
import {movementChoices, type Movement} from './data';
import {CameraGlyph, SubjectGlyph} from './Diagram';

export function MovementDemo() {
  const [movement, setMovement] = useState<Movement>('push-in');
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const id = useId();
  const choice = movementChoices.find(item => item.id === movement)!;
  useEffect(() => {
    if (!playing) return;
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const freeze = () => {if (preference.matches) {setProgress(.65); setPlaying(false);}};
    if (preference.matches) {freeze(); return;}
    let request: number;
    const start = performance.now();
    const tick = (now: number) => {
      const next = Math.min(1, (now - start) / 3600);
      setProgress(next);
      if (next < 1) request = requestAnimationFrame(tick);
      else setPlaying(false);
    };
    preference.addEventListener('change', freeze);
    request = requestAnimationFrame(tick);
    return () => {cancelAnimationFrame(request); preference.removeEventListener('change', freeze);};
  }, [playing]);
  const rotation = Math.sin(progress * Math.PI * 2) * 25;
  return <section className="movement-section" aria-labelledby="movement-heading">
    <div className="movement-heading"><div><span className="eyebrow">In motion</span><h2 id="movement-heading">Camera movement</h2></div>
      <button className="text-button" aria-label={playing ? 'Stop movement' : 'Play movement'} onClick={() => {
        if (playing) setPlaying(false); else {setProgress(0); setPlaying(true);}
      }}>{playing ? 'Stop ■' : 'Play ▷'}</button>
    </div>
    <div className="choice-buttons" role="group" aria-label="Camera movement">
      {movementChoices.map(item => <button key={item.id} className="choice" aria-pressed={movement === item.id}
        onClick={() => {setMovement(item.id); setProgress(0); setPlaying(false);}}>{item.label}</button>)}
    </div>
    <svg className="movement-svg" viewBox="0 0 440 120" role="img" aria-labelledby={id}>
      <title id={id}>{choice.label}: {choice.description}</title>
      {movement === 'push-in' ? <>
        <path className="guide" d="M75 57H322"/>
        <path className="ground-line" d="M210 51 218 57 210 63M248 51 256 57 248 63M286 51 294 57 286 63"/>
        <CameraGlyph x={80 + progress * 100} y={57}/><SubjectGlyph x={350} y={41}/>
        <text x="80" y="104">Camera</text><text x="350" y="104" textAnchor="middle">Subject</text>
      </> : <>
        <path className="guide" d="M165 57H340"/>
        <g transform={`rotate(${rotation} 165 57)`}>
          <path className="view-cone" d="M165 57 330 12V102Z"/>
          <CameraGlyph x={165} y={57}/>
        </g>
        <path className="ground-line" d="M213 22Q243 57 213 92M212 84 213 92 221 88"/>
        <text x="85" y="106">Fixed camera</text><text x="345" y="106" textAnchor="middle">{choice.view}</text>
      </>}
    </svg>
    <p className="movement-description">{choice.description}</p>
    <small className="movement-note">Illustrative diagram · separate from the still image</small>
  </section>;
}

