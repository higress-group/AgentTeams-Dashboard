// Shared proxy helper for Higress Console API routes
import { NextRequest, NextResponse } from 'next/server';

const TIMEOUT_MS = 15000;

// Allowed Higress Console URL hosts to prevent SSRF.
const ALLOWED_HOSTS = [
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  'higress-console',
  'higress-console.higress-system',
  'higress-console.higress-system.svc',
  'higress-console.higress-system.svc.cluster.local',
];

export function getHigressConsoleURL(request?: NextRequest): string {
  const fromEnv = process.env.HICLAW_AI_GATEWAY_ADMIN_URL;
  if (!request) {
    return fromEnv || 'http://127.0.0.1:8001';
  }

  const url = request.nextUrl.searchParams.get('consoleUrl');
  if (!url) {
    return fromEnv || 'http://127.0.0.1:8001';
  }

  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Invalid protocol');
    }
    if (
      !ALLOWED_HOSTS.includes(parsed.hostname) &&
      !parsed.hostname.endsWith('.svc') &&
      !parsed.hostname.endsWith('.svc.cluster.local') &&
      !parsed.hostname.endsWith('.cluster.local') &&
      !parsed.hostname.endsWith('.local')
    ) {
      throw new Error('Host not allowed');
    }
    return url;
  } catch {
    return fromEnv || 'http://127.0.0.1:8001';
  }
}

export function forwardCookies(sourceHeaders: Headers, targetHeaders: Headers): void {
  const setCookie = sourceHeaders.getSetCookie();
  for (const cookie of setCookie) {
    targetHeaders.append('Set-Cookie', cookie);
  }
}

export async function callHigressConsole(
  path: string,
  options: {
    method?: string;
    body?: string | Record<string, unknown>;
    cookie?: string | null;
    consoleUrl?: string;
  } = {}
): Promise<{ response: Response; body: unknown }> {
  const consoleUrl = options.consoleUrl || getHigressConsoleURL();
  const targetUrl = new URL(path, consoleUrl).toString();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const fetchOptions: RequestInit = {
      method: options.method || 'GET',
      signal: controller.signal,
      headers: {},
    };

    const headers = fetchOptions.headers as Record<string, string>;
    headers['Accept'] = 'application/json';
    if (options.cookie) {
      headers['Cookie'] = options.cookie;
    }

    if (options.body) {
      headers['Content-Type'] = 'application/json';
      fetchOptions.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
    }

    const response = await fetch(targetUrl, fetchOptions);
    clearTimeout(timeout);

    let body: unknown;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      body = await response.json().catch(() => null);
    } else {
      body = await response.text().catch(() => null);
    }

    return { response, body };
  } catch (err: unknown) {
    clearTimeout(timeout);
    const message =
      err instanceof Error && err.name === 'AbortError'
        ? 'Request timeout'
        : err instanceof Error
          ? err.message
          : 'Unknown error';
    throw new Error(message);
  }
}

export function higressErrorResponse(response: Response, body: unknown): NextResponse {
  const message =
    typeof body === 'object' && body !== null && 'message' in body && typeof body.message === 'string'
      ? body.message
      : typeof body === 'object' && body !== null && 'error' in body && typeof body.error === 'string'
        ? body.error
        : typeof body === 'string' && body
          ? body
          : `Higress Console returned HTTP ${response.status}`;
  return NextResponse.json({ success: false, error: message }, { status: response.status });
}
