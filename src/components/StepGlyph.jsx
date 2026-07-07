// Small line-art illustrations for the "how it works" steps on the cover sheet,
// drawn in the same blueprint stroke style as the key diagram. Decorative.
function StepGlyph({ name }) {
  const common = {
    className: 'sg',
    viewBox: '0 0 100 60',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
    focusable: 'false',
  };

  if (name === 'board') {
    // a mini Arduino board: USB, pin header, chip, mounting holes
    return (
      <svg {...common}>
        <rect x="12" y="13" width="76" height="35" rx="4" />
        <rect x="5" y="19" width="8" height="11" rx="1" />
        <path d="M22 13 h54 v5 h-54 z" />
        <path d="M27 13 v5 M33 13 v5 M39 13 v5 M45 13 v5 M51 13 v5 M57 13 v5 M63 13 v5 M69 13 v5" />
        <rect x="35" y="26" width="24" height="15" rx="1" />
        <path d="M40 41 v3 M46 41 v3 M52 41 v3" />
        <circle cx="18" cy="44" r="1.7" />
        <circle cx="83" cy="18" r="1.7" />
        <path className="sg-accent" d="M66 33 h16" />
      </svg>
    );
  }

  if (name === 'parts') {
    // a parts checklist: component + ticked box per row
    return (
      <svg {...common}>
        {/* LED */}
        <path d="M12 12 v-3 q0 -5 4 -5 q4 0 4 5 v3 z" />
        <path d="M10 12 h12" />
        <path d="M14 12 v4 M18 12 v4" />
        <path d="M34 9 h28" />
        <rect x="80" y="3" width="12" height="12" rx="2" />
        <path className="sg-accent" d="M83 9 l2.5 2.5 l4.5 -6" />
        {/* resistor */}
        <path d="M9 30 h3 l2 -5 l3 10 l3 -10 l3 10 l2 -5 h3" />
        <path d="M34 30 h28" />
        <rect x="80" y="24" width="12" height="12" rx="2" />
        <path className="sg-accent" d="M83 30 l2.5 2.5 l4.5 -6" />
        {/* sensor */}
        <rect x="9" y="44" width="16" height="12" rx="1" />
        <circle cx="17" cy="50" r="3.2" />
        <path d="M34 50 h28" />
        <rect x="80" y="44" width="12" height="12" rx="2" />
        <path className="sg-accent" d="M83 50 l2.5 2.5 l4.5 -6" />
      </svg>
    );
  }

  // 'deck': a stack of build cards, the front one showing code
  return (
    <svg {...common}>
      <rect x="30" y="8" width="46" height="38" rx="3" opacity="0.45" />
      <rect x="22" y="13" width="46" height="38" rx="3" opacity="0.7" />
      <rect x="14" y="18" width="50" height="34" rx="3" />
      <circle cx="20" cy="24" r="1.3" />
      <circle cx="25" cy="24" r="1.3" />
      <circle cx="30" cy="24" r="1.3" />
      <path d="M20 33 h24 M20 39 h28 M20 45 h16" />
      <path className="sg-accent" d="M50 31 l-4 5 l4 5 M58 31 l4 5 l-4 5 M56 30 l-4 12" />
    </svg>
  );
}

export default StepGlyph;
