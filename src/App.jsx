import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

import boards from './data/boards.json';
import components from './data/components.json';
import projects from './data/projects.json';
import { getMatches } from './data/lib/matching.js';
import { suggestNextPurchases } from './data/lib/suggest.js';
import { readSelectionFromUrl, buildSelectionQuery } from './lib/shareUrl.js';

import BoardPicker from './components/BoardPicker.jsx';
import ComponentSelector from './components/ComponentSelector.jsx';
import ResultsSection from './components/ResultsSection.jsx';
import ResultsControls from './components/ResultsControls.jsx';
import FeaturedBuild from './components/FeaturedBuild.jsx';
import EmptyPlate from './components/EmptyPlate.jsx';
import NearMissBoard from './components/NearMissBoard.jsx';
import ProjectDetail from './components/ProjectDetail.jsx';
import ShareButton from './components/ShareButton.jsx';
import Atmosphere from './components/Atmosphere.jsx';
import NextPurchase from './components/NextPurchase.jsx';
import Icon from './components/Icon.jsx';
import LandingPage from './components/LandingPage.jsx';
import CountUp from './components/CountUp.jsx';
import RailNav from './components/RailNav.jsx';

const data = { boards, components, projects };
const DEFAULT_BOARD_ID = boards[0].id;

// A ready-made selection for the "Try an example" shortcut — a common starter
// kit that yields a satisfying mix of buildable, near-miss, and a buy-next pick.
const EXAMPLE_SELECTION = {
  board: 'uno',
  parts: [
    'led',
    'resistor',
    'breadboard',
    'jumper-wires',
    'push-button',
    'buzzer',
    'potentiometer',
  ],
};

// Decide the starting selection + stage from the URL.
// - Fresh visit (no params): start at Step 1 with NO board chosen.
// - Shared build (parts present): hydrate and land on results.
// - Board-only URL (mid-flow reload): resume at the components step.
function readInitial() {
  const params = new URLSearchParams(window.location.search);
  const hasBoard = params.has('board');
  const hasParts = params.has('parts');

  if (!hasBoard && !hasParts) {
    return { boardId: null, parts: [], stage: 'landing' };
  }

  const sel = readSelectionFromUrl(window.location.search, {
    boards,
    components,
    defaultBoardId: DEFAULT_BOARD_ID,
  });
  return {
    boardId: sel.boardId,
    parts: sel.ownedComponentIds,
    stage: hasParts ? 'results' : 'parts',
  };
}

