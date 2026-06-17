'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchMetrics, type WorkerMetrics } from '@/lib/worker-metrics';

export interface UseWorkerMetricsOptions {
  refetchInterval?: number | false;
}

export function useWorkerMetrics(name: string | null, options: UseWorkerMetricsOptions = {}) {
  const { refetchInterval = 30_000 } = options;
  return useQuery<WorkerMetrics | null>({
    queryKey: ['worker-metrics', name],
    queryFn: () => fetchMetrics(name ?? ''),
    enabled: !!name,
    refetchInterval,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    retry: 1,
    staleTime: typeof refetchInterval === 'number' ? Math.min(refetchInterval, 10_000) : 10_000,
  });
}
