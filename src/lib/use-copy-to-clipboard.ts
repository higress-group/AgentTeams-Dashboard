'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface UseCopyToClipboardOptions {
  resetMs?: number;
  onCopy?: (_text: string) => void;
}

export function useCopyToClipboard({ resetMs = 2000, onCopy }: UseCopyToClipboardOptions = {}) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setCopied(false), resetMs);
        onCopy?.(text);
        return true;
      } catch {
        setCopied(false);
        return false;
      }
    },
    [resetMs, onCopy]
  );

  return { copied, copy };
}
