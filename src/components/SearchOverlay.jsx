// Global search, reachable from any page. Reuses the existing accessible Modal
// (portal + focus trap + Esc + scroll lock). Matches titles and `learn` concepts.
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import projects from '../data/projects.json';
import Modal from './Modal.jsx';
import { formatTime } from '../lib/format.js';

function SearchOverlay({ onClose }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects.slice(0, 6);
    return projects
      .filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.learn ?? []).some((t) => t.toLowerCase().includes(q))
      )
      .slice(0, 8);
  }, [query]);

  const go = (id) => {
    onClose();
    navigate(`/p/${id}`);
  };

  return (
    <Modal titleId="search-title" onClose={onClose} className="modal--search">
      <h2 id="search-title" className="sr-only">
        Search projects
      </h2>

      <div className="searchoverlay__field">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21 16.2 16.2" />
        </svg>
        <input
          type="text"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search projects and concepts…"
          aria-label="Search projects"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && results[0]) go(results[0].id);
          }}
        />
        <kbd className="mono">Esc</kbd>
      </div>

      {results.length === 0 ? (
        <p className="searchoverlay__none">No projects match “{query}”.</p>
      ) : (
        <ul className="searchoverlay__list">
          {!query.trim() && <li className="searchoverlay__hint mono">From the catalog</li>}
          {results.map((p) => (
            <li key={p.id}>
              <button type="button" className="searchoverlay__row" onClick={() => go(p.id)}>
                <span className="searchoverlay__title">{p.title}</span>
                <span className="searchoverlay__meta mono">
                  {formatTime(p.timeMinutes)} · {p.difficulty}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}

export default SearchOverlay;
