'use client';

import { Badge } from '@/components/ui/badge';
import { CopyButton } from '@/components/dashboard/copy-button';
import { StatusDot } from '@/components/dashboard/status-dot';
import { PhaseBadge, RuntimeBadge } from '@/components/dashboard/phase-badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RUNTIME_LABELS, WORKER_PHASE_BADGE_CLASSES } from '@/lib/phase-colors';
import type { ManagerResponse, TeamResponse, WorkerResponse } from '@/lib/hiclaw-api';
import { getManagedTeams, getManagedWorkers, getManagerSkills } from './manager-selectors';

const DETAIL_FIELDS: Array<[string, (_m: ManagerResponse) => string]> = [
  ['名称', (m) => m.name],
  ['状态', (m) => m.state],
  ['模型', (m) => m.model || '-'],
  ['运行时', (m) => RUNTIME_LABELS[m.runtime] || m.runtime || '-'],
  ['镜像', (m) => m.image || '-'],
  ['版本', (m) => m.version || '-'],
  ['欢迎消息', (m) => (m.welcomeSent ? '已发送' : '未发送')],
  ['消息', (m) => m.message || '-'],
];

function DetailRow({ label, value, copy }: { label: string; value: string; copy?: string }) {
  return (
    <div className="flex justify-between py-1 border-b border-border/50">
      <span className="text-muted-foreground">{label}</span>
      {copy ? (
        <div className="flex items-center gap-1 min-w-0 max-w-[60%]">
          <span className="font-mono text-xs truncate">{value}</span>
          <CopyButton text={copy} />
        </div>
      ) : (
        <span className="font-mono text-xs max-w-[60%] text-right break-all">{value}</span>
      )}
    </div>
  );
}

export function ManagerDetailDialog({
  manager,
  workers,
  teams,
  onOpenChange,
}: {
  manager: ManagerResponse | null;
  workers: WorkerResponse[];
  teams: TeamResponse[];
  onOpenChange: (_open: boolean) => void;
}) {
  const skills = manager ? getManagerSkills(manager) : [];
  const managedTeams = manager ? getManagedTeams(teams, manager.name) : [];
  const managedWorkers = manager ? getManagedWorkers(workers, teams, manager.name) : [];

  return (
    <Dialog open={!!manager} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-w-[95vw] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manager 详情 - {manager?.name}</DialogTitle>
        </DialogHeader>
        {manager && (
          <div className="space-y-3 py-4 text-sm">
            <div className="flex items-center gap-2 mb-3">
              <StatusDot phase={manager.phase} />
              <PhaseBadge kind="manager" phase={manager.phase} />
              <RuntimeBadge runtime={manager.runtime || ''} />
            </div>
            {DETAIL_FIELDS.map(([label, read]) => (
              <DetailRow key={label} label={label} value={read(manager)} />
            ))}
            <DetailRow
              label="Matrix 用户"
              value={manager.matrixUserID || '-'}
              copy={manager.matrixUserID || undefined}
            />
            <DetailRow
              label="房间 ID"
              value={manager.roomID || '-'}
              copy={manager.roomID || undefined}
            />
            <div className="pt-2">
              <p className="text-muted-foreground mb-2">技能</p>
              <div className="flex flex-wrap gap-1">
                {skills.map((skill) => (
                  <Badge key={skill} variant="outline" className="text-[10px]">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="pt-2">
              <p className="text-muted-foreground mb-2">协调的团队</p>
              <div className="flex flex-wrap gap-1">
                {managedTeams.length > 0 ? (
                  managedTeams.map((t) => (
                    <Badge key={t.name} variant="secondary" className="text-xs gap-1">
                      {t.name}
                      <Badge variant="outline" className="text-[8px] px-1 py-0 h-3.5">
                        {t.readyWorkers}/{t.totalWorkers}
                      </Badge>
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">-</span>
                )}
              </div>
            </div>
            <div className="pt-2">
              <p className="text-muted-foreground mb-2">协调的 Workers</p>
              <div className="flex flex-wrap gap-1">
                {managedWorkers.length > 0 ? (
                  managedWorkers.map((w) => (
                    <Badge
                      key={w.name}
                      variant="secondary"
                      className={`text-xs ${WORKER_PHASE_BADGE_CLASSES[w.phase] || ''}`}
                    >
                      {w.name}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">-</span>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
