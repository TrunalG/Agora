import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IConversation extends Document {
  _id: mongoose.Types.ObjectId
  participants: mongoose.Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const ConversationSchema = new Schema<IConversation>(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true, index: true }],
  },
  { timestamps: true }
)

export const Conversation: Model<IConversation> =
  mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', ConversationSchema)
