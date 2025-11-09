import { Server as NetServer } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { Server as SocketIOServer } from 'socket.io';

export const config = {
  api: {
    bodyParser: false,
  },
};

let io: SocketIOServer | undefined;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!(res.socket as any)?.server?.io) {
    console.log('🚀 Initializing Socket.io server...');
    
    const httpServer: NetServer = (res.socket as any).server;
    io = new SocketIOServer(httpServer, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: process.env.NEXTAUTH_URL || 'https://colab-dev-rose.vercel.app',
        credentials: true,
      },
    });

    (res.socket as any).server.io = io;

    io.on('connection', (socket) => {
      console.log('👤 Client connected:', socket.id);

      socket.on('join-project', (projectId: string) => {
        socket.join(`project:${projectId}`);
        console.log(`📂 Socket ${socket.id} joined project:${projectId}`);
        
        socket.to(`project:${projectId}`).emit('user-joined', {
          socketId: socket.id,
          timestamp: Date.now(),
        });
      });

      socket.on('leave-project', (projectId: string) => {
        socket.leave(`project:${projectId}`);
        console.log(`👋 Socket ${socket.id} left project:${projectId}`);
        
        socket.to(`project:${projectId}`).emit('user-left', {
          socketId: socket.id,
          timestamp: Date.now(),
        });
      });

      socket.on('file-change', ({ projectId, fileName, content, cursorPosition }) => {
        console.log(`✏️ File change in ${fileName} by ${socket.id}`);
        
        socket.to(`project:${projectId}`).emit('file-update', {
          fileName,
          content,
          cursorPosition,
          socketId: socket.id,
          timestamp: Date.now(),
        });
      });

      socket.on('cursor-move', ({ projectId, fileName, position }) => {
        socket.to(`project:${projectId}`).emit('cursor-update', {
          socketId: socket.id,
          fileName,
          position,
        });
      });

      socket.on('file-select', ({ projectId, fileName }) => {
        socket.to(`project:${projectId}`).emit('file-selected', {
          socketId: socket.id,
          fileName,
        });
      });

      socket.on('file-saved', ({ projectId, fileName }) => {
        console.log(`💾 File saved: ${fileName} by ${socket.id}`);
        
        socket.to(`project:${projectId}`).emit('file-save-notification', {
          fileName,
          socketId: socket.id,
          timestamp: Date.now(),
        });
      });

      socket.on('disconnect', () => {
        console.log('❌ Client disconnected:', socket.id);
      });
    });
  } else {
    console.log('✅ Socket.io server already initialized');
    io = (res.socket as any).server.io;
  }

  res.end();
}