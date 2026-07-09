import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState.jsx';

function NotFoundPage() {
  return (
    <div className="shell" style={{ paddingBlock: 'clamp(3rem, 8vw, 6rem)' }}>
      <EmptyState
        stamp="404 — no such page"
        action={
          <Link className="btn btn--outline" to="/">
            Back to the catalog
          </Link>
        }
      >
        That project or page doesn&apos;t exist. It may have been renamed, or the link is wrong.
      </EmptyState>
    </div>
  );
}

export default NotFoundPage;
