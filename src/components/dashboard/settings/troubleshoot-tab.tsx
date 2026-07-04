'use client';

import { useState } from 'react';
import { Stethoscope, Loader2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { useTroubleshoot } from '@/hooks/use-hiclaw-troubleshoot';
import { useInfrastructure } from '@/hooks/use-hiclaw-infrastructure';
import { useLogs } from '@/hooks/use-hiclaw-logs';

const COMPONENTS = [
  { value: 'controller', label: 'Controller' },
  { value: 'worker', label: 'Worker / Manager' },
  { value: 'matrix', label: 'Matrix' },
  { value: 'higress', label: 'Higress' },
  { value: 'minio', label: 'MinIO' },
  { value: 'dashboard', label: 'Dashboard' },
];

export function TroubleshootTab() {
  const { data: infra } = useInfrastructure();
  const [component, setComponent] = useState('controller');
  const [symptom, setSymptom] = useState('');
  const [copied, setCopied] = useState(false);
  const { answer, loading, error, diagnose, reset } = useTroubleshoot();

  const { data: logs } = useLogs(component, { tail: 50 });

  const handleDiagnose = () => {
    if (!symptom.trim()) return;
    const recentLogs = (logs || [])
      .slice(-20)
      .map((l) => `${l.timestamp} [${l.level.toUpperCase()}] ${l.message}`)
      .join('\n');
    diagnose({
      component,
      symptom: symptom.trim(),
      logs: recentLogs,
      infraSnapshot: infra || undefined,
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(answer);
    setCopied(true);
    toast.success('已复制诊断结果');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>选择组件</Label>
        <Select value={component} onValueChange={setComponent}>
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {COMPONENTS.map((c) => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>症状描述</Label>
        <Textarea
          value={symptom}
          onChange={(e) => setSymptom(e.target.value)}
          placeholder="例如：MinIO 健康检查失败，Worker 无法启动，Matrix 房间未生成..."
          rows={4}
        />
      </div>

      <div className="flex items-center gap-2">
        <Button onClick={handleDiagnose} disabled={loading || !symptom.trim()}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          <Stethoscope className="w-4 h-4 mr-2" />
          AI 诊断
        </Button>
        {answer && (
          <>
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              复制
            </Button>
            <Button variant="ghost" size="sm" onClick={reset}>
              清除
            </Button>
          </>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {answer && (
        <Card>
          <CardContent className="p-4">
            <ScrollArea className="h-80">
              <pre className="whitespace-pre-wrap text-sm font-mono">{answer}</pre>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
