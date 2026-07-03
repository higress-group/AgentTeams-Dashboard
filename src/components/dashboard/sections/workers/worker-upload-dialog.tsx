'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function WorkerUploadDialog({
  open,
  onOpenChange,
  isUploading,
  onFileChange,
}: {
  open: boolean;
  onOpenChange: (_open: boolean) => void;
  isUploading: boolean;
  onFileChange: (_file: File | null) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-w-[95vw]">
        <DialogHeader>
          <DialogTitle>上传包</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Label className="block mb-2">选择文件</Label>
          <Input
            type="file"
            onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
            disabled={isUploading}
          />
          {isUploading && <p className="text-sm text-muted-foreground mt-2">上传中...</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
