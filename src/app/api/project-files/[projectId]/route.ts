import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/config/connectDB";
import FileModel from "@/models/FileModel";
import ProjectModel from "@/models/ProjectModel";
import { auth } from "@clerk/nextjs/server";
import { getCurrentUserId } from "@/lib/clerk";
import { getFileFromS3 } from "@/lib/s3Operations";

/**
 * GET /api/project-files/[projectId]
 * Fetch all files for a project (for WebContainer preview)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "User not found in database" }, { status: 404 });
    }

    const { projectId } = await params;

    // Get project details
    const project = await ProjectModel.findById(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check if user owns the project
    if (project.userId.toString() !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get all files for the project
    const fileMetadata = await FileModel.find({ projectId });

    // Fetch content for each file
    const filesWithContent = await Promise.all(
      fileMetadata.map(async (file) => {
        let content = file.content;

        // If file is in S3, fetch from S3
        if (file.storageType === 's3' && file.s3Key) {
          const s3Result = await getFileFromS3(
            userId,
            projectId,
            file.name
          );
          
          if (s3Result.success && s3Result.content) {
            content = s3Result.content;
          }
        }

        return {
          name: file.name,
          content: content || '',
        };
      })
    );

    // Convert to key-value object
    const filesObject: { [key: string]: string } = {};
    filesWithContent.forEach(file => {
      filesObject[file.name] = file.content;
    });

    return NextResponse.json({
      message: "Success",
      data: {
        projectId,
        techStack: project.techStack,
        files: filesObject,
      },
    });

  } catch (error: any) {
    console.error("Error fetching project files:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
