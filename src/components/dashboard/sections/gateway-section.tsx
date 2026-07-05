'use client';

import { useState, useMemo } from 'react';
import {
  Shield,
  Key,
  Route,
  Plus,
  Trash2,
  Loader2,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { SectionHeader } from '@/components/dashboard/section-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { useConsumers } from '@/hooks/use-hiclaw-consumers';
import { useCreateConsumer, useDeleteConsumer } from '@/hooks/use-hiclaw-mutations';
import { useAiRoutes, useDeleteAiRoute } from '@/hooks/use-hiclaw-models';

export function GatewaySection() {
  const { data: consumers, isLoading: consumersLoading } = useConsumers();
  const { data: routes, isLoading: routesLoading } = useAiRoutes();
  const createConsumer = useCreateConsumer();
  const deleteConsumer = useDeleteConsumer();
  const deleteRoute = useDeleteAiRoute();

  const [showAddConsumer, setShowAddConsumer] = useState(false);
  const [consumerName, setConsumerName] = useState('');
  const [consumerKey, setConsumerKey] = useState('');

  const handleCreateConsumer = async () => {
    if (!consumerName.trim()) return;
    try {
      await createConsumer.mutateAsync({
        name: consumerName.trim(),
        password: consumerKey.trim() || `${consumerName.trim()}-${Date.now()}`,
      });
      toast.success(`Consumer "${consumerName}" 创建成功`);
      setConsumerName('');
      setConsumerKey('');
      setShowAddConsumer(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : '创建失败');
    }
  };

  const handleDeleteConsumer = async (id: string) => {
    if (!confirm(`确认删除 Consumer "${id}"？`)) return;
    try {
      await deleteConsumer.mutateAsync(id);
      toast.success('Consumer 已删除');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : '删除失败');
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="网关管理"
        description="管理 Higress API 网关的 Consumer（认证凭证）和 AI 路由"
      />

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="glass-card">
          <CardContent className="p-3 flex items-center gap-3">
            <Users className="w-8 h-8 text-violet-500" />
            <div>
              <p className="text-2xl font-bold">{consumers?.length ?? 0}</p>
              <p className="text-[10px] text-muted-foreground">Consumers</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-3 flex items-center gap-3">
            <Route className="w-8 h-8 text-cyan-500" />
            <div>
              <p className="text-2xl font-bold">{routes?.length ?? 0}</p>
              <p className="text-[10px] text-muted-foreground">AI 路由</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-3 flex items-center gap-3">
            <Shield className="w-8 h-8 text-emerald-500" />
            <div>
              <p className="text-2xl font-bold">
                {routes?.filter((r) => r.authConfig?.enabled).length ?? 0}
              </p>
              <p className="text-[10px] text-muted-foreground">已认证路由</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Consumers */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Consumers（认证凭证）</h3>
          <Button variant="outline" size="sm" onClick={() => setShowAddConsumer((v) => !v)}>
            <Plus className="w-3.5 h-3.5 mr-1" />
            添加 Consumer
          </Button>
        </div>

        {showAddConsumer && (
          <div className="flex items-end gap-2 p-3 border border-border rounded-lg bg-card/50">
            <div className="flex-1">
              <Label className="text-xs">名称</Label>
              <Input
                value={consumerName}
                onChange={(e) => setConsumerName(e.target.value)}
                placeholder="consumer-name"
                className="h-8 text-sm"
              />
            </div>
            <div className="flex-1">
              <Label className="text-xs">密码 (可选)</Label>
              <Input
                value={consumerKey}
                onChange={(e) => setConsumerKey(e.target.value)}
                placeholder="留空自动生成"
                type="password"
                className="h-8 text-sm"
              />
            </div>
            <Button
              size="sm"
              onClick={handleCreateConsumer}
              disabled={!consumerName.trim() || createConsumer.isPending}
            >
              {createConsumer.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : '创建'}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowAddConsumer(false)}>
              取消
            </Button>
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名称</TableHead>
              <TableHead>凭证</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {consumersLoading && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                  加载中...
                </TableCell>
              </TableRow>
            )}
            {!consumersLoading && consumers?.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  暂无 Consumer
                </TableCell>
              </TableRow>
            )}
            {consumers?.map((consumer) => (
              <TableRow key={consumer.name}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Key className="w-3.5 h-3.5 text-muted-foreground" />
                    {consumer.name}
                  </div>
                </TableCell>
                <TableCell>
                  {consumer.status && (
                    <Badge variant="outline" className="text-[10px]">
                      {consumer.status}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteConsumer(consumer.name)}
                    disabled={deleteConsumer.isPending}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* AI Routes */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">AI 路由</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名称</TableHead>
              <TableHead>路径</TableHead>
              <TableHead>上游</TableHead>
              <TableHead>认证</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {routesLoading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                  加载中...
                </TableCell>
              </TableRow>
            )}
            {!routesLoading && routes?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  暂无 AI 路由
                </TableCell>
              </TableRow>
            )}
            {routes?.map((route) => (
              <TableRow key={route.name}>
                <TableCell className="font-medium">{route.name}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {route.pathPredicate?.matchValue || '-'}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {route.upstreams?.map((u, i) => (
                      <Badge key={i} variant="secondary" className="text-[10px]">
                        {u.provider} ({u.weight}%)
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  {route.authConfig?.enabled ? (
                    <Badge variant="outline" className="text-[10px] text-emerald-500">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      启用
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteRoute.mutate(route.name)}
                    disabled={deleteRoute.isPending}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
