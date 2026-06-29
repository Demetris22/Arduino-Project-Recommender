// Living background: drifting gradient base, a slow aurora blob, and a
// cursor-reactive glow. Purely decorative (aria-hidden, pointer-events none).
// The cursor glow is wired only for fine pointers and is skipped entirely
// under prefers-reduced-motion; the CSS drift animations are neutralized by
// the global reduced-motion rule.
import { useEffect, useRef } from 'react';

function Atmosphere() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    // Touch devices and reduced-motion users get the static atmosphere only.
    if (reduce || !finePointer) return;

    let rafId = 0;
    let x = 0;
    let y = 0;

    const apply = () => {
      rafId = 0;
      el.style.setProperty('--cursor-x', `${x}px`);
      el.style.setProperty('--cursor-y', `${y}px`);
      el.style.setProperty('--cursor-on', '1');
    };

    const onMove = (event) => {
      x = event.clientX;
      y = event.clientY;
      if (!rafId) rafId = requestAnimationFrame(apply);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="atmosphere" ref={ref} aria-hidden="true">
      <div className="atmosphere__base" />
      <div className="atmosphere__aurora" />
      <div className="atmosphere__cursor" />
    </div>
  );
}

export default Atmosphere;
