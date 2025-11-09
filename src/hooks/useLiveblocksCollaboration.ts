'use client';
import { useCallback } from 'react';
import debounce from '@/lib/debounce';

interface LiveblocksCollaborationOptions {
  fileName: string;
  onContentUpdate: (content: string, userId: string) => void;
  onUserJoined?: (userId: string, userInfo: any) => void;
  onUserLeft?: (userId: string) => void;
  onFileSaved?: (fileName: string) => void;
}

/**
 * Fallback collaboration hook when Liveblocks is not configured
 * Provides the same API but without actual collaboration features
 * The app works in "solo mode" - all changes are saved locally only
 */
export function useLiveblocksCollaboration({
  fileName,
  onContentUpdate,
  onUserJoined,
  onUserLeft,
  onFileSaved,
}: LiveblocksCollaborationOptions) {
  // Broadcast file changes (no-op when Liveblocks is disabled)
  const broadcastChange = useCallback(
    debounce((content: string, cursorPosition?: any) => {
      // No-op: Liveblocks not configured
      // In solo mode, changes are only saved locally via auto-save
    }, 300),
    [fileName]
  );

  // Notify others when file is saved (no-op when Liveblocks is disabled)
  const notifyFileSaved = useCallback(() => {
    // No-op: Liveblocks not configured
  }, [fileName]);

  // Return disconnected state since Liveblocks is not available
  return {
    isConnected: false,
    connectionStatus: 'disconnected' as const,
    activeUsers: 0,
    broadcastChange,
    notifyFileSaved,
    others: [],
  };
}
