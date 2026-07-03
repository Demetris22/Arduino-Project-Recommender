// A parametric top-view "drawing" of a board, generated from its real data:
// the header combs are drawn from the actual digital/analog pin counts, the
// plate width keys off the board's form factor, wireless boards sprout a PCB
// antenna, and the IC carries the logic voltage. This turns the picker into a
// sheet of little schematics rather than five identical cards.
//
// Purely decorative — the board name and spec tags beside it carry the real
// information for assistive tech, so the <svg> is aria-hidden.

const FRAME_W = 240;
const FRAME_H = 150;

// form factor -> plate width. A light, deliberately opinionated map so a Nano
// reads compact and a Mega reads long; anything unmatched is Uno-class.
const FORM_WIDTHS = [
  [/mega/i, 208],
  [/nano|micro|mini/i, 150],
  [/esp32|esp8266|devkit|nodemcu|wemos|feather|xiao/i, 160],
];

function plateWidth(name = '') {
  for (const [re, w] of FORM_WIDTHS) if (re.test(name)) return w;
  return 188;
}

// evenly spaced header ticks across [x0, x1]; capped so a 54-pin Mega stays a
// legible comb rather than a smear (the exact count still shows in the tags).
function comb(count, x0, x1, y, len, dir) {
  const n = Math.max(1, Math.min(count || 0, 30));
  const step = (x1 - x0) / n;
  const lines = [];
  for (let i = 0; i < n; i += 1) {
    const x = +(x0 + step * (i + 0.5)).toFixed(1);
    lines.push(<line key={i} x1={x} y1={y} x2={x} y2={y + dir * len} />);
  }
  return lines;
}

function BoardGlyph({ board }) {
  const pw = plateWidth(board.name);
  const px = (FRAME_W - pw) / 2;
  const py = 36;
  const ph = 80;
  const inset = 16;
  const wireless =
    board.features?.includes('wifi') || board.features?.includes('bluetooth');

  // IC footprint, centered on the plate
  const icW = 58;
  const icH = 30;
  const icX = FRAME_W / 2 - icW / 2;
  const icY = py + ph / 2 - icH / 2;
  const legs = [0, 1, 2, 3, 4];

  // antenna meander in the right margin, for radio-equipped boards
  const rx = px + pw + 2;
  const antenna = `M ${rx} ${py + 16} L ${rx} ${py + 8} L ${rx + 6} ${py + 8} L ${rx + 6} ${py} L ${rx + 12} ${py} L ${rx + 12} ${py + 8}`;

  return (
    <svg
      className="board-glyph"
      viewBox={`0 0 ${FRAME_W} ${FRAME_H}`}
      aria-hidden="true"
      focusable="false"
    >
      {/* header combs, drawn from the real pin counts */}
      <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.85">
        {comb(board.digitalPins, px + inset, px + pw - inset, py, 9, -1)}
        {comb(board.analogPins, px + inset, px + pw - inset, py + ph, 9, 1)}
      </g>

      {/* USB connector, jutting from the left edge (line-art) */}
      <rect
        x={px - 9}
        y={py + 24}
        width="11"
        height="22"
        rx="1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      />

      {/* the PCB plate */}
      <rect
        className="board-glyph__plate"
        x={px}
        y={py}
        width={pw}
        height={ph}
        rx="6"
        stroke="currentColor"
        strokeWidth="1.6"
      />

      {/* corner mounting holes */}
      <g fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.7">
        <circle cx={px + 10} cy={py + 10} r="2.6" />
        <circle cx={px + pw - 10} cy={py + 10} r="2.6" />
        <circle cx={px + 10} cy={py + ph - 10} r="2.6" />
        <circle cx={px + pw - 10} cy={py + ph - 10} r="2.6" />
      </g>

      {/* the microcontroller: outlined IC with legs, an orientation dimple, and
          the logic voltage stamped inside */}
      <g stroke="currentColor" strokeWidth="1.2">
        {legs.map((i) => {
          const y = icY + 5 + i * ((icH - 10) / 4);
          return (
            <g key={i}>
              <line x1={icX - 5} y1={y} x2={icX} y2={y} />
              <line x1={icX + icW} y1={y} x2={icX + icW + 5} y2={y} />
            </g>
          );
        })}
      </g>
      <rect
        x={icX}
        y={icY}
        width={icW}
        height={icH}
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle
        cx={icX + 8}
        cy={icY + 6}
        r="2.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.1"
      />
      <text
        className="board-glyph__label"
        x={FRAME_W / 2}
        y={icY + icH / 2 + 4}
        textAnchor="middle"
      >
        {board.logicVoltage}V
      </text>

      {/* three solder pads in red pencil — a nod to the wordmark */}
      <g className="board-glyph__pads">
        <circle cx={px + 18} cy={py + ph - 13} r="2.1" />
        <circle cx={px + 26} cy={py + ph - 13} r="2.1" />
        <circle cx={px + 34} cy={py + ph - 13} r="2.1" />
      </g>

      {/* PCB antenna for wireless boards */}
      {wireless && (
        <path
          d={antenna}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

export default BoardGlyph;
