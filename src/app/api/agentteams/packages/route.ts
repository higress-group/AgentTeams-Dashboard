import { NextRequest } from 'next/server';
import { getControllerUrl, proxyToAgentTeams } from '../proxy-helper';

export async function POST(request: NextRequest) {
  return proxyToAgentTeams(request, getControllerUrl(request), '/api/v1/packages', {
    contentType: 'multipart/form-data',
  });
}
