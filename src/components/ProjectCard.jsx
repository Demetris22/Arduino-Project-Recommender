// One project, drawn as a datasheet "plate" to match the board cards: a framed
// drawing well holding the generated parts-schematic (a figure), the title, then
// an always-on ruled titleblock band (build time · part count · difficulty
// gauge), and the concepts it teaches as drawing annotations. Reused across all
// three result sections; the optional `missing` (near-miss) and `reasons`
// (incompatible) props drive the extras. When `onOpen` is provided the whole
// card opens the build detail view.
import { formatTime } from '../lib/format.js';
import ProjectDiagram from './ProjectDiagram.jsx';

const LEVEL_FILL = { beginner: 1, intermediate: 2, advanced: 3 };

// The ruled titleblock band shared with the board cards: mono label over value.
// The LEVEL cell carries the three-square difficulty gauge in place of a value.
function Titleblock({ project, partCount }) {
  const fill = LEVEL_FILL[project.difficulty] ?? 1;
  return (
    <dl className="plate-titleblock">
      <div className="plate-titleblock__cell">
        <dt className="mono">TIME</dt>
        <dd className="mono">{formatTime(project.timeMinutes)}</dd>
      </div>
      <div className="plate-titleblock__cell">
        <dt className="mono">PARTS</dt>
        <dd className="mono">{partCount || '—'}</dd>
      </div>
      <div className={`plate-titleblock__cell is-level is-${project.difficulty}`}>
        <dt className="mono">LEVEL</dt>
        <dd>
          <span className="plate-gauge" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <i key={i} className={i < fill ? 'is-on' : ''} />
            ))}
          </span>
          <span className="sr-only">{project.difficulty}</span>
        </dd>
      </div>
    </dl>
  );
}

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

      {view === 'gallery' && (
        <div className="project-card__figure">
          <ProjectDiagram project={project} />
        </div>
      )}

      <header className="project-card__head">
        <h3 className="project-card__title">{project.title}</h3>
      </header>

      {view === 'gallery' && variant !== 'incompatible' && (
        <Titleblock project={project} partCount={partCount} />
      )}

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
