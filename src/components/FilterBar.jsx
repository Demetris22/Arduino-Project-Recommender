// Display-only controls that narrow the already-computed result lists.
// Holds no filtering logic itself — it just reports search text and the set
// of active difficulties upward; App does the filtering before rendering.

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];

function FilterBar({ search, onSearch, difficulties, onToggleDifficulty, active, onClear }) {
  return (
    <div className="filter-bar" role="search">
      <div className="filter-bar__search">
        <span className="filter-bar__icon" aria-hidden="true">
          ⌕
        </span>
        <input
          type="text"
          className="filter-bar__input"
          placeholder="Search projects or topics (e.g. PWM)…"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          aria-label="Search projects by title or topic"
        />
        {search && (
          <button
            type="button"
            className="filter-bar__search-clear"
            onClick={() => onSearch('')}
            aria-label="Clear search text"
          >
            ✕
          </button>
        )}
      </div>

      <div
        className="diff-chips"
        role="group"
        aria-label="Filter by difficulty"
      >
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

      {active && (
        <button type="button" className="filter-bar__clear text-btn" onClick={onClear}>
          Clear filters
        </button>
      )}
    </div>
  );
}

export default FilterBar;
