// Results-stage toolbar: search collapsed behind a magnifying-glass icon, and
// difficulty filters tucked behind a "Filter" control. Holds only local
// open/close UI state; the actual search/filter state lives in App.
import { useEffect, useRef, useState } from 'react';
import Icon from './Icon.jsx';

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];

function ResultsControls({
  search,
  onSearch,
  difficulties,
  onToggleDifficulty,
  onClearDifficulties,
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const inputRef = useRef(null);
  const filterRef = useRef(null);

  // Focus the input when search expands.
  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  // Close the filter popover on outside click / Escape.
  useEffect(() => {
    if (!filterOpen) return;
    const onDown = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    };
    const onKey = (e) => e.key === 'Escape' && setFilterOpen(false);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [filterOpen]);

  const activeCount = difficulties.length;

  return (
    <div className="results-controls">
      <div className={`rc-search${searchOpen ? ' is-open' : ''}`}>
        <button
          type="button"
          className="rc-icon-btn"
          aria-label={searchOpen ? 'Close search' : 'Search projects'}
          aria-expanded={searchOpen}
          onClick={() => setSearchOpen((v) => !v)}
        >
          <Icon name="search" size="1.1em" />
        </button>
        <input
          ref={inputRef}
          type="text"
          className="rc-search__input"
          placeholder="Search projects or topics…"
          aria-label="Search projects"
          autoComplete="off"
          spellCheck={false}
          value={search}
          tabIndex={searchOpen ? 0 : -1}
          aria-hidden={!searchOpen}
          onChange={(e) => onSearch(e.target.value)}
          onBlur={() => {
            if (search.trim() === '') setSearchOpen(false);
          }}
        />
        {searchOpen && search && (
          <button
            type="button"
            className="rc-search__clear"
            aria-label="Clear search"
            onClick={() => {
              onSearch('');
              setSearchOpen(false);
            }}
          >
            ✕
          </button>
        )}
      </div>

      <div className="rc-filter" ref={filterRef}>
        <button
          type="button"
          className={`rc-pill${activeCount > 0 ? ' is-active' : ''}`}
          aria-expanded={filterOpen}
          aria-haspopup="true"
          onClick={() => setFilterOpen((v) => !v)}
        >
          <Icon name="filter" /> Filter
          {activeCount > 0 && (
            <span className="rc-filter__badge mono">{activeCount}</span>
          )}
        </button>

        {filterOpen && (
          <div className="rc-popover" role="group" aria-label="Filter by difficulty">
            <p className="rc-popover__title">Difficulty</p>
            <div className="rc-popover__chips">
              {DIFFICULTIES.map((level) => {
                const on = difficulties.includes(level);
                return (
                  <button
                    key={level}
                    type="button"
                    aria-pressed={on}
                    className={`diff-chip diff-chip--${level}${on ? ' is-on' : ''}`}
                    onClick={() => onToggleDifficulty(level)}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
            {activeCount > 0 && (
              <button
                type="button"
                className="text-btn rc-popover__clear"
                onClick={onClearDifficulties}
              >
                Clear difficulty
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ResultsControls;
