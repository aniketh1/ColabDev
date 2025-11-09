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
import { cn } from "@/lib/utils";

const CodeEditor = () => {
  const searchParams = useSearchParams();
  const file = searchParams?.get("file") || "";
  const [element, setElement] = useState<HTMLElement | null>(null);
  const params = useParams();
  const projectId = params?.projectId as string;
  const [content, setContent] = useState<string>("");
  const [fileId, setFileId] = useState<string>();
  const { isLoading, setIsLoading, setCode, projectAccess } = useEditorContext();
  const editorViewRef = useRef<EditorView | null>(null);
  const isRemoteUpdateRef = useRef(false);
  const lastSyncedContentRef = useRef<string>("");
  const isFetchingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Use refs to always have latest values in callbacks
  const projectAccessRef = useRef(projectAccess);
  const fileIdRef = useRef(fileId);
  const fileRef = useRef(file);
  
  // Keep refs updated
  useEffect(() => {
    projectAccessRef.current = projectAccess;
    console.log('📝 projectAccess updated in ref:', projectAccess);
  }, [projectAccess]);
  
  useEffect(() => {
    fileIdRef.current = fileId;
    console.log('📝 fileId updated in ref:', fileId);
  }, [fileId]);
  
  useEffect(() => {
    fileRef.current = file;
    console.log('📝 file updated in ref:', file);
  }, [file]);

  const ref = useCallback((node: HTMLElement | null) => {
    if (!node) return;
    setElement(node);
  }, []);

  const fetchData = useCallback(async () => {
    if (!file || !projectId) return;
    
    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    const payload = {
      projectId: projectId,
      fileName: file,
    };
    
    console.log('📥 Fetching file:', file, 'for project:', projectId);
    
    try {
      setIsLoading(true);
      const response = await Axios.post("/api/code", payload, {
        timeout: 10000,
        signal: abortControllerRef.current.signal
      });

      if (response.status === 200) {
        const fileContent = response?.data?.data?.content || '';
        const newFileId = response?.data?.data?._id;
        
        console.log('✅ File content received:', {
          file,
          contentLength: fileContent.length,
          fileId: newFileId
        });
        
        setContent(fileContent);
        setFileId(newFileId);
        lastSyncedContentRef.current = fileContent;
        
        // Sync with EditorProvider for preview
        setCode(fileContent);
      }
    } catch (error: any) {
      // Don't show error for aborted requests (normal when switching files)
      if (error.code === 'ERR_CANCELED' || error.name === 'CanceledError') {
        console.log('⏭️ Request cancelled (normal - switching files)');
        return;
      }
      
      console.error('❌ Error fetching file:', {
        file,
        projectId,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        error: error?.response?.data?.error,
        message: error?.message,
        code: error?.code
      });
      
      const errorMessage = error?.response?.data?.error || error?.message || 'Failed to load file';
      toast.error(errorMessage);
      
      // Set empty content on error
      setContent('');
      setCode('');
      setFileId(undefined);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [file, projectId, setIsLoading, setCode]);

  // Direct save function that ALWAYS reads from refs
  const saveToServer = async (fileContent: string) => {
    const currentAccess = projectAccessRef.current;
    const currentFileId = fileIdRef.current;
    const currentFile = fileRef.current;
    
    console.log('💾 saveToServer called with current state:', {
      canEdit: currentAccess.canEdit,
      isOwner: currentAccess.isOwner,
      isCollaborator: currentAccess.isCollaborator,
      fileId: currentFileId,
      file: currentFile,
      contentLength: fileContent.length
    });

    // Don't save if user doesn't have edit access
    if (!currentAccess.canEdit) {
      console.log('⛔ Save blocked - no edit access', currentAccess);
      return;
    }

    // Don't save if fileId is not set yet
    if (!currentFileId) {
      console.log('⛔ Save blocked - fileId not loaded yet');
      return;
    }

    // Don't save if content hasn't changed
    if (fileContent === lastSyncedContentRef.current) {
      console.log('⏭️ Save skipped - content unchanged');
      return;
    }

    const payload = {
      fileId: currentFileId,
      content: fileContent,
    };
    
    console.log('💾 Actually saving file now...');
    
    try {
      setIsSaving(true);
      const response = await Axios.put("/api/code", payload);

      if (response.status === 200) {
        console.log('✅ File saved successfully');
        lastSyncedContentRef.current = fileContent;
        
        toast.success('File saved', { duration: 1000 });
      }
    } catch (error: any) {
      console.error('❌ Save failed:', {
        status: error.response?.status,
        error: error.response?.data?.error,
        fileId: currentFileId,
        file: currentFile
      });
      
      if (error.response?.status === 403) {
        toast.error('You don\'t have permission to edit this file', { duration: 3000 });
      } else if (error.response?.status === 400) {
        toast.error('Failed to save: Invalid request');
      } else {
        toast.error('Failed to save changes');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Create stable debounced save function once
  const debouncedSave = useRef(
    debounce((content: string) => {
      saveToServer(content);
    }, 2000)
  ).current;

  // Set up collaboration options
  const collaborationOptions = {
    fileName: file || '',
    onContentUpdate: (newContent: string) => {
      // Handle remote content updates from other collaborators
      if (editorViewRef.current && newContent !== editorViewRef.current.state.doc.toString()) {
        isRemoteUpdateRef.current = true;
        
        // Update editor content
        const transaction = editorViewRef.current.state.update({
          changes: {
            from: 0,
            to: editorViewRef.current.state.doc.length,
            insert: newContent
          }
        });
        
        editorViewRef.current.dispatch(transaction);
        
        // Reset flag after a short delay
        setTimeout(() => {
          isRemoteUpdateRef.current = false;
        }, 100);
      }
      
      lastSyncedContentRef.current = newContent;
      setCode(newContent);
    },
    onUserJoined: (userId: string, userInfo: any) => {
      toast.success(`👤 ${userInfo?.name || 'A collaborator'} joined`, { duration: 2000 });
    },
    onUserLeft: () => {
      toast.info(`👋 A collaborator left`, { duration: 2000 });
    },
    onFileSaved: () => {
      // Refresh content when another user saves
      if (!isSaving && file && projectId) {
        console.log('🔄 File saved by another user, refreshing...');
        fetchData();
      }
    }
  };

  // Use Liveblocks collaboration hook
  const { isConnected, broadcastChange } = useLiveblocksCollaboration(collaborationOptions);

  // Fetch file content when file or projectId changes
  useEffect(() => {
    if (!file || !projectId) {
      setContent('');
      setFileId(undefined);
      setCode('');
      return;
    }
    
    // Prevent multiple simultaneous fetches
    if (isFetchingRef.current) {
      console.log('⏭️ Skipping fetch - already in progress');
      return;
    }
    
    isFetchingRef.current = true;
    fetchData().finally(() => {
      isFetchingRef.current = false;
    });
    
    // Cleanup on unmount or file change
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, projectId]);

  // Initialize CodeMirror editor
  useEffect(() => {
    if (!element || !file) return;

    // Determine language based on file extension
    const extensionArray = file.split(".");
    const extension = extensionArray[extensionArray.length - 1];

    console.log("File extension:", extension);

    // Create extensions array
    const extensions: any[] = [
      basicSetup,
      // Add read-only mode if user can't edit
      EditorView.editable.of(projectAccess.canEdit),
      // Styling
      EditorView.theme({
        "&": { height: "100%" },
        ".cm-scroller": { overflow: "auto" },
        ".cm-content": { 
          fontFamily: "'Fira Code', 'Monaco', 'Courier New', monospace",
          fontSize: "14px"
        }
      }),
      // Language support
      extension === "js"
        ? javascript()
        : extension === "css"
          ? css()
          : html({
              autoCloseTags: true,
              selfClosingTags: true,
              nestedLanguages: [
                {
                  tag: "style",
                  parser: cssLanguage.parser,
                },
                {
                  tag: "script",
                  parser: javascriptLanguage.parser,
                },
              ],
            }),
    ];

    // Add update listener - always add it, but save function checks permissions via ref
    extensions.push(
      EditorView.updateListener.of((update) => {
        if (update.docChanged && !isRemoteUpdateRef.current) {
          const newContent = update.state.doc.toString();

          // Update code in EditorProvider for preview
          setCode(newContent);

          // Broadcast changes to other collaborators (even in read-only, for live preview)
          broadcastChange(newContent);

          // Auto-save to database after 2 seconds (saveToServer checks canEdit via ref)
          debouncedSave(newContent);
        }
      })
    );

    const state = EditorState.create({
      doc: content || "",
      extensions,
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
  }, [file, element, content, projectAccess.canEdit, setCode, broadcastChange, debouncedSave]);

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
          {/* Read-Only Banner */}
          {!projectAccess.canEdit && (
            <div className="absolute top-0 left-0 right-0 z-30 bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-xl px-4 py-2 border-b border-amber-500/30">
              <div className="flex items-center gap-2 justify-center">
                <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-xs font-semibold text-amber-500 tracking-wide">
                  READ-ONLY MODE - You are viewing this project
                </span>
              </div>
            </div>
          )}
          
          {/* Status Indicators */}
          <div className={cn(
            "absolute z-20 flex items-center gap-2",
            !projectAccess.canEdit ? "top-14 right-3" : "top-3 right-3"
          )}>
            {/* Collaboration Status */}
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
            
            {/* Saving Indicator */}
            {isSaving && (
              <div className="flex items-center gap-2 bg-gradient-to-r from-primary/10 to-blue-500/10 backdrop-blur-xl px-4 py-2 rounded-xl shadow-lg border border-primary/30">
                <svg className="animate-spin h-3.5 w-3.5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-xs font-semibold text-primary tracking-wide">SAVING...</span>
              </div>
            )}
          </div>
          
          {/* Editor Container */}
          <div
            className={cn(
              "relative h-full w-full overflow-auto bg-gradient-to-br from-background via-background to-muted/10",
              !projectAccess.canEdit && "pt-12"
            )}
            ref={ref}
          ></div>
        </div>
      )}
    </div>
  );
};

// Wrap the editor with Liveblocks provider
export default function EditorPage() {
  const params = useParams();
  const projectId = params?.projectId as string;
  
  if (!projectId) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Invalid project ID</p>
      </div>
    );
  }
  
  return (
    <LiveblocksProvider roomId={`project-${projectId}`}>
      <CodeEditor />
    </LiveblocksProvider>
  );
}