"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import UserAvatar from "@/components/UserAvatar";
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
import { useEditorContext } from "../_provider/EditorProvider";
import { cn } from "@/lib/utils";
import { RunCodeButton } from "@/components/RunCodeButton";
import { ProjectTemplateSelector } from "@/components/ProjectTemplateSelector";

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
        setData(response?.data?.data?.[0]);
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
    <header className="bg-white h-14 sticky top-0 z-40 flex items-center px-4">
      {/***left side */}
      <div className="flex items-center max-w-sm gap-4">
        <Button
          onClick={() => router.push("/dashboard")}
          className="cursor-pointer"
        >
          <ArrowLeft />
        </Button>

        <h2 className="font-semibold relative">
          {isLoading ? (
            <span className="text-slate-400">Loading...</span>
          ) : (
            <div className="flex items-center gap-1 group">
              <span>{data?.name ?? "-"}</span>

              <UpdateProject
                name={data?.name}
                projectId={projectId as string}
                fetchData={fetchData}
              />
            </div>
          )}
        </h2>

        <div
          className={cn(
            "flex items-center gap-1 opacity-100",
            editorUpdateLoading && "animate-pulse opacity-30"
          )}
        >
          <Database size={16} />
          {editorUpdateLoading ? "Saving..." : "Save"}
        </div>
      </div>

      {/***right side */}
      <div className="ml-auto w-fit flex items-center gap-4">
        {/* Project Templates */}
        <ProjectTemplateSelector />
        
        {/* Run Code Button */}
        <RunCodeButton
          html={projectFiles.html}
          css={projectFiles.css}
          js={projectFiles.js}
          projectId={projectId as string}
        />
        
        <div
          onClick={() => setOpenBrowser(!openBrowser)}
          className={cn(
            "p-1 cursor-pointer rounded-full  drop-shadow-2xl ",
            openBrowser && "text-primary"
          )}
        >
          <AppWindow />
        </div>
        <UserAvatar />
      </div>
    </header>
  );
};

export default EditorHeader;
