import { NextRequest, NextResponse } from 'next/server';
import { getControllerUrl, getAuthToken, proxyToHiClaw } from '../../../proxy-helper';
import { eventsForWorker } from '@/lib/worker-fallback';

export async function GET(request: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const controllerUrl = getControllerUrl(request);

  // 1) Try the controller's native /api/v1/workers/{name}/events endpoint
  //    (e.g. once hiclaw-controller adds one upstream). On 2xx, pass through.
  const native = await proxyToHiClaw(
    request,
    controllerUrl,
    `/api/v1/workers/${encodeURIComponent(name)}/events`,
    { forwardBody: false },
  );

  if (native.status !== 404) {
    return native;
  }

  // 2) Fallback: replay the worker's lifecycle as a small phase-event
  //    stream so PhaseTimeline has something to render. The events are
  //    deterministic per (name, phase) so UI ordering is stable.
  const worker = await fetchWorker(controllerUrl, request, name);
  if (!worker) {
    return NextResponse.json(
      { message: `worker ${name} not found` },
      { status: 404 },
    );
  }
  const events = eventsForWorker(worker);
  if (!events) {
    return NextResponse.json(
      { message: `worker ${name} payload not recognized` },
      { status: 502 },
    );
  }
  return NextResponse.json({ events }, { status: 200 });
}

async function fetchWorker(controllerUrl: string, request: NextRequest, name: string): Promise<unknown> {
  const saToken = getAuthToken();
  const incomingAuth = request.headers.get('authorization');
  const authToken = saToken || (incomingAuth ? incomingAuth.replace(/^Bearer\s+/i, '') : undefined);
  const headers: Record<string, string> = {};
  if (authToken) headers['authorization'] = `Bearer ${authToken}`;
  const res = await fetch(
    new URL(`/api/v1/workers/${encodeURIComponent(name)}`, controllerUrl).toString(),
    { headers, cache: 'no-store' },
  );
  if (res.status === 404) return null;
  if (!res.ok) return null;
  try {
    return await res.json();
  } catch {
    return null;
  }
}
