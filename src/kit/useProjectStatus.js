// The LENS: turn the kit into a per-project status, without touching the engine.
//
// ⚠ The single most important detail in this app. `getMatches` deliberately
// OMITS any project missing 3+ components (its private NEAR_MISS_LIMIT = 2).
// That is correct for a wizard's "near miss" list, but this is a CATALOG —
// if we trusted the engine for grid membership, those projects would silently
// vanish from the page. So:
//
//   * the engine CLASSIFIES (buildable / near / incompatible)
//   * anything it doesn't mention is classified here as 'far', with the missing
//     parts derived in the UI layer
//   * every project always gets a status. Nothing is ever dropped.
import { useMemo } from 'react';

import boards from '../data/boards.json';
import components from '../data/components.json';
import projects from '../data/projects.json';
import { getMatches } from '../data/lib/matching.js';
import { useKit } from './KitContext.jsx';

const data = { boards, components, projects };
const COMPONENT_BY_ID = new Map(components.map((c) => [c.id, c]));

const EMPTY_COUNTS = { buildable: 0, near: 0, far: 0, incompatible: 0 };

function missingFor(project, owned) {
  return (project.requires ?? [])
    .filter((id) => !owned.has(id))
    .map((id) => COMPONENT_BY_ID.get(id) ?? { id, name: id, category: 'unknown' });
}

/**
 * @returns {{
 *   statusById: Map<string, {kind:'unknown'|'buildable'|'near'|'far'|'incompatible', missing?: object[], reasons?: string[]}>,
 *   counts: {buildable:number, near:number, far:number, incompatible:number},
 *   hasKit: boolean
 * }}
 */
export function useProjectStatus() {
  const { boardId, parts, hasKit } = useKit();

  return useMemo(() => {
    const statusById = new Map();

    if (!hasKit) {
      for (const p of projects) statusById.set(p.id, { kind: 'unknown' });
      return { statusById, counts: { ...EMPTY_COUNTS }, hasKit: false };
    }

    let matches;
    try {
      matches = getMatches(parts, boardId, data);
    } catch {
      // A hand-edited/stale board id: getMatches throws. Degrade to "no lens"
      // rather than crashing the catalog.
      for (const p of projects) statusById.set(p.id, { kind: 'unknown' });
      return { statusById, counts: { ...EMPTY_COUNTS }, hasKit: false };
    }

    for (const p of matches.buildable) statusById.set(p.id, { kind: 'buildable' });
    for (const { project, missing } of matches.nearMiss) {
      statusById.set(project.id, { kind: 'near', missing });
    }
    for (const { project, reasons } of matches.incompatible) {
      statusById.set(project.id, { kind: 'incompatible', reasons });
    }

    // Everything the engine left out is board-compatible but 3+ parts short.
    const owned = new Set(parts);
    for (const project of projects) {
      if (statusById.has(project.id)) continue;
      statusById.set(project.id, { kind: 'far', missing: missingFor(project, owned) });
    }

    const counts = {
      buildable: matches.buildable.length,
      near: matches.nearMiss.length,
      incompatible: matches.incompatible.length,
      far: projects.length - matches.buildable.length - matches.nearMiss.length - matches.incompatible.length,
    };

    return { statusById, counts, hasKit: true };
  }, [boardId, parts, hasKit]);
}

export const STATUS_LABEL = {
  buildable: 'Buildable now',
  near: 'Almost there',
  far: 'Parts needed',
  incompatible: 'Wrong board',
};
