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
  
  // Use a ref to hold the user files to check for changes without re-running the main effect
  const filesRef = useRef(files);

  const addLog = (message: string) => {
    setLogs(prev => [...prev.slice(-5), message]);
    console.log('📦 WebContainer:', message);
  };
  
  // --- EFFECT 1: INITIAL BOOT, INSTALL, AND START ---
  useEffect(() => {
    let isMounted = true;
    
    // Clear state when project/techStack changes
    setWebcontainer(null);
    setUrl('');
    setError('');
    setLogs([]);

    const initWebContainer = async () => {
      try {
        if (techStack === 'html') {
          setStatus('error');
          setError('WebContainer is only for React, Vue, and Node.js projects');
          return;
        }

        addLog('Booting WebContainer...');
        setStatus('booting');

        const container = await getWebContainer();
        if (!isMounted) return;
        
        setWebcontainer(container);
        addLog('✅ WebContainer booted');

        // Initial Mount
        await handleMount(container, techStack, files, addLog);
        
        if (!isMounted) return;
        
        // Install dependencies
        addLog('Installing dependencies...');
        setStatus('installing');
        await handleInstall(container, addLog);
        
        if (!isMounted) return;
        addLog('✅ Dependencies installed');
        
        // Start dev server
        addLog('Starting dev server...');
        setStatus('starting');
        const serverUrl = await handleStart(container, techStack, addLog);
        
        if (!isMounted) return;
        addLog(`✅ Server ready at ${serverUrl}`);
        setUrl(serverUrl);
        setStatus('ready');

      } catch (err: any) {
        console.error('❌ WebContainer error:', err);
        if (isMounted) {
          setStatus('error');
          
          // Provide user-friendly error messages
          let errorMessage = err.message || 'Failed to start WebContainer';
          
          if (err.message?.includes('Cross-Origin-Opener-Policy') || 
              err.message?.includes('WebAssembly.Memory')) {
            errorMessage = 'WebContainer requires specific browser headers. Please refresh the page and try again.';
          } else if (err.message?.includes('Unable to create more instances')) {
            errorMessage = 'WebContainer instance limit reached. Please close other preview tabs and refresh.';
          }
          
          setError(errorMessage);
          addLog(`❌ Error: ${err.message}`);
        }
      }
    };

    initWebContainer();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, techStack]); // Only re-run on project or techStack change, files handled by second effect

  // --- EFFECT 2: FILE CONTENT UPDATES (Hot Reload) ---
  useEffect(() => {
    // Prevent running on initial mount
    if (!webcontainer || JSON.stringify(files) === JSON.stringify(filesRef.current)) {
      filesRef.current = files; // Update ref if initial run
      return;
    }

    const updateFiles = async () => {
      addLog('User files changed. Updating WebContainer...');
      
      // Iterate over the new files object to find changed files
      for (const filePath of Object.keys(files)) {
        if (files[filePath] !== filesRef.current[filePath]) {
          // Write only the changed file
          addLog(`📝 Writing file: ${filePath}`);
          await webcontainer.fs.writeFile(filePath, files[filePath]);
        }
      }

      filesRef.current = files;
      addLog('✅ File updates written (server should hot-reload)');
    };

    // Only update if status is ready, otherwise, the initial boot is handling it.
    if (status === 'ready') {
      updateFiles();
    }

  }, [files, webcontainer, status]); // Run when files change

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
        <div className="bg-red-50 dark:bg-red-950/30 border-l-4 border-red-500 p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-800 dark:text-red-400">Failed to start preview</h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
              {error.includes('Unable to create more instances') && (
                <div className="mt-3 text-xs text-red-600 dark:text-red-400">
                  <p className="font-semibold">WebContainer instance limit reached.</p>
                  <p className="mt-1">Please close other preview windows and refresh the page.</p>
                </div>
              )}
              {(error.includes('Cross-Origin') || error.includes('WebAssembly.Memory')) && (
                <div className="mt-3 text-xs text-red-600 dark:text-red-400">
                  <p className="font-semibold">Cross-Origin Isolation Required.</p>
                  <p className="mt-1">Please ensure the host page has <strong>Cross-Origin-Opener-Policy: same-origin</strong> and <strong>Cross-Origin-Embedder-Policy: require-corp</strong> HTTP headers.</p>
                  <p className="mt-1">Restart your dev server after updating next.config.ts</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Preview iframe */}
      <div className="flex-1 relative">
        {status === 'ready' && url ? (
          <iframe
            key={url}
            ref={iframeRef}
            src={url}
            className="w-full h-full border-0"
            title="Preview"
            sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
            allow="cross-origin-isolated"
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

// --- Helper Functions to keep useEffect clean ---

async function handleMount(container: WebContainer, techStack: 'react' | 'vue' | 'node', files: { [key: string]: string }, addLog: (m: string) => void) {
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
    console.log('📁 File tree structure:', fileTree);
    console.log('📝 User files received:', Object.keys(files));
    await container.mount(fileTree);
    addLog('✅ Files mounted');
}

async function handleInstall(container: WebContainer, addLog: (m: string) => void): Promise<void> {
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
}

async function handleStart(container: WebContainer, techStack: 'react' | 'vue' | 'node', addLog: (m: string) => void): Promise<string> {
    const startCommand = techStack === 'node' ? 'start' : 'dev';
    console.log(`🚀 Running: npm run ${startCommand}`);

    const serverReadyPromise = new Promise<string>((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error('Server start timeout after 60 seconds'));
        }, 60000);

        container.on('server-ready', (port, serverUrl) => {
            console.log(`✅ Server ready event received - Port: ${port}, URL: ${serverUrl}`);
            clearTimeout(timeout);
            resolve(serverUrl);
        });
    });

    const devProcess = await container.spawn('npm', ['run', startCommand]);

    devProcess.output.pipeTo(
        new WritableStream({
            write(data) {
                const message = data.trim();
                if (message) {
                    console.log('📦 Dev server:', message);
                    addLog(message);
                }
            },
        })
    );

    return serverReadyPromise;
}