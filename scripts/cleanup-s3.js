// AWS S3 Cleanup Script
// Run: node scripts/cleanup-s3.js

const { S3Client, ListObjectsV2Command, DeleteObjectsCommand } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'colabdev-project-files-2025';

async function cleanS3Bucket() {
  try {
    console.log(`🧹 Cleaning S3 bucket: ${BUCKET_NAME}`);

    // List all objects in the bucket
    const listCommand = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
    });

    const listResponse = await s3Client.send(listCommand);

    if (!listResponse.Contents || listResponse.Contents.length === 0) {
      console.log('✅ S3 bucket is already empty');
      return;
    }

    console.log(`📦 Found ${listResponse.Contents.length} objects to delete`);

    // Delete all objects
    const deleteCommand = new DeleteObjectsCommand({
      Bucket: BUCKET_NAME,
      Delete: {
        Objects: listResponse.Contents.map((obj) => ({ Key: obj.Key })),
        Quiet: false,
      },
    });

    const deleteResponse = await s3Client.send(deleteCommand);

    console.log(`✅ Deleted ${deleteResponse.Deleted?.length || 0} objects`);
    
    if (deleteResponse.Errors && deleteResponse.Errors.length > 0) {
      console.error('❌ Some objects failed to delete:', deleteResponse.Errors);
    } else {
      console.log('🎉 S3 bucket cleaned successfully!');
    }
  } catch (error) {
    console.error('❌ Error cleaning S3 bucket:', error);
    process.exit(1);
  }
}

cleanS3Bucket();
