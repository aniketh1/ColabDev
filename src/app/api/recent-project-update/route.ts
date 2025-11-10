import { NextResponse } from "next/server";
import { connectDB } from "@/config/connectDB";
import ProjectModel from "@/models/ProjectModel";
import { auth } from "@clerk/nextjs/server";
import { getCurrentUserId } from "@/lib/clerk";

export async function GET() {
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

    const recentProject = await ProjectModel.find({
      userId: userId,
    })
      .sort({ updatedAt: -1 })
      .limit(10);

    return NextResponse.json(
      {
        message: "Recent Project",
        data: recentProject,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
