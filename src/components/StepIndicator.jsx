// Lightweight 1·2·3 progress marker shown during the intake steps so the user
// can see where they are on a finite path. Purely presentational.
const STEPS = [
  { n: 1, label: 'Board' },
  { n: 2, label: 'Parts' },
  { n: 3, label: 'Build' },
];

function StepIndicator({ current }) {
  return (
    <ol className="step-indicator" aria-label={`Step ${current} of ${STEPS.length}`}>
      {STEPS.map(({ n, label }) => {
        const state = n < current ? 'done' : n === current ? 'current' : 'todo';
        return (
          <li
            key={n}
            className={`step-indicator__item is-${state}`}
            aria-current={n === current ? 'step' : undefined}
          >
            <span className="step-indicator__dot" aria-hidden="true">
              {state === 'done' ? '✓' : n}
            </span>
            <span className="step-indicator__label">{label}</span>
          </li>
        );
      })}
    </ol>
  );
}

export default StepIndicator;
