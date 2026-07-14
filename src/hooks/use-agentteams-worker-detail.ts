import { useQuery } from '@tanstack/react-query';
import { agentteamsApi } from '@/lib/agentteams-api';
import type { WorkerResponse } from '@/lib/agentteams-api';

export function useWorkerDetail(name: string | undefined) {
  return useQuery<WorkerResponse | null>({
    queryKey: ['agentteams-worker-detail', name],
    queryFn: () => agentteamsApi.getWorker(name!),
    enabled: !!name,
    refetchInterval: 15000,
    retry: 1,
    placeholderData: (previousData) => previousData,
    throwOnError: false,
  });
}
