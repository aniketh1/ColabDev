import mongoose from "mongoose";

export interface IUser {
    _id? : mongoose.Types.ObjectId;
    clerkId : string; // Clerk user ID
    name : string;
    email : string;
    avatar? : string;
    createdAt? : Date;
    updatedAt? : Date;
}

const userSchema = new mongoose.Schema<IUser>({
    clerkId : { type : String, required : true, unique : true },
    name : { type : String , required : true},
    email : { type : String, required : true, unique : true },
    avatar : { type : String , default : ""}
},{
    timestamps : true
})

const UserModel = mongoose.models.User || mongoose.model<IUser>("User",userSchema)

export default UserModel
