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

// ONE fixed shape that TRANSLATES across the screen: a flat trailing edge and a
// convex (bulging) leading edge. Because the shape never morphs, the trailing
// edge stays flat (no U-shaped tail) and the covered midpoint is seamless. In
// 0..1 objectBoundingBox space; the shape is wider than the screen (W) so it
// fully covers, and the leading edge's control point is pushed past its edge (B)
// to make the bulge. `p` (0..1) slides the whole shape from off one side to off
// the other; the screen is fully covered around p = 0.5.
const W = 1.5;
const B = 0.42;
const LX0 = -1.85; // trailing edge fully off the entering side (hidden)
const LX1 = 1.3;   // trailing edge fully off the exiting side (revealed)

function pathAt(p, dir) {
  const lx = LX0 + (LX1 - LX0) * p;
  const rx = lx + W;
  const f = (n) => n.toFixed(3);
  if (dir === 'back') {
    // mirror horizontally: the bulge leads from the right, the flat edge trails
    return `M ${f(1 - lx)} 0 L ${f(1 - lx)} 1 L ${f(1 - rx)} 1 Q ${f(1 - rx - B)} 0.5 ${f(1 - rx)} 0 Z`;
  }
  return `M ${f(lx)} 0 L ${f(lx)} 1 L ${f(rx)} 1 Q ${f(rx + B)} 0.5 ${f(rx)} 0 Z`;
}

const Curtain = memo(function Curtain({ dir, onMidpoint, onDone }) {
  const progress = useMotionValue(0);
  const d = useTransform(progress, (p) => pathAt(p, dir));

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
