"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Share2, Copy, Check, UserPlus } from "lucide-react";
import { toast } from "sonner";
import Axios from "@/lib/Axios";

interface ShareProjectProps {
  projectId: string;
  projectName: string;
  onCollaboratorAdded?: () => void;
}

export function ShareProject({ projectId, projectName, onCollaboratorAdded }: ShareProjectProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Get the shareable link
  const shareUrl = `${window.location.origin}/editor/${projectId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddCollaborator = async () => {
    if (!email.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    try {
      setIsLoading(true);
      const response = await Axios.post("/api/collaborators", {
        projectId,
        email: email.trim(),
      });

      if (response.status === 200) {
        toast.success(`${email} added as collaborator!`);
        setEmail("");
        setOpen(false);
        // Refresh project data to show updated collaborators
        if (onCollaboratorAdded) {
          onCollaboratorAdded();
        }
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || "Failed to add collaborator";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 hover:bg-primary/10 transition-all duration-200"
        >
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share {projectName}</DialogTitle>
          <DialogDescription>
            Anyone with the link can view. Add collaborators to give edit access.
          </DialogDescription>
        </DialogHeader>

        {/* Shareable Link Section */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Shareable Link
            </label>
            <div className="flex items-center gap-2">
              <Input
                value={shareUrl}
                readOnly
                className="flex-1 bg-muted/50"
              />
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={handleCopyLink}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Anyone with this link can <strong>view</strong> your project
            </p>
          </div>

          {/* Add Collaborator Section */}
          <div className="pt-4 border-t">
            <label className="text-sm font-medium mb-2 block">
              Add Collaborator (Edit Access)
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddCollaborator();
                  }
                }}
                className="flex-1"
              />
              <Button
                onClick={handleAddCollaborator}
                disabled={isLoading}
                className="gap-2 shrink-0"
              >
                {isLoading ? (
                  <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                Add
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Collaborators can <strong>edit</strong> files and save changes
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
