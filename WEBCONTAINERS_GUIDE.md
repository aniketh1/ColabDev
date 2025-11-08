# 🚀 WebContainers Integration Guide for ColabDev

## What are WebContainers?

**WebContainers** are a browser-based runtime for executing Node.js applications and operating system commands, entirely inside your browser tab. Developed by StackBlitz, they enable:

- ✅ Run Node.js, React, Vue, Angular, etc. **directly in the browser**
- ✅ **No backend server** required
- ✅ **Instant startup** - boots in milliseconds
- ✅ **100% client-side** - works offline
- ✅ **Free to use** - no API keys needed

---

## 📦 What's Been Installed

```bash
npm install @webcontainer/api
```

### Components Created:

1. **`src/hooks/useWebContainer.ts`** - WebContainer hook for managing instances
2. **`src/components/WebContainerPreview.tsx`** - Preview component with iframe
3. **`src/components/RunCodeButton.tsx`** - Simple run button for HTML/CSS/JS

---

## 🎯 Current Implementation Status

### ✅ What's Working Now:

1. **Static HTML/CSS/JS Preview** - `RunCodeButton` component
   - Click "Run Code" button
   - Opens modal with live preview
   - Runs HTML, CSS, and JavaScript instantly
   - Error handling built-in

### 🚧 What's Ready to Implement:

2. **WebContainer Integration** - Currently stubbed out
   - Hook created: `useWebContainer()`
   - Ready to run Node.js code
   - Can execute npm commands
   - Can start dev servers (React, Vue, etc.)

---

## 🔧 How to Use WebContainers

### Example 1: Run Simple JavaScript Code

```typescript
import { useWebContainer } from '@/hooks/useWebContainer';

function MyComponent() {
  const { executeJavaScript, output, isBooting } = useWebContainer();

  const runCode = async () => {
    await executeJavaScript(`
      console.log('Hello from WebContainer!');
      const result = 2 + 2;
      console.log('2 + 2 =', result);
    `);
  };

  return (
    <div>
      <button onClick={runCode} disabled={isBooting}>
        Run JS Code
      </button>
      <pre>{output.join('\n')}</pre>
    </div>
  );
}
```

### Example 2: Run a React App

```typescript
const { mountFiles, startDevServer } = useWebContainer();

const runReactApp = async () => {
  // Mount React project files
  await mountFiles({
    'package.json': JSON.stringify({
      name: 'react-app',
      dependencies: {
        react: '^18.0.0',
        'react-dom': '^18.0.0',
        vite: '^4.0.0'
      },
      scripts: {
        dev: 'vite'
      }
    }),
    'index.html': `
      <!DOCTYPE html>
      <html>
        <head><title>React App</title></head>
        <body>
          <div id="root"></div>
          <script type="module" src="/src/main.jsx"></script>
        </body>
      </html>
    `,
    'src/main.jsx': `
      import React from 'react';
      import ReactDOM from 'react-dom/client';
      import App from './App';

      ReactDOM.createRoot(document.getElementById('root')).render(<App />);
    `,
    'src/App.jsx': `
      export default function App() {
        return <h1>Hello from WebContainer React!</h1>;
      }
    `
  });

  // Start dev server
  await startDevServer(3000);
  // Server URL will be available at webcontainer.on('server-ready')
};
```

### Example 3: Run Node.js Server

```typescript
const { runCommand, mountFiles } = useWebContainer();

const runNodeServer = async () => {
  await mountFiles({
    'server.js': `
      const http = require('http');
      const server = http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<h1>Hello from Node.js in WebContainer!</h1>');
      });
      server.listen(3000, () => {
        console.log('Server running on port 3000');
      });
    `,
    'package.json': JSON.stringify({ name: 'node-server' })
  });

  await runCommand('node', ['server.js']);
};
```

---

## 🎨 Integration into ColabDev Editor

### Step 1: Add Run Button to Editor Header

Add this to `EditorHeader.tsx`:

```typescript
import { RunCodeButton } from '@/components/RunCodeButton';

// Inside component:
const [files, setFiles] = useState({ html: '', css: '', js: '' });

// Fetch all 3 files (index.html, style.css, script.js)
useEffect(() => {
  fetchProjectFiles();
}, [projectId]);

// In the header JSX:
<RunCodeButton 
  html={files.html} 
  css={files.css} 
  js={files.js} 
  projectId={projectId} 
/>
```

