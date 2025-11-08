# 🚀 Quick Start - Test AWS S3 Integration

## ✅ Everything is Ready! Let's Test It

Your One Editor now uses AWS S3 for file storage. Let's verify it works!

---

## 🎯 **5-Minute Test**

### **Step 1: Make Sure Server is Running**

If not running, start it:
```bash
cd "d:\Capstone github one editor\one-editor-main"
npm run dev
```

Wait for: **✓ Ready in [time]**

---

### **Step 2: Open the Application**

Go to: **http://localhost:3000**

---

### **Step 3: Create a Test Project**

1. **Login** with your account (aniketkorwa@gmail.com)
2. Click **"Create New Project"**
3. Name it: **"S3 Test Project"**
4. Click **Create**

**Expected:** Project created successfully ✅

---

### **Step 4: Verify S3 Upload** (2 ways)

#### **Option A: Check AWS Console**
1. Go to: https://s3.console.aws.amazon.com/
2. Click bucket: `colabdev-project-files-2025`
3. Navigate to: `users/` → `[your-user-id]/` → `projects/` → `[project-id]/`
4. **You should see:** `index.html`, `style.css`, `script.js` ✅

#### **Option B: Use AWS CLI** (if installed)
```bash
aws s3 ls s3://colabdev-project-files-2025/ --recursive
```

**Expected output:**
```
users/690f8a76913d2723e23285d2/projects/[id]/index.html
users/690f8a76913d2723e23285d2/projects/[id]/style.css
users/690f8a76913d2723e23285d2/projects/[id]/script.js
```

---

### **Step 5: Test Editing**

1. **Open the project** in editor
2. Click on `index.html`
3. **Change something** (e.g., add `<h1>Testing S3!</h1>`)
4. The file should **auto-save**

---

### **Step 6: Test Preview**

1. Click the **"Browser"** or **"Preview"** button
2. **You should see:** Your HTML page rendered ✅
3. Your changes should appear!

---

## ✅ **Success Checklist**

Check all these:
- [ ] Project created without errors
- [ ] Files appear in S3 bucket (AWS console or CLI)
- [ ] Can edit files in editor
- [ ] Changes are saved
- [ ] Preview works correctly
- [ ] No errors in browser console
- [ ] No errors in server console

**All checked?** → AWS S3 integration is working perfectly! 🎉

---

## 🐛 **If Something Goes Wrong**

### **No files in S3?**

**Check server console** for errors like:
- `AccessDenied` → Check AWS credentials
- `NoSuchBucket` → Verify bucket name
- `InvalidAccessKeyId` → Check Access Key

**Fallback:** System automatically saves to MongoDB if S3 fails

---

### **Can't see preview?**

1. **Open browser dev tools** (F12)
2. Check **Console** for errors
3. Check **Network** tab for failed requests

**Common fix:** Wait a few seconds for S3 sync

---

### **Server errors?**

Check terminal for:
```
S3 Upload Error: [error message]
```

**Solution:**
- Verify `.env.local` has correct AWS credentials
- Check AWS region matches bucket region
- Verify IAM permissions

---

## 📊 **What's Happening Behind the Scenes?**

### **When you create a project:**
```
1. Next.js API creates project in MongoDB
2. Uploads 3 files to S3:
   - users/{userId}/projects/{projectId}/index.html
   - users/{userId}/projects/{projectId}/style.css
   - users/{userId}/projects/{projectId}/script.js
3. Saves file metadata in MongoDB
4. Returns success
```

### **When you edit a file:**
```
1. Editor sends content to API
2. API uploads to S3 (overwrites existing)
3. Updates timestamp in MongoDB
4. Returns success
```

### **When you preview:**
```
1. Browser requests file from API
2. API checks MongoDB for file metadata
3. If storageType = 's3', fetches from S3
4. Returns file content
5. Browser renders it
```

---

## 🎊 **You're Done!**

If everything worked:
1. ✅ S3 integration is live
2. ✅ Files are being stored in AWS
3. ✅ Your app is production-ready

---

## 💡 **Pro Tips**

### **Monitor S3 Usage:**
```bash
# Check bucket size
aws s3 ls s3://colabdev-project-files-2025/ --recursive --summarize

# Output shows:
# Total Objects: X
# Total Size: X bytes
```

### **View a specific file:**
```bash
aws s3 cp s3://colabdev-project-files-2025/users/[userId]/projects/[projectId]/index.html -
```

### **Clean up test projects:**
```bash
aws s3 rm s3://colabdev-project-files-2025/users/[userId]/projects/[projectId]/ --recursive
```

---

## 📚 **More Information**

- **Full Documentation:** See `AWS_S3_INTEGRATION.md`
- **Summary:** See `INTEGRATION_SUMMARY.md`
- **Original Setup:** See `SETUP_GUIDE.md`

---

## 🎉 **Congratulations!**

Your One Editor is now powered by AWS S3! 

**Enjoy:**
- ⚡ Faster performance
- 💰 Lower costs
- 📈 Better scalability
- 🚀 Production-ready infrastructure

**Happy coding!** 🎊
