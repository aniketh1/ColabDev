import { NextRequest,NextResponse } from "next/server";
import { connectDB } from "@/config/connectDB";
import ProjectModel from "@/models/ProjectModel";
import { getCurrentUserId } from "@/lib/clerk";
import FileModel from "@/models/FileModel";
import { hmltBoilerplateCode, scriptBoilrPlatCode, styleBoilrPlatCode } from "@/lib/sampleCode";
import { uploadFileToS3 } from "@/lib/s3Operations";

//create project
export async function POST(request : NextRequest){
    try {
        const { name, techStack } = await request.json()

        const userId = await getCurrentUserId()

        if(!userId){
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
            userId : userId,
            techStack : techStack || 'html'
        })
        
        // Files are now created by the client based on tech stack selection
        // No need to create default files here

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

// all the project with current user id
export async function GET(request : NextRequest){
    try {
        const userId = await getCurrentUserId()

        if(!userId){
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

        // If specific project is requested, check if user has access
        if (projectId) {
            const project = await ProjectModel.findById(projectId);
            
            if (!project) {
                return NextResponse.json({
                    error : "Project not found"
                },{
                    status : 404
                })
            }

            // Check if user is owner, collaborator, or project is public
            const isOwner = project.userId.toString() === userId;
            const isCollaborator = project.collaborators?.some(
                (collabId: any) => collabId.toString() === userId
            );
            const isPublic = project.isPublic;
            
            console.log('🔍 Project Access Check:', {
                projectId,
                userId: userId,
                isOwner,
                isCollaborator,
                isPublic,
                collaboratorIds: project.collaborators?.map((id: any) => id.toString()),
                collaboratorsCount: project.collaborators?.length || 0
            });

            if (!isOwner && !isCollaborator && !isPublic) {
                return NextResponse.json({
                    error : "Access denied to this project"
                },{
                    status : 403
                })
            }

            // Return single project with access info
            const projectData = project.toObject();
            return NextResponse.json(
                { 
                    message : "Project found",
                    data : [{
                        ...projectData,
                        isOwner,
                        isCollaborator,
                        canEdit: isOwner || isCollaborator
                    }]
                },
                { status : 200 }
            )
        }

        // For listing projects, show only user's own projects
        const filterProject = {
            userId : userId
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