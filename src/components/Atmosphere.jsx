// Living background: drifting gradient base, a slow aurora blob, and a
// cursor-reactive glow. Purely decorative (aria-hidden, pointer-events none).
// The cursor glow is wired only for fine pointers and is skipped entirely
// under prefers-reduced-motion; the CSS drift animations are neutralized by
// the global reduced-motion rule.
import { useEffect, useRef, useState } from 'react';
import DotField from './DotField.jsx';
import TableDraft from './TableDraft.jsx';

function Atmosphere() {
  const ref = useRef(null);

  // The interactive dot field runs a canvas loop, so only spin it up where it
  // pays off: fine pointers (cursor to react to) and motion allowed.
  const [showDots] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return (
      window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  });

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
      <div className="atmosphere__light" />
      <TableDraft />
      <div className="atmosphere__base" />
      <div className="atmosphere__aurora" />
      <div className="atmosphere__cursor" />
      {showDots && (
        <div className="atmosphere__dots">
          <DotField
            dotRadius={1.4}
            dotSpacing={16}
            bulgeStrength={48}
            glowRadius={150}
            sparkle={false}
            waveAmplitude={0}
            gradientFrom="rgba(91, 208, 230, 0.34)"
            gradientTo="rgba(91, 208, 230, 0.12)"
            glowColor="rgba(91, 208, 230, 0.16)"
          />
        </div>
      )}
      <div className="atmosphere__grain" />
      <div className="atmosphere__vignette" />
    </div>
  );
}

export default Atmosphere;
