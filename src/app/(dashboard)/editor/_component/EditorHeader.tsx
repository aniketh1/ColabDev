"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import UserAvatar from "@/components/UserAvatar";
import LogoIcon from "@/components/LogoIcon";
import Axios from "@/lib/Axios";
import {
  AppWindow,
  ArrowLeft,
  Database,
  Pencil,
  Play,
  PlayCircle,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import UpdateProject from "./UpdateProject";
import { ShareProject } from "./ShareProject";
import { useEditorContext } from "../_provider/EditorProvider";
import { cn } from "@/lib/utils";
import { RunCodeButton } from "@/components/RunCodeButton";
import { ProjectTemplateSelector } from "@/components/ProjectTemplateSelector";
import { ThemeToggle } from "@/components/ThemeToggle";

const EditorHeader = () => {
  const router = useRouter();
  const { projectId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState({
    name: "",
  });
  const [projectFiles, setProjectFiles] = useState({
    html: "",
    css: "",
    js: "",
  });
  const {
    isLoading: editorUpdateLoading,
    setOpenBrowser,
    openBrowser,
    setProjectAccess,
  } = useEditorContext();

  console.log("params", projectId);

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
        
        // Set project access info for the provider
        if (projectData) {
          console.log('🔍 Project Access Data:', {
            isOwner: projectData.isOwner,
            isCollaborator: projectData.isCollaborator,
            isPublic: projectData.isPublic,
            canEdit: projectData.canEdit,
            userId: projectData.userId,
            collaborators: projectData.collaborators
          });
          
          setProjectAccess({
            isOwner: projectData.isOwner || false,
            isCollaborator: projectData.isCollaborator || false,
            isPublic: projectData.isPublic !== false, // default to true
            canEdit: projectData.canEdit || projectData.isOwner || projectData.isCollaborator || false,
          });
        }
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProjectFiles = async () => {
    try {
      const [htmlRes, cssRes, jsRes] = await Promise.all([
        Axios.post("/api/code", { projectId, fileName: "index.html" }).catch(() => ({ data: { data: { content: "" } } })),
        Axios.post("/api/code", { projectId, fileName: "style.css" }).catch(() => ({ data: { data: { content: "" } } })),
        Axios.post("/api/code", { projectId, fileName: "script.js" }).catch(() => ({ data: { data: { content: "" } } })),
      ]);

      setProjectFiles({
        html: htmlRes.data?.data?.content || "",
        css: cssRes.data?.data?.content || "",
        js: jsRes.data?.data?.content || "",
      });
    } catch (error) {
      console.error("Failed to fetch project files:", error);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchData();
      fetchProjectFiles();
    }
  }, [projectId]);

  console.log("project details", data);

  return (
    <header className="bg-background border-b border-border h-16 sticky top-0 z-50 flex items-center px-6 shadow-sm">
      {/***left side */}
      <div className="flex items-center gap-4 flex-1">
        <Button
          onClick={() => router.push("/dashboard")}
          variant="ghost"
          size="icon"
          className="cursor-pointer h-9 w-9 rounded-lg hover:bg-primary/10 transition-all duration-200 group"
        >
          <ArrowLeft className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform" />
        </Button>

        <LogoIcon w={36} h={36} href="/dashboard" />

        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/30 backdrop-blur-sm border border-border/50">
          <div className="w-1 h-6 bg-gradient-to-b from-primary via-primary/70 to-primary/40 rounded-full" />
          <h2 className="font-semibold text-lg relative">
            {isLoading ? (
              <span className="text-muted-foreground animate-pulse">Loading...</span>
            ) : (
              <div className="flex items-center gap-2 group">
                <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">{data?.name ?? "-"}</span>
                <UpdateProject
                  name={data?.name}
                  projectId={projectId as string}
                  fetchData={fetchData}
                />
              </div>
            )}
          </h2>
        </div>

        <div
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300",
            editorUpdateLoading 
              ? "bg-primary/10 text-primary animate-pulse" 
              : "bg-muted/50 text-muted-foreground"
          )}
        >
          <Database size={16} className={cn(editorUpdateLoading && "animate-spin")} />
          <span className="text-sm font-medium">
            {editorUpdateLoading ? "Saving..." : "Saved"}
          </span>
        </div>
      </div>

      {/***right side */}
      <div className="ml-auto w-fit flex items-center gap-3">
        {/* Project Templates */}
        <ProjectTemplateSelector />
        
        {/* Share Project - Only for owners */}
        {data && (
          <ShareProject
            projectId={projectId as string}
            projectName={data.name || "Project"}
            onCollaboratorAdded={fetchData}
          />
        )}
        
        {/* Run Code Button */}
        <RunCodeButton
          html={projectFiles.html}
          css={projectFiles.css}
          js={projectFiles.js}
          projectId={projectId as string}
        />
        
        <Button
          onClick={() => setOpenBrowser(!openBrowser)}
          variant="ghost"
          size="icon"
          className={cn(
            "h-9 w-9 rounded-lg transition-all duration-300 relative group overflow-hidden",
            openBrowser ? "bg-primary/15 text-primary" : "hover:bg-primary/10"
          )}
        >
          <div className={cn(
            "absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 transition-all duration-300",
            openBrowser && "from-primary/10 via-primary/20 to-primary/10"
          )} />
          <AppWindow className="h-5 w-5 relative z-10" />
        </Button>

        <div className="h-6 w-px bg-border/50" />
        
        {/* Theme Toggle */}
        <ThemeToggle />
        
        <UserAvatar />
      </div>
    </header>
  );
};

export default EditorHeader;
