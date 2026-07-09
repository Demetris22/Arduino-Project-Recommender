// A realistic breadboard wiring figure, generated from a declarative per-project
// spec (src/data/breadboards.js). Unlike ProjectDiagram (a monochrome schematic
// on currentColor), this is a *coloured* render — a tan solderless breadboard,
// an Arduino block with just the pins the project uses, recognisable component
// glyphs, and colour-coded jumper wires — so a beginner can copy the build.
//
// Everything is SVG (crisp at any DPI, themeable, tiny, versioned) and laid out
// by a small anchor engine: parts are auto-placed left→right and expose named
// pin anchors (e.g. `d1.anode`, `u1.Echo`); wires connect anchor→anchor. Purely
// visual — the wiring list beside it carries the same information in text — so
// the <svg> is aria-hidden.

const VB_W = 760;
const VB_H = 392;

// ---- breadboard geometry -------------------------------------------------
const BB = { x: 240, y: 44, w: 504, h: 312 };
const COLS = 30;
const COL0 = BB.x + 24;
const COL1 = BB.x + BB.w - 20;
const colX = (i) => COL0 + (i * (COL1 - COL0)) / (COLS - 1);

// row y-positions: two power rails top, terminal rows a–e / f–j round a trench,
// two power rails bottom.
const ROW = {
  railTopA: BB.y + 20,
  railTopB: BB.y + 34,
  a: BB.y + 74,
  b: BB.y + 92,
  c: BB.y + 110,
  d: BB.y + 128,
  e: BB.y + 146,
  f: BB.y + 180,
  g: BB.y + 198,
  h: BB.y + 216,
  i: BB.y + 234,
  j: BB.y + 252,
  railBotA: BB.y + 286,
  railBotB: BB.y + 300,
};

// ---- wire palette --------------------------------------------------------
const WIRE = {
  red: '#d63d54',
  blk: '#242832',
  grn: '#24a15a',
  blu: '#2f7fd1',
  yel: '#e0a72c',
  org: '#e07b2a',
  pur: '#8a63b8',
  wht: '#e7edf0',
  tea: '#14c3ca',
};

// arduino pin-pad tint by kind
const PIN_TINT = { pwr: '#d63d54', gnd: '#242832', dig: '#0f8f95', ana: '#2f7fd1', clk: '#8a63b8' };

// ---- component footprints (in px width) so auto-layout can space them -----
const WIDTH_OF = {
  led: 40,
  'rgb-led': 74,
  resistor: 78,
  photoresistor: 58,
  'push-button': 62,
  potentiometer: 66,
  buzzer: 52,
  module: 0, // computed from pin count
};

function moduleWidth(part) {
  return Math.max(70, (part.pins?.length ?? 3) * 24 + 26);
}

// ======================================================================
// Component glyphs. Each returns { el, anchors } where anchors maps a pin
// name to { x, y } — the point a jumper wire attaches to. cx is the glyph's
// horizontal centre; legs plug down to ROW.e (top terminal strip).
// ======================================================================
function drawLED(cx, part) {
  const legY = ROW.e;
  const bodyY = ROW.b;
  const ax = cx - 8; // anode (long leg)
  const kx = cx + 8; // cathode (short leg)
  const fill = part.color || '#e6413a';
  return {
    el: (
      <g>
        <line x1={ax} y1={bodyY} x2={ax} y2={legY} className="bb-leg" />
        <line x1={kx} y1={bodyY} x2={kx} y2={legY} className="bb-leg" />
        <path
          d={`M ${cx - 10} ${bodyY} a 10 11 0 0 1 20 0 v 3 h -20 Z`}
          fill={fill}
          stroke="rgba(0,0,0,0.35)"
          strokeWidth="1"
        />
        <ellipse cx={cx - 3} cy={bodyY - 5} rx="3" ry="4" fill="rgba(255,255,255,0.5)" />
      </g>
    ),
    anchors: { anode: { x: ax, y: legY }, cathode: { x: kx, y: legY } },
  };
}

