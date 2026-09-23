/**
 * Adapted from Kokonut UI Smooth Tab by @dorianbaffier (MIT).
 * https://kokonutui.com/docs/navigation/smooth-tab
 * Controlled learning modes, native tab keyboard behavior, reduced motion,
 * and the sliding indicator only. License: ../THIRD_PARTY_NOTICES.md
 */
import {useLayoutEffect, useRef, useState} from 'react';
import {motion, useReducedMotion} from 'motion/react';
import type {InteractionMode} from './cameraState';

const items = [{id: 'explore', title: 'Tweak individually'}, {id: 'combinations', title: 'Use combinations'}] as const;
export function SmoothTab({value, onChange}: {value: InteractionMode; onChange: (value: InteractionMode) => void}) {
  const container = useRef<HTMLDivElement>(null);
  const buttons = useRef(new Map<InteractionMode, HTMLButtonElement>());
  const [dimensions, setDimensions] = useState({width: 0, left: 0});
  const reduce = useReducedMotion();
  useLayoutEffect(() => {
    const update = () => {
      const button = buttons.current.get(value);
      if (button) setDimensions({width: button.offsetWidth, left: button.offsetLeft});
    };
    update();
    const observer = new ResizeObserver(update);
    if (container.current) observer.observe(container.current);
    return () => observer.disconnect();
  }, [value]);
  const instant = reduce || document.documentElement.dataset.inputMethod !== 'pointer';
  return <div className="smooth-tabs" ref={container} role="tablist" aria-label="Learning mode">
    <motion.div className="smooth-tab-indicator" aria-hidden="true" initial={false}
      style={{width: dimensions.width}}
      animate={{transform: `translateX(${dimensions.left}px)`, opacity: dimensions.width ? 1 : 0}}
      transition={instant ? {duration: 0} : {type: 'spring', stiffness: 400, damping: 30}}/>
    {items.map(item => <button key={item.id} type="button" id={`tab-${item.id}`} role="tab"
      ref={element => {if (element) buttons.current.set(item.id, element); else buttons.current.delete(item.id);}}
      aria-selected={value === item.id} aria-controls="controls-panel" tabIndex={value === item.id ? 0 : -1}
      onClick={() => onChange(item.id)} onKeyDown={event => {
        if (event.ctrlKey || event.metaKey || event.altKey) return;
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === 'Home' ? 'explore' : event.key === 'End' ? 'combinations' : item.id === 'explore' ? 'combinations' : 'explore';
        onChange(next); buttons.current.get(next)?.focus();
      }}>{item.title}</button>)}
  </div>;
}
