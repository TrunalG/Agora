"use client"

import Link from 'next/link'
import { useState } from 'react'
import {
  DashboardIcon,
  UsersIcon,
  FeedbackIcon,
  ShieldCheckIcon,
  BackArrowIcon
} from './AdminIcons'
import { Menu, X } from 'lucide-react'

interface AdminSidebarProps {
  activeTab: 'dashboard' | 'users' | 'feedback'
  setActiveTab: (tab: 'dashboard' | 'users' | 'feedback') => void
  user: {
    name: string
    email: string
    username: string
    profileImage?: string
  }
}

export default function AdminSidebar({ activeTab, setActiveTab, user }: AdminSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
    { id: 'users', label: 'Manage Users', icon: UsersIcon },
    { id: 'feedback', label: 'View Feedback', icon: FeedbackIcon },
  ] as const

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2.5 bg-card border border-border rounded-xl shadow-sm text-foreground hover:bg-muted/50 transition-colors flex items-center justify-center"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Overlay Backdrop for Mobile */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 bg-card border-r border-border flex flex-col justify-between z-40 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 space-y-8">
          {/* App Brand Header */}
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold shadow-sm">
              <ShieldCheckIcon className="size-6 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-foreground tracking-tight">Agora Admin</h2>
              <p className="text-xs text-muted-foreground font-medium">Management Hub</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <p className="px-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Menu
            </p>
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id)
                    setMobileOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                  }`}
                >
                  <Icon className={`size-5 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* User Profile & Back to App Footer */}
        <div className="p-4 border-t border-border space-y-3 bg-muted/10">
          <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg">
            <img
              src={user.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
              alt={user.name}
              className="size-9 rounded-full ring-2 ring-primary/20 object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">Admin Account</p>
            </div>
          </div>

          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-border bg-card text-xs font-semibold text-foreground hover:bg-muted/40 transition-colors shadow-xs"
          >
            <BackArrowIcon className="size-4 text-muted-foreground" />
            <span>Back to Agora App</span>
          </Link>
        </div>
      </aside>
    </>
  )
}
