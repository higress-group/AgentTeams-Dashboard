import { NextRequest } from 'next/server';
import { getControllerUrl, proxyToAgentTeams } from '../../../proxy-helper';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyToAgentTeams(request, getControllerUrl(request), `/api/v1/gateway/consumers/${encodeURIComponent(id)}`, { forwardBody: false, method: 'DELETE' });
}
