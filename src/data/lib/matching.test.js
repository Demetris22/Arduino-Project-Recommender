// matching.test.js
import { describe, it, expect } from 'vitest';
import { getMatches } from './matching.js';

// Inline fixtures — deliberately NOT the real data, so these tests stay
// stable even when boards.json / projects.json change.
const boards = [
  { id: 'uno',   name: 'Uno',   digitalPins: 14, analogPins: 6,  features: [] },
  { id: 'esp32', name: 'ESP32', digitalPins: 25, analogPins: 15, features: ['wifi', 'bluetooth'] },
  { id: 'tiny',  name: 'Tiny',  digitalPins: 2,  analogPins: 0,  features: [] },
];

const components = [
  { id: 'a', name: 'Comp A', category: 'sensor' },
  { id: 'b', name: 'Comp B', category: 'actuator' },
  { id: 'c', name: 'Comp C', category: 'display' },
  { id: 'd', name: 'Comp D', category: 'input' },
];

const projects = [
  { id: 'build',     title: 'Buildable',  difficulty: 'beginner',     timeMinutes: 10, requires: ['a', 'b'],           boards: ['uno', 'esp32', 'tiny'], minDigitalPins: 1, minAnalogPins: 0, requiresFeatures: [] },
  { id: 'near1',     title: 'Near 1',     difficulty: 'beginner',     timeMinutes: 20, requires: ['a', 'b', 'c'],      boards: ['uno', 'esp32', 'tiny'], minDigitalPins: 1, minAnalogPins: 0, requiresFeatures: [] },
  { id: 'near2',     title: 'Near 2',     difficulty: 'intermediate', timeMinutes: 30, requires: ['a', 'b', 'c', 'd'], boards: ['uno', 'esp32', 'tiny'], minDigitalPins: 1, minAnalogPins: 0, requiresFeatures: [] },
  { id: 'wifi',      title: 'WiFi only',  difficulty: 'advanced',     timeMinutes: 60, requires: ['a'],                boards: ['uno', 'esp32'],         minDigitalPins: 1, minAnalogPins: 0, requiresFeatures: ['wifi'] },
  { id: 'esp-only',  title: 'ESP only',   difficulty: 'advanced',     timeMinutes: 50, requires: ['a'],                boards: ['esp32'],                minDigitalPins: 1, minAnalogPins: 0, requiresFeatures: [] },
  { id: 'pinhungry', title: 'Pin Hungry', difficulty: 'intermediate', timeMinutes: 40, requires: ['a'],                boards: ['uno', 'esp32', 'tiny'], minDigitalPins: 5, minAnalogPins: 0, requiresFeatures: [] },
];

const data = { boards, components, projects };

const ids = (list) => list.map((p) => p.id);
const projIds = (list) => list.map((x) => x.project.id);

describe('getMatches — Uno, owns A + B', () => {
  const result = getMatches(['a', 'b'], 'uno', data);

  it('marks fully-owned, compatible projects as buildable', () => {
    // build (owns a,b) and pinhungry (owns a; Uno has 14 digital pins),
    // sorted by difficulty: beginner ('build') before intermediate ('pinhungry')
    expect(ids(result.buildable)).toEqual(['build', 'pinhungry']);
  });

  it('marks projects missing 1–2 components as near misses', () => {
    expect(projIds(result.nearMiss)).toContain('near1'); // missing c
    expect(projIds(result.nearMiss)).toContain('near2'); // missing c, d
  });

  it('attaches the missing components as full objects', () => {
    const near1 = result.nearMiss.find((x) => x.project.id === 'near1');
    expect(near1.missing).toHaveLength(1);
    expect(near1.missing[0]).toMatchObject({ id: 'c', name: 'Comp C' });
  });

  it('flags a WiFi project on a non-WiFi board as incompatible', () => {
    const wifi = result.incompatible.find((x) => x.project.id === 'wifi');
    expect(wifi).toBeDefined();
    expect(wifi.reasons).toContain('Requires WiFi');
  });

  it('flags a board-restricted project as incompatible', () => {
    const espOnly = result.incompatible.find((x) => x.project.id === 'esp-only');
    expect(espOnly.reasons).toContain('Not compatible with Uno');
  });
});

describe('getMatches — ESP32, owns only A', () => {
  const result = getMatches(['a'], 'esp32', data);

  it('treats WiFi + ESP-only projects as buildable on ESP32', () => {
    expect(ids(result.buildable)).toEqual(expect.arrayContaining(['wifi', 'esp-only', 'pinhungry']));
  });

  it('hides projects missing 3+ components entirely', () => {
    // near2 requires a,b,c,d; owns only a -> missing 3 -> hidden
    expect(projIds(result.nearMiss)).not.toContain('near2');
    expect(ids(result.buildable)).not.toContain('near2');
  });

  it('sorts buildable by difficulty, then time', () => {
    // pinhungry (intermediate, 40) < esp-only (advanced, 50) < wifi (advanced, 60)
    expect(ids(result.buildable)).toEqual(['pinhungry', 'esp-only', 'wifi']);
  });
});

describe('getMatches — pin gating on Tiny', () => {
  const result = getMatches(['a'], 'tiny', data);

  it('flags a project that needs more pins than the board has', () => {
    const ph = result.incompatible.find((x) => x.project.id === 'pinhungry');
    expect(ph.reasons[0]).toMatch(/digital pins/);
  });
});

describe('getMatches — invalid input', () => {
  it('throws on an unknown board id', () => {
    expect(() => getMatches(['a'], 'nope', data)).toThrow(/Unknown board/);
  });
});