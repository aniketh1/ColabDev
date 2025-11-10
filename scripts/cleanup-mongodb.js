// MongoDB Cleanup Script
// Run this in MongoDB Compass or MongoDB Shell

// Connect to your database
use('Cluster0'); // Replace with your database name

// Delete all users
db.users.deleteMany({});
console.log('✅ All users deleted');

// Delete all projects
db.projects.deleteMany({});
console.log('✅ All projects deleted');

// Delete all files
db.files.deleteMany({});
console.log('✅ All files deleted');

// Optional: Delete other collections if they exist
// db.collaborators.deleteMany({});
// db.sessions.deleteMany({});

console.log('🎉 MongoDB cleaned successfully!');
