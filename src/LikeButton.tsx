import {useEffect, useRef, useState} from 'react';
import {LIKES_STORAGE_KEY, parseLikes} from './feedback';

export function LikeButton() {
  const [count, setCount] = useState(() => {
    try {return parseLikes(localStorage.getItem(LIKES_STORAGE_KEY));} catch {return 0;}
  });
  const current = useRef(count);
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const particles = useRef<HTMLSpanElement>(null);
  const animations = useRef<Animation[]>([]);
  useEffect(() => () => {clearTimeout(timer.current); animations.current.forEach(animation => animation.cancel());}, []);
  return <div className="like-control">
    <button type="button" className="like-button" aria-label="Leave a like" onClick={event => {
      const next = Math.min(9999999, current.current + 1);
      current.current = next; setCount(next); setVisible(true);
      try {localStorage.setItem(LIKES_STORAGE_KEY, String(next));} catch {/* Likes still work for this visit. */}
      clearTimeout(timer.current); timer.current = setTimeout(() => setVisible(false), 2200);
      animations.current.forEach(animation => animation.cancel()); animations.current = [];
      if (event.detail === 0 || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      particles.current?.querySelectorAll('i').forEach((piece, i) => {
        const angle = (i / 18) * Math.PI * 2;
        const distance = 30 + (i % 4) * 10;
        animations.current.push(piece.animate([
          {transform: 'translate(0, 0) rotate(0deg)', opacity: 1},
          {transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance - 15}px) rotate(${i % 2 ? 150 : -150}deg)`, opacity: 0},
        ], {duration: 650, easing: 'cubic-bezier(0.23, 1, 0.32, 1)'}));
      });
    }}>Leave a like?</button>
    <span className="confetti" aria-hidden="true" ref={particles}>{Array.from({length: 18}, (_, i) => <i key={i}/>)}</span>
    <span className="like-count" data-visible={visible} role="status" aria-live="polite">{visible ? `${count.toLocaleString()} ${count === 1 ? 'like' : 'likes'} on this browser` : ''}</span>
  </div>;
}
