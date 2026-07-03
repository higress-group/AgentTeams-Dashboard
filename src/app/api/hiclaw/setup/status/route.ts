import { NextRequest, NextResponse } from 'next/server';
import { getControllerUrl, proxyToHiClaw } from '../../proxy-helper';

// GET /api/hiclaw/setup/status - Return the controller's persisted setup state.
export async function GET(request: NextRequest) {
  const controllerUrl = getControllerUrl(request);
  const res = await proxyToHiClaw(request, controllerUrl, '/api/v1/setup/status', {
    method: 'GET',
    forwardBody: false,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => 'Failed to load setup status');
    return NextResponse.json({ error: text }, { status: res.status });
  }

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data);
}
