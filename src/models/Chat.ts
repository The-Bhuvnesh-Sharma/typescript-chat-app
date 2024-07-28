import mongoose, { Schema, Document, Types } from 'mongoose';
export interface IChat extends Document {
    chatName: string;
    isGroupChat: boolean;
    users: Array<Types.ObjectId>;
    lastMessage: string;
    groupAdmin: Types.ObjectId;
    unreadMessages: number;
}

export interface IChatModel extends IChat {
    _id: mongoose.Schema.Types.ObjectId;
}

const schema: Schema = new mongoose.Schema(
    {
        chatName: {
            type: String,
            trim: true
        },
        isGroupChat: {
            type: Boolean,
            default: false
        },
        users: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'user'
            }
        ],
        lastMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'message'
        },
        groupAdmin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

export default mongoose.model<IChat>('chat', schema);
