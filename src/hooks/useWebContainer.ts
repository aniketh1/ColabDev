'use client';
import { useEffect, useRef, useState } from 'react';
import { WebContainer, FileSystemTree } from '@webcontainer/api';

export function useWebContainer() {
  const webcontainerRef = useRef<WebContainer | null>(null);
  const [isBooting, setIsBooting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState<string[]>([]);

  // Boot WebContainer instance
  useEffect(() => {
    const bootContainer = async () => {
      try {
        console.log('🚀 Booting WebContainer...');
        webcontainerRef.current = await WebContainer.boot();
        setIsBooting(false);
        console.log('✅ WebContainer ready!');
      } catch (err: any) {
        console.error('Failed to boot WebContainer:', err);
        setError(err.message);
        setIsBooting(false);
      }
    };

    bootContainer();

    return () => {
      webcontainerRef.current?.teardown();
    };
  }, []);

  // Mount files to WebContainer
  const mountFiles = async (files: Record<string, string>) => {
    if (!webcontainerRef.current) {
      throw new Error('WebContainer not initialized');
    }

    const fileTree: FileSystemTree = {};
    
    for (const [fileName, content] of Object.entries(files)) {
      fileTree[fileName] = {
        file: {
          contents: content,
        },
      };
    }

    await webcontainerRef.current.mount(fileTree);
    console.log('📁 Files mounted to WebContainer');
  };

  // Run a command in WebContainer
  const runCommand = async (command: string, args: string[] = []) => {
    if (!webcontainerRef.current) {
      throw new Error('WebContainer not initialized');
    }

    const process = await webcontainerRef.current.spawn(command, args);
    
    // Capture output
    process.output.pipeTo(
      new WritableStream({
        write(data) {
          setOutput((prev) => [...prev, data]);
          console.log('📤 Output:', data);
        },
      })
    );

    return process.exit;
  };

  // Start dev server (for React/Vue/Node projects)
  const startDevServer = async (port: number = 3000) => {
    if (!webcontainerRef.current) {
      throw new Error('WebContainer not initialized');
    }

    // Install dependencies
    setOutput(['📦 Installing dependencies...']);
    await runCommand('npm', ['install']);

    // Start dev server
    setOutput((prev) => [...prev, '🚀 Starting dev server...']);
    await runCommand('npm', ['run', 'dev']);

    // Get server URL
    webcontainerRef.current.on('server-ready', (port, url) => {
      setOutput((prev) => [...prev, `✅ Server ready at ${url}`]);
    });
  };

  // Execute JavaScript code
  const executeJavaScript = async (code: string) => {
    if (!webcontainerRef.current) {
      throw new Error('WebContainer not initialized');
    }

    await mountFiles({
      'index.js': code,
      'package.json': JSON.stringify({
        name: 'code-execution',
        type: 'module',
        dependencies: {},
      }),
    });

    const exitCode = await runCommand('node', ['index.js']);
    return exitCode;
  };

  // Run HTML/CSS/JS preview
  const runWebPreview = async (html: string, css: string, js: string) => {
    if (!webcontainerRef.current) {
      throw new Error('WebContainer not initialized');
    }

    const htmlWithAssets = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <style>${css}</style>
</head>
<body>
  ${html}
  <script>${js}</script>
</body>
</html>
    `;

    await mountFiles({
      'index.html': htmlWithAssets,
      'package.json': JSON.stringify({
        name: 'preview',
        dependencies: {
          'http-server': 'latest',
        },
      }),
    });

    // Install http-server
    await runCommand('npm', ['install']);

    // Start HTTP server
    await runCommand('npx', ['http-server', '-p', '8080']);

    // Return preview URL
    const url = await new Promise<string>((resolve) => {
      webcontainerRef.current?.on('server-ready', (port, url) => {
        resolve(url);
      });
    });

    return url;
  };

  return {
    webcontainer: webcontainerRef.current,
    isBooting,
    error,
    output,
    mountFiles,
    runCommand,
    startDevServer,
    executeJavaScript,
    runWebPreview,
  };
}
