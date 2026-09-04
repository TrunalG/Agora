"use client"

import { useState } from 'react'
import { MoreVertical, Trash2, Ban, AlertCircle } from 'lucide-react'

export default function AdminTabs({ users, feedbacks }: { users: any[], feedbacks: any[] }) {
  const [activeTab, setActiveTab] = useState<'users' | 'feedback'>('users')
  const [userList, setUserList] = useState(users)

  const handleAction = async (userId: string, action: 'warn' | 'block' | 'delete') => {
    if (!confirm(`Are you sure you want to ${action} this user?`)) return

    try {
      const res = await fetch(`/api/admin/users/${userId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })
      if (res.ok) {
        const data = await res.json()
        if (action === 'delete') {
          setUserList(prev => prev.filter(u => u._id !== userId))
        } else {
          setUserList(prev => prev.map(u => u._id === userId ? { ...u, status: data.status, warningCount: data.warningCount } : u))
        }
      } else {
        alert('Action failed')
      }
    } catch (error) {
      alert('Error performing action')
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      {/* Tabs Header */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-4 text-sm font-semibold transition-colors ${activeTab === 'users' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted-foreground hover:bg-muted/30'}`}
        >
          Manage Users
        </button>
        <button
          onClick={() => setActiveTab('feedback')}
          className={`flex-1 py-4 text-sm font-semibold transition-colors ${activeTab === 'feedback' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted-foreground hover:bg-muted/30'}`}
        >
          View Feedback
        </button>
      </div>

      {/* Tabs Content */}
      <div className="p-0">
        {activeTab === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-semibold">User</th>
                  <th className="px-6 py-4 font-semibold">Email</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Warnings</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {userList.map((u) => (
                  <tr key={u._id} className="hover:bg-muted/10 transition-colors">
                    <div className="px-6 py-4 flex items-center gap-3">
                      <img src={u.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${u.name}`} alt="" className="size-8 rounded-full" />
                      <div>
                        <p className="font-semibold text-foreground">{u.name || 'Anonymous'}</p>
                        <p className="text-xs text-muted-foreground">@{u.username}</p>
                      </div>
                    </div>
                    <td className="px-6 py-4 text-muted-foreground">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        u.status === 'active' ? 'bg-green-500/10 text-green-500' :
                        u.status === 'warned' ? 'bg-orange-500/10 text-orange-500' :
                        'bg-red-500/10 text-red-500'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{u.warningCount || 0}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleAction(u._id, 'warn')} className="p-1.5 text-muted-foreground hover:text-orange-500 bg-muted/50 hover:bg-orange-500/10 rounded-md transition-colors" title="Warn">
                          <AlertCircle className="size-4" />
                        </button>
                        <button onClick={() => handleAction(u._id, 'block')} className="p-1.5 text-muted-foreground hover:text-red-500 bg-muted/50 hover:bg-red-500/10 rounded-md transition-colors" title="Block">
                          <Ban className="size-4" />
                        </button>
                        <button onClick={() => handleAction(u._id, 'delete')} className="p-1.5 text-muted-foreground hover:text-red-600 bg-muted/50 hover:bg-red-600/10 rounded-md transition-colors" title="Delete">
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {userList.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'feedback' && (
          <div className="divide-y divide-border">
            {feedbacks.map((f) => (
              <div key={f._id} className="p-6 hover:bg-muted/5 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">
                      {f.questionCategory}
                    </span>
                    <span className="flex text-yellow-400 text-sm">
                      {Array.from({ length: f.rating }).map((_, i) => <span key={i}>★</span>)}
                      {Array.from({ length: 5 - f.rating }).map((_, i) => <span key={i} className="text-muted-foreground/30">★</span>)}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(f.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-foreground text-sm my-3 whitespace-pre-wrap">{f.description}</p>
                <p className="text-xs text-muted-foreground font-medium">
                  Submitted by: {f.submittedBy ? `${f.submittedBy.name} (${f.submittedBy.email})` : 'Anonymous Visitor'}
                </p>
              </div>
            ))}
            {feedbacks.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">No feedback yet.</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
