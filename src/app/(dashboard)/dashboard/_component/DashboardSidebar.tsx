"use client";
import Logo from "@/components/Logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { getAvatarName } from "@/lib/getAvatarName";
import { cn } from "@/lib/utils";
import { Popover } from "@radix-ui/react-popover";
import { FileIcon, GripVertical } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import CreateProject from "./CreateProject";
import Axios from "@/lib/Axios";

const DashboardSidebar = () => {
  const pathname = usePathname();
  const session = useSession();
  const [data,setData] = useState([])
  const [sidebarWidth, setSidebarWidth] = useState(280) // Default width
  const [isResizing, setIsResizing] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)


  const fetchData = async()=>{
    try {
        const response = await Axios.get("/api/recent-project-update")

        if(response.status === 200){
          setData(response.data.data)
        }
    } catch {
      // Silently fail - recent projects will be empty
    }
  }

  useEffect(()=>{
    fetchData()
    
    // Load saved sidebar width from localStorage
    const savedWidth = localStorage.getItem('dashboardSidebarWidth')
    if (savedWidth) {
      setSidebarWidth(parseInt(savedWidth))
    }
  },[])

  // Handle mouse down on resize handle
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true)
    e.preventDefault()
  }

  // Handle mouse move while resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return
      
      const newWidth = e.clientX
      // Set min and max width constraints
      if (newWidth >= 200 && newWidth <= 500) {
        setSidebarWidth(newWidth)
        // Save to localStorage
        localStorage.setItem('dashboardSidebarWidth', newWidth.toString())
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing])

  return (
    <div 
      ref={sidebarRef}
      className="relative border-r border-border bg-background flex-shrink-0 transition-all"
      style={{ width: `${sidebarWidth}px`, maxWidth: '500px', minWidth: '200px' }}
    >
      <Sidebar className="h-full" style={{ width: `${sidebarWidth}px` }}>
        <SidebarHeader className="px-4 border-b border-border bg-white dark:bg-black">
          <Logo w={100} />
        </SidebarHeader>
        <SidebarContent className="bg-background">
        <div className="px-3 py-4">
          <CreateProject/>
        </div>

        <div className="px-2 w-full">
          <SidebarMenu>
            <SidebarMenuItem>
              <Link
                href={"/dashboard"}
                className={cn(
                  "w-full min-w-full block px-3 py-2 rounded-lg font-medium transition-colors",
                  pathname === "/dashboard" 
                    ? "bg-primary/10 text-primary" 
                    : "hover:bg-muted text-foreground"
                )}
              >
                Dashboard
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground">Recent Projects</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.map((item : any) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild className="hover:bg-muted">
                    <Link href={`${process.env.NEXT_PUBLIC_BASE_URL}/editor/${item?._id}?file=index.html`}>
                      <FileIcon className="w-4 h-4" />
                      <span className="truncate">{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-border bg-background">
        <Popover>
          <PopoverTrigger>
            <div className="flex items-center w-full justify-between px-3 py-2 bg-muted/50 hover:bg-muted rounded-lg transition-colors cursor-pointer">
              <p className="font-semibold text-sm truncate">{session.data?.user?.name}</p>
              <Avatar className="w-8 h-8 border-2 border-border">
                <AvatarImage src={session.data?.user?.image as string} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {getAvatarName(session.data?.user.name as string)}
                </AvatarFallback>
              </Avatar>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-56">
            <div className="space-y-3">
              <div>
                <p className="font-semibold">{session.data?.user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{session.data?.user?.email}</p>
              </div>
              <div className="h-px bg-border"></div>
              <Button
                variant={"destructive"}
                size="sm"
                className="w-full cursor-pointer"
                onClick={() => signOut()}
              >
                Logout
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </SidebarFooter>
    </Sidebar>
    
    {/* Resize Handle */}
    <div
      onMouseDown={handleMouseDown}
      className={cn(
        "absolute top-0 right-0 w-1 h-full cursor-col-resize group hover:bg-primary/50 transition-colors",
        isResizing && "bg-primary"
      )}
    >
      <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="w-4 h-4 text-primary" />
      </div>
    </div>
  </div>
  );
};

export default DashboardSidebar;
