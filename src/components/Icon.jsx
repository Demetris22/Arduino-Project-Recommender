// A tiny inline icon set so the UI speaks one visual language instead of
// leaning on OS emoji (which render differently on every platform and read as
// AI-generated filler). Geometry is Tabler-style: 24px grid, 1.75 stroke,
// round caps/joins, currentColor. Add a glyph here rather than dropping an
// emoji inline.
const PATHS = {
  // stopwatch-ish clock for build time
  timer: (
    <>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2.5 2" />
      <path d="M9 3h6" />
    </>
  ),
  // lightbulb for the "what to buy next" nudge
  bulb: (
    <>
      <path d="M9 18h6" />
      <path d="M10 21h4" />
      <path d="M12 3a6 6 0 0 0 -3.6 10.8c.5.4.9 1 1 1.7v.5h5.2v-.5c.1 -.7 .5 -1.3 1 -1.7A6 6 0 0 0 12 3z" />
    </>
  ),
  // lightning bolt for the strongest recommendation
  bolt: <path d="M13 3 4 14h7l-1 7 9 -11h-7z" />,
  // share-network nodes
  share: (
    <>
      <circle cx="6" cy="12" r="2.4" />
      <circle cx="18" cy="6" r="2.4" />
      <circle cx="18" cy="18" r="2.4" />
      <path d="M8.1 10.9 15.8 7.1" />
      <path d="M8.1 13.1 15.8 16.9" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21 16.2 16.2" />
    </>
  ),
  // funnel
  filter: <path d="M4 5h16l-6.5 8v6l-3 -2v-4z" />,
};

function Icon({ name, className, size = '1em', strokeWidth = 1.75 }) {
  const path = PATHS[name];
  if (!path) return null;
  return (
    <svg
      className={className ? `icon ${className}` : 'icon'}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {path}
    </svg>
  );
}

export default Icon;
