'use client';

import { useState, useCallback } from 'react';
import { hiclawApi } from '@/lib/hiclaw-api';
import type { TroubleshootRequest } from '@/lib/hiclaw-api';

export function useTroubleshoot() {
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const diagnose = useCallback(
    async (request: TroubleshootRequest) => {
      setLoading(true);
      setAnswer('');
      setError(null);
      try {
        const res = await hiclawApi.troubleshoot(request);
        if (!res.body) {
          setAnswer('');
          return;
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let done = false;
        while (!done) {
          const { value, done: d } = await reader.read();
          done = d;
          if (value) {
            setAnswer((prev) => prev + decoder.decode(value, { stream: true }));
          }
        }
        setAnswer((prev) => prev + decoder.decode());
      } catch (err) {
        setError(err instanceof Error ? err.message : '诊断失败');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setAnswer('');
    setError(null);
    setLoading(false);
  }, []);

  return { answer, loading, error, diagnose, reset };
}
