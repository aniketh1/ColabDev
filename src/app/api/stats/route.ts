import { NextResponse } from "next/server";
import { connectDB } from "@/config/connectDB";
import UserModel from "@/models/User";
import ProjectModel from "@/models/ProjectModel";

export async function GET() {
  try {
    await connectDB();

    // Get total users count
    const usersCount = await UserModel.countDocuments();

    // Get total projects count
    const projectsCount = await ProjectModel.countDocuments();

    // Get active projects (updated in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const activeProjectsCount = await ProjectModel.countDocuments({
      lastActiveAt: { $gte: sevenDaysAgo }
    });

    return NextResponse.json({
      success: true,
      data: {
        usersCount,
        projectsCount,
        activeProjectsCount
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch statistics"
    }, { status: 500 });
  }
}
