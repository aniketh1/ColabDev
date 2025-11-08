/**
 * Database Fix Script
 * This script removes the problematic fileId index from the files collection
 * Run this once to fix the MongoDB duplicate key error
 */

const mongoose = require('mongoose');

// Your MongoDB connection string
const MONGODB_URI = 'mongodb+srv://aniketkorwa:colabDev@cluster0.e7xcg8n.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function fixDatabase() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✓ Connected to MongoDB');

        const db = mongoose.connection.db;
        
        // Fix Files Collection
        console.log('\n=== FIXING FILES COLLECTION ===');
        const filesCollection = db.collection('files');
        
        console.log('\nChecking existing indexes on files collection...');
        const filesIndexes = await filesCollection.indexes();
        console.log('Current indexes:', filesIndexes);
        
        const filesToDrop = [
            'fileId_1',
            'filePath_1_projectId_1',
            'path_1',
            'roomId_1',
            'roomId_1_path_1',
            'roomId_1_parentFolderId_1'
        ];
        
        for (const indexName of filesToDrop) {
            try {
                await filesCollection.dropIndex(indexName);
                console.log(`✓ Successfully dropped ${indexName} index from files`);
            } catch (error) {
                if (error.code === 27) {
                    console.log(`ℹ ${indexName} index does not exist in files (skipping)`);
                } else {
                    console.log(`⚠ Error dropping ${indexName}:`, error.message);
                }
            }
        }
        
        console.log('\nFinal files indexes:');
        const finalFilesIndexes = await filesCollection.indexes();
        console.log(finalFilesIndexes);

        // Fix Users Collection
        console.log('\n=== FIXING USERS COLLECTION ===');
        const usersCollection = db.collection('users');
        
        console.log('\nChecking existing indexes on users collection...');
        const usersIndexes = await usersCollection.indexes();
        console.log('Current indexes:', usersIndexes);
        
        const usersToDrop = [
            'userId_1'
        ];
        
        for (const indexName of usersToDrop) {
            try {
                await usersCollection.dropIndex(indexName);
                console.log(`✓ Successfully dropped ${indexName} index from users`);
            } catch (error) {
                if (error.code === 27) {
                    console.log(`ℹ ${indexName} index does not exist in users (skipping)`);
                } else {
                    console.log(`⚠ Error dropping ${indexName}:`, error.message);
                }
            }
        }
        
        console.log('\nFinal users indexes:');
        const finalUsersIndexes = await usersCollection.indexes();
        console.log(finalUsersIndexes);

        // Fix Projects Collection
        console.log('\n=== FIXING PROJECTS COLLECTION ===');
        const projectsCollection = db.collection('projects');
        
        console.log('\nChecking existing indexes on projects collection...');
        const projectsIndexes = await projectsCollection.indexes();
        console.log('Current indexes:', projectsIndexes);
        
        const projectsToDrop = [
            'projectId_1',
            'roomId_1'
        ];
        
        for (const indexName of projectsToDrop) {
            try {
                await projectsCollection.dropIndex(indexName);
                console.log(`✓ Successfully dropped ${indexName} index from projects`);
            } catch (error) {
                if (error.code === 27) {
                    console.log(`ℹ ${indexName} index does not exist in projects (skipping)`);
                } else {
                    console.log(`⚠ Error dropping ${indexName}:`, error.message);
                }
            }
        }
        
        console.log('\nFinal projects indexes:');
        const finalProjectsIndexes = await projectsCollection.indexes();
        console.log(finalProjectsIndexes);

        // Check for any documents with old fields (shouldn't exist)
        console.log('\n=== CHECKING FOR OLD FIELD DATA ===');
        const usersWithUserId = await usersCollection.countDocuments({ userId: { $exists: true } });
        console.log(`Found ${usersWithUserId} user documents with old 'userId' field`);
        
        if (usersWithUserId > 0) {
            console.log('Removing old userId fields from user documents...');
            const result = await usersCollection.updateMany(
                { userId: { $exists: true } },
                { $unset: { userId: "" } }
            );
            console.log(`✓ Updated ${result.modifiedCount} user documents`);
        }
        
        const projectsWithProjectId = await projectsCollection.countDocuments({ projectId: { $exists: true } });
        console.log(`Found ${projectsWithProjectId} project documents with old 'projectId' field`);
        
        if (projectsWithProjectId > 0) {
            console.log('Removing old projectId fields from project documents...');
            const result = await projectsCollection.updateMany(
                { projectId: { $exists: true } },
                { $unset: { projectId: "" } }
            );
            console.log(`✓ Updated ${result.modifiedCount} project documents`);
        }
        
        console.log('\n✓ Database fix completed successfully!');
        console.log('You can now create projects and register users without errors.');
        
    } catch (error) {
        console.error('✗ Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n✓ Database connection closed');
    }
}

fixDatabase();
