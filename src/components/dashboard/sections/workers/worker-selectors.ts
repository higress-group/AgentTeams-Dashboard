import type { WorkerResponse } from '@/lib/hiclaw-api';
import type { SortKey } from './worker-types';

export function filterWorkers(
  workers: WorkerResponse[] | undefined,
  searchQuery: string
): WorkerResponse[] {
  if (!workers) return [];
  if (!searchQuery) return workers;
  const q = searchQuery.toLowerCase();
  return workers.filter(
    (w) =>
      w.name?.toLowerCase().includes(q) ||
      w.model?.toLowerCase().includes(q) ||
      w.runtime?.toLowerCase().includes(q) ||
      w.team?.toLowerCase().includes(q)
  );
}

export function sortWorkers(workers: WorkerResponse[], sortKey: SortKey): WorkerResponse[] {
  const sorted = [...workers];
  sorted.sort((a, b) => {
    switch (sortKey) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'phase':
        return a.phase.localeCompare(b.phase);
      case 'runtime':
        return a.runtime.localeCompare(b.runtime);
      case 'team':
        return (a.team || '').localeCompare(b.team || '');
      default:
        return 0;
    }
  });
  return sorted;
}

export function paginateWorkers(
  workers: WorkerResponse[],
  page: number,
  pageSize: number
): { totalPages: number; safePage: number; items: WorkerResponse[] } {
  const totalPages = Math.max(1, Math.ceil(workers.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return { totalPages, safePage, items: workers.slice(start, start + pageSize) };
}

export function computeRuntimeDist(workers: WorkerResponse[] | undefined): Record<string, number> {
  const dist: Record<string, number> = {};
  workers?.forEach((w) => {
    dist[w.runtime] = (dist[w.runtime] || 0) + 1;
  });
  return dist;
}
