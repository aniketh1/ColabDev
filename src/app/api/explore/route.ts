import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/config/connectDB";
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
        const filter = searchParams.get("filter") || "all";
        const limit = parseInt(searchParams.get("limit") || "20");
        const page = parseInt(searchParams.get("page") || "1");
        const skip = (page - 1) * limit;

        // Step 1: Fetch all users and create a lookup map
        const UserModel = (await import("@/models/User")).default;
        const allUsers = await UserModel.find({}, { _id: 1, name: 1, email: 1, avatar: 1, clerkId: 1 }).lean();
        const userMap = new Map(allUsers.map((user: any) => [user._id.toString(), user]));

        // Step 2: Get array of valid user IDs
        const validUserIds = Array.from(userMap.keys());

        // Step 3: Build query - only public projects from existing users
        const query: any = { 
            isPublic: true,
            userId: { $in: validUserIds }
        };

        // Filter by recent (last 5 days)
        if (filter === "recent") {
            const fiveDaysAgo = new Date();
            fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
            query.lastActiveAt = { $gte: fiveDaysAgo };
        }

        // Step 4: Fetch projects
        const projects = await ProjectModel.find(query)
            .sort({ lastActiveAt: -1, updatedAt: -1 })
            .limit(limit)
            .skip(skip)
            .lean();

        // Get total count for pagination
        const totalCount = await ProjectModel.countDocuments(query);

        // Step 5: Transform projects with user data from our map
        const transformedProjects = projects.map((project: any) => {
            const user = userMap.get(project.userId.toString());
            
            return {
                _id: project._id,
                name: project.name,
                techStack: project.techStack,
                lastActiveAt: project.lastActiveAt,
                updatedAt: project.updatedAt,
                createdAt: project.createdAt,
                isPublic: project.isPublic,
                owner: {
                    _id: user?._id || project.userId,
                    name: user?.name || 'Unknown User',
                    email: user?.email || '',
                    avatar: user?.avatar || '',
                    clerkId: user?.clerkId || '',
                },
            };
        });

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
        console.error("Error stack:", error.stack);
        return NextResponse.json(
            { 
                success: false,
                message: "Failed to fetch projects", 
                error: error.message,
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            },
            { status: 500 }
        );
    }
}
