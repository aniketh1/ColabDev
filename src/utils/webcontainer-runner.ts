/**
 * WebContainer-based code runner for browser execution
 * Replaces Babel-based transformation with WebContainer for more reliable code execution
 */

import type { WebContainer } from '@webcontainer/api';

export type Language = 'react' | 'vue' | 'javascript' | 'html' | 'css';

export type RunCodeOutput =
  | { type: 'iframe'; output: string }
  | { type: 'console'; output: string }
  | { type: 'error'; output: string };

/**
 * WebContainer instance cache
 */
let webcontainerInstance: WebContainer | null = null;
let isInitializing = false;

/**
 * Initialize WebContainer instance
 */
const initWebContainer = async (): Promise<WebContainer> => {
  if (webcontainerInstance) {
    return webcontainerInstance;
  }

  if (isInitializing) {
    // Wait for existing initialization
    while (isInitializing) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (webcontainerInstance) {
      return webcontainerInstance;
    }
  }

  isInitializing = true;

  try {
    // Dynamic import to avoid loading WebContainer in server-side code
    const { WebContainer } = await import('@webcontainer/api');
    webcontainerInstance = await WebContainer.boot();
    console.log('✅ WebContainer initialized for code runner');
    return webcontainerInstance;
  } catch (error) {
    console.error('❌ Failed to initialize WebContainer:', error);
    throw error;
  } finally {
    isInitializing = false;
  }
};

/**
 * Create file structure for code snippet execution
 */
const createSnippetFileTree = (code: string, language: Language) => {
  const baseFiles = {
    'package.json': {
      file: {
        contents: JSON.stringify({
          name: 'code-snippet-runner',
          type: 'module',
          dependencies: {
            react: '^18.2.0',
            'react-dom': '^18.2.0',
            vue: '^3.3.4'
          },
          devDependencies: {
            '@vitejs/plugin-react': '^4.0.0',
            '@vitejs/plugin-vue': '^4.2.3',
            vite: '^4.3.9'
          },
          scripts: {
            dev: 'vite --host 0.0.0.0 --port 3000'
          }
        }, null, 2)
      }
    },
    'vite.config.js': {
      file: {
        contents: language === 'react'
          ? `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 3000, host: '0.0.0.0' }
})`
          : language === 'vue'
          ? `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: { port: 3000, host: '0.0.0.0' }
})`
          : `import { defineConfig } from 'vite'

export default defineConfig({
  server: { port: 3000, host: '0.0.0.0' }
})`
      }
    },
    'index.html': {
      file: {
        contents: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Code Snippet Preview</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>`
      }
    }
  };

  // Create main.js based on language
  let mainJsContent = '';

  if (language === 'react') {
    mainJsContent = `import React from 'react';
import ReactDOM from 'react-dom/client';

// User code will be injected here
${code}

// Auto-render if App component exists
if (typeof App !== 'undefined') {
  const container = document.getElementById('root');
  const root = ReactDOM.createRoot(container);
  root.render(React.createElement(App));
} else {
  console.warn('No App component found. Make sure to define a component named "App".');
}`;
  } else if (language === 'vue') {
    mainJsContent = `import { createApp } from 'vue';

// User code will be injected here
${code}

// Auto-mount if App component exists
if (typeof App !== 'undefined') {
  createApp(App).mount('#root');
} else {
  console.warn('No App component found. Make sure to define a component named "App".');
}`;
  } else if (language === 'javascript' || language === 'html' || language === 'css') {
    mainJsContent = `// User code
${code}`;
  }

  const srcFiles = {
    src: {
      directory: {
        'main.js': {
          file: {
            contents: mainJsContent
          }
        }
      }
    }
  };

  return {
    ...baseFiles,
    ...srcFiles
  };
};

/**
 * Execute code snippet using WebContainer
 */
export const runCodeWithWebContainer = async (
  code: string,
  language: Language
): Promise<RunCodeOutput> => {
  try {
    console.log('🚀 Starting WebContainer code execution for:', language);

    // Initialize WebContainer
    const webcontainer = await initWebContainer();

    // Create file tree for the code snippet
    const fileTree = createSnippetFileTree(code, language);
    console.log('📁 Mounting file tree...');

    // Mount files
    await webcontainer.mount(fileTree);

    // Install dependencies
    console.log('📦 Installing dependencies...');
    const installProcess = await webcontainer.spawn('npm', ['install']);

    // Wait for installation to complete
    const installExitCode = await installProcess.exit;
    if (installExitCode !== 0) {
      throw new Error('Failed to install dependencies');
    }

    // Start dev server
    console.log('🚀 Starting dev server...');
    const devProcess = await webcontainer.spawn('npm', ['run', 'dev']);

    // Wait for server to be ready
    return new Promise((resolve) => {
      let serverUrl = '';
      let hasResolved = false;

      webcontainer.on('server-ready', (port, url) => {
        if (hasResolved) return;
        hasResolved = true;

        console.log('✅ Server ready at:', url);
        serverUrl = url;

        // Generate iframe HTML
        const iframeHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Code Preview</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; overflow: hidden; }
    iframe { width: 100vw; height: 100vh; border: none; }
  </style>
</head>
<body>
  <iframe src="${url}" sandbox="allow-scripts allow-modals allow-forms allow-popups allow-same-origin"></iframe>
</body>
</html>`;

        resolve({
          type: 'iframe',
          output: iframeHtml
        });
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        if (!hasResolved) {
          hasResolved = true;
          devProcess.kill();
          resolve({
            type: 'error',
            output: 'Code execution timed out'
          });
        }
      }, 30000);

      // Listen for errors
      devProcess.output.pipeTo(new WritableStream({
        write(data) {
          console.log('[WebContainer]', data);
        }
      }));
    });

  } catch (error: any) {
    console.error('❌ WebContainer execution error:', error);
    return {
      type: 'error',
      output: `Execution failed: ${error.message}`
    };
  }
};

/**
 * Check if WebContainer is available
 */
export const isWebContainerAvailable = (): boolean => {
  return typeof window !== 'undefined' && 'WebContainer' in window;
};

/**
 * Clean up WebContainer instance
 */
export const cleanupWebContainer = async (): Promise<void> => {
  if (webcontainerInstance) {
    try {
      await webcontainerInstance.teardown();
      webcontainerInstance = null;
      console.log('🧹 WebContainer cleaned up');
    } catch (error) {
      console.warn('Failed to cleanup WebContainer:', error);
    }
  }
};