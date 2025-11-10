"use client";
import { useEffect, useRef } from "react";
import { useEditorContext } from "../_provider/EditorProvider";
import { X, Play, RotateCw } from "lucide-react";

export default function PreviewPanel() {
  const { openBrowser, setOpenBrowser, mainFileContent } = useEditorContext();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Update preview when main file content changes
  useEffect(() => {
    if (openBrowser && iframeRef.current && mainFileContent) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(mainFileContent);
        doc.close();
      }
    }
  }, [mainFileContent, openBrowser]);

  if (!openBrowser) return null;

  const handleRefresh = () => {
    if (iframeRef.current && mainFileContent) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(mainFileContent);
        doc.close();
      }
    }
  };

  return (
    <div className="w-1/2 flex flex-col border-l border-[#2d2d2d] bg-[#1e1e1e]">
      {/* Preview Header */}
      <div className="h-10 bg-[#252526] border-b border-[#2d2d2d] flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Play className="w-4 h-4 text-[#007acc]" />
          <span className="text-sm font-medium text-[#cccccc]">Preview</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="p-1.5 hover:bg-[#2a2d2e] rounded transition-colors"
            title="Refresh Preview"
          >
            <RotateCw className="w-4 h-4 text-[#cccccc]" />
          </button>
          <button
            onClick={() => setOpenBrowser(false)}
            className="p-1.5 hover:bg-[#2a2d2e] rounded transition-colors"
            title="Close Preview"
          >
            <X className="w-4 h-4 text-[#cccccc]" />
          </button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 bg-white">
        <iframe
          ref={iframeRef}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-modals allow-forms allow-popups allow-same-origin"
          title="Code Preview"
        />
      </div>
    </div>
  );
}
