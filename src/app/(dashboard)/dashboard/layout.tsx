import { SidebarProvider } from "@/components/ui/sidebar";
import React from "react";
import DashboardSidebar from "./_component/DashboardSidebar";
import DashboardHeader from "./_component/DashboardHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        {/**sidebar left side */}
        <DashboardSidebar />

        {/**right side - takes remaining space */}
        <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
          <DashboardHeader />
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
