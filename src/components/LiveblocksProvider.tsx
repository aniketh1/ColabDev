'use client';

import { RoomProvider } from '@/lib/liveblocks';
import { ReactNode, useEffect, useState } from 'react';
import { ClientSideSuspense } from '@liveblocks/react';

interface LiveblocksProviderProps {
  roomId: string;
  children: ReactNode;
}

export function LiveblocksProvider({ roomId, children }: LiveblocksProviderProps) {
  const [hasError, setHasError] = useState(false);

  // Check if Liveblocks is available
  useEffect(() => {
    fetch('/api/liveblocks-auth', { method: 'POST', body: JSON.stringify({ room: roomId }) })
      .then(res => {
        if (res.status === 503) {
          console.warn('⚠️ Liveblocks not configured, collaboration features disabled');
          setHasError(true);
        }
      })
      .catch(() => {
        // Silently handle errors
      });
  }, [roomId]);

  // If Liveblocks is not configured, just render children without collaboration
  if (hasError) {
    return <>{children}</>;
  }

  return (
    <RoomProvider
      id={roomId}
      initialPresence={{
        currentFile: null,
        cursor: null,
      }}
    >
      <ClientSideSuspense fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Connecting to collaboration room...</p>
          </div>
        </div>
      }>
        {children}
      </ClientSideSuspense>
    </RoomProvider>
  );
}
