import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IConnectionRequest extends Document {
  _id: mongoose.Types.ObjectId
  senderId: mongoose.Types.ObjectId
  receiverId: mongoose.Types.ObjectId
  message: string
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: Date
  updatedAt: Date
}

const ConnectionRequestSchema = new Schema<IConnectionRequest>(
  {
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    message: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending', index: true },
  },
  { timestamps: true }
)

ConnectionRequestSchema.index({ senderId: 1, receiverId: 1 }, { unique: true })

export const ConnectionRequest: Model<IConnectionRequest> =
  mongoose.models.ConnectionRequest || mongoose.model<IConnectionRequest>('ConnectionRequest', ConnectionRequestSchema)
