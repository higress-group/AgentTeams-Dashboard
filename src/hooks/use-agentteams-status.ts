import { useQuery } from '@tanstack/react-query';
import { agentteamsApi } from '@/lib/agentteams-api';
import { useAgentTeamsStore } from '@/lib/agentteams-store';

export function useAgentTeamsStatus() {
  return useQuery({
    queryKey: ['agentteams-health'],
    queryFn: () => {
      const store = useAgentTeamsStore.getState();
      return agentteamsApi.checkHealth(store.controllerUrl);
    },
    refetchInterval: 15000,
    retry: 1,
    placeholderData: 'checking',
    throwOnError: false,
  });
}
