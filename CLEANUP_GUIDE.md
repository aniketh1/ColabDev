# Complete System Cleanup Guide

This guide will help you clean MongoDB, AWS S3, and Clerk to start fresh.

## Prerequisites

Make sure you have:
- MongoDB connection string in `.env.local`
- AWS credentials in `.env.local`
- Access to Clerk Dashboard
- Node.js installed

---

## Step 1: Clean MongoDB Database

### Option A: Using MongoDB Compass (GUI - Recommended)

1. Open **MongoDB Compass**
2. Connect using your connection string from `.env.local`
3. Select your database (likely named something like `colab-dev` or `one-editor`)
4. For each collection (`users`, `projects`, `files`):
   - Click on the collection
   - Click the "Delete" icon (trash can) in the toolbar
   - Confirm deletion
5. Verify all collections are empty

### Option B: Using MongoDB Shell

```bash
# Connect to MongoDB
mongosh "YOUR_MONGODB_CONNECTION_STRING"

# Switch to your database
use your-database-name

# Delete all documents from collections
db.users.deleteMany({})
db.projects.deleteMany({})
db.files.deleteMany({})

# Verify cleanup
db.users.countDocuments()  # Should return 0
db.projects.countDocuments()  # Should return 0
db.files.countDocuments()  # Should return 0
```

### Option C: Using Node.js Script

```bash
# Run the cleanup script
cd "d:\Capstone github one editor\one-editor-main"
node scripts/cleanup-mongodb.js
```

---

## Step 2: Clean AWS S3 Bucket

### Option A: Using AWS Console (GUI - Recommended)

