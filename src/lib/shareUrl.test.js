// shareUrl.test.js
import { describe, it, expect } from 'vitest';
import { readSelectionFromUrl, buildSelectionQuery } from './shareUrl.js';

const boards = [{ id: 'uno' }, { id: 'nano' }, { id: 'esp32' }];
const components = [{ id: 'led' }, { id: 'buzzer' }, { id: 'hc-sr04' }];
const opts = { boards, components, defaultBoardId: 'uno' };

describe('readSelectionFromUrl', () => {
  it('reads a valid board and parts', () => {
    expect(readSelectionFromUrl('?board=esp32&parts=led,buzzer', opts)).toEqual({
      boardId: 'esp32',
      ownedComponentIds: ['led', 'buzzer'],
    });
  });

  it('falls back to the default board when the board id is unknown', () => {
    expect(readSelectionFromUrl('?board=zzz&parts=led', opts)).toEqual({
      boardId: 'uno',
      ownedComponentIds: ['led'],
    });
  });

  it('falls back to the default board when no board param is present', () => {
    expect(readSelectionFromUrl('?parts=led', opts).boardId).toBe('uno');
  });

  it('drops part ids that do not exist in the catalog', () => {
    expect(
      readSelectionFromUrl('?board=nano&parts=led,fake,hc-sr04', opts)
        .ownedComponentIds
    ).toEqual(['led', 'hc-sr04']);
  });

  it('de-dupes repeated parts while preserving order', () => {
    expect(
      readSelectionFromUrl('?board=uno&parts=buzzer,led,buzzer', opts)
        .ownedComponentIds
    ).toEqual(['buzzer', 'led']);
  });

  it('trims whitespace around part ids', () => {
    expect(
      readSelectionFromUrl('?parts=led%20,%20buzzer', opts).ownedComponentIds
    ).toEqual(['led', 'buzzer']);
  });

  it('returns empty parts for an empty / missing query', () => {
    expect(readSelectionFromUrl('', opts)).toEqual({
      boardId: 'uno',
      ownedComponentIds: [],
    });
    expect(readSelectionFromUrl(undefined, opts).ownedComponentIds).toEqual([]);
  });

  it('never crashes on a malformed / garbage query', () => {
    expect(readSelectionFromUrl('?parts=,,,&board=', opts)).toEqual({
      boardId: 'uno',
      ownedComponentIds: [],
    });
  });
});

describe('buildSelectionQuery', () => {
  it('builds a query with board and parts', () => {
    // URLSearchParams percent-encodes the comma; it round-trips fine.
    expect(buildSelectionQuery('uno', ['led', 'buzzer'])).toBe(
      '?board=uno&parts=led%2Cbuzzer'
    );
  });

  it('omits the parts param when there are none', () => {
    expect(buildSelectionQuery('uno', [])).toBe('?board=uno');
  });

  it('returns an empty string when there is no board and no parts', () => {
    expect(buildSelectionQuery(null, [])).toBe('');
  });
});

describe('round-trip', () => {
  it('readSelectionFromUrl reverses buildSelectionQuery', () => {
    const query = buildSelectionQuery('esp32', ['led', 'hc-sr04']);
    expect(readSelectionFromUrl(query, opts)).toEqual({
      boardId: 'esp32',
      ownedComponentIds: ['led', 'hc-sr04'],
    });
  });
});
