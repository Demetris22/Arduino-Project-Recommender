// The persistent chrome. The KitPill is the lens indicator — it is how the user
// knows, on every page, whether the catalog is being filtered through their kit.
import { NavLink, Link } from 'react-router-dom';

import boards from '../data/boards.json';
import { useKit } from '../kit/KitContext.jsx';
import { useProjectStatus } from '../kit/useProjectStatus.js';

function KitPill() {
  const { boardId, parts, hasKit } = useKit();
  const { counts } = useProjectStatus();

  if (!hasKit) {
    return (
      <Link className="kitpill" to="/kit">
        <span className="kitpill__dot" aria-hidden="true" />
        Set up your kit
      </Link>
    );
  }

  const board = boards.find((b) => b.id === boardId);
  const short = board?.name?.replace(/^Arduino\s+/i, '') ?? board?.name;
  const partWord = parts.length === 1 ? 'part' : 'parts';

  return (
    <Link
      className="kitpill is-set"
      to="/kit"
      aria-label={`Your kit: ${board?.name}, ${parts.length} ${partWord}, ${counts.buildable} buildable`}
    >
      <span className="kitpill__dot" aria-hidden="true" />
      <span className="kitpill__board">{short}</span>
      <span className="kitpill__parts" aria-hidden="true">
        · {parts.length} {partWord}
      </span>
      <span className="kitpill__build" aria-hidden="true">
        · <span className="kitpill__n">{counts.buildable}</span> buildable
      </span>
    </Link>
  );
}

function SiteHeader({ onOpenSearch }) {
  return (
    <header className="siteheader">
      <div className="shell siteheader__in">
        <Link className="brand" to="/">
          <img className="brand__mark" src="/favicon.svg" alt="" width="30" height="30" />
          <span className="brand__name">Sketchef</span>
        </Link>

        <nav className="sitenav" aria-label="Main">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `sitenav__link${isActive ? ' is-active' : ''}`}
          >
            Projects
          </NavLink>
          <NavLink
            to="/kit"
            className={({ isActive }) => `sitenav__link${isActive ? ' is-active' : ''}`}
          >
            My Kit
          </NavLink>
        </nav>

        <span className="siteheader__spacer" />

        <button
          type="button"
          className="iconbtn"
          onClick={onOpenSearch}
          aria-label="Search projects"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21 16.2 16.2" />
          </svg>
        </button>

        <KitPill />
      </div>
    </header>
  );
}

export default SiteHeader;
