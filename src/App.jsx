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
import ProjectDetail from './components/ProjectDetail.jsx';
import FilterBar from './components/FilterBar.jsx';
import ShareButton from './components/ShareButton.jsx';
import Atmosphere from './components/Atmosphere.jsx';
import NextPurchase from './components/NextPurchase.jsx';

const data = { boards, components, projects };
const DEFAULT_BOARD_ID = boards[0].id;

function App() {
  // Initialize from the URL (?board=...&parts=...), validated against the data.
  // A bad board falls back to default; unknown part ids are dropped.
  const [initialSelection] = useState(() =>
    readSelectionFromUrl(window.location.search, {
      boards,
      components,
      defaultBoardId: DEFAULT_BOARD_ID,
    })
  );

  // A board is always selected; default to the first in the catalog.
  const [selectedBoardId, setSelectedBoardId] = useState(
    initialSelection.boardId
  );
  const [ownedComponentIds, setOwnedComponentIds] = useState(
    initialSelection.ownedComponentIds
  );

  // Mirror board + parts into the URL (replaceState — no history spam).
  // Runs on mount too, which normalizes any malformed inbound URL.
  useEffect(() => {
    const query = buildSelectionQuery(selectedBoardId, ownedComponentIds);
    const url = `${window.location.pathname}${query}${window.location.hash}`;
    window.history.replaceState(null, '', url);
  }, [selectedBoardId, ownedComponentIds]);
  // The project whose build instructions are open in the modal (null = closed).
  const [activeProject, setActiveProject] = useState(null);

  // Display-only filter state (never touches the matching engine).
  const [search, setSearch] = useState('');
  const [difficultyFilters, setDifficultyFilters] = useState([]);

  // Single source of truth for results — recomputes whenever inputs change.
  const { buildable, nearMiss, incompatible } = useMemo(
    () => getMatches(ownedComponentIds, selectedBoardId, data),
    [ownedComponentIds, selectedBoardId]
  );

  const filtersActive = search.trim() !== '' || difficultyFilters.length > 0;

  const toggleDifficulty = (level) =>
    setDifficultyFilters((prev) =>
      prev.includes(level) ? prev.filter((x) => x !== level) : [...prev, level]
    );

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
    () => suggestNextPurchases(ownedComponentIds, selectedBoardId, data),
    [ownedComponentIds, selectedBoardId]
  );

  const toggleComponent = (id) => {
    setOwnedComponentIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Adds a part if not already owned (used by the "buy next" recommendations).
  const addComponent = (id) =>
    setOwnedComponentIds((prev) =>
      prev.includes(id) ? prev : [...prev, id]
    );

  const selectAllComponents = () =>
    setOwnedComponentIds(components.map((c) => c.id));
  const clearComponents = () => setOwnedComponentIds([]);

  const hasSelection = ownedComponentIds.length > 0;
  const selectedBoard = boards.find((b) => b.id === selectedBoardId);

  return (
    <div className="app">
      <Atmosphere />

      <header className="hero">
        <p className="hero__eyebrow">
          <span className="hero__led" aria-hidden="true" />
          Arduino Project Recommender
        </p>
        <h1 className="hero__title">
          What can you build <span className="hero__accent">right now?</span>
        </h1>
        <p className="hero__lede">
          Tell it your board and parts — get projects you can actually build.
          The catalog updates live, sorted from quick beginner builds to
          advanced ones.
        </p>
        <div className="hero__footer">
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
          <ShareButton />
        </div>
      </header>

      <main className="layout">
        <div className="controls">
          <BoardPicker
            boards={boards}
            selectedBoardId={selectedBoardId}
            onSelect={setSelectedBoardId}
          />
          <ComponentSelector
            components={components}
            ownedIds={ownedComponentIds}
            onToggle={toggleComponent}
            onSelectAll={selectAllComponents}
            onClear={clearComponents}
          />
        </div>

        <div className="results">
          {recommendations.length > 0 && (
            <NextPurchase
              recommendations={recommendations}
              onAdd={addComponent}
            />
          )}

          {!hasSelection ? (
            <div className="prompt-card">
              <h2 className="prompt-card__title">Pick your parts to begin</h2>
              <p className="prompt-card__body">
                Select the components you own above and we'll match them against
                projects for the <strong>{selectedBoard.name}</strong>.
              </p>
            </div>
          ) : (
            <>
              <FilterBar
                search={search}
                onSearch={setSearch}
                difficulties={difficultyFilters}
                onToggleDifficulty={toggleDifficulty}
                active={filtersActive}
                onClear={clearFilters}
              />

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
                    emptyText={
                      filtersActive
                        ? 'No incompatible projects match your filters.'
                        : 'Every project in the catalog works with this board.'
                    }
                  />
                </>
              )}
            </>
          )}
        </div>
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
