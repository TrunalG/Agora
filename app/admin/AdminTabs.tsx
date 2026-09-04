"use client"

import { useState, useMemo, useEffect } from 'react'
import {
  UsersIcon,
  FeedbackIcon,
  SearchIcon,
  FilterIcon,
  WarnIcon,
  BlockIcon,
  DeleteIcon,
  StarIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from './AdminIcons'
import { ConfirmModal } from '@/components/ConfirmModal'

interface AdminTabsProps {
  users: any[]
  feedbacks: any[]
  activeTab: 'dashboard' | 'users' | 'feedback'
  setActiveTab: (tab: 'dashboard' | 'users' | 'feedback') => void
}

const USERS_PER_PAGE = 8
const FEEDBACK_PER_PAGE = 9

export default function AdminTabs({ users, feedbacks, activeTab, setActiveTab }: AdminTabsProps) {
  const [userList, setUserList] = useState(users)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'warned' | 'blocked'>('all')
  const [feedbackCategoryFilter, setFeedbackCategoryFilter] = useState<string>('all')

  // Modal confirmation state
  const [pendingAction, setPendingAction] = useState<{
    userId: string
    userName: string
    action: 'warn' | 'block' | 'delete'
  } | null>(null)

  // Notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Pagination states
  const [usersPage, setUsersPage] = useState(1)
  const [feedbackPage, setFeedbackPage] = useState(1)

  // Reset pagination when search or filters change
  useEffect(() => {
    setUsersPage(1)
  }, [searchQuery, statusFilter])

  useEffect(() => {
    setFeedbackPage(1)
  }, [feedbackCategoryFilter])

  // Clear toast after 3s
  useEffect(() => {
    if (toastMessage) {
      const t = setTimeout(() => setToastMessage(null), 3000)
      return () => clearTimeout(t)
    }
  }, [toastMessage])

  // Calculate top metrics
  const totalUsers = userList.length
  const activeUsers = userList.filter((u) => u.status === 'active').length
  const warnedUsers = userList.filter((u) => u.status === 'warned').length
  const blockedUsers = userList.filter((u) => u.status === 'blocked').length
  const totalFeedback = feedbacks.length

  // Feedback categories
  const categories = useMemo(() => {
    const cats = new Set(feedbacks.map((f) => f.questionCategory).filter(Boolean))
    return ['all', ...Array.from(cats)]
  }, [feedbacks])

  const executeAction = async () => {
    if (!pendingAction) return
    const { userId, action, userName } = pendingAction

    try {
      const res = await fetch(`/api/admin/users/${userId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })
      if (res.ok) {
        const data = await res.json()
        if (action === 'delete') {
          setUserList((prev) => prev.filter((u) => u._id !== userId))
          setToastMessage(`Account for ${userName} permanently deleted.`)
        } else {
          setUserList((prev) =>
            prev.map((u) =>
              u._id === userId ? { ...u, status: data.status, warningCount: data.warningCount } : u
            )
          )
          setToastMessage(`User ${userName} status updated to '${data.status}'.`)
        }
      } else {
        setToastMessage(`Failed to update ${userName}.`)
      }
    } catch (error) {
      setToastMessage('Error performing action.')
    } finally {
      setPendingAction(null)
    }
  }

  // Filtered users for table
  const filteredUsers = useMemo(() => {
    return userList.filter((u) => {
      const matchesSearch =
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.username?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === 'all' || u.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [userList, searchQuery, statusFilter])

  // Paginated users
  const totalUsersPages = Math.max(1, Math.ceil(filteredUsers.length / USERS_PER_PAGE))
  const paginatedUsers = useMemo(() => {
    const start = (usersPage - 1) * USERS_PER_PAGE
    return filteredUsers.slice(start, start + USERS_PER_PAGE)
  }, [filteredUsers, usersPage])

  // Filtered feedback list
  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter((f) => {
      return feedbackCategoryFilter === 'all' || f.questionCategory === feedbackCategoryFilter
    })
  }, [feedbacks, feedbackCategoryFilter])

  // Paginated feedback
  const totalFeedbackPages = Math.max(1, Math.ceil(filteredFeedbacks.length / FEEDBACK_PER_PAGE))
  const paginatedFeedbacks = useMemo(() => {
    const start = (feedbackPage - 1) * FEEDBACK_PER_PAGE
    return filteredFeedbacks.slice(start, start + FEEDBACK_PER_PAGE)
  }, [filteredFeedbacks, feedbackPage])

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-foreground text-background text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl animate-in slide-in-from-bottom-5 duration-200">
          {toastMessage}
        </div>
      )}

      {/* Confirmation Modal Dialog */}
      <ConfirmModal
        isOpen={!!pendingAction}
        title={
          pendingAction?.action === 'delete'
            ? 'Delete User Account'
            : pendingAction?.action === 'block'
            ? 'Block User Access'
            : 'Issue User Warning'
        }
        description={
          pendingAction?.action === 'delete'
            ? `Are you sure you want to permanently delete the account for ${pendingAction?.userName}? This action cannot be undone.`
            : pendingAction?.action === 'block'
            ? `Are you sure you want to block ${pendingAction?.userName}? They will be restricted from logging in and accessing platform features.`
            : `Are you sure you want to issue a warning to ${pendingAction?.userName}? Their warning count will be incremented.`
        }
        confirmText={
          pendingAction?.action === 'delete'
            ? 'Delete Account'
            : pendingAction?.action === 'block'
            ? 'Block User'
            : 'Issue Warning'
        }
        variant={pendingAction?.action === 'delete' || pendingAction?.action === 'block' ? 'danger' : 'warning'}
        onConfirm={executeAction}
        onClose={() => setPendingAction(null)}
      />

      {/* ========================================================================= */}
      {/* 1. DASHBOARD VIEW */}
      {/* ========================================================================= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Top Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-xl p-5 shadow-2xs hover:border-primary/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Total Users
                </span>
                <UsersIcon className="size-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold text-foreground mt-3 tracking-tight">{totalUsers}</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 shadow-2xs hover:border-primary/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Active Users
                </span>
                <span className="size-2 rounded-full bg-emerald-500" />
              </div>
              <p className="text-2xl font-bold text-foreground mt-3 tracking-tight">{activeUsers}</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 shadow-2xs hover:border-primary/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Warned / Blocked
                </span>
                <WarnIcon className="size-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold text-foreground mt-3 tracking-tight">
                {warnedUsers + blockedUsers}
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 shadow-2xs hover:border-primary/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Feedback Received
                </span>
                <FeedbackIcon className="size-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold text-foreground mt-3 tracking-tight">{totalFeedback}</p>
            </div>
          </div>

          {/* Main 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User Management Table (2/3 Width) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-card border border-border rounded-xl shadow-2xs overflow-hidden">
                <div className="p-5 border-b border-border space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-bold text-foreground">User Directory</h2>
                      <p className="text-xs text-muted-foreground">Manage platform user accounts and permissions.</p>
                    </div>
                    {/* Search Bar */}
                    <div className="relative w-full sm:w-60">
                      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search users..."
                        className="w-full pl-8 pr-3 py-1.5 bg-muted/20 border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-primary transition-colors"
                      />
                    </div>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 pt-2 border-t border-border/40 overflow-x-auto">
                    <span className="text-xs text-muted-foreground font-medium mr-1 flex items-center gap-1">
                      <FilterIcon className="size-3" /> Status:
                    </span>
                    {(['all', 'active', 'warned', 'blocked'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => setStatusFilter(st)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize transition-colors ${
                          statusFilter === st
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="text-[11px] font-semibold text-muted-foreground uppercase bg-muted/30 border-b border-border">
                      <tr>
                        <th className="px-5 py-3">User</th>
                        <th className="px-5 py-3">Email</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3 text-center">Warnings</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {paginatedUsers.map((u) => (
                        <tr key={u._id} className="hover:bg-muted/20 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={
                                  u.profileImage ||
                                  `https://api.dicebear.com/7.x/initials/svg?seed=${u.name}`
                                }
                                alt=""
                                className="size-7 rounded-full object-cover border border-border"
                              />
                              <div>
                                <p className="font-semibold text-foreground leading-tight">
                                  {u.name || 'Anonymous'}
                                </p>
                                <p className="text-[11px] text-muted-foreground">@{u.username}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-muted-foreground">{u.email}</td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-md ${
                                u.status === 'active'
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                  : u.status === 'warned'
                                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                  : 'bg-red-500/10 text-red-600 dark:text-red-400'
                              }`}
                            >
                              {u.status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-center font-medium text-foreground">
                            {u.warningCount || 0}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => setPendingAction({ userId: u._id, userName: u.name || 'Anonymous', action: 'warn' })}
                                className="p-1.5 text-muted-foreground hover:text-amber-500 hover:bg-muted/40 rounded-md transition-colors"
                                title="Warn User"
                              >
                                <WarnIcon className="size-3.5" />
                              </button>
                              <button
                                onClick={() => setPendingAction({ userId: u._id, userName: u.name || 'Anonymous', action: 'block' })}
                                className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-muted/40 rounded-md transition-colors"
                                title="Block User"
                              >
                                <BlockIcon className="size-3.5" />
                              </button>
                              <button
                                onClick={() => setPendingAction({ userId: u._id, userName: u.name || 'Anonymous', action: 'delete' })}
                                className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-muted/40 rounded-md transition-colors"
                                title="Delete Account"
                              >
                                <DeleteIcon className="size-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {paginatedUsers.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">
                            No users found matching filter.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Users Pagination Controls */}
                <div className="p-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    Showing {filteredUsers.length === 0 ? 0 : (usersPage - 1) * USERS_PER_PAGE + 1} to{' '}
                    {Math.min(usersPage * USERS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length} users
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={usersPage === 1}
                      onClick={() => setUsersPage((p) => Math.max(1, p - 1))}
                      className="p-1.5 border border-border rounded-md hover:bg-muted/40 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                    >
                      <ChevronLeftIcon className="size-4" />
                    </button>
                    <span className="font-semibold text-foreground">
                      {usersPage} / {totalUsersPages}
                    </span>
                    <button
                      disabled={usersPage >= totalUsersPages}
                      onClick={() => setUsersPage((p) => Math.min(totalUsersPages, p + 1))}
                      className="p-1.5 border border-border rounded-md hover:bg-muted/40 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                    >
                      <ChevronRightIcon className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Feedback Feed (1/3 Width) */}
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-xl p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <FeedbackIcon className="size-4 text-muted-foreground" /> Recent Feedback
                  </h3>
                  <button
                    onClick={() => setActiveTab('feedback')}
                    className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    View All
                  </button>
                </div>

                <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                  {feedbacks.slice(0, 5).map((f) => (
                    <div
                      key={f._id}
                      className="p-3.5 bg-muted/10 border border-border/60 rounded-lg space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-medium bg-muted/40 text-muted-foreground px-2 py-0.5 rounded-md">
                          {f.questionCategory || 'General'}
                        </span>
                        <div className="flex text-amber-400 text-xs">
                          {Array.from({ length: f.rating || 5 }).map((_, i) => (
                            <StarIcon key={i} className="size-3 text-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-foreground leading-normal line-clamp-3">
                        "{f.description}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MANAGE USERS VIEW */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* User Stat Summary Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total Accounts</p>
                <p className="text-xl font-bold text-foreground mt-0.5">{totalUsers}</p>
              </div>
              <UsersIcon className="size-5 text-muted-foreground" />
            </div>
            <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Active</p>
                <p className="text-xl font-bold text-foreground mt-0.5">{activeUsers}</p>
              </div>
              <span className="size-2 rounded-full bg-emerald-500" />
            </div>
            <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Warned</p>
                <p className="text-xl font-bold text-foreground mt-0.5">{warnedUsers}</p>
              </div>
              <WarnIcon className="size-5 text-muted-foreground" />
            </div>
            <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Blocked</p>
                <p className="text-xl font-bold text-foreground mt-0.5">{blockedUsers}</p>
              </div>
              <BlockIcon className="size-5 text-muted-foreground" />
            </div>
          </div>

          {/* Full Width User Table Card */}
          <div className="bg-card border border-border rounded-xl shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-border space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <UsersIcon className="size-5 text-muted-foreground" /> User Directory
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Inspect user profiles, manage warnings, block bad actors, or delete accounts.
                  </p>
                </div>
                {/* Search Bar */}
                <div className="relative w-full sm:w-72">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, email, or @username..."
                    className="w-full pl-8 pr-3 py-1.5 bg-muted/20 border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {/* Status Filter Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-border/40">
                <span className="text-xs text-muted-foreground font-medium mr-1 flex items-center gap-1">
                  <FilterIcon className="size-3" /> Status:
                </span>
                {(['all', 'active', 'warned', 'blocked'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-colors ${
                      statusFilter === st
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] font-semibold text-muted-foreground uppercase bg-muted/30 border-b border-border">
                  <tr>
                    <th className="px-5 py-3">User Profile</th>
                    <th className="px-5 py-3">Email Address</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-center">Warnings</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginatedUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              u.profileImage ||
                              `https://api.dicebear.com/7.x/initials/svg?seed=${u.name}`
                            }
                            alt=""
                            className="size-8 rounded-full object-cover border border-border"
                          />
                          <div>
                            <p className="font-semibold text-foreground">{u.name || 'Anonymous'}</p>
                            <p className="text-[11px] text-muted-foreground">@{u.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground">{u.email}</td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-medium rounded-md ${
                            u.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : u.status === 'warned'
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                              : 'bg-red-500/10 text-red-600 dark:text-red-400'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center font-medium text-foreground">
                        {u.warningCount || 0}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setPendingAction({ userId: u._id, userName: u.name || 'Anonymous', action: 'warn' })}
                            className="px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:text-amber-600 bg-muted/30 hover:bg-amber-500/10 rounded-md transition-colors flex items-center gap-1"
                          >
                            <WarnIcon className="size-3" /> Warn
                          </button>
                          <button
                            onClick={() => setPendingAction({ userId: u._id, userName: u.name || 'Anonymous', action: 'block' })}
                            className="px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:text-red-600 bg-muted/30 hover:bg-red-500/10 rounded-md transition-colors flex items-center gap-1"
                          >
                            <BlockIcon className="size-3" /> Block
                          </button>
                          <button
                            onClick={() => setPendingAction({ userId: u._id, userName: u.name || 'Anonymous', action: 'delete' })}
                            className="px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:text-red-700 bg-muted/30 hover:bg-red-600/10 rounded-md transition-colors flex items-center gap-1"
                          >
                            <DeleteIcon className="size-3" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paginatedUsers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">
                        No users found matching filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Users Pagination Footer */}
            <div className="p-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Showing {filteredUsers.length === 0 ? 0 : (usersPage - 1) * USERS_PER_PAGE + 1} to{' '}
                {Math.min(usersPage * USERS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length} users
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={usersPage === 1}
                  onClick={() => setUsersPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 border border-border rounded-md hover:bg-muted/40 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                >
                  <ChevronLeftIcon className="size-4" />
                </button>
                <span className="font-semibold text-foreground">
                  Page {usersPage} of {totalUsersPages}
                </span>
                <button
                  disabled={usersPage >= totalUsersPages}
                  onClick={() => setUsersPage((p) => Math.min(totalUsersPages, p + 1))}
                  className="p-1.5 border border-border rounded-md hover:bg-muted/40 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                >
                  <ChevronRightIcon className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. VIEW FEEDBACK VIEW */}
      {/* ========================================================================= */}
      {activeTab === 'feedback' && (
        <div className="space-y-6">
          {/* Header Bar & Category Filter */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <FeedbackIcon className="size-5 text-muted-foreground" /> Platform Feedback
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Review user feedback, ratings, and feature requests.
                </p>
              </div>
              <div className="text-xs font-medium text-muted-foreground">
                {totalFeedback} Submissions Received
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 pt-2 border-t border-border/40 overflow-x-auto">
              <span className="text-xs text-muted-foreground font-medium mr-1 flex items-center gap-1">
                <FilterIcon className="size-3" /> Category:
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFeedbackCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-colors ${
                    feedbackCategoryFilter === cat
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedFeedbacks.map((f) => (
              <div
                key={f._id}
                className="bg-card border border-border rounded-xl p-5 shadow-2xs hover:border-primary/40 transition-colors flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-medium bg-muted/40 text-muted-foreground px-2 py-0.5 rounded-md">
                      {f.questionCategory || 'General'}
                    </span>
                    <div className="flex text-amber-400 text-xs">
                      {Array.from({ length: f.rating || 5 }).map((_, i) => (
                        <StarIcon key={i} className="size-3.5 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                    "{f.description}"
                  </p>
                </div>

                <div className="pt-2.5 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="font-medium text-foreground truncate">
                    {f.submittedBy ? `${f.submittedBy.name} (${f.submittedBy.email})` : 'Anonymous Visitor'}
                  </span>
                  <span suppressHydrationWarning className="shrink-0 font-medium">
                    {f.createdAt ? new Date(f.createdAt).toISOString().split('T')[0] : ''}
                  </span>
                </div>
              </div>
            ))}

            {paginatedFeedbacks.length === 0 && (
              <div className="col-span-full bg-card border border-border rounded-xl p-8 text-center text-xs text-muted-foreground">
                No feedback found for this category filter.
              </div>
            )}
          </div>

          {/* Feedback Pagination Footer */}
          {filteredFeedbacks.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Showing {(feedbackPage - 1) * FEEDBACK_PER_PAGE + 1} to{' '}
                {Math.min(feedbackPage * FEEDBACK_PER_PAGE, filteredFeedbacks.length)} of {filteredFeedbacks.length} submissions
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={feedbackPage === 1}
                  onClick={() => setFeedbackPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 border border-border rounded-md hover:bg-muted/40 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                >
                  <ChevronLeftIcon className="size-4" />
                </button>
                <span className="font-semibold text-foreground">
                  Page {feedbackPage} of {totalFeedbackPages}
                </span>
                <button
                  disabled={feedbackPage >= totalFeedbackPages}
                  onClick={() => setFeedbackPage((p) => Math.min(totalFeedbackPages, p + 1))}
                  className="p-1.5 border border-border rounded-md hover:bg-muted/40 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                >
                  <ChevronRightIcon className="size-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
