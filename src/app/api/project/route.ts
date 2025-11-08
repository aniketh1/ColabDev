import { NextRequest,NextResponse } from "next/server";
import { connectDB } from "@/config/connectDB";
import ProjectModel from "@/models/ProjectModel";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import FileModel from "@/models/FileModel";
import { hmltBoilerplateCode, scriptBoilrPlatCode, styleBoilrPlatCode } from "@/lib/sampleCode";
import { uploadFileToS3 } from "@/lib/s3Operations";

//create project
export async function POST(request : NextRequest){
    try {
        const { name } = await request.json()

        const session = await getServerSession(authOptions)

        if(!session){
            return NextResponse.json(
                { error : "Unauthorized"},
                { status : 401 }
            )
        }

        if(!name){
            return NextResponse.json(
                { error : "Name is required"},
                { status : 400 }
            )
        }

        await connectDB()

        const project = await ProjectModel.create({
            name : name,
            userId : session.user.id 
        })
        
        const userId = session.user.id;
        const projectId = project._id.toString();

        // Upload initial files to S3 and create metadata in MongoDB
        const files = [
            { name: "index.html", content: hmltBoilerplateCode },
            { name: "style.css", content: styleBoilrPlatCode },
            { name: "script.js", content: scriptBoilrPlatCode }
        ];

        for (const file of files) {
            // Upload to S3
            const s3Result = await uploadFileToS3(userId, projectId, file.name, file.content);
            
            if (s3Result.success) {
                // Create metadata in MongoDB
                await FileModel.create({
                    name: file.name,
                    projectId: project._id,
                    content: "", // Content is in S3, not MongoDB
                    s3Key: s3Result.key,
                    storageType: 's3'
                });
            } else {
                // Fallback to MongoDB if S3 fails
                console.error(`S3 upload failed for ${file.name}, using MongoDB fallback`);
                await FileModel.create({
                    name: file.name,
                    projectId: project._id,
                    content: file.content,
                    storageType: 'mongodb'
                });
            }
        }

        return NextResponse.json(
            { 
              message : "Project Created Successfully",
              data : project
            },
            { status : 201 }
        )
        

    } catch (error) {
        console.log(error)
        return NextResponse.json(
            { error : "Something went wrong"},
            { status : 500 }
        )
    }
}

// all the project with session user id
export async function GET(request : NextRequest){
    try {
        const session = await getServerSession(authOptions)

        if(!session){
            return NextResponse.json({
                error : "Unauthorized"
            },{
                status : 401
            })
        }

        const searchParams = request.nextUrl.searchParams

        /**
         * for speficic project data single project ( one )
         */
        const projectId = searchParams.get('projectId') 

        const page = Number(searchParams.get("page")) || 1
        const limit = Number(searchParams.get('limit')) || 6

        const skip = (page - 1) * limit;

        //connect to db
        await connectDB()

        const filterProject = {
            userId : session.user.id,
            ...( projectId  && {  _id : projectId,  })
        }

        const projectList = await ProjectModel.find(filterProject).sort({createdAt : -1 }).skip(skip).limit(limit)

        const totalCount = await ProjectModel.countDocuments(filterProject)

        const totalPages = Math.ceil(totalCount / limit)

        return NextResponse.json(
            { 
                message : "Project list",
                data : projectList,
                totalPages : totalPages,
                totalCount : totalCount
            },
            { 
                status : 200
            }
        )


    } catch (error) {
        console.log("error",error)
        return NextResponse.json(
            { error : "Something went wrong"},
            { status : 500 }
        )
    }
}

//update project
export async function PUT(request : NextRequest){
    try {
        const { name, projectId } = await request.json()

        const session = await getServerSession(authOptions)

        if(!session){
            return NextResponse.json(
                { error : "Unauthorized"},
                { status : 401 }
            )
        }

        if(!name){
            return NextResponse.json(
                { error : "Name is required"},
                { status : 400 }
            )
        }

        await connectDB()

        const updateProject = await ProjectModel.findByIdAndUpdate(projectId, {
            name : name
        })

        return NextResponse.json(
            { message : "Project updated successfully"},
            { status : 200 }
        )
    } catch (error) {
        return NextResponse.json(
            { error : "Something went wrong"},
            { status : 500 }
        )
    }
}