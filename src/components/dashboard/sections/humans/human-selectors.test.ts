import { describe, it, expect } from 'vitest';
import type { HumanResponse } from '@/lib/hiclaw-api';
import {
  computePhaseStats,
  filterHumans,
  sortHumans,
} from './human-selectors';

const human = (overrides: Partial<HumanResponse> = {}): HumanResponse => ({
  name: 'h1',
  phase: 'Active',
  displayName: 'Alice',
  matrixUserID: '@alice:matrix.org',
  initialPassword: 'pw',
  rooms: [],
  message: '',
  permissionLevel: 1,
  ...overrides,
});

describe('filterHumans', () => {
  const humans = [
    human({ name: 'alice', displayName: 'Alice', email: 'a@x.com', matrixUserID: '@a:matrix' }),
    human({ name: 'bob', displayName: 'Bob', email: 'b@x.com', matrixUserID: '@b:matrix' }),
  ];

  it('returns all when no query', () => {
    expect(filterHumans(humans, '')).toHaveLength(2);
  });

  it('matches by name', () => {
    expect(filterHumans(humans, 'ali')).toHaveLength(1);
  });

  it('matches by displayName', () => {
    expect(filterHumans(humans, 'Bob')).toHaveLength(1);
  });

  it('matches by email case-insensitively', () => {
    expect(filterHumans(humans, 'A@X.COM')).toHaveLength(1);
  });

  it('matches by matrixUserID', () => {
    expect(filterHumans(humans, '@b:matrix')).toHaveLength(1);
  });

  it('handles undefined', () => {
    expect(filterHumans(undefined, 'x')).toEqual([]);
  });
});

describe('sortHumans', () => {
  it('sorts by name', () => {
    const out = sortHumans([human({ name: 'b' }), human({ name: 'a' })], 'name');
    expect(out.map((h) => h.name)).toEqual(['a', 'b']);
  });

  it('sorts by phase', () => {
    const out = sortHumans(
      [human({ name: 'a', phase: 'Active' }), human({ name: 'b', phase: 'Pending' })],
      'phase',
    );
    expect(out.map((h) => h.phase)).toEqual(['Active', 'Pending']);
  });

  it('does not mutate input', () => {
    const input = [human({ name: 'b' }), human({ name: 'a' })];
    sortHumans(input, 'name');
    expect(input[0].name).toBe('b');
  });
});

describe('computePhaseStats', () => {
  it('counts each phase', () => {
    const stats = computePhaseStats([
      human({ phase: 'Active' }),
      human({ phase: 'Active' }),
      human({ phase: 'Pending' }),
    ]);
    expect(stats.Active).toBe(2);
    expect(stats.Pending).toBe(1);
  });

  it('handles undefined', () => {
    expect(computePhaseStats(undefined)).toEqual({});
  });

  it('handles empty list', () => {
    expect(computePhaseStats([])).toEqual({});
  });
});
