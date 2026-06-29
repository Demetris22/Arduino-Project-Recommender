// matching.js
// Pure matching engine for the Arduino project recommender.
// No React, no data imports — all inputs are passed in, so this is trivially testable.

/**
 * @typedef {Object} Board
 * @property {string} id
 * @property {string} name
 * @property {number} digitalPins
 * @property {number} analogPins
 * @property {string[]} features
 */

/**
 * @typedef {Object} Component
 * @property {string} id
 * @property {string} name
 * @property {string} category
 */

/**
 * @typedef {Object} Project
 * @property {string} id
 * @property {string} title
 * @property {('beginner'|'intermediate'|'advanced')} difficulty
 * @property {number} timeMinutes
 * @property {string[]} requires
 * @property {string[]} boards
 * @property {number} [minDigitalPins]
 * @property {number} [minAnalogPins]
 * @property {string[]} [requiresFeatures]
 */

// A project missing more than this many components is hidden entirely —
// "near miss" should feel achievable, not list the whole catalog.
const NEAR_MISS_LIMIT = 2;

const DIFFICULTY_ORDER = { beginner: 0, intermediate: 1, advanced: 2 };
const FEATURE_LABELS = { wifi: 'WiFi', bluetooth: 'Bluetooth' };

const featureLabel = (f) => FEATURE_LABELS[f] ?? f;

/**
 * Returns the reasons (if any) a board can't run a project.
 * An empty array means the board is compatible.
 * Exported for reuse (e.g. the purchase optimizer); behavior is unchanged.
 * @returns {string[]}
 */
export function boardIncompatibilities(project, board) {
  // Board not listed is a hard stop — other checks would be noise.
  if (!project.boards.includes(board.id)) {
    return [`Not compatible with ${board.name}`];
  }

  const reasons = [];

  for (const feature of project.requiresFeatures ?? []) {
    if (!board.features.includes(feature)) {
      reasons.push(`Requires ${featureLabel(feature)}`);
    }
  }
  if ((project.minDigitalPins ?? 0) > board.digitalPins) {
    reasons.push(
      `Needs ${project.minDigitalPins} digital pins (${board.name} has ${board.digitalPins})`
    );
  }
  if ((project.minAnalogPins ?? 0) > board.analogPins) {
    reasons.push(
      `Needs ${project.minAnalogPins} analog pins (${board.name} has ${board.analogPins})`
    );
  }
  return reasons;
}

function byDifficultyThenTime(a, b) {
  const d =
    (DIFFICULTY_ORDER[a.difficulty] ?? 99) - (DIFFICULTY_ORDER[b.difficulty] ?? 99);
  return d !== 0 ? d : (a.timeMinutes ?? 0) - (b.timeMinutes ?? 0);
}

/**
 * Match owned components + a chosen board against the project catalog.
 *
 * @param {string[]} ownedComponentIds  Component ids the user has.
 * @param {string} selectedBoardId      Chosen board id.
 * @param {{ boards: Board[], components: Component[], projects: Project[] }} data
 * @returns {{
 *   buildable: Project[],
 *   nearMiss: { project: Project, missing: Component[] }[],
 *   incompatible: { project: Project, reasons: string[] }[]
 * }}
 */
export function getMatches(ownedComponentIds, selectedBoardId, data) {
  const { boards, components, projects } = data;

  const board = boards.find((b) => b.id === selectedBoardId);
  if (!board) {
    throw new Error(`Unknown board id: "${selectedBoardId}"`);
  }

  const owned = new Set(ownedComponentIds);
  const componentById = new Map(components.map((c) => [c.id, c]));

  const buildable = [];
  const nearMiss = [];
  const incompatible = [];

  for (const project of projects) {
    // 1. Board is the hard gate — check it first.
    const reasons = boardIncompatibilities(project, board);
    if (reasons.length > 0) {
      incompatible.push({ project, reasons });
      continue;
    }

    // 2. Component check.
    const missingIds = project.requires.filter((id) => !owned.has(id));

    if (missingIds.length === 0) {
      buildable.push(project);
    } else if (missingIds.length <= NEAR_MISS_LIMIT) {
      const missing = missingIds.map(
        (id) => componentById.get(id) ?? { id, name: id, category: 'unknown' }
      );
      nearMiss.push({ project, missing });
    }
    // missingIds.length > NEAR_MISS_LIMIT  ->  hidden
  }

  buildable.sort(byDifficultyThenTime);
  nearMiss.sort((a, b) => byDifficultyThenTime(a.project, b.project));

  return { buildable, nearMiss, incompatible };
}
