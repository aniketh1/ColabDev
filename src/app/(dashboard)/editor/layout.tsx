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
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <EditorProviderComp>
        {/* Fixed Header */}
        <EditorHeader />
        
        {/* Main Content Area - Flex layout without overlay */}
        <div className="flex-1 flex overflow-hidden">
          <BrowerRunCode>
            {/* Sidebar - VS Code style: 250-300px width on desktop, hidden on mobile */}
            <div className="hidden md:flex md:w-[280px] lg:w-[300px] xl:w-[320px] border-r border-border/50 bg-sidebar backdrop-blur-sm flex-shrink-0">
              <EditorSidebar />
            </div>

            {/* Main Editor Area - Takes remaining space */}
            <main className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-background via-background to-muted/20 min-w-0">
              <FileOpen />
              <div className="flex-1 overflow-auto">
                {children}
              </div>
            </main>
          </BrowerRunCode>
        </div>
      </EditorProviderComp>
    </div>
  );
}
