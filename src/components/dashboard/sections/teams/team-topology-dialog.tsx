'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { ManagerResponse, TeamResponse, WorkerResponse } from '@/lib/hiclaw-api';
import { TeamTopologyDiagram } from './team-topology';

export function TeamTopologyDialog({
  team,
  workers,
  managers,
  onOpenChange,
}: {
  team: TeamResponse | null;
  workers: WorkerResponse[];
  managers: ManagerResponse[];
  onOpenChange: (_open: boolean) => void;
}) {
  return (
    <Dialog open={!!team} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-w-[95vw] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>团队拓扑 - {team?.name}</DialogTitle>
        </DialogHeader>
        {team && (
          <TeamTopologyDiagram team={team} workers={workers} managers={managers} />
        )}
      </DialogContent>
    </Dialog>
  );
}
