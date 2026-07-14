import type { ManagerResponse, TeamResponse, WorkerResponse } from '@/lib/agentteams-api';
import type { SortKey } from './manager-types';

const RUNTIME_SKILLS: Record<string, string[]> = {
  openclaw: ['task_assignment', 'worker_coordination', 'progress_tracking', 'result_aggregation'],
  copaw: ['team_formation', 'conflict_resolution', 'load_balancing', 'skill_matching'],
  hermes: ['communication_relay', 'message_routing', 'realtime_coordination', 'stream_processing'],
  openhuman: ['human_approval', 'escalation', 'quality_assurance', 'audit_logging'],
};

const COMMON_SKILLS = ['health_monitoring', 'error_recovery'];
const FALLBACK_SKILLS = ['coordination', 'scheduling'];

export function getManagerSkills(manager: ManagerResponse): string[] {
  if (Array.isArray(manager.skills)) return manager.skills;
  const runtime = (manager.runtime || '').toLowerCase();
  for (const [key, skills] of Object.entries(RUNTIME_SKILLS)) {
    if (runtime.includes(key)) return [...skills, ...COMMON_SKILLS];
  }
  return [...FALLBACK_SKILLS, ...COMMON_SKILLS];
}

export function filterManagers(
  managers: ManagerResponse[] | undefined,
  searchQuery: string,
): ManagerResponse[] {
  if (!managers) return [];
  if (!searchQuery) return managers;
  const q = searchQuery.toLowerCase();
  return managers.filter(
    (m) =>
      (m.name || '').toLowerCase().includes(q) ||
      (m.model || '').toLowerCase().includes(q) ||
      (m.runtime || '').toLowerCase().includes(q),
  );
}

export function sortManagers(managers: ManagerResponse[], sortKey: SortKey): ManagerResponse[] {
  const sorted = [...managers];
  sorted.sort((a, b) => {
    switch (sortKey) {
      case 'name':
        return (a.name || '').localeCompare(b.name || '');
      case 'phase':
        return (a.phase || '').localeCompare(b.phase || '');
      case 'runtime':
        return (a.runtime || '').localeCompare(b.runtime || '');
      default:
        return 0;
    }
  });
  return sorted;
}

export function getManagedTeams(
  teams: TeamResponse[] | undefined,
  managerName: string,
): TeamResponse[] {
  return teams?.filter((t) => t.leaderName === managerName) || [];
}

export function getManagedWorkers(
  workers: WorkerResponse[] | undefined,
  teams: TeamResponse[] | undefined,
  managerName: string,
): WorkerResponse[] {
  const managedTeamNames = new Set(getManagedTeams(teams, managerName).map((t) => t.name));
  return workers?.filter((w) => managedTeamNames.has(w.team)) || [];
}
