# Quick Vercel Deployment Guide

## Prerequisites
- GitHub account
- Vercel account (free at https://vercel.com)
- Your code pushed to GitHub

## Step 1: Push to GitHub
```bash
# If not already initialized
git init
git add .
git commit -m "Initial commit with S3 integration"

# Create repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/one-editor.git
git branch -M main
git push -u origin main
```

## Step 2: Import to Vercel
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Vercel will auto-detect Next.js

## Step 3: Configure Environment Variables
Add these in Vercel dashboard → Settings → Environment Variables:

### Required Variables
```
MONGODB_URI=your-mongodb-connection-string
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=https://your-app.vercel.app
RESEND_API_KEY=your-resend-api-key
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_REGION=eu-north-1
AWS_S3_BUCKET_NAME=your-s3-bucket-name
```

> **Note**: Replace the placeholder values with your actual credentials from `.env.local`

## Step 4: Deploy
1. Click "Deploy"
2. Wait for build to complete (2-3 minutes)
3. Your app is live!

## Step 5: Update NEXTAUTH_URL
1. After first deployment, copy your Vercel URL
2. Update `NEXTAUTH_URL` environment variable with actual URL
3. Redeploy

## Advantages of Vercel Deployment
✅ No local build issues
✅ Automatic HTTPS
✅ Global CDN
✅ Automatic deployments on git push
✅ Preview deployments for pull requests
✅ Zero configuration needed
✅ Free for personal projects

## Build Settings (Auto-detected)
```
Framework Preset: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm install
Development Command: npm run dev
```

## Troubleshooting

### Build fails on Vercel too?
- Check environment variables are set correctly
- Ensure MongoDB accepts connections from all IPs (0.0.0.0/0)
- Verify AWS S3 bucket permissions

### Can't connect to MongoDB?
1. Go to MongoDB Atlas
2. Network Access → Add IP Address
3. Allow access from anywhere: `0.0.0.0/0`

### S3 uploads fail?
- Verify AWS credentials are correct
- Check S3 bucket CORS configuration
- Ensure bucket region matches `AWS_REGION`

## Alternative: Railway Deployment
If you prefer Railway:
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

## Post-Deployment Checklist
- [ ] App loads successfully
- [ ] Can login/register
- [ ] Can create projects
- [ ] Files upload to S3
- [ ] Code editor works
- [ ] Preview/run code works

## Custom Domain (Optional)
1. Go to Vercel project settings
2. Domains → Add domain
3. Follow DNS configuration instructions

---

**Estimated Time**: 5-10 minutes
**Cost**: Free (Vercel hobby plan)
**Status**: Recommended production deployment method
