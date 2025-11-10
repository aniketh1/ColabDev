import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/config/connectDB";
import ProjectModel from "@/models/ProjectModel";
import UserModel from "@/models/User";
import { auth } from "@clerk/nextjs/server";
import { getCurrentUserId } from "@/lib/clerk";

// Add a collaborator to a project
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "User not found in database" }, { status: 404 });
    }

    const { projectId, email } = await request.json();

    if (!projectId || !email) {
      return NextResponse.json(
        { error: "Project ID and email are required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the project
    const project = await ProjectModel.findById(projectId);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check if requester is the owner
    if (project.userId.toString() !== userId) {
      return NextResponse.json(
        { error: "Only the project owner can add collaborators" },
        { status: 403 }
      );
    }

    // Find the user to add by email
    const userToAdd = await UserModel.findOne({ email: email.toLowerCase() });

    if (!userToAdd) {
      return NextResponse.json(
        { error: "User with this email not found. They need to sign up first." },
        { status: 404 }
      );
    }

    // Check if user is already a collaborator
    if (project.collaborators?.some((id: any) => id.toString() === userToAdd._id.toString())) {
      return NextResponse.json(
        { error: "User is already a collaborator" },
        { status: 400 }
      );
    }

    // Check if user is the owner
    if (project.userId.toString() === userToAdd._id.toString()) {
      return NextResponse.json(
        { error: "Cannot add project owner as collaborator" },
        { status: 400 }
      );
    }

    // Add user to collaborators
    project.collaborators = project.collaborators || [];
    project.collaborators.push(userToAdd._id);
    await project.save();
    
    console.log('✅ Collaborator added:', {
      projectId,
      collaboratorId: userToAdd._id,
      collaboratorEmail: email,
      totalCollaborators: project.collaborators.length
    });

    return NextResponse.json(
      {
        message: "Collaborator added successfully",
        data: {
          userId: userToAdd._id,
          name: userToAdd.name,
          email: userToAdd.email,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Add collaborator error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

// Get all collaborators for a project
export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "User not found in database" }, { status: 404 });
    }

    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const project = await ProjectModel.findById(projectId).populate(
      "collaborators",
      "name email"
    );

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check if user has access to view collaborators
    const isOwner = project.userId.toString() === userId;
    const isCollaborator = project.collaborators?.some(
      (collab: any) => collab._id.toString() === userId
    );

    if (!isOwner && !isCollaborator) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        message: "Collaborators retrieved",
        data: project.collaborators || [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get collaborators error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

// Remove a collaborator from a project
export async function DELETE(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = await getCurrentUserId();
    if (!currentUserId) {
      return NextResponse.json({ error: "User not found in database" }, { status: 404 });
    }

    const { projectId, userId } = await request.json();

    if (!projectId || !userId) {
      return NextResponse.json(
        { error: "Project ID and user ID are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const project = await ProjectModel.findById(projectId);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check if requester is the owner
    if (project.userId.toString() !== currentUserId) {
      return NextResponse.json(
        { error: "Only the project owner can remove collaborators" },
        { status: 403 }
      );
    }

    // Remove user from collaborators
    project.collaborators = project.collaborators?.filter(
      (id: any) => id.toString() !== userId
    ) || [];
    await project.save();

    return NextResponse.json(
      { message: "Collaborator removed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Remove collaborator error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
