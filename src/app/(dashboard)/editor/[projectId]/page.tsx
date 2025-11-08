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
import { useCollaboration } from "@/hooks/useCollaboration";

const CodeEditor = () => {
  const searchParams = useSearchParams();
  const file = searchParams.get("file");
  const [element, setElement] = useState<HTMLElement | null>(null);
  const { projectId } = useParams();
  const [content, setContent] = useState<string>();
  const [fileId, setFileId] = useState<string>();
  const { isLoading, setIsLoading } = useEditorContext();
  const editorViewRef = useRef<EditorView | null>(null);
  const isRemoteUpdateRef = useRef(false);

  // Real-time collaboration
  const { isConnected, broadcastChange, notifyFileSaved } = useCollaboration({
    projectId: projectId as string,
    fileName: file || '',
    onContentUpdate: (newContent, socketId) => {
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
    onUserJoined: (socketId) => {
      toast.success('A collaborator joined', { duration: 2000 });
    },
    onUserLeft: (socketId) => {
      toast.info('A collaborator left', { duration: 2000 });
    },
  });

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
      const response = await Axios.post("/api/code", payload);

      if (response.status === 200) {
        setContent(response?.data?.data?.content);
        setFileId(response?.data?.data?._id);
      }
    } catch (error: any) {
      toast.error(error.response.data.error);
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
    <div className="p-2 pb-10">
      {!file ? (
        <div className="flex items-center justify-center flex-col bg-white rounded-md p-4 pb-7">
          <Image
            src={"/editor file.svg"}
            width={320}
            height={320}
            alt="editor"
          />
          <p className="text-slate-400">No file is open</p>
        </div>
      ) : (
        <div className="relative">
          {/* Collaboration Status Indicator */}
          <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-gray-200">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="text-xs font-medium text-gray-700">
                {isConnected ? 'Live' : 'Offline'}
              </span>
            </div>
            {isLoading && (
              <div className="flex items-center gap-1.5 bg-blue-500/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm text-white">
                <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-xs font-medium">Saving...</span>
              </div>
            )}
          </div>
          
          <div
            className="relative flex-1 h-full min-h-[calc(100vh-3.5rem)] bg-white w-full overflow-auto"
            ref={ref}
          ></div>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;
