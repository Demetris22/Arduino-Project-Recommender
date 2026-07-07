// The persistent left rail of the app shell. Carries identity (brand), a
// vertical 1·2·3 stepper spine, a per-stage context slot (children — the
// controls/summary for the current step), and the catalog stats + source link
// at the foot. Rendered only on the working stages; the landing is full-bleed
// and rail-less. Navigation is allowed back to any completed step.
const STEPS = [
  { id: 'board', n: 1, label: 'Board' },
  { id: 'parts', n: 2, label: 'Parts' },
  { id: 'results', n: 3, label: 'Build' },
];

function RailNav({ stage, onNavigate, stats, children }) {
  const currentIndex = STEPS.findIndex((s) => s.id === stage);

  return (
    <aside className="railnav">
      <div className="railnav__brand">
        <img
          className="railnav__logo"
          src="/favicon.svg"
          alt=""
          width="34"
          height="34"
        />
        <span className="railnav__brandname">Sketchef</span>
      </div>

      <nav aria-label="Progress">
        <ol className="railnav__steps">
          {STEPS.map((s, i) => {
            const state =
              i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'todo';
            // Completed steps are navigable (go back); current/upcoming are not.
            const clickable = state === 'done';
            return (
              <li
                key={s.id}
                className={`railstep is-${state}${clickable ? ' is-clickable' : ''}`}
                aria-current={state === 'current' ? 'step' : undefined}
              >
                <button
                  type="button"
                  className="railstep__btn"
                  disabled={!clickable}
                  onClick={() => clickable && onNavigate(s.id)}
                >
                  <span className="railstep__dot" aria-hidden="true">
                    {state === 'done' ? '✓' : s.n}
                  </span>
                  <span className="railstep__text">
                    <span className="railstep__label">{s.label}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {children && <div className="railnav__context">{children}</div>}

      <div className="railnav__foot">
        <dl className="railnav__stats" aria-label="Catalog">
          <div>
            <dt>Boards</dt>
            <dd className="mono">{stats.boards}</dd>
          </div>
          <div>
            <dt>Parts</dt>
            <dd className="mono">{stats.components}</dd>
          </div>
          <div>
            <dt>Projects</dt>
            <dd className="mono">{stats.projects}</dd>
          </div>
        </dl>
        <a
          className="railnav__src"
          href="https://github.com/Demetris22/Arduino-Project-Recommender"
          target="_blank"
          rel="noreferrer noopener"
        >
          View source ↗
        </a>
      </div>
    </aside>
  );
}

export default RailNav;
