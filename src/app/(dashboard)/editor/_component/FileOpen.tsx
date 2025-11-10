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
      <div className="flex items-center h-full px-3 bg-[#161b22]">
        <span className="text-[11px] text-[#6e7681] tracking-wide">No file open</span>
      </div>
    );
  }

  const extension = fileName.split('.').pop() || '';

  return (
    <div className="flex items-center h-full bg-[#161b22] overflow-x-auto">
      <div className="flex items-center gap-2 px-4 h-full bg-gradient-to-b from-[#0d1117] to-[#161b22] border-r border-[#21262d] min-w-fit group hover:bg-[#1f2428] transition-colors relative">
        {/* Active indicator line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#1f6feb] via-[#58a6ff] to-[#1f6feb] shadow-[0_0_8px_rgba(31,111,235,0.6)]" />
        
        <div className="w-4 h-4 flex-shrink-0">
          <Image
            alt={fileName}
            width={16}
            height={16}
            src={getFileIcon(extension) || ""}
            className="object-contain"
          />
        </div>
        
        <p className="text-[13px] font-medium text-[#c9d1d9] max-w-[200px] truncate">
          {fileName}
        </p>
        
        <Button
          size="icon"
          variant="ghost"
          onClick={() => router.push(`/editor/${projectId}`)}
          className="h-5 w-5 cursor-pointer hover:bg-[#30363d] rounded text-[#8b949e] hover:text-[#c9d1d9] transition-all ml-1 opacity-0 group-hover:opacity-100"
        >
          <X className="h-3.5 w-3.5" />
        </Button>

        {/* Modified indicator dot */}
        <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#58a6ff] opacity-0" />
      </div>
    </div>
  );
};

export default FileOpen;