'use client';

import { Badge } from '@/components/ui/badge';
import {
  WORKER_PHASE_BADGE_CLASSES,
  WORKER_PHASE_LABELS,
  TEAM_PHASE_BADGE_CLASSES,
  TEAM_PHASE_LABELS,
  MANAGER_PHASE_BADGE_CLASSES,
  MANAGER_PHASE_LABELS,
  HUMAN_PHASE_BADGE_CLASSES,
  HUMAN_PHASE_LABELS,
  RUNTIME_LABELS,
} from '@/lib/phase-colors';

type ResourceKind = 'worker' | 'team' | 'manager' | 'human';

const PHASE_LABEL_MAPS = {
  worker: WORKER_PHASE_LABELS,
  team: TEAM_PHASE_LABELS,
  manager: MANAGER_PHASE_LABELS,
  human: HUMAN_PHASE_LABELS,
} as const;

const PHASE_CLASS_MAPS = {
  worker: WORKER_PHASE_BADGE_CLASSES,
  team: TEAM_PHASE_BADGE_CLASSES,
  manager: MANAGER_PHASE_BADGE_CLASSES,
  human: HUMAN_PHASE_BADGE_CLASSES,
} as const;

export interface PhaseBadgeProps {
  kind: ResourceKind;
  phase: string;
  className?: string;
}

export function PhaseBadge({ kind, phase, className }: PhaseBadgeProps) {
  const labelMap = PHASE_LABEL_MAPS[kind] as Record<string, string>;
  const classMap = PHASE_CLASS_MAPS[kind] as Record<string, string>;
  return (
    <Badge className={`${classMap[phase] || ''} ${className || ''}`.trim()} variant="secondary">
      {labelMap[phase] || phase}
    </Badge>
  );
}

export function RuntimeBadge({ runtime, className }: { runtime: string; className?: string }) {
  return (
    <Badge variant="outline" className={className || 'text-xs'}>
      {RUNTIME_LABELS[runtime] || runtime}
    </Badge>
  );
}