function drawRGB(cx, part) {
  const legY = ROW.e;
  const bodyY = ROW.b;
  const xs = [cx - 15, cx - 5, cx + 5, cx + 15];
  return {
    el: (
      <g>
        {xs.map((x) => (
          <line key={x} x1={x} y1={bodyY} x2={x} y2={legY} className="bb-leg" />
        ))}
        <path
          d={`M ${cx - 13} ${bodyY} a 13 13 0 0 1 26 0 v 3 h -26 Z`}
          fill="rgba(230,240,240,0.85)"
          stroke="rgba(0,0,0,0.3)"
          strokeWidth="1"
        />
        <circle cx={cx - 4} cy={bodyY - 4} r="3.2" fill="#e6413a" />
        <circle cx={cx + 4} cy={bodyY - 6} r="3.2" fill="#25a35a" />
        <circle cx={cx} cy={bodyY - 1} r="3.2" fill="#2f7fd1" />
      </g>
    ),
    anchors: {
      r: { x: xs[0], y: legY },
      common: { x: xs[1], y: legY },
      g: { x: xs[2], y: legY },
      b: { x: xs[3], y: legY },
    },
  };
}

function drawResistor(cx, part) {
  const legY = ROW.e;
  const bodyY = ROW.c;
  const ax = cx - 28;
  const bx = cx + 28;
  return {
    el: (
      <g>
        <line x1={ax} y1={legY} x2={ax} y2={bodyY} className="bb-leg" />
        <line x1={bx} y1={legY} x2={bx} y2={bodyY} className="bb-leg" />
        <line x1={ax} y1={bodyY} x2={bx} y2={bodyY} className="bb-leg" />
        <rect x={cx - 16} y={bodyY - 6} width="32" height="12" rx="5" fill="#d8c3a0" stroke="rgba(0,0,0,0.25)" strokeWidth="0.8" />
        {[-8, -3, 6].map((dx, k) => (
          <rect key={k} x={cx + dx} y={bodyY - 6} width="2.4" height="12" fill={['#8a5a2b', '#111', '#c02a2a'][k]} />
        ))}
        {part.label && (
          <text className="bb-part-label" x={cx} y={bodyY - 12} textAnchor="middle">
            {part.label}
          </text>
        )}
      </g>
    ),
    anchors: { a: { x: ax, y: legY }, b: { x: bx, y: legY } },
  };
}

function drawPhoto(cx) {
  const legY = ROW.e;
  const bodyY = ROW.c;
  const ax = cx - 12;
  const bx = cx + 12;
  return {
    el: (
      <g>
        <line x1={ax} y1={legY} x2={ax} y2={bodyY} className="bb-leg" />
        <line x1={bx} y1={legY} x2={bx} y2={bodyY} className="bb-leg" />
        <circle cx={cx} cy={bodyY} r="12" fill="#e9d9a6" stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
        <path d={`M ${cx - 8} ${bodyY + 4} q 4 -8 8 0 q 4 8 8 0`} fill="none" stroke="#9a7b3a" strokeWidth="1.4" />
      </g>
    ),
    anchors: { a: { x: ax, y: legY }, b: { x: bx, y: legY } },
  };
}

function drawButton(cx) {
  const legY = ROW.e;
  const top = ROW.b - 6;
  const ax = cx - 16;
  const bx = cx + 16;
  return {
    el: (
      <g>
        <line x1={ax} y1={top + 24} x2={ax} y2={legY} className="bb-leg" />
        <line x1={bx} y1={top + 24} x2={bx} y2={legY} className="bb-leg" />
        <rect x={cx - 17} y={top} width="34" height="26" rx="3" fill="#2b3038" stroke="rgba(0,0,0,0.4)" />
        <circle cx={cx} cy={top + 13} r="8" fill="#c9ced6" stroke="rgba(0,0,0,0.4)" />
      </g>
    ),
    anchors: { a: { x: ax, y: legY }, b: { x: bx, y: legY } },
  };
}

