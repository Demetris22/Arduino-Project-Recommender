// A project's own page, at its own URL. In the old app this was a modal you
// could never link to. Here it is a document: spec strip, schematic, a parts
// checklist that knows what you own (and lets you tick parts straight into your
// kit), wiring, steps, code, and neighbours.
import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import boards from '../data/boards.json';
import components from '../data/components.json';
import projects from '../data/projects.json';
import { boardIncompatibilities } from '../data/lib/matching.js';
import { useKit } from '../kit/KitContext.jsx';
import { useProjectStatus } from '../kit/useProjectStatus.js';
import ProjectDiagram from '../components/ProjectDiagram.jsx';
import PartIcon from '../components/PartIcon.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import NotFoundPage from './NotFoundPage.jsx';
import { formatTime } from '../lib/format.js';

const COMPONENT_BY_ID = new Map(components.map((c) => [c.id, c]));
const LEVEL_TEXT = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };

function SpecStrip({ project }) {
  const boardNames = project.boards
    .map((id) => boards.find((b) => b.id === id)?.name?.replace(/^Arduino\s+/i, '') ?? id)
    .join(' · ');

  return (
    <dl className="specstrip">
      <div className="specstrip__cell">
        <dt>Time</dt>
        <dd className="mono">{formatTime(project.timeMinutes)}</dd>
      </div>
      <div className="specstrip__cell">
        <dt>Level</dt>
        <dd className={`mono level level--${project.difficulty}`}>
          <span className="level__gauge" aria-hidden="true"><i /><i /><i /></span>
          {LEVEL_TEXT[project.difficulty]}
        </dd>
      </div>
      <div className="specstrip__cell">
        <dt>Parts</dt>
        <dd className="mono">{project.requires.length}</dd>
      </div>
      <div className="specstrip__cell specstrip__cell--wide">
        <dt>Runs on</dt>
        <dd className="mono">{boardNames}</dd>
      </div>
    </dl>
  );
}

function PartsChecklist({ project }) {
  const { owned, addPart, hasKit } = useKit();

  if (project.requires.length === 0) {
    return (
      <p className="parts-none">
        No external parts needed — this project uses only the board&apos;s built-in hardware.
      </p>
    );
  }

  const missingCount = project.requires.filter((id) => !owned.has(id)).length;

  return (
    <>
      {hasKit && (
        <p className="checklist__summary mono">
          {missingCount === 0
            ? 'You own every part'
            : `${missingCount} of ${project.requires.length} parts missing`}
        </p>
      )}
      <ul className="checklist">
        {project.requires.map((id) => {
          const c = COMPONENT_BY_ID.get(id) ?? { id, name: id, category: 'unknown' };
          const have = owned.has(id);
          return (
            <li className={`checklist__row${have ? ' is-have' : ''}`} key={id}>
              <span className="checklist__icon" aria-hidden="true">
                <PartIcon component={c} />
              </span>
              <span className="checklist__name">{c.name}</span>
              {hasKit ? (
                have ? (
                  <span className="checklist__state is-have mono">Owned</span>
                ) : (
                  <button
                    type="button"
                    className="btn btn--outline btn--sm"
                    onClick={() => addPart(id)}
                  >
                    I have this
                  </button>
                )
              ) : (
                <span className="checklist__state mono">Required</span>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}

function CodeBlock({ code }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  };

  return (
    <div className="codeblock">
      <div className="codeblock__bar">
        <span className="mono">sketch.ino</span>
        <button type="button" className="codeblock__copy mono" onClick={copy}>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="codeblock__pre">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// Neighbours: share a concept, or overlap on two or more parts.
function relatedTo(project) {
  const learn = new Set(project.learn ?? []);
  const requires = new Set(project.requires ?? []);

  return projects
    .filter((p) => p.id !== project.id)
    .map((p) => {
      const conceptHits = (p.learn ?? []).filter((t) => learn.has(t)).length;
      const partHits = (p.requires ?? []).filter((r) => requires.has(r)).length;
      return { p, score: conceptHits * 3 + partHits };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => x.p);
}

function ProjectPage() {
  const { id } = useParams();
  const { boardId } = useKit();
  const { statusById } = useProjectStatus();

  const project = projects.find((p) => p.id === id);
  const index = projects.findIndex((p) => p.id === id);
  const related = useMemo(() => (project ? relatedTo(project) : []), [project]);

  // An unknown /p/:id is a 404, rendered in place (the URL stays put, so the
  // user can see and fix the bad slug).
  if (!project) return <NotFoundPage />;

  const status = statusById.get(project.id);
  const board = boards.find((b) => b.id === boardId);
  const reasons = board ? boardIncompatibilities(project, board) : [];

  return (
    <article className="projectpage">
      <div className="shell">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link to="/">Projects</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{project.title}</span>
        </nav>

        <header className="projecthead">
          <p className="projecthead__num mono" aria-hidden="true">
            {String(index + 1).padStart(2, '0')}
          </p>
          <div className="projecthead__main">
            <div className="projecthead__titlerow">
              <h1 className="projecthead__title">{project.title}</h1>
              <StatusBadge status={status} verbose />
            </div>
            <p className="projecthead__intro">{project.intro}</p>
          </div>
        </header>

        <SpecStrip project={project} />

        {reasons.length > 0 && (
          <div className="notice notice--stop" role="note">
            <p className="notice__title">Your {board.name} can&apos;t run this project</p>
            <ul className="notice__list">
              {reasons.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
            <Link className="linkbtn" to="/kit">
              Change your board
            </Link>
          </div>
        )}

        <figure className="projectfig">
          <div className="projectfig__tile">
            <span className="projectfig__tag mono">Fig. 01 — wiring schematic</span>
            <ProjectDiagram project={project} />
          </div>
        </figure>

        <div className="projectbody">
          <section className="projectbody__main">
            <h2 className="blockhead">Wiring</h2>
            <ul className="wiring">
              {project.wiring.map((line) => {
                const [from, to] = line.split('→');
                return (
                  <li className="wiring__row" key={line}>
                    <span className="wiring__from">{from?.trim()}</span>
                    {to && (
                      <>
                        <span className="wiring__arrow" aria-hidden="true">→</span>
                        <span className="wiring__to mono">{to.trim()}</span>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>

            <h2 className="blockhead">Steps</h2>
            <ol className="steps">
              {project.steps.map((step, i) => (
                <li className="steps__row" key={step}>
                  <span className="steps__n mono" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>

            <h2 className="blockhead">The sketch</h2>
            <CodeBlock code={project.code} />
          </section>

          <aside className="projectbody__side">
            <div className="sidecard">
              <h2 className="sidecard__title">Parts you need</h2>
              <PartsChecklist project={project} />
            </div>

            <div className="sidecard">
              <h2 className="sidecard__title">What you&apos;ll learn</h2>
              <ul className="taglist">
                {project.learn.map((t) => (
                  <li className="tag mono" key={t}>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>

        {related.length > 0 && (
          <section className="related">
            <div className="sectionhead">
              <h2 className="sectionhead__title">Build these next</h2>
              <span className="sectionhead__rule" aria-hidden="true" />
            </div>
            <ul className="related__list">
              {related.map((p) => (
                <li key={p.id}>
                  <Link className="related__card" to={`/p/${p.id}`}>
                    <span className="related__tile">
                      <ProjectDiagram project={p} />
                    </span>
                    <span className="related__name">{p.title}</span>
                    <span className="related__meta mono">
                      {formatTime(p.timeMinutes)} · {p.difficulty}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </article>
  );
}

export default ProjectPage;
