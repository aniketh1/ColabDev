'use client';
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState('N/A');

  useEffect(() => {
    if (!socket) {
      // Initialize socket connection
      socket = io({
        path: '/api/socket',
        addTrailingSlash: false,
      });

      socket.on('connect', () => {
        console.log('✅ Socket connected:', socket?.id);
        setIsConnected(true);
      });

      socket.on('disconnect', () => {
        console.log('❌ Socket disconnected');
        setIsConnected(false);
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });

      // Check transport
      if (socket.io.engine) {
        setTransport(socket.io.engine.transport.name);

        socket.io.engine.on('upgrade', (transport: any) => {
          setTransport(transport.name);
        });
      }
    }

    return () => {
      // Don't disconnect on unmount, keep connection alive
    };
  }, []);

  return {
    socket,
    isConnected,
    transport,
  };
}

// Hook for joining/leaving project rooms
export function useProjectRoom(projectId: string | null) {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (socket && isConnected && projectId) {
      console.log('📁 Joining project room:', projectId);
      socket.emit('join-project', projectId);

      return () => {
        console.log('🚪 Leaving project room:', projectId);
        socket.emit('leave-project', projectId);
      };
    }
  }, [socket, isConnected, projectId]);

  return { socket, isConnected };
}
