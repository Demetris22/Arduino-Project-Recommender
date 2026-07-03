// One project, drawn as a spec "plate": a title-block header with a difficulty
// gauge, a mono meta line (build time + part count), and the concepts it
// teaches as drawing annotations. Reused across all three result sections; the
// optional `missing` (near-miss) and `reasons` (incompatible) props drive the
// extras. When `onOpen` is provided the whole card opens the build detail view.
import { formatTime } from '../lib/format.js';
import Icon from './Icon.jsx';
import DifficultyStamp from './DifficultyStamp.jsx';
import ProjectDiagram from './ProjectDiagram.jsx';

function ProjectCard({
  project,
  missing,
  reasons,
  variant,
  index = 0,
  view = 'gallery',
  onOpen,
}) {
  const clickable = typeof onOpen === 'function';
  const partCount = project.requires?.length ?? 0;

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
      }${view === 'index' ? ' project-card--index' : ''}`}
      style={{ '--stagger': index }}
      data-difficulty={project.difficulty}
      data-flip-id={project.id}
      {...interactiveProps}
    >
      {variant === 'incompatible' && (
        <span className="void-stamp" aria-hidden="true">
          Out of spec
        </span>
      )}

      {view === 'gallery' && <ProjectDiagram project={project} />}

      <header className="project-card__head">
        <h3 className="project-card__title">{project.title}</h3>
        <DifficultyStamp level={project.difficulty} />
      </header>

      <p className="project-card__meta">
        <span className="project-card__metaitem">
          <Icon name="timer" className="project-card__time-icon" />
          <span className="mono">{formatTime(project.timeMinutes)}</span>
        </span>
        {partCount > 0 && (
          <span className="project-card__metaitem mono">
            {partCount} {partCount === 1 ? 'part' : 'parts'}
          </span>
        )}
      </p>

      {project.learn?.length > 0 && (
        <div className="project-card__concepts">
          <span className="project-card__concepts-label">Teaches</span>
          <ul className="learn-tags" aria-label="What you'll learn">
            {project.learn.map((topic) => (
              <li key={topic} className="learn-tag mono">
                {topic}
              </li>
            ))}
          </ul>
        </div>
      )}

      {missing?.length > 0 && (
        <div className="missing-callout">
          <span className="missing-callout__tag">Incomplete</span>
          <span className="missing-callout__needs">
            <span className="missing-callout__needs-key">needs</span>{' '}
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
      ) : variant !== 'incompatible' && project.tutorialUrl ? (
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
