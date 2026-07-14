import { useQuery } from '@tanstack/react-query';
import { agentteamsApi } from '@/lib/agentteams-api';
import type { ClusterStatus } from '@/lib/agentteams-api';

const defaultStatus: ClusterStatus = { kubeMode: false, totalWorkers: 0, totalTeams: 0, totalHumans: 0 };

export function useClusterStatus() {
  return useQuery<ClusterStatus>({
    queryKey: ['agentteams-cluster-status'],
    queryFn: () => agentteamsApi.getStatus(),
    refetchInterval: 15000,
    retry: 1,
    placeholderData: (previousData) => previousData ?? defaultStatus,
    throwOnError: false,
  });
}
