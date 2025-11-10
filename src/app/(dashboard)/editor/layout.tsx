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
        
        {/* Main Content Area - Empty for now, will add step by step */}
        <div className="flex-1 bg-[#1e1e1e]">
          {/* We'll add components here one by one */}
        </div>
      </EditorProviderComp>
    </div>
  );
}