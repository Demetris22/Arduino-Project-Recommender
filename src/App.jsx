import { useEffect, useMemo, useState } from 'react';

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
import ProjectDetail from './components/ProjectDetail.jsx';
import ShareButton from './components/ShareButton.jsx';
import Atmosphere from './components/Atmosphere.jsx';
import NextPurchase from './components/NextPurchase.jsx';
import StepIndicator from './components/StepIndicator.jsx';

const data = { boards, components, projects };
const DEFAULT_BOARD_ID = boards[0].id;

// Decide the starting selection + stage from the URL.
// - Fresh visit (no params): start at Step 1 with NO board chosen.
// - Shared build (parts present): hydrate and land on results.
// - Board-only URL (mid-flow reload): resume at the components step.
function readInitial() {
  const params = new URLSearchParams(window.location.search);
  const hasBoard = params.has('board');
  const hasParts = params.has('parts');

  if (!hasBoard && !hasParts) {
    return { boardId: null, parts: [], stage: 'board' };
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

  // Stage 1: choosing a board advances the flow.
  const chooseBoardAndAdvance = (id) => {
    setSelectedBoardId(id);
    setStage('parts');
  };
  // Inline board edit (results stage): change without leaving results.
  const chooseBoardInline = (id) => {
    setSelectedBoardId(id);
    setEditing(null);
  };

  const editStep = (step) => setEditing((cur) => (cur === step ? null : step));

  return (
    <div className="app" data-stage={stage}>
      <Atmosphere />

      <header className="hero">
        <p className="hero__eyebrow">
          <span className="hero__led" aria-hidden="true" />
          Sketchef
        </p>
        <h1 className="hero__title">
          What can you build <span className="hero__accent">right now?</span>
        </h1>
        {stage !== 'results' && (
          <p className="hero__lede">
            Tell it your board and parts — get projects you can actually build.
            One step at a time.
          </p>
        )}
        {stage === 'results' && (
          <dl className="hero__stats">
            <div className="hero__stat">
              <dt>boards</dt>
              <dd className="mono">{boards.length}</dd>
            </div>
            <div className="hero__stat">
              <dt>components</dt>
              <dd className="mono">{components.length}</dd>
            </div>
            <div className="hero__stat">
              <dt>projects</dt>
              <dd className="mono">{projects.length}</dd>
            </div>
          </dl>
        )}
      </header>

      <main className="flow">
        {/* ---------- Stage 1: choose your board ---------- */}
        {stage === 'board' && (
          <section className="stage" key="stage-board">
            <StepIndicator current={1} />
            <div className="step-head">
              <p className="step-head__eyebrow">Step 1 of 3 · Choose your Arduino</p>
              <h2 className="step-head__title">Which board are you using?</h2>
              <p className="step-head__help">
                Pick the board you're building with.
              </p>
            </div>
            <BoardPicker
              boards={boards}
              selectedBoardId={selectedBoardId}
              onSelect={chooseBoardAndAdvance}
              showTitle={false}
            />
          </section>
        )}

        {/* ---------- Stage 2: pick your parts ---------- */}
        {stage === 'parts' && (
          <section className="stage" key="stage-parts">
            <StepIndicator current={2} />

            <button
              type="button"
              className="summary-chip"
              onClick={() => setStage('board')}
            >
              <span className="summary-chip__label">Board</span>
              <span className="summary-chip__value">{selectedBoard?.name}</span>
              <span className="summary-chip__edit">Change</span>
            </button>

            <div className="step-head">
              <p className="step-head__eyebrow">
                Step 2 of 3 · Choose your components
              </p>
              <h2 className="step-head__title">Which parts do you own?</h2>
              <p className="step-head__help">
                Toggle the parts you have in your kit.
              </p>
            </div>

            <ComponentSelector
              components={components}
              ownedIds={ownedComponentIds}
              onToggle={toggleComponent}
              onSelectAll={selectAllComponents}
              onClear={clearComponents}
              showTitle={false}
            />

            <div className="stage__actions">
              <button
                type="button"
                className="primary-btn"
                onClick={() => setStage('results')}
              >
                Show what I can build →
              </button>
            </div>
          </section>
        )}

        {/* ---------- Stage 3: results ---------- */}
        {stage === 'results' && (
          <section className="stage" key="stage-results">
            <div className="summary-bar">
              <button
                type="button"
                className={`summary-chip${editing === 'board' ? ' is-editing' : ''}`}
                aria-expanded={editing === 'board'}
                onClick={() => editStep('board')}
              >
                <span className="summary-chip__label">Board</span>
                <span className="summary-chip__value">{selectedBoard?.name}</span>
                <span className="summary-chip__edit">Edit</span>
              </button>
              <button
                type="button"
                className={`summary-chip${editing === 'parts' ? ' is-editing' : ''}`}
                aria-expanded={editing === 'parts'}
                onClick={() => editStep('parts')}
              >
                <span className="summary-chip__label">Parts</span>
                <span className="summary-chip__value mono">
                  {ownedComponentIds.length} selected
                </span>
                <span className="summary-chip__edit">Edit</span>
              </button>
              <div className="summary-bar__spacer" />
              <ShareButton />
            </div>

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
                    className="text-btn"
                    onClick={() => setEditing(null)}
                  >
                    Done editing parts
                  </button>
                </div>
              </div>
            )}

            <div className="results">
              <div className="results__bar">
                <div className="step-head step-head--inline">
                  <p className="step-head__eyebrow">Step 3 of 3 · What you can build</p>
                  <h2 className="step-head__title results__heading">
                    Your projects
                  </h2>
                  <p className="step-head__help">
                    Tap a project for wiring, steps and code — or refine with
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
                    <span aria-hidden="true">💡</span> What should I buy next?
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
                  <ResultsSection
                    id="buildable"
                    title="You can build these"
                    subtitle="You own every part and your board can run it."
                    items={filtered.buildable}
                    variant="buildable"
                    tone="buildable"
                    emptyText={
                      filtersActive
                        ? 'No buildable projects match your filters.'
                        : "Nothing fully buildable yet — check the near-misses below, you're probably close."
                    }
                    onOpen={setActiveProject}
                  />
                  <ResultsSection
                    id="near-miss"
                    title="One or two parts away"
                    subtitle="Grab the missing components and these are yours."
                    items={filtered.nearMiss}
                    variant="near"
                    tone="near"
                    emptyText={
                      filtersActive
                        ? 'No near-misses match your filters.'
                        : 'No near-misses right now — add more parts to unlock these.'
                    }
                    onOpen={setActiveProject}
                  />
                  <ResultsSection
                    id="incompatible"
                    title="Not compatible with this board"
                    subtitle={`Ruled out by the ${selectedBoard.name}.`}
                    items={filtered.incompatible}
                    variant="incompatible"
                    tone="muted"
                    collapsible
                    emptyText={
                      filtersActive
                        ? 'No incompatible projects match your filters.'
                        : 'Every project in the catalog works with this board.'
                    }
                  />
                </>
              )}
            </div>
          </section>
        )}
      </main>

      <footer className="footer">
        <p>
          Static client-side app · {boards.length} boards · {components.length}{' '}
          components · {projects.length} projects
        </p>
      </footer>

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
