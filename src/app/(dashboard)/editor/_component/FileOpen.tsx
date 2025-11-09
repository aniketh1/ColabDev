"use client";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { X, FileCode } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React from "react";

const FileOpen = () => {
  const searchParams = useSearchParams();
  const fileName = searchParams.get("file");
  const router = useRouter();
  const { projectId } = useParams();

  return (
    <div className="flex items-center gap-2 bg-gradient-to-r from-muted/80 via-muted/60 to-transparent border-b border-border/50 h-12 backdrop-blur-xl sticky top-0 z-40 px-3">
      <SidebarTrigger className="h-8 w-8 rounded-lg hover:bg-primary/10 transition-all duration-200" />
      
      {fileName && (
        <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-border/50 shadow-sm hover:shadow-md transition-all duration-200 group">
          <FileCode className="h-4 w-4 text-primary" />
          <p className="max-w-xs text-sm font-medium truncate">{fileName}</p>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => router.push(`/editor/${projectId}`)}
            className="h-6 w-6 cursor-pointer hover:bg-destructive/10 hover:text-destructive rounded-md transition-all duration-200 ml-1"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileOpen;