1. Go to [AWS S3 Console](https://s3.console.aws.amazon.com/s3/)
2. Sign in with your AWS credentials
3. Find your bucket: `colabdev-project-files-2025`
4. Select all objects (checkbox at top)
5. Click "Delete" button
6. Type "permanently delete" to confirm
7. Click "Delete objects"

### Option B: Using AWS CLI

```bash
# Install AWS CLI if not already installed
# Download from: https://aws.amazon.com/cli/

# Configure AWS CLI (one-time setup)
aws configure
# Enter your AWS_ACCESS_KEY_ID
# Enter your AWS_SECRET_ACCESS_KEY
# Enter region: eu-north-1
# Enter output format: json

# Delete all objects in bucket
aws s3 rm s3://colabdev-project-files-2025/ --recursive

# Verify bucket is empty
aws s3 ls s3://colabdev-project-files-2025/
```

### Option C: Using Node.js Script

```bash
# Run the cleanup script
cd "d:\Capstone github one editor\one-editor-main"
node scripts/cleanup-s3.js
```

---

## Step 3: Clean Clerk Users

### Using Clerk Dashboard (Manual - Only Option)

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Sign in to your account
3. Select your application
4. Click **"Users"** in the left sidebar
5. For each test user:
   - Click on the user's row
   - Click the **"..."** (three dots) menu
   - Select **"Delete user"**
   - Confirm deletion
6. Repeat until all test users are deleted

**Note**: Clerk doesn't provide a bulk delete API for security reasons. You must delete users individually through the dashboard.

---

## Step 4: Verify Cleanup

Run these checks to ensure everything is clean:

### MongoDB Verification
```bash
mongosh "YOUR_CONNECTION_STRING"
use your-database-name

# Should all return 0
db.users.countDocuments()
db.projects.countDocuments()
db.files.countDocuments()
```

### S3 Verification
```bash
# Should return empty or "0 objects"
aws s3 ls s3://colabdev-project-files-2025/
```

### Clerk Verification
- Go to Clerk Dashboard → Users
- Should show "No users found" or empty list

---

## Step 5: Post-Cleanup Actions

After cleaning everything:

### 1. Fix Vercel Environment Variables

Go to [Vercel Dashboard](https://vercel.com/dashboard) → Your Project → Settings → Environment Variables

**Verify these variables are set for ALL environments (Production, Preview, Development):**

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_aGVscGVkLWRyYWtlLTQ3LmNsZXJrLmFjY291bnRzLmRldiQ

CLERK_SECRET_KEY=sk_test_q0aMMmkSXQ1ljJauWr1Lf32n2F0AnZ7UxVxITP2DZR

CLERK_WEBHOOK_SECRET=whsec_aOYzkxKIc+cIFeggzgD8E/oJLa2b1BZN

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in

NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard

NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

**IMPORTANT**: 
- Click "Save" after adding each variable
- Make sure to select all three environment types for each variable
- After saving all variables, redeploy your application

### 2. Configure Clerk Webhook

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/) → Your App → **Webhooks**
2. Click **"Add Endpoint"**
3. Enter endpoint URL: `https://colab-dev-rose.vercel.app/api/webhooks/clerk`
4. Subscribe to these events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
5. Click **"Create"**
6. Copy the **Signing Secret** (starts with `whsec_`)
7. Add it to Vercel as `CLERK_WEBHOOK_SECRET` (if not already added)

### 3. Test Locally First

```bash
# Navigate to project
cd "d:\Capstone github one editor\one-editor-main"

# Start development server
npm run dev
```

Visit: http://localhost:3000

Test:
1. Click "Sign Up" → Create new account
2. Check Clerk Dashboard → Users (should see new user)
3. Check MongoDB → users collection (should have new user with clerkId)
4. Try accessing /dashboard (should work)
5. Create a project (should work)
6. Create a file (should save to S3)

### 4. Deploy to Vercel

```bash
# Commit changes
git add .
git commit -m "Clean setup with Clerk integration"

# Push to trigger deployment
git push origin main
```

Monitor deployment at: https://vercel.com/dashboard

### 5. Test Production

After successful deployment:
1. Visit: https://colab-dev-rose.vercel.app
2. Sign up with a real email
3. Verify webhook fires (check Clerk Dashboard → Webhooks → Logs)
4. Verify user appears in MongoDB
5. Test full flow: create project → create file → edit → save

---

## Troubleshooting

### Vercel Build Still Fails with "Missing publishableKey"

**Cause**: Environment variables not propagated to build process

**Solutions**:
1. Double-check all 7 Clerk variables are in Vercel settings
2. Ensure they're checked for "Production", "Preview", AND "Development"
3. Click "Redeploy" button (don't just push code)
4. Try using Vercel CLI:
   ```bash
   npm i -g vercel
   vercel env pull .env.local
   vercel --prod
   ```

### MongoDB Connection Fails

**Check**:
- Connection string in `.env.local` is correct
- IP address is whitelisted in MongoDB Atlas (Network Access)
- Database user has read/write permissions

### S3 Cleanup Fails

**Check**:
- AWS credentials are correct in `.env.local`
- IAM user has `s3:DeleteObject` permission
- Bucket name is correct: `colabdev-project-files-2025`

### Clerk Webhook Not Firing

**Check**:
- Webhook endpoint URL is correct
- Endpoint is publicly accessible (test with curl)
- Events are subscribed: user.created, user.updated, user.deleted
- CLERK_WEBHOOK_SECRET matches the signing secret in dashboard

---

## Summary Checklist

- [ ] MongoDB collections deleted (users, projects, files)
- [ ] S3 bucket emptied (all project files removed)
- [ ] Clerk users deleted (all test accounts)
- [ ] Vercel environment variables verified (all 7 variables, all 3 environments)
- [ ] Clerk webhook configured (endpoint + 3 events)
- [ ] Local testing passed (signup, create project, create file)
- [ ] Production deployment successful (no build errors)
- [ ] Production testing passed (end-to-end flow works)

---

## Need Help?

If you encounter issues:
1. Check the specific troubleshooting section above
2. Review CLERK_INTEGRATION.md for detailed Clerk setup
3. Check Vercel deployment logs for specific errors
4. Verify .env.local has all required variables
5. Test locally before deploying to production

**You're starting fresh - everything will be clean and new! 🎉**
