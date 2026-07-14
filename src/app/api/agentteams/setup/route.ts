import { NextRequest, NextResponse } from 'next/server';
import { getControllerUrl, proxyToAgentTeams } from '../proxy-helper';

// POST /api/agentteams/setup - Persist first-boot setup (LLM API key etc.) and apply it.
export async function POST(request: NextRequest) {
  const controllerUrl = getControllerUrl(request);

  const res = await proxyToAgentTeams(request, controllerUrl, '/api/v1/setup', {
    method: 'POST',
    forwardBody: true,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => 'Failed to save setup');
    return NextResponse.json({ error: text }, { status: res.status });
  }

  const data = await res.json().catch(() => ({ success: true }));
  return NextResponse.json(data);
}
