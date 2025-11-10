"use client";

import EditorHeader from "./_component/EditorHeader";
import EditorSidebar from "./_component/EditorSidebar";
import FileOpen from "./_component/FileOpen";
import { EditorProviderComp } from "./_provider/EditorProvider";
import BrowerRunCode from "./_component/BrowerRunCode";

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#1e1e1e]">
      <EditorProviderComp>
        {/* Header */}
        <div className="h-12 border-b border-[#2d2d2d] bg-[#323233]">
          <EditorHeader />
        </div>
        
        {/* Main Content: Sidebar + Editor */}
        <div className="flex-1 flex overflow-hidden">
          <BrowerRunCode>
            {/* Left Sidebar - File Explorer */}
            <aside className="w-64 border-r border-[#2d2d2d] bg-[#252526] flex-shrink-0 hidden md:block">
              <EditorSidebar />
            </aside>

            {/* Right Side - Editor Area */}
            <main className="flex-1 flex flex-col overflow-hidden bg-[#1e1e1e]">
              {/* Tab Bar */}
              <div className="h-10 bg-[#252526] border-b border-[#2d2d2d]">
                <FileOpen />
              </div>

              {/* Code Editor */}
              <div className="flex-1 overflow-auto bg-[#1e1e1e]">
                {children}
              </div>

              {/* Status Bar */}
              <div className="h-6 bg-[#007acc] flex items-center justify-between px-4 text-white text-xs">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 13A6 6 0 118 2a6 6 0 010 12z"/>
                      <path d="M8 4a.5.5 0 01.5.5v3h3a.5.5 0 010 1h-3.5a.5.5 0 01-.5-.5v-4A.5.5 0 018 4z"/>
                    </svg>
                    main
                  </span>
                  <span>UTF-8</span>
                  <span>LF</span>
                </div>
                <div className="flex items-center gap-4">
                  <span>Ln 1, Col 1</span>
                  <span>Spaces: 2</span>
                </div>
              </div>
            </main>
          </BrowerRunCode>
        </div>
      </EditorProviderComp>
    </div>
  );
}