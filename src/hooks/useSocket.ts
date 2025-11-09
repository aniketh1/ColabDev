'use client';
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

// Check if Socket.io should be enabled (only in development or if explicitly configured)
const isSocketEnabled = () => {
  // Disable Socket.io on Vercel production by default
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // Only enable on localhost or if NEXT_PUBLIC_ENABLE_SOCKET is set
    return hostname === 'localhost' || 
           hostname === '127.0.0.1' ||
           process.env.NEXT_PUBLIC_ENABLE_SOCKET === 'true';
  }
  return false;
};

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState('N/A');

  useEffect(() => {
    // Skip Socket.io initialization if not enabled
    if (!isSocketEnabled()) {
      console.log('ℹ️ Socket.io disabled (production mode)');
      return;
    }

    if (!socket) {
      // Initialize socket connection
      socket = io({
        path: '/api/socket',
        addTrailingSlash: false,
        transports: ['websocket', 'polling'], // Try WebSocket first
        reconnectionAttempts: 3, // Limit reconnection attempts
        timeout: 10000,
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
        console.warn('Socket connection error (falling back to manual save):', error.message);
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
