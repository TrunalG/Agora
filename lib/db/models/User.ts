import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId
  email: string
  passwordHash: string
  username: string
  name: string
  profileImage: string
  bio: string
  about: string
  country: string
  pronouns: string
  language: string
  profileVisibility: 'public' | 'private'
  skillsToLearn: string[]
  skillsToTeach: string[]
  links: string[]
  notificationPreference: boolean
  appearancePreference: 'light' | 'dark' | 'system'
  onboarded: boolean
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    name: { type: String, default: '' },
    profileImage: { type: String, default: '' },
    bio: { type: String, default: '' },
    about: { type: String, default: '' },
    country: { type: String, default: 'Anywhere' },
    pronouns: { type: String, default: '' },
    language: { type: String, default: 'English' },
    profileVisibility: { type: String, enum: ['public', 'private'], default: 'public' },
    skillsToLearn: { type: [String], default: [], index: true },
    skillsToTeach: { type: [String], default: [], index: true },
    links: {
      type: [String],
      default: [],
      validate: [(val: string[]) => val.length <= 5, 'Maximum 5 links allowed'],
    },
    notificationPreference: { type: Boolean, default: true },
    appearancePreference: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    onboarded: { type: Boolean, default: false },
  },
  { timestamps: true }
)

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
