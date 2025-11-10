# Clerk Authentication Integration

This project has been updated to use Clerk for authentication instead of NextAuth.

## ✅ What's Been Done

### 1. **Installed Clerk**
```bash
npm install @clerk/nextjs svix
```

### 2. **Environment Variables Added**
```env
# Clerk Authentication
CLERK_SECRET_KEY=sk_test_q0aMMmkSXQ1ljJauWr1Lf32n2F0AnZ7UxVxITP2DZR
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_aGVscGVkLWRyYWtlLTQ3LmNsZXJrLmFjY291bnRzLmRldiQ
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
CLERK_WEBHOOK_SECRET=your_webhook_secret_from_clerk_dashboard
```

### 3. **Files Created**
- ✅ `src/app/(auth)/sign-in/[[...sign-in]]/page.tsx` - Clerk sign-in page
- ✅ `src/app/(auth)/sign-up/[[...sign-up]]/page.tsx` - Clerk sign-up page
- ✅ `src/app/api/webhooks/clerk/route.ts` - Webhook for syncing users to MongoDB
- ✅ `src/lib/clerk.ts` - Helper functions for getting current user

### 4. **Files Updated**
- ✅ `src/middleware.ts` - Replaced NextAuth with Clerk middleware
- ✅ `src/app/layout.tsx` - Wrapped app with ClerkProvider
- ✅ `src/models/User.ts` - Updated schema to use Clerk ID
- ✅ `src/app/api/project/route.ts` - Updated to use Clerk auth
- ✅ `src/app/api/code/route.ts` - Updated to use Clerk auth
- ✅ `src/app/api/project-file/route.ts` - Updated to use Clerk auth
- ✅ `src/app/api/liveblocks-auth/route.ts` - Updated to use Clerk auth

### 5. **Authentication Flow**
- Users sign in/up through Clerk's hosted UI
- Clerk webhook syncs user data to MongoDB
- MongoDB stores: `clerkId`, `name`, `email`, `avatar`
- All API routes now use `getCurrentUser()` or `getCurrentUserId()` from Clerk

## 🔧 Setup Instructions

### Step 1: Configure Clerk Webhook

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Select your application
3. Navigate to **Webhooks** in the sidebar
4. Click **+ Add Endpoint**
5. Set the endpoint URL to: `https://your-domain.com/api/webhooks/clerk`
6. Subscribe to these events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
7. Copy the **Signing Secret** and add it to `.env.local` as `CLERK_WEBHOOK_SECRET`

### Step 2: Update Vercel Environment Variables

Add all the Clerk environment variables to your Vercel project:

```bash
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
CLERK_WEBHOOK_SECRET=whsec_...
```

### Step 3: Test the Integration

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Test Sign Up:**
   - Navigate to `http://localhost:3000/sign-up`
   - Create a new account
   - Verify you're redirected to `/dashboard`
   - Check MongoDB to confirm user was created

3. **Test Sign In:**
   - Sign out
   - Navigate to `http://localhost:3000/sign-in`
   - Sign in with your credentials
   - Verify you're redirected to `/dashboard`

4. **Test Protected Routes:**
   - Try accessing `/dashboard` without being signed in
   - Verify you're redirected to `/sign-in`

## 📝 Migration Notes

### What Changed
- **No more NextAuth** - All NextAuth code has been removed
- **No more password hashing** - Clerk handles password security
- **No more session tokens** - Clerk manages sessions automatically
- **Simplified auth flow** - Sign in/up is now handled by Clerk's UI

### User Model Changes
```typescript
// OLD (NextAuth)
{
  name: string;
  email: string;
  password: string; // Hashed
  picture: string;
  refreshToken: string;
}

// NEW (Clerk)
{
  clerkId: string; // Clerk user ID
  name: string;
  email: string;
  avatar: string;
}
```

### API Route Changes
```typescript
// OLD (NextAuth)
const session = await getServerSession(authOptions);
const userId = session.user.id;

// NEW (Clerk)
const userId = await getCurrentUserId();
```

## 🚀 Benefits of Clerk

1. **Better Security** - Clerk handles all password security, 2FA, and session management
2. **Social Logins** - Easy to add Google, GitHub, etc.
3. **User Management** - Built-in user management dashboard
4. **Webhooks** - Automatic sync to your database
5. **Session Management** - Better session handling and token refresh
6. **No Password Migration** - Users just sign up fresh with Clerk

## 🔒 Security

- Clerk uses industry-standard security practices
- Passwords are never stored in your database
- Sessions are managed securely by Clerk
- Webhook signatures are verified to prevent tampering

## 📚 Additional Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk Next.js Integration](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk Webhooks](https://clerk.com/docs/integration/webhooks)

## ⚠️ Important Notes

1. **Existing users will need to sign up again** - Old password-based accounts won't work
2. **Update production environment variables** on Vercel
3. **Configure Clerk webhook** to sync users to MongoDB
4. **Test thoroughly** before deploying to production

## 🐛 Troubleshooting

### Users not syncing to MongoDB
- Check that webhook is configured correctly in Clerk dashboard
- Verify `CLERK_WEBHOOK_SECRET` is correct
- Check server logs for webhook errors

### "Unauthorized" errors
- Make sure user is signed in via Clerk
- Check that Clerk environment variables are set
- Verify middleware is protecting the correct routes

### Redirect issues
- Check `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`
- Check `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`
- Make sure these point to valid routes in your app
