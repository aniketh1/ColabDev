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
    <div className="h-screen flex flex-col overflow-hidden bg-[#1e1e1e] antialiased">
      <EditorProviderComp>
        {/* Header - VS Code style */}
        <div className="flex-shrink-0 h-[48px] border-b border-[#2d2d2d] bg-[#323233]">
          <EditorHeader />
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          <BrowerRunCode>
            {/* Activity Bar - Ultra thin left strip (48px) */}
            <div className="hidden md:flex w-[48px] bg-[#333333] border-r border-[#2d2d2d] flex-col items-center py-2 gap-3 flex-shrink-0">
              <div className="w-12 h-12 flex items-center justify-center cursor-pointer hover:bg-[#2a2d2e] transition-colors relative group">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.5 3h-15A1.5 1.5 0 003 4.5v15A1.5 1.5 0 004.5 21h15a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0019.5 3zM6 6h3v3H6V6zm0 4.5h3v3H6v-3zM6 15h3v3H6v-3zm4.5-9h3v3h-3V6zm0 4.5h3v3h-3v-3zm0 4.5h3v3h-3v-3zm4.5-9h3v3h-3V6zm0 4.5h3v3h-3v-3zm0 4.5h3v3h-3v-3z"/>
                </svg>
                <div className="absolute left-0 w-0.5 h-8 bg-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Sidebar - Explorer panel */}
            <div className="hidden md:flex w-[280px] lg:w-[300px] border-r border-[#2d2d2d] bg-[#252526] flex-shrink-0">
              <EditorSidebar />
            </div>

            {/* Main Editor Area */}
            <main className="flex-1 flex flex-col overflow-hidden bg-[#1e1e1e] min-w-0">
              {/* Tab Bar */}
              <div className="flex-shrink-0 h-[35px] bg-[#252526] border-b border-[#2d2d2d]">
                <FileOpen />
              </div>

              {/* Editor Content */}
              <div className="flex-1 overflow-auto bg-[#1e1e1e] custom-scrollbar">
                {children}
              </div>

              {/* Status Bar */}
              <div className="flex-shrink-0 h-[22px] bg-[#007acc] flex items-center justify-between px-3 text-white text-xs">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 16 16">
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