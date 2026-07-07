// A large, faint "master draft" that lives on the drafting table behind the
// sheet — ghosted construction lines, a board outline under dimension callouts,
// a protractor arc, scattered part symbols and registration crosses. It turns
// the otherwise-empty gridded background into a believable engineer's desk.
// Purely decorative; rendered very faint and set slice-to-fill by CSS.

// Evenly spaced edge ruler ticks (top + left), major ticks every 5th, one path.
function edgeTicks() {
  let d = '';
  let i = 0;
  for (let x = 60; x <= 1540; x += 40, i += 1) d += `M${x} 0 v${i % 5 === 0 ? 15 : 8} `;
  i = 0;
  for (let y = 60; y <= 960; y += 40, i += 1) d += `M0 ${y} h${i % 5 === 0 ? 15 : 8} `;
  return d.trim();
}

// A run of header pins as one path.
function pins(x0, y, n, gap, len) {
  let d = '';
  for (let i = 0; i < n; i += 1) d += `M${x0 + i * gap} ${y} v${len} `;
  return d.trim();
}

function TableDraft() {
  return (
    <svg
      className="atmosphere__draft"
      viewBox="0 0 1600 1000"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {/* edge rulers */}
      <path d={edgeTicks()} strokeWidth="1.2" />

      {/* registration crosses scattered on the datum grid */}
      <g strokeWidth="1.4">
        <path d="M170 210 h22 M181 199 v22" />
        <path d="M1440 720 h22 M1451 709 v22" />
        <path d="M300 830 h22 M311 819 v22" />
        <path d="M1250 180 h22 M1261 169 v22" />
      </g>

      {/* protractor / compass sweep, top-right */}
      <g transform="translate(1360 150)">
        <path d="M-150 0 A150 150 0 0 1 0 -150" />
        <path d="M-116 0 A116 116 0 0 1 0 -116" strokeDasharray="2 8" />
        <path d="M0 0 -150 0 M0 0 0 -150 M0 0 -106 -106 M0 0 -57 -139 M0 0 -139 -57" strokeWidth="1.1" />
        <circle cx="0" cy="0" r="4" />
        <text className="atmosphere__draft-tag" x="-96" y="-96" transform="rotate(-45 -96 -96)">
          0—90°
        </text>
      </g>

      {/* large board outline under dimension callouts, lower band */}
      <g transform="translate(470 600)">
        <rect x="0" y="0" width="600" height="300" rx="14" />
        {/* pin headers */}
        <path d={pins(40, 0, 30, 18, 18)} strokeWidth="1.2" />
        <path d={pins(40, 300, 26, 18, -18)} strokeWidth="1.2" />
        {/* mcu */}
        <rect x="150" y="120" width="150" height="90" rx="4" />
        <path d="M150 138 h-10 M150 158 h-10 M150 178 h-10 M150 198 h-10 M300 138 h10 M300 158 h10 M300 178 h10 M300 198 h10" strokeWidth="1.1" />
        <circle cx="164" cy="134" r="4" />
        {/* usb + barrel */}
        <rect x="-24" y="60" width="24" height="46" rx="3" />
        <rect x="-24" y="150" width="24" height="40" rx="3" />
        {/* mounting holes */}
        <circle cx="30" cy="30" r="9" />
        <circle cx="570" cy="30" r="9" />
        <circle cx="30" cy="270" r="9" />
        <circle cx="570" cy="270" r="9" />
        <text className="atmosphere__draft-tag" x="360" y="180">
          ATmega328P
        </text>

        {/* dimension line below */}
        <path d="M0 340 h600 M0 332 v16 M600 332 v16" strokeWidth="1.1" />
        <path d="M12 340 l10 -5 M12 340 l10 5 M588 340 l-10 -5 M588 340 l-10 5" strokeWidth="1.1" />
        <text className="atmosphere__draft-tag" x="286" y="336">
          68.6
        </text>
        {/* dimension line right */}
        <path d="M636 0 v300 M628 0 h16 M628 300 h16" strokeWidth="1.1" />
        <text className="atmosphere__draft-tag" x="648" y="154">
          53.4
        </text>
      </g>

      {/* scattered part symbols */}
      <g strokeWidth="1.4">
        {/* resistor */}
        <g transform="translate(120 560)">
          <path d="M0 0 h14 l6 -9 l10 18 l10 -18 l10 18 l6 -9 h14" />
          <text className="atmosphere__draft-tag" x="30" y="-14" textAnchor="middle">R7</text>
        </g>
        {/* capacitor */}
        <g transform="translate(1360 470)">
          <path d="M0 0 h24 M24 -16 v32 M40 -16 v32 M40 0 h24" />
          <text className="atmosphere__draft-tag" x="32" y="-24" textAnchor="middle">C4</text>
        </g>
        {/* diode */}
        <g transform="translate(1120 470)">
          <path d="M0 0 h16 M16 -12 v24 l22 -12 z M38 -12 v24 M38 0 h16" />
        </g>
        {/* LED-ish emitter */}
        <g transform="translate(250 300)">
          <path d="M0 0 h16 M16 -12 v24 l22 -12 z M38 -12 v24 M38 0 h16 M24 -16 l8 -8 M30 -22 l-5 1 M30 -22 l1 5" />
        </g>
      </g>

      <text className="atmosphere__draft-tag" x="60" y="60">SCALE 1:2</text>
      <text className="atmosphere__draft-tag atmosphere__draft-tag--r" x="1540" y="988" textAnchor="end">
        DATUM A · REV C
      </text>
    </svg>
  );
}

export default TableDraft;
