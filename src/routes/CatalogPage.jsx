// The home page IS the catalog. Every project is visible immediately — there is
// no board/parts gate. The kit, if the user has one, acts as a LENS: it badges
// each card and unlocks status filters. Filtering and sorting are display-only
// and always run AFTER the engine, never inside it.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';

import boards from '../data/boards.json';
import components from '../data/components.json';
import projects from '../data/projects.json';
import { useKit } from '../kit/KitContext.jsx';
import { useProjectStatus } from '../kit/useProjectStatus.js';
import ProjectCard from '../components/ProjectCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import CountUp from '../components/CountUp.jsx';
import BoardGlyph from '../components/BoardGlyph.jsx';
import HeroCircuit from '../components/HeroCircuit.jsx';
import ShinyText from '../components/ShinyText.jsx';

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];
const DIFFICULTY_ORDER = { beginner: 0, intermediate: 1, advanced: 2 };
const TIME_BRACKETS = [
  { id: 'quick', label: 'Under 30 min', test: (p) => p.timeMinutes < 30 },
  { id: 'medium', label: '30–60 min', test: (p) => p.timeMinutes >= 30 && p.timeMinutes <= 60 },
  { id: 'long', label: 'Over an hour', test: (p) => p.timeMinutes > 60 },
];
const STATUS_FACETS = [
  { id: 'buildable', label: 'Buildable', cls: 'go' },
  { id: 'near', label: 'Almost', cls: 'near' },
  { id: 'far', label: 'Parts needed', cls: 'far' },
  { id: 'incompatible', label: 'Wrong board', cls: 'stop' },
];

// The headline, tokenised so each WORD can stagger in on its own. The tail
// four words are the teal accent phrase.
const HEADLINE = [
  'Browse', 'every', 'project.', 'Find', 'the', 'ones',
  { t: 'you', accent: true },
  { t: 'can', accent: true },
  { t: 'build', accent: true },
  { t: 'tonight.', accent: true },
];
// Index of the first accent word — used to phase the "current" sheen across them.
const FIRST_ACCENT = HEADLINE.findIndex((w) => typeof w === 'object' && w.accent);

// A soft spring — a small overshoot, then settle. The whole hero shares it so
// the entrance reads as one coordinated motion, not nine separate tweens.
const SPRING = { type: 'spring', stiffness: 260, damping: 26, mass: 0.9 };

// Elements rise a touch and de-blur as they arrive.
const riseIn = {
  hidden: { opacity: 0, y: 18, filter: 'blur(8px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: SPRING },
};
const wordIn = {
  hidden: { opacity: 0, y: '0.5em', filter: 'blur(10px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: SPRING },
};
const boardIn = {
  hidden: { opacity: 0, scale: 0.9, y: 26, filter: 'blur(10px)' },
  show: { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)', transition: { ...SPRING, damping: 22 } },
};
// A container just orchestrates timing for its children.
const orchestrate = (staggerChildren, delayChildren = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren, delayChildren } },
});

