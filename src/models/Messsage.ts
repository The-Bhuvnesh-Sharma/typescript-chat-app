import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMessage extends Document {
    sender: Types.ObjectId;
    content: string;
    chat: Types.ObjectId;
    isRead: boolean;
}

// plugin paginate

export interface IChatModel extends IMessage {
    _id: mongoose.Schema.Types.ObjectId;
}

const schema: Schema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
        content: {
            type: String,
            trim: true
        },
        chat: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'chat'
        },
        isRead: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

export default mongoose.model<IMessage>('message', schema);
