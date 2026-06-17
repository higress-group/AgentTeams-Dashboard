'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { History, X, RefreshCw, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface WorkerEventsResponse {
  events?: Array<{
    ts?: string;
    type?: string;
    level?: string;
    message?: string;
    [k: string]: unknown;
  }>;
  items?: Array<{
    ts?: string;
    type?: string;
    level?: string;
    message?: string;
    [k: string]: unknown;
  }>;
}

async function fetchEvents(name: string): Promise<WorkerEventsResponse | null> {
  const res = await fetch(`/api/hiclaw/workers/${encodeURIComponent(name)}/events`, { cache: 'no-store' });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Trace fetch failed: ${res.status}`);
  return await res.json() as WorkerEventsResponse;
}

export const __test__ = { fetchEvents };

interface WorkerTraceDialogProps {
  workerName: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LEVEL_COLOR: Record<string, string> = {
  info: 'border-cyan-500/30 text-cyan-600 dark:text-cyan-400',
  warn: 'border-amber-500/30 text-amber-600 dark:text-amber-400',
  warning: 'border-amber-500/30 text-amber-600 dark:text-amber-400',
  error: 'border-rose-500/30 text-rose-600 dark:text-rose-400',
  debug: 'border-slate-500/30 text-slate-500',
};

export function WorkerTraceDialog({ workerName, open, onOpenChange }: WorkerTraceDialogProps) {
  const query = useQuery({
    queryKey: ['worker-trace', workerName],
    queryFn: () => fetchEvents(workerName ?? ''),
    enabled: open && !!workerName,
    refetchInterval: open ? 5_000 : false,
    retry: 1,
  });

  const events = query.data
    ? (query.data.events ?? query.data.items ?? [])
    : null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.15 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(720px,92vw)] max-h-[80vh] rounded-2xl border border-border bg-card shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            <header className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2 min-w-0">
                <History className="w-4 h-4 text-muted-foreground shrink-0" />
                <h3 className="text-sm font-semibold truncate">
                  Trace · <span className="font-mono">{workerName}</span>
                </h3>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => query.refetch()}
                  aria-label="Refresh trace"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${query.isFetching ? 'animate-spin' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onOpenChange(false)}
                  aria-label="Close"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            </header>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {query.isLoading ? (
                <p className="text-xs text-muted-foreground">Loading trace…</p>
              ) : query.isError ? (
                <div className="flex items-center gap-2 text-xs text-rose-500">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Failed to load trace; the worker or HiClaw controller may not expose events yet.</span>
                </div>
              ) : events === null ? (
                <p className="text-xs text-muted-foreground">
                  No trace endpoint available. The HiClaw controller does not yet expose worker events for this build.
                </p>
              ) : events.length === 0 ? (
                <p className="text-xs text-muted-foreground">No recent events.</p>
              ) : (
                <ol className="space-y-2 relative">
                  {events.map((ev, i) => {
                    const ts = typeof ev.ts === 'string' ? ev.ts : null;
                    const type = typeof ev.type === 'string' ? ev.type : 'event';
                    const level = typeof ev.level === 'string' ? ev.level : 'info';
                    const message = typeof ev.message === 'string' ? ev.message : '';
                    return (
                      <li key={`${ts ?? i}-${i}`} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 mt-1.5 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <Badge
                              variant="outline"
                              className={`text-[8px] px-1 py-0 h-3.5 ${LEVEL_COLOR[level] ?? LEVEL_COLOR.info}`}
                            >
                              {level}
                            </Badge>
                            <span className="font-mono text-[10px] text-muted-foreground">{type}</span>
                            {ts && <span className="text-[10px] text-muted-foreground/70">{ts}</span>}
                          </div>
                          {message && <p className="text-[11px] text-foreground/90 mt-0.5 break-words">{message}</p>}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function useWorkerTrace() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState<string | null>(null);
  return {
    openTrace: (workerName: string) => {
      setName(workerName);
      setOpen(true);
    },
    dialogProps: { workerName: name, open, onOpenChange: setOpen },
  };
}