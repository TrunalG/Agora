import mongoose, { Schema, Document, Model } from 'mongoose'

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId
  recipientId: mongoose.Types.ObjectId
  type: 'connection_request' | 'connection_accepted' | 'new_message'
  referenceId?: string
  read: boolean
  createdAt: Date
  updatedAt: Date
}

const NotificationSchema = new Schema<INotification>(
  {
    recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['connection_request', 'connection_accepted', 'new_message'],
      required: true,
    },
    referenceId: { type: String, default: '' },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
)

export const Notification: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema)
