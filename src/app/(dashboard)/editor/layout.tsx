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
            {/* Sidebar - 20% on desktop, collapsible on mobile */}
            <aside className="hidden lg:flex lg:w-[20%] lg:min-w-[20%] lg:max-w-[20%] border-r border-border/50 bg-sidebar/95 backdrop-blur-sm">
              <EditorSidebar />
            </aside>

            {/* Main Editor Area - 80% on desktop, 100% on mobile */}
            <main className="flex-1 lg:w-[80%] w-full flex flex-col overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
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
