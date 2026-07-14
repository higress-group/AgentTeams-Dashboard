// React hook for Agent Health Scoring
import { useMemo } from 'react';
import { computeAgentHealth, type AgentHealthScore } from '@/lib/agent-health';
import type { WorkerResponse } from '@/lib/agentteams-api';

/**
 * Compute health scores for a single worker.
 * Pure computation from cached data — no extra API call needed.
 */
export function useAgentHealth(worker: WorkerResponse | undefined | null): AgentHealthScore | null {
  return useMemo(() => {
    if (!worker) return null;
    return computeAgentHealth(worker);
  }, [worker]);
}

/**
 * Compute health scores for all workers.
 * Returns a map of worker name → health score.
 */
export function useAllAgentHealth(workers: WorkerResponse[] | undefined): Map<string, AgentHealthScore> {
  return useMemo(() => {
    const map = new Map<string, AgentHealthScore>();
    if (!workers) return map;
    for (const w of workers) {
      map.set(w.name, computeAgentHealth(w));
    }
    return map;
  }, [workers]);
}

/**
 * Get aggregate health statistics for a set of workers.
 */
export function useHealthSummary(workers: WorkerResponse[] | undefined): {
  avgScore: number;
  healthy: number;
  degraded: number;
  critical: number;
  total: number;
} {
  return useMemo(() => {
    if (!workers || workers.length === 0) {
      return { avgScore: 0, healthy: 0, degraded: 0, critical: 0, total: 0 };
    }

    let healthy = 0;
    let degraded = 0;
    let critical = 0;
    let totalScore = 0;

    for (const w of workers) {
      const h = computeAgentHealth(w);
      totalScore += h.overall;
      if (h.trend === 'healthy') healthy++;
      else if (h.trend === 'degraded') degraded++;
      else critical++;
    }

    return {
      avgScore: Math.round(totalScore / workers.length),
      healthy,
      degraded,
      critical,
      total: workers.length,
    };
  }, [workers]);
}
