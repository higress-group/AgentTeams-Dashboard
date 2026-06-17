import { NextRequest } from 'next/server';
import { getControllerUrl, proxyToHiClaw } from '../../../proxy-helper';

export async function GET(request: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const url = `${getControllerUrl(request)}/api/v1/workers/${encodeURIComponent(name)}/events`;
  return proxyToHiClaw(request, url, '/api/v1/workers/.../events', { forwardBody: false });
}