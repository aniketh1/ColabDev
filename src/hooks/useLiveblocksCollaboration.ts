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
 * Real-time collaboration hook - SOLO MODE VERSION
 * This version doesn't use Liveblocks (for when environment variable is not set)
 * All changes are saved locally only
 * For real-time collaboration, add LIVEBLOCKS_SECRET_KEY to your environment
 */
export function useLiveblocksCollaboration({
  fileName,
  onContentUpdate,
  onUserJoined,
  onUserLeft,
  onFileSaved,
}: LiveblocksCollaborationOptions) {
  
  // No-op broadcast (solo mode)
  const broadcastChange = useCallback(
    debounce((content: string, cursorPosition?: any) => {
      // Solo mode - no broadcasting needed
      console.log('� Solo mode: changes saved locally');
    }, 300),
    [fileName]
  );

  // No-op file saved notification (solo mode)
  const notifyFileSaved = useCallback(() => {
    // Solo mode - no notification needed
  }, [fileName]);

  return {
    isConnected: false,
    connectionStatus: 'disconnected' as const,
    activeUsers: 0,
    broadcastChange,
    notifyFileSaved,
    others: [],
  };
}
