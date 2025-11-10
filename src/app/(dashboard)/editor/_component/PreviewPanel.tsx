"use client";
import { useEffect, useRef, useState } from "react";
import { useEditorContext } from "../_provider/EditorProvider";
import { X, Play, RotateCw } from "lucide-react";
import { useParams } from "next/navigation";
import Axios from "@/lib/Axios";
import { WebContainerPreview } from "@/components/WebContainerPreview";

export default function PreviewPanel() {
  const { openBrowser, setOpenBrowser, mainFileContent, techStack } = useEditorContext();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const params = useParams();
  const projectId = params?.projectId as string;
  const [allFiles, setAllFiles] = useState<Record<string, string>>({});

  // Fetch all files for the project
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
          
          console.log('📁 Fetched files for preview:', Object.keys(filesData));
          setAllFiles(filesData);
          
          // For HTML projects: If mainFileContent is empty and we found index.html, render it
          if (!mainFileContent && indexHtmlContent && techStack === 'html') {
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
          <WebContainerPreview 
            projectId={projectId} 
            techStack={techStack as 'react' | 'vue' | 'node' | 'html'} 
            files={allFiles} 
          />
        )}
      </div>
    </div>
  );
}
