import EditorHeader from "./_component/EditorHeader";
import EditorSidebar from "./_component/EditorSidebar";
import FileOpen from "./_component/FileOpen";
import { EditorProviderComp } from "./_provider/EditorProvider";
import BrowerRunCode from "./_component/BrowerRunCode";
import dynamic from "next/dynamic";

// Dynamically import ResizableSidebar to avoid SSR issues
const ResizableSidebar = dynamic(() => import("@/components/ResizableSidebar"), {
  ssr: false,
  loading: () => <div className="w-[20%] border-r border-border/50 bg-sidebar/95 backdrop-blur-sm"><EditorSidebar /></div>
});

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
            {/* Sidebar - Fixed 20% on desktop, resizable on tablet, hidden on mobile */}
            <div className="hidden lg:flex lg:w-[20%] border-r border-border/50 bg-sidebar/95 backdrop-blur-sm">
              <EditorSidebar />
            </div>

            {/* Resizable Sidebar for Tablet */}
            <div className="hidden md:flex lg:hidden">
              <ResizableSidebar className="border-r border-border/50 bg-sidebar/95 backdrop-blur-sm" />
            </div>

            {/* Main Editor Area - 80% on desktop, remaining space on tablet, 100% on mobile */}
            <main className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
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