### Step 2: Enhance for Full WebContainer Support

```typescript
import { useWebContainer } from '@/hooks/useWebContainer';

const { runWebPreview, isBooting } = useWebContainer();

const handleAdvancedRun = async () => {
  const url = await runWebPreview(html, css, js);
  window.open(url, '_blank');
};
```

---

## 🚀 Features You Can Add

### 1. **Live Preview Panel** (Already in BrowerRunCode.tsx)
- Keep iframe preview for simple HTML/CSS/JS
- Add WebContainer for advanced frameworks

### 2. **Terminal Output**
```typescript
const { output } = useWebContainer();

return (
  <div className="terminal bg-black text-green-400 p-2">
    {output.map((line, i) => <div key={i}>{line}</div>)}
  </div>
);
```

### 3. **Package Manager**
```typescript
const { runCommand } = useWebContainer();

await runCommand('npm', ['install', 'axios']);
await runCommand('npm', ['install', 'tailwindcss']);
```

### 4. **React/Vue Project Templates**
```typescript
const templates = {
  react: { ... },
  vue: { ... },
  vanilla: { ... }
};

const createProject = async (template: string) => {
  await mountFiles(templates[template]);
  await runCommand('npm', ['install']);
  await startDevServer();
};
```

---

## ⚠️ Limitations & Considerations

### Browser Requirements:
- ✅ Chrome/Edge (recommended)
- ✅ Firefox (supported)
- ❌ Safari (limited support)
- **Requires**: `SharedArrayBuffer` support

### What Works:
- ✅ Node.js runtime
- ✅ npm/yarn commands
- ✅ React, Vue, Angular, Svelte
- ✅ Vite, Webpack (basic)
- ✅ Express servers
- ✅ File system operations

### What Doesn't Work:
- ❌ Native modules (C++ addons)
- ❌ Docker containers
- ❌ Database servers (use cloud DBs)
- ❌ Heavy compilation (slow)

---

## 🎯 Recommended Next Steps

### Phase 1: Simple Preview (✅ DONE)
- ✅ RunCodeButton component
- ✅ HTML/CSS/JS iframe preview
- ✅ Modal with close button

### Phase 2: WebContainer Integration (Ready to Implement)
1. Add "Advanced Mode" toggle to RunCodeButton
2. Detect project type (HTML vs React vs Node)
3. Mount files to WebContainer
4. Show terminal output
5. Display live URL

### Phase 3: Full IDE Features
1. npm package installer UI
2. Project templates (React, Vue, etc.)
3. Terminal emulator
4. File tree with drag & drop
5. Multi-project support

---

## 📚 Resources

- **WebContainers Docs**: https://webcontainers.io/
- **API Reference**: https://webcontainers.io/api
- **Examples**: https://webcontainers.io/tutorial/1-build-your-first-webcontainer-app
- **StackBlitz**: https://stackblitz.com/ (see it in action)

---

## 🧪 Testing WebContainers

1. **Test Static Preview** (Working Now):
   ```
   - Open editor
   - Create index.html with some HTML
   - Click "Run Code" button in header
   - Preview should open
   ```

2. **Test WebContainer** (After implementation):
   ```javascript
   // Add to your editor component:
   const { executeJavaScript } = useWebContainer();
   
   await executeJavaScript('console.log("WebContainer works!")');
   ```

3. **Test React App**:
   ```
   - Create React project files
   - Mount to WebContainer
   - Start dev server
   - Open preview URL
   ```

---

## 💡 Pro Tips

1. **Lazy Load WebContainer**: Only boot when user clicks "Run"
2. **Cache Instances**: Reuse same WebContainer for multiple runs
3. **Show Progress**: Display loading states during npm install
4. **Error Handling**: Catch and display compilation errors
5. **Memory Management**: Teardown containers when done

---

## 🎉 Summary

You now have:
- ✅ WebContainers SDK installed
- ✅ `useWebContainer` hook ready
- ✅ RunCodeButton component working
- ✅ Infrastructure for advanced features

**Next**: Add the RunCodeButton to your editor header and start running code in the browser! 🚀
