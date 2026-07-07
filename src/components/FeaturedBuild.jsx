// The recommended first build, rendered LARGE as the focal hero of the results
// stage — a full-width "gold sheet" that anchors the composition so the canvas
// reads as designed, not empty. A big wiring figure on the left, rich detail on
// the right (intro copy + the titleblock spec band + concepts + a loud CTA).
// The whole panel opens the build detail view. The supporting builds sit in the
// grid below it.
import { formatTime } from '../lib/format.js';
import ProjectDiagram from './ProjectDiagram.jsx';

const LEVEL_FILL = { beginner: 1, intermediate: 2, advanced: 3 };

function FeaturedBuild({ project, onOpen }) {
  const partCount = project.requires?.length ?? 0;
  const fill = LEVEL_FILL[project.difficulty] ?? 1;

  const open = () => onOpen(project);
  const onKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      open();
    }
  };

  return (
    <article
      className={`featured is-${project.difficulty}`}
      data-difficulty={project.difficulty}
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={onKeyDown}
      aria-label={`View build instructions for ${project.title}`}
    >
      <p className="featured__eyebrow">
        <span className="featured__led" aria-hidden="true" />
        Recommended first build
      </p>

      <div className="featured__body">
        <div className="featured__figure">
          <div className="project-card__figure featured__well">
            <span className="plate-tick plate-tick--tl" aria-hidden="true" />
            <span className="plate-tick plate-tick--br" aria-hidden="true" />
            <ProjectDiagram project={project} />
          </div>
          <p className="featured__figcaption mono" aria-hidden="true">
            FIG. 01 — WIRING SCHEMATIC
          </p>
        </div>

        <div className="featured__detail">
          <h3 className="featured__title">{project.title}</h3>
          {project.intro && <p className="featured__intro">{project.intro}</p>}

          <dl className="plate-titleblock featured__spec">
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

          <span className="featured__cta" aria-hidden="true">
            Open the build sheet →
          </span>
        </div>
      </div>
    </article>
  );
}

export default FeaturedBuild;
