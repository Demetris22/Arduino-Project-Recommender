// Tweens an integer toward `value` with a short eased roll instead of snapping.
// Snaps instantly under prefers-reduced-motion.
import { useEffect, useRef, useState } from 'react';

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    if (from === to) return;

    const reduce =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      fromRef.current = to;
      setDisplay(to);
      return;
    }

    let rafId = 0;
    let start = 0;
    const duration = 420;

    const step = (now) => {
      if (!start) start = now;
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      const current = Math.round(from + (to - from) * eased);
      setDisplay(current);
      fromRef.current = current;
      if (p < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        fromRef.current = to;
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [value]);

  return <>{display}</>;
}

export default AnimatedNumber;
