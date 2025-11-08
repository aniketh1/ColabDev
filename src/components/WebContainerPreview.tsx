'use client';
import React, { useEffect, useState } from 'react';
import { useWebContainer } from '@/hooks/useWebContainer';
import { Button } from '@/components/ui/button';
import { Loader2, Play, Square } from 'lucide-react';

interface WebContainerPreviewProps {
  html: string;
  css: string;
  js: string;
}

export function WebContainerPreview({ html, css, js }: WebContainerPreviewProps) {
  const { isBooting, error, output, runWebPreview } = useWebContainer();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = async () => {
    try {
      setIsRunning(true);
      const url = await runWebPreview(html, css, js);
      setPreviewUrl(url);
    } catch (err: any) {
      console.error('Failed to run preview:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleStop = () => {
    setPreviewUrl(null);
    setIsRunning(false);
  };

  if (isBooting) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-500">Booting WebContainer...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-red-500">
          <p className="font-semibold">WebContainer Error</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="flex items-center gap-2 p-2 border-b bg-gray-50">
        {!previewUrl ? (
          <Button
            onClick={handleRun}
            disabled={isRunning}
            size="sm"
            className="gap-2"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={handleStop}
            variant="destructive"
            size="sm"
            className="gap-2"
          >
            <Square className="w-4 h-4" />
            Stop
          </Button>
        )}
        <span className="text-xs text-gray-500">WebContainer Preview</span>
      </div>

      {/* Preview iframe */}
      {previewUrl ? (
        <iframe
          src={previewUrl}
          className="flex-1 w-full border-0"
          title="WebContainer Preview"
          sandbox="allow-scripts allow-same-origin allow-forms"
        />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-white">
          <div className="text-center text-gray-400">
            <p>Click "Run" to preview your code</p>
            <p className="text-xs mt-2">Powered by WebContainers</p>
          </div>
        </div>
      )}

      {/* Console Output */}
      {output.length > 0 && (
        <div className="h-32 overflow-auto bg-black text-green-400 p-2 font-mono text-xs">
          {output.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      )}
    </div>
  );
}
