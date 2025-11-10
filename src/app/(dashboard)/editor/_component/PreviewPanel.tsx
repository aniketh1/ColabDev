"use client";
import { useEffect, useRef, useState } from "react";
import { useEditorContext } from "../_provider/EditorProvider";
import { X, Play, RotateCw } from "lucide-react";
import { useParams } from "next/navigation";
import Axios from "@/lib/Axios";
import { runCode, type RunCodeOutput, Language } from "@/utils/runCode";
import { initEsbuild } from "@/utils/esbuild";
import { toast } from "sonner";

export default function PreviewPanel() {
  const { openBrowser, setOpenBrowser, mainFileContent, techStack, code } = useEditorContext();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const params = useParams();
  const projectId = params?.projectId as string;
  const [allFiles, setAllFiles] = useState<Record<string, string>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<RunCodeOutput | null>(null);

  // Initialize esbuild on component mount
  useEffect(() => {
    initEsbuild().catch(console.error);
  }, []);

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
            renderHTMLPreview(indexHtmlContent);
          }
        }
      } catch (error) {
        console.error('Failed to fetch project files:', error);
      }
    };

    fetchAllFiles();
  }, [projectId, openBrowser]);

  // Render HTML in iframe
  const renderHTMLPreview = (htmlContent: string) => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();
      }
    }
  };

  // Update HTML preview when main file content changes
  useEffect(() => {
    if (openBrowser && techStack === 'html' && mainFileContent) {
      renderHTMLPreview(mainFileContent);
    }
  }, [mainFileContent, openBrowser, techStack]);

  // Auto-run for React/Node projects when files are loaded
  useEffect(() => {
    if (openBrowser && techStack && techStack !== 'html' && Object.keys(allFiles).length > 0) {
      handleRunCode();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allFiles, techStack, openBrowser]);

  // Update iframe when output changes
  useEffect(() => {
    if (output?.type === 'iframe' && iframeRef.current) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(output.output);
        doc.close();
      }
    }
  }, [output]);

  // Execute code for React/Node projects
  const handleRunCode = async () => {
    if (!techStack || techStack === 'html') return;
    
    try {
      setIsRunning(true);
      toast.loading('Running code...', { id: 'run-code' });

      // Get the main component file based on tech stack
      let mainCode = '';
      if (techStack === 'react') {
        mainCode = allFiles['src/App.jsx'] || allFiles['App.jsx'] || code || '';
      } else if (techStack === 'node') {
        mainCode = allFiles['index.js'] || allFiles['main.js'] || code || '';
      }

      if (!mainCode) {
        throw new Error('No main file found');
      }

      const result = await runCode(mainCode, techStack as Language);
      setOutput(result);

      if (result.type === 'error') {
        toast.error('Execution failed', { id: 'run-code' });
      } else {
        toast.success('Code executed successfully', { id: 'run-code' });
      }
    } catch (error: any) {
      console.error('Execution error:', error);
      toast.error(`Failed to run code: ${error.message}`, { id: 'run-code' });
      setOutput({
        type: 'error',
        output: error.message,
      });
    } finally {
      setIsRunning(false);
    }
  };

  if (!openBrowser) return null;

  const handleRefresh = () => {
    if (techStack === 'html' && mainFileContent) {
      renderHTMLPreview(mainFileContent);
    } else if (techStack && techStack !== 'html') {
      handleRunCode();
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
      <div className="flex-1 bg-white overflow-auto">
        {!output && !isHtmlProject ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <Play size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Loading preview...</p>
              {isRunning && <p className="text-sm mt-2">Compiling code...</p>}
            </div>
          </div>
        ) : output?.type === 'error' ? (
          <div className="p-6 bg-red-50">
            <div className="text-red-600 font-semibold mb-2">
              ❌ Error
            </div>
            <pre className="text-sm text-red-800 whitespace-pre-wrap font-mono">
              {output.output}
            </pre>
          </div>
        ) : output?.type === 'console' ? (
          <div className="p-6 bg-gray-50">
            <div className="text-gray-600 font-semibold mb-2 text-sm">
              Console Output:
            </div>
            <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono bg-white p-4 rounded border border-gray-200">
              {output.output}
            </pre>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-modals allow-forms allow-popups allow-same-origin"
            title="Code Preview"
          />
        )}
      </div>
    </div>
  );
}
