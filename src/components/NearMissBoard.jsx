// "One or two parts away" — presented as an assembly-progress board rather than
// a grid of boxes. Each build is a free-standing work order whose hero is a
// parts-completion gauge: one cell per required part, the ones you own filled
// in, the one or two you're missing hatched red as a "to add" note. Ordered
// closest-to-done first so the gauges cascade from nearly-complete downward.
import { useState } from 'react';
import DifficultyStamp from './DifficultyStamp.jsx';
import AnimatedNumber from './AnimatedNumber.jsx';

// The segmented gauge: `have` filled cells, then the missing cells hatched.
function CompletionMeter({ have, total }) {
  return (
    <span className="nm-meter" aria-hidden="true">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`nm-meter__cell ${i < have ? 'is-on' : 'is-missing'}`}
        />
      ))}
    </span>
  );
}

function NearMissBoard({ items, onOpen, emptyNode }) {
  // Collapsed by default so the first glance is just the buildable deck.
  const [open, setOpen] = useState(false);

  // Closest to buildable first (highest completion, then fewest parts missing).
  const rows = [...items].sort((a, b) => {
    const ta = a.project.requires?.length || 1;
    const tb = b.project.requires?.length || 1;
    const ca = (ta - a.missing.length) / ta;
    const cb = (tb - b.missing.length) / tb;
    if (cb !== ca) return cb - ca;
    return a.missing.length - b.missing.length;
  });

  return (
    <section
      className={`results-section results-section--near is-collapsible${
        open ? '' : ' is-collapsed'
      }`}
      aria-labelledby="near-miss-heading"
    >
      <div className="results-section__head">
        <h2 id="near-miss-heading" className="results-section__title">
          <button
            type="button"
            className="results-section__toggle"
            aria-expanded={open}
            aria-controls="near-miss-body"
            onClick={() => setOpen((v) => !v)}
          >
            One or two parts away
            <span className="results-section__rule" aria-hidden="true" />
            <span className="results-section__count mono">
              <AnimatedNumber value={items.length} />
            </span>
            <span className="results-section__chevron" aria-hidden="true">
              ▾
            </span>
          </button>
        </h2>
        {open && items.length > 0 && (
          <p className="results-section__subtitle">
            Grab the missing components and these are yours — closest first.
          </p>
        )}
      </div>

      {open &&
        (items.length === 0 ? (
          <div id="near-miss-body">{emptyNode}</div>
        ) : (
          <ol className="nm-board" id="near-miss-body">
          {rows.map(({ project, missing }) => {
            const total = project.requires?.length ?? missing.length;
            const have = Math.max(total - missing.length, 0);
            const names = missing.map((c) => c.name).join(', ');
            return (
              <li
                key={project.id}
                className="nm-row"
                data-difficulty={project.difficulty}
              >
                <button
                  type="button"
                  className="nm-row__main"
                  onClick={() => onOpen(project)}
                  aria-label={`View build instructions for ${project.title} — ${have} of ${total} parts owned, needs ${names}`}
                >
                  <span className="nm-row__head">
                    <span className="nm-row__title">{project.title}</span>
                    <DifficultyStamp level={project.difficulty} />
                  </span>

                  <span className="nm-row__gauge">
                    <CompletionMeter have={have} total={total} />
                    <span className="nm-row__parts mono">
                      {have}/{total}
                    </span>
                  </span>

                  <span className="nm-row__req">
                    <span className="nm-row__req-tag">Add</span>
                    <span className="nm-row__req-parts">{names}</span>
                  </span>

                  <span className="nm-row__cta-row">
                    <span className="nm-row__cta mono" aria-hidden="true">
                      View build →
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
          </ol>
        ))}
    </section>
  );
}

export default NearMissBoard;
