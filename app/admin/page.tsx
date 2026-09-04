import { redirect } from 'next/navigation'
import { getAuthSession } from '@/lib/auth'
import { connectDB } from '@/lib/db/mongodb'
import { User } from '@/lib/db/models/User'
import { Feedback } from '@/lib/db/models/Feedback'
import { Users, MessageSquare, AlertTriangle, ShieldCheck } from 'lucide-react'
import AdminTabs from './AdminTabs'

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

  // Fetch metrics
  const totalUsers = await User.countDocuments()
  const activeUsers = await User.countDocuments({ status: 'active' })
  const blockedUsers = await User.countDocuments({ status: 'blocked' })
  const warnedUsers = await User.countDocuments({ status: 'warned' })
  const totalFeedback = await Feedback.countDocuments()

  // Fetch all users for management table
  const allUsers = await User.find().sort({ createdAt: -1 }).select('-passwordHash').lean()
  
  // Fetch all feedback
  const allFeedback = await Feedback.find().populate('submittedBy', 'name email').sort({ createdAt: -1 }).lean()

  return (
    <div className="min-h-screen bg-muted/20 text-foreground pb-20">
      {/* Admin Header */}
      <header className="bg-card border-b border-border py-6 px-4 sm:px-6 lg:px-8 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="size-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Admin Panel</h1>
              <p className="text-xs text-muted-foreground">Agora Platform Management</p>
            </div>
          </div>
          <div className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
            Welcome, {user.name}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* Top Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Total Users</h3>
              <Users className="size-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold">{totalUsers}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Active Users</h3>
              <div className="size-5 bg-green-500/20 rounded-full flex items-center justify-center">
                <div className="size-2.5 bg-green-500 rounded-full"></div>
              </div>
            </div>
            <p className="text-3xl font-bold">{activeUsers}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Warnings/Blocks</h3>
              <AlertTriangle className="size-5 text-orange-500" />
            </div>
            <p className="text-3xl font-bold">{warnedUsers + blockedUsers}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Total Feedback</h3>
              <MessageSquare className="size-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold">{totalFeedback}</p>
          </div>
        </div>

        {/* Admin Tabs Component (Client side for interactivity) */}
        <AdminTabs users={JSON.parse(JSON.stringify(allUsers))} feedbacks={JSON.parse(JSON.stringify(allFeedback))} />

      </main>
    </div>
  )
}
