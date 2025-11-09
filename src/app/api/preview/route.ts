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

    async function init() {
      try {
        statusText.textContent = 'Fetching project files...';
        const response = await fetch('${escapeForScript(baseUrl)}/api/project-files/' + projectId);
        if (!response.ok) throw new Error('Failed to fetch project files');
        
        const result = await response.json();
        const files = result.data.files;
        const techStack = result.data.techStack;

        statusText.textContent = 'Booting WebContainer...';
        const webcontainer = await WebContainer.boot();

        statusText.textContent = 'Creating project files...';
        const fileTree = createFileTree(techStack, files);
        await webcontainer.mount(fileTree);

        statusText.textContent = 'Installing dependencies...';
        const installProcess = await webcontainer.spawn('npm', ['install']);
        const installExitCode = await installProcess.exit;
        
        if (installExitCode !== 0) {
          throw new Error('npm install failed');
        }

        statusText.textContent = 'Starting dev server...';
        const devProcess = await webcontainer.spawn('npm', ['run', 'dev']);

        webcontainer.on('server-ready', (port, url) => {
          statusText.textContent = 'Ready!';
          setTimeout(() => {
            statusDiv.style.display = 'none';
          }, 1000);
          
          const iframe = document.createElement('iframe');
          iframe.src = url;
          iframeContainer.appendChild(iframe);
        });

      } catch (error) {
        statusDiv.querySelector('.loader').style.display = 'none';
        statusText.className = 'error';
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