'use client';

import { createClient } from '@liveblocks/client';
import { createRoomContext } from '@liveblocks/react';

// Create Liveblocks client with authentication
const client = createClient({
  authEndpoint: '/api/liveblocks-auth',
  // Optional: throttle updates for better performance
  throttle: 100,
});

// Create Room context for React
export const {
  suspense: {
    RoomProvider,
    useRoom,
    useMyPresence,
    useUpdateMyPresence,
    useSelf,
    useOthers,
    useOthersMapped,
    useOthersConnectionIds,
    useOther,
    useBroadcastEvent,
    useEventListener,
    useErrorListener,
    useStorage,
    useHistory,
    useUndo,
    useRedo,
    useCanUndo,
    useCanRedo,
    useMutation,
    useStatus,
    useLostConnectionListener,
  },
} = createRoomContext(client);
