import { useQuery } from '@tanstack/react-query';
import { agentteamsApi } from '@/lib/agentteams-api';
import type { ManagerResponse } from '@/lib/agentteams-api';

export function useManagers() {
  return useQuery<ManagerResponse[]>({
    queryKey: ['agentteams-managers'],
    queryFn: () => agentteamsApi.listManagers(),
    refetchInterval: 15000,
    retry: 1,
    placeholderData: (previousData) => previousData,
    throwOnError: false,
  });
}
