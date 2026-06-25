import { describe, it, expect } from 'vitest';
import type { ManagerResponse, TeamResponse, WorkerResponse } from '@/lib/hiclaw-api';
import {
  filterManagers,
  getManagedTeams,
  getManagedWorkers,
  getManagerSkills,
  sortManagers,
} from './manager-selectors';

const manager = (overrides: Partial<ManagerResponse> = {}): ManagerResponse => ({
  name: 'm1',
  phase: 'Running',
  state: 'Running',
  model: 'gpt-4',
  runtime: 'openclaw',
  image: '',
  matrixUserID: '',
  roomID: '',
  version: '',
  message: '',
  welcomeSent: false,
  ...overrides,
});

const team = (overrides: Partial<TeamResponse> = {}): TeamResponse => ({
  name: 't1',
  teamName: 'T1',
  description: '',
  phase: 'Active',
  admin: null,
  humanMembers: [],
  leaderName: 'm1',
  leaderHeartbeat: null,
  workerIdleTimeout: '30m',
  teamRoomID: '!room',
  leaderDMRoomID: '!dm',
  leaderReady: true,
  readyWorkers: 0,
  totalWorkers: 0,
  message: '',
  workerNames: [],
  workerExposedPorts: {},
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

describe('getManagerSkills', () => {
  it('returns explicit skills when present', () => {
    expect(getManagerSkills(manager({ skills: ['custom1'] }))).toEqual(['custom1']);
  });

  it('derives openclaw skills', () => {
    const skills = getManagerSkills(manager({ runtime: 'openclaw' }));
    expect(skills).toContain('task_assignment');
    expect(skills).toContain('health_monitoring');
  });

  it('derives copaw skills', () => {
    const skills = getManagerSkills(manager({ runtime: 'copaw' }));
    expect(skills).toContain('team_formation');
  });

  it('derives hermes skills', () => {
    const skills = getManagerSkills(manager({ runtime: 'hermes' }));
    expect(skills).toContain('message_routing');
  });

  it('derives openhuman skills', () => {
    const skills = getManagerSkills(manager({ runtime: 'openhuman' }));
    expect(skills).toContain('human_approval');
  });

  it('falls back to coordination for unknown runtime', () => {
    const skills = getManagerSkills(manager({ runtime: 'unknown' }));
    expect(skills).toContain('coordination');
    expect(skills).toContain('health_monitoring');
  });

  it('handles missing runtime', () => {
    const skills = getManagerSkills(manager({ runtime: '' }));
    expect(skills).toContain('coordination');
  });
});

describe('filterManagers', () => {
  const managers = [
    manager({ name: 'alpha', model: 'gpt-4', runtime: 'openclaw' }),
    manager({ name: 'beta', model: 'claude-3', runtime: 'copaw' }),
  ];

  it('returns all when no query', () => {
    expect(filterManagers(managers, '')).toHaveLength(2);
  });

  it('matches by name', () => {
    expect(filterManagers(managers, 'alp')).toHaveLength(1);
  });

  it('matches by model case-insensitively', () => {
    expect(filterManagers(managers, 'GPT')).toHaveLength(1);
  });

  it('matches by runtime', () => {
    expect(filterManagers(managers, 'copaw')).toHaveLength(1);
  });

  it('returns empty for undefined', () => {
    expect(filterManagers(undefined, 'x')).toEqual([]);
  });
});

describe('sortManagers', () => {
  it('sorts by name', () => {
    const out = sortManagers([manager({ name: 'b' }), manager({ name: 'a' })], 'name');
    expect(out.map((m) => m.name)).toEqual(['a', 'b']);
  });

  it('sorts by phase', () => {
    const out = sortManagers(
      [manager({ name: 'a', phase: 'Running' }), manager({ name: 'b', phase: 'Pending' })],
      'phase',
    );
    expect(out[0].name).toBe('b');
  });

  it('sorts by runtime', () => {
    const out = sortManagers(
      [manager({ name: 'a', runtime: 'openclaw' }), manager({ name: 'b', runtime: 'copaw' })],
      'runtime',
    );
    expect(out[0].name).toBe('b');
  });

  it('does not mutate input', () => {
    const input = [manager({ name: 'b' }), manager({ name: 'a' })];
    sortManagers(input, 'name');
    expect(input[0].name).toBe('b');
  });
});

describe('getManagedTeams', () => {
  const teams = [team({ name: 'a', leaderName: 'm1' }), team({ name: 'b', leaderName: 'm2' })];

  it('returns teams led by manager', () => {
    expect(getManagedTeams(teams, 'm1').map((t) => t.name)).toEqual(['a']);
  });

  it('handles undefined', () => {
    expect(getManagedTeams(undefined, 'm1')).toEqual([]);
  });
});

describe('getManagedWorkers', () => {
  const teams = [team({ name: 'a', leaderName: 'm1' }), team({ name: 'b', leaderName: 'm2' })];
  const workers = [
    worker({ name: 'w1', team: 'a' }),
    worker({ name: 'w2', team: 'b' }),
    worker({ name: 'w3', team: '' }),
  ];

  it('returns workers in teams led by manager', () => {
    expect(getManagedWorkers(workers, teams, 'm1').map((w) => w.name)).toEqual(['w1']);
  });

  it('handles undefined workers', () => {
    expect(getManagedWorkers(undefined, teams, 'm1')).toEqual([]);
  });

  it('handles undefined teams', () => {
    expect(getManagedWorkers(workers, undefined, 'm1')).toEqual([]);
  });
});
