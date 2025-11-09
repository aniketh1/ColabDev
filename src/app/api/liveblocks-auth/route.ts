import { Liveblocks } from '@liveblocks/node';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

// Initialize Liveblocks with your secret key (only if available)
let liveblocks: Liveblocks | null = null;

if (process.env.LIVEBLOCKS_SECRET_KEY && process.env.LIVEBLOCKS_SECRET_KEY.startsWith('sk_')) {
  liveblocks = new Liveblocks({
    secret: process.env.LIVEBLOCKS_SECRET_KEY,
  });
}

export async function POST(request: NextRequest) {
  try {
    // Check if Liveblocks is configured
    if (!liveblocks) {
      return NextResponse.json(
        { error: 'Liveblocks is not configured. Please add LIVEBLOCKS_SECRET_KEY to environment variables.' },
        { status: 503 }
      );
    }

    // Get the current user session
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the room ID from the request
    const { room } = await request.json();

    if (!room) {
      return NextResponse.json(
        { error: 'Room ID is required' },
        { status: 400 }
      );
    }

    // Create a session for the current user
    const sessionData = liveblocks.prepareSession(
      session.user.id, // User ID
      {
        userInfo: {
          name: session.user.name || 'Anonymous',
          email: session.user.email || '',
          avatar: session.user.image || '',
        },
      }
    );

    // Give the user access to the room
    sessionData.allow(room, sessionData.FULL_ACCESS);

    // Authorize the user and return the result
    const { status, body } = await sessionData.authorize();

    return new NextResponse(body, { status });
  } catch (error) {
    console.error('Liveblocks auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
