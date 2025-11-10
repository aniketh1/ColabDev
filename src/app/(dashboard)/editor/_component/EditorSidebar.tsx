"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Axios from "@/lib/Axios";
import { getFileIcon } from "@/lib/getFileIcon";
import { File, FilePlus, FolderOpen, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

type TProjectFile = {
  _id?: string;
  name: string;
  extension: string;
  projectId: string;
};

const EditorSidebar = () => {
  const [fileName, setFileName] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const { projectId } = useParams();
  const [openAddFile, setOpenAddFile] = useState(false);
  const [fileList, setFileList] = useState<TProjectFile[]>([]);
  const [activeFile, setActiveFile] = useState<string>("");
  const router = useRouter();

  const fetchAllFile = async () => {
    setIsLoading(true);
    try {
      const response = await Axios.get(
        `/api/project-file?projectId=${projectId}`
      );

      if (response.status === 200) {
        const files = response.data.data || [];
        setFileList(files);
        
        if (files.length === 0) {
          try {
            await Axios.post("/api/project-file", {
              projectId,
              fileName: "index.html",
              content: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>My Project</title>\n</head>\n<body>\n  <h1>Welcome!</h1>\n</body>\n</html>',
            });
            fetchAllFile();
          } catch (err) {
            console.error('Failed to create default file:', err);
          }
        }
      }
    } catch (error: any) {
      toast.error(error.response.data.error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFile = async () => {
    const payload = {
      name: fileName,
      projectId: projectId,
    };
    setIsLoading(true);
    try {
      const response = await Axios.post("/api/project-file", payload);

      if (response.status === 201) {
        toast.success(response.data.message);
        setOpenAddFile(false);
        setFileName("");
        fetchAllFile();
      }
    } catch (error: any) {
      toast.error(error.response.data.error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllFile();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setActiveFile(params.get('file') || "");
    }
  }, []);
  
  return (
    <div className="h-full w-full flex flex-col bg-[#252526] text-white">
      {/* Header */}
      <div className="flex-shrink-0 h-[36px] flex items-center justify-between px-3 border-b border-[#2d2d2d] bg-[#323233]">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.05em] font-bold text-[#cccccc]">
          <FolderOpen className="h-3.5 w-3.5 text-[#007acc]" />
          <span>Explorer</span>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setOpenAddFile(true)}
          className="h-7 w-7 hover:bg-[#2a2d2e] text-[#cccccc] hover:text-[#007acc] transition-all duration-200 rounded-md"
        >
          <FilePlus className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden premium-scrollbar">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="relative">
              <div className="h-8 w-8 rounded-full border-2 border-[#007acc]/20 border-t-[#007acc] animate-spin" />
              <div className="absolute inset-0 h-8 w-8 rounded-full border-2 border-[#007acc]/10 animate-ping" />
            </div>
            <p className="text-[#cccccc] text-xs font-medium">Loading files...</p>
          </div>
        ) : fileList.length < 1 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 px-4">
            <div className="relative">
              <div className="absolute inset-0 bg-[#007acc]/5 blur-2xl rounded-full" />
              <File className="h-14 w-14 text-[#666666] relative" />
            </div>
            <div className="text-center">
              <p className="text-[#cccccc] text-sm font-medium mb-1">No files in workspace</p>
              <p className="text-[#999999] text-xs">Start by creating your first file</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpenAddFile(true)}
              className="mt-2 text-[#007acc] hover:text-[#4da6ff] hover:bg-[#007acc]/10 text-xs h-8 px-4 rounded-md font-semibold"
            >
              <FilePlus className="h-3.5 w-3.5 mr-2" />
              New File
            </Button>
          </div>
        ) : (
          <div className="py-2">
            {/* Section Header */}
            <button className="w-full flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-[#cccccc] uppercase tracking-wide hover:bg-[#2a2d2e] transition-colors">
              <ChevronRight className="h-3 w-3" />
              <span>Project Files</span>
              <span className="ml-auto text-[#999999] text-[10px] font-normal">{fileList.length}</span>
            </button>
            
            {/* File Items */}
            <div className="px-2 mt-1 space-y-0.5">
              {fileList.map((file) => {
                const isActive = activeFile === file.name;
                return (
                  <button
                    key={file?._id}
                    className={`
                      w-full flex items-center gap-2.5 px-2 py-1.5 text-left rounded-md
                      transition-all duration-150 group
                      ${isActive
                        ? 'bg-[#007acc]/20 text-[#007acc] shadow-sm border border-[#007acc]/30'
                        : 'text-[#cccccc] hover:bg-[#2a2d2e] hover:text-[#007acc]'
                      }
                    `}
                    onClick={() => {
                      setActiveFile(file.name);
                      router.push(`/editor/${projectId}?file=${encodeURIComponent(file.name)}`);
                    }}
                  >
                    <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
                      <Image
                        alt={file.name}
                        width={16}
                        height={16}
                        src={getFileIcon(file.extension) || ""}
                        className="object-contain opacity-90 group-hover:opacity-100"
                      />
                    </div>
                    <span className="text-[13px] truncate flex-1 font-medium">{file.name}</span>
                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-[#007acc] shadow-[0_0_6px_rgba(0,122,204,0.6)]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Add File Dialog */}
      <Dialog open={openAddFile} onOpenChange={setOpenAddFile}>
        <DialogContent className="bg-[#252526] border-[#2d2d2d] text-white shadow-2xl">
          <DialogTitle className="text-white text-base font-bold">
            Create New File
          </DialogTitle>
          <div className="space-y-5 mt-2">
            <Input
              disabled={isLoading}
              value={fileName ?? ""}
              placeholder="filename.ext"
              onChange={(e) => setFileName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && fileName) {
                  handleCreateFile();
                }
              }}
              className="bg-[#3c3c3c] border-[#2d2d2d] text-white placeholder:text-[#cccccc] focus:border-[#007acc] focus:ring-1 focus:ring-[#007acc] text-sm h-10 rounded-md"
              autoFocus
            />
            <div className="flex gap-3 justify-end pt-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setOpenAddFile(false);
                  setFileName("");
                }}
                className="bg-[#2a2d2e] hover:bg-[#3c3c3c] text-[#cccccc] text-sm h-9 px-5 rounded-md font-medium"
              >
                Cancel
              </Button>
              <Button
                disabled={isLoading || !fileName}
                onClick={handleCreateFile}
                className="bg-[#007acc] hover:bg-[#005999] text-white text-sm h-9 px-5 rounded-md font-semibold shadow-lg shadow-[#007acc]/20 disabled:opacity-50"
              >
                {isLoading ? "Creating..." : "Create File"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        .premium-scrollbar::-webkit-scrollbar {
          width: 12px;
        }
        .premium-scrollbar::-webkit-scrollbar-track {
          background: #252526;
          border-left: 1px solid #2d2d2d;
        }
        .premium-scrollbar::-webkit-scrollbar-thumb {
          background: #3c3c3c;
          border-radius: 6px;
          border: 3px solid #252526;
        }
        .premium-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #4e4e4e;
        }
      `}</style>
    </div>
  );
};

export default EditorSidebar;