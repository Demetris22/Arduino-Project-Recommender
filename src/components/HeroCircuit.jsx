// The living backdrop of the hero: a printed-circuit-board trace field with
// "current" pulses travelling along the copper. It is the one piece that makes
// the landing feel specific to *this* product — you are looking at a board.
//
// Purely decorative (aria-hidden). All motion is CSS and gated on
// prefers-reduced-motion in index.css, so this renders as a still PCB for users
// who ask for calm. pathLength=100 normalises the flow speed across traces of
// different real lengths.

// Orthogonal + 45° routing, hand-tuned for balance across a 1200×620 field and
// biased denser toward the right, where the board sits.
const TRACES = [
  [[-20, 110], [210, 110], [250, 150], [470, 150], [510, 110], [720, 110]],
  [[-20, 300], [150, 300], [190, 340], [430, 340]],
  [[-20, 470], [260, 470], [300, 430], [540, 430], [580, 470], [780, 470]],
  [[1220, 80], [1010, 80], [970, 120], [770, 120]],
  [[1220, 250], [1050, 250], [1010, 290], [840, 290], [800, 250], [640, 250]],
  [[1220, 440], [980, 440], [940, 400], [760, 400]],
  [[610, -20], [610, 70], [650, 110], [650, 250]],
  [[880, -20], [880, 90], [840, 130], [840, 300]],
  [[430, 640], [430, 540], [470, 500], [470, 360]],
  [[1010, 640], [1010, 520], [970, 480], [970, 330]],
];

// Which traces carry a travelling pulse, and how fast (seconds) / when (delay).
// Deliberately only right-side / centre traces (3,4,5,7,9): the left-hand traces
// (0,1,2) run behind the headline, and a bright pulse there reads as a stray
// mark rather than current. Current only flows toward the board.
const PULSES = [
  { i: 3, dur: 5.2, delay: 0 },
  { i: 4, dur: 6.4, delay: 1.1 },
  { i: 5, dur: 4.6, delay: 0.4 },
  { i: 7, dur: 5.8, delay: 2.2 },
  { i: 9, dur: 4.9, delay: 0.8 },
];

const toPath = (pts) => pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');

// Vias: the junctions where a trace changes direction, on-screen only. A few
// blink like activity LEDs.
const vias = [];
TRACES.forEach((trace, ti) => {
  trace.forEach((p, pi) => {
    if (pi === 0 || pi === trace.length - 1) return; // skip the run-offscreen ends
    if (p[0] < 8 || p[0] > 1192 || p[1] < 8 || p[1] > 612) return;
    vias.push({ x: p[0], y: p[1], live: (ti + pi) % 3 === 0, key: `${ti}-${pi}` });
  });
});

function HeroCircuit() {
  return (
    <svg
      className="herofx__pcb"
      viewBox="0 0 1200 620"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      {/* copper traces */}
      <g className="herofx__traces">
        {TRACES.map((t, i) => (
          <path key={i} className="herofx__trace" d={toPath(t)} />
        ))}
      </g>

      {/* vias */}
      <g className="herofx__vias">
        {vias.map((v) => (
          <circle
            key={v.key}
            className={`herofx__via${v.live ? ' herofx__via--live' : ''}`}
            cx={v.x}
            cy={v.y}
            r="3.4"
          />
        ))}
      </g>

      {/* travelling current */}
      <g className="herofx__pulses">
        {PULSES.map(({ i, dur, delay }) => (
          <path
            key={i}
            className="herofx__pulse"
            d={toPath(TRACES[i])}
            pathLength="100"
            style={{ '--dur': `${dur}s`, '--delay': `${delay}s` }}
          />
        ))}
      </g>
    </svg>
  );
}

export default HeroCircuit;
