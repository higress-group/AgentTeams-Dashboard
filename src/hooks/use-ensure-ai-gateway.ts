'use client';

import { useEffect, useRef } from 'react';

const ENSURE_AI_KEY = 'agentteams-ensure-ai-done';

/**
 * One-time hook: on first dashboard load, ensure the Higress AI gateway
 * is properly configured (consumer + AI route). This resolves the Envoy
 * listener warming issue that prevents Manager LLM calls.
 */
export function useEnsureAiGateway() {
  const attempted = useRef(false);

  useEffect(() => {
    // Only attempt once per session, and only if not already done
    if (attempted.current) return;
    if (typeof window !== 'undefined' && localStorage.getItem(ENSURE_AI_KEY) === 'true') {
      return;
    }
    attempted.current = true;

    fetch('/api/agentteams/setup/ensure-ai', { method: 'POST' })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          localStorage.setItem(ENSURE_AI_KEY, 'true');
        }
      })
      .catch(() => {
        // Silently fail - the gateway may already be configured
      });
  }, []);
}