function HeroBand() {
  const { hasKit, boardId } = useKit();
  const reduce = useReducedMotion();
  const heroRef = useRef(null);
  // Show the user's own board once they have one; otherwise the archetypal Uno.
  const heroBoard = boards.find((b) => b.id === (boardId ?? 'uno')) ?? boards[0];

  // Under reduced motion we skip the enter animation entirely (initial=false
  // paints the final "show" state with no transition).
  const anim = { initial: reduce ? false : 'hidden', animate: 'show' };

  // Cursor parallax: the circuit field and the board drift by different amounts,
  // giving the flat teal block real depth. Fine pointers + motion allowed only;
  // rAF-throttled; writes CSS vars so React never re-renders on move.
  useEffect(() => {
    const el = heroRef.current;
    if (!el || !window.matchMedia) return;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || still) return;

    let raf = 0;
    let px = 0;
    let py = 0;
    const apply = () => {
      raf = 0;
      el.style.setProperty('--px', px.toFixed(3));
      el.style.setProperty('--py', py.toFixed(3));
    };
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      px = (e.clientX - r.left) / r.width - 0.5; // -0.5 .. 0.5
      py = (e.clientY - r.top) / r.height - 0.5;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      px = 0;
      py = 0;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    el.addEventListener('pointermove', onMove, { passive: true });
    el.addEventListener('pointerleave', onLeave, { passive: true });
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="hero" ref={heroRef}>
      <div className="herofx" aria-hidden="true">
        <span className="herofx__glow" />
        <div className="herofx__layer">
          <HeroCircuit />
        </div>
      </div>

      <motion.div className="hero__stage" variants={orchestrate(0.13, 0.04)} {...anim}>
        <div className="shell hero__in">
          <motion.div className="hero__copy" variants={orchestrate(0.09)}>
            <motion.p className="hero__eyebrow" variants={riseIn}>
              Arduino project catalog
            </motion.p>

            <motion.h1 className="hero__title" variants={orchestrate(0.045)}>
              {HEADLINE.map((w, i) => {
                const word = typeof w === 'string' ? w : w.t;
                const accent = typeof w === 'object' && w.accent;
                // Offset each accent word's sheen so the "current" flows through
                // the phrase left-to-right instead of pulsing in lockstep.
                const sheenDelay = accent ? `${(i - FIRST_ACCENT) * -0.28}s` : undefined;
                return (
                  <motion.span
                    key={`${word}-${i}`}
                    className={`hero__word${accent ? ' hero__word--accent' : ''}`}
                    variants={wordIn}
                    style={sheenDelay ? { '--sheen-delay': sheenDelay } : undefined}
                  >
                    {accent || reduce ? (
                      word
                    ) : (
                      <ShinyText
                        text={word}
                        color="#dde9e9"
                        shineColor="#ffffff"
                        speed={1.5}
                        delay={3}
                        spread={100}
                        direction="right"
                        initialOffset={i * 0.13}
                      />
                    )}
                  </motion.span>
                );
              })}
            </motion.h1>

            <motion.p className="hero__sub" variants={riseIn}>
              Browse the whole catalog freely. Tell Sketchef which board and parts you own, and it
              marks exactly what you can make right now — wiring, steps and code included.
            </motion.p>

            <motion.div className="hero__actions" variants={riseIn}>
              <Link className="btn btn--primary" to="/kit">
                {hasKit ? 'Edit your kit' : 'Set up your kit'}
                <span aria-hidden="true">→</span>
              </Link>
              <a className="btn btn--ghost-ink" href="#catalog">
                Browse all projects
              </a>
            </motion.div>
          </motion.div>

          <motion.div className="hero__side" variants={orchestrate(0.12, 0.1)}>
            <motion.figure className="hero__board" variants={boardIn}>
              {/* the board doubles as a shortcut into the kit editor */}
              <Link
                className="hero__board-link"
                to="/kit"
                aria-label={hasKit ? 'Edit your kit' : 'Set up your kit — choose your board'}
              >
                <span className="hero__board-led" aria-hidden="true" />
                <BoardGlyph board={heroBoard} />
                <span className="hero__board-edit mono" aria-hidden="true">Change board →</span>
              </Link>
              {/* a crisp white spec chip — the one light surface in the hero, so
                  it doesn't read as all-teal, and it doubles as a readout */}
              <motion.figcaption className="hero__spec" variants={riseIn}>
                <span className="hero__spec-live" />
                <span className="hero__spec-name">
                  {heroBoard.name.replace(/^Arduino\s+/i, '')}
                </span>
                <span className="hero__spec-meta mono">
                  {heroBoard.digitalPins} DIG · {heroBoard.analogPins} ANA · {heroBoard.logicVoltage}V
                </span>
              </motion.figcaption>
            </motion.figure>
          </motion.div>
        </div>

        {/* the catalog readout — a full-width instrument bar, not a corner stat block */}
        <motion.dl className="shell hero__readout" variants={orchestrate(0.09, 0.05)}>
          {[
            ['Projects', projects.length],
            ['Components', components.length],
            ['Boards', boards.length],
          ].map(([label, n], i) => (
            <motion.div className="hero__stat" key={label} variants={riseIn}>
              <dt>{label}</dt>
              <dd>
                {reduce ? n : <CountUp to={n} duration={1.6} delay={0.4 + i * 0.12} separator="," />}
              </dd>
            </motion.div>
          ))}
          <motion.p className="hero__readout-note mono" variants={riseIn}>
            each with wiring, steps &amp; code
          </motion.p>
          <motion.a className="hero__scroll" href="#catalog" variants={riseIn}>
            Browse the catalog
            <span className="hero__scroll-chev" aria-hidden="true">↓</span>
          </motion.a>
        </motion.dl>
      </motion.div>
    </section>
  );
}

function KitStrip({ counts, statusFilter, onToggleStatus }) {
  const cells = [
    { id: 'buildable', cls: 'go', label: 'buildable', n: counts.buildable },
    { id: 'near', cls: 'near', label: 'almost', n: counts.near },
    { id: 'far', cls: 'far', label: 'parts needed', n: counts.far },
    { id: 'incompatible', cls: 'stop', label: 'wrong board', n: counts.incompatible },
  ];

  return (
    <div className="band">
      <div className="shell kitstrip">
        <span className="kitstrip__label">Through your kit</span>
        {cells.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`tally tally--${c.cls}${statusFilter === c.id ? ' is-on' : ''}`}
            aria-pressed={statusFilter === c.id}
            onClick={() => onToggleStatus(c.id)}
          >
            <span className="tally__dot" aria-hidden="true" />
            <span className="tally__n">{c.n}</span> {c.label}
          </button>
        ))}
        <span className="kitstrip__sep" />
        <Link className="btn btn--outline btn--sm" to="/kit">
          Edit kit
        </Link>
      </div>
    </div>
  );
}

