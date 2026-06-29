// suggest.js
// "What to buy next" optimizer. Pure function — all inputs passed in, so it's
// trivially testable. Reuses the engine's board-compatibility rule (imported,
// not reimplemented) so suggestions respect the exact same board/feature/pin
// gating as getMatches. Does not touch matching results.
import { boardIncompatibilities } from './matching.js';

/**
 * Rank the components worth acquiring next by how many projects they unlock.
 *
 * @param {string[]} ownedComponentIds  Component ids the user already has.
 * @param {string} selectedBoardId      Chosen board id.
 * @param {{ boards, components, projects }} data
 * @param {number} [limit=5]            How many recommendations to return.
 * @returns {{ component, unlockCount: number, neededByCount: number, unlocks: Project[] }[]}
 */
export function suggestNextPurchases(
  ownedComponentIds,
  selectedBoardId,
  data,
  limit = 5
) {
  const { boards, components, projects } = data;

  const board = boards.find((b) => b.id === selectedBoardId);
  if (!board) return [];

  const owned = new Set(ownedComponentIds);
  const componentById = new Map(components.map((c) => [c.id, c]));

  // Candidates: board-compatible projects that aren't buildable yet.
  // We consider ALL such projects, not just near-misses.
  const candidates = [];
  for (const project of projects) {
    if (boardIncompatibilities(project, board).length > 0) continue;
    const missing = project.requires.filter((id) => !owned.has(id));
    if (missing.length === 0) continue; // already buildable
    candidates.push({ project, missing });
  }

  // Aggregate per missing component id.
  const stats = new Map();
  for (const { project, missing } of candidates) {
    // If exactly one part is missing, buying it makes this project buildable.
    const soleMissingId = missing.length === 1 ? missing[0] : null;
    for (const id of missing) {
      let entry = stats.get(id);
      if (!entry) {
        entry = { unlockCount: 0, neededByCount: 0, unlocks: [] };
        stats.set(id, entry);
      }
      entry.neededByCount += 1;
      if (soleMissingId === id) {
        entry.unlockCount += 1;
        entry.unlocks.push(project);
      }
    }
  }

  const recommendations = [...stats.entries()].map(([id, entry]) => ({
    component: componentById.get(id) ?? { id, name: id, category: 'unknown' },
    unlockCount: entry.unlockCount,
    neededByCount: entry.neededByCount,
    unlocks: entry.unlocks,
  }));

  // Rank: most immediate unlocks, then broadest coverage, then name (stable).
  recommendations.sort(
    (a, b) =>
      b.unlockCount - a.unlockCount ||
      b.neededByCount - a.neededByCount ||
      a.component.name.localeCompare(b.component.name)
  );

  return recommendations.slice(0, limit);
}
