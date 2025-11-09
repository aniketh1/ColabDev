'use client';

import { RoomProvider } from '@/lib/liveblocks';
import { ReactNode } from 'react';
import { ClientSideSuspense } from '@liveblocks/react';

interface LiveblocksProviderProps {
  roomId: string;
  children: ReactNode;
}

export function LiveblocksProvider({ roomId, children }: LiveblocksProviderProps) {
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
