import { currentUser } from '@clerk/nextjs/server';
import { connectDB } from '@/config/connectDB';
import User from '@/models/User';

/**
 * Get the current authenticated user from Clerk and sync with MongoDB
 */
export async function getCurrentUser() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return null;
  }

  try {
    await connectDB();

    // Find or create user in MongoDB
    let user = await User.findOne({ clerkId: clerkUser.id });

    if (!user) {
      // Create user if doesn't exist
      const email = clerkUser.emailAddresses[0]?.emailAddress;
      const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 
                   email?.split('@')[0] || 'User';

      user = await User.create({
        clerkId: clerkUser.id,
        email: email,
        name: name,
        avatar: clerkUser.imageUrl || '',
      });

      console.log('✅ New user created from Clerk:', { clerkId: clerkUser.id, email });
    }

    return {
      id: user._id.toString(),
      clerkId: user.clerkId,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    };
  } catch (error) {
    console.error('❌ Error getting current user:', error);
    return null;
  }
}

/**
 * Get just the Clerk user ID (faster, no DB call)
 */
export async function getCurrentUserId() {
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    return null;
  }

  try {
    await connectDB();
    const user = await User.findOne({ clerkId: clerkUser.id });
    return user?._id.toString() || null;
  } catch (error) {
    console.error('❌ Error getting current user ID:', error);
    return null;
  }
}
