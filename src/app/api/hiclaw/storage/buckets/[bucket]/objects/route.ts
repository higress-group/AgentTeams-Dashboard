import { NextRequest } from 'next/server';
import { getControllerUrl, proxyToHiClaw } from '../../../../proxy-helper';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bucket: string }> }
) {
  const { bucket } = await params;
  const search = request.nextUrl.searchParams.toString();
  const query = search ? `?${search}` : '';
  return proxyToHiClaw(
    request,
    getControllerUrl(request),
    `/api/v1/storage/buckets/${encodeURIComponent(bucket)}/objects${query}`,
    { forwardBody: false }
  );
}
