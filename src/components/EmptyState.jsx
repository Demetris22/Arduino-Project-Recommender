function EmptyState({ stamp, children, action }) {
  return (
    <div className="empty">
      {stamp && <p className="empty__stamp">{stamp}</p>}
      <p className="empty__body">{children}</p>
      {action}
    </div>
  );
}

export default EmptyState;
