'use client';
import { useEffect, useRef, useCallback } from 'react';
import {
  useMyPresence,
  useOthers,
  useBroadcastEvent,
  useEventListener,
  useStatus,
} from '@/lib/liveblocks';
import debounce from '@/lib/debounce';

interface LiveblocksCollaborationOptions {
  fileName: string;
  onContentUpdate: (content: string, userId: string) => void;
  onUserJoined?: (userId: string, userInfo: any) => void;
  onUserLeft?: (userId: string) => void;
  onFileSaved?: (fileName: string) => void;
}

export function useLiveblocksCollaboration({
  fileName,
  onContentUpdate,
  onUserJoined,
  onUserLeft,
  onFileSaved,
}: LiveblocksCollaborationOptions) {
  // Safely access Liveblocks hooks with error handling
  let myPresence: any = [null, () => {}];
  let others: any = [];
  let broadcast: any = () => {};
  let status: any = 'disconnected';

  try {
    const [presence, updatePresence] = useMyPresence();
    myPresence = [presence, updatePresence];
    others = useOthers();
    broadcast = useBroadcastEvent();
    status = useStatus();
  } catch (error) {
    console.warn('⚠️ Liveblocks not available, collaboration features disabled');
  }

  const [, updateMyPresence] = myPresence;
  
  const lastContentRef = useRef<string>('');
  const isRemoteUpdateRef = useRef(false);

  // Broadcast file changes to other users
  const broadcastChange = useCallback(
    debounce((content: string, cursorPosition?: any) => {
      if (status !== 'connected') {
        console.log('⚠️ Liveblocks not connected, skipping broadcast');
        return;
      }

      if (fileName && !isRemoteUpdateRef.current) {
        console.log('📤 Broadcasting change via Liveblocks:', fileName);
        broadcast({
          type: 'file-change',
          fileName,
          content,
          cursorPosition,
        });
        lastContentRef.current = content;
      }
      isRemoteUpdateRef.current = false;
    }, 300),
    [broadcast, status, fileName]
  );

  // Notify others when file is saved
  const notifyFileSaved = useCallback(() => {
    if (status !== 'connected' || !fileName) {
      return;
    }

    console.log('💾 Notifying file saved via Liveblocks:', fileName);
    broadcast({
      type: 'file-saved',
      fileName,
    });
  }, [broadcast, status, fileName]);

  // Update presence with current file
  useEffect(() => {
    if (fileName && status === 'connected') {
      updateMyPresence({
        currentFile: fileName,
      });
    }
  }, [fileName, status, updateMyPresence]);

  // Listen for file changes from other users
  useEventListener(({ event, user }) => {
    if (!event || typeof event !== 'object') return;
    
    const eventData = event as any;
    
    if (eventData.type === 'file-change') {
      const { fileName: eventFileName, content } = eventData;
      
      // Only process if it's for the current file
      if (eventFileName === fileName && content !== lastContentRef.current) {
        console.log('📥 Received file update from:', user?.info?.name || user?.id);
        isRemoteUpdateRef.current = true;
        onContentUpdate(content, String(user?.id || 'unknown'));
        lastContentRef.current = content;
      }
    } else if (eventData.type === 'file-saved') {
      const { fileName: eventFileName } = eventData;
      if (eventFileName === fileName) {
        console.log('💾 File saved by:', user?.info?.name || user?.id);
        if (onFileSaved) {
          onFileSaved(eventFileName);
        }
      }
    }
  });

  // Track users joining/leaving
  useEffect(() => {
    const previousCount = useRef(others.length);
    
    if (others.length > previousCount.current) {
      // Someone joined
      const newUser = others[others.length - 1];
      console.log('👤 User joined:', newUser?.info?.name || newUser?.id);
      if (onUserJoined && newUser && newUser.id) {
        onUserJoined(String(newUser.id), newUser.info);
      }
    } else if (others.length < previousCount.current) {
      // Someone left
      console.log('👋 User left the room');
      // Note: We can't identify which specific user left easily
      if (onUserLeft) {
        onUserLeft('unknown');
      }
    }
    
    previousCount.current = others.length;
  }, [others, onUserJoined, onUserLeft]);

  return {
    isConnected: status === 'connected',
    connectionStatus: status,
    activeUsers: others.length,
    broadcastChange,
    notifyFileSaved,
    others,
  };
}
