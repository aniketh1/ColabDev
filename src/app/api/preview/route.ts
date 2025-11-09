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
    const iframeContainer = document.getElementById('iframe-container');
    const projectId = '${projectId}';
    const techStackType = '${techStack}';

    async function init() {
      try {
        // Fetch project files
        statusText.textContent = 'Fetching project files...';
        const response = await fetch('${baseUrl}/api/project-files/' + projectId);
        if (!response.ok) throw new Error('Failed to fetch project files');
        
        const { data } = await response.json();
        const { files, techStack } = data;

        // Boot WebContainer
        statusText.textContent = 'Booting WebContainer...';
        const webcontainer = await WebContainer.boot();

        // Create file structure
        statusText.textContent = 'Creating project files...';
        const fileTree = createFileTree(techStack, files);
        await webcontainer.mount(fileTree);

        // Install dependencies
        statusText.textContent = 'Installing dependencies...';
        const installProcess = await webcontainer.spawn('npm', ['install']);
        await installProcess.exit;

        // Start dev server
        statusText.textContent = 'Starting dev server...';
        const devProcess = await webcontainer.spawn('npm', ['run', 'dev']);

        // Wait for server
        webcontainer.on('server-ready', (port, url) => {
          statusText.textContent = 'Ready!';
          setTimeout(() => {
            document.getElementById('status').style.display = 'none';
          }, 1000);
          
          const iframe = document.createElement('iframe');
          iframe.src = url;
          iframeContainer.appendChild(iframe);
        });

      } catch (error) {
        statusText.textContent = 'Error: ' + error.message;
        console.error(error);
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

      const viteConfig = techStack === 'react'
        ? "import { defineConfig } from 'vite'\\nimport react from '@vitejs/plugin-react'\\n\\nexport default defineConfig({ plugins: [react()], server: { port: 3000 } })"
        : "import { defineConfig } from 'vite'\\nimport vue from '@vitejs/plugin-vue'\\n\\nexport default defineConfig({ plugins: [vue()], server: { port: 3000 } })";

      const mainFile = techStack === 'react' ? 'jsx' : 'js';
      const indexHtml = "<!DOCTYPE html>\\n<html lang=\\"en\\">\\n<head>\\n<meta charset=\\"UTF-8\\" />\\n<title>" + techStack + " Preview</title>\\n</head>\\n<body>\\n<div id=\\"root\\"></div>\\n<script type=\\"module\\" src=\\"/src/main." + mainFile + "\\"></script>\\n</body>\\n</html>";

      const fileTree = {
        'package.json': { file: { contents: JSON.stringify(packageJson, null, 2) } },
        'vite.config.js': { file: { contents: viteConfig } },
        'index.html': { file: { contents: indexHtml } },
        src: { directory: {} },
      };

      // Add user files
      Object.entries(files).forEach(([fileName, content]) => {
        if (fileName.startsWith('src/')) {
          const relativePath = fileName.substring(4);
          const pathParts = relativePath.split('/');
          let current = fileTree.src.directory;
          
          for (let i = 0; i < pathParts.length - 1; i++) {
            if (!current[pathParts[i]]) current[pathParts[i]] = { directory: {} };
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
