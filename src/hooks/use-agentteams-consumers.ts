import { useQuery } from '@tanstack/react-query';
import { agentteamsApi } from '@/lib/agentteams-api';
import type { ConsumerResponse } from '@/lib/agentteams-api';

export function useConsumers() {
  return useQuery<ConsumerResponse[]>({
    queryKey: ['agentteams-consumers'],
    queryFn: () => agentteamsApi.listConsumers(),
    refetchInterval: 30000,
    retry: 1,
    placeholderData: (previousData) => previousData,
    throwOnError: false,
  });
}
