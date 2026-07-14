import { useQuery } from '@tanstack/react-query';
import { agentteamsApi } from '@/lib/agentteams-api';
import type { HumanResponse } from '@/lib/agentteams-api';

export function useHumans() {
  return useQuery<HumanResponse[]>({
    queryKey: ['agentteams-humans'],
    queryFn: () => agentteamsApi.listHumans(),
    refetchInterval: 15000,
    retry: 1,
    placeholderData: (previousData) => previousData,
    throwOnError: false,
  });
}
