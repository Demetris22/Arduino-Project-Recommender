// "My Kit" — no longer steps 1 and 2 of a wizard, just a tool you visit when you
// want to. Choosing a board and ticking parts sharpens the lens over the catalog.
// The unlock panel is the old "what should I buy next?", promoted to a first-class
// feature and driven by the untouched suggestNextPurchases().
import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import boards from '../data/boards.json';
import components from '../data/components.json';
import projects from '../data/projects.json';
import { suggestNextPurchases } from '../data/lib/suggest.js';
import { useKit } from '../kit/KitContext.jsx';
import { useProjectStatus } from '../kit/useProjectStatus.js';
import BoardGlyph from '../components/BoardGlyph.jsx';
import PartIcon from '../components/PartIcon.jsx';

const data = { boards, components, projects };

const CATEGORY_ORDER = ['sensor', 'actuator', 'display', 'input', 'passive', 'infrastructure'];
const CATEGORY_LABEL = {
  sensor: 'Sensors',
  actuator: 'Actuators',
  display: 'Displays',
  input: 'Inputs',
  passive: 'Passives',
  infrastructure: 'Infrastructure',
};

function BoardChooser({ onPick }) {
  const { boardId, setBoard } = useKit();

  return (
    <div className="boardchoose">
      {boards.map((board) => {
        const selected = board.id === boardId;
        const radio = [
          board.features.includes('wifi') && 'WiFi',
          board.features.includes('bluetooth') && 'Bluetooth',
        ]
          .filter(Boolean)
          .join(' · ');

        return (
          <button
            key={board.id}
            type="button"
            className={`boardcard${selected ? ' is-selected' : ''}`}
            aria-pressed={selected}
            onClick={() => {
              setBoard(board.id);
              onPick?.();
            }}
          >
            <span className="boardcard__screen">
              <BoardGlyph board={board} />
            </span>
            <span className="boardcard__id">
              <span className="boardcard__name">{board.name}</span>
              <span className="boardcard__meta mono">
                {board.digitalPins} DIG · {board.analogPins} ANA · {board.logicVoltage}V
                {radio ? ` · ${radio}` : ''}
              </span>
            </span>
            <span className="boardcard__check" aria-hidden="true">
              ✓
            </span>
          </button>
        );
      })}
    </div>
  );
}

