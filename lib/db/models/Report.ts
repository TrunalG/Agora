import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IReport extends Document {
  _id: mongoose.Types.ObjectId
  reporterId: mongoose.Types.ObjectId
  reportedUserId: mongoose.Types.ObjectId
  reason: string
  createdAt: Date
}

const ReportSchema = new Schema<IReport>(
  {
    reporterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reportedUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, required: true },
  },
  { timestamps: true }
)

export const Report: Model<IReport> =
  mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema)
