import { 
    PutObjectCommand, 
    GetObjectCommand, 
    DeleteObjectCommand,
    ListObjectsV2Command,
    DeleteObjectsCommand 
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, S3_BUCKET_NAME, generateS3Key, getProjectFolder } from '@/config/s3Client';

/**
 * Upload a file to S3
 */
export async function uploadFileToS3(
    userId: string,
    projectId: string,
    fileName: string,
    content: string
): Promise<{ success: boolean; key: string; error?: string }> {
    try {
        const key = generateS3Key(userId, projectId, fileName);
        
        console.log('📤 S3 Upload Starting:', {
            userId: userId.substring(0, 8) + '...',
            projectId,
            fileName,
            key,
            contentLength: content.length,
            bucket: S3_BUCKET_NAME
        });
        
        const command = new PutObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: key,
            Body: content,
            ContentType: getContentType(fileName),
        });

        await s3Client.send(command);

        console.log('✅ S3 Upload Success:', {
            fileName,
            key,
            contentLength: content.length
        });

        return { success: true, key };
    } catch (error: any) {
        console.error('❌ S3 Upload Error:', {
            fileName,
            error: error.message,
            code: error.code,
            statusCode: error.$metadata?.httpStatusCode
        });
        return { success: false, key: '', error: error.message };
    }
}

/**
 * Get file content from S3
 */
export async function getFileFromS3(
    userId: string,
    projectId: string,
    fileName: string
): Promise<{ success: boolean; content?: string; error?: string }> {
    try {
        const key = generateS3Key(userId, projectId, fileName);
        
        console.log('📥 S3 Get File Starting:', {
            userId: userId.substring(0, 8) + '...',
            projectId,
            fileName,
            key,
            bucket: S3_BUCKET_NAME
        });
        
        const command = new GetObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: key,
        });

        const response = await s3Client.send(command);
        const content = await response.Body?.transformToString();

        console.log('✅ S3 Get File Success:', {
            fileName,
            key,
            contentLength: content?.length || 0,
            contentPreview: content?.substring(0, 100) + (content && content.length > 100 ? '...' : '')
        });

        return { success: true, content };
    } catch (error: any) {
        console.error('❌ S3 Get File Error:', {
            fileName,
            error: error.message,
            code: error.code,
            statusCode: error.$metadata?.httpStatusCode
        });
        return { success: false, error: error.message };
    }
}

/**
 * Delete a file from S3
 */
export async function deleteFileFromS3(
    userId: string,
    projectId: string,
    fileName: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const key = generateS3Key(userId, projectId, fileName);
        
        const command = new DeleteObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: key,
        });

        await s3Client.send(command);

        return { success: true };
    } catch (error: any) {
        console.error('S3 Delete File Error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Delete entire project folder from S3
 */
export async function deleteProjectFromS3(
    userId: string,
    projectId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const prefix = getProjectFolder(userId, projectId);
        
        // List all objects in the project folder
        const listCommand = new ListObjectsV2Command({
            Bucket: S3_BUCKET_NAME,
            Prefix: prefix,
        });

        const listedObjects = await s3Client.send(listCommand);

        if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
            return { success: true }; // No files to delete
        }

        // Delete all objects
        const deleteCommand = new DeleteObjectsCommand({
            Bucket: S3_BUCKET_NAME,
            Delete: {
                Objects: listedObjects.Contents.map((obj: any) => ({ Key: obj.Key })),
            },
        });

        await s3Client.send(deleteCommand);

        return { success: true };
    } catch (error: any) {
        console.error('S3 Delete Project Error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * List all files in a project
 */
export async function listProjectFiles(
    userId: string,
    projectId: string
): Promise<{ success: boolean; files?: string[]; error?: string }> {
    try {
        const prefix = getProjectFolder(userId, projectId);
        
        const command = new ListObjectsV2Command({
            Bucket: S3_BUCKET_NAME,
            Prefix: prefix,
        });

        const response = await s3Client.send(command);
        
        const files = response.Contents?.map((obj: any) => {
            // Extract just the filename from the full key
            const fullKey = obj.Key || '';
            return fullKey.replace(prefix, '');
        }).filter((name: string) => name.length > 0) || [];

        return { success: true, files };
    } catch (error: any) {
        console.error('S3 List Files Error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Generate a signed URL for direct file access (expires in 1 hour)
 */
export async function getSignedFileUrl(
    userId: string,
    projectId: string,
    fileName: string
): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
        const key = generateS3Key(userId, projectId, fileName);
        
        const command = new GetObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: key,
        });

        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour

        return { success: true, url };
    } catch (error: any) {
        console.error('S3 Signed URL Error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Helper function to determine content type based on file extension
 */
function getContentType(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    
    const contentTypes: Record<string, string> = {
        'html': 'text/html',
        'css': 'text/css',
        'js': 'application/javascript',
        'json': 'application/json',
        'txt': 'text/plain',
        'md': 'text/markdown',
        'svg': 'image/svg+xml',
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'gif': 'image/gif',
        'ico': 'image/x-icon',
    };

    return contentTypes[ext || ''] || 'application/octet-stream';
}
