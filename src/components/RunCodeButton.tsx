'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Monitor, X } from 'lucide-react';

interface RunCodeButtonProps {
  html: string;
  css: string;
  js: string;
  projectId: string;
}

export function RunCodeButton({ html, css, js, projectId }: RunCodeButtonProps) {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="relative">
      {/* Run Button */}
      <Button
        onClick={() => setShowPreview(true)}
        size="sm"
        className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
      >
        <Play className="w-4 h-4" />
        Run Code
      </Button>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <div className="flex items-center gap-2">
                <Monitor className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold">Live Preview</h3>
                <span className="text-xs text-gray-500 ml-2">
                  HTML + CSS + JavaScript
                </span>
              </div>
              <Button
                onClick={() => setShowPreview(false)}
                variant="ghost"
                size="sm"
                className="gap-2"
              >
                <X className="w-4 h-4" />
                Close
              </Button>
            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-hidden bg-white">
              <IframePreview html={html} css={css} js={js} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple iframe preview component
function IframePreview({ html, css, js }: { html: string; css: string; js: string }) {
  const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <style>
    body { margin: 0; padding: 20px; font-family: system-ui, -apple-system, sans-serif; }
    ${css}
  </style>
</head>
<body>
  ${html}
  <script>
    try {
      ${js}
    } catch (error) {
      document.body.innerHTML += '<div style="background: #fee; color: #c00; padding: 10px; margin-top: 20px; border-radius: 4px;"><strong>Error:</strong> ' + error.message + '</div>';
      console.error(error);
    }
  </script>
</body>
</html>
  `;

  return (
    <iframe
      srcDoc={fullHtml}
      className="w-full h-full border-0"
      title="Code Preview"
      sandbox="allow-scripts"
    />
  );
}
