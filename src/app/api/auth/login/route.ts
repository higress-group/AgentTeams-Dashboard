// POST /api/auth/login - Authenticate via Higress Console
import { NextRequest, NextResponse } from 'next/server';
import { callHigressConsole, forwardCookies, getHigressConsoleURL, higressErrorResponse } from '../../higress/proxy-helper';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ success: false, error: 'Username and password are required' }, { status: 400 });
    }

    const consoleUrl = getHigressConsoleURL(request);

    // 1. Initialize Higress Console admin account (idempotent).
    // Ignore errors here: if the system is already initialized, login below
    // will still succeed with the correct credentials.
    try {
      await callHigressConsole('/system/init', {
        method: 'POST',
        body: {
          adminUser: {
            name: username,
            password,
            displayName: username,
          },
        },
        consoleUrl,
      });
    } catch {
      // continue to login attempt
    }

    // 2. Login to obtain the session cookie.
    const { response, body: loginBody } = await callHigressConsole('/session/login', {
      method: 'POST',
      body: { username, password },
      consoleUrl,
    });

    if (!response.ok) {
      return higressErrorResponse(response, loginBody);
    }

    // Forward Set-Cookie headers from Higress Console back to the browser.
    const responseHeaders = new Headers();
    responseHeaders.set('content-type', 'application/json');
    responseHeaders.set('cache-control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    forwardCookies(response.headers, responseHeaders);

    return new NextResponse(
      JSON.stringify({ success: true, user: { username } }),
      { status: 200, headers: responseHeaders }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}
