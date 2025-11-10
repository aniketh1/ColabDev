"use client";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

const BrowserPage = () => {
  const params = useParams();
  const username = params?.username as string;
  const projectId = params?.projectId as string;
  const fileName = params?.fileName as string;
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      // Redirect to login page if not authenticated
      router.push("/login");
    }
  }, [isLoaded, isSignedIn, router]);

  // Show loading state while checking auth
  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  console.log("browser page", username, projectId, fileName);

  return (
    <div className="relative w-full h-full min-h-screen">
      {/* Read-only Banner */}
      <div className="absolute top-0 left-0 right-0 bg-yellow-50 border-b border-yellow-200 px-4 py-2 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-yellow-800 font-medium">👁️ Read-Only Mode</span>
            <span className="text-yellow-600 text-sm">
              You are viewing <span className="font-semibold">{username}</span>'s project
            </span>
          </div>
        </div>
      </div>
      <iframe
        className="w-full h-full min-h-screen min-w-screen pt-10"
        src={`${process.env.NEXT_PUBLIC_BASE_URL}/api/file/${projectId}/${fileName}`}
      />
    </div>
  );
};

export default BrowserPage;
