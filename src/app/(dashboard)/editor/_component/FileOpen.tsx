"use client";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React from "react";
import Image from "next/image";
import { getFileIcon } from "@/lib/getFileIcon";

const FileOpen = () => {
  const searchParams = useSearchParams();
  const fileName = searchParams.get("file");
  const router = useRouter();
  const { projectId } = useParams();

  if (!fileName) {
    return (
      <div className="flex items-center h-full px-4 bg-[#252526]">
        <span className="text-[12px] text-[#6e7681] tracking-wide font-medium">No file open</span>
      </div>
    );
  }

  const extension = fileName.split('.').pop() || '';

  return (
    <div className="flex items-center h-full bg-[#252526] overflow-x-auto">
      <div className="flex items-center gap-3 px-5 h-full bg-[#1e1e1e] border-r border-[#2d2d2d] min-w-fit group hover:bg-[#2a2d2e] transition-colors relative">
        {/* Active indicator line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#007acc] shadow-[0_0_8px_rgba(0,122,204,0.6)]" />
        
        <div className="w-5 h-5 flex-shrink-0">
          <Image
            alt={fileName}
            width={18}
            height={18}
            src={getFileIcon(extension) || ""}
            className="object-contain"
          />
        </div>
        
        <p className="text-[14px] font-medium text-[#cccccc] max-w-[200px] truncate">
          {fileName}
        </p>
        
        <Button
          size="icon"
          variant="ghost"
          onClick={() => router.push(`/editor/${projectId}`)}
          className="h-6 w-6 cursor-pointer hover:bg-[#3c3c3c] rounded text-[#999999] hover:text-[#cccccc] transition-all ml-2 opacity-0 group-hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Modified indicator dot */}
        <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#007acc] opacity-0" />
      </div>
    </div>
  );
};

export default FileOpen;