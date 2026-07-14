import { describe, it, expect } from 'vitest';
import type { ManagerResponse, TeamResponse, WorkerResponse } from '@/lib/agentteams-api';
import { buildRooms, filterRooms } from './room-builders';
import type { RoomInfo } from './room-info';

const team = (overrides: Partial<TeamResponse> = {}): TeamResponse => ({
  name: 't1',
  teamName: 'T1',
  description: '',
  phase: 'Active',
  admin: null,
  humanMembers: [],
  leaderName: '',
  leaderHeartbeat: null,
  workerIdleTimeout: '30m',
  teamRoomID: '!team:matrix',
  leaderDMRoomID: '',
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
  matrixUserID: '@w1:matrix',
  roomID: '!w1:matrix',
  message: '',
  team: 't1',
  role: '',
  ...overrides,
});

const manager = (overrides: Partial<ManagerResponse> = {}): ManagerResponse => ({
  name: 'm1',
  phase: 'Running',
  state: 'Running',
  model: 'gpt-4',
  runtime: 'openclaw',
  image: '',
  matrixUserID: '@m1:matrix',
  roomID: '!m1:matrix',
  version: '',
  message: '',
  welcomeSent: false,
  ...overrides,
});

describe('buildRooms', () => {
  it('returns empty when no data', () => {
    expect(buildRooms(undefined, undefined, undefined)).toEqual([]);
  });

  it('builds team rooms', () => {
    const rooms = buildRooms(undefined, [team({ name: 'alpha', teamRoomID: '!t1:matrix' })], undefined);
    expect(rooms).toHaveLength(1);
    expect(rooms[0].type).toBe('team');
    expect(rooms[0].parentTeam).toBe('alpha');
  });

  it('skips teams without teamRoomID', () => {
    const rooms = buildRooms(undefined, [team({ teamRoomID: '' })], undefined);
    expect(rooms).toEqual([]);
  });

  it('builds worker rooms with matrixUserID', () => {
    const rooms = buildRooms(
      [worker({ name: 'w1', roomID: '!w:matrix', matrixUserID: '@w:matrix' })],
      undefined,
      undefined,
    );
    expect(rooms).toHaveLength(1);
    expect(rooms[0].type).toBe('worker');
    expect(rooms[0].members).toEqual(['@w:matrix']);
  });

  it('skips workers without roomID', () => {
    const rooms = buildRooms([worker({ roomID: '' })], undefined, undefined);
    expect(rooms).toEqual([]);
  });

  it('builds manager rooms', () => {
    const rooms = buildRooms(undefined, undefined, [manager({ name: 'm1' })]);
    expect(rooms).toHaveLength(1);
    expect(rooms[0].type).toBe('manager');
  });

  it('combines all sources in order', () => {
    const rooms = buildRooms(
      [worker({ name: 'w' })],
      [team({ name: 't' })],
      [manager({ name: 'm' })],
    );
    expect(rooms.map((r) => r.type)).toEqual(['team', 'worker', 'manager']);
  });
});

describe('filterRooms', () => {
  const rooms: RoomInfo[] = [
    { id: '!a:matrix', name: 'Alpha Team', type: 'team', members: ['@alice:matrix'], parentTeam: 'alpha', phase: 'Active' },
    { id: '!b:matrix', name: 'Bob Worker', type: 'worker', members: ['@bob:matrix'], parentTeam: 'b', phase: 'Running' },
    { id: '!c:matrix', name: 'Charlie Manager', type: 'manager', members: ['@charlie:matrix'], matrixUserId: '@charlie:matrix', phase: 'Active' },
  ];

  it('returns all when filter empty', () => {
    expect(filterRooms(rooms, '')).toEqual(rooms);
  });

  it('matches by name case-insensitively', () => {
    expect(filterRooms(rooms, 'ALPHA')).toHaveLength(1);
  });

  it('matches by id', () => {
    expect(filterRooms(rooms, '!b:matrix')).toHaveLength(1);
  });

  it('matches by member', () => {
    expect(filterRooms(rooms, 'charlie')).toHaveLength(1);
  });

  it('returns empty for no match', () => {
    expect(filterRooms(rooms, 'zzz')).toEqual([]);
  });
});
