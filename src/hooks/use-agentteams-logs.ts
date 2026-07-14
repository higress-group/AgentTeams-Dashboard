import { useQuery } from '@tanstack/react-query';
import { agentteamsApi } from '@/lib/agentteams-api';
import type { LogLine } from '@/lib/agentteams-api';

export function useLogs(
  component: string | null,
  options?: { tail?: number; since?: string; level?: string }
) {
  return useQuery<LogLine[]>({
    queryKey: ['agentteams-logs', component, options],
    queryFn: () => agentteamsApi.getLogs(component!, options),
    enabled: !!component,
    refetchInterval: 5000,
    retry: 1,
    placeholderData: (previousData) => previousData,
    throwOnError: false,
  });
}
