import { redirect } from 'next/navigation'
import { getAuthSession } from '@/lib/auth'
import { connectDB } from '@/lib/db/mongodb'
import { User } from '@/lib/db/models/User'
import { Feedback } from '@/lib/db/models/Feedback'
import AdminDashboardClient from './AdminDashboardClient'

export const metadata = {
  title: 'Admin Dashboard | Agora',
}

export default async function AdminDashboard() {
  const auth = await getAuthSession()
  if (!auth) {
    redirect('/')
  }

  await connectDB()

  const user = await User.findById(auth.userId)
  if (!user || user.role !== 'admin') {
    redirect('/')
  }

  // Fetch all users for management table
  const allUsers = await User.find().sort({ createdAt: -1 }).select('-passwordHash').lean()
  
  // Fetch all feedback
  const allFeedback = await Feedback.find().populate('submittedBy', 'name email').sort({ createdAt: -1 }).lean()

  return (
    <AdminDashboardClient
      user={JSON.parse(JSON.stringify(user))}
      allUsers={JSON.parse(JSON.stringify(allUsers))}
      allFeedback={JSON.parse(JSON.stringify(allFeedback))}
    />
  )
}
