// A clip-path "curtain" page transition (inspired by Motion's curtains/clip-wipe
// example), used when moving between the catalog and the kit. It is ONE
// continuous sweep: a single easeInOut progress drives the clip from hidden →
// covered → revealed, so it is fastest exactly at the covered midpoint and never
// stops in the middle. The route is swapped at that midpoint (behind the fully
// covered screen) via a timer, so you never see the old page jump to the new one.
//
// The clip is a rectangle whose left and right edges are quadratic beziers, in
// 0..1 objectBoundingBox space (resolution-independent). Pushing each edge's
// control point ahead of its endpoints gives the convex "bulge" leading edge.
// Forward (to the kit) sweeps one way; back mirrors it. Reduced-motion navigates
// instantly. Links opt in via useCurtainNav().
import { createContext, memo, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react';

const CurtainCtx = createContext(() => {});
export const useCurtainNav = () => useContext(CurtainCtx);

const DURATION = 1; // seconds, whole sweep (cover + reveal)

const P = (lx, lc, rx, rc) => `M ${lx} 0 Q ${lc} 0.5 ${lx} 1 L ${rx} 1 Q ${rc} 0.5 ${rx} 0 Z`;

// keyframes [leftX, leftCtrl, rightX, rightCtrl] across the sweep. The right
// (leading) edge bulges across to cover; then the left edge bulges across to
// reveal. Control points pushed past the endpoints = the convex bulge.
const KEYS = {
  hidden: [0, 0, 0, 0],
  coverMid: [0, 0, 0.12, 1.06],
  covered: [0, 0, 1.18, 1.32],
  revealMid: [0.42, 1.36, 1.2, 1.3],
  revealed: [1.22, 1.34, 1.26, 1.36],
};
const ORDER = ['hidden', 'coverMid', 'covered', 'revealMid', 'revealed'];
// back = the same sweep mirrored horizontally (x → 1 − x, left/right swapped).
const mirror = ([lx, lc, rx, rc]) => [1 - rx, 1 - rc, 1 - lx, 1 - lc];
const dOf = (dir, key) => P(...(dir === 'back' ? mirror(KEYS[key]) : KEYS[key]));

const Curtain = memo(function Curtain({ dir, onMidpoint, onDone }) {
  const stops = ORDER.map((k) => dOf(dir, k));
  const progress = useMotionValue(0);
  const d = useTransform(progress, [0, 0.25, 0.5, 0.75, 1], stops);

  useEffect(() => {
    const controls = animate(progress, 1, { duration: DURATION, ease: 'easeInOut' });
    const mid = window.setTimeout(onMidpoint, DURATION * 500); // swap route at full cover
    const done = window.setTimeout(onDone, DURATION * 1000 + 20);
    return () => {
      controls.stop();
      window.clearTimeout(mid);
      window.clearTimeout(done);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="curtain" style={{ clipPath: 'url(#curtain-clip)', WebkitClipPath: 'url(#curtain-clip)' }}>
      <svg className="curtain__clip" width="0" height="0" aria-hidden="true" focusable="false">
        <defs>
          <clipPath id="curtain-clip" clipPathUnits="objectBoundingBox">
            <motion.path d={d} />
          </clipPath>
        </defs>
      </svg>
      <span className="curtain__mark" aria-hidden="true">
        <img src="/favicon.svg" alt="" width="42" height="42" />
        <span>Sketchef</span>
      </span>
    </div>
  );
});

export function CurtainProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const reduce = useReducedMotion();
  const [tx, setTx] = useState(null); // { to, dir }
  const txRef = useRef(null);
  const busy = useRef(false);
  const navigated = useRef(false);

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
      navigated.current = false;
      setTx({ to, dir });
    },
    [navigate, reduce, location.pathname]
  );

  // fired at the covered midpoint: swap the route behind the curtain
  const onMidpoint = useCallback(() => {
    if (navigated.current) return;
    navigated.current = true;
    const s = txRef.current;
    if (s) navigate(s.to);
  }, [navigate]);

  // fired when the sweep finishes revealing the new page
  const onDone = useCallback(() => {
    busy.current = false;
    setTx(null);
  }, []);

  return (
    <CurtainCtx.Provider value={curtainNav}>
      {children}
      {tx && <Curtain key="curtain" dir={tx.dir} onMidpoint={onMidpoint} onDone={onDone} />}
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
