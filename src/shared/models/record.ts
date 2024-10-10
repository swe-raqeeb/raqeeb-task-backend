import mongoose, { Schema, Document } from 'mongoose';
import { StatusEnum } from '../enums';

export interface IRecord extends Document {
    url: string,
    username: string,
    password: string,
    leaked_sources: number,
    status: string
    created_at: Date,
    modified_at: Date,
}

const RecordSchema: Schema = new Schema({
    url: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    leaked_sources: { type: Number, required: true },
    created_at: { type: Date, required: false },
    modified_at: { type: Date, required: false },
    status: {
        type: String,
        enum: Object.values(StatusEnum),
        default: StatusEnum.PENDING
    },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'modified_at' }

});


// Add indexes to optimize queries
RecordSchema.index({ username: 1 });
RecordSchema.index({ created_at: 1 });
RecordSchema.index({ status: 1 });
RecordSchema.index({ leaked_sources: 1 });
RecordSchema.index({ username: 1, status: 1 });
RecordSchema.index({ created_at: 1, status: 1, username: 1 });
RecordSchema.index({ username: 'text', url: 'text' });


export const Record = mongoose.model<IRecord>('Record', RecordSchema);