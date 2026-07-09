// A top-view render of an Arduino board, built to read as real hardware rather
// than a flat glyph: a soldermask plate with a glossy sheen and a silkscreen
// border, gold plated pin headers + castellated pads, plated mounting holes, a
// QFP-style MCU with gold leads and a pin-1 dimple, a metallic USB shell, and a
// silkscreen board name. Proportions, connector type, radio shield + antenna are
// chosen per board so a Nano reads small, a Mega long, an ESP32 like a radio
// module, an Uno R3 (USB-B) distinct from an R4 (USB-C + antenna).
//
// Each board keeps its own muted soldermask colour so the five read as distinct
// objects. Silkscreen ink is `currentColor` (set by the caller's screen); metals
// and gold use their own gradients. Purely decorative — the name + specs beside
// it carry the information, so the <svg> is aria-hidden.

const FRAME_W = 240;
const FRAME_H = 150;
const clamp = (n, lo, hi) => Math.max(lo, Math.min(n, hi));

function profileOf(board) {
  const s = `${board.name || ''} ${board.id || ''}`;
  if (/nano|micro|mini/i.test(s))
    return { w: 120, h: 58, usb: 'mini', barrel: false, headers: false, shield: false };
  if (/mega/i.test(s))
    return { w: 216, h: 84, usb: 'b', barrel: true, headers: true, shield: false };
  if (/esp32|esp8266|devkit|nodemcu|wemos|feather|xiao/i.test(s))
    return { w: 132, h: 80, usb: 'micro', barrel: false, headers: false, shield: true };
  if (/r4/i.test(s))
    return { w: 182, h: 84, usb: 'c', barrel: true, headers: false, shield: false };
  return { w: 182, h: 84, usb: 'b', barrel: true, headers: false, shield: false };
}

// A believable MCU part marking for the chip face — real silicon is stamped with
// a part number, not its supply voltage (that lives in the caption). Decorative,
// so an approximate family marking is fine.
function mcuOf(board) {
  const s = `${board.name || ''} ${board.id || ''}`.toLowerCase();
  if (/mega/.test(s)) return 'ATmega2560';
  if (/r4/.test(s)) return 'RA4M1';
  if (/nano|micro|mini/.test(s)) return 'ATmega328';
  return 'ATmega328P';
}

// Muted, field-tuned soldermask colours per board.
function paletteOf(board) {
  const s = `${board.name || ''} ${board.id || ''}`.toLowerCase();
  if (/esp32|esp8266|devkit|nodemcu|wemos|feather|xiao/.test(s))
    return { pcbA: '#333a45', pcbB: '#191d24', edge: '#0b0d12', silk: '#dbe2ea', shield: true };
  if (/nano|micro|mini/.test(s))
    return { pcbA: '#345d86', pcbB: '#1b3555', edge: '#0f1f33', silk: '#e0ecf9', shield: false };
  if (/r4/.test(s))
    return { pcbA: '#1c7c88', pcbB: '#0f4550', edge: '#082a31', silk: '#dcf1f1', shield: false };
  // uno / mega / default: classic muted Arduino teal
  return { pcbA: '#1f8079', pcbB: '#0f544f', edge: '#083330', silk: '#ddf1ec', shield: false };
}

// A dark header rail carrying gold pad contacts — the classic on-board pin
// header, far richer than a comb of stubs.
function headerRow(x0, x1, y, count, uid, key) {
  const n = clamp(count || 0, 1, 22);
  const step = (x1 - x0) / n;
  const w = Math.min(step * 0.46, 3.6);
  const gold = `url(#g-gold-${uid})`;
  const pads = [];
  for (let i = 0; i < n; i += 1) {
    const cx = x0 + step * (i + 0.5);
    pads.push(
      <rect key={i} x={+(cx - w / 2).toFixed(1)} y={y - 3} width={+w.toFixed(1)} height="6" rx="0.8" fill={gold} />
    );
  }
  return (
    <g key={key}>
      <rect x={x0 - 3} y={y - 4.5} width={x1 - x0 + 6} height="9" rx="2" fill="#0c0f14" opacity="0.92" />
      {pads}
    </g>
  );
}

// QFP-style leads on all four sides of the MCU.
function chipPins(icX, icY, icW, icH, uid) {
  const gold = `url(#g-gold-${uid})`;
  const pins = [];
  const nS = 5;
  for (let i = 0; i < nS; i += 1) {
    const y = +(icY + (icH * (i + 1)) / (nS + 1)).toFixed(1);
    pins.push(<rect key={`l${i}`} x={icX - 4.5} y={y - 1} width="4.5" height="2" rx="0.6" fill={gold} />);
    pins.push(<rect key={`r${i}`} x={icX + icW} y={y - 1} width="4.5" height="2" rx="0.6" fill={gold} />);
  }
  const nTB = 4;
  for (let i = 0; i < nTB; i += 1) {
    const x = +(icX + (icW * (i + 1)) / (nTB + 1)).toFixed(1);
    pins.push(<rect key={`t${i}`} x={x - 1} y={icY - 4.5} width="2" height="4.5" rx="0.6" fill={gold} />);
    pins.push(<rect key={`b${i}`} x={x - 1} y={icY + icH} width="2" height="4.5" rx="0.6" fill={gold} />);
  }
  return pins;
}

