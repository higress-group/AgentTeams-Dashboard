import { NextRequest } from 'next/server';
import { getControllerUrl, proxyToHiClaw } from '../../proxy-helper';

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.toString();
  const query = search ? `?${search}` : '';
  return proxyToHiClaw(
    request,
    getControllerUrl(request),
    `/api/v1/storage/presign-download${query}`,
    { forwardBody: false }
  );
}

export async function POST(request: NextRequest) {
  return proxyToHiClaw(
    request,
    getControllerUrl(request),
    '/api/v1/storage/presign-upload'
  );
}
