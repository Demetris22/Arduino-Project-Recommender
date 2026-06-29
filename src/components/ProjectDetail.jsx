// Build-instructions detail view rendered inside <Modal>. Every section is
// conditional on its data; projects with no instructions get a graceful
// "coming soon" state while still showing what IS available.
import { useMemo, useState } from 'react';
import Modal from './Modal.jsx';
import { formatTime } from '../lib/format.js';

// Split a wiring line on the arrow into [part, connection].
// Lines without an arrow render as a single full-width row.
function parseWiringRow(line) {
  const idx = line.indexOf('→');
  if (idx === -1) return { part: line.trim(), connection: null };
  return {
    part: line.slice(0, idx).trim(),
    connection: line.slice(idx + 1).trim(),
  };
}

function ProjectDetail({ project, components, onClose }) {
  const titleId = `project-detail-${project.id}`;
  const [copied, setCopied] = useState(false);

  const nameById = useMemo(
    () => new Map(components.map((c) => [c.id, c.name])),
    [components]
  );

  const requiredNames = (project.requires ?? []).map(
    (id) => nameById.get(id) ?? id
  );

  const hasWiring = project.wiring?.length > 0;
  const hasSteps = project.steps?.length > 0;
  const hasCode = Boolean(project.code);
  const hasLearn = project.learn?.length > 0;
  const hasInstructions =
    Boolean(project.intro) || hasWiring || hasSteps || hasCode;

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(project.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard unavailable (e.g. insecure context) — fail quietly.
    }
  };

  return (
    <Modal titleId={titleId} onClose={onClose}>
      <header className="detail__head">
        <div className="detail__head-main">
          <h2 id={titleId} className="detail__title">
            {project.title}
          </h2>
          <div className="detail__meta">
            <span className={`badge badge--${project.difficulty}`}>
              {project.difficulty}
            </span>
            <span className="detail__time">
              <span aria-hidden="true">⏱</span>{' '}
              <span className="mono">{formatTime(project.timeMinutes)}</span>
            </span>
          </div>
        </div>
        <button
          type="button"
          className="detail__close"
          onClick={onClose}
          aria-label="Close build instructions"
        >
          ✕
        </button>
      </header>

      <div className="detail__body">
        {project.intro && <p className="detail__intro">{project.intro}</p>}

        {!hasInstructions && (
          <div className="detail__coming-soon">
            <p className="detail__coming-soon-title">
              Detailed build instructions are coming soon
            </p>
            <p className="detail__coming-soon-body">
              Here's everything we have for this project so far.
            </p>
          </div>
        )}

        {requiredNames.length > 0 && (
          <section className="detail__section">
            <h3 className="detail__section-title">Required components</h3>
            <ul className="detail__parts">
              {requiredNames.map((name) => (
                <li key={name} className="detail__part">
                  {name}
                </li>
              ))}
            </ul>
          </section>
        )}

        {hasWiring && (
          <section className="detail__section">
            <h3 className="detail__section-title">Wiring</h3>
            <div className="wiring-wrap">
              <table className="wiring-table">
                <thead>
                  <tr>
                    <th scope="col">Part</th>
                    <th scope="col">Connection</th>
                  </tr>
                </thead>
                <tbody>
                  {project.wiring.map((line, i) => {
                    const { part, connection } = parseWiringRow(line);
                    return (
                      <tr key={`${line}-${i}`}>
                        {connection === null ? (
                          <td className="mono" colSpan={2}>
                            {part}
                          </td>
                        ) : (
                          <>
                            <td className="wiring-table__part">{part}</td>
                            <td className="mono wiring-table__conn">
                              {connection}
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {hasSteps && (
          <section className="detail__section">
            <h3 className="detail__section-title">Build steps</h3>
            <ol className="detail__steps">
              {project.steps.map((step, i) => (
                <li key={`${i}-${step.slice(0, 12)}`}>{step}</li>
              ))}
            </ol>
          </section>
        )}

        {hasCode && (
          <section className="detail__section">
            <h3 className="detail__section-title">Code</h3>
            <div className="code-wrap">
              <div className="code-wrap__bar">
                <span className="code-wrap__lang mono" aria-hidden="true">
                  arduino.ino
                </span>
                <button
                  type="button"
                  className="copy-btn"
                  onClick={copyCode}
                  aria-live="polite"
                >
                  {copied ? '✓ Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="code-block">
                <code>{project.code}</code>
              </pre>
            </div>
          </section>
        )}

        {project.tutorialUrl && (
          <a
            className="detail__tutorial"
            href={project.tutorialUrl}
            target="_blank"
            rel="noreferrer noopener"
          >
            Full tutorial →
          </a>
        )}

        {hasLearn && (
          <section className="detail__section">
            <h3 className="detail__section-title">What you'll learn</h3>
            <ul className="learn-tags" aria-label="What you'll learn">
              {project.learn.map((topic) => (
                <li key={topic} className="learn-tag mono">
                  {topic}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </Modal>
  );
}

export default ProjectDetail;
