# Socket.io on Vercel - Important Notice

## ⚠️ The Problem

**Socket.io does NOT work on Vercel's serverless infrastructure by default** because:

1. Vercel uses **serverless functions** that don't maintain persistent connections
2. WebSocket connections require **stateful servers** that stay alive
3. Vercel's functions are **ephemeral** - they spin up and down on each request

## 🔧 Current Implementation

The application now has **graceful degradation**:

### Local Development (✅ Works)
- Socket.io enabled on `localhost`
- Real-time collaboration features active
- Live editing and auto-save working

### Vercel Production (⚠️ Disabled by default)
- Socket.io automatically disabled
- App works without real-time features
- Manual save only (still works perfectly)
- No connection errors in console

## 🚀 Solutions for Production Real-time Collaboration

### Option 1: Use Pusher (Recommended) ⭐
**Pros:**
- Built for serverless
- Easy integration
- Free tier available
- Works perfectly on Vercel

**Implementation:**
```bash
npm install pusher pusher-js
```

**Setup:**
1. Sign up at https://pusher.com
2. Create a new app
3. Add credentials to `.env.local`:
```
PUSHER_APP_ID=your-app-id
PUSHER_KEY=your-key
PUSHER_SECRET=your-secret
PUSHER_CLUSTER=your-cluster
```

### Option 2: Deploy Socket.io Server Separately
**Host Socket.io on a service that supports WebSockets:**

#### Railway (Recommended)
```bash
# 1. Create a separate Socket.io server repo
# 2. Deploy to Railway
# 3. Set NEXT_PUBLIC_SOCKET_URL in Vercel
```

#### Render.com
- Free tier with persistent connections
- Easy deployment from GitHub

#### AWS EC2 / DigitalOcean
- Full control
- More setup required

**Then update `.env.local` in Vercel:**
```
NEXT_PUBLIC_ENABLE_SOCKET=true
NEXT_PUBLIC_SOCKET_URL=https://your-socket-server.railway.app
```

### Option 3: Use Supabase Realtime
**Pros:**
- Free tier
- Built-in PostgreSQL database
- Real-time subscriptions

**Implementation:**
```bash
npm install @supabase/supabase-js
```

### Option 4: Use Ably
**Pros:**
- Purpose-built for real-time
- Free tier: 6M messages/month
- Global edge network

**Implementation:**
```bash
npm install ably
```

## 🎯 Quick Fix Applied

The code has been updated to:

1. **Detect Environment**: Automatically disables Socket.io on Vercel
2. **Graceful Degradation**: App works without real-time features
3. **No Errors**: Clean console, no connection failures
4. **Environment Variable**: Set `NEXT_PUBLIC_ENABLE_SOCKET=true` to override

## 📝 How to Enable Socket.io (If you have external server)

### Step 1: Update `useSocket.ts`
Modify the socket initialization to use external URL:

```typescript
const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin;

socket = io(socketUrl, {
  path: '/api/socket',
  transports: ['websocket', 'polling'],
});
```

### Step 2: Set Environment Variables in Vercel
```
NEXT_PUBLIC_ENABLE_SOCKET=true
NEXT_PUBLIC_SOCKET_URL=https://your-socket-server.com
```

### Step 3: Deploy Socket.io Server
Example server code for Railway/Render:

```javascript
// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Your socket event handlers here
  socket.on('join-project', (projectId) => {
    socket.join(`project:${projectId}`);
  });
  
  // ... rest of your handlers
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`);
});
```

## 🎨 Feature Status

### Without Socket.io (Current Vercel Setup)
✅ Project creation with tech stacks
✅ File editing with CodeMirror
✅ Manual save (Ctrl+S or auto-save after 2 seconds)
✅ File management (create, delete, rename)
✅ Code execution (HTML/CSS/JS preview)
✅ AWS S3 file storage
✅ MongoDB data persistence
❌ Real-time collaboration
❌ Live cursor tracking
❌ Instant updates across tabs

### With Socket.io (Localhost or External Server)
✅ Everything above PLUS:
✅ Real-time collaboration
✅ Live editing across multiple users
✅ User presence notifications
✅ Instant file updates
✅ Live cursor tracking (infrastructure ready)

## 🔍 Testing

### Test Local Development (Socket.io enabled)
```bash
npm run dev
# Open http://localhost:3000
# Real-time features should work
```

### Test Production (Socket.io disabled)
```bash
# Deploy to Vercel
# App should work without connection errors
# Manual save mode active
```

## 📚 Resources

- [Vercel WebSocket Limitations](https://vercel.com/docs/functions/limitations#websockets)
- [Pusher Documentation](https://pusher.com/docs)
- [Socket.io with Serverless](https://socket.io/docs/v4/server-deployment/#serverless)
- [Railway Deployment Guide](https://railway.app/docs)

## 🎯 Recommendation

For production on Vercel, I recommend:

1. **Short term**: Use the current setup (Socket.io disabled, manual save)
2. **Long term**: Migrate to **Pusher** for real-time features (best fit for Vercel)

OR

Deploy a separate Socket.io server on Railway (free tier available).

---

**Last Updated**: November 2025
**Status**: Socket.io gracefully disabled on Vercel
