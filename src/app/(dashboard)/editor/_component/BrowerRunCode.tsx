"use client";
import React, { useEffect, useRef, useState } from "react";
import { useEditorContext } from "../_provider/EditorProvider";
import * as motion from "motion/react-client";
import { Resizable } from "re-resizable";
import { ExternalLink, RotateCw, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useParams, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { WebContainerPreview } from "@/components/WebContainerPreview";
import Axios from "@/lib/Axios";
import { toast } from "sonner";

const BrowerRunCode = ({ children }: { children: React.ReactNode }) => {
  const { openBrowser, setOpenBrowser } = useEditorContext();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [drag, setDrag] = useState<boolean>(false);
  const searchParams = useSearchParams();
  const fileName = searchParams?.get("file") || "";
  const [input, setInput] = useState<string>(`/${fileName}` || "");
  const params = useParams();
  const projectId = params?.projectId as string;
  const [refresh, setRefresh] = useState<boolean>(true);
  const session = useSession();
  
  // State for WebContainer preview
  const [projectData, setProjectData] = useState<{
    techStack: 'react' | 'vue' | 'node' | 'html';
    files: { [key: string]: string };
  } | null>(null);
  const [isLoadingProject, setIsLoadingProject] = useState(false);

  // Fetch project data for WebContainer
  useEffect(() => {
    const fetchProjectData = async () => {
      if (!projectId || !openBrowser) return;
      
      try {
        setIsLoadingProject(true);
        const response = await Axios.get(`/api/project-files/${projectId}`);
        
        if (response.status === 200) {
          const { techStack, files } = response.data.data;
          console.log('📦 Fetched project data:', {
            techStack,
            fileCount: Object.keys(files).length,
            files: Object.keys(files),
          });
          
          setProjectData({
            techStack,
            files,
          });
        }
      } catch (error: any) {
        console.error('Failed to fetch project data:', error);
        toast.error('Failed to load project files');
      } finally {
        setIsLoadingProject(false);
      }
    };

    fetchProjectData();
  }, [projectId, openBrowser]);

  const handleMouseDown = () => {
    setDrag(true);
  };

  const handleMouseUp = () => {
    setDrag(false);
  };

  const handleRefresh = ()=>{
    setRefresh(preve => !preve) // false
    setTimeout(() => {
        setRefresh(preve => !preve) // true
    }, 1000);
  };
  
  // Determine if we should use WebContainer or iframe
  const useWebContainer = projectData && ['react', 'vue', 'node'].includes(projectData.techStack);
  return (
    <div ref={containerRef}>
      {children}

      {openBrowser && (
        <motion.div
          drag={drag}
          dragConstraints={containerRef}
          dragElastic={0.2}
          className="absolute right-2 top-0 z-50"
        >
          <Resizable className="min-h-56 min-w-80 pb-2 shadow-lg overflow-clip rounded-sm z-50 bg-white">
            <div
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              className="bg-primary h-7 flex items-center cursor-grab px-1"
            >
              <span className="text-white text-xs font-medium ml-2">
                {useWebContainer 
                  ? `${projectData?.techStack?.toUpperCase()} Preview` 
                  : 'HTML Preview'
                }
              </span>
              <X
                className="ml-auto cursor-pointer text-white"
                onClick={() => setOpenBrowser(false)}
              />
            </div>
            <div className="relative">
              <Input
                className="h-8 rounded-t-none text-slate-600 pl-9 pr-9"
                placeholder="Enter file name"
                onChange={(e) => setInput(e.target.value)}
                value={input}
              />
              <RotateCw
                size={16}
                className={cn(
                    "absolute top-2 left-2 hover:text-primary cursor-pointer",
                    !refresh && "animate-spin"
                )}
                onClick={handleRefresh}
              />
              <Link
                href={`/browser/${session?.data?.user?.name}/${projectId}/${input}`}
                target="_blank"
              >
                <ExternalLink
                    size={16}
                    className={cn(
                        "absolute top-2 right-2 hover:text-primary cursor-pointer"
                    )}
                />
              </Link>
              
            </div>
            <div className="h-full w-full">
              {isLoadingProject ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading project...</p>
                  </div>
                </div>
              ) : useWebContainer && projectData ? (
                <WebContainerPreview
                  projectId={projectId as string}
                  techStack={projectData.techStack}
                  files={projectData.files}
                />
              ) : refresh && (
                <iframe
                  className="w-full h-full min-h-full min-w-full"
                  src={`${process.env.NEXT_PUBLIC_BASE_URL}/api/file/${projectId}/${input}`}
                />
              )}
            </div>
          </Resizable>
        </motion.div>
      )}
    </div>
  );
};

export default BrowerRunCode;
