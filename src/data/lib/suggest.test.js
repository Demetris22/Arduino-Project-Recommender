// suggest.test.js
import { describe, it, expect } from 'vitest';
import { suggestNextPurchases } from './suggest.js';

// Inline fixtures — deliberately NOT the real data.
const boards = [
  { id: 'uno', name: 'Uno', digitalPins: 14, analogPins: 6, features: [] },
  { id: 'esp32', name: 'ESP32', digitalPins: 25, analogPins: 15, features: ['wifi'] },
  { id: 'tiny', name: 'Tiny', digitalPins: 2, analogPins: 0, features: [] },
];

const components = [
  { id: 'a', name: 'Alpha', category: 'sensor' },
  { id: 'b', name: 'Bravo', category: 'actuator' },
  { id: 'c', name: 'Charlie', category: 'display' },
  { id: 'd', name: 'Delta', category: 'input' },
  { id: 'hub', name: 'Hub', category: 'infrastructure' },
];

// Compatible-with-uno boards list reused for brevity.
const ALL = ['uno', 'esp32', 'tiny'];
const proj = (id, requires, extra = {}) => ({
  id,
  title: id,
  difficulty: 'beginner',
  timeMinutes: 10,
  requires,
  boards: ALL,
  minDigitalPins: 1,
  minAnalogPins: 0,
  requiresFeatures: [],
  ...extra,
});

const byId = (recs) => recs.map((r) => r.component.id);

describe('suggestNextPurchases — sole-missing leverage', () => {
  // 'a' is the sole missing part of three projects; 'b'/'c' are each part of a
  // two-missing project (never the sole missing part).
  const projects = [
    proj('s1', ['a']),
    proj('s2', ['a']),
    proj('s3', ['a']),
    proj('t1', ['b', 'c']),
  ];
  const recs = suggestNextPurchases([], 'uno', { boards, components, projects });

  it('ranks the highest-unlock component first', () => {
    expect(recs[0].component.id).toBe('a');
    expect(recs[0].unlockCount).toBe(3);
    expect(recs[0].neededByCount).toBe(3);
  });

  it('lists the projects a sole-missing component unlocks', () => {
    expect(recs[0].unlocks.map((p) => p.id).sort()).toEqual(['s1', 's2', 's3']);
  });

  it('ranks sole-missing parts above multi-missing ones', () => {
    const ids = byId(recs);
    expect(ids[0]).toBe('a');
    expect(ids).toEqual(expect.arrayContaining(['b', 'c']));
    expect(ids.indexOf('b')).toBeGreaterThan(0);
  });
});

describe('suggestNextPurchases — needed-by-many but never sole', () => {
  // 'x' would be common, but every project that needs it is missing 2+ parts,
  // so it never becomes a single-part unlock.
  const projects = [
    proj('m1', ['a', 'b']),
    proj('m2', ['a', 'c']),
    proj('m3', ['a', 'd']),
  ];
  const recs = suggestNextPurchases([], 'uno', { boards, components, projects });

  it('still surfaces the broadly-needed component with unlockCount 0', () => {
    const a = recs.find((r) => r.component.id === 'a');
    expect(a).toBeDefined();
    expect(a.unlockCount).toBe(0);
    expect(a.neededByCount).toBe(3);
    expect(a.unlocks).toHaveLength(0);
  });
});

describe('suggestNextPurchases — excludes owned components', () => {
  const projects = [proj('p1', ['a', 'b'])];
  // Owns 'a'; only 'b' is missing, so 'a' must never be recommended.
  const recs = suggestNextPurchases(['a'], 'uno', { boards, components, projects });

  it('does not recommend a part the user already owns', () => {
    expect(byId(recs)).not.toContain('a');
  });

  it('recommends the genuinely missing part as a sole unlock', () => {
    const b = recs.find((r) => r.component.id === 'b');
    expect(b.unlockCount).toBe(1);
    expect(b.unlocks.map((p) => p.id)).toEqual(['p1']);
  });
});

describe('suggestNextPurchases — ignores board-incompatible projects', () => {
  const projects = [
    proj('wifi-only', ['a'], { requiresFeatures: ['wifi'] }), // needs wifi
    proj('big-board', ['b'], { boards: ['esp32'] }), // not on uno
    proj('pin-hungry', ['c'], { minDigitalPins: 5, boards: ['tiny'] }), // tiny lacks pins
    proj('ok', ['d']),
  ];
  const recs = suggestNextPurchases([], 'tiny', { boards, components, projects });

  it('only counts components from board-compatible candidates', () => {
    // On 'tiny': wifi-only (needs wifi), big-board (esp32 only), and pin-hungry
    // (needs 5 digital pins, tiny has 2) are all incompatible -> ignored.
    expect(byId(recs)).toEqual(['d']);
    expect(recs[0].neededByCount).toBe(1);
  });
});

describe('suggestNextPurchases — nothing to recommend', () => {
  const projects = [proj('p1', ['a']), proj('p2', ['a', 'b'])];

  it('returns an empty array when everything compatible is already buildable', () => {
    const recs = suggestNextPurchases(['a', 'b'], 'uno', {
      boards,
      components,
      projects,
    });
    expect(recs).toEqual([]);
  });

  it('returns an empty array for an unknown board', () => {
    expect(
      suggestNextPurchases([], 'nope', { boards, components, projects })
    ).toEqual([]);
  });
});

describe('suggestNextPurchases — limit', () => {
  const projects = [
    proj('p1', ['a']),
    proj('p2', ['b']),
    proj('p3', ['c']),
    proj('p4', ['d']),
    proj('p5', ['hub']),
    proj('p6', ['a', 'b', 'c', 'd', 'hub']),
  ];

  it('returns at most the requested number of recommendations', () => {
    const recs = suggestNextPurchases([], 'uno', { boards, components, projects }, 3);
    expect(recs).toHaveLength(3);
  });
});
