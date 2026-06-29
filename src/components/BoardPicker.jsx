// Single-select board chooser. Exactly one board is always selected.
// Surfaces a few telling specs per board so the hardware story is visible.

function BoardPicker({ boards, selectedBoardId, onSelect, showTitle = true }) {
  return (
    <section className="panel" aria-labelledby="board-picker-heading">
      {showTitle && (
        <div className="panel__head">
          <h2 id="board-picker-heading" className="panel__title">
            1 · Your board
          </h2>
          <p className="panel__hint">Pick the Arduino you're building with.</p>
        </div>
      )}

      <div className="board-grid" role="radiogroup" aria-label="Arduino board">
        {boards.map((board) => {
          const selected = board.id === selectedBoardId;
          const hasWifi = board.features.includes('wifi');
          const hasBt = board.features.includes('bluetooth');
          return (
            <button
              key={board.id}
              type="button"
              role="radio"
              aria-checked={selected}
              className={`board-card${selected ? ' is-selected' : ''}`}
              onClick={() => onSelect(board.id)}
            >
              <span className="board-card__name">{board.name}</span>
              <span className="board-card__specs">
                <span className="spec" title="Digital pins">
                  {board.digitalPins} digital
                </span>
                <span className="spec" title="Analog pins">
                  {board.analogPins} analog
                </span>
                <span className="spec spec--voltage" title="Logic voltage">
                  {board.logicVoltage}V
                </span>
                {hasWifi && <span className="spec spec--radio">WiFi</span>}
                {hasBt && <span className="spec spec--radio">BT</span>}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default BoardPicker;
