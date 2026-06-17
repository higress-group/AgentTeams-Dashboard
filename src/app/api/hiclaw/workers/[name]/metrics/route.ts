import { NextRequest, NextResponse } from 'next/server';
import { getControllerUrl, getAuthToken, proxyToHiClaw } from '../../../proxy-helper';
import { metricsForWorker } from '@/lib/worker-fallback';

export async function GET(request: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const controllerUrl = getControllerUrl(request);

  // 1) Try the controller's native /api/v1/workers/{name}/metrics endpoint
  //    (e.g. once hiclaw-controller adds one upstream). On 2xx, pass through.
  const native = await proxyToHiClaw(
    request,
    controllerUrl,
    `/api/v1/workers/${encodeURIComponent(name)}/metrics`,
    { forwardBody: false },
  );

  if (native.status !== 404) {
    return native;
  }

  // 2) Fallback: synthesize a deterministic metrics sample from the worker
  //    resource. Lets the dashboard UI render MiniCard/Group without the
  //    controller needing container-level stats plumbing yet.
  const worker = await fetchWorker(controllerUrl, request, name);
  if (!worker) {
    return NextResponse.json(
      { message: `worker ${name} not found` },
      { status: 404 },
    );
  }
  const synth = metricsForWorker(worker);
  if (!synth) {
    return NextResponse.json(
      { message: `worker ${name} payload not recognized` },
      { status: 502 },
    );
  }
  return NextResponse.json(synth, { status: 200 });
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
