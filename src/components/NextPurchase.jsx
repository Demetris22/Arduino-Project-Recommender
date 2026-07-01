// "What to buy next" panel. Pure presentation over the ranked array from
// suggestNextPurchases — clicking a recommendation adds that component to the
// user's owned set (via onAdd), which makes the results recompute live.
import { useState } from 'react';
import Icon from './Icon.jsx';

const plural = (n) => (n === 1 ? 'project' : 'projects');

// Headline/meta wording: never say "unlocks 0" — fall back to coverage.
function recWording(rec) {
  if (rec.unlockCount > 0) {
    return { verb: 'unlocks', count: rec.unlockCount };
  }
  return { verb: 'needed for', count: rec.neededByCount };
}

function NextPurchase({ recommendations, onAdd, onDismiss }) {
  const [expanded, setExpanded] = useState(false);

  if (recommendations.length === 0) return null;

  const [top, ...rest] = recommendations;
  const others = rest.slice(0, 3);
  const canExpand = top.unlocks.length > 0;

  return (
    <section className="next-buy" aria-labelledby="next-buy-heading">
      <div className="next-buy__top">
        <p className="next-buy__eyebrow" id="next-buy-heading">
          <Icon name="bolt" /> Best next purchase
        </p>
        {onDismiss && (
          <button
            type="button"
            className="next-buy__dismiss"
            onClick={onDismiss}
            aria-label="Hide buy suggestions"
          >
            ✕
          </button>
        )}
      </div>

      <button
        type="button"
        className="next-buy__headline"
        onClick={() => onAdd(top.component.id)}
      >
        <span className="next-buy__headline-text">
          Add <strong>{top.component.name}</strong>{' '}
          {top.unlockCount > 0 ? (
            <>
              <span className="next-buy__arrow" aria-hidden="true">
                →
              </span>{' '}
              unlocks <strong className="next-buy__num">{top.unlockCount}</strong>{' '}
              {plural(top.unlockCount)}
            </>
          ) : (
            <>
              for{' '}
              <strong className="next-buy__num">{top.neededByCount}</strong>{' '}
              {plural(top.neededByCount)} you're working toward
            </>
          )}
        </span>
        <span className="next-buy__add" aria-hidden="true">
          Add part →
        </span>
      </button>

      {canExpand && (
        <>
          <button
            type="button"
            className="next-buy__toggle"
            aria-expanded={expanded}
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? 'Hide' : 'Show'} the {top.unlockCount} it unlocks
          </button>
          {expanded && (
            <ul className="next-buy__unlocks">
              {top.unlocks.map((project) => (
                <li key={project.id}>{project.title}</li>
              ))}
            </ul>
          )}
        </>
      )}

      {others.length > 0 && (
        <ul className="next-buy__list">
          {others.map((rec) => {
            const { verb, count } = recWording(rec);
            return (
              <li key={rec.component.id}>
                <button
                  type="button"
                  className="next-buy__item"
                  onClick={() => onAdd(rec.component.id)}
                >
                  <span className="next-buy__item-name">
                    {rec.component.name}
                  </span>
                  <span className="next-buy__item-meta mono">
                    {verb} {count}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default NextPurchase;
