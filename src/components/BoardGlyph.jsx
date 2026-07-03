// A top-view "drawing" of a board, shaped to resemble the real hardware: the
// header combs come from the actual digital/analog pin counts, but the plate
// proportions, the USB connector type, the barrel jack, the Mega's end-header
// block, and the ESP32's shield + antenna are chosen per board so a Nano reads
// small, a Mega reads long, an ESP32 reads like a radio module, and an Uno R3
// (USB-B) is distinguishable from an R4 (USB-C + antenna).
//
// Purely decorative — the board name and spec tags beside it carry the real
// information for assistive tech, so the <svg> is aria-hidden.

const FRAME_W = 240;
const FRAME_H = 150;

// Silhouette profile per board, matched by name/id so it degrades sensibly for
// any board not in the current data set.
function profileOf(board) {
  const s = `${board.name || ''} ${board.id || ''}`;
  if (/nano|micro|mini/i.test(s))
    return { w: 116, h: 56, usb: 'mini', barrel: false, headers: false, shield: false };
  if (/mega/i.test(s))
    return { w: 214, h: 82, usb: 'b', barrel: true, headers: true, shield: false };
  if (/esp32|esp8266|devkit|nodemcu|wemos|feather|xiao/i.test(s))
    return { w: 128, h: 78, usb: 'micro', barrel: false, headers: false, shield: true };
  if (/r4/i.test(s))
    return { w: 178, h: 82, usb: 'c', barrel: true, headers: false, shield: false };
  return { w: 178, h: 82, usb: 'b', barrel: true, headers: false, shield: false };
}

// Evenly spaced header ticks across [x0, x1] on a horizontal edge; capped so a
// 54-pin Mega stays a legible comb (the exact count still shows in the tags).
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

// Ticks along a vertical edge — used for the Mega's end-header block.
function vComb(count, y0, y1, x, len, dir) {
  const n = Math.max(1, Math.min(count || 0, 16));
  const step = (y1 - y0) / n;
  const lines = [];
  for (let i = 0; i < n; i += 1) {
    const y = +(y0 + step * (i + 0.5)).toFixed(1);
    lines.push(<line key={i} x1={x} y1={y} x2={x + dir * len} y2={y} />);
  }
  return lines;
}

// USB connector jutting from the left edge, drawn to the right size/shape for
// its type — a fat Type-B, a rounded Type-C, or a small mini/micro.
function usbShape(type, x, yMid) {
  if (type === 'b') {
    return (
      <rect
        x={x - 14}
        y={yMid - 11}
        width="14"
        height="22"
        rx="1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    );
  }
  if (type === 'c') {
    return (
      <rect
        x={x - 10}
        y={yMid - 7}
        width="10"
        height="14"
        rx="6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    );
  }
  // mini / micro — a small trapezoidal shell
  return (
    <path
      d={`M ${x} ${yMid - 5} L ${x - 8} ${yMid - 5} L ${x - 9} ${yMid - 3.5} L ${x - 9} ${yMid + 3.5} L ${x - 8} ${yMid + 5} L ${x} ${yMid + 5}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
  );
}

function BoardGlyph({ board }) {
  const f = profileOf(board);
  const pw = f.w;
  const ph = f.h;
  const px = Math.round((FRAME_W - pw) / 2);
  const py = Math.round((FRAME_H - ph) / 2);
  const inset = 14;
  const wireless =
    board.features?.includes('wifi') || board.features?.includes('bluetooth');

  const midY = py + ph / 2;
  // leave room for a barrel jack under the USB when the board has one
  const usbY = f.barrel ? midY - 12 : midY;
  const barrelY = midY + 3;

  // MCU footprint, scaled to the plate (skipped when a shield stands in for it)
  const icW = Math.round(Math.min(56, pw * 0.34));
  const icH = Math.round(Math.min(30, ph * 0.44));
  const icX = FRAME_W / 2 - icW / 2;
  const icY = midY - icH / 2;

  // antenna meander in the top-right margin, for radio-equipped boards
  const rx = px + pw + 2;
  const antenna = `M ${rx} ${py + 14} L ${rx} ${py + 7} L ${rx + 6} ${py + 7} L ${rx + 6} ${py} L ${rx + 12} ${py} L ${rx + 12} ${py + 7}`;

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

      {/* USB connector, jutting from the left edge */}
      {usbShape(f.usb, px, usbY)}

      {/* barrel power jack, below the USB */}
      {f.barrel && (
        <g fill="none" stroke="currentColor" strokeWidth="1.4">
          <rect x={px - 13} y={barrelY} width="13" height="15" rx="2" />
          <circle cx={px - 6.5} cy={barrelY + 7.5} r="2.4" />
        </g>
      )}

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
        <circle cx={px + 10} cy={py + 10} r="2.4" />
        <circle cx={px + pw - 10} cy={py + 10} r="2.4" />
        <circle cx={px + 10} cy={py + ph - 10} r="2.4" />
        <circle cx={px + pw - 10} cy={py + ph - 10} r="2.4" />
      </g>

      {/* Mega's extra end-header block on the right edge */}
      {f.headers && (
        <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.85">
          {vComb(9, py + inset, py + ph - inset, px + pw, 7, 1)}
        </g>
      )}

      {/* centre feature: a radio module shield (ESP32) or the outlined MCU */}
      {f.shield ? (
        <g>
          <rect
            x={FRAME_W / 2 - 34}
            y={py + 11}
            width="68"
            height={ph - 34}
            rx="2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <text
            className="board-glyph__label"
            x={FRAME_W / 2}
            y={py + 11 + (ph - 34) / 2 + 4}
            textAnchor="middle"
          >
            {board.logicVoltage}V
          </text>
        </g>
      ) : (
        <>
          <g stroke="currentColor" strokeWidth="1.2">
            {[0, 1, 2, 3, 4].map((i) => {
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
        </>
      )}

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
