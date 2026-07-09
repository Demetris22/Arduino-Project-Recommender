// The lens made visible on a card. One badge per status kind; 'unknown' (no kit
// chosen yet) renders nothing at all — an un-lensed catalog stays clean.
const KIND = {
  buildable: { cls: 'go', text: 'Buildable' },
  near: { cls: 'near', text: 'Almost' },
  far: { cls: 'far', text: 'Parts needed' },
  incompatible: { cls: 'stop', text: 'Wrong board' },
};

function StatusBadge({ status, verbose = false }) {
  if (!status || status.kind === 'unknown') return null;
  const meta = KIND[status.kind];
  if (!meta) return null;

  let text = meta.text;
  if (verbose) {
    if (status.kind === 'near') {
      const n = status.missing?.length ?? 0;
      text = `${n} part${n === 1 ? '' : 's'} away`;
    } else if (status.kind === 'far') {
      const n = status.missing?.length ?? 0;
      text = `${n} parts needed`;
    }
  } else if (status.kind === 'near') {
    const n = status.missing?.length ?? 0;
    text = `${n} away`;
  }

  return (
    <span className={`badge badge--${meta.cls}`}>
      <span className="badge__dot" aria-hidden="true" />
      {text}
    </span>
  );
}

export default StatusBadge;
