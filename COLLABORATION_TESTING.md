# Real-Time Collaboration Testing Guide

## Overview
Your ColabDev editor now supports **real-time collaboration** using Liveblocks. Multiple users can edit the same file simultaneously and see each other's changes instantly.

## Current Status
- ✅ Liveblocks configured in local environment (`.env.local`)
- ✅ Dual-mode system: real-time when configured, solo mode otherwise
- ✅ Graceful degradation (no crashes without env variable)
- ⚠️ **Needs Liveblocks key added to Vercel for production**

## How It Works

### Architecture
1. **LiveblocksAvailabilityContext**: Tracks if Liveblocks is configured
2. **LiveblocksProvider**: Checks auth endpoint, wraps editor with RoomProvider
3. **Two Hook Implementations**:
   - `useLiveblocksCollaborationReal`: Full real-time features (requires RoomProvider)
   - `useLiveblocksCollaboration`: Solo mode fallback (no dependencies)
4. **Smart Hook Selection**: Editor chooses hook based on availability

### Real-Time Features (when Liveblocks is configured)
- 📡 **Live broadcasting**: File changes sent to all collaborators (300ms debounce)
- 👥 **User presence**: Track who's in the room and what file they're editing
- 💾 **Save notifications**: Alert others when you save a file
- 🔴 **Connection status**: Visual indicator (green = live, gray = offline)
- 🎉 **Join/leave toasts**: Notifications when users enter/exit

### Fallback Mode (without Liveblocks)
- 📝 **Solo editing**: All changes saved locally via auto-save
- 🔄 **Database sync**: Changes visible after refresh
- ⚠️ **No live updates**: Must refresh to see other users' changes

## Testing Locally

### Option 1: Real-Time Mode (Recommended)
Your `.env.local` already has `LIVEBLOCKS_SECRET_KEY` configured, so collaboration should work immediately!

1. **Start the dev server**:
   ```bash
   npm run dev
   ```

2. **Open two browser windows**:
   - Window 1: `http://localhost:3000` (login as User 1)
   - Window 2: `http://localhost:3000` (login as User 2 - use incognito/private mode)

3. **Open the same project in both windows**:
   - Both users navigate to the same project editor
   - Open the same file (e.g., `src/App.jsx`)

4. **Test real-time features**:
   - ✅ Type in Window 1 → See changes appear in Window 2 (after 300ms)
   - ✅ Check connection indicator → Should show "Live" with green dot
   - ✅ Save file → Other window shows "File saved by [username]" toast
   - ✅ Close Window 1 → Window 2 shows "[username] left" toast

### Option 2: Solo Mode (No Liveblocks)
To test the fallback:

1. Temporarily rename `.env.local`:
   ```bash
   mv .env.local .env.local.backup
   ```

2. Create new `.env.local` without `LIVEBLOCKS_SECRET_KEY`:
   ```bash
   cp .env.local.backup .env.local
   # Remove the LIVEBLOCKS_SECRET_KEY line
   ```

3. Restart server and test:
   - Connection indicator shows "Offline"
   - Changes saved locally only
   - Refresh to see other users' changes

4. Restore original `.env.local`:
   ```bash
   mv .env.local.backup .env.local
   ```

## Deploy to Production (Vercel)

### Add Environment Variable
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your ColabDev project
3. Navigate to **Settings** → **Environment Variables**
4. Add new variable:
   - **Key**: `LIVEBLOCKS_SECRET_KEY`
   - **Value**: `sk_dev_SPC3fTtX1TPxOScbStylj0aIuAHDBnWiXSu_PI3ZCvVi1D35NnUnnTwRtmNC4ad3`
   - **Environments**: Check all (Production, Preview, Development)
5. Click **Save**
6. **Redeploy** your app (Settings → Deployments → Redeploy)

### Verify Production Deployment
1. Visit your production URL: `https://colab-dev-rose.vercel.app`
2. Open browser console
3. Look for logs:
   - ✅ `✅ Liveblocks is configured and ready`
   - ✅ `📤 Broadcasting change via Liveblocks`
   - ❌ `⚠️ Liveblocks not configured` (if env variable missing)

## Troubleshooting

