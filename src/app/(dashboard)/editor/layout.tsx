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
        
        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* COMPONENT 1: Left Sidebar - File Explorer */}
          <aside className="w-64 bg-[#252526] border-r border-[#2d2d2d] flex-shrink-0">
            <EditorSidebar />
          </aside>

          {/* Rest of content will go here */}
          <div className="flex-1 bg-[#1e1e1e]">
            {/* Editor will be added next */}
          </div>
        </div>
      </EditorProviderComp>
    </div>
  );
}