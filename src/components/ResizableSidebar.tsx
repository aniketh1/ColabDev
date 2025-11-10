"use client";

import React from "react";
import { Resizable } from "re-resizable";
import EditorSidebar from "@/app/(dashboard)/editor/_component/EditorSidebar";

interface ResizableSidebarProps {
  className?: string;
}

const ResizableSidebar: React.FC<ResizableSidebarProps> = ({ className }) => {
  return (
    <Resizable
      defaultSize={{ width: '20%', height: '100%' }}
      minWidth="15%"
      maxWidth="50%"
      enable={{
        right: true
      }}
      className={className}
      handleStyles={{
        right: {
          width: '4px',
          right: '0',
          backgroundColor: 'hsl(var(--border))',
          cursor: 'ew-resize',
          opacity: 0.5,
          transition: 'opacity 0.2s',
        }
      }}
      handleClasses={{
        right: 'hover:opacity-100'
      }}
    >
      <EditorSidebar />
    </Resizable>
  );
};

export default ResizableSidebar;