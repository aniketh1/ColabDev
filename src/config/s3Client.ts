import { S3Client } from '@aws-sdk/client-s3';

// Configure S3 Client
export const s3Client = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

export const S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;

// Helper function to generate S3 key (file path in bucket)
export const generateS3Key = (userId: string, projectId: string, fileName: string) => {
    return `users/${userId}/projects/${projectId}/${fileName}`;
};

// Helper function to get project folder path
export const getProjectFolder = (userId: string, projectId: string) => {
    return `users/${userId}/projects/${projectId}/`;
};
