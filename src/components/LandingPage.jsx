// The landing page, framed as the "cover sheet" of the drawing set — the title
// page at the front of a set of engineering blueprints. It carries the pitch, a
// key drawing that inks itself in and cycles through builds, a count-up of the
// catalog, a three-step index of how the tool works, and the button that opens
// the drawing set (the board/parts selection flow). Drafting annotations (a
// dimension line on the copy, a leader on the CTA) make it read as an annotated
// drawing rather than a marketing template. The whole sheet draws itself on load.
import CoverSchematic from './CoverSchematic.jsx';
import SpotlightCard from './SpotlightCard.jsx';
import StarBorder from './StarBorder.jsx';
import StepGlyph from './StepGlyph.jsx';

const STEPS = [
  { no: '01', glyph: 'board', title: 'Pick your board', help: 'Uno, Nano, Mega, ESP32 or Uno R4.' },
  { no: '02', glyph: 'parts', title: 'Add the parts you own', help: 'LEDs, sensors, motors, displays and more.' },
  { no: '03', glyph: 'deck', title: 'Get buildable projects', help: 'The projects you can build now — each with wiring, steps and code.' },
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
          <h1 id="cover-title" className="cover__title">
            What can you build{' '}
            <span className="cover__type">with your kit?</span>
          </h1>
          <p className="cover__sub">
            Sketchef finds Arduino projects for the exact kit you own — each with wiring, steps and
            code.
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
                color="rgba(133, 228, 245, 0.95)"
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
              <span className="cover__step-top">
                <span className="cover__stepno mono">{step.no}</span>
                <span className="cover__step-glyph" aria-hidden="true">
                  <StepGlyph name={step.glyph} />
                </span>
              </span>
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
