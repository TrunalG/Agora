'use client'

import React, { useEffect, useState } from 'react'
import { Bell, ChevronRight, Eye, EyeOff, KeyRound, Lock, Shield, User, ArrowLeft, Mail } from 'lucide-react'
import { ConfirmModal } from '@/components/ConfirmModal'

interface SettingsViewProps {
  me: any
  blocked: { id: string; name: string; username: string }[]
  unblock: (id: string) => void
  onDelete: () => void
  onUpdateSettings?: (data: any) => Promise<void>
}

type TabType = 'account' | 'security' | 'visibility' | 'privacy' | 'notifications'

export function SettingsView({ me, blocked, unblock, onDelete, onUpdateSettings }: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>('account')
  const [notifOn, setNotifOn] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  useEffect(() => {
    // Sync notification state from me object
    if (me) {
      setNotifOn(me.notificationPreference !== false)
    }
  }, [me])

  async function toggleNotif() {
    const nextVal = !notifOn
    setNotifOn(nextVal)
    if (onUpdateSettings) {
      await onUpdateSettings({ notificationPreference: nextVal })
    }
  }

  const sidebarItems: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'account', label: 'Account preferences', icon: <User className="size-4" /> },
    { id: 'security', label: 'Sign in & security', icon: <Lock className="size-4" /> },
    { id: 'visibility', label: 'Visibility settings', icon: <Eye className="size-4" /> },
    { id: 'privacy', label: 'Data privacy', icon: <Shield className="size-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="size-4" /> },
  ]

  return (
    <div className="mx-auto max-w-6xl min-h-[600px] flex flex-col md:flex-row gap-8 py-6">
      {/* Left Sidebar Menu */}
      <aside className="w-full md:w-68 shrink-0 bg-card rounded-xl border border-border p-5 h-fit shadow-xs">
        <h1 className="text-lg font-bold text-foreground mb-5 px-1 tracking-tight">
          Settings & Privacy
        </h1>
        <nav className="space-y-1">
          {sidebarItems.map((item) => {
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id)
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-xs font-semibold transition-all text-left ${
                  isActive
                    ? 'bg-primary/5 text-primary border-l-2 border-primary font-bold'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                <span className={isActive ? 'text-primary' : 'text-muted-foreground'}>{item.icon}</span>
                {item.label}
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 space-y-6">
        {activeTab === 'account' && (
          <div className="space-y-6">
            {/* Profile Information (Read-only) Section */}
            <div className="bg-card rounded-xl border border-border overflow-hidden shadow-xs">
              <div className="p-5 border-b border-border bg-slate-50/50">
                <h2 className="font-bold text-foreground text-sm tracking-tight">Profile Summary</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Your profile demographic info as shown to other members. Edits can be made directly in the Profile View.</p>
              </div>
              <div className="p-5 divide-y divide-border text-xs">
                <div className="flex items-center justify-between py-3">
                  <span className="text-muted-foreground font-medium">Name</span>
                  <span className="text-foreground font-bold">{me?.name || 'Not provided'}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-muted-foreground font-medium">Username</span>
                  <span className="text-foreground font-bold">@{me?.username}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-muted-foreground font-medium">Pronouns</span>
                  <span className="text-foreground font-bold">{me?.pronouns || 'Not specified'}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-muted-foreground font-medium">Country / Location</span>
                  <span className="text-foreground font-bold">{me?.location || me?.country || 'Global Learner'}</span>
                </div>
              </div>
            </div>

            {/* General Preferences (Read-only) Section */}
            <div className="bg-card rounded-xl border border-border overflow-hidden shadow-xs">
              <div className="p-5 border-b border-border bg-slate-50/50">
                <h2 className="font-bold text-foreground text-sm tracking-tight">General Preferences</h2>
              </div>
              <div className="p-5 text-xs">
                <div className="flex items-center justify-between py-1">
                  <span className="text-muted-foreground font-medium">Native Language</span>
                  <span className="text-foreground font-bold">{me?.language || 'English'}</span>
                </div>
              </div>
            </div>

            {/* Danger Zone Section */}
            <div className="bg-card rounded-xl border border-destructive/20 p-5 shadow-xs">
              <h2 className="font-bold text-destructive text-sm tracking-tight">Account Deletion</h2>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Closing your account will permanently delete all connections, messages, and profile data. This action cannot be reversed.</p>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="mt-4 rounded-lg border border-destructive/20 bg-destructive/5 px-4.5 py-2 text-xs font-bold text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
              >
                Delete Account
              </button>

              <ConfirmModal
                isOpen={isDeleteModalOpen}
                title="Delete Account Permanently"
                description="Are you sure you want to permanently delete your account? All connections, messages, and profile data will be erased immediately. This action cannot be undone."
                confirmText="Delete Account"
                variant="danger"
                onConfirm={onDelete}
                onClose={() => setIsDeleteModalOpen(false)}
              />
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="bg-card rounded-xl border border-border overflow-hidden shadow-xs">
            <div className="p-5 border-b border-border bg-slate-50/50">
              <h2 className="font-bold text-foreground text-sm tracking-tight">Sign in & Security</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Your login credentials for logging in securely.</p>
            </div>
            <div className="p-5 divide-y divide-border text-xs">
              <div className="flex items-center justify-between py-3">
                <span className="text-muted-foreground font-medium">Email address</span>
                <span className="text-foreground font-bold">{me?.email || 'user@example.com'}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-muted-foreground font-medium">Password</span>
                <div className="flex items-center gap-2">
                  <span className="text-foreground font-bold">{showPassword ? (typeof window !== 'undefined' ? sessionStorage.getItem('agora_demo_password') || 'PasswordHidden123' : 'PasswordHidden123') : '••••••••'}</span>
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="bg-card rounded-lg border border-border p-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-foreground">Notification Preferences</h2>
              <p className="text-sm text-muted-foreground mt-1">Manage how you receive alerts and updates for skill requests.</p>
            </div>
            <div className="flex items-center justify-between py-4 border-t border-border">
              <div>
                <span className="text-sm font-medium text-foreground">Activity Notifications</span>
                <p className="text-xs text-muted-foreground mt-0.5">Receive notifications when someone wants to exchange skills with you.</p>
              </div>
              <button
                onClick={toggleNotif}
                className={`px-4 py-2 text-sm font-semibold rounded-full border transition-colors cursor-pointer ${
                  notifOn
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-muted text-muted-foreground border-border hover:bg-muted/85'
                }`}
              >
                {notifOn ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="bg-card rounded-lg border border-border p-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-foreground">Data Privacy & Safety</h2>
              <p className="text-sm text-muted-foreground mt-1">Control your profile visibility and blocked user list.</p>
            </div>

            <div className="space-y-4 border-t border-border pt-4">
              <h3 className="text-sm font-semibold text-foreground">Blocked Profiles ({blocked.length})</h3>
              {blocked.length === 0 ? (
                <p className="text-sm text-muted-foreground">You have not blocked any users.</p>
              ) : (
                <div className="divide-y divide-border">
                  {blocked.map((b) => (
                    <div key={b.id} className="py-3 flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{b.name || b.username}</span>
                      <button
                        onClick={() => unblock(b.id)}
                        className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                      >
                        Unblock
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'visibility' && (
          <div className="bg-card rounded-lg border border-border p-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-foreground">Profile Visibility</h2>
              <p className="text-sm text-muted-foreground mt-1">Control whether your profile is public or private.</p>
            </div>
            <div className="flex items-center justify-between py-4 border-t border-border">
              <div>
                <span className="text-sm font-medium text-foreground">Profile Visibility Mode</span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Currently set to: <strong className="text-foreground capitalize">{me?.profileVisibility || 'public'}</strong>
                </p>
              </div>
              <button
                onClick={async () => {
                  const currentVisibility = me?.profileVisibility || 'public'
                  const nextVisibility = currentVisibility === 'public' ? 'private' : 'public'
                  if (onUpdateSettings) {
                    await onUpdateSettings({ profileVisibility: nextVisibility })
                  }
                }}
                className="px-4 py-2 text-sm font-semibold rounded-full border border-border hover:bg-muted transition-colors cursor-pointer text-foreground"
              >
                Change Visibility
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
