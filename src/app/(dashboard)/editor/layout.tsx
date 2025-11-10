"use client";

import EditorHeader from "./_component/EditorHeader";
import EditorSidebar from "./_component/EditorSidebar";
import FileOpen from "./_component/FileOpen";
import ConnectionStatus from "./_component/ConnectionStatus";
import ChatPanel from "./_component/ChatPanel";
import PreviewPanel from "./_component/PreviewPanel";
import { EditorProviderComp } from "./_provider/EditorProvider";

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
        
        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* COMPONENT 1: Left Sidebar - File Explorer */}
          <aside className="w-64 bg-[#252526] border-r border-[#2d2d2d] flex-shrink-0">
            <EditorSidebar />
          </aside>

          {/* COMPONENT 2: Code Editor Area */}
          <main className="flex-1 flex flex-col overflow-hidden bg-[#1e1e1e]">
            {/* COMPONENT 3: Tab Bar - shows open file & connection status */}
            <div className="h-10 bg-[#252526] border-b border-[#2d2d2d] flex items-center justify-between px-2">
              {/* Left: File Tab */}
              <div className="flex-1">
                <FileOpen />
              </div>
              
              {/* Right: Internet Speed Indicator */}
              <ConnectionStatus />
            </div>

            {/* Editor + Preview Split View */}
            <div className="flex-1 flex overflow-hidden">
              {/* Editor content */}
              <div className="flex-1 overflow-auto bg-[#1e1e1e]">
                {children}
              </div>

              {/* COMPONENT 5: Preview Panel (50% when open) */}
              <PreviewPanel />
            </div>
          </main>
        </div>

        {/* COMPONENT 4: Floating Chat Panel */}
        <ChatPanel />
      </EditorProviderComp>
    </div>
  );
}