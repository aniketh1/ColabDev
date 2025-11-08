import { NextRequest,NextResponse } from "next/server";
import { connectDB } from "@/config/connectDB";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import FileModel from "@/models/FileModel";
import { uploadFileToS3 } from "@/lib/s3Operations";

//create file with projectId
export async function POST(request : NextRequest){
    try {
        const session = await getServerSession(authOptions)

        if(!session){
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

        // Upload file to S3 with content
        const s3Result = await uploadFileToS3(
            session.user.id,
            projectId,
            finalFileName,
            finalContent
        );

        if (s3Result.success) {
            // Create metadata in MongoDB
            await FileModel.create({
                name : finalFileName,
                projectId : projectId,
                content: "",
                s3Key: s3Result.key,
                storageType: 's3'
            });
        } else {
            // Fallback to MongoDB if S3 fails
            await FileModel.create({
                name : finalFileName,
                projectId : projectId,
                content: finalContent,
                storageType: 'mongodb'
            });
        }

        return NextResponse.json(
            { message : "File created successfully"},
            { status : 201 }
        )

    } catch (error) {
        return NextResponse.json(
            { error : "Something went wrong"},
            { status : 500 }
        )
    }
}

//get file with projectId
export async function GET(request : NextRequest){
    try {
        const session = await getServerSession(authOptions)

        if(!session){
            return NextResponse.json(
                { error : "Unauthorized"},
                { status : 401 }
            )
        }

        const searchParams = request.nextUrl.searchParams
        const projectId = searchParams.get("projectId")

        await connectDB()

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
    } catch (error) {
        return NextResponse.json(
            { error : "Something went wrong"},
            { status : 500 }
        ) 
    }
}