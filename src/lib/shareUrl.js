// Pure helpers for reading/writing the shareable selection (board + parts)
// to the URL query string. No React here — trivially testable, and keeps the
// validation logic out of the component.

// Read & validate the selection from a query string against the real data.
// A malformed or hand-edited URL can never crash or produce invalid state:
// an unknown board falls back to the default, unknown part ids are dropped.
export function readSelectionFromUrl(search, { boards, components, defaultBoardId }) {
  const params = new URLSearchParams(search ?? '');

  const boardParam = params.get('board');
  const boardId = boards.some((b) => b.id === boardParam)
    ? boardParam
    : defaultBoardId;

  const validIds = new Set(components.map((c) => c.id));
  const partsParam = params.get('parts') ?? '';
  const ownedComponentIds = partsParam
    .split(',')
    .map((id) => id.trim())
    .filter((id) => validIds.has(id));

  // De-dupe while preserving order.
  const seen = new Set();
  const uniqueParts = ownedComponentIds.filter((id) =>
    seen.has(id) ? false : (seen.add(id), true)
  );

  return { boardId, ownedComponentIds: uniqueParts };
}

// Build a query string (e.g. "?board=uno&parts=led,buzzer") for a selection.
export function buildSelectionQuery(boardId, ownedComponentIds) {
  const params = new URLSearchParams();
  if (boardId) params.set('board', boardId);
  if (ownedComponentIds.length > 0) {
    params.set('parts', ownedComponentIds.join(','));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}
