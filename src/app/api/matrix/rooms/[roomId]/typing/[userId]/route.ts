// PUT /api/matrix/rooms/[roomId]/typing/[userId] - Send typing notification
import { NextRequest, NextResponse } from 'next/server';
import { getMatrixHomeserver, getAccessToken } from '../../../../proxy-helper';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string; userId: string }> }
) {
  try {
    const { roomId, userId } = await params;
    const homeserver = getMatrixHomeserver(request);
    const accessToken = getAccessToken(request);

    const body = await request.json();
    const encodedRoomId = encodeURIComponent(roomId);
    const encodedUserId = encodeURIComponent(userId);
    const targetUrl = `${homeserver}/_matrix/client/v3/rooms/${encodedRoomId}/typing/${encodedUserId}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const res = await fetch(targetUrl, {
        method: 'PUT',
        signal: controller.signal,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await res.arrayBuffer();
      const responseHeaders = new Headers();
      const resCT = res.headers.get('content-type');
      if (resCT) responseHeaders.set('content-type', resCT);

      return new NextResponse(data, {
        status: res.status,
        headers: responseHeaders,
      });
    } finally {
      clearTimeout(timeout);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
