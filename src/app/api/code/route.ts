import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/config/connectDB";
import FileModel from "@/models/FileModel";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { getFileFromS3, uploadFileToS3 } from "@/lib/s3Operations";

export async function POST(request : NextRequest){
    try {
        const session = await getServerSession(authOptions)

        if(!session){
            return NextResponse.json(
                { error : "Unauthorized"},
                { status : 401}
            )
        }

        const { projectId , fileName } = await request.json()

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
        const isOwner = project.userId.toString() === session.user.id;
        const isCollaborator = project.collaborators?.some(
            (collabId: any) => collabId.toString() === session.user.id
        );
        const isPublic = project.isPublic;
        
        console.log('🔐 File Access Check:', {
            fileName,
            projectId,
            userId: session.user.id,
            userEmail: session.user.email,
            isOwner,
            isCollaborator,
            isPublic,
            collaboratorIds: project.collaborators?.map((id: any) => id.toString())
        });

        if (!isOwner && !isCollaborator && !isPublic) {
            return NextResponse.json(
                { error : "Access denied to this project"},
                { status : 403 }
            )
        }

        const fileMetadata = await FileModel.findOne({
            name : fileName,
            projectId : projectId
        })

        if (!fileMetadata) {
            // File doesn't exist yet - create empty file automatically for better UX
            // Only allow auto-creation for basic HTML/CSS/JS files or if user is owner/collaborator
            const allowedAutoCreate = ['index.html', 'style.css', 'script.js', 'App.jsx', 'App.vue', 'main.jsx', 'main.js'];
            const canAutoCreate = allowedAutoCreate.includes(fileName) || isOwner || isCollaborator;
            
            if (!canAutoCreate) {
                return NextResponse.json(
                    { error : "File not found"},
                    { status : 404 }
                )
            }
            
            console.log(`File ${fileName} not found for project ${projectId}, creating empty file`);
            
            const newFile = await FileModel.create({
                name: fileName,
                projectId: projectId,
                content: "",
                storageType: 'mongodb'
            });

            return NextResponse.json(
                { 
                    message : "File created and returned",
                    data : newFile
                },
                { status : 200 }
            )
        }

        // If file is in S3, fetch from S3
        if (fileMetadata.storageType === 's3' && fileMetadata.s3Key) {
            const s3Result = await getFileFromS3(session.user.id, projectId, fileName);
            
            if (s3Result.success) {
                return NextResponse.json(
                    { 
                        message : "Successfully",
                        data : {
                            ...fileMetadata.toObject(),
                            content: s3Result.content
                        }
                    },
                    { status : 200 }
                )
            }
        }

        // Fallback to MongoDB content
        return NextResponse.json(
            { 
                message : "Successfully",
                data : fileMetadata
            },
            {
                status : 200
            }
        )

    } catch (error) {
        console.error('❌ POST /api/code error:', error);
        return NextResponse.json({
            error : "Something went wrong",
            details: error instanceof Error ? error.message : 'Unknown error'
        },{
            status : 500
        })
    }
}

export async function PUT(request : NextRequest){
    try {
        const session = await getServerSession(authOptions)

        if(!session){
            return NextResponse.json(
                { error : "Unauthorized"},
                { status : 401 }
            )
        }

        const body = await request.json()
        const { content, fileId } = body

        console.log('📝 PUT /api/code - Save file request:', {
            userId: session.user.id,
            userEmail: session.user.email,
            fileId: fileId || 'MISSING',
            contentLength: content?.length || 0,
            bodyKeys: Object.keys(body)
        });

        if(!fileId){
            return NextResponse.json(
                { error : "fileId is required", received: body },
                { status : 400 }
            )
        }

        await connectDB()

        const fileMetadata = await FileModel.findById(fileId).populate('projectId');

        if (!fileMetadata) {
            return NextResponse.json(
                { error : "File not found"},
                { status : 404 }
            )
        }

        // Import ProjectModel to check access
        const ProjectModel = (await import("@/models/ProjectModel")).default;
        const project = await ProjectModel.findById(fileMetadata.projectId);
        
        if (!project) {
            return NextResponse.json(
                { error : "Project not found"},
                { status : 404 }
            )
        }

        // Check if user is owner or collaborator (public projects are read-only for non-collaborators)
        const isOwner = project.userId.toString() === session.user.id;
        const isCollaborator = project.collaborators?.some(
            (collabId: any) => collabId.toString() === session.user.id
        );

        if (!isOwner && !isCollaborator) {
            return NextResponse.json(
                { error : "You don't have permission to edit this file"},
                { status : 403 }
            )
        }

        // If file is in S3, update in S3
        if (fileMetadata.storageType === 's3' && fileMetadata.s3Key) {
            const projectId = fileMetadata.projectId.toString();
            const s3Result = await uploadFileToS3(
                session.user.id,
                projectId,
                fileMetadata.name,
                content
            );

            if (!s3Result.success) {
                // If S3 fails, fallback to MongoDB
                await FileModel.findByIdAndUpdate(fileId, {
                    content: content,
                    storageType: 'mongodb'
                });
            }
        } else {
            // Update in MongoDB
            await FileModel.findByIdAndUpdate(fileId, {
                content : content
            });
        }

        return NextResponse.json(
            { message : "Updated successfully"},
            { status : 200 }
        )

    } catch (error) {
        console.error('Update file error:', error);
        return NextResponse.json({
            error : "Something went wrong"
        },{
            status : 500
        })
    }
}