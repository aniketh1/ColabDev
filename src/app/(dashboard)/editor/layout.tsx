import { SidebarProvider } from "@/components/ui/sidebar";
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
        
        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          <BrowerRunCode>
            <SidebarProvider>
              {/* Fixed Sidebar - No Overlay */}
              <EditorSidebar />

              {/* Main Editor Area */}
              <main className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
                <FileOpen />
                <div className="flex-1 overflow-auto">
                  {children}
                </div>
              </main>
            </SidebarProvider>
          </BrowerRunCode>
        </div>
      </EditorProviderComp>
    </div>
  );
}
