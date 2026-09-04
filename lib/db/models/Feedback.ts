import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IFeedback extends Document {
  _id: mongoose.Types.ObjectId
  questionCategory: string
  description: string
  rating: number
  submittedBy?: mongoose.Types.ObjectId | null
  createdAt: Date
  updatedAt: Date
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    questionCategory: { type: String, required: true },
    description: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    submittedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
)

export const Feedback: Model<IFeedback> =
  mongoose.models.Feedback || mongoose.model<IFeedback>('Feedback', FeedbackSchema)
