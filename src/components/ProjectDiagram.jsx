// A one-line schematic generated from a project's required parts: the MCU on
// the left, each component drawn as its electronic symbol hung off a bus. Makes
// every gallery card a distinct little figure instead of a text box. Decorative
// (aria-hidden) — the parts are also listed in the build detail.
import components from '../data/components.json';

const BY_ID = new Map(components.map((c) => [c.id, c]));

// Map a component to a drawable symbol kind; infrastructure (breadboard,
// jumpers) is skipped — it isn't a signal element.
function kindOf(c) {
  if (!c) return null;
  if (c.id === 'led' || c.id === 'rgb-led') return 'led';
  if (c.id === 'resistor') return 'resistor';
  if (c.id === 'push-button') return 'switch';
  if (c.id === 'potentiometer') return 'pot';
  if (c.id === 'photoresistor') return 'ldr';
  if (c.id === 'buzzer') return 'buzzer';
  if (c.id === 'servo') return 'motor';
  if (c.category === 'display') return 'display';
  if (c.category === 'sensor') return 'sensor';
  if (c.category === 'infrastructure') return null;
  return 'sensor';
}

// Each symbol is drawn centered on (cx, cy), roughly a 22x18 footprint.
function symbol(kind, cx, cy) {
  switch (kind) {
    case 'led':
      return (
        <g>
          <path d={`M ${cx - 7} ${cy - 6} L ${cx - 7} ${cy + 6} L ${cx + 5} ${cy} Z`} />
          <path d={`M ${cx + 5} ${cy - 6} L ${cx + 5} ${cy + 6}`} />
          <path d={`M ${cx - 1} ${cy - 8} l 4 -4 M ${cx + 3} ${cy - 7} l 4 -4`} />
        </g>
      );
    case 'resistor':
      return <rect x={cx - 9} y={cy - 4} width="18" height="8" rx="1" />;
    case 'switch':
      return (
        <g>
          <circle cx={cx} cy={cy} r="6.5" />
          <circle cx={cx} cy={cy} r="1.6" className="pd-fill" />
        </g>
      );
    case 'pot':
      return (
        <g>
          <rect x={cx - 9} y={cy - 4} width="18" height="8" rx="1" />
          <path d={`M ${cx} ${cy - 9} L ${cx} ${cy - 4}`} />
          <path d={`M ${cx - 2} ${cy - 6} L ${cx} ${cy - 4} L ${cx + 2} ${cy - 6}`} />
        </g>
      );
    case 'ldr':
      return (
        <g>
          <circle cx={cx} cy={cy} r="7" />
          <path d={`M ${cx - 4} ${cy} l 8 0`} />
          <path d={`M ${cx - 11} ${cy - 8} l 4 3 M ${cx - 9} ${cy - 11} l 4 3`} />
        </g>
      );
    case 'buzzer':
      return <path d={`M ${cx - 8} ${cy + 4} A 8 8 0 0 1 ${cx + 8} ${cy + 4} Z`} />;
    case 'motor':
      return (
        <g>
          <circle cx={cx} cy={cy} r="8" />
          <text x={cx} y={cy + 3.2} textAnchor="middle">
            M
          </text>
        </g>
      );
    case 'display':
      return (
        <g>
          <rect x={cx - 10} y={cy - 7} width="20" height="14" rx="1" />
          <path d={`M ${cx - 6} ${cy - 2} l 12 0 M ${cx - 6} ${cy + 2} l 8 0`} />
        </g>
      );
    case 'sensor':
    default:
      return (
        <g>
          <rect x={cx - 9} y={cy - 7} width="18" height="14" rx="1" />
          <circle cx={cx} cy={cy} r="2.5" />
        </g>
      );
  }
}

function ProjectDiagram({ project }) {
  const parts = (project.requires ?? [])
    .map((id) => kindOf(BY_ID.get(id)))
    .filter(Boolean);

  if (parts.length === 0) return null;

  const shown = parts.slice(0, 4);
  const extra = parts.length - shown.length;

  const railY = 40;
  const cellW = 46;
  const mcuRight = 30;
  const firstCX = 62;
  const cx = (i) => firstCX + i * cellW;
  const lastCX = cx(shown.length - 1);
  const width = lastCX + 22 + (extra > 0 ? 20 : 0);

  return (
    <svg
      className="project-diagram"
      viewBox={`0 0 ${width} 56`}
      preserveAspectRatio="xMinYMid meet"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      {/* MCU */}
      <g strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="8" y={railY - 9} width="22" height="18" rx="2" />
        <path
          d={`M 13 ${railY - 9} v -3 M 19 ${railY - 9} v -3 M 25 ${railY - 9} v -3`}
        />
        <path
          d={`M 13 ${railY + 9} v 3 M 19 ${railY + 9} v 3 M 25 ${railY + 9} v 3`}
        />
      </g>

      {/* bus */}
      <path
        d={`M ${mcuRight} ${railY} H ${lastCX}`}
        strokeWidth="1.4"
        strokeLinecap="round"
      />

      {/* component taps */}
      <g strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        {shown.map((kind, i) => (
          <g key={i}>
            <path d={`M ${cx(i)} ${railY} V 25`} />
            {symbol(kind, cx(i), 16)}
          </g>
        ))}
      </g>

      {extra > 0 && (
        <text className="project-diagram__more" x={lastCX + 12} y={railY + 3.2}>
          +{extra}
        </text>
      )}
    </svg>
  );
}

export default ProjectDiagram;
