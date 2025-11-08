# 🎓 ColabDev Technical Architecture & Integration Guide

## 📚 Table of Contents
1. [Current Architecture Overview](#current-architecture-overview)
2. [MongoDB Integration Explained](#mongodb-integration-explained)
3. [AWS S3 Integration Explained](#aws-s3-integration-explained)
4. [How They Work Together](#how-they-work-together)
5. [StackBlitz WebContainers Integration](#stackblitz-webcontainers-integration)
6. [What's Missing in AWS Integration](#whats-missing-in-aws-integration)

---

## 🏗️ Current Architecture Overview

### **Hybrid Storage Model**
```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   MongoDB   │◄────►│  Next.js API │◄────►│   AWS S3    │
│  (Metadata) │      │   (Backend)  │      │  (Content)  │
└─────────────┘      └──────────────┘      └─────────────┘
      ▲                      ▲                     ▲
      │                      │                     │
  User Data            File Metadata         File Content
  Projects             References            Actual Code
  Authentication       Timestamps            Assets
```

---

## 🗄️ MongoDB Integration Explained

### **What MongoDB Stores:**

#### 1. **User Collection** (`users`)
```javascript
{
  _id: ObjectId,
  name: "Aniketh",
  email: "user@example.com",
  password: "hashed_password",
  createdAt: Date,
  updatedAt: Date
}
```

#### 2. **Project Collection** (`projects`)
```javascript
{
  _id: ObjectId,
  name: "My Website",
  userId: ObjectId (reference to user),
  isPublic: true/false,
  createdAt: Date,
  updatedAt: Date,
  lastOpened: Date
}
```

#### 3. **File Collection** (`files`)
```javascript
{
  _id: ObjectId,
  name: "index.html",
  extension: "html",
  content: "",  // EMPTY! Content is in S3
  projectId: ObjectId (reference to project),
  s3Key: "users/userId/projects/projectId/index.html",  // S3 path
  storageType: "s3",  // or "mongodb" for fallback
  createdAt: Date,
  updatedAt: Date
}
```

### **How MongoDB Works in Your App:**

1. **User Registration/Login:**
   ```
   User submits form → Next.js API → MongoDB stores user
   NextAuth verifies → Creates JWT session → User authenticated
   ```

2. **Creating a Project:**
   ```
   User clicks "Create Project"
   ↓
   API creates MongoDB document (project metadata)
   ↓
   API creates 3 files in S3 (index.html, style.css, script.js)
   ↓
   API creates 3 MongoDB documents (file metadata with s3Key)
   ↓
   Returns project to user
   ```

3. **Opening a Project:**
   ```
   User opens project
   ↓
   API fetches project from MongoDB
   ↓
   API fetches file metadata from MongoDB (gets s3Key)
   ↓
   API fetches actual content from S3 using s3Key
   ↓
   Editor displays code
   ```

### **Key MongoDB Operations:**

**File: `src/config/connectDB.ts`**
```typescript
// Establishes connection to MongoDB Atlas
mongoose.connect(MONGODB_URI)
```

**File: `src/models/*.ts`**
- Defines data structure (schema)
- Validates data
- Creates TypeScript types

**File: `src/app/api/*/route.ts`**
- CRUD operations (Create, Read, Update, Delete)
- Business logic
- Error handling

---

## ☁️ AWS S3 Integration Explained

### **What AWS S3 Stores:**

```
colabdev-project-files-2025/
├── users/
│   ├── userId1/
│   │   └── projects/
│   │       ├── projectId1/
│   │       │   ├── index.html
│   │       │   ├── style.css
│   │       │   └── script.js
│   │       └── projectId2/
│   │           ├── index.html
│   │           └── app.js
│   └── userId2/
│       └── projects/
│           └── projectId3/
```

### **How S3 Works:**

#### 1. **S3 Client Configuration** (`src/config/s3Client.ts`)
```typescript
// Creates authenticated connection to AWS
const s3Client = new S3Client({
    region: 'eu-north-1',
    credentials: {
        accessKeyId: 'YOUR_KEY',
        secretAccessKey: 'YOUR_SECRET'
    }
});
```

#### 2. **Upload File to S3** (`src/lib/s3Operations.ts`)
```typescript
// PutObjectCommand sends file to S3
const key = "users/userId/projects/projectId/index.html";
await s3Client.send(new PutObjectCommand({
    Bucket: "colabdev-project-files-2025",
    Key: key,
    Body: "<html>...</html>",
    ContentType: "text/html"
}));
```

#### 3. **Get File from S3**
```typescript
// GetObjectCommand retrieves file from S3
const response = await s3Client.send(new GetObjectCommand({
    Bucket: "colabdev-project-files-2025",
    Key: key
}));
const content = await response.Body.transformToString();
```

#### 4. **Delete File from S3**
```typescript
// DeleteObjectCommand removes file
await s3Client.send(new DeleteObjectCommand({
    Bucket: "colabdev-project-files-2025",
    Key: key
}));
```

### **S3 Operations Used:**

| Operation | Command | Used For |
|-----------|---------|----------|
| Upload | `PutObjectCommand` | Saving code files |
| Download | `GetObjectCommand` | Loading files in editor |
| Delete | `DeleteObjectCommand` | Removing single file |
| Delete Multiple | `DeleteObjectsCommand` | Deleting entire project |
| List Files | `ListObjectsV2Command` | Getting all project files |
| Signed URL | `getSignedUrl` | Temporary public access |

---

## 🔄 How MongoDB & S3 Work Together

### **Example: User Edits a File**

```
1. User types code in editor
   ↓
2. Debounced auto-save triggers (after 500ms)
   ↓
3. Frontend sends POST to /api/code
   ↓
4. API receives: { fileName: "index.html", content: "<html>..." }
   ↓
5. API finds file in MongoDB using fileName + projectId
   ↓
6. API gets s3Key from MongoDB document
   ↓
7. API uploads new content to S3 at s3Key location
   ↓
8. API updates MongoDB updatedAt timestamp
   ↓
9. Returns success to frontend
```

### **Data Flow Diagram:**

```
┌──────────────────────────────────────────────────────────┐
│                     USER ACTIONS                         │
└──────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────┐
│                   NEXT.JS API ROUTES                     │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │  /api/user │  │/api/project│  │ /api/file  │        │
│  └────────────┘  └────────────┘  └────────────┘        │
└──────────────────────────────────────────────────────────┘
         │                    │                   │
         ▼                    ▼                   ▼
┌──────────────┐    ┌──────────────────┐    ┌─────────────┐
│   MongoDB    │    │   MongoDB + S3   │    │    AWS S3   │
│              │    │                  │    │             │
│ • Users      │    │ • Project Meta   │    │ • Code Files│
│ • Sessions   │    │ • File Meta      │    │ • Assets    │
│ • Auth       │    │ • s3Key refs     │    │ • Content   │
└──────────────┘    └──────────────────┘    └─────────────┘
```

---

## 🚀 StackBlitz WebContainers Integration

### **What Are WebContainers?**

WebContainers = **Node.js Runtime in the Browser**
- Runs Node.js, npm, and frameworks **client-side**
- No server needed for execution
- Supports React, Vue, Angular, Next.js, etc.

### **Current vs. With WebContainers:**

**Current (HTML/CSS/JS only):**
```
Editor → Save to S3 → Preview in iframe
```

**With WebContainers (React, Node.js, etc.):**
```
Editor → WebContainer → npm install → Build → Run → Preview
```

### **Implementation Steps:**

#### **Step 1: Install WebContainer SDK**
```bash
npm install @webcontainer/api
```

#### **Step 2: Create WebContainer Provider**

Create `src/lib/webcontainer.ts`:
```typescript
import { WebContainer } from '@webcontainer/api';

let webcontainerInstance: WebContainer | null = null;

export async function getWebContainer(): Promise<WebContainer> {
    if (!webcontainerInstance) {
        webcontainerInstance = await WebContainer.boot();
    }
    return webcontainerInstance;
}

export async function mountFiles(files: Record<string, { file: { contents: string } }>) {
    const container = await getWebContainer();
    await container.mount(files);
}

export async function runCommand(command: string, args: string[] = []) {
    const container = await getWebContainer();
    const process = await container.spawn(command, args);
    return process;
}
```

#### **Step 3: Create Template System**

Create `src/lib/templates.ts`:
```typescript
export const templates = {
    'react-vite': {
        name: 'React + Vite',
        files: {
            'package.json': {
                file: {
                    contents: JSON.stringify({
                        name: 'react-app',
                        scripts: {
                            dev: 'vite',
                            build: 'vite build'
                        },
                        dependencies: {
                            'react': '^18.2.0',
                            'react-dom': '^18.2.0'
                        },
                        devDependencies: {
                            'vite': '^5.0.0',
                            '@vitejs/plugin-react': '^4.2.0'
                        }
                    }, null, 2)
                }
            },
            'index.html': {
                file: {
                    contents: `<!DOCTYPE html>
<html>
  <head><title>React App</title></head>
  <body><div id="root"></div>
  <script type="module" src="/src/main.jsx"></script></body>
</html>`
                }
            },
            'src/main.jsx': {
                file: {
                    contents: `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(<App />)`
                }
            },
            'src/App.jsx': {
                file: {
                    contents: `export default function App() {
  return <h1>Hello React!</h1>
}`
                }
            }
        }
    },
    'node-express': {
        name: 'Node.js + Express',
        files: {
            'package.json': {
                file: {
                    contents: JSON.stringify({
                        name: 'express-app',
                        scripts: {
                            start: 'node server.js'
                        },
                        dependencies: {
                            'express': '^4.18.0'
                        }
                    }, null, 2)
                }
            },
            'server.js': {
                file: {
                    contents: `const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Hello Express!'));
app.listen(3000, () => console.log('Server running'));`
                }
            }
        }
    }
};
```

#### **Step 4: Update Project Creation API**

Modify `src/app/api/project/route.ts`:
```typescript
export async function POST(req: Request) {
    const { projectName, template } = await req.json();
    
    // Create project in MongoDB
    const project = await Project.create({
        name: projectName,
        userId,
        projectType: template // 'html', 'react-vite', 'node-express'
    });

    // If WebContainer template, use template files
    if (template !== 'html') {
        const templateFiles = templates[template];
        for (const [path, { file }] of Object.entries(templateFiles.files)) {
            await uploadFileToS3(userId, projectId, path, file.contents);
            await File.create({
                name: path,
                projectId,
                s3Key,
                storageType: 's3'
            });
        }
    } else {
        // Regular HTML project
        // ... existing code
    }
}
```

#### **Step 5: Create WebContainer Editor Component**

Create `src/components/WebContainerEditor.tsx`:
```typescript
'use client';
import { useEffect, useRef, useState } from 'react';
import { getWebContainer, mountFiles, runCommand } from '@/lib/webcontainer';

export function WebContainerEditor({ projectFiles, projectType }) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [status, setStatus] = useState('Initializing...');

    useEffect(() => {
        async function initWebContainer() {
            try {
                setStatus('Mounting files...');
                await mountFiles(projectFiles);

                if (projectType === 'react-vite' || projectType === 'node-express') {
                    setStatus('Installing dependencies...');
                    const installProcess = await runCommand('npm', ['install']);
                    await installProcess.exit;

                    setStatus('Starting dev server...');
                    const devProcess = await runCommand('npm', ['run', 'dev']);
                    
                    // Listen for server URL
                    devProcess.output.pipeTo(new WritableStream({
                        write(data) {
                            console.log(data);
                            // Parse URL from output
                            if (data.includes('http://localhost')) {
                                const match = data.match(/http:\/\/localhost:\d+/);
                                if (match && iframeRef.current) {
                                    iframeRef.current.src = match[0];
                                    setStatus('Running');
                                }
                            }
                        }
                    }));
                }
            } catch (error) {
                setStatus('Error: ' + error.message);
            }
        }

        initWebContainer();
    }, [projectFiles, projectType]);

    return (
        <div className="h-full flex flex-col">
            <div className="bg-gray-800 text-white p-2">
                Status: {status}
            </div>
            <iframe 
                ref={iframeRef}
                className="flex-1 w-full border-0"
            />
        </div>
    );
}
```

#### **Step 6: Update Project Schema**

Add to `src/models/ProjectModel.ts`:
```typescript
const projectSchema = new mongoose.Schema({
    name: String,
    userId: ObjectId,
    projectType: {
        type: String,
        enum: ['html', 'react-vite', 'node-express', 'vue-vite'],
        default: 'html'
    },
    // ... existing fields
});
```

### **WebContainer Features You Can Add:**

1. **Terminal Emulator:**
   ```typescript
   const terminal = await container.spawn('bash');
   terminal.input.getWriter().write('npm run build\n');
   ```

2. **Hot Module Replacement (HMR):**
   - Automatically updates preview when files change

3. **Package Installation:**
   ```typescript
   await runCommand('npm', ['install', 'lodash']);
   ```

4. **Build & Deploy:**
   ```typescript
   await runCommand('npm', ['run', 'build']);
   // Upload build output to S3
   ```

---

## ⚠️ What's Missing in AWS Integration

### **1. File Versioning (Git-like History)**

**Currently Missing:**
- No version history
- Can't undo changes from yesterday
- No rollback capability

**How to Add:**
```typescript
// Store versions in S3 with timestamps
const versionKey = `${s3Key}.versions/${Date.now()}`;
await uploadFileToS3(versionKey, content);

// Keep metadata in MongoDB
{
    fileId: ObjectId,
    versions: [
        { s3Key: 'path/v1', timestamp: Date, size: 1024 },
        { s3Key: 'path/v2', timestamp: Date, size: 1050 }
    ]
}
```

### **2. Collaborative Editing (Real-time)**

**Currently Missing:**
- No live collaboration
- Users can't see each other's cursors
- No conflict resolution

**How to Add:**
Use **Socket.io + Yjs**:
```bash
npm install socket.io socket.io-client yjs y-websocket
```

### **3. Large File Handling**

**Currently Missing:**
- Files are loaded entirely in memory
- No streaming for large files

**How to Add:**
```typescript
// Use multipart upload for files > 5MB
import { Upload } from '@aws-sdk/lib-storage';

const upload = new Upload({
    client: s3Client,
    params: {
        Bucket: S3_BUCKET_NAME,
        Key: key,
        Body: largeFileStream
    }
});

await upload.done();
```

### **4. Asset Management (Images, Videos)**

**Currently Missing:**
- No image upload interface
- No optimization
- No CDN delivery

**How to Add:**
```typescript
// Add image upload API
export async function POST(req: Request) {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    // Upload to S3 with public-read ACL
    await s3Client.send(new PutObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: `assets/${userId}/${file.name}`,
        Body: Buffer.from(await file.arrayBuffer()),
        ContentType: file.type,
        ACL: 'public-read'
    }));
}
```

### **5. Search & Indexing**

**Currently Missing:**
- Can't search across files
- No code search
- No file tree search

**How to Add:**
Use **MongoDB Text Index**:
```typescript
fileSchema.index({ name: 'text', content: 'text' });

// Search
const results = await File.find({
    $text: { $search: 'function' },
    userId
});
```

### **6. Backup & Disaster Recovery**

**Currently Missing:**
- No automatic backups
- Single point of failure

**How to Add:**
```typescript
// Enable S3 versioning
// Use S3 lifecycle policies
// Cross-region replication
```

### **7. Analytics & Monitoring**

**Currently Missing:**
- No usage tracking
- No performance metrics
- No error logging

**How to Add:**
```typescript
// Use AWS CloudWatch
// Track S3 access logs
// Monitor MongoDB performance
```

---

## 🎯 Recommended Next Steps

### **Priority 1: WebContainers (Immediate Value)**
1. Install `@webcontainer/api`
2. Create React template
3. Add template selector in UI
4. Test with simple React app

### **Priority 2: Real-time Collaboration**
1. Add Socket.io
2. Implement Yjs for CRDT
3. Add user presence indicators
4. Test with multiple users

### **Priority 3: File Versioning**
1. Store versions in S3
2. Add version history UI
3. Implement rollback feature

### **Priority 4: Asset Management**
1. Add image upload API
2. Create asset browser
3. Optimize and compress images

---

## 📊 Current Architecture Strengths

✅ **Scalable**: S3 can handle unlimited files
✅ **Fast**: S3 has low latency globally
✅ **Reliable**: 99.999999999% durability
✅ **Cost-effective**: Pay only for what you use
✅ **Secure**: Proper authentication & authorization
✅ **Organized**: Clear folder structure

---

## 🔗 Useful Resources

- **WebContainers**: https://webcontainers.io/
- **AWS S3 SDK**: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/
- **MongoDB**: https://mongoosejs.com/docs/
- **Socket.io**: https://socket.io/docs/
- **Yjs**: https://docs.yjs.dev/

---

**Questions?** Feel free to ask about any specific part! 🚀
