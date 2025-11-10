"use client";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/UserAvatar";
import LogoIcon from "@/components/LogoIcon";
import Axios from "@/lib/Axios";
import { AppWindow, ArrowLeft, Database, Zap } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import UpdateProject from "./UpdateProject";
import { ShareProject } from "./ShareProject";
import { useEditorContext } from "../_provider/EditorProvider";
import { cn } from "@/lib/utils";
import { ProjectTemplateSelector } from "@/components/ProjectTemplateSelector";
import { ThemeToggle } from "@/components/ThemeToggle";

const EditorHeader = () => {
  const router = useRouter();
  const { projectId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const {
    isLoading: editorUpdateLoading,
    setOpenBrowser,
    openBrowser,
    setProjectAccess,
  } = useEditorContext();

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await Axios({
        url: "/api/project",
        params: {
          projectId: projectId,
        },
      });

      if (response.status === 200) {
        const projectData = response?.data?.data?.[0];
        setData(projectData);
        
        if (projectData) {
          const accessData = {
            isOwner: projectData.isOwner === true,
            isCollaborator: projectData.isCollaborator === true,
            isPublic: projectData.isPublic !== false,
            canEdit: projectData.isOwner === true || projectData.isCollaborator === true,
          };

          setProjectAccess(accessData);
        }
      }
    } catch (error: any) {
      console.error('Failed to fetch project data:', error);
      toast.error(error?.response?.data?.error || 'Failed to load project');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchData();
    }
  }, [projectId]);

  return (
    <header className="bg-gradient-to-r from-[#161b22] via-[#161b22] to-[#0d1117] border-b border-[#21262d] h-full flex items-center px-4 shadow-xl">
      {/* Left side */}
      <div className="flex items-center gap-3 flex-1">
        <Button
          onClick={() => router.push("/dashboard")}
          variant="ghost"
          size="icon"
          className="cursor-pointer h-9 w-9 rounded-lg hover:bg-[#1f6feb]/10 transition-all duration-200 group text-[#8b949e] hover:text-[#58a6ff]"
        >
          <ArrowLeft className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform" />
        </Button>

        <div className="h-6 w-px bg-[#21262d]" />

        <LogoIcon w={32} h={32} href="/dashboard" />

        <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-[#0d1117] backdrop-blur-sm border border-[#21262d] shadow-lg hover:border-[#30363d] transition-colors">
          <div className="w-1 h-6 bg-gradient-to-b from-[#1f6feb] via-[#58a6ff] to-[#79c0ff] rounded-full shadow-[0_0_8px_rgba(31,111,235,0.4)]" />
          <h2 className="font-bold text-base">
            {isLoading ? (
              <span className="text-[#6e7681] animate-pulse">Loading...</span>
            ) : (
              <div className="flex items-center gap-2 group">
                <span className="text-[#c9d1d9]">{data?.name ?? "-"}</span>
                {data && (
                  <UpdateProject
                    name={data?.name}
                    projectId={projectId as string}
                    fetchData={fetchData}
                  />
                )}
              </div>
            )}
          </h2>
        </div>

        <div
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300 border",
            editorUpdateLoading 
              ? "bg-[#1f6feb]/10 text-[#58a6ff] border-[#1f6feb]/30 animate-pulse shadow-[0_0_12px_rgba(31,111,235,0.3)]" 
              : "bg-[#0d1117] text-[#8b949e] border-[#21262d]"
          )}
        >
          <Database size={15} className={cn(editorUpdateLoading && "animate-spin")} />
          <span className="text-xs font-bold tracking-wide">
            {editorUpdateLoading ? "SAVING" : "SAVED"}
          </span>
        </div>
      </div>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-2">
        <ProjectTemplateSelector />
        
        {data && data.isOwner && (
          <ShareProject
            projectId={projectId as string}
            projectName={data.name || "Project"}
            onCollaboratorAdded={fetchData}
          />
        )}
        
        <Button
          onClick={() => setOpenBrowser(!openBrowser)}
          variant="ghost"
          size="icon"
          className={cn(
            "h-9 w-9 rounded-lg transition-all duration-300 relative group overflow-hidden",
            openBrowser 
              ? "bg-[#1f6feb]/20 text-[#58a6ff] shadow-[0_0_12px_rgba(31,111,235,0.3)]" 
              : "text-[#8b949e] hover:bg-[#1f6feb]/10 hover:text-[#58a6ff]"
          )}
        >
          <div className={cn(
            "absolute inset-0 bg-gradient-to-br transition-opacity duration-300",
            openBrowser ? "from-[#1f6feb]/10 via-[#1f6feb]/20 to-[#1f6feb]/10 opacity-100" : "opacity-0"
          )} />
          <AppWindow className="h-5 w-5 relative z-10" />
          {openBrowser && (
            <Zap className="h-3 w-3 absolute -top-0.5 -right-0.5 text-[#58a6ff] animate-pulse" />
          )}
        </Button>

        <div className="h-6 w-px bg-[#21262d]" />
        
        <ThemeToggle />
        
        <UserAvatar />
      </div>
    </header>
  );
};

export default EditorHeader;