'use client';

import { Button } from '@/components/ui/button';

export function PaginationFooter({
  pageKey,
  currentPage,
  totalPages,
  totalItems,
  label,
  onChange,
}: {
  pageKey: string;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  label: string;
  onChange: (_page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div
      key={pageKey}
      className="flex items-center justify-between text-xs text-muted-foreground pt-2"
    >
      <span>
        第 {currentPage} / {totalPages} 页 · 共 {totalItems} 个{label}
      </span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          disabled={currentPage <= 1}
          onClick={() => onChange(currentPage - 1)}
        >
          上一页
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          disabled={currentPage >= totalPages}
          onClick={() => onChange(currentPage + 1)}
        >
          下一页
        </Button>
      </div>
    </div>
  );
}
