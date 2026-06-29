// Multi-select component picker, grouped by category.
// Owns no matching logic — just reports the set of owned component ids upward.

// Stable display order + friendly labels for the category headings.
const CATEGORY_ORDER = [
  'sensor',
  'actuator',
  'display',
  'input',
  'passive',
  'infrastructure',
];

const CATEGORY_LABELS = {
  sensor: 'Sensors',
  actuator: 'Actuators',
  display: 'Displays',
  input: 'Inputs',
  passive: 'Passives',
  infrastructure: 'Infrastructure',
};

function groupByCategory(components) {
  const groups = new Map();
  for (const component of components) {
    if (!groups.has(component.category)) groups.set(component.category, []);
    groups.get(component.category).push(component);
  }
  // Known categories first (in our order), then any stragglers alphabetically.
  const known = CATEGORY_ORDER.filter((c) => groups.has(c));
  const extra = [...groups.keys()]
    .filter((c) => !CATEGORY_ORDER.includes(c))
    .sort();
  return [...known, ...extra].map((category) => [category, groups.get(category)]);
}

function ComponentSelector({ components, ownedIds, onToggle, onSelectAll, onClear }) {
  const owned = new Set(ownedIds);
  const grouped = groupByCategory(components);

  return (
    <section className="panel" aria-labelledby="component-selector-heading">
      <div className="panel__head">
        <div>
          <h2 id="component-selector-heading" className="panel__title">
            2 · Parts you own
          </h2>
          <p className="panel__hint">
            Toggle everything in your kit — {owned.size} selected.
          </p>
        </div>
        <div className="panel__actions">
          <button
            type="button"
            className="text-btn"
            onClick={onSelectAll}
            disabled={owned.size === components.length}
          >
            Select all
          </button>
          <button
            type="button"
            className="text-btn"
            onClick={onClear}
            disabled={owned.size === 0}
          >
            Clear
          </button>
        </div>
      </div>

      <div className="component-groups">
        {grouped.map(([category, items]) => (
          <div key={category} className="component-group" data-category={category}>
            <h3 className="component-group__heading">
              <span className="component-group__dot" aria-hidden="true" />
              {CATEGORY_LABELS[category] ?? category}
            </h3>
            <div className="chip-grid">
              {items.map((component) => {
                const isOwned = owned.has(component.id);
                return (
                  <button
                    key={component.id}
                    type="button"
                    aria-pressed={isOwned}
                    className={`chip${isOwned ? ' is-owned' : ''}`}
                    onClick={() => onToggle(component.id)}
                  >
                    <span className="chip__check" aria-hidden="true">
                      {isOwned ? '✓' : '+'}
                    </span>
                    {component.name}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ComponentSelector;
