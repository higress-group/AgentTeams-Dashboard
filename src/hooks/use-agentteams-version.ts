import { useQuery } from '@tanstack/react-query';
import { agentteamsApi } from '@/lib/agentteams-api';
import type { VersionInfo } from '@/lib/agentteams-api';

export function useVersion() {
  return useQuery<VersionInfo | null>({
    queryKey: ['agentteams-version'],
    queryFn: () => agentteamsApi.getVersion(),
    refetchInterval: 300000,
    retry: 1,
    placeholderData: (previousData) => previousData,
    throwOnError: false,
  });
}
