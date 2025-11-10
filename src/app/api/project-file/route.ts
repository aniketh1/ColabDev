import { NextRequest,NextResponse } from "next/server";
import { connectDB } from "@/config/connectDB";
import { getCurrentUserId } from "@/lib/clerk";
import FileModel from "@/models/FileModel";
import { uploadFileToS3 } from "@/lib/s3Operations";

//create file with projectId
export async function POST(request : NextRequest){
    try {
        const userId = await getCurrentUserId()

        if(!userId){
            return NextResponse.json(
                { error : "Unauthorized"},
                { status : 401 }
            )
        }
        const { name, fileName, projectId, content } = await request.json()
        
        // Accept either 'name' or 'fileName' for backward compatibility
        const finalFileName = fileName || name;
        const finalContent = content || "";

        if(!finalFileName || !projectId){
            return NextResponse.json(
                { error : "fileName and projectId are required"},
                { status : 400 }
            )
        }

        await connectDB()

        // Check if user has access to this project
        const ProjectModel = (await import("@/models/ProjectModel")).default;
        const project = await ProjectModel.findById(projectId);
        
        if (!project) {
            return NextResponse.json(
                { error : "Project not found"},
                { status : 404 }
            )
        }

        // Check if user is owner or collaborator (public projects are read-only)
        const isOwner = project.userId.toString() === userId;
        const isCollaborator = project.collaborators?.some(
            (collabId: any) => collabId.toString() === userId
        );

        if (!isOwner && !isCollaborator) {
            return NextResponse.json(
                { error : "You don't have permission to create files in this project"},
                { status : 403 }
            )
        }

        const checkFileName = await FileModel.findOne({ 
            name : finalFileName,
            projectId : projectId
        })

        if(checkFileName){
            return NextResponse.json(
                { error : "File name already exists"},
                { status : 400 }
            )
        }

        console.log('📤 Uploading file to S3:', {
            fileName: finalFileName,
            projectId,
            contentLength: finalContent.length,
            contentPreview: finalContent.substring(0, 100) + (finalContent.length > 100 ? '...' : '')
        });

        // Upload file to S3 with content
        const s3Result = await uploadFileToS3(
            userId,
            projectId,
            finalFileName,
            finalContent
        );

        console.log('📤 S3 upload result:', {
            fileName: finalFileName,
            success: s3Result.success,
            s3Key: s3Result.key
        });

        if (s3Result.success) {
            // Create metadata in MongoDB
            const createdFile = await FileModel.create({
                name : finalFileName,
                projectId : projectId,
                content: "",
                s3Key: s3Result.key,
                storageType: 's3'
            });
            
            console.log('✅ File created in DB with S3 reference:', {
                fileId: createdFile._id.toString(),
                fileName: finalFileName,
                s3Key: s3Result.key
            });
        } else {
            // Fallback to MongoDB if S3 fails
            const createdFile = await FileModel.create({
                name : finalFileName,
                projectId : projectId,
                content: finalContent,
                storageType: 'mongodb'
            });
            
            console.log('⚠️ File created in MongoDB (S3 failed):', {
                fileId: createdFile._id.toString(),
                fileName: finalFileName,
                contentLength: finalContent.length
            });
        }

        // Update project's lastActiveAt
        await ProjectModel.findByIdAndUpdate(projectId, {
            lastActiveAt: new Date()
        });

        return NextResponse.json(
            { message : "File created successfully"},
            { status : 201 }
        )

    } catch (error: any) {
        console.error('❌ Error creating file:', {
            error: error.message,
            stack: error.stack
        });
        return NextResponse.json(
            { error : "Something went wrong"},
            { status : 500 }
        )
    }
}

//get file with projectId
export async function GET(request : NextRequest){
    try {
        const userId = await getCurrentUserId()

        if(!userId){
            return NextResponse.json(
                { error : "Unauthorized"},
                { status : 401 }
            )
        }

        const searchParams = request.nextUrl.searchParams
        const projectId = searchParams.get("projectId")

        await connectDB()

        // Import ProjectModel to check access
        const ProjectModel = (await import("@/models/ProjectModel")).default;
        
        // Check if user has access to this project
        const project = await ProjectModel.findById(projectId);
        
        if (!project) {
            return NextResponse.json(
                { error : "Project not found"},
                { status : 404 }
            )
        }

        // Check if user is owner, collaborator, or project is public
        const isOwner = project.userId.toString() === userId;
        const isCollaborator = project.collaborators?.some(
            (collabId: any) => collabId.toString() === userId
        );
        const isPublic = project.isPublic;

        if (!isOwner && !isCollaborator && !isPublic) {
            return NextResponse.json(
                { error : "Access denied to this project"},
                { status : 403 }
            )
        }

        const allFile = await FileModel.find({
            projectId : projectId
        }).select("-content")

        return NextResponse.json(
            { 
                message : "All file with respect to project",
                data : allFile
            },
            { status : 200 }
        )
    } catch (error: any) {
        console.error('❌ Error getting files:', {
            error: error.message
        });
        return NextResponse.json(
            { error : "Something went wrong"},
            { status : 500 }
        ) 
    }
}