function PartsChecklist() {
  const { owned, togglePart, selectAllParts, clearParts, parts } = useKit();

  const grouped = useMemo(() => {
    const by = new Map();
    for (const c of components) {
      if (!by.has(c.category)) by.set(c.category, []);
      by.get(c.category).push(c);
    }
    return CATEGORY_ORDER.filter((k) => by.has(k)).map((k) => [k, by.get(k)]);
  }, []);

  return (
    <div className="parts">
      <div className="parts__bar">
        <p className="parts__count mono">
          <b>{parts.length}</b> / {components.length} parts owned
        </p>
        <div className="parts__actions">
          <button type="button" className="btn btn--outline btn--sm" onClick={selectAllParts}>
            Select all
          </button>
          <button
            type="button"
            className="btn btn--outline btn--sm"
            onClick={clearParts}
            disabled={parts.length === 0}
          >
            Clear
          </button>
        </div>
      </div>

      {grouped.map(([category, list]) => (
        <section className="parts__group" key={category} data-category={category}>
          <h3 className="parts__grouphead mono">
            <span className="parts__dot" aria-hidden="true" />
            {CATEGORY_LABEL[category]}
            <span className="parts__rule" aria-hidden="true" />
            <span className="parts__n">{list.filter((c) => owned.has(c.id)).length}/{list.length}</span>
          </h3>

          <div className="parts__chips">
            {list.map((c) => {
              const isOwned = owned.has(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  className={`chip${isOwned ? ' is-owned' : ''}`}
                  aria-pressed={isOwned}
                  onClick={() => togglePart(c.id)}
                >
                  <span className="chip__icon" aria-hidden="true">
                    <PartIcon component={c} />
                  </span>
                  <span className="chip__name">{c.name}</span>
                  <span className="chip__check" aria-hidden="true">
                    {isOwned ? '✓' : '+'}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

function UnlockPanel() {
  const { boardId, parts, addPart } = useKit();

  const recommendations = useMemo(
    () => (boardId ? suggestNextPurchases(parts, boardId, data, 4) : []),
    [boardId, parts]
  );

  if (recommendations.length === 0) return null;

  return (
    <section className="unlock">
      <h2 className="unlock__title">Unlock more projects</h2>
      <p className="unlock__sub">
        The highest-leverage parts you don&apos;t own yet, ranked by how many projects each one opens up.
      </p>

      <ul className="unlock__list">
        {recommendations.map(({ component, unlockCount, neededByCount, unlocks }) => (
          <li className="unlock__row" key={component.id}>
            <span className="unlock__icon" aria-hidden="true">
              <PartIcon component={component} />
            </span>

            <span className="unlock__detail">
              <span className="unlock__name">{component.name}</span>
              <span className="unlock__effect mono">
                {unlockCount > 0
                  ? `unlocks ${unlockCount} project${unlockCount === 1 ? '' : 's'}`
                  : `needed by ${neededByCount} project${neededByCount === 1 ? '' : 's'}`}
              </span>
              {unlocks.length > 0 && (
                <span className="unlock__names">
                  {unlocks.slice(0, 3).map((p) => p.title).join(' · ')}
                </span>
              )}
            </span>

            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={() => addPart(component.id)}
            >
              I have this
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ShareRow() {
  const { shareUrl, reset, hasKit } = useKit();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — nothing sensible to do */
    }
  };

  if (!hasKit) return null;

  return (
    <div className="kitpage__share">
      <button type="button" className="btn btn--solid" onClick={copy}>
        {copied ? 'Link copied' : 'Copy share link'}
      </button>
      <button type="button" className="linkbtn" onClick={reset}>
        Reset kit
      </button>
    </div>
  );
}

function KitPage() {
  const { hasKit } = useKit();
  const { counts } = useProjectStatus();
  const partsRef = useRef(null);

  // The "road": choosing a board carries the reader straight down to the parts
  // step, so the next thing to do is under their thumb — no hunting.
  const scrollToParts = () => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    partsRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  };

  return (
    <div className="shell kitpage">
      <header className="pagehead">
        <p className="pagehead__eyebrow mono">My kit</p>
        <h1 className="pagehead__title">What are you building with?</h1>
        <p className="pagehead__sub">
          Pick your board and tick the parts you own. Sketchef will mark every project in the catalog
          as buildable, almost there, or out of reach — nothing gets hidden.
        </p>
      </header>

      <section className="kitsection">
        <div className="sectionhead">
          <h2 className="sectionhead__title">1 · Your board</h2>
          <span className="sectionhead__rule" aria-hidden="true" />
          <span className="sectionhead__count mono">{boards.length} boards</span>
        </div>
        <BoardChooser onPick={scrollToParts} />
      </section>

      <section className="kitsection" ref={partsRef}>
        <div className="sectionhead">
          <h2 className="sectionhead__title">2 · Your parts</h2>
          <span className="sectionhead__rule" aria-hidden="true" />
          <span className="sectionhead__count mono">{components.length} components</span>
        </div>
        <PartsChecklist />
      </section>

      {/* The payoff sits at the end of the flow, where the reader finishes ticking
          parts — not back up top where they'd have to scroll to find it. */}
      {hasKit && (
        <div className="kitpage__result" aria-live="polite">
          <p className="kitpage__resulttext">
            With this kit you can build <b>{counts.buildable}</b> of {projects.length} projects right
            now, and <b>{counts.near}</b> more are one or two parts away.
          </p>
          <Link className="btn btn--primary" to="/#catalog">
            See what you can build <span aria-hidden="true">→</span>
          </Link>
        </div>
      )}

      <UnlockPanel />
      <ShareRow />
    </div>
  );
}

export default KitPage;
