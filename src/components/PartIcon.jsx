// A tiny schematic symbol for a component, shown on its chip so the parts picker
// reads as a set of drafting symbols rather than a generic list. Decorative;
// inherits color from the chip (its category hue).
function iconKind(c) {
  switch (c.id) {
    case 'led':
    case 'rgb-led':
      return 'led';
    case 'resistor':
      return 'resistor';
    case 'push-button':
      return 'switch';
    case 'potentiometer':
      return 'pot';
    case 'photoresistor':
      return 'ldr';
    case 'buzzer':
      return 'buzzer';
    case 'servo':
      return 'motor';
    case 'breadboard':
      return 'breadboard';
    case 'jumper-wires':
      return 'wire';
    default:
      break;
  }
  if (c.category === 'display') return 'display';
  if (c.category === 'input') return 'switch';
  if (c.category === 'actuator') return 'motor';
  if (c.category === 'infrastructure') return 'wire';
  return 'sensor';
}

function shape(kind) {
  switch (kind) {
    case 'led':
      return (
        <>
          <path d="M7 6 V18 L17 12 Z" />
          <path d="M17 6 V18" />
          <path d="M10 5 l3 -3 M11.5 6 l3 -3" />
        </>
      );
    case 'resistor':
      return <path d="M2 12 h3 l1.5 -4 l3 8 l3 -8 l3 8 l1.5 -4 h3" />;
    case 'switch':
      return (
        <>
          <path d="M3 16 h6 M15 16 h6 M9 16 L16 9" />
          <circle cx="9" cy="16" r="1.3" />
          <circle cx="15" cy="16" r="1.3" />
        </>
      );
    case 'pot':
      return (
        <>
          <rect x="4" y="10" width="16" height="6" rx="1" />
          <path d="M12 3 v6 M10 7 l2 2 l2 -2" />
        </>
      );
    case 'ldr':
      return (
        <>
          <circle cx="13" cy="13" r="6.5" />
          <path d="M10 13 h6" />
          <path d="M3 5 l4 2 M3 5 l0 3.2 M3 5 l3.2 0" />
        </>
      );
    case 'buzzer':
      return (
        <>
          <path d="M5 9 h4 l4 -3 v12 l-4 -3 h-4 z" />
          <path d="M16 8 a5 5 0 0 1 0 8" />
        </>
      );
    case 'motor':
      return (
        <>
          <circle cx="12" cy="12" r="8" />
          <path d="M9 15 l1.6 -6 l1.4 4 l1.4 -4 l1.6 6" />
        </>
      );
    case 'display':
      return (
        <>
          <rect x="3" y="6" width="18" height="12" rx="1.5" />
          <path d="M6 10 h9 M6 13.5 h6" />
        </>
      );
    case 'breadboard':
      return (
        <>
          <rect x="3" y="6" width="18" height="12" rx="1.5" />
          <path
            d="M7 10 h.01 M10 10 h.01 M13 10 h.01 M16 10 h.01 M7 14 h.01 M10 14 h.01 M13 14 h.01 M16 14 h.01"
            strokeWidth="2.2"
          />
        </>
      );
    case 'wire':
      return (
        <>
          <path d="M4 16 C8 6 16 18 20 8" />
          <circle cx="4" cy="16" r="1.3" />
          <circle cx="20" cy="8" r="1.3" />
        </>
      );
    case 'sensor':
    default:
      return (
        <>
          <rect x="4" y="6" width="16" height="12" rx="1.5" />
          <circle cx="12" cy="12" r="2.4" />
        </>
      );
  }
}

function PartIcon({ component }) {
  return (
    <svg
      className="part-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {shape(iconKind(component))}
    </svg>
  );
}

export default PartIcon;
