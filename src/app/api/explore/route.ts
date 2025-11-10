import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/config/connectDB";
import ProjectModel from "@/models/ProjectModel";

export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();
        
        // Require authentication
        if (!userId) {
            return NextResponse.json(
                { message: "Unauthorized - Please sign in to explore projects" },
                { status: 401 }
            );
        }

        await connectDB();

        const { searchParams } = new URL(req.url);
        const filter = searchParams.get("filter") || "all"; // all, recent, live
        const limit = parseInt(searchParams.get("limit") || "20");
        const page = parseInt(searchParams.get("page") || "1");
        const skip = (page - 1) * limit;

        // Base query: only public projects
        const query: any = { isPublic: true };

        // Filter by recent (last 5 days)
        if (filter === "recent") {
            const fiveDaysAgo = new Date();
            fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
            query.lastActiveAt = { $gte: fiveDaysAgo };
        }

        // Fetch projects with owner details
        const projects = await ProjectModel.find(query)
            .populate("userId", "firstName lastName username email")
            .sort({ lastActiveAt: -1, updatedAt: -1 })
            .limit(limit)
            .skip(skip)
            .lean();

        // Get total count for pagination
        const totalCount = await ProjectModel.countDocuments(query);

        // Transform the data for frontend
        const transformedProjects = projects.map((project: any) => ({
            _id: project._id,
            name: project.name,
            techStack: project.techStack,
            lastActiveAt: project.lastActiveAt,
            updatedAt: project.updatedAt,
            createdAt: project.createdAt,
            isPublic: project.isPublic,
            owner: {
                _id: project.userId._id,
                firstName: project.userId.firstName,
                lastName: project.userId.lastName,
                username: project.userId.username,
                email: project.userId.email,
            },
        }));

        return NextResponse.json({
            success: true,
            data: transformedProjects,
            pagination: {
                total: totalCount,
                page,
                limit,
                totalPages: Math.ceil(totalCount / limit),
            },
        });
    } catch (error: any) {
        console.error("Explore API Error:", error);
        return NextResponse.json(
            { message: "Failed to fetch projects", error: error.message },
            { status: 500 }
        );
    }
}