function drawPot(cx) {
  const legY = ROW.e;
  const bodyY = ROW.b + 4;
  const xs = [cx - 14, cx, cx + 14];
  return {
    el: (
      <g>
        {xs.map((x) => (
          <line key={x} x1={x} y1={bodyY + 10} x2={x} y2={legY} className="bb-leg" />
        ))}
        <rect x={cx - 18} y={bodyY - 14} width="36" height="26" rx="3" fill="#2f7fd1" stroke="rgba(0,0,0,0.35)" />
        <circle cx={cx} cy={bodyY - 1} r="9" fill="#dfe6ec" stroke="rgba(0,0,0,0.3)" />
        <line x1={cx} y1={bodyY - 1} x2={cx} y2={bodyY - 9} stroke="#2b3038" strokeWidth="1.6" />
      </g>
    ),
    anchors: { t1: { x: xs[0], y: legY }, wiper: { x: xs[1], y: legY }, t2: { x: xs[2], y: legY } },
  };
}

function drawBuzzer(cx) {
  const legY = ROW.e;
  const bodyY = ROW.b + 2;
  const px = cx - 7;
  const mx = cx + 7;
  return {
    el: (
      <g>
        <line x1={px} y1={bodyY + 14} x2={px} y2={legY} className="bb-leg" />
        <line x1={mx} y1={bodyY + 14} x2={mx} y2={legY} className="bb-leg" />
        <circle cx={cx} cy={bodyY} r="16" fill="#1c1f26" stroke="rgba(0,0,0,0.5)" />
        <circle cx={cx} cy={bodyY} r="3" fill="#3a4048" />
        <text className="bb-plus" x={cx - 7} y={bodyY - 5} textAnchor="middle">+</text>
      </g>
    ),
    anchors: { plus: { x: px, y: legY }, minus: { x: mx, y: legY } },
  };
}

function drawModule(cx, part) {
  const pins = part.pins ?? ['VCC', 'GND', 'SIG'];
  const w = moduleWidth(part);
  const top = BB.y + 58;
  const h = 60;
  const legY = ROW.f + 8; // modules sit in the lower strip
  const step = w / pins.length;
  const anchors = {};
  const pinEls = pins.map((name, k) => {
    const x = cx - w / 2 + step * (k + 0.5);
    anchors[name] = { x, y: legY };
    return (
      <g key={name}>
        <line x1={x} y1={top + h} x2={x} y2={legY} className="bb-leg" />
        <text className="bb-pin-label" x={x} y={top + h - 6} textAnchor="middle">
          {name}
        </text>
      </g>
    );
  });
  return {
    el: (
      <g>
        {pinEls}
        <rect x={cx - w / 2} y={top} width={w} height={h} rx="5" fill="#0f5b61" stroke="#083b3f" strokeWidth="1.4" />
        <rect x={cx - w / 2 + 4} y={top + 4} width={w - 8} height="14" rx="2" fill="rgba(255,255,255,0.06)" />
        <text className="bb-module-name" x={cx} y={top + 14} textAnchor="middle">
          {part.name}
        </text>
      </g>
    ),
    anchors,
  };
}

const RENDERERS = {
  led: drawLED,
  'rgb-led': drawRGB,
  resistor: drawResistor,
  photoresistor: drawPhoto,
  'push-button': drawButton,
  potentiometer: drawPot,
  buzzer: drawBuzzer,
  module: drawModule,
};

// ---- the Arduino block on the left, showing only the pins in use ----------
function ArduinoBlock({ pins, board = 'ARDUINO' }) {
  const x = 24;
  const w = 176;
  const top = 78;
  const rowStep = Math.min(30, (VB_H - top - 40) / Math.max(pins.length, 1));
  const h = Math.max(150, pins.length * rowStep + 46);
  const anchors = {};
  const pinEls = pins.map((p, k) => {
    const py = top + 40 + k * rowStep;
    anchors[p.id] = { x: x + w, y: py };
    return (
      <g key={p.id}>
        <text className="bb-ard-pin" x={x + w - 26} y={py + 3.4} textAnchor="end">
          {p.id}
        </text>
        <rect x={x + w - 18} y={py - 5} width="18" height="10" rx="1.5" fill={PIN_TINT[p.type] || '#cfa444'} />
      </g>
    );
  });
  return {
    el: (
      <g>
        <rect x={x} y={top} width={w} height={h} rx="8" fill="#063e42" stroke="#0a5257" strokeWidth="1.5" />
        <rect x={x} y={top} width={w} height="26" rx="8" fill="#0a5257" />
        <text className="bb-ard-title" x={x + 14} y={top + 17}>{board}</text>
        <circle cx={x + w - 16} cy={top + 13} r="3" fill="#14c3ca" />
        {pinEls}
      </g>
    ),
    anchors,
  };
}

