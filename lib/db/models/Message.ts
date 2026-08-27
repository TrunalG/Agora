import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IMessage extends Document {
  _id: mongoose.Types.ObjectId
  conversationId: mongoose.Types.ObjectId
  senderId: mongoose.Types.ObjectId
  content: string
  readAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
)

export const Message: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema)
