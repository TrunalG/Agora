"use client"

import { useState } from 'react'
import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'
import AdminTabs from './AdminTabs'

interface AdminDashboardClientProps {
  user: any
  allUsers: any[]
  allFeedback: any[]
}

export default function AdminDashboardClient({ user, allUsers, allFeedback }: AdminDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'feedback'>('dashboard')

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar Navigation */}
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} />

      {/* Main Body (Shifted right on desktop for 64 / 16rem sidebar) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Header */}
        <AdminHeader user={user} />

        {/* Content Container */}
        <main className="p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto space-y-8">
          <AdminTabs
            users={allUsers}
            feedbacks={allFeedback}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </main>
      </div>
    </div>
  )
}
