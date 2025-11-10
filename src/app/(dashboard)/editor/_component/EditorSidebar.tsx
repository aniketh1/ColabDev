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
import { File, FilePlus, FolderOpen } from "lucide-react";
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
    // Get active file from URL
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setActiveFile(params.get('file') || "");
    }
  }, []);
  
  return (
    <div className="h-full w-full flex flex-col bg-[#1e1e1e] text-[#cccccc]">
      {/* Header */}
      <div className="flex-shrink-0 h-[35px] flex items-center justify-between px-3 border-b border-[#2d2d2d] bg-[#252526]">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-semibold text-[#cccccc]">
          <FolderOpen className="h-3.5 w-3.5" />
          <span>Explorer</span>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setOpenAddFile(true)}
          className="h-6 w-6 hover:bg-[#2a2d2e] text-[#cccccc] hover:text-white"
        >
          <FilePlus className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="h-6 w-6 rounded-full border-2 border-[#007acc]/30 border-t-[#007acc] animate-spin" />
            <p className="text-[#858585] text-xs">Loading files...</p>
          </div>
        ) : fileList.length < 1 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 px-4">
            <File className="h-12 w-12 text-[#505050]" />
            <p className="text-[#858585] text-xs text-center">No files in workspace</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpenAddFile(true)}
              className="mt-2 text-[#007acc] hover:text-[#4daafc] hover:bg-[#2a2d2e] text-xs h-7"
            >
              Create a file
            </Button>
          </div>
        ) : (
          <div className="py-1">
            {/* Project Section Header */}
            <div className="px-3 py-1.5 text-[11px] font-semibold text-[#cccccc] uppercase tracking-wide">
              Files
            </div>
            
            {/* File Items */}
            {fileList.map((file) => {
              const isActive = activeFile === file.name;
              return (
                <button
                  key={file?._id}
                  className={`
                    w-full flex items-center gap-2 px-3 py-1 text-left
                    transition-colors duration-100
                    ${isActive 
                      ? 'bg-[#37373d] text-white' 
                      : 'text-[#cccccc] hover:bg-[#2a2d2e]'
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
                      className="object-contain"
                    />
                  </div>
                  <span className="text-[13px] truncate flex-1">{file.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Add File Dialog */}
      <Dialog open={openAddFile} onOpenChange={setOpenAddFile}>
        <DialogContent className="bg-[#252526] border-[#3c3c3c] text-[#cccccc]">
          <DialogTitle className="text-[#cccccc] text-sm font-semibold">
            Create New File
          </DialogTitle>
          <div className="space-y-4">
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
              className="bg-[#3c3c3c] border-[#3c3c3c] text-[#cccccc] placeholder:text-[#858585] focus:border-[#007acc] text-sm h-9"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <Button 
                variant="ghost"
                onClick={() => {
                  setOpenAddFile(false);
                  setFileName("");
                }}
                className="bg-[#3c3c3c] hover:bg-[#505050] text-[#cccccc] text-xs h-8"
              >
                Cancel
              </Button>
              <Button 
                disabled={isLoading || !fileName} 
                onClick={handleCreateFile}
                className="bg-[#0e639c] hover:bg-[#1177bb] text-white text-xs h-8"
              >
                {isLoading ? "Creating..." : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1e1e1e;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #424242;
          border-radius: 0;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #4e4e4e;
        }
      `}</style>
    </div>
  );
};

export default EditorSidebar;