// ---- a single jumper wire between two anchors -----------------------------
// The control points follow the dominant axis, so a rail drop reads as a clean
// vertical jumper and a signal run as a smooth horizontal one (no sideways bow).
function Wire({ from, to, color }) {
  if (!from || !to) return null;
  const c = WIRE[color] || WIRE.blk;
  const ddx = to.x - from.x;
  const ddy = to.y - from.y;
  let d;
  if (Math.abs(ddy) > Math.abs(ddx)) {
    const k = Math.max(18, Math.abs(ddy) * 0.4);
    d = `M ${from.x} ${from.y} C ${from.x} ${from.y + k}, ${to.x} ${to.y - k}, ${to.x} ${to.y}`;
  } else {
    const k = Math.max(30, Math.abs(ddx) * 0.4);
    d = `M ${from.x} ${from.y} C ${from.x + k} ${from.y}, ${to.x - k} ${to.y}, ${to.x} ${to.y}`;
  }
  return (
    <g>
      <path d={d} fill="none" stroke="rgba(0,0,0,0.28)" strokeWidth="4.6" strokeLinecap="round" />
      <path d={d} fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" />
      <circle cx={from.x} cy={from.y} r="2.6" fill={c} />
      <circle cx={to.x} cy={to.y} r="2.6" fill={c} />
    </g>
  );
}

// ---- the tan board itself (rails, hole grid, trench) ----------------------
function BoardBase() {
  const holes = [];
  const rows = [ROW.a, ROW.b, ROW.c, ROW.d, ROW.e, ROW.f, ROW.g, ROW.h, ROW.i, ROW.j];
  for (let ci = 0; ci < COLS; ci += 1) {
    for (const ry of rows) {
      holes.push(<rect key={`${ci}-${ry}`} x={colX(ci) - 1.6} y={ry - 1.6} width="3.2" height="3.2" rx="0.6" fill="rgba(0,0,0,0.34)" />);
    }
  }
  // rail holes (skip a gap every 5)
  const railDots = [];
  [ROW.railTopA, ROW.railTopB, ROW.railBotA, ROW.railBotB].forEach((ry) => {
    for (let ci = 1; ci < COLS - 1; ci += 1) {
      if (ci % 6 === 0) continue;
      railDots.push(<rect key={`r${ci}-${ry}`} x={colX(ci) - 1.4} y={ry - 1.4} width="2.8" height="2.8" rx="0.6" fill="rgba(0,0,0,0.3)" />);
    }
  });
  return (
    <g>
      <rect x={BB.x} y={BB.y} width={BB.w} height={BB.h} rx="10" fill="#e9d9b0" stroke="#c9b485" strokeWidth="1.5" />
      {/* power rail lines */}
      <line x1={COL0} y1={ROW.railTopA - 8} x2={COL1} y2={ROW.railTopA - 8} stroke={WIRE.red} strokeWidth="1.4" opacity="0.8" />
      <line x1={COL0} y1={ROW.railTopB + 8} x2={COL1} y2={ROW.railTopB + 8} stroke={WIRE.blu} strokeWidth="1.4" opacity="0.7" />
      <line x1={COL0} y1={ROW.railBotA - 8} x2={COL1} y2={ROW.railBotA - 8} stroke={WIRE.red} strokeWidth="1.4" opacity="0.8" />
      <line x1={COL0} y1={ROW.railBotB + 8} x2={COL1} y2={ROW.railBotB + 8} stroke={WIRE.blu} strokeWidth="1.4" opacity="0.7" />
      {/* centre trench */}
      <rect x={BB.x + 8} y={(ROW.e + ROW.f) / 2 - 6} width={BB.w - 16} height="12" rx="2" fill="rgba(0,0,0,0.09)" />
      {railDots}
      {holes}
    </g>
  );
}

