'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Loader2, Terminal, X, Package } from 'lucide-react';
import { useWebContainer } from '@/hooks/useWebContainer';

interface AdvancedRunnerProps {
  files: Record<string, string>;
  projectType: 'html' | 'react' | 'vue' | 'node';
}

export function AdvancedRunner({ files, projectType }: AdvancedRunnerProps) {
  const { 
    isBooting, 
    error, 
    output, 
    mountFiles, 
    runCommand, 
    webcontainer 
  } = useWebContainer();
  
  const [isRunning, setIsRunning] = useState(false);
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const runReactProject = async () => {
    setIsRunning(true);
    try {
      // Create React project structure
      const reactFiles = {
        'package.json': JSON.stringify({
          name: 'react-app',
          version: '1.0.0',
          type: 'module',
          scripts: {
            dev: 'vite',
            build: 'vite build',
          },
          dependencies: {
            react: '^18.2.0',
            'react-dom': '^18.2.0',
          },
          devDependencies: {
            '@vitejs/plugin-react': '^4.0.0',
            vite: '^4.3.9',
          },
        }, null, 2),
        'vite.config.js': `
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 3000 }
});
        `,
        'index.html': `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
        `,
        'src/main.jsx': files['main.jsx'] || `
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
        `,
        'src/App.jsx': files['App.jsx'] || `
import React, { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);
  
  return (
    <div style={{ padding: '40px', fontFamily: 'system-ui' }}>
      <h1>Hello from React in WebContainer!</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
        `,
      };

      await mountFiles(reactFiles);
      
      // Install dependencies
      await runCommand('npm', ['install']);
      
      // Start dev server
      const devProcess = await runCommand('npm', ['run', 'dev']);
      
      // Listen for server ready
      webcontainer?.on('server-ready', (port, url) => {
        setServerUrl(url);
        console.log(`✅ React dev server ready at ${url}`);
      });
      
    } catch (err: any) {
      console.error('Failed to run React app:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const runNodeServer = async () => {
    setIsRunning(true);
    try {
      const nodeFiles = {
        'package.json': JSON.stringify({
          name: 'node-server',
          version: '1.0.0',
          type: 'module',
          main: 'server.js',
        }),
        'server.js': files['server.js'] || `
import http from 'http';

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(\`
    <html>
      <head><title>Node.js Server</title></head>
      <body style="font-family: system-ui; padding: 40px;">
        <h1>Hello from Node.js in WebContainer!</h1>
        <p>Path: \${req.url}</p>
        <p>Method: \${req.method}</p>
        <p>Time: \${new Date().toLocaleString()}</p>
      </body>
    </html>
  \`);
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
        `,
      };

      await mountFiles(nodeFiles);
      await runCommand('node', ['server.js']);
      
      webcontainer?.on('server-ready', (port, url) => {
        setServerUrl(url);
      });
      
    } catch (err: any) {
      console.error('Failed to run Node.js server:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const runVueApp = async () => {
    setIsRunning(true);
    try {
      const vueFiles = {
        'package.json': JSON.stringify({
          name: 'vue-app',
          version: '1.0.0',
          scripts: {
            dev: 'vite',
          },
          dependencies: {
            vue: '^3.3.4',
          },
          devDependencies: {
            '@vitejs/plugin-vue': '^4.2.3',
            vite: '^4.3.9',
          },
        }, null, 2),
        'vite.config.js': `
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: { port: 3000 }
});
        `,
        'index.html': `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vue App</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
        `,
        'src/main.js': `
import { createApp } from 'vue';
import App from './App.vue';

createApp(App).mount('#app');
        `,
        'src/App.vue': files['App.vue'] || `
<template>
  <div style="padding: 40px; font-family: system-ui;">
    <h1>Hello from Vue in WebContainer!</h1>
    <p>Count: {{ count }}</p>
    <button @click="count++">Increment</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const count = ref(0);
</script>
        `,
      };

      await mountFiles(vueFiles);
      await runCommand('npm', ['install']);
      await runCommand('npm', ['run', 'dev']);
      
      webcontainer?.on('server-ready', (port, url) => {
        setServerUrl(url);
      });
      
    } catch (err: any) {
      console.error('Failed to run Vue app:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleRun = async () => {
    setShowModal(true);
    switch (projectType) {
      case 'react':
        await runReactProject();
        break;
      case 'vue':
        await runVueApp();
        break;
      case 'node':
        await runNodeServer();
        break;
      default:
        setShowModal(false);
    }
  };

  if (isBooting) {
    return (
      <Button disabled size="sm" variant="outline">
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
        Booting...
      </Button>
    );
  }

  if (error) {
    return null; // Hide if WebContainer not supported
  }

  return (
    <>
      <Button
        onClick={handleRun}
        disabled={isRunning}
        size="sm"
        className="gap-2 bg-purple-600 hover:bg-purple-700 text-white"
      >
        {isRunning ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Starting...
          </>
        ) : (
          <>
            <Terminal className="w-4 h-4" />
            Run {projectType.toUpperCase()}
          </>
        )}
      </Button>

      {/* Preview Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <div className="flex items-center gap-3">
                <Terminal className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold">WebContainer Preview</h3>
                <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                  {projectType.toUpperCase()}
                </span>
                {serverUrl && (
                  <a 
                    href={serverUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    {serverUrl}
                  </a>
                )}
              </div>
              <Button
                onClick={() => {
                  setShowModal(false);
                  setServerUrl(null);
                }}
                variant="ghost"
                size="sm"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 flex overflow-hidden">
              {/* Preview */}
              <div className="flex-1 bg-white">
                {serverUrl ? (
                  <iframe
                    src={serverUrl}
                    className="w-full h-full border-0"
                    title="WebContainer Preview"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <Package className="w-16 h-16 mx-auto mb-4 text-gray-300 animate-pulse" />
                      <p className="text-gray-500">Installing packages...</p>
                      <p className="text-xs text-gray-400 mt-2">This may take a moment</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Terminal Output */}
              {output.length > 0 && (
                <div className="w-96 border-l bg-black text-green-400 p-4 overflow-auto font-mono text-xs">
                  <div className="flex items-center gap-2 mb-2 text-gray-400">
                    <Terminal className="w-4 h-4" />
                    <span>Console Output</span>
                  </div>
                  {output.map((line, i) => (
                    <div key={i} className="mb-1">{line}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
