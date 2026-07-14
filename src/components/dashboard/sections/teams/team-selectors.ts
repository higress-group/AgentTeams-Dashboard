import type { TeamResponse, WorkerResponse } from '@/lib/agentteams-api';
import type { SortKey } from './team-types';

export function filterTeams(
  teams: TeamResponse[] | undefined,
  searchQuery: string,
): TeamResponse[] {
  if (!teams) return [];
  if (!searchQuery) return teams;
  const q = searchQuery.toLowerCase();
  return teams.filter(
    (t) =>
      (t.name || '').toLowerCase().includes(q) ||
      (t.teamName || '').toLowerCase().includes(q) ||
      (t.description || '').toLowerCase().includes(q),
  );
}

export function sortTeams(teams: TeamResponse[], sortKey: SortKey): TeamResponse[] {
  const sorted = [...teams];
  sorted.sort((a, b) => {
    switch (sortKey) {
      case 'name':
        return (a.name || '').localeCompare(b.name || '');
      case 'phase':
        return (a.phase || '').localeCompare(b.phase || '');
      case 'readiness': {
        const ra = a.totalWorkers > 0 ? a.readyWorkers / a.totalWorkers : 0;
        const rb = b.totalWorkers > 0 ? b.readyWorkers / b.totalWorkers : 0;
        return rb - ra;
      }
      default:
        return 0;
    }
  });
  return sorted;
}

export function paginateTeams(
  teams: TeamResponse[],
  currentPage: number,
  pageSize: number,
): { items: TeamResponse[]; totalPages: number; safePage: number } {
  const totalPages = Math.max(1, Math.ceil(teams.length / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const start = (safePage - 1) * pageSize;
  return { items: teams.slice(start, start + pageSize), totalPages, safePage };
}

export function getAvailableWorkers(
  workers: WorkerResponse[] | undefined,
  teamName: string,
  currentWorkerNames: string[],
): WorkerResponse[] {
  if (!workers) return [];
  const inTeamSet = new Set(currentWorkerNames);
  return workers.filter((w) => !inTeamSet.has(w.name) && (!w.team || w.team === ''));
}

export function getWorkersForTeam(
  workers: WorkerResponse[] | undefined,
  teamName: string,
): WorkerResponse[] {
  return workers?.filter((w) => w.team === teamName) || [];
}
