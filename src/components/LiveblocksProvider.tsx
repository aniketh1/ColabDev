'use client';

import { RoomProvider } from '@/lib/liveblocks';
import { ReactNode, useEffect, useState } from 'react';
import { ClientSideSuspense } from '@liveblocks/react';
import { LiveblocksAvailabilityProvider } from '@/contexts/LiveblocksAvailabilityContext';

interface LiveblocksProviderProps {
  roomId: string;
  children: ReactNode;
}

export function LiveblocksProvider({ roomId, children }: LiveblocksProviderProps) {
  const [isChecking, setIsChecking] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);

  // Check if Liveblocks is available
  useEffect(() => {
    fetch('/api/liveblocks-auth', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room: roomId }) 
    })
      .then(res => {
        if (res.status === 503) {
          console.warn('⚠️ Liveblocks not configured, collaboration features disabled');
          setIsAvailable(false);
        } else if (res.ok) {
          console.log('✅ Liveblocks is configured and ready');
          setIsAvailable(true);
        } else {
          console.warn('⚠️ Liveblocks auth failed:', res.status);
          setIsAvailable(false);
        }
      })
      .catch((error) => {
        console.warn('⚠️ Liveblocks check failed:', error);
        setIsAvailable(false);
      })
      .finally(() => {
        setIsChecking(false);
      });
  }, [roomId]);

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking collaboration status...</p>
        </div>
      </div>
    );
  }

  // If Liveblocks is not configured, just render children without collaboration
  if (!isAvailable) {
    console.log('📝 Running in solo mode (no real-time collaboration)');
    return (
      <LiveblocksAvailabilityProvider isAvailable={false}>
        {children}
      </LiveblocksAvailabilityProvider>
    );
  }

  // Liveblocks is available, wrap with RoomProvider
  return (
    <LiveblocksAvailabilityProvider isAvailable={true}>
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
    </LiveblocksAvailabilityProvider>
  );
}
