/**
 * Mocked integration tests for the Worker Trace surface.
 *
 * Verifies that the worker-trace fetch path tolerates Controller
 * upgrades: a 404 (no events endpoint yet) is treated as "absent"
 * and rendered as a soft placeholder, while a 5xx surfaces an error
 * that the user can retry. A 200 with a valid `events` array is
 * normalised into the timeline shape the dialog expects.
 *
 * These tests are mock-based so they exercise the component's
 * fetch boundary without depending on a live HiClaw Controller.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.restoreAllMocks();
});

describe('WorkerTraceDialog fetch path', () => {
  beforeEach(async () => {
    await import('@/components/dashboard/worker-trace');
  });

  it('returns null when the controller returns 404 (events endpoint absent)', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(new Response(null, { status: 404 })) as unknown as typeof fetch;
    const { __test__ } = await import('@/components/dashboard/worker-trace');
    const result = await __test__.fetchEvents('alice');
    expect(result).toBeNull();
  });

  it('throws when the controller returns 5xx (transient failure)', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(new Response('boom', { status: 503 })) as unknown as typeof fetch;
    const { __test__ } = await import('@/components/dashboard/worker-trace');
    await expect(__test__.fetchEvents('alice')).rejects.toThrow(/503/);
  });

  it('returns the parsed body on a successful 200 with `events` array', async () => {
    const body = { events: [{ ts: '2026-06-17T01:00:00Z', type: 'phase', level: 'info', message: 'woke up' }] };
    globalThis.fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status: 200 })) as unknown as typeof fetch;
    const { __test__ } = await import('@/components/dashboard/worker-trace');
    const result = await __test__.fetchEvents('alice');
    expect(result).not.toBeNull();
    expect(result?.events).toHaveLength(1);
    expect(result?.events?.[0].message).toBe('woke up');
  });

  it('returns the parsed body on a successful 200 with `items` array (legacy shape)', async () => {
    const body = { items: [{ ts: '2026-06-17T01:00:00Z', type: 'phase', level: 'info', message: 'hi' }] };
    globalThis.fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status: 200 })) as unknown as typeof fetch;
    const { __test__ } = await import('@/components/dashboard/worker-trace');
    const result = await __test__.fetchEvents('alice');
    expect(result?.items).toHaveLength(1);
  });

  it('encodes worker names with special characters in the URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 404 })) as unknown as typeof fetch;
    globalThis.fetch = fetchMock;
    const { __test__ } = await import('@/components/dashboard/worker-trace');
    await __test__.fetchEvents('worker with space');
    expect(fetchMock).toHaveBeenCalledWith('/api/hiclaw/workers/worker%20with%20space/events', { cache: 'no-store' });
  });
});