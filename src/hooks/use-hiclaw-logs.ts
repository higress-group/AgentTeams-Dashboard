import { useQuery } from '@tanstack/react-query';
import { hiclawApi } from '@/lib/hiclaw-api';
import type { LogLine } from '@/lib/hiclaw-api';

export function useLogs(
  component: string | null,
  options?: { tail?: number; since?: string; level?: string }
) {
  return useQuery<LogLine[]>({
    queryKey: ['hiclaw-logs', component, options],
    queryFn: () => hiclawApi.getLogs(component!, options),
    enabled: !!component,
    refetchInterval: 5000,
    retry: 1,
    placeholderData: (previousData) => previousData,
    throwOnError: false,
  });
}
