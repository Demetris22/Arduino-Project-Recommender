// The canonical first Arduino build — a pin driving an LED through a current-
// limiting resistor back to ground — drawn in the blueprint line style with a
// pulse of current tracing the loop. Sits beside the hero on wide screens.
// Decorative, so the whole figure is aria-hidden.
function HeroSchematic() {
  return (
    <svg
      className="hero__figure"
      viewBox="0 0 320 200"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      {/* board edge with two labelled pads */}
      <g strokeWidth="1.6" strokeLinejoin="round">
        <rect
          x="16"
          y="48"
          width="18"
          height="112"
          rx="2"
          className="hero-schem__board"
        />
        <rect x="34" y="60" width="8" height="8" className="hero-schem__board" />
        <rect x="34" y="146" width="8" height="8" className="hero-schem__board" />
      </g>

      {/* wires */}
      <g strokeWidth="1.6" strokeLinecap="round">
        <path d="M42 64 H84" />
        <path d="M146 64 H196" />
        <path d="M226 64 H270 V150 H42" />
      </g>

      {/* resistor */}
      <polyline
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
        points="84,64 92,56 100,72 108,56 116,72 124,56 132,72 140,56 146,64"
      />

      {/* LED: triangle + cathode bar + emission arrows */}
      <g strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round">
        <path d="M198 52 L198 76 L226 64 Z" />
        <path d="M226 52 V76" />
        <path d="M208 50 L216 42" />
        <path d="M216 42 L211 43 M216 42 L215 47" />
        <path d="M214 55 L222 47" />
        <path d="M222 47 L217 48 M222 47 L221 52" />
      </g>

      {/* the current pulse travels the loop, tracing the real conductor —
          through the resistor's teeth and past the LED (pathLength
          normalised to 100 so the pulse timing is unaffected by the detour) */}
      <path
        className="hero-schem__flow"
        d="M42 64 H84 L92 56 L100 72 L108 56 L116 72 L124 56 L132 72 L140 56 L146 64 H270 V150 H42"
        pathLength="100"
      />

      {/* annotations */}
      <text className="hero__figure-label" x="52" y="56">
        D9~
      </text>
      <text className="hero__figure-label" x="115" y="48" textAnchor="middle">
        220 Ω
      </text>
      <text className="hero__figure-label" x="212" y="86" textAnchor="middle">
        LED
      </text>
      <text className="hero__figure-label" x="52" y="168">
        GND
      </text>
    </svg>
  );
}

export default HeroSchematic;
