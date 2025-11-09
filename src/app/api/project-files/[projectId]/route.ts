import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/config/connectDB";
import FileModel from "@/models/FileModel";
import ProjectModel from "@/models/ProjectModel";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
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
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await params;

    await connectDB();

    // Get project details
    const project = await ProjectModel.findById(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check if user owns the project
    if (project.userId.toString() !== session.user.id) {
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
            session.user.id,
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
