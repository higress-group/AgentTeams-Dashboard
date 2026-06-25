'use client';

import { UserCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const PHASE_TILES = [
  { key: 'Active', label: '活跃', color: 'text-green-500' },
  { key: 'Pending', label: '等待中', color: 'text-yellow-500' },
  { key: 'Failed', label: '失败', color: 'text-red-500' },
] as const;

export function PhaseDistribution({ stats }: { stats: Record<string, number> }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {PHASE_TILES.map(({ key, label, color }) => (
        <Card key={key} className="glass-card">
          <CardContent className="p-3 flex items-center gap-3">
            <UserCheck className={`w-5 h-5 ${color}`} aria-hidden="true" />
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-lg font-bold">{stats[key] || 0}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
