"use client";
import Image from "next/image";
import { useParams, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useState, useRef } from "react";
import { basicSetup, EditorView } from "codemirror";
import { EditorState } from "@codemirror/state";
import { html } from "@codemirror/lang-html";
import { javascript, javascriptLanguage } from "@codemirror/lang-javascript";
import { css, cssLanguage } from "@codemirror/lang-css";
import { toast } from "sonner";
import Axios from "@/lib/Axios";
import { useEditorContext } from "../_provider/EditorProvider";
import debounce from "@/lib/debounce";
import { LiveblocksProvider } from "@/components/LiveblocksProvider";
import { useLiveblocksCollaboration } from "@/hooks/useLiveblocksCollaboration";
import { useLiveblocksCollaborationReal } from "@/hooks/useLiveblocksCollaborationReal";
import { useIsLiveblocksAvailable } from "@/contexts/LiveblocksAvailabilityContext";
import { cn } from "@/lib/utils";

const CodeEditor = () => {
  const searchParams = useSearchParams();
  const file = searchParams.get("file");
  const [element, setElement] = useState<HTMLElement | null>(null);
  const { projectId } = useParams();
  const [content, setContent] = useState<string>();
  const [fileId, setFileId] = useState<string>();
  const { isLoading, setIsLoading, setCode } = useEditorContext();
  const editorViewRef = useRef<EditorView | null>(null);
  const isRemoteUpdateRef = useRef(false);
  const { isAvailable } = useIsLiveblocksAvailable();

  // Choose the right collaboration hook based on availability
  const collaborationOptions = {
    fileName: file || '',
    onContentUpdate: (newContent: string, userId: string) => {
      if (editorViewRef.current && !isRemoteUpdateRef.current) {
        isRemoteUpdateRef.current = true;
        const transaction = editorViewRef.current.state.update({
          changes: {
            from: 0,
            to: editorViewRef.current.state.doc.length,
            insert: newContent,
          },
        });
        editorViewRef.current.dispatch(transaction);
        setContent(newContent);
        toast.info('Editor updated by collaborator', { duration: 2000 });
        setTimeout(() => {
          isRemoteUpdateRef.current = false;
        }, 100);
      }
    },
    onUserJoined: (userId: string, userInfo: any) => {
      toast.success(`${userInfo?.name || 'A collaborator'} joined`, { duration: 2000 });
    },
    onUserLeft: (userId: string) => {
      toast.info('A collaborator left', { duration: 2000 });
    },
  };

  // Use real Liveblocks hook when available, fallback otherwise
  const { isConnected, broadcastChange, notifyFileSaved } = isAvailable
    ? useLiveblocksCollaborationReal(collaborationOptions)
    : useLiveblocksCollaboration(collaborationOptions);

  const ref = useCallback((node: HTMLElement | null) => {
    if (!node) return;
    setElement(node);
  }, []);

  const fetchData = async () => {
    const payload = {
      projectId: projectId,
      fileName: file,
    };
    try {
      setIsLoading(true);
      console.log('Fetching file:', file, 'for project:', projectId);
      const response = await Axios.post("/api/code", payload);

      if (response.status === 200) {
        const fileContent = response?.data?.data?.content;
        console.log('File content received, length:', fileContent?.length);
        setContent(fileContent || '');
        setFileId(response?.data?.data?._id);
        // Sync with EditorProvider for preview
        setCode(fileContent || '');
      }
    } catch (error: any) {
      console.error('Error fetching file:', error);
      const errorMessage = error?.response?.data?.error || error?.message || 'Failed to load file';
      toast.error(errorMessage);
      // Set empty content on error so editor doesn't break
      setContent('');
      setCode('');
    } finally {
      setIsLoading(false);
    }
  };

  const updateData = async (fileContent: string) => {
    const payload = {
      fileId: fileId,
      content: fileContent,
    };
    try {
      setIsLoading(true);
      const response = await Axios.put("/api/code", payload);

      if (response.status === 200) {
        // Notify other collaborators that file was saved
        notifyFileSaved();
        toast.success('Changes saved', { duration: 1500 });
      }
    } catch (error: any) {
      toast.error(error.response.data.error);
    } finally {
      setIsLoading(false);
    }
  };

  const extensionArray = file?.split(".") || [];
  const extension = extensionArray[extensionArray?.length - 1];

  console.log("extension", extension);

  useEffect(() => {
    if (file && projectId) {
      fetchData();
    }
  }, [file, projectId]);

  
  const updateDataDebounce = debounce((doc : string)=>{
    updateData(doc);
  },2000)

  useEffect(() => {
    if (!element) return;

    const state = EditorState.create({
      doc: content,
      extensions: [
        basicSetup,
        //html, css , javascript
        EditorView.updateListener.of((update) => {
          if (update.docChanged && !isRemoteUpdateRef.current) {
            const newContent = update.state.doc.toString();
            
            // Update code in EditorProvider for preview
            setCode(newContent);
            
            // Broadcast changes to other collaborators
            broadcastChange(newContent);
            
            // Auto-save to database after 2 seconds
            updateDataDebounce(newContent);
          }
        }),
        extension === "js"
          ? javascript()
          : extension === "css"
            ? css()
            : html({
              autoCloseTags : true,
              selfClosingTags  : true,
              nestedLanguages : [
                { 
                  tag : "style",
                  parser : cssLanguage.parser
                },
                { 
                  tag : "script",
                  parser : javascriptLanguage.parser
                }
              ]
            }),
      ],
    });

    const view = new EditorView({
      state: state,
      parent: element,
    });

    editorViewRef.current = view;

    return () => {
      view.destroy();
      editorViewRef.current = null;
    };
  }, [file, element, content]);

  return (
    <div className="h-full w-full p-3">
      {isLoading ? (
        <div className="h-full flex items-center justify-center flex-col bg-gradient-to-br from-card via-card to-muted/30 rounded-xl p-8 border border-border/50 backdrop-blur-sm">
          <div className="h-12 w-12 rounded-full border-3 border-primary/30 border-t-primary animate-spin mb-4" />
          <p className="text-sm text-muted-foreground">Loading file content...</p>
        </div>
      ) : !file ? (
        <div className="h-full flex items-center justify-center flex-col bg-gradient-to-br from-card via-card to-muted/30 rounded-xl p-8 border border-border/50 backdrop-blur-sm">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-full blur-3xl" />
            <Image
              src={"/editor file.svg"}
              width={280}
              height={280}
              alt="editor"
              className="relative z-10"
            />
          </div>
          <p className="text-muted-foreground text-lg mt-4">No file is open</p>
          <p className="text-muted-foreground/70 text-sm mt-2">Select a file from the sidebar to start editing</p>
        </div>
      ) : (
        <div className="relative h-full rounded-xl overflow-hidden border border-border/50 shadow-2xl bg-card">
          {/* Collaboration Status Indicator */}
          <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
            <div className={cn(
              "flex items-center gap-2 backdrop-blur-xl px-4 py-2 rounded-xl shadow-lg border transition-all duration-300",
              isConnected 
                ? "bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30" 
                : "bg-card/95 border-border/50"
            )}>
              <div className={cn(
                "w-2.5 h-2.5 rounded-full transition-all duration-300",
                isConnected ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse" : "bg-muted-foreground/50"
              )}></div>
              <span className="text-xs font-semibold tracking-wide">
                {isConnected ? 'LIVE' : 'OFFLINE'}
              </span>
            </div>
            {isLoading && (
              <div className="flex items-center gap-2 bg-gradient-to-r from-primary/10 to-blue-500/10 backdrop-blur-xl px-4 py-2 rounded-xl shadow-lg border border-primary/30">
                <svg className="animate-spin h-3.5 w-3.5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-xs font-semibold text-primary tracking-wide">SAVING...</span>
              </div>
            )}
          </div>
          
          <div
            className="relative h-full w-full overflow-auto bg-gradient-to-br from-background via-background to-muted/10"
            ref={ref}
          ></div>
        </div>
      )}
    </div>
  );
};

// Wrap the editor with Liveblocks provider
export default function EditorPage() {
  const { projectId } = useParams();
  
  return (
    <LiveblocksProvider roomId={`project-${projectId}`}>
      <CodeEditor />
    </LiveblocksProvider>
  );
}