function CatalogPage() {
  const { hasKit } = useKit();
  const { statusById, counts } = useProjectStatus();

  const [query, setQuery] = useState('');
  const [levels, setLevels] = useState([]);
  const [times, setTimes] = useState([]);
  const [statusFilter, setStatusFilter] = useState(null);
  const [sort, setSort] = useState('recommended');

  const toggle = (list, setList, value) =>
    setList(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = projects.filter((p) => {
      const textOk =
        !q ||
        p.title.toLowerCase().includes(q) ||
        (p.learn ?? []).some((t) => t.toLowerCase().includes(q));
      const levelOk = levels.length === 0 || levels.includes(p.difficulty);
      const timeOk =
        times.length === 0 ||
        times.some((id) => TIME_BRACKETS.find((b) => b.id === id)?.test(p));
      const statusOk =
        !statusFilter || !hasKit || statusById.get(p.id)?.kind === statusFilter;
      return textOk && levelOk && timeOk && statusOk;
    });

    const byLevelThenTime = (a, b) =>
      (DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty]) ||
      a.timeMinutes - b.timeMinutes;

    if (sort === 'difficulty') {
      list = [...list].sort(byLevelThenTime);
    } else if (sort === 'time') {
      list = [...list].sort((a, b) => a.timeMinutes - b.timeMinutes);
    } else if (hasKit) {
      // "Recommended": what you can actually build floats to the top.
      const rank = { buildable: 0, near: 1, far: 2, incompatible: 3, unknown: 2 };
      list = [...list].sort(
        (a, b) =>
          (rank[statusById.get(a.id)?.kind ?? 'unknown'] -
            rank[statusById.get(b.id)?.kind ?? 'unknown']) || byLevelThenTime(a, b)
      );
    } else {
      list = [...list].sort(byLevelThenTime);
    }

    return list;
  }, [query, levels, times, statusFilter, sort, hasKit, statusById]);

  const filtersActive = query || levels.length || times.length || statusFilter;
  const clearAll = () => {
    setQuery('');
    setLevels([]);
    setTimes([]);
    setStatusFilter(null);
  };

  return (
    <>
      <HeroBand />

      {hasKit && (
        <KitStrip
          counts={counts}
          statusFilter={statusFilter}
          onToggleStatus={(id) => setStatusFilter((cur) => (cur === id ? null : id))}
        />
      )}

      <div className="shell" id="catalog">
        <div className="filterbar">
          <div className="searchbox">
            <span className="searchbox__icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21 16.2 16.2" />
              </svg>
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects and concepts…"
              aria-label="Search projects"
            />
          </div>

          <div className="facets">
            <span className="facet__group-label">Level</span>
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                type="button"
                className={`facet${levels.includes(d) ? ' is-on' : ''}`}
                aria-pressed={levels.includes(d)}
                onClick={() => toggle(levels, setLevels, d)}
              >
                {d[0].toUpperCase() + d.slice(1)}
              </button>
            ))}
          </div>

          <div className="facets">
            <span className="facet__group-label">Time</span>
            {TIME_BRACKETS.map((b) => (
              <button
                key={b.id}
                type="button"
                className={`facet${times.includes(b.id) ? ' is-on' : ''}`}
                aria-pressed={times.includes(b.id)}
                onClick={() => toggle(times, setTimes, b.id)}
              >
                {b.label}
              </button>
            ))}
          </div>

          {hasKit && (
            <div className="facets">
              <span className="facet__group-label">Status</span>
              {STATUS_FACETS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`facet${statusFilter === s.id ? ' is-on' : ''}`}
                  aria-pressed={statusFilter === s.id}
                  onClick={() => setStatusFilter((cur) => (cur === s.id ? null : s.id))}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}

          <div className="filterbar__right">
            <span className="resultcount" aria-live="polite">
              {visible.length} of {projects.length}
            </span>
            <label className="sr-only" htmlFor="sort">Sort projects</label>
            <select
              id="sort"
              className="select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="recommended">Recommended</option>
              <option value="difficulty">Easiest first</option>
              <option value="time">Quickest first</option>
            </select>
          </div>
        </div>

        {visible.length === 0 ? (
          <div style={{ padding: '2.5rem 0' }}>
            <EmptyState
              stamp="Nothing matches"
              action={
                <button type="button" className="linkbtn" onClick={clearAll}>
                  Clear all filters
                </button>
              }
            >
              No projects match those filters. Try widening the search, or clear the filters to see
              the whole catalog again.
            </EmptyState>
          </div>
        ) : (
          <ul className="projectgrid">
            {visible.map((project, i) => (
              <li key={project.id}>
                <ProjectCard
                  project={project}
                  index={projects.findIndex((p) => p.id === project.id)}
                  status={statusById.get(project.id)}
                />
              </li>
            ))}
          </ul>
        )}

        {filtersActive && visible.length > 0 && (
          <p style={{ paddingBottom: '2rem' }}>
            <button type="button" className="linkbtn" onClick={clearAll}>
              Clear all filters
            </button>
          </p>
        )}
      </div>
    </>
  );
}

export default CatalogPage;
