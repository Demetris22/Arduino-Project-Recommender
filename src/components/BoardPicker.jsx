// Single-select board chooser. Exactly one board is always selected.
//
// Each board is laid out as an annotated "plot" on the blueprint sheet — NOT a
// card. There is no bordered box: the board is a real, muted-colour hardware
// object resting on the paper (BoardGlyph), framed only by drafting annotations
// — a sheet ref (BRD-01), a signature-feature callout (USB-C · RF), a ruled
// mini-titleblock of spec cells, and its name. Selecting a board blooms it to
// full colour with a cyan backlight + registration bracket. The five distinct
// coloured objects on the cool field are what keep it from reading generic.
import BoardGlyph from './BoardGlyph.jsx';

// A short drafting designation for the plot's ref line, derived from the id:
// 'uno-r4-wifi' -> 'UNO·R4·WIFI', capped so it never overflows.
function designation(board) {
  const raw = String(board.id || board.name || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '·')
    .replace(/^·|·$/g, '');
  return raw.length > 14 ? `${raw.slice(0, 13)}…` : raw;
}

// The one signature-feature callout for the plot's top annotation: the physical
// connector type (what you plug in) + a radio flag when present. This is the
// per-board detail that makes each plot read differently.
function featureNote(board) {
  const s = `${board.name || ''} ${board.id || ''}`;
  let usb = 'USB-B';
  if (/nano|micro|mini/i.test(s)) usb = 'MINI-USB';
  else if (/esp32|esp8266|devkit|nodemcu|wemos|feather|xiao/i.test(s)) usb = 'MICRO-USB';
  else if (/r4/i.test(s)) usb = 'USB-C';
  const radio =
    board.features?.includes('wifi') || board.features?.includes('bluetooth');
  return radio ? `${usb} · RF` : usb;
}

// The ruled mini-titleblock: five hairline-divided spec cells with NO box — the
// datasheet DNA without the container. The net cell flags an on-board radio.
function SpecLedger({ board, hasRadio }) {
  const cells = [
    { key: 'DIG', value: board.digitalPins },
    { key: 'ANA', value: board.analogPins },
    { key: 'PWM', value: board.pwmPins },
    { key: 'LOGIC', value: `${board.logicVoltage}V` },
  ];
  return (
    <dl className="board-specs" aria-hidden="true">
      {cells.map((cell) => (
        <div key={cell.key} className="board-specs__cell">
          <dt className="mono">{cell.key}</dt>
          <dd className="mono">{cell.value}</dd>
        </div>
      ))}
      <div className={`board-specs__cell is-net${hasRadio ? ' is-on' : ''}`}>
        <dt className="mono">NET</dt>
        <dd className="mono">{hasRadio ? 'RF' : '—'}</dd>
      </div>
    </dl>
  );
}

function BoardPlot({ board, index, selected, onSelect }) {
  const hasWifi = board.features.includes('wifi');
  const hasBt = board.features.includes('bluetooth');
  const hasRadio = hasWifi || hasBt;
  const radio = [hasWifi && 'WiFi', hasBt && 'Bluetooth'].filter(Boolean).join(' · ');
  const code = designation(board);
  const ref = `BRD-${String(index + 1).padStart(2, '0')}`;

  // Screen-reader summary of the annotations that are drawn only visually.
  const specLabel = `${board.digitalPins} digital pins, ${board.analogPins} analog, ${board.pwmPins} PWM, ${board.logicVoltage} volt logic, ${radio || 'no radio'}`;

  return (
    <article className={`board-plot${selected ? ' is-selected' : ''}`}>
      <button
        type="button"
        className="board-plot__select"
        aria-pressed={selected}
        aria-label={`${board.name} — ${specLabel}`}
        onClick={() => onSelect(board.id)}
      >
        {/* top annotation row: sheet ref · signature feature · pick mark */}
        <span className="board-plot__tag" aria-hidden="true">
          <span className="board-plot__ref mono">{ref}</span>
          <span className="board-plot__note mono">{featureNote(board)}</span>
          <span className="board-plot__mark" />
        </span>

        {/* the board itself — a coloured object resting on the paper */}
        <span className="board-plot__object">
          <span className="board-plot__glow" aria-hidden="true" />
          <BoardGlyph board={board} />
        </span>

        <span className="board-plot__id">
          <span className="board-plot__name">{board.name}</span>
          <span className="board-plot__code mono" aria-hidden="true">
            {code}
          </span>
        </span>

        <SpecLedger board={board} hasRadio={hasRadio} />

        {/* registration bracket — drafting corners that mark the chosen plot */}
        <span className="board-plot__bracket" aria-hidden="true" />
      </button>
    </article>
  );
}

function BoardPicker({ boards, selectedBoardId, onSelect, showTitle = true }) {
  return (
    <section
      className={showTitle ? 'panel board-picker' : 'board-picker'}
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
        {boards.map((board, index) => (
          <BoardPlot
            key={board.id}
            board={board}
            index={index}
            selected={board.id === selectedBoardId}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  );
}

export default BoardPicker;
