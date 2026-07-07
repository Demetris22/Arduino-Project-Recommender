// CoverSchematic — the key drawing on the cover sheet: a "complete kit" diagram
// (an Arduino Uno wired on a breadboard to an ultrasonic sensor, an LED and a
// servo) that inks itself in on load via motion's pathLength, then re-plots on a
// calm loop. Under prefers-reduced-motion it renders the finished diagram and
// doesn't animate. Decorative (aria-hidden); the real projects live in results.
import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

// Strokes ink themselves in along their own length; substrates/labels fade.
const DRAW = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { pathLength: { duration: 0.7, ease: [0.65, 0, 0.35, 1] }, opacity: { duration: 0.12 } },
  },
};
const FADE = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.35 } },
};
const CONTAINER = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.028, delayChildren: 0.08 } },
};

// A row of evenly spaced pin ticks, as one path (draws in one stroke).
function ticks(x0, y0, n, gap, len) {
  let d = '';
  for (let i = 0; i < n; i += 1) d += `M${(x0 + i * gap).toFixed(1)} ${y0} v${len} `;
  return d.trim();
}

// The whole kit. `animate` swaps motion elements (with draw/fade variants,
// orchestrated by the parent) for plain ones (rendered fully drawn).
function KitFigure({ animate }) {
  const P = animate ? motion.path : 'path';
  const R = animate ? motion.rect : 'rect';
  const C = animate ? motion.circle : 'circle';
  const T = animate ? motion.text : 'text';
  const draw = animate ? { variants: DRAW } : {};
  const fade = animate ? { variants: FADE } : {};
  const lbl = { className: 'cover-schem__label' };

  return (
    <>
      {/* substrates fade in first, then the wiring inks onto them */}
      <R {...fade} className="cover-schem__plate" x="14" y="104" width="178" height="118" rx="7" />
      <R {...fade} className="cover-schem__plate" x="206" y="120" width="148" height="96" rx="5" />
      <R {...fade} className="cover-schem__plate" x="212" y="18" width="90" height="50" rx="5" />
      <R {...fade} className="cover-schem__plate" x="362" y="116" width="58" height="54" rx="4" />

      {/* breadboard hole field */}
      <R {...fade} x="213" y="126" width="134" height="36" fill="url(#bbdots)" stroke="none" />
      <R {...fade} x="213" y="176" width="134" height="34" fill="url(#bbdots)" stroke="none" />

      {/* ---------- Arduino Uno ---------- */}
      <P {...draw} d="M2 120 h14 v26 h-14 z" />
      <P {...draw} d="M4 125 h8 v16 h-8" />
      <P {...draw} d="M2 158 h14 v20 h-14 z" />
      <C {...draw} cx="9" cy="168" r="4" />
      <P {...draw} d="M42 110 h140 v9 h-140 z" />
      <P {...draw} d={ticks(49, 110, 18, 7.4, 9)} />
      <P {...draw} d="M46 205 h128 v9 h-128 z" />
      <P {...draw} d={ticks(53, 205, 16, 7.4, 9)} />
      <P {...draw} d="M66 150 h58 v34 h-58 z" />
      <C {...draw} cx="70" cy="167" r="3" />
      <P
        {...draw}
        d="M66 156 h-4 M66 164 h-4 M66 172 h-4 M66 179 h-4 M124 156 h4 M124 164 h4 M124 172 h4 M124 179 h4"
      />
      <C {...draw} cx="176" cy="127" r="4" />
      <C {...draw} cx="26" cy="115" r="3" />
      <C {...draw} cx="180" cy="115" r="3" />
      <C {...draw} cx="26" cy="211" r="3" />
      <C {...draw} cx="180" cy="211" r="3" />
      <T {...fade} {...lbl} x="150" y="164" textAnchor="middle">ARDUINO</T>
      <T {...fade} className="cover-schem__label cover-schem__label--lg" x="150" y="180" textAnchor="middle">
        UNO
      </T>

      {/* breadboard trench */}
      <P {...draw} d="M210 166 h140 M210 172 h140" />

      {/* ---------- HC-SR04 ultrasonic ---------- */}
      <C {...draw} cx="238" cy="44" r="17" />
      <C {...draw} cx="238" cy="44" r="6" />
      <C {...draw} cx="278" cy="44" r="17" />
      <C {...draw} cx="278" cy="44" r="6" />
      <P {...draw} d={ticks(230, 68, 4, 9, 6)} />
      <T {...fade} {...lbl} x="257" y="13" textAnchor="middle">HC-SR04</T>

      {/* ---------- LED (accent) ---------- */}
      <P {...draw} className="cover-schem__accent" d="M326 50 v-6 q0 -13 10 -13 q10 0 10 13 v6 z" />
      <P {...draw} className="cover-schem__accent" d="M324 50 h24" />
      <P {...draw} className="cover-schem__accent" d="M330 50 v14 M342 50 v14" />
      <T {...fade} {...lbl} x="336" y="78" textAnchor="middle">LED</T>

      {/* ---------- Servo ---------- */}
      <P {...draw} d="M354 126 h8 v10 h-8 M428 126 h-8 v10 h8" />
      <C {...draw} cx="380" cy="112" r="9" />
      <C {...draw} cx="380" cy="112" r="2" />
      <P {...draw} className="cover-schem__accent" d="M380 112 v-14" />
      <T {...fade} {...lbl} x="391" y="150" textAnchor="middle">SERVO</T>

      {/* ---------- jumper wires (accent) ---------- */}
      <P {...draw} className="cover-schem__accent" d="M182 114 C198 108 202 130 212 135" />
      <P {...draw} className="cover-schem__accent" d="M258 126 C256 102 258 86 258 68" />
      <P {...draw} className="cover-schem__accent" d="M322 132 C332 112 336 92 336 64" />
      <P {...draw} className="cover-schem__accent" d="M354 156 C374 156 372 150 362 150" />
      <P {...draw} className="cover-schem__accent" d="M174 212 C192 216 200 200 212 198" />
    </>
  );
}

function CoverSchematic() {
  const reduce = useReducedMotion();
  const [pass, setPass] = useState(0);

  // Re-plot the diagram on a calm loop so the self-drawing "effect" recurs.
  useEffect(() => {
    if (reduce) return undefined;
    const id = setInterval(() => setPass((p) => p + 1), 11000);
    return () => clearInterval(id);
  }, [reduce]);

  return (
    <div className="cover-schem">
      <svg
        className="cover-schem__svg"
        viewBox="0 0 430 240"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <pattern id="bbdots" width="9" height="9" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="currentColor" stroke="none" opacity="0.28" />
          </pattern>
        </defs>

        {reduce ? (
          <g>
            <KitFigure animate={false} />
          </g>
        ) : (
          <AnimatePresence mode="wait">
            <motion.g
              key={pass}
              variants={CONTAINER}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, transition: { duration: 0.4 } }}
            >
              <KitFigure animate />
            </motion.g>
          </AnimatePresence>
        )}
      </svg>

      <p className="cover__figcaption mono" aria-hidden="true">
        FIG. 01 — COMPLETE KIT DIAGRAM
      </p>
    </div>
  );
}

export default CoverSchematic;
