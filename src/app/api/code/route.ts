import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/config/connectDB";
import FileModel from "@/models/FileModel";
import { getCurrentUserId } from "@/lib/clerk";
import { getFileFromS3, uploadFileToS3 } from "@/lib/s3Operations";

// Helper function to check project access
async function checkProjectAccess(projectId: string, userId: string) {
    const ProjectModel = (await import("@/models/ProjectModel")).default;
    const project = await ProjectModel.findById(projectId);
    
    if (!project) {
        return { hasAccess: false, canEdit: false, error: "Project not found", status: 404 };
    }

    const isOwner = project.userId.toString() === userId;
    const isCollaborator = project.collaborators?.some(
        (collabId: any) => collabId.toString() === userId
    );
    const isPublic = project.isPublic === true;
    
    const hasAccess = isOwner || isCollaborator || isPublic;
    const canEdit = isOwner || isCollaborator;
    
    console.log('🔐 Project Access Check:', {
        projectId,
        userId,
        isOwner,
        isCollaborator,
        isPublic,
        hasAccess,
        canEdit
    });

    if (!hasAccess) {
        return { hasAccess: false, canEdit: false, error: "Access denied to this project", status: 403 };
    }

    return { hasAccess: true, canEdit, isOwner, isCollaborator, isPublic, project };
}

