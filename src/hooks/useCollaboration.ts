'use client';
import { useEffect, useRef, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { useProjectRoom } from './useSocket';
import debounce from '@/lib/debounce';

interface CollaborationOptions {
  projectId: string;
  fileName: string;
  onContentUpdate: (content: string, socketId: string) => void;
  onUserJoined?: (socketId: string) => void;
  onUserLeft?: (socketId: string) => void;
  onFileSaved?: (fileName: string) => void;
}

export function useCollaboration({
  projectId,
  fileName,
  onContentUpdate,
  onUserJoined,
  onUserLeft,
  onFileSaved,
}: CollaborationOptions) {
  const { socket, isConnected } = useProjectRoom(projectId);
  const lastContentRef = useRef<string>('');
  const isRemoteUpdateRef = useRef(false);

  // Broadcast file changes to other users
  const broadcastChange = useCallback(
    debounce((content: string, cursorPosition?: any) => {
      // Gracefully handle when socket is not available
      if (!socket || !isConnected) {
        // Socket not available, skip broadcasting (manual save mode)
        return;
      }
      
      if (fileName && !isRemoteUpdateRef.current) {
        console.log('📤 Broadcasting change:', fileName);
        socket.emit('file-change', {
          projectId,
          fileName,
          content,
          cursorPosition,
        });
        lastContentRef.current = content;
      }
      isRemoteUpdateRef.current = false;
    }, 300),
    [socket, isConnected, projectId, fileName]
  );

  // Notify others when file is saved
  const notifyFileSaved = useCallback(() => {
    // Gracefully handle when socket is not available
    if (!socket || !isConnected || !fileName) {
      return;
    }
    
    console.log('💾 Notifying file saved:', fileName);
    socket.emit('file-saved', {
      projectId,
      fileName,
    });
  }, [socket, isConnected, projectId, fileName]);

  // Listen for remote updates
  useEffect(() => {
    if (!socket) return;

    const handleFileUpdate = ({ fileName: updatedFileName, content, socketId }: any) => {
      if (updatedFileName === fileName) {
        console.log('📥 Received remote update:', fileName);
        isRemoteUpdateRef.current = true;
        onContentUpdate(content, socketId);
        lastContentRef.current = content;
      }
    };

    const handleUserJoined = ({ socketId }: any) => {
      console.log('👋 User joined:', socketId);
      onUserJoined?.(socketId);
    };

    const handleUserLeft = ({ socketId }: any) => {
      console.log('👋 User left:', socketId);
      onUserLeft?.(socketId);
    };

    const handleFileSaveNotification = ({ fileName: savedFileName }: any) => {
      if (savedFileName === fileName) {
        console.log('💾 File saved by another user:', fileName);
        onFileSaved?.(fileName);
      }
    };

    socket.on('file-update', handleFileUpdate);
    socket.on('user-joined', handleUserJoined);
    socket.on('user-left', handleUserLeft);
    socket.on('file-save-notification', handleFileSaveNotification);

    return () => {
      socket.off('file-update', handleFileUpdate);
      socket.off('user-joined', handleUserJoined);
      socket.off('user-left', handleUserLeft);
      socket.off('file-save-notification', handleFileSaveNotification);
    };
  }, [socket, fileName, onContentUpdate, onUserJoined, onUserLeft, onFileSaved]);

  return {
    isConnected,
    broadcastChange,
    notifyFileSaved,
    socket,
  };
}