// Metallic USB shell, drawn to type. Tucks under the left plate edge.
function usbShape(type, x, yMid, uid) {
  const metal = `url(#g-metal-${uid})`;
  if (type === 'b') {
    return (
      <g>
        <rect x={x - 15} y={yMid - 11} width="17" height="22" rx="1.5" fill={metal} stroke="#5f6a76" strokeWidth="0.8" />
        <rect x={x - 11.5} y={yMid - 7.5} width="10" height="15" rx="1" fill="#20262e" />
        <rect x={x - 15} y={yMid - 11} width="17" height="4" rx="1.5" fill="#e6ecf1" opacity="0.5" />
      </g>
    );
  }
  if (type === 'c') {
    return (
      <g>
        <rect x={x - 12} y={yMid - 7} width="14" height="14" rx="7" fill={metal} stroke="#5f6a76" strokeWidth="0.8" />
        <rect x={x - 8.5} y={yMid - 3} width="8" height="6" rx="3" fill="#20262e" />
      </g>
    );
  }
  return (
    <g>
      <path
        d={`M ${x + 2} ${yMid - 5.5} L ${x - 9} ${yMid - 5.5} L ${x - 10.5} ${yMid - 4} L ${x - 10.5} ${yMid + 4} L ${x - 9} ${yMid + 5.5} L ${x + 2} ${yMid + 5.5} Z`}
        fill={metal}
        stroke="#5f6a76"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
      <rect x={x - 8} y={yMid - 2.5} width="7" height="5" rx="1" fill="#20262e" />
    </g>
  );
}