export async function POST(request: NextRequest) {
    try {
        const userId = await getCurrentUserId();

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { projectId, fileName } = await request.json();

        if (!projectId || !fileName) {
            return NextResponse.json(
                { error: "projectId and fileName are required" },
                { status: 400 }
            );
        }

        await connectDB();

        // Check project access
        const accessCheck = await checkProjectAccess(projectId, userId);
        
        if (!accessCheck.hasAccess) {
            return NextResponse.json(
                { error: accessCheck.error },
                { status: accessCheck.status }
            );
        }

        console.log('📥 GET file request:', {
            fileName,
            projectId,
            userId: userId,
            canEdit: accessCheck.canEdit
        });

        // Try to find existing file
        let fileMetadata = await FileModel.findOne({
            name: fileName,
            projectId: projectId
        });

        // Auto-create file if it doesn't exist and user has edit access
        if (!fileMetadata) {
            // Define files that can be auto-created
            const allowedAutoCreate = [
                'index.html', 'style.css', 'script.js',
                'App.jsx', 'App.js', 'App.vue', 'App.tsx',
                'main.jsx', 'main.js', 'main.tsx',
                'index.jsx', 'index.tsx'
            ];
            
            const canAutoCreate = allowedAutoCreate.includes(fileName) && accessCheck.canEdit;
            
            if (!canAutoCreate) {
                return NextResponse.json(
                    { error: "File not found" },
                    { status: 404 }
                );
            }
            
            console.log(`📝 Auto-creating file: ${fileName} for project ${projectId}`);
            
            // Get default content based on file type
            const defaultContent = getDefaultFileContent(fileName);
            
            fileMetadata = await FileModel.create({
                name: fileName,
                projectId: projectId,
                content: defaultContent,
                storageType: 'mongodb'
            });

            return NextResponse.json(
                { 
                    message: "File created successfully",
                    data: fileMetadata
                },
                { status: 200 }
            );
        }

        // Fetch content from S3 if stored there
        if (fileMetadata.storageType === 's3' && fileMetadata.s3Key) {
            try {
                const s3Result = await getFileFromS3(userId, projectId, fileName);
                
                if (s3Result.success) {
                    return NextResponse.json(
                        { 
                            message: "Successfully retrieved from S3",
                            data: {
                                ...fileMetadata.toObject(),
                                content: s3Result.content
                            }
                        },
                        { status: 200 }
                    );
                } else {
                    console.warn('⚠️ S3 fetch failed, falling back to MongoDB:', s3Result.error);
                }
            } catch (s3Error) {
                console.error('❌ S3 fetch error, falling back to MongoDB:', s3Error);
            }
        }

        // Return MongoDB content
        return NextResponse.json(
            { 
                message: "Successfully retrieved from MongoDB",
                data: fileMetadata
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('❌ POST /api/code error:', error);
        return NextResponse.json({
            error: "Something went wrong",
            details: error instanceof Error ? error.message : 'Unknown error'
        }, {
            status: 500
        });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const userId = await getCurrentUserId();

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { content, fileId } = body;

        console.log('📝 PUT /api/code - Save file request:', {
            userId: userId,
            fileId: fileId || 'MISSING',
            contentLength: content?.length || 0
        });

        if (!fileId) {
            return NextResponse.json(
                { error: "fileId is required" },
                { status: 400 }
            );
        }

        if (content === undefined) {
            return NextResponse.json(
                { error: "content is required" },
                { status: 400 }
            );
        }

        await connectDB();

        const fileMetadata = await FileModel.findById(fileId);

        if (!fileMetadata) {
            return NextResponse.json(
                { error: "File not found" },
                { status: 404 }
            );
        }

        const projectId = fileMetadata.projectId.toString();

        // Check project access
        const accessCheck = await checkProjectAccess(projectId, userId);
        
        if (!accessCheck.hasAccess) {
            return NextResponse.json(
                { error: accessCheck.error },
                { status: accessCheck.status }
            );
        }

        if (!accessCheck.canEdit) {
            return NextResponse.json(
                { error: "You don't have permission to edit this file" },
                { status: 403 }
            );
        }

        // Optimize: Skip update if content hasn't changed
        if (fileMetadata.storageType === 'mongodb' && fileMetadata.content === content) {
            console.log('⏭️ Content unchanged, skipping update');
            return NextResponse.json(
                { message: 'No changes to save', data: fileMetadata },
                { status: 200 }
            );
        }

        // Handle S3 storage
        if (fileMetadata.storageType === 's3' && fileMetadata.s3Key) {
            try {
                const s3Result = await uploadFileToS3(
                    userId,
                    projectId,
                    fileMetadata.name,
                    content
                );

                if (s3Result.success) {
                    // Update metadata in MongoDB
                    const updated = await FileModel.findByIdAndUpdate(
                        fileId,
                        {
                            storageType: 's3',
                            s3Key: s3Result.key,
                            updatedAt: new Date()
                        },
                        { new: true }
                    );

                    console.log('✅ File saved to S3:', fileMetadata.name);

                    return NextResponse.json(
                        { message: 'File saved successfully', data: updated },
                        { status: 200 }
                    );
                } else {
                    console.warn('⚠️ S3 upload failed, falling back to MongoDB:', s3Result.error);
                    // Fall through to MongoDB save
                }
            } catch (s3Error) {
                console.error('❌ S3 upload error, falling back to MongoDB:', s3Error);
                // Fall through to MongoDB save
            }
        }

        // Save to MongoDB (either as primary storage or fallback)
        const result = await FileModel.findByIdAndUpdate(
            fileId,
            {
                content: content,
                storageType: 'mongodb',
                updatedAt: new Date()
            },
            { new: true }
        );

        if (!result) {
            return NextResponse.json(
                { error: 'Failed to update file' },
                { status: 500 }
            );
        }

        console.log('✅ File saved to MongoDB:', fileMetadata.name);

        return NextResponse.json(
            { message: 'File saved successfully', data: result },
            { status: 200 }
        );

    } catch (error) {
        console.error('❌ PUT /api/code error:', error);
        return NextResponse.json({
            error: "Something went wrong",
            details: error instanceof Error ? error.message : 'Unknown error'
        }, {
            status: 500
        });
    }
}

// Helper function to provide sensible default content for new files
function getDefaultFileContent(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
        case 'html':
            return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>Hello World!</h1>
    <script src="script.js"></script>
</body>
</html>`;
        
        case 'css':
            return `/* Add your styles here */
body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}
`;
        
        case 'js':
            return `// Add your JavaScript code here
console.log('Script loaded!');
`;
        
        case 'jsx':
        case 'tsx':
            if (fileName.includes('App')) {
                return `function App() {
    return (
        <div className="App">
            <h1>Hello World!</h1>
        </div>
    );
}

export default App;
`;
            }
            return `// Add your code here
`;
        
        case 'vue':
            return `<template>
    <div>
        <h1>Hello World!</h1>
    </div>
</template>

<script>
export default {
    name: 'App'
}
</script>

<style scoped>
/* Add your styles here */
</style>
`;
        
        default:
            return '';
    }
}