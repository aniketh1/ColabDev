"use client";
import { Button } from "@/components/ui/button";
import { X, FileCode } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React from "react";

const FileOpen = () => {
  const searchParams = useSearchParams();
  const fileName = searchParams.get("file");
  const router = useRouter();
  const { projectId } = useParams();

  return (
    <div className="flex items-center gap-0 bg-sidebar/40 border-b border-border/50 h-10 backdrop-blur-sm">
      {fileName && (
        <div className="flex items-center gap-2 px-4 h-full bg-background/50 border-r border-border/50 hover:bg-background/80 transition-colors">
          <FileCode className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <p className="text-sm font-medium text-foreground">{fileName}</p>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => router.push(`/editor/${projectId}`)}
            className="h-5 w-5 cursor-pointer hover:bg-muted rounded-sm transition-all ml-2"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileOpen;
