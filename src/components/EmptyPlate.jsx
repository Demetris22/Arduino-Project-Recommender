// An on-theme empty state: a blank drafting sheet pinned up with a stamped
// status (e.g. "NO PENDING DRAWINGS") and a line of explanatory note — used
// wherever a result section has nothing to show, instead of dead grey text.
function EmptyPlate({ stamp, children }) {
  return (
    <div className="empty-plate" role="note">
      <span className="empty-plate__stamp mono">{stamp}</span>
      <p className="empty-plate__note">{children}</p>
    </div>
  );
}

export default EmptyPlate;
