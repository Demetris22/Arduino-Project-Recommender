// A catalog entry. The whole card is one link to the project's own page — no
// modal, no wizard. Its figure is a deep teal-ink tile carrying the generated
// schematic: that dark plane is what keeps a white page from reading flat, and
// it is the only "photography" this catalog has.
import { Link } from 'react-router-dom';

import ProjectDiagram from './ProjectDiagram.jsx';
import StatusBadge from './StatusBadge.jsx';
import { formatTime } from '../lib/format.js';

const LEVEL_TEXT = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };

function ProjectCard({ project, index, status }) {
  const parts = project.requires?.length ?? 0;

  return (
    <Link className="pcard" to={`/p/${project.id}`}>
      <div className="pcard__figure">
        <span className="pcard__num mono" aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </span>
        <StatusBadge status={status} />
        <ProjectDiagram project={project} />
      </div>

      <div className="pcard__body">
        <h3 className="pcard__title">{project.title}</h3>
        <p className="pcard__intro">{project.intro}</p>

        <p className="pcard__meta">
          <span>{formatTime(project.timeMinutes)}</span>
          <span className="pcard__meta-sep" aria-hidden="true">/</span>
          <span>
            <b>{parts}</b> {parts === 1 ? 'part' : 'parts'}
          </span>
          <span className="pcard__meta-sep" aria-hidden="true">/</span>
          <span className={`level level--${project.difficulty}`}>
            <span className="level__gauge" aria-hidden="true">
              <i /><i /><i />
            </span>
            {LEVEL_TEXT[project.difficulty]}
          </span>
        </p>
      </div>
    </Link>
  );
}

export default ProjectCard;
