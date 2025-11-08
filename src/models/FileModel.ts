import mongoose from "mongoose";

export interface IFile {
    _id? : mongoose.Types.ObjectId;
    name : string;
    extension? : string;
    content : string;
    projectId : mongoose.Types.ObjectId;
    s3Key? : string; // S3 file path (optional)
    storageType? : 'mongodb' | 's3'; // Where the content is stored
    createdAt? : Date;
    updatedAt? : Date
}

const fileSchema = new mongoose.Schema<IFile>({
    name : {
        type : String,
        required : true,
    }, 
    content : {
        type : String,
        default : ""
    },
    extension : {
        type : String,
    },
    projectId : {
        type : mongoose.Schema.ObjectId,
        ref : 'Project'
    },
    s3Key : {
        type : String,
        required : false,
    },
    storageType : {
        type : String,
        enum : ['mongodb', 's3'],
        default : 's3' // Default to S3 storage for new files
    }
},{
    timestamps : true
})

fileSchema.pre('save',function(){
    if(this.isModified('name')){
        const extArray = this?.name?.toString().split(".")
        const extension = extArray[extArray.length - 1]
        this.extension = extension
    }
})


const FileModel = mongoose.models.File || mongoose.model<IFile>("File",fileSchema)

export default FileModel