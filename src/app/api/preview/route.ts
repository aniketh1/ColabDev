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

  // Escape function to safely embed in script
  const escapeForScript = (str: string) => {
    return str
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
  };

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${techStack.toUpperCase()} Preview</title>
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
    <span id="status-text">Booting WebContainer...</span>
  </div>
  <div id="iframe-container"></div>

  <script type="module">
    import { WebContainer } from 'https://cdn.jsdelivr.net/npm/@webcontainer/api@1.1.9/dist/index.js';

    const statusText = document.getElementById('status-text');
    const statusDiv = document.getElementById('status');
    const iframeContainer = document.getElementById('iframe-container');
    const projectId = '${escapeForScript(projectId)}';
    const techStackType = '${escapeForScript(techStack)}';

    // Enhanced logging
    function log(message, data) {
      console.log('[Preview]', message, data || '');
      if (message.includes('Error') || message.includes('Failed')) {
        console.error('[Preview Error]', message, data);
      }
    }

    async function init() {
      try {
        log('Starting initialization...', { projectId, techStackType });
        
        // Step 1: Fetch project files
        statusText.textContent = 'Fetching project files...';
        log('Fetching project files from API...');
        const response = await fetch('${escapeForScript(baseUrl)}/api/project-files/' + projectId, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        log('Fetch response received', { status: response.status, ok: response.ok });
        
        if (!response.ok) {
          const errorText = await response.text();
          log('Fetch failed', { status: response.status, error: errorText });
          throw new Error('Failed to fetch project files: ' + response.status + ' - ' + errorText);
        }
        
        const result = await response.json();
        log('Project data received', { 
          fileCount: Object.keys(result.data.files || {}).length,
          techStack: result.data.techStack 
        });
        
        const files = result.data.files;
        const techStack = result.data.techStack;

        if (!files || Object.keys(files).length === 0) {
          throw new Error('No files found in project');
        }

        // Step 2: Boot WebContainer
        statusText.textContent = 'Booting WebContainer...';
        log('Starting WebContainer boot...');
        const bootStart = Date.now();
        const webcontainer = await WebContainer.boot();
        const bootTime = Date.now() - bootStart;
        log('WebContainer booted successfully', { bootTime: bootTime + 'ms' });

        // Step 3: Create and mount files
        statusText.textContent = 'Creating project files...';
        log('Creating file tree...');
        const fileTree = createFileTree(techStack, files);
        log('File tree created', { structure: Object.keys(fileTree) });
        
        log('Mounting files to WebContainer...');
        await webcontainer.mount(fileTree);
        log('Files mounted successfully');

        // Step 4: Install dependencies
        statusText.textContent = 'Installing dependencies...';
        log('Running npm install...');
        const installStart = Date.now();
        const installProcess = await webcontainer.spawn('npm', ['install']);
        
        // Stream install output
        installProcess.output.pipeTo(new WritableStream({
          write(data) {
            console.log('[npm install]', data);
          }
        }));
        
        const installExitCode = await installProcess.exit;
        const installTime = Date.now() - installStart;
        log('npm install completed', { exitCode: installExitCode, time: installTime + 'ms' });
        
        if (installExitCode !== 0) {
          throw new Error('npm install failed with exit code: ' + installExitCode);
        }

        // Step 5: Start dev server
        statusText.textContent = 'Starting dev server...';
        log('Running npm run dev...');
        const devProcess = await webcontainer.spawn('npm', ['run', 'dev']);
        
        // Stream dev server output
        devProcess.output.pipeTo(new WritableStream({
          write(data) {
            console.log('[npm run dev]', data);
          }
        }));

        log('Waiting for server-ready event...');
        
        // Add timeout for server-ready event
        const serverReadyTimeout = setTimeout(() => {
          log('Warning: server-ready event timeout (30s)');
          statusText.textContent = 'Server taking longer than expected...';
        }, 30000);

        webcontainer.on('server-ready', (port, url) => {
          clearTimeout(serverReadyTimeout);
          log('Server ready!', { port, url });
          statusText.textContent = 'Ready!';
          
          setTimeout(() => {
            statusDiv.style.display = 'none';
          }, 1000);
          
          log('Creating iframe with URL:', url);
          const iframe = document.createElement('iframe');
          iframe.src = url;
          iframe.onload = () => log('Iframe loaded successfully');
          iframe.onerror = (e) => log('Iframe load error', e);
          iframeContainer.appendChild(iframe);
        });

      } catch (error) {
        log('Fatal error during initialization', { 
          message: error.message, 
          stack: error.stack 
        });
        statusDiv.querySelector('.loader').style.display = 'none';
        statusText.className = 'error';
        statusText.textContent = 'Error: ' + error.message;
        console.error('[Preview] Full error:', error);
      }
    }

    function createFileTree(techStack, files) {
      const packageJson = techStack === 'react' ? {
        name: 'react-preview',
        type: 'module',
        dependencies: { react: '^18.2.0', 'react-dom': '^18.2.0' },
        devDependencies: { '@vitejs/plugin-react': '^4.0.0', vite: '^4.3.9' },
        scripts: { dev: 'vite --host 0.0.0.0', build: 'vite build' },
      } : {
        name: 'vue-preview',
        type: 'module',
        dependencies: { vue: '^3.3.4' },
        devDependencies: { '@vitejs/plugin-vue': '^4.2.3', vite: '^4.3.9' },
        scripts: { dev: 'vite --host 0.0.0.0', build: 'vite build' },
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
        'package.json': { file: { contents: JSON.stringify(packageJson, null, 2) } },
        'vite.config.js': { file: { contents: viteConfig } },
        'index.html': { file: { contents: indexHtml } },
        src: { directory: {} },
      };

      Object.entries(files).forEach(([fileName, content]) => {
        if (fileName.startsWith('src/')) {
          const relativePath = fileName.substring(4);
          const pathParts = relativePath.split('/');
          let current = fileTree.src.directory;
          
          for (let i = 0; i < pathParts.length - 1; i++) {
            if (!current[pathParts[i]]) {
              current[pathParts[i]] = { directory: {} };
            }
            current = current[pathParts[i]].directory;
          }
          
          current[pathParts[pathParts.length - 1]] = { file: { contents: content } };
        }
      });

      return fileTree;
    }

    init();
  </script>
</body>
</html>
  `;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  });
}