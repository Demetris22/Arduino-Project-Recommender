// A clip-path "curtain" page transition (inspired by Motion's curtains/clip-wipe
// example), used when moving between the catalog and the kit. The trick that
// makes it read as a real transition is timing the route swap to happen WHILE
// the screen is covered:
//
//   click → curtain wipes IN to cover → navigate (hidden) → curtain wipes OUT
//
// so you never see the old page jump to the new one. Forward (to the kit) sweeps
// one way; back sweeps the other. Reduced-motion navigates instantly with no
// curtain. Links opt in via useCurtainNav(); everything else navigates normally.
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

const CurtainCtx = createContext(() => {});
export const useCurtainNav = () => useContext(CurtainCtx);

const EASE = [0.66, 0, 0.34, 1]; // easeInOutCubic — a decisive, even sweep
const DURATION = 0.6;

// The clip region is a rectangle with a curved LEFT and RIGHT edge, in 0..1
// objectBoundingBox space (so it's resolution-independent). Sweeping the edges
// across — with the control points pushed ahead of the endpoints — gives the
// convex "bulge" leading edge from the Motion curtains example, instead of a
// flat vertical wipe. Each edge: endpoints at x, control (bulge) at cx.
const P = (lx, lc, rx, rc) => `M ${lx} 0 Q ${lc} 0.5 ${lx} 1 L ${rx} 1 Q ${rc} 0.5 ${rx} 0 Z`;

// forward keyframes [leftX, leftCtrl, rightX, rightCtrl]:
//  hidden  → the right (leading) edge bulges across → covered → the left edge
//  bulges across to reveal → gone. cover fills from the left; reveal empties it.
const KEYS = {
  hidden: [0, 0, 0, 0],
  coverMid: [0, 0, 0.12, 1.06],
  covered: [0, 0, 1.18, 1.32],
  revealMid: [0.42, 1.36, 1.2, 1.3],
  revealed: [1.22, 1.34, 1.26, 1.36],
};
// back = the same sweep mirrored horizontally (x → 1 − x, left/right swapped).
const mirror = ([lx, lc, rx, rc]) => [1 - rx, 1 - rc, 1 - lx, 1 - lc];
const dOf = (dir, key) => P(...(dir === 'back' ? mirror(KEYS[key]) : KEYS[key]));

function Curtain({ dir, phase, onCovered, onRevealed }) {
  const keys = phase === 'cover' ? ['hidden', 'coverMid', 'covered'] : ['covered', 'revealMid', 'revealed'];
  const d = keys.map((k) => dOf(dir, k));

  return (
    <div className="curtain" style={{ clipPath: 'url(#curtain-clip)', WebkitClipPath: 'url(#curtain-clip)' }}>
      <svg className="curtain__clip" width="0" height="0" aria-hidden="true" focusable="false">
        <defs>
          <clipPath id="curtain-clip" clipPathUnits="objectBoundingBox">
            <motion.path
              initial={{ d: d[0] }}
              animate={{ d }}
              transition={{ duration: DURATION, ease: EASE, times: [0, 0.5, 1] }}
              onAnimationComplete={() => (phase === 'cover' ? onCovered() : onRevealed())}
            />
          </clipPath>
        </defs>
      </svg>
      <span className="curtain__mark" aria-hidden="true">
        <img src="/favicon.svg" alt="" width="42" height="42" />
        <span>Sketchef</span>
      </span>
    </div>
  );
}

export function CurtainProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const reduce = useReducedMotion();
  const [tx, setTx] = useState(null); // { to, dir, phase }
  const txRef = useRef(null);
  const busy = useRef(false);

  useEffect(() => {
    txRef.current = tx;
  }, [tx]);

  const curtainNav = useCallback(
    (to, dir = 'forward') => {
      const samePage = (to.split('#')[0] || '/') === location.pathname && !to.includes('#');
      // No animation when it wouldn't help: reduced motion, a transition already
      // running, or a click that doesn't actually change page.
      if (reduce || busy.current || samePage) {
        navigate(to);
        return;
      }
      busy.current = true;
      setTx({ to, dir, phase: 'cover' });
    },
    [navigate, reduce, location.pathname]
  );

  // covered → swap the route behind the curtain, then wipe it away
  const onCovered = useCallback(() => {
    const s = txRef.current;
    if (!s) return;
    navigate(s.to);
    setTx({ ...s, phase: 'reveal' });
  }, [navigate]);

  const onRevealed = useCallback(() => {
    busy.current = false;
    setTx(null);
  }, []);

  return (
    <CurtainCtx.Provider value={curtainNav}>
      {children}
      <AnimatePresence>
        {tx && (
          <Curtain key="curtain" dir={tx.dir} phase={tx.phase} onCovered={onCovered} onRevealed={onRevealed} />
        )}
      </AnimatePresence>
    </CurtainCtx.Provider>
  );
}

// Helper for building an onClick that runs the curtain instead of an instant
// navigation, while leaving modifier-clicks (new tab/window) to the browser.
export function useCurtainClick() {
  const curtainNav = useCurtainNav();
  return useCallback(
    (to, dir) => (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      curtainNav(to, dir);
    },
    [curtainNav]
  );
}
