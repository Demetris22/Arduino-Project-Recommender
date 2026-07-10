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

const EASE = [0.76, 0, 0.24, 1]; // easeInOutQuart — a decisive, even sweep
const DURATION = 0.52;

function Curtain({ dir, phase, onCovered, onRevealed }) {
  const forward = dir !== 'back';
  // clip-path inset(top right bottom left): collapse to one edge = invisible.
  const HIDDEN_ENTER = forward ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)';
  const FULL = 'inset(0 0 0 0)';
  const HIDDEN_EXIT = forward ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)';

  return (
    <motion.div
      className="curtain"
      initial={{ clipPath: HIDDEN_ENTER }}
      animate={{ clipPath: phase === 'cover' ? FULL : HIDDEN_EXIT }}
      transition={{ duration: DURATION, ease: EASE }}
      onAnimationComplete={() => (phase === 'cover' ? onCovered() : onRevealed())}
    >
      <span className="curtain__mark" aria-hidden="true">
        <img src="/favicon.svg" alt="" width="42" height="42" />
        <span>Sketchef</span>
      </span>
    </motion.div>
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
