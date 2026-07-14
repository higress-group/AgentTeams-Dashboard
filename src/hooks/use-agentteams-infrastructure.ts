import { useQuery } from '@tanstack/react-query';
import { agentteamsApi } from '@/lib/agentteams-api';
import type { InfrastructureInfo } from '@/lib/agentteams-api';

export function useInfrastructure() {
  return useQuery<InfrastructureInfo | null>({
    queryKey: ['agentteams-infrastructure'],
    queryFn: () => agentteamsApi.getInfrastructure(),
    refetchInterval: 30000,
    retry: 1,
    placeholderData: (previousData) => previousData,
    throwOnError: false,
  });
}
