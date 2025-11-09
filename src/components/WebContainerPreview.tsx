'use client';
import React, { useEffect, useRef, useState } from 'react';
import { WebContainer } from '@webcontainer/api';
import { 
  getWebContainer, 
  createReactProjectFiles, 
  createVueProjectFiles, 
  createNodeProjectFiles 
} from '@/lib/webcontainer';
import { Loader2, AlertCircle, CheckCircle2, Package, Zap } from 'lucide-react';

interface WebContainerPreviewProps {
  projectId: string;
  techStack: 'react' | 'vue' | 'node' | 'html';
  files: { [key: string]: string };
}

export function WebContainerPreview({ projectId, techStack, files }: WebContainerPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [webcontainer, setWebcontainer] = useState<WebContainer | null>(null);
  const [url, setUrl] = useState<string>('');
  const [status, setStatus] = useState<'booting' | 'installing' | 'starting' | 'ready' | 'error'>('booting');
  const [error, setError] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev.slice(-5), message]);
    console.log('📦 WebContainer:', message);
  };

  useEffect(() => {
    let isMounted = true;

    const initWebContainer = async () => {
      try {
        // Only run WebContainer for React, Vue, and Node projects
        if (techStack === 'html') {
          setStatus('error');
          setError('WebContainer is only for React, Vue, and Node.js projects');
          return;
        }

        addLog('Booting WebContainer...');
        setStatus('booting');

        // Get WebContainer instance
        const container = await getWebContainer();
        if (!isMounted) return;
        
        setWebcontainer(container);
        addLog('✅ WebContainer booted');

        // Create project files based on tech stack
        let fileTree: any;
        switch (techStack) {
          case 'react':
            fileTree = createReactProjectFiles(files);
            break;
          case 'vue':
            fileTree = createVueProjectFiles(files);
            break;
          case 'node':
            fileTree = createNodeProjectFiles(files);
            break;
          default:
            throw new Error(`Unsupported tech stack: ${techStack}`);
        }

        addLog('Mounting project files...');
        await container.mount(fileTree);
        addLog('✅ Files mounted');

        // Install dependencies
        addLog('Installing dependencies...');
        setStatus('installing');
        
        const installProcess = await container.spawn('npm', ['install']);
        
        installProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              if (data.includes('added') || data.includes('packages')) {
                addLog(data.trim());
              }
            },
          })
        );

        const installExitCode = await installProcess.exit;
        if (installExitCode !== 0) {
          throw new Error('Failed to install dependencies');
        }
        
        if (!isMounted) return;
        addLog('✅ Dependencies installed');

        // Start dev server
        addLog('Starting dev server...');
        setStatus('starting');

        const startCommand = techStack === 'node' ? 'start' : 'dev';
        const devProcess = await container.spawn('npm', ['run', startCommand]);

        devProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              addLog(data.trim());
            },
          })
        );

        // Wait for server to be ready
        container.on('server-ready', (port, url) => {
          if (!isMounted) return;
          addLog(`✅ Server ready on port ${port}`);
          setUrl(url);
          setStatus('ready');
        });

      } catch (err: any) {
        console.error('WebContainer error:', err);
        if (isMounted) {
          setStatus('error');
          setError(err.message || 'Failed to start WebContainer');
          addLog(`❌ Error: ${err.message}`);
        }
      }
    };

    initWebContainer();

    return () => {
      isMounted = false;
    };
  }, [projectId, techStack, JSON.stringify(files)]);

  // Update iframe when URL is ready
  useEffect(() => {
    if (url && iframeRef.current) {
      iframeRef.current.src = url;
    }
  }, [url]);

  return (
    <div className="h-full w-full flex flex-col bg-gray-50">
      {/* Status Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {status === 'booting' && (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              <span className="text-sm font-medium text-gray-700">Booting WebContainer...</span>
            </>
          )}
          {status === 'installing' && (
            <>
              <Package className="h-4 w-4 animate-pulse text-blue-500" />
              <span className="text-sm font-medium text-gray-700">Installing dependencies...</span>
            </>
          )}
          {status === 'starting' && (
            <>
              <Zap className="h-4 w-4 animate-pulse text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">Starting dev server...</span>
            </>
          )}
          {status === 'ready' && (
            <>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-gray-700">Ready</span>
            </>
          )}
          {status === 'error' && (
            <>
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium text-red-600">Error</span>
            </>
          )}
        </div>

        {/* Tech Stack Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-md font-medium uppercase">
            {techStack}
          </span>
          {url && (
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline"
            >
              Open in new tab
            </a>
          )}
        </div>
      </div>

      {/* Logs */}
      {status !== 'ready' && status !== 'error' && (
        <div className="bg-gray-900 text-green-400 p-4 font-mono text-xs overflow-auto max-h-32">
          {logs.map((log, index) => (
            <div key={index} className="mb-1">{log}</div>
          ))}
        </div>
      )}

      {/* Error Message */}
      {status === 'error' && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Failed to start preview</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Preview iframe */}
      <div className="flex-1 relative">
        {status === 'ready' ? (
          <iframe
            ref={iframeRef}
            className="w-full h-full border-0"
            title="Preview"
            sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
          />
        ) : status !== 'error' ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">
                {status === 'booting' && 'Booting WebContainer...'}
                {status === 'installing' && 'Installing dependencies...'}
                {status === 'starting' && 'Starting development server...'}
              </p>
              <p className="text-sm text-gray-500 mt-2">This may take a minute on first load</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}