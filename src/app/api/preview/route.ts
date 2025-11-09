import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const projectId = searchParams.get('projectId');
  const techStack = searchParams.get('techStack');

  if (!projectId || !techStack) {
    return new NextResponse('Missing parameters', { status: 400 });
  }

  const baseUrl = request.nextUrl.origin;

  // Create the complete HTML document
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${techStack.toUpperCase()} Preview - WebContainer</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; background: #0f172a; color: white; overflow: hidden; }
    #status { 
      position: fixed; 
      top: 20px; 
      left: 50%; 
      transform: translateX(-50%); 
      background: rgba(15, 23, 42, 0.95); 
      padding: 12px 24px; 
      border-radius: 12px; 
      border: 1px solid rgba(59, 130, 246, 0.3);
      z-index: 1000;
      backdrop-filter: blur(10px);
      max-width: 90%;
    }
    #iframe-container { width: 100vw; height: 100vh; }
    iframe { width: 100%; height: 100%; border: none; }
    .loader { 
      display: inline-block; 
      width: 14px; 
      height: 14px; 
      border: 2px solid rgba(59, 130, 246, 0.3); 
      border-top-color: #3b82f6; 
      border-radius: 50%; 
      animation: spin 0.6s linear infinite; 
      margin-right: 8px;
      vertical-align: middle;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .error { color: #ef4444; }
  </style>
</head>
<body>
  <div id="status">
    <span class="loader"></span>
    <span id="status-text">Initializing...</span>
  </div>
  <div id="iframe-container"></div>

  <script type="module">
    import { WebContainer } from 'https://cdn.jsdelivr.net/npm/@webcontainer/api@1.1.9/dist/index.js';

    const statusText = document.getElementById('status-text');
    const statusDiv = document.getElementById('status');
    const iframeContainer = document.getElementById('iframe-container');
    
    // Configuration from server
    const CONFIG = {
      projectId: ${JSON.stringify(projectId)},
      techStack: ${JSON.stringify(techStack)},
      baseUrl: ${JSON.stringify(baseUrl)}
    };

    // Enhanced logging
    function log(message, data = '') {
      const timestamp = new Date().toISOString().substr(11, 8);
      console.log(\`[\${timestamp}] [Preview] \${message}\`, data);
      if (message.includes('Error') || message.includes('Failed')) {
        console.error(\`[\${timestamp}] [Preview Error]\`, message, data);
      }
    }

    // Update status text
    function updateStatus(text) {
      statusText.textContent = text;
      log('Status: ' + text);
    }

    /** @type {import('@webcontainer/api').WebContainer} */
    let webcontainerInstance;

    async function installDependencies() {
      updateStatus('Installing dependencies...');
      const installStart = Date.now();
      
      const installProcess = await webcontainerInstance.spawn('npm', ['install']);
      
      // Stream install output to console
      installProcess.output.pipeTo(new WritableStream({
        write(data) {
          console.log('[npm install]', data);
        }
      }));
      
      const exitCode = await installProcess.exit;
      const installTime = Date.now() - installStart;
      
      log(\`npm install completed in \${installTime}ms\`, { exitCode });
      
      if (exitCode !== 0) {
        throw new Error('Installation failed with exit code: ' + exitCode);
      }
      
      return exitCode;
    }

    async function startDevServer() {
      updateStatus('Starting dev server...');
      
      const devProcess = await webcontainerInstance.spawn('npm', ['run', 'dev']);
      
      // Stream dev server output
      devProcess.output.pipeTo(new WritableStream({
        write(data) {
          console.log('[npm run dev]', data);
        }
      }));
      
      log('Dev server process started');
      
      // Listen for server-ready event
      webcontainerInstance.on('server-ready', (port, url) => {
        log('Server ready!', { port, url });
        updateStatus('Ready!');
        
        setTimeout(() => {
          statusDiv.style.display = 'none';
        }, 1000);
        
        // Create iframe to display the app
        const iframe = document.createElement('iframe');
        iframe.src = url;
        iframe.onload = () => log('Iframe loaded successfully');
        iframe.onerror = (e) => log('Iframe load error', e);
        iframeContainer.appendChild(iframe);
      });
    }

    function createFileTree(techStack, files) {
      log('Creating file tree...', { techStack, fileCount: Object.keys(files).length });
      
      const packageJson = techStack === 'react' ? {
        name: 'react-preview',
        type: 'module',
        dependencies: { 
          react: '^18.2.0', 
          'react-dom': '^18.2.0' 
        },
        devDependencies: { 
          '@vitejs/plugin-react': '^4.0.0', 
          vite: '^4.3.9' 
        },
        scripts: { 
          dev: 'vite --host 0.0.0.0', 
          build: 'vite build' 
        }
      } : {
        name: 'vue-preview',
        type: 'module',
        dependencies: { 
          vue: '^3.3.4' 
        },
        devDependencies: { 
          '@vitejs/plugin-vue': '^4.2.3', 
          vite: '^4.3.9' 
        },
        scripts: { 
          dev: 'vite --host 0.0.0.0', 
          build: 'vite build' 
        }
      };

      const viteConfigReact = "import { defineConfig } from 'vite'\\n" +
        "import react from '@vitejs/plugin-react'\\n\\n" +
        "export default defineConfig({\\n" +
        "  plugins: [react()],\\n" +
        "  server: { port: 3000 }\\n" +
        "})";
      
      const viteConfigVue = "import { defineConfig } from 'vite'\\n" +
        "import vue from '@vitejs/plugin-vue'\\n\\n" +
        "export default defineConfig({\\n" +
        "  plugins: [vue()],\\n" +
        "  server: { port: 3000 }\\n" +
        "})";
      
      const viteConfig = techStack === 'react' ? viteConfigReact : viteConfigVue;

      const mainExt = techStack === 'react' ? 'jsx' : 'js';
      const techStackTitle = techStack.charAt(0).toUpperCase() + techStack.slice(1);
      
      const indexHtml = "<!DOCTYPE html>\\n" +
        "<html lang=\\"en\\">\\n" +
        "<head>\\n" +
        "  <meta charset=\\"UTF-8\\" />\\n" +
        "  <meta name=\\"viewport\\" content=\\"width=device-width, initial-scale=1.0\\">\\n" +
        "  <title>" + techStackTitle + " Preview</title>\\n" +
        "</head>\\n" +
        "<body>\\n" +
        "  <div id=\\"root\\"></div>\\n" +
        "  <script type=\\"module\\" src=\\"/src/main." + mainExt + "\\"></script>\\n" +
        "</body>\\n" +
        "</html>";

      const fileTree = {
        'package.json': { 
          file: { 
            contents: JSON.stringify(packageJson, null, 2) 
          } 
        },
        'vite.config.js': { 
          file: { 
            contents: viteConfig 
          } 
        },
        'index.html': { 
          file: { 
            contents: indexHtml 
          } 
        },
        src: { 
          directory: {} 
        }
      };

      // Mount user files into src directory
      Object.entries(files).forEach(([fileName, content]) => {
        if (fileName.startsWith('src/')) {
          const relativePath = fileName.substring(4); // Remove 'src/' prefix
          const pathParts = relativePath.split('/');
          let current = fileTree.src.directory;
          
          // Create nested directories if needed
          for (let i = 0; i < pathParts.length - 1; i++) {
            if (!current[pathParts[i]]) {
              current[pathParts[i]] = { directory: {} };
            }
            current = current[pathParts[i]].directory;
          }
          
          // Add the file
          current[pathParts[pathParts.length - 1]] = { 
            file: { 
              contents: content 
            } 
          };
        }
      });

      log('File tree created', { 
        rootFiles: Object.keys(fileTree),
        srcFiles: Object.keys(fileTree.src.directory)
      });
      
      return fileTree;
    }

    async function init() {
      try {
        log('Starting WebContainer initialization...', CONFIG);
        
        // Step 1: Fetch project files
        updateStatus('Fetching project files...');
        const fetchUrl = \`\${CONFIG.baseUrl}/api/project-files/\${CONFIG.projectId}\`;
        log('Fetching from:', fetchUrl);
        
        const response = await fetch(fetchUrl, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        log('Fetch response', { status: response.status, ok: response.ok });
        
        if (!response.ok) {
          const errorText = await response.text();
          log('Fetch failed', { status: response.status, error: errorText });
          throw new Error(\`Failed to fetch project files (Status \${response.status})\`);
        }
        
        const result = await response.json();
        log('Project data received', { 
          fileCount: Object.keys(result.data?.files || {}).length,
          techStack: result.data?.techStack 
        });
        
        const files = result.data.files;
        const techStack = result.data.techStack;

        if (!files || Object.keys(files).length === 0) {
          throw new Error('No files found in project');
        }

        // Step 2: Boot WebContainer
        updateStatus('Booting WebContainer...');
        const bootStart = Date.now();
        webcontainerInstance = await WebContainer.boot();
        const bootTime = Date.now() - bootStart;
        log(\`WebContainer booted in \${bootTime}ms\`);

        // Step 3: Create and mount file system
        updateStatus('Creating project files...');
        const fileTree = createFileTree(techStack, files);
        
        log('Mounting files to WebContainer...');
        await webcontainerInstance.mount(fileTree);
        log('Files mounted successfully');

        // Step 4: Install dependencies
        const exitCode = await installDependencies();
        if (exitCode !== 0) {
          throw new Error('Installation failed');
        }

        // Step 5: Start dev server
        await startDevServer();

      } catch (error) {
        log('Fatal error', { 
          message: error.message, 
          stack: error.stack 
        });
        
        statusDiv.querySelector('.loader').style.display = 'none';
        statusText.className = 'error';
        statusText.textContent = 'Error: ' + error.message;
        console.error('[Preview] Full error:', error);
      }
    }

    // Start the app when page loads
    window.addEventListener('load', () => {
      log('Page loaded, starting init...');
      init();
    });
  </script>
</body>
</html>`;

  return new NextResponse(htmlContent, {
    headers: {
      'Content-Type': 'text/html',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  });
}
