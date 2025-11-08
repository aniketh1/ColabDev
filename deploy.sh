#!/bin/bash

# ColabDev Deployment Script
echo "🚀 Deploying ColabDev with Real-Time Collaboration..."

# Check if changes are staged
git status

# Add all changes
echo "📦 Adding files..."
git add .

# Commit with message
echo "💾 Committing changes..."
git commit -m "✨ Add real-time collaboration with Socket.io

Features:
- Live code editing with CodeMirror
- Real-time sync across multiple users
- Auto-save to S3 after 2 seconds
- User presence indicators
- Toast notifications for collaboration events
- Collision detection to prevent update loops"

# Push to GitHub
echo "🔼 Pushing to GitHub..."
git push origin main

echo "✅ Done! Vercel will auto-deploy from GitHub."
echo "🌐 Check your Vercel dashboard for deployment status."
