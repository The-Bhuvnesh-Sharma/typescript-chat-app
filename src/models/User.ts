import mongoose, { Schema, Document } from 'mongoose';
export interface IUser extends Document {
    email: string;
    first_name: string;
    last_name: string;
    image: string;
}

export interface IUserModel extends IUser {
    _id: mongoose.Schema.Types.ObjectId;
}

const schema: Schema = new mongoose.Schema(
    {
        first_name: {
            type: String
        },
        last_name: {
            type: String
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        image: {
            type: String,
            required: true
        },
        status: {
            type: Number,
            default: 0
        },
        last_seen: {
            type: Date
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

export default mongoose.model<IUser>('user', schema);