function App() {
  const [initial] = useState(readInitial);

  // null until the user actually chooses a board (Step 1 gate).
  const [selectedBoardId, setSelectedBoardId] = useState(initial.boardId);
  const [ownedComponentIds, setOwnedComponentIds] = useState(initial.parts);

  // Guided flow: 'board' -> 'parts' -> 'results'.
  const [stage, setStage] = useState(initial.stage);
  // Inline editing of a step from the results summary bar (null = none).
  const [editing, setEditing] = useState(null);
  // On-demand secondary tools in the results stage.
  const [showNextBuy, setShowNextBuy] = useState(false);

  // One orchestrated page-load reveal: the sheet is "drawn" once on first paint.
  // The staggered CSS is gated on prefers-reduced-motion; this flag only scopes
  // it to the initial mount so later stage changes animate normally.
  const [intro, setIntro] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setIntro(false), 1500);
    return () => clearTimeout(t);
  }, []);

  // The project whose build instructions are open in the modal (null = closed).
  const [activeProject, setActiveProject] = useState(null);

  // Display-only filter state (never touches the matching engine).
  const [search, setSearch] = useState('');
  const [difficultyFilters, setDifficultyFilters] = useState([]);

  // Mirror board + parts into the URL (replaceState — no history spam).
  // Runs on mount too, which normalizes any malformed inbound URL.
  useEffect(() => {
    const query = buildSelectionQuery(selectedBoardId, ownedComponentIds);
    const url = `${window.location.pathname}${query}${window.location.hash}`;
    window.history.replaceState(null, '', url);
  }, [selectedBoardId, ownedComponentIds]);

  // Single source of truth for results — recomputes whenever inputs change.
  // No board chosen yet -> nothing to match (Step 1 hasn't completed).
  const { buildable, nearMiss, incompatible } = useMemo(
    () =>
      selectedBoardId
        ? getMatches(ownedComponentIds, selectedBoardId, data)
        : { buildable: [], nearMiss: [], incompatible: [] },
    [ownedComponentIds, selectedBoardId]
  );

  const filtersActive = search.trim() !== '' || difficultyFilters.length > 0;

  const toggleDifficulty = (level) =>
    setDifficultyFilters((prev) =>
      prev.includes(level) ? prev.filter((x) => x !== level) : [...prev, level]
    );

  const clearDifficulties = () => setDifficultyFilters([]);
  const clearFilters = () => {
    setSearch('');
    setDifficultyFilters([]);
  };

  // Narrow the engine's result arrays in the UI layer, before rendering.
  // Each list is either bare projects (buildable) or { project, ... } wrappers.
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const matches = (project) => {
      const textOk =
        !q ||
        project.title.toLowerCase().includes(q) ||
        (project.learn ?? []).some((tag) => tag.toLowerCase().includes(q));
      const diffOk =
        difficultyFilters.length === 0 ||
        difficultyFilters.includes(project.difficulty);
      return textOk && diffOk;
    };
    const apply = (items) => items.filter((it) => matches(it.project ?? it));
    return {
      buildable: apply(buildable),
      nearMiss: apply(nearMiss),
      incompatible: apply(incompatible),
    };
  }, [buildable, nearMiss, incompatible, search, difficultyFilters]);

  const noMatches =
    filtersActive &&
    filtered.buildable.length === 0 &&
    filtered.nearMiss.length === 0 &&
    filtered.incompatible.length === 0;

  const hasBuildable = filtered.buildable.length > 0;

  // Highest-leverage parts to buy next (display-only; engine untouched).
  const recommendations = useMemo(
    () =>
      selectedBoardId
        ? suggestNextPurchases(ownedComponentIds, selectedBoardId, data)
        : [],
    [ownedComponentIds, selectedBoardId]
  );

  const toggleComponent = (id) =>
    setOwnedComponentIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  // Adds a part if not already owned (used by the "buy next" recommendations).
  const addComponent = (id) =>
    setOwnedComponentIds((prev) => (prev.includes(id) ? prev : [...prev, id]));

  const selectAllComponents = () =>
    setOwnedComponentIds(components.map((c) => c.id));
  const clearComponents = () => setOwnedComponentIds([]);

  const selectedBoard = boards.find((b) => b.id === selectedBoardId);
  // Short form for the narrow rail chip — the redundant "Arduino" prefix wraps
  // the name onto two lines; the full name still shows on the board cards.
  const selectedBoardShort = selectedBoard?.name?.replace(/^Arduino\s+/i, '');

  // Stage 1: choosing a board advances the flow.
  const chooseBoardAndAdvance = (id) => {
    setSelectedBoardId(id);
    setStage('parts');
  };
  // Rail stepper: jump back to a completed step (clears any inline edit).
  const goToStage = (id) => {
    setEditing(null);
    setStage(id);
  };
  // Inline board edit (results stage): change without leaving results.
  const chooseBoardInline = (id) => {
    setSelectedBoardId(id);
    setEditing(null);
    revealResults();
  };

  // Snapshot the owned parts when the parts editor opens, so we can tell whether
  // the user has actually changed the list (drives the "Apply Changes" button).
  const partsSnapshot = useRef([]);
  const editStep = (step) => {
    const next = editing === step ? null : step;
    if (next === 'parts') partsSnapshot.current = ownedComponentIds;
    setEditing(next);
  };

  // Jump straight to results with a sensible starter selection.
  const loadExample = () => {
    setSelectedBoardId(EXAMPLE_SELECTION.board);
    setOwnedComponentIds(EXAMPLE_SELECTION.parts);
    setStage('results');
  };

  // Reduced-motion-aware variants for animating between guided-flow stages.
  const reduceMotion = useReducedMotion();
  const stageMotion = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
        transition: { duration: 0.28, ease: [0.22, 0.61, 0.36, 1] },
      };

  // Inline edits (board/parts) recompute the results silently. After an edit,
  // bring the results into view and flag them briefly so the update is obvious.
  const resultsRef = useRef(null);
  const [resultsPulse, setResultsPulse] = useState(false);

  const revealResults = () => {
    setResultsPulse(true);
    window.setTimeout(() => setResultsPulse(false), 1400);
    requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'start',
      });
    });
  };

  const applyPartsEdit = () => {
    setEditing(null);
    revealResults();
  };

  // Rail tally rows are shortcuts: click one to jump to that result section.
  const scrollToResults = (id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  // True once the parts list differs from what it was when the editor opened.
  const partsChanged =
    editing === 'parts' &&
    (partsSnapshot.current.length !== ownedComponentIds.length ||
      ownedComponentIds.some((id) => !partsSnapshot.current.includes(id)));

  return (
    <div className={`app-shell${intro ? ' is-intro' : ''}`} data-stage={stage}>
      <a className="skip-link" href="#main">Skip to content</a>
      <Atmosphere />

      {stage !== 'landing' && (
        <RailNav
          stage={stage}
          onNavigate={goToStage}
          stats={{
            boards: boards.length,
            components: components.length,
            projects: projects.length,
          }}
        >
          {stage === 'board' && (
            <div className="railctx">
              <p className="railctx__note">
                New here? Load a ready-made kit to see how it works.{' '}
                <button type="button" className="link-btn" onClick={loadExample}>
                  Try an example →
                </button>
              </p>
            </div>
          )}

          {stage === 'parts' && (
            <div className="railctx">
              <button
                type="button"
                className="summary-chip summary-chip--block"
                onClick={() => setStage('board')}
              >
                <span className="summary-chip__label">Board</span>
                <span className="summary-chip__value">{selectedBoardShort}</span>
                <span className="summary-chip__edit">Change</span>
              </button>
              <div className="railctx__cta">
                <button
                  type="button"
                  className={`primary-btn primary-btn--block${
                    ownedComponentIds.length === 0 ? ' primary-btn--pending' : ''
                  }`}
                  onClick={() => setStage('results')}
                >
                  Show what I can build →
                </button>
              </div>
            </div>
          )}

          {stage === 'results' && (
            <div className="railctx">
              <div className="results__summary">
                <button
                  type="button"
                  className={`summary-chip summary-chip--block${editing === 'board' ? ' is-editing' : ''}`}
                  aria-expanded={editing === 'board'}
                  onClick={() => editStep('board')}
                >
                  <span className="summary-chip__label">Board</span>
                  <span className="summary-chip__value">{selectedBoardShort}</span>
                  <span className="summary-chip__edit">Edit</span>
                </button>
                <button
                  type="button"
                  className={`summary-chip summary-chip--block${editing === 'parts' ? ' is-editing' : ''}`}
                  aria-expanded={editing === 'parts'}
                  onClick={() => editStep('parts')}
                >
                  <span className="summary-chip__label">Parts</span>
                  <span className="summary-chip__value mono">
                    {ownedComponentIds.length} selected
                  </span>
                  <span className="summary-chip__edit">Edit</span>
                </button>
              </div>
              <div className="results__tally">
                <button
                  type="button"
                  className="results__tally-cell is-build"
                  onClick={() => scrollToResults('results-buildable')}
                >
                  <span className="results__tally-label">Buildable</span>
                  <span className="results__tally-num mono">
                    {filtered.buildable.length}
                  </span>
                </button>
                <button
                  type="button"
                  className="results__tally-cell is-near"
                  onClick={() => scrollToResults('results-near')}
                >
                  <span className="results__tally-label">Near-miss</span>
                  <span className="results__tally-num mono">
                    {filtered.nearMiss.length}
                  </span>
                </button>
                <button
                  type="button"
                  className="results__tally-cell is-out"
                  onClick={() => scrollToResults('results-out')}
                >
                  <span className="results__tally-label">Ruled out</span>
                  <span className="results__tally-num mono">
                    {filtered.incompatible.length}
                  </span>
                </button>
              </div>
              <div className="railctx__share">
                <ShareButton />
              </div>
            </div>
          )}
        </RailNav>
      )}

      <main className="canvas" id="main">
        <AnimatePresence mode="wait" initial={false}>
        {/* ---------- Stage 0: landing / cover sheet ---------- */}
        {stage === 'landing' && (
          <motion.section
            className="landing-stage"
            {...stageMotion}
            key="stage-landing"
          >
            <LandingPage
              reduceMotion={reduceMotion}
              onStart={() => setStage('board')}
              onExample={loadExample}
            />
          </motion.section>
        )}

        {/* ---------- Stage 1: choose your board ---------- */}
        {stage === 'board' && (
          <motion.section className="stage" {...stageMotion} key="stage-board">
            <header className="stage-head">
              <p className="step-head__eyebrow">Choose your Arduino</p>
              <h2 className="step-head__title">Which board are you using?</h2>
              <p className="step-head__help">
                Pick the board you're building with — each card opens its
                datasheet.
              </p>
            </header>
            <BoardPicker
              boards={boards}
              selectedBoardId={selectedBoardId}
              onSelect={chooseBoardAndAdvance}
              showTitle={false}
            />
          </motion.section>
        )}

        {/* ---------- Stage 2: pick your parts ---------- */}
        {stage === 'parts' && (
          <motion.section className="stage" {...stageMotion} key="stage-parts">
            <header className="stage-head">
              <p className="step-head__eyebrow">Choose your components</p>
              <h2 className="step-head__title">Which parts do you own?</h2>
              <p className="step-head__help">
                Toggle the parts you have in your kit.
              </p>
            </header>
            <ComponentSelector
              components={components}
              ownedIds={ownedComponentIds}
              onToggle={toggleComponent}
              onSelectAll={selectAllComponents}
              onClear={clearComponents}
              showTitle={false}
            />
            {/* mobile-only action bar (rail context is hidden on narrow screens) */}
            <div className="stage-actions stage-actions--mobile">
              <p className="railctx__count mono">
                <b>{ownedComponentIds.length}</b> selected
              </p>
              <button
                type="button"
                className="primary-btn primary-btn--block"
                onClick={() => setStage('results')}
              >
                Show what I can build →
              </button>
            </div>
          </motion.section>
        )}

        {/* ---------- Stage 3: results ---------- */}
        {stage === 'results' && (
          <motion.section className="stage" {...stageMotion} key="stage-results">
            {editing === 'board' && (
              <div className="inline-editor" key="edit-board">
                <BoardPicker
                  boards={boards}
                  selectedBoardId={selectedBoardId}
                  onSelect={chooseBoardInline}
                />
              </div>
            )}
            {editing === 'parts' && (
              <div className="inline-editor" key="edit-parts">
                <ComponentSelector
                  components={components}
                  ownedIds={ownedComponentIds}
                  onToggle={toggleComponent}
                  onSelectAll={selectAllComponents}
                  onClear={clearComponents}
                />
                <div className="stage__actions">
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={applyPartsEdit}
                    disabled={!partsChanged}
                  >
                    Apply Changes
                  </button>
                </div>
              </div>
            )}

            <div className="results" ref={resultsRef}>
              <div className="results__bar">
                <div className="step-head step-head--inline">
                  <p className="step-head__eyebrow">What you can build</p>
                  <h2 className="step-head__title results__heading">
                    Your projects
                    {resultsPulse && (
                      <span className="results__updated" aria-live="polite">
                        Updated
                      </span>
                    )}
                  </h2>
                  <p className="step-head__help">
                    Tap a project for wiring, steps and code, or refine with
                    search and filters.
                  </p>
                </div>
                <ResultsControls
                  search={search}
                  onSearch={setSearch}
                  difficulties={difficultyFilters}
                  onToggleDifficulty={toggleDifficulty}
                  onClearDifficulties={clearDifficulties}
                />
              </div>

              {recommendations.length > 0 &&
                (showNextBuy ? (
                  <NextPurchase
                    recommendations={recommendations}
                    onAdd={addComponent}
                    onDismiss={() => setShowNextBuy(false)}
                  />
                ) : (
                  <button
                    type="button"
                    className="buy-trigger"
                    onClick={() => setShowNextBuy(true)}
                  >
                    <Icon name="bulb" /> What should I buy next?
                  </button>
                ))}

              {noMatches ? (
                <div className="prompt-card">
                  <h2 className="prompt-card__title">
                    No projects match your filters
                  </h2>
                  <p className="prompt-card__body">
                    Try a different search term or difficulty.
                  </p>
                  <button
                    type="button"
                    className="text-btn prompt-card__action"
                    onClick={clearFilters}
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <>
                  <div id="results-buildable">
                  {hasBuildable ? (
                    filtered.buildable.length >= 3 ? (
                      // hero + supporting grid: the recommended build anchors the
                      // composition (fills the canvas, sets the size hierarchy),
                      // the rest follow beneath it
                      <div className="buildable-layout">
                        <FeaturedBuild
                          project={filtered.buildable[0]}
                          onOpen={setActiveProject}
                        />
                        <ResultsSection
                          id="buildable"
                          view="gallery"
                          title="More you can build"
                          subtitle="You own every part and your board can run it."
                          items={filtered.buildable.slice(1)}
                          variant="buildable"
                          tone="buildable"
                          onOpen={setActiveProject}
                        />
                      </div>
                    ) : (
                      <ResultsSection
                        id="buildable"
                        view="gallery"
                        title="You can build these"
                        subtitle="You own every part and your board can run it."
                        items={filtered.buildable}
                        variant="buildable"
                        tone="buildable"
                        onOpen={setActiveProject}
                      />
                    )
                  ) : (
                    <ResultsSection
                      id="buildable"
                      view="gallery"
                      title="You can build these"
                      subtitle="You own every part and your board can run it."
                      items={filtered.buildable}
                      variant="buildable"
                      tone="buildable"
                      emptyNode={
                        <EmptyPlate stamp="No complete builds yet">
                          {filtersActive
                            ? 'No buildable projects match your filters.'
                            : "Add a part or two and a build unlocks — check the near-misses below, you're probably close."}
                        </EmptyPlate>
                      }
                      onOpen={setActiveProject}
                    />
                  )}
                  </div>

                  <div id="results-near">
                    <NearMissBoard
                      items={filtered.nearMiss}
                      onOpen={setActiveProject}
                      emptyNode={
                        <EmptyPlate stamp="No pending drawings">
                          {filtersActive
                            ? 'No near-misses match your filters.'
                            : 'You own every part for the builds above — nothing waiting on one more component.'}
                        </EmptyPlate>
                      }
                    />
                  </div>
                  <div id="results-out">
                    <ResultsSection
                      id="incompatible"
                      view="gallery"
                      title="Not compatible with this board"
                      subtitle={`Ruled out by the ${selectedBoard.name}.`}
                      items={filtered.incompatible}
                      variant="incompatible"
                      tone="muted"
                      collapsible
                      emptyNode={
                        <EmptyPlate stamp="All in spec">
                          {filtersActive
                            ? 'No incompatible projects match your filters.'
                            : `Every project in the catalog runs on the ${selectedBoard.name}.`}
                        </EmptyPlate>
                      }
                    />
                  </div>
                </>
              )}
            </div>
          </motion.section>
        )}
        </AnimatePresence>
      </main>

      {stage === 'landing' && (
      <footer className="titleblock">
        <div className="titleblock__head">
          <div>
            <p className="titleblock__name">Sketchef</p>
            <p className="titleblock__tag">Arduino project finder</p>
          </div>
          <p className="titleblock__sheet mono">SHEET 01 / 01</p>
        </div>
        <dl className="titleblock__grid">
          <div className="titleblock__cell">
            <dt>Boards</dt>
            <dd className="mono">
              {reduceMotion ? boards.length : <CountUp to={boards.length} duration={1.1} />}
            </dd>
          </div>
          <div className="titleblock__cell">
            <dt>Components</dt>
            <dd className="mono">
              {reduceMotion ? (
                components.length
              ) : (
                <CountUp to={components.length} duration={1.3} delay={0.12} />
              )}
            </dd>
          </div>
          <div className="titleblock__cell">
            <dt>Projects</dt>
            <dd className="mono">
              {reduceMotion ? (
                projects.length
              ) : (
                <CountUp to={projects.length} duration={1.5} delay={0.24} />
              )}
            </dd>
          </div>
          <div className="titleblock__cell">
            <dt>Scale</dt>
            <dd className="mono">1:1</dd>
          </div>
        </dl>
        <p className="titleblock__note">
          <span className="titleblock__note-tag mono">Rev. A</span>
          New projects and Arduino boards coming soon…
        </p>
        <div className="titleblock__foot">
          <p className="titleblock__by">
            Drawn by{' '}
            <a
              className="footer__link"
              href="https://github.com/Demetris22"
              target="_blank"
              rel="noreferrer noopener"
            >
              Demetris Demetriou
            </a>
          </p>
          <a
            className="footer__link"
            href="https://github.com/Demetris22/Arduino-Project-Recommender"
            target="_blank"
            rel="noreferrer noopener"
          >
            View source
          </a>
        </div>
      </footer>
      )}

      {activeProject && (
        <ProjectDetail
          project={activeProject}
          components={components}
          onClose={() => setActiveProject(null)}
        />
      )}
    </div>
  );
}

export default App;
