import { describe, it, expect } from 'vitest';
import type { TeamResponse, WorkerResponse } from '@/lib/agentteams-api';
import {
  filterTeams,
  getAvailableWorkers,
  getWorkersForTeam,
  paginateTeams,
  sortTeams,
} from './team-selectors';

const team = (overrides: Partial<TeamResponse> = {}): TeamResponse => ({
  name: 'alpha',
  teamName: 'Alpha Team',
  description: 'a test team',
  phase: 'Active',
  leaderName: 'manager-a',
  leaderReady: true,
  totalWorkers: 4,
  readyWorkers: 3,
  workerNames: ['w1', 'w2'],
  humanMembers: [],
  workerExposedPorts: {},
  teamRoomID: '!room:matrix',
  leaderDMRoomID: '!dm:matrix',
  message: '',
  workerIdleTimeout: '30m',
  leaderHeartbeat: null,
  admin: null,
  ...overrides,
});

const worker = (overrides: Partial<WorkerResponse> = {}): WorkerResponse => ({
  name: 'w1',
  phase: 'Running',
  state: 'Running',
  runtime: 'openclaw',
  containerManaged: false,
  model: '',
  image: '',
  containerState: '',
  matrixUserID: '',
  roomID: '',
  message: '',
  team: '',
  role: '',
  ...overrides,
});

describe('filterTeams', () => {
  const teams: TeamResponse[] = [
    team({ name: 'platform', teamName: 'Platform Team', description: 'infra' }),
    team({ name: 'qa', teamName: 'QA Team', description: 'quality checks' }),
    team({ name: 'demo', teamName: 'Demo' }),
  ];

  it('returns all when search is empty', () => {
    expect(filterTeams(teams, '')).toHaveLength(3);
  });

  it('returns undefined input as empty array', () => {
    expect(filterTeams(undefined, 'alpha')).toEqual([]);
  });

  it('matches by name', () => {
    expect(filterTeams(teams, 'plat')).toHaveLength(1);
  });

  it('matches by teamName case-insensitively', () => {
    expect(filterTeams(teams, 'QA')).toHaveLength(1);
  });

  it('matches by description', () => {
    expect(filterTeams(teams, 'quality')).toHaveLength(1);
  });
});

describe('sortTeams', () => {
  it('sorts by name ascending', () => {
    const out = sortTeams(
      [team({ name: 'beta' }), team({ name: 'alpha' }), team({ name: 'gamma' })],
      'name',
    );
    expect(out.map((t) => t.name)).toEqual(['alpha', 'beta', 'gamma']);
  });

  it('sorts by phase', () => {
    const out = sortTeams(
      [team({ name: 'a', phase: 'Active' }), team({ name: 'b', phase: 'Pending' })],
      'phase',
    );
    expect(out.map((t) => t.phase)).toEqual(['Active', 'Pending']);
  });

  it('sorts by readiness descending', () => {
    const out = sortTeams(
      [
        team({ name: 'low', totalWorkers: 4, readyWorkers: 1 }),
        team({ name: 'high', totalWorkers: 4, readyWorkers: 4 }),
        team({ name: 'mid', totalWorkers: 4, readyWorkers: 2 }),
      ],
      'readiness',
    );
    expect(out.map((t) => t.name)).toEqual(['high', 'mid', 'low']);
  });

  it('treats zero-worker teams as 0 readiness', () => {
    const out = sortTeams(
      [team({ name: 'empty', totalWorkers: 0, readyWorkers: 0 }), team({ name: 'ready', totalWorkers: 2, readyWorkers: 2 })],
      'readiness',
    );
    expect(out[0].name).toBe('ready');
  });

  it('does not mutate input', () => {
    const input = [team({ name: 'b' }), team({ name: 'a' })];
    sortTeams(input, 'name');
    expect(input[0].name).toBe('b');
  });
});

describe('paginateTeams', () => {
  const items: TeamResponse[] = Array.from({ length: 25 }, (_, i) =>
    team({ name: `t${String(i).padStart(2, '0')}` }),
  );

  it('paginates with default 12', () => {
    const { items: page, totalPages, safePage } = paginateTeams(items, 1, 12);
    expect(page).toHaveLength(12);
    expect(totalPages).toBe(3);
    expect(safePage).toBe(1);
  });

  it('returns last page with remainder', () => {
    const { items: page, safePage } = paginateTeams(items, 3, 12);
    expect(page).toHaveLength(1);
    expect(safePage).toBe(3);
  });

  it('clamps page beyond total', () => {
    const { safePage, totalPages } = paginateTeams(items, 99, 12);
    expect(safePage).toBe(totalPages);
  });

  it('clamps page below 1', () => {
    const { safePage } = paginateTeams(items, 0, 12);
    expect(safePage).toBe(1);
  });

  it('handles empty list', () => {
    const { items: page, totalPages, safePage } = paginateTeams([], 1, 12);
    expect(page).toEqual([]);
    expect(totalPages).toBe(1);
    expect(safePage).toBe(1);
  });
});

describe('getAvailableWorkers', () => {
  const workers: WorkerResponse[] = [
    worker({ name: 'w1' }),
    worker({ name: 'w2' }),
    worker({ name: 'w3', team: '' }),
    worker({ name: 'w4', team: 'other' }),
  ];

  it('excludes already in team', () => {
    const out = getAvailableWorkers(workers, 'target', ['w1', 'w2']);
    expect(out.map((w) => w.name)).toEqual(['w3']);
  });

  it('excludes workers already in another team', () => {
    const out = getAvailableWorkers(workers, 'target', []);
    expect(out.map((w) => w.name)).toEqual(['w1', 'w2', 'w3']);
  });

  it('handles undefined workers', () => {
    expect(getAvailableWorkers(undefined, 't', [])).toEqual([]);
  });
});

describe('getWorkersForTeam', () => {
  const workers: WorkerResponse[] = [
    worker({ name: 'w1', team: 'alpha' }),
    worker({ name: 'w2', team: 'beta' }),
    worker({ name: 'w3', team: 'alpha' }),
  ];

  it('returns workers belonging to team', () => {
    expect(getWorkersForTeam(workers, 'alpha').map((w) => w.name)).toEqual(['w1', 'w3']);
  });

  it('handles undefined workers', () => {
    expect(getWorkersForTeam(undefined, 'alpha')).toEqual([]);
  });
});
