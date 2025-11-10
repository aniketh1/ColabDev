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
import { File, FilePlus } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

type TProjectFile = {
  _id? : string;
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
  const router = useRouter()

  const fetchAllFile = async () => {
    setIsLoading(true);
    try {
      const response = await Axios.get(
        `/api/project-file?projectId=${projectId}`
      );

      if (response.status === 200) {
        const files = response.data.data || [];
        setFileList(files);
        
        // If no files exist, create default HTML file
        if (files.length === 0) {
          console.log('No files found, creating default index.html');
          try {
            await Axios.post("/api/project-file", {
              projectId,
              fileName: "index.html",
              content: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>My Project</title>\n</head>\n<body>\n  <h1>Welcome!</h1>\n</body>\n</html>',
            });
            // Refetch after creating
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
  
  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-b border-border/50 flex flex-row items-center py-3 px-4">
        <div className="flex items-center gap-2">
          <div className="h-5 w-1 bg-gradient-to-b from-primary to-primary/50 rounded-full" />
          <p className="font-semibold text-sm uppercase tracking-wide">Files</p>
        </div>
        <div className="ml-auto">
          <Dialog open={openAddFile} onOpenChange={setOpenAddFile}>
            <DialogTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="cursor-pointer h-8 w-8 rounded-lg hover:bg-primary/10 transition-all duration-200 group"
              >
                <FilePlus className="h-4 w-4 group-hover:scale-110 transition-transform" />
              </Button>
            </DialogTrigger>
            <DialogContent className="backdrop-blur-xl bg-background/95 border-border/50">
              <DialogTitle className="flex items-center gap-2">
                <div className="h-6 w-1 bg-gradient-to-b from-primary to-primary/50 rounded-full" />
                Add New File
              </DialogTitle>
              <Input
                disabled={isLoading}
                value={fileName ?? ""}
                placeholder="Enter file name (e.g., index.html)"
                onChange={(e) => setFileName(e.target.value)}
                className="border-border/50 focus:border-primary transition-all"
              />
              <Button 
                disabled={isLoading} 
                onClick={handleCreateFile}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300"
              >
                {isLoading ? "Creating..." : "Create File"}
              </Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-2">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
            <p className="text-muted-foreground text-sm">Loading files...</p>
          </div>
        ) : fileList.length < 1 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 px-4">
            <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center">
              <File className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground text-sm text-center">No files yet</p>
            <p className="text-muted-foreground/70 text-xs text-center">Click the + button to create your first file</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1 px-2">
            {fileList.map((file) => {
              return (
                <button
                  key={file?._id}
                  className="flex items-center gap-3 cursor-pointer h-10 px-3 rounded-lg hover:bg-primary/10 transition-all duration-200 group relative overflow-hidden w-full text-left" 
                  onClick={()=> router.push(`/editor/${projectId}?file=${encodeURIComponent(file.name)}`)}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:via-primary/10 group-hover:to-primary/5 transition-all duration-300" />
                  <div className="w-5 h-5 flex-shrink-0 relative z-10">
                    <Image
                      alt={file.name}
                      width={20}
                      height={20}
                      src={getFileIcon(file.extension) || ""}
                      className="object-contain"
                    />
                  </div>
                  <p className="text-sm truncate relative z-10">{file.name}</p>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default EditorSidebar;
