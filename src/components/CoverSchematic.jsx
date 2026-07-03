// CoverSchematic — the key drawing on the cover sheet. Each figure inks itself in
// (SVG stroke draw via motion's pathLength) and the plate cycles through a few
// builds — Blink an LED → Ultrasonic parking sensor → Servo sweep — with the FIG
// caption tracking along, to show the range of what Sketchef finds. Under
// prefers-reduced-motion it renders one finished figure and does not cycle.
// Decorative (aria-hidden); the real projects live in the results flow.
import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

// Strokes ink themselves in along their own length; plates/labels/details fade.
const DRAW = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { pathLength: { duration: 0.85, ease: [0.65, 0, 0.35, 1] }, opacity: { duration: 0.15 } },
  },
};
const FADE = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.35 } },
};
const CONTAINER = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.075, delayChildren: 0.1 } },
};

// The board edge motif shared by every figure: a rail on the left with two pads,
// the signal leaving the top pad (~48,62) and the return meeting the lower (~48,122).
const BOARD = [
  { x: 22, y: 44, width: 18, height: 96, rx: 3 },
  { x: 40, y: 58, width: 8, height: 8 },
  { x: 40, y: 118, width: 8, height: 8 },
];

const FIGURES = [
  {
    caption: 'FIG. 01 — BLINK AN LED',
    plates: BOARD,
    strokes: [
      { t: 'path', d: 'M48 62 H96' },
      { t: 'polyline', points: '96,62 104,54 112,70 120,54 128,70 136,54 144,70 150,62' },
      { t: 'path', d: 'M150 62 H196' },
      { t: 'path', d: 'M196 50 V74 L224 62 Z', className: 'cover-schem__accent' },
      { t: 'path', d: 'M224 50 V74', className: 'cover-schem__accent' },
      { t: 'path', d: 'M206 46 l8 -8 M214 38 l-5 1 M214 38 l1 5', className: 'cover-schem__accent' },
      { t: 'path', d: 'M214 52 l8 -8 M222 44 l-5 1 M222 44 l1 5', className: 'cover-schem__accent' },
      { t: 'path', d: 'M224 62 H286 V150 H48 V122' },
    ],
    labels: [
      { x: 52, y: 54, text: 'D9~' },
      { x: 123, y: 46, text: '220 Ω', anchor: 'middle' },
      { x: 210, y: 90, text: 'LED', anchor: 'middle' },
      { x: 52, y: 138, text: 'GND' },
    ],
  },
  {
    caption: 'FIG. 02 — ULTRASONIC PARKING SENSOR',
    plates: [...BOARD, { x: 196, y: 44, width: 96, height: 52, rx: 5 }],
    strokes: [
      { t: 'path', d: 'M48 62 H150 V54 H196' },
      { t: 'path', d: 'M48 122 H150 V86 H196' },
      { t: 'circle', cx: 222, cy: 70, r: 13 },
      { t: 'circle', cx: 266, cy: 70, r: 13 },
      { t: 'circle', cx: 222, cy: 70, r: 3.5 },
      { t: 'circle', cx: 266, cy: 70, r: 3.5 },
      { t: 'path', d: 'M300 52 A 26 26 0 0 1 300 88', className: 'cover-schem__accent' },
      { t: 'path', d: 'M308 44 A 38 38 0 0 1 308 96', className: 'cover-schem__accent' },
      { t: 'path', d: 'M316 36 A 50 50 0 0 1 316 104', className: 'cover-schem__accent' },
    ],
    labels: [
      { x: 244, y: 36, text: 'HC-SR04', anchor: 'middle' },
      { x: 92, y: 54, text: 'TRIG' },
      { x: 92, y: 114, text: 'ECHO' },
    ],
  },
  {
    caption: 'FIG. 03 — SERVO SWEEP',
    plates: [...BOARD, { x: 200, y: 74, width: 74, height: 46, rx: 5 }],
    strokes: [
      { t: 'path', d: 'M48 62 H150 V97 H200' },
      { t: 'circle', cx: 237, cy: 66, r: 10 },
      { t: 'circle', cx: 237, cy: 66, r: 2.5 },
      { t: 'path', d: 'M237 66 L270 48', className: 'cover-schem__accent' },
      { t: 'path', d: 'M205 66 v6 M269 66 v6', className: 'cover-schem__accent' },
    ],
    details: [
      { t: 'path', d: 'M205 66 A 32 32 0 0 1 269 66', className: 'cover-schem__accent cover-schem__sweep' },
    ],
    labels: [
      { x: 237, y: 30, text: '0–180°', anchor: 'middle' },
      { x: 92, y: 54, text: 'D9~' },
      { x: 237, y: 136, text: 'SERVO', anchor: 'middle' },
    ],
  },
];

function plateEl(p, key, animate) {
  return animate ? (
    <motion.rect key={key} className="cover-schem__plate" variants={FADE} {...p} />
  ) : (
    <rect key={key} className="cover-schem__plate" {...p} />
  );
}

function strokeEl(s, key, animate, variant) {
  const { t, className, ...attrs } = s;
  if (animate) {
    const MC = motion[t];
    return <MC key={key} className={className} variants={variant} fill="none" {...attrs} />;
  }
  const Tag = t;
  return <Tag key={key} className={className} fill="none" {...attrs} />;
}

function labelEl(l, key, animate) {
  const props = { className: 'cover-schem__label', x: l.x, y: l.y, textAnchor: l.anchor || 'start' };
  return animate ? (
    <motion.text key={key} variants={FADE} {...props}>
      {l.text}
    </motion.text>
  ) : (
    <text key={key} {...props}>
      {l.text}
    </text>
  );
}

function FigureContent({ fig, animate }) {
  return (
    <>
      {(fig.plates || []).map((p, i) => plateEl(p, `p${i}`, animate))}
      {(fig.details || []).map((d, i) => strokeEl(d, `d${i}`, animate, FADE))}
      {(fig.strokes || []).map((s, i) => strokeEl(s, `s${i}`, animate, DRAW))}
      {(fig.labels || []).map((l, i) => labelEl(l, `l${i}`, animate))}
    </>
  );
}

function CoverSchematic() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduce || FIGURES.length <= 1) return undefined;
    const id = setInterval(() => setIndex((i) => (i + 1) % FIGURES.length), 4600);
    return () => clearInterval(id);
  }, [reduce]);

  const fig = FIGURES[reduce ? 0 : index];

  return (
    <div className="cover-schem">
      <svg
        className="cover-schem__svg"
        viewBox="0 0 320 180"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        {reduce ? (
          <g>
            <FigureContent fig={fig} animate={false} />
          </g>
        ) : (
          <AnimatePresence mode="wait">
            <motion.g
              key={index}
              variants={CONTAINER}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, transition: { duration: 0.3 } }}
            >
              <FigureContent fig={fig} animate />
            </motion.g>
          </AnimatePresence>
        )}
      </svg>

      <p className="cover__figcaption mono" aria-hidden="true">
        {reduce ? (
          FIGURES[0].caption
        ) : (
          <AnimatePresence mode="wait">
            <motion.span
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {fig.caption}
            </motion.span>
          </AnimatePresence>
        )}
      </p>
    </div>
  );
}

export default CoverSchematic;