function BoardGlyph({ board }) {
  const f = profileOf(board);
  const c = paletteOf(board);
  const uid = String(board.id || board.name || 'b').replace(/[^a-z0-9]/gi, '');
  const pw = f.w;
  const ph = f.h;
  const px = Math.round((FRAME_W - pw) / 2);
  const py = Math.round((FRAME_H - ph) / 2);
  const wireless = board.features?.includes('wifi') || board.features?.includes('bluetooth');

  const midY = py + ph / 2;
  const usbY = f.barrel ? midY - 12 : midY;
  const barrelY = midY + 3;

  const icW = Math.round(clamp(pw * 0.32, 34, 58));
  const icH = Math.round(clamp(ph * 0.4, 22, 34));
  const icX = Math.round(FRAME_W / 2 - icW / 2);
  const icY = Math.round(midY - icH / 2);

  const rx = px + pw + 2;
  const antenna = `M ${rx} ${py + 16} L ${rx} ${py + 8} L ${rx + 7} ${py + 8} L ${rx + 7} ${py} L ${rx + 14} ${py} L ${rx + 14} ${py + 8}`;

  const hInset = 22;
  const shortName = (board.name || '').replace(/^Arduino\s+/i, '').toUpperCase();
  const showSilk = ph >= 66;

  // Tight viewBox around the actual hardware (plate + connectors + antenna), so
  // the board fills its box instead of floating inside ~100px of dead margin.
  const vbX = px - 18;
  const vbY = py - 6;
  const vbW = pw + 18 + (wireless ? 20 : 6);
  const vbH = ph + 12;

  return (
    <svg
      className="board-glyph"
      viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
      style={{ color: c.silk }}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {/* soldermask body */}
        <linearGradient id={`g-plate-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c.pcbA} />
          <stop offset="1" stopColor={c.pcbB} />
        </linearGradient>
        {/* glossy soldermask sheen (diagonal) */}
        <linearGradient id={`g-sheen-${uid}`} x1="0" y1="0" x2="0.7" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.16" />
          <stop offset="0.4" stopColor="#ffffff" stopOpacity="0.03" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        {/* gold plating */}
        <linearGradient id={`g-gold-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f0d488" />
          <stop offset="0.5" stopColor="#cfa444" />
          <stop offset="1" stopColor="#a97f2c" />
        </linearGradient>
        {/* brushed metal (USB shells, RF can) */}
        <linearGradient id={`g-metal-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e0e6ec" />
          <stop offset="0.5" stopColor="#aeb8c2" />
          <stop offset="1" stopColor="#828d99" />
        </linearGradient>
        {/* chip package sheen */}
        <linearGradient id={`g-chip-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a3038" />
          <stop offset="0.5" stopColor="#12161c" />
          <stop offset="1" stopColor="#080a0e" />
        </linearGradient>
      </defs>

      {/* under-plate connectors (tuck beneath the left edge) */}
      {usbShape(f.usb, px, usbY, uid)}
      {f.barrel && (
        <g>
          <rect x={px - 14} y={barrelY} width="14" height="16" rx="2" fill="#1a1f26" stroke="#3a424c" strokeWidth="0.8" />
          <circle cx={px - 7} cy={barrelY + 8} r="3.4" fill="#0a0d11" />
          <circle cx={px - 7} cy={barrelY + 8} r="1.5" fill="#3a424c" />
        </g>
      )}

      {/* the PCB plate */}
      <rect
        className="board-glyph__plate"
        x={px}
        y={py}
        width={pw}
        height={ph}
        rx="7"
        fill={`url(#g-plate-${uid})`}
        stroke={c.edge}
        strokeWidth="1.4"
      />
      {/* soldermask sheen + silkscreen border */}
      <rect x={px} y={py} width={pw} height={ph} rx="7" fill={`url(#g-sheen-${uid})`} pointerEvents="none" />
      <rect
        x={px + 4.5}
        y={py + 4.5}
        width={pw - 9}
        height={ph - 9}
        rx="4"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.8"
        opacity="0.22"
      />

      {/* gold pin headers along the long edges */}
      {headerRow(px + hInset, px + pw - hInset, py + 7, board.digitalPins, uid, 'top')}
      {headerRow(px + hInset, px + pw - hInset, py + ph - 7, board.analogPins, uid, 'bot')}

      {/* Mega end-header block */}
      {f.headers && (
        <g>
          <rect x={px + pw - 11} y={py + hInset} width="9" height={ph - 2 * hInset} rx="2" fill="#0c0f14" opacity="0.92" />
          {Array.from({ length: 8 }).map((_, i) => {
            const y = py + hInset + ((ph - 2 * hInset) * (i + 0.5)) / 8;
            return <rect key={i} x={px + pw - 9} y={+(y - 1.8).toFixed(1)} width="6" height="3.6" rx="0.8" fill={`url(#g-gold-${uid})`} />;
          })}
        </g>
      )}

      {/* plated mounting holes */}
      {[
        [px + 9, py + 9],
        [px + pw - 9, py + 9],
        [px + 9, py + ph - 9],
        [px + pw - 9, py + ph - 9],
      ].map(([cx, cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="3" fill={`url(#g-gold-${uid})`} />
          <circle cx={cx} cy={cy} r="1.4" fill={c.edge} />
        </g>
      ))}

      {/* silkscreen board name */}
      {showSilk && (
        <text className="board-glyph__silk" x={FRAME_W / 2} y={icY - 6} textAnchor="middle">
          {shortName}
        </text>
      )}

      {/* centre: RF shield (ESP32) or the MCU */}
      {f.shield ? (
        <g>
          <rect x={FRAME_W / 2 - 36} y={py + 14} width="72" height={ph - 40} rx="2.5" fill={`url(#g-metal-${uid})`} stroke="#69737f" strokeWidth="1" />
          <g stroke="#7c8792" strokeWidth="0.7" opacity="0.7">
            <line x1={FRAME_W / 2 - 36} y1={py + 21} x2={FRAME_W / 2 + 36} y2={py + 21} />
            <line x1={FRAME_W / 2 - 24} y1={py + 14} x2={FRAME_W / 2 - 24} y2={py + ph - 26} />
            <line x1={FRAME_W / 2 + 12} y1={py + 14} x2={FRAME_W / 2 + 12} y2={py + ph - 26} />
          </g>
          <text className="board-glyph__shield-label" x={FRAME_W / 2} y={py + 14 + (ph - 40) / 2 + 3.5} textAnchor="middle">
            ESP32
          </text>
        </g>
      ) : (
        <g>
          {chipPins(icX, icY, icW, icH, uid)}
          <rect x={icX} y={icY} width={icW} height={icH} rx="2.5" fill={`url(#g-chip-${uid})`} stroke="#04070b" strokeWidth="1" />
          {/* top sheen band on the package */}
          <rect x={icX + 1.5} y={icY + 1.5} width={icW - 3} height={icH * 0.34} rx="1.5" fill="#ffffff" opacity="0.06" />
          {/* pin-1 dimple */}
          <circle cx={icX + 6} cy={icY + 6} r="1.9" fill="none" stroke="#8ea0ad" strokeWidth="1" opacity="0.7" />
          <text className="board-glyph__label" x={FRAME_W / 2} y={icY + icH / 2 + 2.1} textAnchor="middle">
            {mcuOf(board)}
          </text>
        </g>
      )}

      {/* a couple of silkscreen vias for texture */}
      <g fill={`url(#g-gold-${uid})`} opacity="0.85">
        <circle cx={icX - 14} cy={midY + (f.shield ? 0 : 12)} r="1.5" />
        <circle cx={icX + icW + 14} cy={midY - (f.shield ? 0 : 12)} r="1.5" />
      </g>

      {/* PCB antenna for wireless boards */}
      {wireless && (
        <path d={antenna} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
      )}
    </svg>
  );
}

export default BoardGlyph;
