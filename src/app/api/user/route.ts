import { NextResponse } from "next/server";
import { connectDB } from "@/config/connectDB";
import { auth } from "@clerk/nextjs/server";
import UserModel from "@/models/User";
import { getCurrentUserId } from "@/lib/clerk";

export async function GET(){
    try{
        const { userId: clerkUserId } = await auth();

        if (!clerkUserId) {
            return NextResponse.json(
                { error : "Unauthorized"},
                { status  : 401 }
            )
        }

        await connectDB()

        const userId = await getCurrentUserId();
        if (!userId) {
            return NextResponse.json({ error: "User not found in database" }, { status: 404 });
        }

        const user = await UserModel.findById(userId)

    
        return NextResponse.json(
            { 
                message : "user details",
                data : user
            },
            { status : 200 }
        )

    }catch(error){
        return NextResponse.json(
            { error : "Something went wrong"},
            { status : 500 }
        )
    }
}