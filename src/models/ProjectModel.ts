import mongoose from "mongoose";

export interface IProject {
    _id? : mongoose.Types.ObjectId;
    name : string;
    userId : mongoose.Types.ObjectId,
    techStack? : string,
    collaborators? : mongoose.Types.ObjectId[],
    isPublic? : boolean,
    lastActiveAt? : Date,
    createdAt? : Date
    updatedAt? : Date
}

const projectSchema = new mongoose.Schema<IProject>({
    name : {
        type : String,
        required : true
    },
    userId : {
        type : mongoose.Schema.ObjectId,
        ref : 'User',
        required : true
    },
    techStack : {
        type : String,
        default : 'html',
        enum : ['html', 'react', 'node', 'nextjs']
    },
    collaborators : [{
        type : mongoose.Schema.ObjectId,
        ref : 'User'
    }],
    isPublic : {
        type : Boolean,
        default : true
    },
    lastActiveAt : {
        type : Date,
        default : Date.now
    }
},{
    timestamps : true
})

const ProjectModel = mongoose.models.Project || mongoose.model<IProject>('Project',projectSchema)


export default ProjectModel