import mongoose, { Schema, model, Types } from 'mongoose';

export const DOCUMENT_NAME = 'Role';
export const COLLECTION_NAME = 'roles';

export enum RoleCode {
    SUPERADMIN = 'SUPERADMIN',
    INFLUENCER = 'INFLUENCER',
    USER = 'USER',
    ADMIN = 'ADMIN'
}

export interface Role {
    _id: Types.ObjectId;
    code: string;
    status?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const schema = new Schema<Role>(
    {
        code: {
            type: Schema.Types.String,
            required: true,
            enum: Object.values(RoleCode)
        },
        status: {
            type: Schema.Types.Boolean,
            default: true
        }
    },
    {
        versionKey: false,
        timestamps: true
    }
);

schema.index({ code: 1, status: 1 });

export default mongoose.model<Role>('Role', schema);