// resolve an anchor ref like "D7" (arduino) or "d1.anode" (part pin)
function resolve(ref, ardAnchors, partAnchors) {
  if (ref in ardAnchors) return ardAnchors[ref];
  const dot = ref.indexOf('.');
  if (dot > -1) {
    const id = ref.slice(0, dot);
    const pin = ref.slice(dot + 1);
    return partAnchors[id]?.[pin];
  }
  return undefined;
}

function Breadboard({ spec }) {
  if (!spec) return null;
  const { pins = [], parts = [], wires = [], board = 'ARDUINO' } = spec;

  const ard = ArduinoBlock({ pins, board });

  // auto-place parts left→right across the breadboard's terminal area
  const gap = 26;
  const widths = parts.map((p) => (p.type === 'module' ? moduleWidth(p) : WIDTH_OF[p.type] ?? 48));
  const total = widths.reduce((s, w) => s + w, 0) + gap * Math.max(parts.length - 1, 0);
  const areaStart = BB.x + 40;
  const areaEnd = BB.x + BB.w - 32;
  const areaW = areaEnd - areaStart;
  const scale = total > areaW ? areaW / total : 1;
  let cursor = areaStart + (total < areaW ? (areaW - total) / 2 : 0);

  const partAnchors = {};
  const partEls = parts.map((p, idx) => {
    const w = widths[idx] * scale;
    const cx = cursor + w / 2;
    cursor += w + gap * scale;
    const render = RENDERERS[p.type] ?? drawModule;
    const { el, anchors } = render(cx, p);
    partAnchors[p.id ?? `${p.type}${idx}`] = anchors;
    return <g key={p.id ?? idx}>{el}</g>;
  });

  // Power/ground wiring goes to the breadboard's bottom rails — like a real
  // build — instead of every wire running back to one Arduino pin: each part's
  // pwr/gnd pin drops straight down to its rail, and the Arduino feeds that rail
  // once. Everything else (signals) stays a point-to-point jumper.
  const pinType = Object.fromEntries(pins.map((p) => [p.id, p.type]));
  const RAIL_Y = { pwr: ROW.railBotA - 8, gnd: ROW.railBotB + 8 };
  const RAIL_COLOR = { pwr: 'red', gnd: 'blk' };
  const railLeftX = COL0 + 4;

  const railEls = [];
  const signalEls = [];
  const feedsDone = new Set();

  wires.forEach((w, k) => {
    const railType =
      pinType[w.from] === 'pwr' || pinType[w.to] === 'pwr'
        ? 'pwr'
        : pinType[w.from] === 'gnd' || pinType[w.to] === 'gnd'
          ? 'gnd'
          : null;

    if (railType) {
      const pinIsFrom = pinType[w.from] === railType;
      const pinId = pinIsFrom ? w.from : w.to;
      const partA = resolve(pinIsFrom ? w.to : w.from, ard.anchors, partAnchors);
      if (!partA) return;
      const railY = RAIL_Y[railType];
      const color = RAIL_COLOR[railType];
      // the part's pin drops to the rail
      railEls.push(<Wire key={`d${k}`} from={partA} to={{ x: partA.x, y: railY }} color={color} />);
      // the Arduino feeds the rail once
      const feedKey = railType + pinId;
      if (!feedsDone.has(feedKey) && ard.anchors[pinId]) {
        feedsDone.add(feedKey);
        railEls.push(<Wire key={`f${feedKey}`} from={ard.anchors[pinId]} to={{ x: railLeftX, y: railY }} color={color} />);
      }
    } else {
      signalEls.push(
        <Wire
          key={`s${k}`}
          from={resolve(w.from, ard.anchors, partAnchors)}
          to={resolve(w.to, ard.anchors, partAnchors)}
          color={w.color}
        />
      );
    }
  });

  return (
    <svg
      className="breadboard"
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-hidden="true"
      focusable="false"
    >
      <BoardBase />
      {ard.el}
      {partEls}
      <g className="breadboard__wires">
        {railEls}
        {signalEls}
      </g>
    </svg>
  );
}

export default Breadboard;