### Issue: "Offline" indicator even with env variable set
**Solution**:
- Check `.env.local` has `LIVEBLOCKS_SECRET_KEY`
- Restart dev server (`npm run dev`)
- Clear browser cache
- Check browser console for errors

### Issue: Changes not appearing in other window
**Checklist**:
- ✅ Both users in same project?
- ✅ Both users editing same file?
- ✅ Connection indicator shows "Live"?
- ✅ Wait 300ms after typing (debounce delay)
- ✅ Check console for broadcast logs

### Issue: React error #321 on production
**This should be fixed!** If you still see it:
- Verify latest code is deployed
- Check Vercel build logs
- Ensure commit `6926b1a` is deployed

### Issue: 404 on `/api/code`
**This is expected in logs**. The endpoint exists but uses POST, not GET. The error happens when the preview iframe tries to load files directly.

### Issue: CORS errors for React previews
**Known limitation**: React projects need bundling before preview. The iframe tries to load `src/main.jsx` directly, which fails. This will be fixed in a future update with proper WebContainers integration.

## Console Messages Explained

### Normal Operation
- `✅ Liveblocks is configured and ready` - Auth successful
- `📤 Broadcasting change via Liveblocks: [filename]` - Your changes sent
- `📥 Received file update from: [username]` - Other user's changes received
- `💾 File saved by: [username]` - Save notification
- `👤 User joined: [username]` - Someone entered the room
- `👋 User left the room` - Someone exited

### Solo Mode
- `⚠️ Liveblocks not configured, collaboration features disabled` - No env variable
- `📝 Running in solo mode (no real-time collaboration)` - Using fallback
- `📝 Solo mode: changes saved locally` - Auto-save working

## Next Steps

### Immediate (Required for Production)
1. ✅ Commit and push (Done - commit `6926b1a`)
2. ⏳ Add `LIVEBLOCKS_SECRET_KEY` to Vercel environment
3. ⏳ Redeploy and verify "Live" indicator appears

### Future Enhancements
1. **Cursor positions**: Show where other users are typing
2. **User avatars**: Display profile pictures in editor
3. **Active file indicator**: See which files others are editing
4. **Presence list**: Sidebar with all active collaborators
5. **WebContainers for React**: Proper bundling for React/Vue previews
6. **Conflict resolution**: Handle simultaneous edits better

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Editor Page                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │       LiveblocksAvailabilityContext                   │  │
│  │  (tracks if Liveblocks is configured)                │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ↓                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            LiveblocksProvider                         │  │
│  │  • Checks /api/liveblocks-auth                       │  │
│  │  • Wraps with RoomProvider if available              │  │
│  │  • Provides children without wrapper if not          │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ↓                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              CodeEditor Component                     │  │
│  │  • Checks isAvailable from context                   │  │
│  │  • Chooses hook: Real or Solo                        │  │
│  └──────────────────────────────────────────────────────┘  │
│           ↓                            ↓                    │
│  ┌──────────────────┐      ┌─────────────────────────┐    │
│  │ useLiveblocks    │      │ useLiveblocks           │    │
│  │ CollaborationReal│      │ Collaboration (Solo)    │    │
│  │                  │      │                         │    │
│  │ • useMyPresence  │      │ • No-op broadcast       │    │
│  │ • useOthers      │      │ • Returns disconnected  │    │
│  │ • useBroadcast   │      │ • activeUsers: 0        │    │
│  │ • useEventListener│     │ • Local changes only    │    │
│  │ • Real-time sync │      │                         │    │
│  └──────────────────┘      └─────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## File Changes Summary

### New Files
- `src/contexts/LiveblocksAvailabilityContext.tsx` - Tracks Liveblocks availability
- `src/hooks/useLiveblocksCollaborationReal.ts` - Full real-time implementation

### Modified Files
- `src/hooks/useLiveblocksCollaboration.ts` - Solo mode fallback
- `src/components/LiveblocksProvider.tsx` - Added availability check
- `src/app/(dashboard)/editor/[projectId]/page.tsx` - Smart hook selection

## Questions?

If you encounter issues:
1. Check browser console for error messages
2. Verify environment variables are set
3. Ensure you're using the latest code (commit `6926b1a`)
4. Try in incognito mode to rule out caching

Happy collaborating! 🎉
