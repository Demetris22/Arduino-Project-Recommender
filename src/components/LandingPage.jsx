// The landing page, framed as the "cover sheet" of the drawing set — the title
// page at the front of a set of engineering blueprints. It carries the pitch, a
// key drawing that inks itself in and cycles through builds, a count-up of the
// catalog, a three-step index of how the tool works, and the button that opens
// the drawing set (the board/parts selection flow). Drafting annotations (a
// dimension line on the copy, a leader on the CTA) make it read as an annotated
// drawing rather than a marketing template. The whole sheet draws itself on load.
import CoverSchematic from './CoverSchematic.jsx';
import TextType from './TextType.jsx';
import SpotlightCard from './SpotlightCard.jsx';
import StarBorder from './StarBorder.jsx';

// The value word after "build" is typed out (TextType), cycling the phrases.
// Kept to similar lengths so each sits on a single line at the same size.
const WORDS = ['right now?', 'this weekend?', 'with your kit?', 'tonight?'];
// The widest phrase reserves the line height so cycling never reflows the title.
const LONGEST_WORD = WORDS.reduce((a, b) => (b.length > a.length ? b : a));

const STEPS = [
  { no: '01', title: 'Pick your board', help: 'Uno, Nano, Mega, ESP32 or Uno R4.' },
  { no: '02', title: 'Add the parts you own', help: 'LEDs, sensors, motors, displays and more.' },
  { no: '03', title: 'Get buildable projects', help: 'Flip a deck of builds, each with full instructions.' },
];

function LandingPage({ reduceMotion, onStart, onExample }) {
  return (
    <section className="cover" aria-labelledby="cover-title">
      <header className="cover__masthead">
        <span className="cover__brand">
          <img className="cover__logo" src="/favicon.svg" alt="" width="32" height="32" />
          <span className="cover__brandname">Sketchef</span>
        </span>
        <span className="cover__docref mono">DWG. 00 · COVER SHEET</span>
      </header>

      <div className="cover__hero">
        <div className="cover__copy">
          {/* left-gutter dimension annotation — the sheet's "measure" (wide only) */}
          <div className="cover__dim" aria-hidden="true">
            <svg className="cover__dim-line" viewBox="0 0 10 100" preserveAspectRatio="none">
              <path d="M5 0 V100 M0 0 H10 M0 100 H10" vectorEffect="non-scaling-stroke" fill="none" />
            </svg>
            <span className="cover__dim-label mono">TITLE</span>
          </div>

          <p className="cover__eyebrow mono">Arduino project finder</p>
          <h1
            id="cover-title"
            className="cover__title"
            aria-label="What can you build with the parts you already own?"
          >
            <span className="cover__title-lead" aria-hidden="true">
              What can you build
            </span>
            <span className="cover__type-slot">
              {/* invisible sizer holds the tallest phrase so the cycling word
                  never changes the title's height (no reflow / jitter) */}
              <span className="cover__type-sizer" aria-hidden="true">
                {LONGEST_WORD}
              </span>
              <span className="cover__type-anim">
                {reduceMotion ? (
                  <span className="cover__type" aria-hidden="true">
                    with your kit?
                  </span>
                ) : (
                  <TextType
                    as="span"
                    className="cover__type"
                    text={WORDS}
                    typingSpeed={70}
                    deletingSpeed={38}
                    pauseDuration={1800}
                    initialDelay={400}
                    showCursor
                    cursorCharacter="|"
                    cursorClassName="cover__type-cursor"
                    aria-hidden="true"
                  />
                )}
              </span>
            </span>
          </h1>
          <p className="cover__sub">
            Tell Sketchef the board and the parts you already own. It checks them against a catalog
            of builds and hands you a deck you can actually make — each with wiring, steps and code.
          </p>

          <div className="cover__actions">
            {reduceMotion ? (
              <button type="button" className="cover__cta" onClick={onStart}>
                Start building <span aria-hidden="true">→</span>
              </button>
            ) : (
              <StarBorder
                as="button"
                type="button"
                className="cover__cta-star"
                color="rgba(37, 99, 176, 0.9)"
                speed="7s"
                thickness={2}
                onClick={onStart}
              >
                Start building <span aria-hidden="true">→</span>
              </StarBorder>
            )}
            <button type="button" className="cover__ghost" onClick={onExample}>
              Try an example
            </button>
          </div>
          <p className="cover__callout mono" aria-hidden="true">
            <span className="cover__callout-line" />
            ≈ 2 min · no signup
          </p>
        </div>

        <div className="cover__figure" aria-hidden="true">
          <div className="cover__frame">
            <span className="cover__tick cover__tick--tl" />
            <span className="cover__tick cover__tick--tr" />
            <span className="cover__tick cover__tick--bl" />
            <span className="cover__tick cover__tick--br" />
            <CoverSchematic />
          </div>
        </div>
      </div>

      <ol className="cover__steps">
        {STEPS.map((step) => (
          <li className="cover__step-item" key={step.no}>
            <SpotlightCard className="cover__step">
              <span className="cover__stepno mono">{step.no}</span>
              <span className="cover__steptitle">{step.title}</span>
              <span className="cover__stephelp">{step.help}</span>
            </SpotlightCard>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default LandingPage;
