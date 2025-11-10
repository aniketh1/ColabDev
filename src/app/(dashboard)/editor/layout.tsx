"use client";

import EditorHeader from "./_component/EditorHeader";
import EditorSidebar from "./_component/EditorSidebar";
import FileOpen from "./_component/FileOpen";
import { EditorProviderComp } from "./_provider/EditorProvider";
import BrowerRunCode from "./_component/BrowerRunCode";
import dynamic from "next/dynamic";

// Dynamically import ResizableSidebar to avoid SSR issues
const ResizableSidebar = dynamic(() => import("@/components/ResizableSidebar"), {
  ssr: false,
  loading: () => <div className="w-[20%] border-r border-[#2d2d2d] bg-[#252526]"><EditorSidebar /></div>
});

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#1e1e1e] antialiased">
      <EditorProviderComp>
        {/* Header - VS Code style */}
        <div className="flex-shrink-0 h-[48px] border-b border-[#2d2d2d] bg-[#323233]">
          <EditorHeader />
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          <BrowerRunCode>
            {/* Sidebar - Wider and cleaner on desktop */}
            <div className="hidden lg:flex lg:w-[280px] border-r border-[#2d2d2d] bg-[#252526] flex-shrink-0">
              <EditorSidebar />
            </div>

            {/* Resizable Sidebar for Tablet */}
            <div className="hidden md:flex lg:hidden">
              <ResizableSidebar className="border-r border-[#2d2d2d] bg-[#252526]" />
            </div>

            {/* Main Editor Area - Takes remaining space */}
            <main className="flex-1 flex flex-col overflow-hidden bg-[#1e1e1e] min-w-0">
              {/* Tab Bar */}
              <div className="flex-shrink-0 h-[40px] bg-[#252526] border-b border-[#2d2d2d]">
                <FileOpen />
              </div>

              {/* Editor Content */}
              <div className="flex-1 overflow-auto bg-[#1e1e1e] custom-scrollbar p-4">
                {children}
              </div>

              {/* Status Bar */}
              <div className="flex-shrink-0 h-[24px] bg-[#007acc] flex items-center justify-between px-4 text-white text-xs">
                <div className="flex items-center gap-6">
                  <span className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 13A6 6 0 118 2a6 6 0 010 12z"/>
                      <path d="M8 4a.5.5 0 01.5.5v3h3a.5.5 0 010 1h-3.5a.5.5 0 01-.5-.5v-4A.5.5 0 018 4z"/>
                    </svg>
                    <span className="font-medium">main</span>
                  </span>
                  <span>UTF-8</span>
                  <span>LF</span>
                </div>
                <div className="flex items-center gap-6">
                  <span>Ln 1, Col 1</span>
                  <span>Spaces: 2</span>
                </div>
              </div>
            </main>
          </BrowerRunCode>
        </div>
      </EditorProviderComp>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 14px;
          height: 14px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1e1e1e;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #424242;
          border: 3px solid #1e1e1e;
          border-radius: 7px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #4e4e4e;
        }
        .custom-scrollbar::-webkit-scrollbar-corner {
          background: #1e1e1e;
        }
      `}</style>
    </div>
  );
}