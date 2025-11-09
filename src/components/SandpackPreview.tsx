'use client';

import { useEffect, useState } from 'react';

interface SandpackPreviewProps {
  projectId: string;
  techStack: 'react' | 'vue' | 'node';
}

export default function SandpackPreview({ projectId, techStack }: SandpackPreviewProps) {
  const [sandpackUrl, setSandpackUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const createSandbox = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch project files
        const response = await fetch(`/api/project-files/${projectId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch project files');
        }

        const result = await response.json();
        const files = result.data.files;

        // Create CodeSandbox parameters
        const sandboxFiles: Record<string, { content: string }> = {};
        
        // Add package.json based on tech stack
        if (techStack === 'react') {
          sandboxFiles['package.json'] = {
            content: JSON.stringify({
              name: 'react-preview',
              dependencies: {
                react: '^18.2.0',
                'react-dom': '^18.2.0',
              },
              devDependencies: {
                '@vitejs/plugin-react': '^4.0.0',
                vite: 'latest',
              },
            }, null, 2),
          };
          sandboxFiles['index.html'] = {
            content: `<!DOCTYPE html>
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
</html>`,
          };
        } else if (techStack === 'vue') {
          sandboxFiles['package.json'] = {
            content: JSON.stringify({
              name: 'vue-preview',
              dependencies: {
                vue: '^3.3.4',
              },
              devDependencies: {
                '@vitejs/plugin-vue': '^4.2.3',
                vite: 'latest',
              },
            }, null, 2),
          };
          sandboxFiles['index.html'] = {
            content: `<!DOCTYPE html>
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
</html>`,
          };
        }

        // Add user files
        Object.entries(files).forEach(([fileName, content]) => {
          sandboxFiles[fileName] = { content: content as string };
        });

        // Create CodeSandbox URL
        const parameters = {
          files: sandboxFiles,
          template: techStack === 'react' ? 'vite-react' : techStack === 'vue' ? 'vite-vue' : 'node',
        };

        const compressed = btoa(JSON.stringify(parameters));
        const url = `https://codesandbox.io/api/v1/sandboxes/define?parameters=${compressed}`;

        // Open in new tab instead of iframe to avoid issues
        window.open(url, '_blank', 'width=1200,height=800');
        setLoading(false);

      } catch (err: any) {
        console.error('Error creating sandbox:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    createSandbox();
  }, [projectId, techStack]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-white">Opening in CodeSandbox...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-red-500">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center text-white">
        <p>Preview opened in new tab</p>
        <p className="text-sm text-gray-400 mt-2">Check your browser for the CodeSandbox window</p>
      </div>
    </div>
  );
}
