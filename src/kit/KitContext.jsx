// "My Kit" — the user's board + the parts they own.
//
// In the old wizard the kit was a GATE: you had to fill it in before you could
// see anything. Here it is a LENS: it is optional, it persists, and it simply
// annotates the catalog. Nothing is ever hidden because the kit is empty.
//
// Persistence: localStorage. Sharing: the URL, via the already-tested pure
// helpers in src/lib/shareUrl.js — an inbound `?board=&parts=` on ANY route
// hydrates the kit, then is normalized out of the address bar.
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import boards from '../data/boards.json';
import components from '../data/components.json';
import { readSelectionFromUrl, buildSelectionQuery } from '../lib/shareUrl.js';

const STORAGE_KEY = 'sketchef.kit.v1';
const DEFAULT_BOARD_ID = boards[0].id;

const KitContext = createContext(null);

// Only ids that still exist in the catalog survive a load — a stale localStorage
// blob from an older data set must never poison the engine (getMatches throws on
// an unknown board id).
function sanitize(boardId, partIds) {
  const validBoard = boards.some((b) => b.id === boardId) ? boardId : null;
  const known = new Set(components.map((c) => c.id));
  const parts = Array.isArray(partIds) ? partIds.filter((id) => known.has(id)) : [];
  return { boardId: validBoard, parts: [...new Set(parts)] };
}

function readStorage() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { boardId: null, parts: [] };
    const parsed = JSON.parse(raw);
    return sanitize(parsed.boardId, parsed.parts);
  } catch {
    return { boardId: null, parts: [] };
  }
}

// A share link wins over stored state: following someone's link should show you
// THEIR kit. `?parts=` alone (no board) still implies a kit, so fall back to the
// default board in that case — mirroring readSelectionFromUrl's own contract.
function readInitial() {
  const params = new URLSearchParams(window.location.search);
  const hasBoard = params.has('board');
  const hasParts = params.has('parts');

  if (hasBoard || hasParts) {
    const sel = readSelectionFromUrl(window.location.search, {
      boards,
      components,
      defaultBoardId: DEFAULT_BOARD_ID,
    });
    return { ...sanitize(sel.boardId, sel.ownedComponentIds), fromLink: true };
  }
  return { ...readStorage(), fromLink: false };
}

export function KitProvider({ children }) {
  const [initial] = useState(readInitial);
  const [boardId, setBoardId] = useState(initial.boardId);
  const [parts, setParts] = useState(initial.parts);

  // Persist every change.
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ boardId, parts }));
    } catch {
      /* private mode / quota — the kit just won't survive a reload */
    }
  }, [boardId, parts]);

  // Strip the share params once they've been absorbed, so the address bar shows
  // a clean route and a later copy-link doesn't double up.
  useEffect(() => {
    if (!initial.fromLink) return;
    const url = `${window.location.pathname}${window.location.hash}`;
    window.history.replaceState(null, '', url);
  }, [initial.fromLink]);

  const value = useMemo(() => {
    const owned = new Set(parts);
    return {
      boardId,
      parts,
      owned,
      // A kit only counts as "set up" once a board is chosen — the engine
      // cannot classify anything without one.
      hasKit: Boolean(boardId),
      isOwned: (id) => owned.has(id),
      setBoard: (id) => setBoardId(id),
      togglePart: (id) =>
        setParts((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id])),
      addPart: (id) => setParts((prev) => (prev.includes(id) ? prev : [...prev, id])),
      selectAllParts: () => setParts(components.map((c) => c.id)),
      clearParts: () => setParts([]),
      reset: () => {
        setBoardId(null);
        setParts([]);
      },
      // Reuses the pure, 12-test-covered query builder.
      shareUrl: () =>
        `${window.location.origin}/${buildSelectionQuery(boardId ?? DEFAULT_BOARD_ID, parts)}`,
    };
  }, [boardId, parts]);

  return <KitContext.Provider value={value}>{children}</KitContext.Provider>;
}

export function useKit() {
  const ctx = useContext(KitContext);
  if (!ctx) throw new Error('useKit must be used inside <KitProvider>');
  return ctx;
}

export { DEFAULT_BOARD_ID };
