"use client";
import React, { useEffect, useRef, useState } from "react";
import { useEditorContext } from "../_provider/EditorProvider";
import * as motion from "motion/react-client";
import { Resizable } from "re-resizable";
import { Play, RotateCw, X, ChevronDown } from "lucide-react";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { runCode, Language, getSupportedLanguages, type RunCodeOutput } from "@/utils/runCode";
import { initEsbuild } from "@/utils/esbuild";

const BrowerRunCode = ({ children }: { children: React.ReactNode }) => {
  const { openBrowser, setOpenBrowser, code } = useEditorContext();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [drag, setDrag] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('react');
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<RunCodeOutput | null>(null);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleMouseDown = () => {
    setDrag(true);
  };

  const handleMouseUp = () => {
    setDrag(false);
  };

  // Execute code
  const handleRunCode = async () => {
    if (!code || !code.trim()) {
      toast.error('No code to run');
      return;
    }

    try {
      setIsRunning(true);
      toast.loading('Running code...', { id: 'run-code' });

      const result = await runCode(code, selectedLanguage);
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

  // Initialize esbuild on component mount
  useEffect(() => {
    initEsbuild().catch(console.error);
  }, []);

  const supportedLanguages = getSupportedLanguages();
  return (
    <div ref={containerRef}>
      {children}

      {openBrowser && (
        <motion.div
          drag={drag}
          dragConstraints={containerRef}
          dragElastic={0.2}
          className="absolute right-2 top-0 z-50"
        >
          <Resizable 
            className="min-h-96 min-w-96 pb-2 shadow-2xl overflow-hidden rounded-lg z-50 bg-white dark:bg-gray-900"
            defaultSize={{
              width: 600,
              height: 500,
            }}
          >
            {/* Header */}
            <div
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-10 flex items-center cursor-grab px-4 shadow-md"
            >
              <span className="text-white text-sm font-semibold flex items-center gap-2">
                <Play size={16} />
                Code Preview - {selectedLanguage.toUpperCase()}
              </span>
              <X
                size={18}
                className="ml-auto cursor-pointer text-white hover:bg-white/20 rounded p-1 transition-colors"
                onClick={() => setOpenBrowser(false)}
              />
            </div>

            {/* Controls Bar */}
            <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 flex items-center gap-3">
              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  <span className="text-sm font-medium capitalize">
                    {selectedLanguage}
                  </span>
                  <ChevronDown size={16} />
                </button>

                {showLanguageDropdown && (
                  <div className="absolute top-full mt-1 left-0 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 min-w-[120px]">
                    {supportedLanguages.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          setSelectedLanguage(lang);
                          setShowLanguageDropdown(false);
                          setOutput(null); // Clear previous output
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 capitalize first:rounded-t-lg last:rounded-b-lg"
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Run Button */}
              <button
                onClick={handleRunCode}
                disabled={isRunning || !code}
                className={cn(
                  "flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-all",
                  isRunning || !code
                    ? "bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transform hover:scale-105"
                )}
              >
                {isRunning ? (
                  <>
                    <RotateCw size={16} className="animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play size={16} />
                    Run Code
                  </>
                )}
              </button>

              {/* Info Badge */}
              {selectedLanguage === 'node' && (
                <span className="ml-auto text-xs text-gray-600 dark:text-gray-400 bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1 rounded-full">
                  Runs on Piston API
                </span>
              )}
              {selectedLanguage !== 'node' && (
                <span className="ml-auto text-xs text-gray-600 dark:text-gray-400 bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                  Runs in Browser
                </span>
              )}
            </div>

            {/* Output Area */}
            <div className="h-full w-full overflow-auto bg-white dark:bg-gray-900">
              {!output ? (
                <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                  <div className="text-center">
                    <Play size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No output yet</p>
                    <p className="text-sm mt-2">Write code and click "Run Code" to see results</p>
                  </div>
                </div>
              ) : output.type === 'error' ? (
                <div className="p-6 bg-red-50 dark:bg-red-900/20">
                  <div className="text-red-600 dark:text-red-400 font-semibold mb-2">
                    ❌ Error
                  </div>
                  <pre className="text-sm text-red-800 dark:text-red-300 whitespace-pre-wrap font-mono">
                    {output.output}
                  </pre>
                </div>
              ) : output.type === 'console' ? (
                <div className="p-6 bg-gray-50 dark:bg-gray-800">
                  <div className="text-gray-600 dark:text-gray-400 font-semibold mb-2 text-sm">
                    Console Output:
                  </div>
                  <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-mono bg-white dark:bg-gray-900 p-4 rounded border border-gray-200 dark:border-gray-700">
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
          </Resizable>
        </motion.div>
      )}
    </div>
  );
};

export default BrowerRunCode;
