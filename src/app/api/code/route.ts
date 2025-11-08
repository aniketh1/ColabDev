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

        const fileMetadata = await FileModel.findOne({
            name : fileName,
            projectId : projectId
        })

        if (!fileMetadata) {
            return NextResponse.json(
                { error : "File not found"},
                { status : 404 }
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
        return NextResponse.json({
            error : "Something went wrong"
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

        const { content, fileId } = await request.json()

        if(!fileId){
            return NextResponse.json(
                { error : "fileId is required"},
                { status : 400 }
            )
        }

        await connectDB()

        const fileMetadata = await FileModel.findById(fileId);

        if (!fileMetadata) {
            return NextResponse.json(
                { error : "File not found"},
                { status : 404 }
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