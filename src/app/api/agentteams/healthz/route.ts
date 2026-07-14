import { NextRequest } from 'next/server';
import { getControllerUrl, proxyToAgentTeams } from '../proxy-helper';

// Proxy to the real AgentTeams controller /healthz endpoint.
// When no ?controllerUrl= is provided, the server-side AGENTTEAMS_CONTROLLER_URL
// env var is used, so the dashboard image works unchanged in both embedded
// (localhost) and Kubernetes (in-cluster service name) modes.
export async function GET(request: NextRequest) {
  const controllerUrl = getControllerUrl(request);
  const res = await proxyToAgentTeams(request, controllerUrl, '/healthz', {
    method: 'GET',
    forwardBody: false,
  });
  // Ensure the browser never caches the health check result.
  res.headers.set('cache-control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.headers.set('pragma', 'no-cache');
  res.headers.set('expires', '0');
  return res;
}
