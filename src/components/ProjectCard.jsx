// One project. Reused across all three result sections; the optional
// `missing` (near-miss) and `reasons` (incompatible) props drive the extras.
// When `onOpen` is provided the whole card becomes a clickable button that
// opens the build-instructions detail view (buildable + near-miss only).
import { formatTime } from '../lib/format.js';
import Icon from './Icon.jsx';

function ProjectCard({ project, missing, reasons, variant, index = 0, onOpen }) {
  const clickable = typeof onOpen === 'function';

  // Keyboard activation for the role="button" card.
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onOpen(project);
    }
  };

  const interactiveProps = clickable
    ? {
        role: 'button',
        tabIndex: 0,
        onClick: () => onOpen(project),
        onKeyDown: handleKeyDown,
        'aria-label': `View build instructions for ${project.title}`,
      }
    : {};

  return (
    <article
      className={`project-card project-card--${variant}${
        clickable ? ' is-clickable' : ''
      }`}
      style={{ '--stagger': index }}
      data-difficulty={project.difficulty}
      data-flip-id={project.id}
      {...interactiveProps}
    >
      <header className="project-card__head">
        <h3 className="project-card__title">{project.title}</h3>
        <span className={`badge badge--${project.difficulty}`}>
          {project.difficulty}
        </span>
      </header>

      <p className="project-card__time">
        <Icon name="timer" className="project-card__time-icon" />
        <span className="mono">{formatTime(project.timeMinutes)}</span>
      </p>

      {project.learn?.length > 0 && (
        <ul className="learn-tags" aria-label="What you'll learn">
          {project.learn.map((topic) => (
            <li key={topic} className="learn-tag mono">
              {topic}
            </li>
          ))}
        </ul>
      )}

      {missing?.length > 0 && (
        <div className="missing-callout">
          <span className="missing-callout__label" aria-hidden="true">
            <span className="missing-callout__plus">+</span> Add
          </span>
          <span className="missing-callout__items">
            {missing.map((c) => c.name).join(', ')}
          </span>
        </div>
      )}

      {reasons?.length > 0 && (
        <ul className="reasons" aria-label="Why it's incompatible">
          {reasons.map((reason) => (
            <li key={reason} className="reason">
              {reason}
            </li>
          ))}
        </ul>
      )}

      {clickable ? (
        // Inline affordance instead of a nested <a> (avoids interactive
        // nesting inside the role="button" card); the full tutorial link
        // lives in the detail view.
        <span className="project-card__cta" aria-hidden="true">
          View build →
        </span>
      ) : project.tutorialUrl ? (
        <a
          className="tutorial-link"
          href={project.tutorialUrl}
          target="_blank"
          rel="noreferrer noopener"
        >
          Tutorial →
        </a>
      ) : null}
    </article>
  );
}

export default ProjectCard;
