// A labelled result section wrapping a grid of ProjectCards.
// `items` are already in render order (the engine pre-sorts them).
// New cards animate in via CSS; cards that move when the list recomputes are
// smoothly reflowed with a lightweight FLIP (skipped under reduced motion).
import { useLayoutEffect, useRef, useState } from 'react';
import ProjectCard from './ProjectCard.jsx';
import AnimatedNumber from './AnimatedNumber.jsx';

function useFlipReflow() {
  const gridRef = useRef(null);
  const prevRects = useRef(new Map());

  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid) {
      prevRects.current = new Map();
      return;
    }

    const reduce =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const children = Array.from(grid.children);
    const newRects = new Map();
    children.forEach((child) => {
      const id = child.dataset.flipId;
      if (id) newRects.set(id, child.getBoundingClientRect());
    });

    if (!reduce && typeof grid.animate !== 'undefined') {
      children.forEach((child) => {
        const id = child.dataset.flipId;
        const before = prevRects.current.get(id);
        const after = newRects.get(id);
        if (!before || !after) return; // newly mounted -> CSS entrance handles it
        const dx = before.left - after.left;
        const dy = before.top - after.top;
        if (dx === 0 && dy === 0) return;
        child.animate(
          [
            { transform: `translate(${dx}px, ${dy}px)` },
            { transform: 'translate(0, 0)' },
          ],
          { duration: 320, easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)' }
        );
      });
    }

    prevRects.current = newRects;
  });

  return gridRef;
}

function ResultsSection({
  id,
  title,
  subtitle,
  items,
  variant,
  emptyText,
  tone,
  onOpen,
  collapsible = false,
}) {
  const gridRef = useFlipReflow();
  // Collapsible sections (e.g. incompatible) start collapsed.
  const [open, setOpen] = useState(!collapsible);
  const showBody = !collapsible || open;

  const count = (
    <span className="results-section__count mono">
      <AnimatedNumber value={items.length} />
    </span>
  );

  return (
    <section
      className={`results-section results-section--${tone ?? 'default'}${
        collapsible ? ' is-collapsible' : ''
      }${collapsible && !open ? ' is-collapsed' : ''}`}
      aria-labelledby={`${id}-heading`}
    >
      <div className="results-section__head">
        <h2 id={`${id}-heading`} className="results-section__title">
          {collapsible ? (
            <button
              type="button"
              className="results-section__toggle"
              aria-expanded={open}
              aria-controls={`${id}-body`}
              onClick={() => setOpen((v) => !v)}
            >
              {title}
              {count}
              <span className="results-section__chevron" aria-hidden="true">
                ▾
              </span>
            </button>
          ) : (
            <>
              {title}
              {count}
            </>
          )}
        </h2>
        {subtitle && showBody && (
          <p className="results-section__subtitle">{subtitle}</p>
        )}
      </div>

      {showBody &&
        (items.length === 0 ? (
          <p className="results-empty" id={`${id}-body`}>
            {emptyText}
          </p>
        ) : (
          <div className="project-grid" id={`${id}-body`} ref={gridRef}>
            {items.map((item, index) => {
              // Buildable items are bare projects; near-miss/incompatible wrap one.
              const project = item.project ?? item;
              return (
                <ProjectCard
                  key={project.id}
                  project={project}
                  missing={item.missing}
                  reasons={item.reasons}
                  variant={variant}
                  index={index}
                  onOpen={onOpen}
                />
              );
            })}
          </div>
        ))}
    </section>
  );
}

export default ResultsSection;
