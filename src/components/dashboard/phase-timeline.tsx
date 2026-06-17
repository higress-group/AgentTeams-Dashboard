'use client';

import { Clock, ArrowRight, CircleAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useWorkerEvents } from '@/hooks/use-worker-events';
import { WORKER_PHASE_BADGE_CLASSES, WORKER_PHASE_LABELS } from '@/lib/phase-colors';
import { extractPhaseTimeline, type PhaseTimelineEntry } from '@/lib/phase-timeline';
import { cn } from '@/lib/utils';

interface PhaseTimelineProps {
  workerName: string;
  className?: string;
  refetchInterval?: number | false;
}

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(ms) || ms < 0) return iso;
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return `${sec} 秒前`;
  if (sec < 3600) return `${Math.floor(sec / 60)} 分钟前`;
  if (sec < 86400) return `${Math.floor(sec / 3600)} 小时前`;
  return `${Math.floor(sec / 86400)} 天前`;
}

function TimelineRow({ entry }: { entry: PhaseTimelineEntry }) {
  return (
    <li className="flex items-start gap-2.5 relative pl-5">
      <div className="absolute left-1 top-1.5 w-2 h-2 rounded-full bg-cyan-500/70 ring-2 ring-background" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          {entry.fromPhase && (
            <>
              <Badge variant="outline" className={cn('text-[9px] px-1 py-0 h-3.5', WORKER_PHASE_BADGE_CLASSES[entry.fromPhase])}>
                {WORKER_PHASE_LABELS[entry.fromPhase]}
              </Badge>
              <ArrowRight className="w-3 h-3 text-muted-foreground" />
            </>
          )}
          <Badge variant="outline" className={cn('text-[9px] px-1 py-0 h-3.5', WORKER_PHASE_BADGE_CLASSES[entry.toPhase])}>
            {WORKER_PHASE_LABELS[entry.toPhase]}
          </Badge>
          <span className="text-[10px] text-muted-foreground/70 font-mono">{timeAgo(entry.ts)}</span>
        </div>
        {entry.reason && <p className="text-[11px] text-foreground/80 mt-0.5 break-words">{entry.reason}</p>}
      </div>
    </li>
  );
}

export function PhaseTimeline({ workerName, className, refetchInterval = 5_000 }: PhaseTimelineProps) {
  const { data, isLoading, isError } = useWorkerEvents(workerName, { refetchInterval });

  if (isLoading) {
    return (
      <div className={cn('text-[11px] text-muted-foreground flex items-center gap-1.5', className)}>
        <Clock className="w-3 h-3 animate-pulse" />
        加载 phase 变更记录…
      </div>
    );
  }
  if (isError) {
    return (
      <div className={cn('text-[11px] text-rose-500 flex items-center gap-1.5', className)}>
        <CircleAlert className="w-3 h-3" />
        加载 phase 变更记录失败
      </div>
    );
  }
  if (!data) {
    return (
      <div className={cn('text-[11px] text-muted-foreground', className)}>
        暂无 phase 变更记录
      </div>
    );
  }
  const events = data.events ?? data.items ?? [];
  const entries = extractPhaseTimeline(events);
  if (entries.length === 0) {
    return (
      <div className={cn('text-[11px] text-muted-foreground', className)}>
        暂无 phase 变更记录
      </div>
    );
  }
  return (
    <ol className={cn('space-y-2 relative', className)}>
      <div className="absolute left-[7px] top-1.5 bottom-1.5 w-px bg-border" aria-hidden />
      {entries.map((entry, i) => (
        <TimelineRow key={`${entry.ts}-${i}`} entry={entry} />
      ))}
    </ol>
  );
}
