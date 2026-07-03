// Single-select board chooser. Exactly one board is always selected.
// Each board is a little schematic drawing (BoardGlyph) with its datasheet
// tucked behind a "View details" toggle so the cards stay uncluttered.
import { useState } from 'react';
import BoardGlyph from './BoardGlyph.jsx';

function BoardCard({ board, selected, onSelect }) {
  const [open, setOpen] = useState(false);
  const hasWifi = board.features.includes('wifi');
  const hasBt = board.features.includes('bluetooth');
  const radio = [hasWifi && 'WiFi', hasBt && 'BT'].filter(Boolean).join(' · ');

  return (
    <article
      className={`board-card${selected ? ' is-selected' : ''}${
        open ? ' is-open' : ''
      }`}
    >
      <button
        type="button"
        className="board-card__select"
        aria-pressed={selected}
        onClick={() => onSelect(board.id)}
      >
        <BoardGlyph board={board} />
        <span className="board-card__name">{board.name}</span>
      </button>

      <button
        type="button"
        className="board-card__toggle"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{open ? 'Hide details' : 'View details'}</span>
        <span className="board-card__toggle-icon" aria-hidden="true">
          ▾
        </span>
      </button>

      {open && (
        <dl className="board-spec">
          <div className="board-spec__cell">
            <dt>Digital</dt>
            <dd className="mono">{board.digitalPins}</dd>
          </div>
          <div className="board-spec__cell">
            <dt>Analog</dt>
            <dd className="mono">{board.analogPins}</dd>
          </div>
          <div className="board-spec__cell">
            <dt>PWM</dt>
            <dd className="mono">{board.pwmPins}</dd>
          </div>
          <div className="board-spec__cell board-spec__cell--v">
            <dt>Logic</dt>
            <dd className="mono">{board.logicVoltage}V</dd>
          </div>
          <div
            className={`board-spec__cell board-spec__cell--radio${
              radio ? '' : ' is-none'
            }`}
          >
            <dt>Radio</dt>
            <dd className="mono">{radio || 'None'}</dd>
          </div>
        </dl>
      )}
    </article>
  );
}

function BoardPicker({ boards, selectedBoardId, onSelect, showTitle = true }) {
  return (
    <section
      className="panel"
      aria-labelledby={showTitle ? 'board-picker-heading' : undefined}
      aria-label={showTitle ? undefined : 'Choose your board'}
    >
      {showTitle && (
        <div className="panel__head">
          <h2 id="board-picker-heading" className="panel__title">
            1 · Your board
          </h2>
          <p className="panel__hint">Pick the Arduino you're building with.</p>
        </div>
      )}

      <div className="board-grid" role="group" aria-label="Arduino board">
        {boards.map((board) => (
          <BoardCard
            key={board.id}
            board={board}
            selected={board.id === selectedBoardId}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  );
}

export default BoardPicker;
