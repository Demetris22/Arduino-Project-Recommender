// The buildable projects as a flip-through deck of drafting plates — a stack you
// pull across a drafting table one sheet at a time. Card 1 is the recommended
// first build; the rest fan out behind it. Navigable by the flanking arrows, the
// ← / → keys (while the deck is on screen), and swipe. Reuses the same plate
// (ProjectCard) the grid draws, so the two views stay identical sheet-for-sheet.
// Decorative motion only — under prefers-reduced-motion the front card swaps
// instantly.
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import ProjectCard from './ProjectCard.jsx';

// A plate's resting transform for its distance from the front (pos = i - index).
// The front sheet sits square and opaque; neighbours slip aside, tilt, shrink
// and fade so the stack reads as physical depth.
function plateAnim(pos) {
  const ap = Math.abs(pos);
  if (ap === 0) return { x: '0%', rotate: 0, scale: 1, opacity: 1 };
  const s = Math.sign(pos);
  if (ap === 1)
    return { x: `${s * 56}%`, rotate: s * 2.4, scale: 0.9, opacity: 0.5 };
  return { x: `${s * 92}%`, rotate: s * 3.6, scale: 0.8, opacity: 0.12 };
}

const pad2 = (n) => String(n).padStart(2, '0');

// The mechanical SHEET counter: the active number flips like an odometer wheel
// in the direction of travel.
function SheetFlip({ value, dir, reduce }) {
  return (
    <span className="deck__flip" aria-hidden="true">
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={value}
          initial={reduce ? false : { y: dir >= 0 ? '-110%' : '110%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { y: dir >= 0 ? '110%' : '-110%', opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.32, ease: [0.22, 0.61, 0.36, 1] }}
        >
          {pad2(value)}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function ProjectDeck({ items, onOpen }) {
  const reduce = useReducedMotion();
  const total = items.length;

  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(0); // last travel direction (drives the motion)
  const [tick, setTick] = useState(0); // bumps each move -> replays the sweep
  const [stageH, setStageH] = useState(null);

  const swiped = useRef(false);
  const touch = useRef(null);
  const activeRef = useRef(null);

  // Reset to the first sheet whenever the buildable set itself changes.
  const sig = items.map((p) => p.id).join('|');
  useEffect(() => {
    setIndex(0);
    setDir(0);
  }, [sig]);

  // Guard the render against a set that shrank before the reset effect runs.
  const idx = Math.min(index, Math.max(total - 1, 0));

  const go = (delta) => {
    const next = Math.min(Math.max(idx + delta, 0), total - 1);
    if (next === idx) return;
    setDir(delta > 0 ? 1 : -1);
    setTick((t) => t + 1);
    setIndex(next);
  };

  // Keep the stage exactly as tall as the front sheet (heights differ per card)
  // and animate the change so switching sheets never jumps the page.
  useLayoutEffect(() => {
    const el = activeRef.current;
    if (!el) return undefined;
    const measure = () => setStageH(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [idx, sig]);

  // ← / → navigate, but only while the deck is mounted (this view is active) and
  // not while typing or with the build dialog open.
  useEffect(() => {
    if (total <= 1) return undefined;
    const onKey = (e) => {
      if (e.defaultPrevented || e.altKey || e.metaKey || e.ctrlKey) return;
      if (document.querySelector('[role="dialog"]')) return;
      const t = e.target;
      if (t?.closest?.('input, textarea, select, [contenteditable="true"]')) return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        go(-1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        go(1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, total]);

  const onTouchStart = (e) => {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e) => {
    const s = touch.current;
    touch.current = null;
    if (!s) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - s.x;
    const dy = t.clientY - s.y;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      swiped.current = true; // this gesture is a swipe, not a tap -> don't open
      go(dx < 0 ? 1 : -1);
      window.setTimeout(() => {
        swiped.current = false;
      }, 360);
    }
  };

  // Opening a build and navigating are distinct actions: swallow the synthetic
  // click that trails a swipe so a flick doesn't also open the front card.
  const openProject = (p) => {
    if (swiped.current) {
      swiped.current = false;
      return;
    }
    onOpen(p);
  };

  const single = total === 1;
  const atStart = idx === 0;
  const atEnd = idx === total - 1;

  // Only the front sheet plus its immediate neighbours are in the DOM.
  const shown = items
    .map((p, i) => ({ p, i, pos: i - idx }))
    .filter(({ pos }) => Math.abs(pos) <= 2);

  const spring = reduce
    ? { duration: 0 }
    : {
        type: 'spring',
        stiffness: 260,
        damping: 30,
        mass: 0.9,
        opacity: { duration: 0.25 },
      };

  return (
    <section
      className="deck"
      aria-roledescription="carousel"
      aria-label="Buildable projects deck"
    >
      <div className="deck__top">
        <p className={`deck__eyebrow${idx === 0 ? ' is-first' : ''}`}>
          {idx === 0 ? 'Recommended first build' : 'Buildable project'}
        </p>
        <span className="deck__live" aria-live="polite">
          {single ? '' : `Project ${idx + 1} of ${total}`}
        </span>
      </div>

      <div
        className="deck__viewport"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {!single && (
          <button
            type="button"
            className="deck__nav deck__nav--prev"
            onClick={() => go(-1)}
            disabled={atStart}
            aria-label="Previous project"
          >
            <svg
              viewBox="0 0 24 24"
              width="22"
              height="22"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M15 5 8 12l7 7" />
            </svg>
          </button>
        )}

        <div className="deck__stage" style={{ height: stageH ?? undefined }}>
          <AnimatePresence initial={false}>
            {shown.map(({ p, pos }) => {
              const active = pos === 0;
              return (
                <motion.div
                  key={p.id}
                  ref={active ? activeRef : null}
                  className={`deck__plate${active ? ' is-active' : ''}`}
                  style={{ zIndex: 30 - Math.abs(pos) * 10 }}
                  initial={reduce ? false : { ...plateAnim(pos), opacity: 0 }}
                  animate={plateAnim(pos)}
                  exit={reduce ? { opacity: 0 } : { ...plateAnim(pos), opacity: 0 }}
                  transition={spring}
                  aria-hidden={!active}
                  // peeked sheets are decorative: out of the tab order, the a11y
                  // tree, and the pointer path (belt-and-braces with the CSS)
                  inert={active ? undefined : true}
                >
                  <span className="deck__frame" aria-hidden="true" />
                  <span className="deck__corner deck__corner--tl" aria-hidden="true" />
                  <span className="deck__corner deck__corner--tr" aria-hidden="true" />
                  <span className="deck__corner deck__corner--bl" aria-hidden="true" />
                  <span className="deck__corner deck__corner--br" aria-hidden="true" />
                  <ProjectCard
                    project={p}
                    variant="buildable"
                    view="gallery"
                    index={0}
                    onOpen={openProject}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>

          {!reduce && !single && (
            <motion.span
              key={tick}
              className="deck__sweep"
              aria-hidden="true"
              initial={{ x: dir >= 0 ? '-70%' : '70%', opacity: 0 }}
              animate={{ x: dir >= 0 ? '70%' : '-70%', opacity: [0, 0.85, 0] }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            />
          )}
        </div>

        {!single && (
          <button
            type="button"
            className="deck__nav deck__nav--next"
            onClick={() => go(1)}
            disabled={atEnd}
            aria-label="Next project"
          >
            <svg
              viewBox="0 0 24 24"
              width="22"
              height="22"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {!single && (
        <div className="deck__foot">
          <p className="deck__sheet mono">
            <span className="deck__sheet-label">Sheet</span>
            <SheetFlip value={idx + 1} dir={dir} reduce={reduce} />
            <span className="deck__sheet-sep">/</span>
            <span>{pad2(total)}</span>
          </p>
          <span className="deck__scale" aria-hidden="true">
            <span
              className="deck__scale-fill"
              style={{ transform: `scaleX(${(idx + 1) / total})` }}
            />
          </span>
        </div>
      )}
    </section>
  );
}

export default ProjectDeck;
