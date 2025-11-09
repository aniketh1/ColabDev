'use client';
import { WebContainer } from '@webcontainer/api';

let webcontainerInstance: WebContainer | null = null;

/**
 * Get or create WebContainer instance (singleton)
 */
export async function getWebContainer(): Promise<WebContainer> {
  if (webcontainerInstance) {
    return webcontainerInstance;
  }

  console.log('🚀 Booting WebContainer...');
  webcontainerInstance = await WebContainer.boot();
  console.log('✅ WebContainer ready!');
  
  return webcontainerInstance;
}

/**
 * Create React project files structure for WebContainer
 */
export function createReactProjectFiles(files: { [key: string]: string }) {
  const packageJson = {
    name: 'react-preview',
    type: 'module',
    dependencies: {
      react: '^18.2.0',
      'react-dom': '^18.2.0',
    },
    devDependencies: {
      '@vitejs/plugin-react': '^4.0.0',
      vite: '^4.3.9',
    },
    scripts: {
      dev: 'vite --host 0.0.0.0',
      build: 'vite build',
      preview: 'vite preview',
    },
  };

  const viteConfig = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
})`;

  const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React Preview</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`;

  // Create file tree structure for WebContainer
  const fileTree: any = {
    'package.json': {
      file: {
        contents: JSON.stringify(packageJson, null, 2),
      },
    },
    'vite.config.js': {
      file: {
        contents: viteConfig,
      },
    },
    'index.html': {
      file: {
        contents: indexHtml,
      },
    },
    src: {
      directory: {},
    },
  };

  // Add all user files to the appropriate directory
  Object.entries(files).forEach(([fileName, content]) => {
    if (!fileName.startsWith('.') && !fileName.includes('node_modules')) {
      // Check if file starts with src/ (e.g., "src/App.jsx")
      if (fileName.startsWith('src/')) {
        // Remove the 'src/' prefix since we already have a src directory
        const relativePath = fileName.substring(4); // Remove "src/"
        const pathParts = relativePath.split('/');
        
        let current = fileTree.src.directory;
        
        // Navigate/create nested directories
        for (let i = 0; i < pathParts.length - 1; i++) {
          if (!current[pathParts[i]]) {
            current[pathParts[i]] = { directory: {} };
          }
          current = current[pathParts[i]].directory;
        }
        
        // Add the file
        current[pathParts[pathParts.length - 1]] = {
          file: { contents: content },
        };
      } else {
        // Root level files (like package.json, vite.config.js, index.html)
        // Skip them as we're creating our own
        if (!['package.json', 'vite.config.js', 'index.html'].includes(fileName)) {
          fileTree[fileName] = {
            file: { contents: content },
          };
        }
      }
    }
  });

  return fileTree;
}

/**
 * Create Vue project files structure for WebContainer
 */
export function createVueProjectFiles(files: { [key: string]: string }) {
  const packageJson = {
    name: 'vue-preview',
    type: 'module',
    dependencies: {
      vue: '^3.3.4',
    },
    devDependencies: {
      '@vitejs/plugin-vue': '^4.2.3',
      vite: '^4.3.9',
    },
    scripts: {
      dev: 'vite --host 0.0.0.0',
      build: 'vite build',
      preview: 'vite preview',
    },
  };

  const viteConfig = `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
  },
})`;

  const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vue Preview</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>`;

  const fileTree: any = {
    'package.json': {
      file: {
        contents: JSON.stringify(packageJson, null, 2),
      },
    },
    'vite.config.js': {
      file: {
        contents: viteConfig,
      },
    },
    'index.html': {
      file: {
        contents: indexHtml,
      },
    },
    src: {
      directory: {},
    },
  };

  // Add all user files to the appropriate directory
  Object.entries(files).forEach(([fileName, content]) => {
    if (!fileName.startsWith('.') && !fileName.includes('node_modules')) {
      // Check if file starts with src/ (e.g., "src/App.vue")
      if (fileName.startsWith('src/')) {
        // Remove the 'src/' prefix since we already have a src directory
        const relativePath = fileName.substring(4); // Remove "src/"
        const pathParts = relativePath.split('/');
        
        let current = fileTree.src.directory;
        
        // Navigate/create nested directories
        for (let i = 0; i < pathParts.length - 1; i++) {
          if (!current[pathParts[i]]) {
            current[pathParts[i]] = { directory: {} };
          }
          current = current[pathParts[i]].directory;
        }
        
        // Add the file
        current[pathParts[pathParts.length - 1]] = {
          file: { contents: content },
        };
      } else {
        // Root level files (like package.json, vite.config.js, index.html)
        // Skip them as we're creating our own
        if (!['package.json', 'vite.config.js', 'index.html'].includes(fileName)) {
          fileTree[fileName] = {
            file: { contents: content },
          };
        }
      }
    }
  });

  return fileTree;
}

/**
 * Create Node.js project files structure for WebContainer
 */
export function createNodeProjectFiles(files: { [key: string]: string }) {
  const packageJson = {
    name: 'node-preview',
    type: 'module',
    dependencies: {
      express: '^4.18.2',
    },
    scripts: {
      start: 'node server.js',
    },
  };

  const fileTree: any = {
    'package.json': {
      file: {
        contents: JSON.stringify(packageJson, null, 2),
      },
    },
  };

  // Add all user files
  Object.entries(files).forEach(([fileName, content]) => {
    if (!fileName.startsWith('.') && !fileName.includes('node_modules')) {
      fileTree[fileName] = {
        file: { contents: content },
      };
    }
  });

  return fileTree;
}
