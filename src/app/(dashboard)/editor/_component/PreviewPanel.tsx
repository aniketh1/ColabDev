"use client";
import { useEffect, useRef, useState } from "react";
import { useEditorContext } from "../_provider/EditorProvider";
import { X, Play, RotateCw, AlertCircle } from "lucide-react";
import { useParams } from "next/navigation";
import Axios from "@/lib/Axios";

export default function PreviewPanel() {
  const { openBrowser, setOpenBrowser, mainFileContent, techStack } = useEditorContext();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const params = useParams();
  const projectId = params?.projectId as string;
  const [allFiles, setAllFiles] = useState<Record<string, string>>({});

  // Fetch all files for the project and set mainFileContent if it's empty
  useEffect(() => {
    const fetchAllFiles = async () => {
      if (!projectId || !openBrowser) return;
      
      try {
        const response = await Axios.get(`/api/project-file?projectId=${projectId}`);
        if (response.status === 200) {
          const filesData: Record<string, string> = {};
          let indexHtmlContent = '';
          
          response.data.data.forEach((file: any) => {
            filesData[file.name] = file.content;
            if (file.name === 'index.html') {
              indexHtmlContent = file.content;
            }
          });
          
          setAllFiles(filesData);
          
          // If mainFileContent is empty and we found index.html, set it
          if (!mainFileContent && indexHtmlContent && techStack === 'html') {
            // We need to render the HTML content directly in the iframe
            if (iframeRef.current) {
              const iframe = iframeRef.current;
              const doc = iframe.contentDocument || iframe.contentWindow?.document;
              if (doc) {
                doc.open();
                doc.write(indexHtmlContent);
                doc.close();
              }
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch project files:', error);
      }
    };

    fetchAllFiles();
  }, [projectId, openBrowser, mainFileContent, techStack]);

  // Update HTML preview when main file content changes
  useEffect(() => {
    if (openBrowser && techStack === 'html' && iframeRef.current && mainFileContent) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(mainFileContent);
        doc.close();
      }
    }
  }, [mainFileContent, openBrowser, techStack]);

  if (!openBrowser) return null;

  const handleRefresh = () => {
    if (techStack === 'html' && iframeRef.current && mainFileContent) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(mainFileContent);
        doc.close();
      }
    }
  };

  const isHtmlProject = !techStack || techStack === 'html';

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
        {isHtmlProject ? (
          <iframe
            ref={iframeRef}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-modals allow-forms allow-popups allow-same-origin"
            title="Code Preview"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-[#1e1e1e] text-[#cccccc]">
            <div className="text-center p-8 max-w-md">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-[#007acc]" />
              <h3 className="text-xl font-semibold mb-2">Preview Not Available</h3>
              <p className="text-sm text-[#8b949e] mb-4">
                Live preview for <span className="text-[#007acc] font-medium">{techStack.toUpperCase()}</span> projects requires a bundler.
              </p>
              <p className="text-xs text-[#8b949e]">
                You can still edit your code. To see the preview, deploy your project or run it locally.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
