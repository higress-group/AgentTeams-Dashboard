'use client';

import { LogIn, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ChatEmptyState({
  isLoggedIn,
  onLoginClick,
}: {
  isLoggedIn: boolean;
  onLoginClick: () => void;
}) {
  return (
    <div className="flex items-center justify-center h-full text-center p-8">
      <div>
        <MessageSquare className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" aria-hidden="true" />
        <h3 className="font-semibold text-lg mb-2">选择房间开始聊天</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          从左侧房间列表中选择一个 Matrix 房间，即可查看消息记录和发送消息。
          {isLoggedIn ? '' : ' 请先登录 Matrix 账号以发送消息。'}
        </p>
        {!isLoggedIn && (
          <Button variant="outline" className="mt-4" onClick={onLoginClick}>
            <LogIn className="w-4 h-4 mr-2" aria-hidden="true" />
            登录 Matrix
          </Button>
        )}
      </div>
    </div>
  );
}
