'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Camera, Check, ChevronRight, Link as LinkIcon, MapPin, Pencil, Sparkles, UserRound, Users } from 'lucide-react'
import { Avatar } from '@/components/Avatar'
import { Chip } from '@/components/Chip'
import { Modal } from '@/components/Modal'
import { countries, getProfileChecklist, skills, type Person } from '@/lib/prototype-utils'

interface ProfileViewProps {
  me: Person
  auth: 'guest' | 'logged'
  data: {
    username: string
    bio: string
    about?: string
    country: string
    learns: string[]
    teaches: string[]
    image: string
    links: string[]
    pronouns?: string
    language?: string
    profileVisibility?: 'public' | 'private'
  }
  completion: number
  connectionsCount: number
  connections: any[]
  setAuthMode: (m: 'login' | 'register' | null) => void
  setView: (v: 'Explore' | 'Network' | 'Messages' | 'Notifications' | 'Profile' | 'Settings') => void
  onSave: (d: any) => void
  onLogout: () => void
  onViewMember?: (id: string) => void
}

export function ProfileView({
  me,
  auth,
  data,
  completion,
  connectionsCount,
  connections,
  setAuthMode,
  setView,
  onSave,
  onLogout,
  onViewMember,
}: ProfileViewProps) {
  const [form, setForm] = useState(data)
  const [newLink, setNewLink] = useState('')
  const [selectedLearnSkill, setSelectedLearnSkill] = useState('')
  const [selectedTeachSkill, setSelectedTeachSkill] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false)
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false)

  const handleChecklistItemClick = (itemId: string) => {
    if (['username', 'country', 'bio'].includes(itemId)) {
      setIsEditModalOpen(true)
    } else if (['learns', 'teaches'].includes(itemId)) {
      const el = document.getElementById('skills-section')
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }

  // Edit details form state
  const [editForm, setEditForm] = useState({
    username: data.username || '',
    bio: data.bio || '',
    about: data.about || '',
    country: data.country || 'Select your country',
    pronouns: data.pronouns || '',
    language: data.language || 'English',
  })

  useEffect(() => {
    setForm(data)
    setEditForm({
      username: data.username || '',
      bio: data.bio || '',
      about: data.about || '',
      country: data.country || 'Select your country',
      pronouns: data.pronouns || '',
      language: data.language || 'English',
    })
  }, [data])

  // Guest View Gate
  if (auth === 'guest') {
    return (
      <section className="mx-auto max-w-md py-12 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <UserRound className="size-8" />
        </div>
        <h1 className="mt-4 text-2xl font-semibold text-foreground">Your Profile</h1>
        <p className="mt-2 text-sm text-muted-foreground">Log in or create an account to view and edit your profile, list your skills, and connect with other members.</p>
        <button onClick={() => setAuthMode('login')} className="mt-6 w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
          Log in / Create account
        </button>
      </section>
    )
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      alert('Please select an image smaller than 5MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        const updated = { ...form, image: event.target.result as string }
        setForm(updated)
        onSave(updated)
      }
    }
    reader.readAsDataURL(file)
  }

  function addLink() {
    if (!newLink.trim() || form.links.length >= 5) return
    const updated = { ...form, links: [...form.links, newLink.trim()] }
    setForm(updated)
    onSave(updated)
    setNewLink('')
  }

  function removeLink(index: number) {
    const updated = { ...form, links: form.links.filter((_, i) => i !== index) }
    setForm(updated)
    onSave(updated)
  }

  function addLearnSkill() {
    if (!selectedLearnSkill || form.learns.includes(selectedLearnSkill)) return
    const updated = { ...form, learns: [...form.learns, selectedLearnSkill] }
    setForm(updated)
    onSave(updated)
    setSelectedLearnSkill('')
  }

  function removeLearnSkill(skill: string) {
    const updated = { ...form, learns: form.learns.filter((s) => s !== skill) }
    setForm(updated)
    onSave(updated)
  }

  function addTeachSkill() {
    if (!selectedTeachSkill || form.teaches.includes(selectedTeachSkill)) return
    const updated = { ...form, teaches: [...form.teaches, selectedTeachSkill] }
    setForm(updated)
    onSave(updated)
    setSelectedTeachSkill('')
  }

  function removeTeachSkill(skill: string) {
    const updated = { ...form, teaches: form.teaches.filter((s) => s !== skill) }
    setForm(updated)
    onSave(updated)
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Column (Profile Header & Details) */}
        <main className="lg:col-span-2 space-y-4">
          
          {/* Agora Premium Profile Header Card - Bannerless */}
          <div className="bg-card rounded-lg border border-border overflow-hidden p-6 relative">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              
              {/* Avatar section without nested circles */}
              <div className="relative group shrink-0 size-28 rounded-full overflow-hidden border border-border bg-muted/20">
                {form.image ? (
                  <img src={form.image} alt={me.name || 'User'} className="size-full object-cover" />
                ) : (
                  <div className={`flex items-center justify-center font-bold text-3xl size-full ${me.tone || 'bg-accent text-accent-foreground'}`}>
                    {me.initials}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 flex items-center justify-center bg-slate-900/60 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="Upload profile picture"
                >
                  <Camera className="size-6" />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
              </div>

              {/* Info Column */}
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-baseline gap-2">
                  <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
                    {form.username || me.name || 'User Profile'}
                  </h1>
                  {form.pronouns && (
                    <span className="text-xs text-muted-foreground font-semibold">({form.pronouns})</span>
                  )}
                </div>
                
                <p className="text-sm font-medium text-foreground leading-relaxed">
                  {form.bio || 'General Learner'}
                </p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3.5 text-primary" />
                    {form.country && form.country !== 'Select your country' ? form.country : 'Global Learner'}
                  </span>
                  <span className="h-3 w-px bg-border hidden sm:block" />
                  <button
                    onClick={() => setIsFollowersModalOpen(true)}
                    className="flex items-center gap-1 font-semibold text-primary hover:underline cursor-pointer"
                  >
                    <Users className="size-3.5" /> {connectionsCount} followers
                  </button>
                </div>
              </div>

              {/* Edit button in top-right for desktop */}
              <div className="absolute top-6 right-6">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="p-2 rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer"
                  title="Edit profile settings"
                >
                  <Pencil className="size-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Profile Strength / Setup Guide */}
          {completion < 100 && (
            <div className="bg-card rounded-xl border border-border p-5 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-0.5">
                  <h2 className="font-bold text-foreground text-sm">Profile Setup Guide</h2>
                  <p className="text-xs text-muted-foreground">Complete these key steps to maximize your skill matching potential and rank higher on Explore.</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                    {completion}% Complete
                  </span>
                </div>
              </div>

              {/* Clean Solid Progress Bar */}
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full bg-primary transition-all duration-500 rounded-full"
                  style={{ width: `${completion}%` }}
                />
              </div>

              {/* Redesigned Checklist Grid */}
              <div className="grid gap-2.5 sm:grid-cols-2 pt-1">
                {getProfileChecklist(form).map((item) => {
                  const isDone = item.complete
                  return (
                    <button
                      key={item.id}
                      type="button"
                      disabled={isDone}
                      onClick={() => handleChecklistItemClick(item.id)}
                      className={`flex items-start text-left gap-3 rounded-xl border p-3 text-xs transition-all duration-150 w-full ${
                        isDone
                          ? 'border-border bg-muted/10 text-muted-foreground/80 opacity-70 cursor-default'
                          : 'border-border bg-card text-foreground hover:border-primary/40 hover:bg-primary/2.5 cursor-pointer shadow-3xs'
                      }`}
                    >
                      {/* Status Icon */}
                      <div className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full transition-colors ${
                        isDone 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-secondary border border-border text-muted-foreground'
                      }`}>
                        {isDone ? <Check className="size-3" strokeWidth={3} /> : <span className="text-[10px] font-extrabold">!</span>}
                      </div>

                      {/* Content */}
                      <div className="flex-1 space-y-0.5">
                        <div className="flex items-center justify-between gap-1.5">
                          <p className={`font-bold ${isDone ? 'line-through text-muted-foreground/60' : ''}`}>
                            {item.label}
                          </p>
                          {!isDone && <ChevronRight className="size-3.5 text-muted-foreground/60 shrink-0" />}
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-normal">{item.hint}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* About Section */}
          <div className="bg-card rounded-lg border border-border p-5 space-y-3">
            <h2 className="font-semibold text-foreground text-base">About</h2>
            <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
              {form.about || 'No details provided yet.'}
            </p>
          </div>

          {/* Skills Section (Teaches & Learns) */}
          <div id="skills-section" className="bg-card rounded-lg border border-border p-5 space-y-6 scroll-mt-6">
            <h2 className="font-semibold text-foreground text-base">Skills & Expertise</h2>

            {/* Skills I Can Teach */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center justify-between">
                <span>Skills I Can Teach</span>
                <span className="text-xs text-muted-foreground font-normal">{form.teaches.length} listed</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {form.teaches.map((s) => (
                  <Chip key={s} onRemove={() => removeTeachSkill(s)}>
                    {s}
                  </Chip>
                ))}
                {form.teaches.length === 0 && <span className="text-xs text-muted-foreground">No teaching skills added yet</span>}
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedTeachSkill}
                  onChange={(e) => setSelectedTeachSkill(e.target.value)}
                  className="h-9 flex-1 px-3 text-xs bg-card border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23666%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:14px_14px] bg-[right_10px_center] pr-8 cursor-pointer transition-all"
                >
                  <option value="">Select skill to teach...</option>
                  {skills.filter((s) => !form.teaches.includes(s)).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={addTeachSkill}
                  disabled={!selectedTeachSkill}
                  className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-40 hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="border-t border-border pt-4 space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center justify-between">
                <span>Skills I Want to Learn</span>
                <span className="text-xs text-muted-foreground font-normal">{form.learns.length} listed</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {form.learns.map((s) => (
                  <Chip key={s} muted onRemove={() => removeLearnSkill(s)}>
                    {s}
                  </Chip>
                ))}
                {form.learns.length === 0 && <span className="text-xs text-muted-foreground">No learning goals added yet</span>}
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedLearnSkill}
                  onChange={(e) => setSelectedLearnSkill(e.target.value)}
                  className="h-9 flex-1 px-3 text-xs bg-card border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23666%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:14px_14px] bg-[right_10px_center] pr-8 cursor-pointer transition-all"
                >
                  <option value="">Select skill to learn...</option>
                  {skills.filter((s) => !form.learns.includes(s)).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={addLearnSkill}
                  disabled={!selectedLearnSkill}
                  className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-40 hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Links & Portfolio Section */}
          <div className="bg-card rounded-lg border border-border p-5 space-y-4">
            <h2 className="font-semibold text-foreground text-base">Portfolio & Links</h2>
            <div className="flex gap-2">
              <input
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                placeholder="https://github.com/username or portfolio URL"
                disabled={form.links.length >= 5}
                className="h-9 flex-1 rounded-lg border border-input bg-background px-3 text-xs outline-none focus:ring-1.5 focus:ring-primary/30"
              />
              <button
                type="button"
                onClick={addLink}
                disabled={!newLink.trim() || form.links.length >= 5}
                className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-40 hover:opacity-90 transition-opacity cursor-pointer"
              >
                Add Link
              </button>
            </div>
            {form.links.length > 0 && (
              <div className="space-y-2">
                {form.links.map((link, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2 text-xs">
                    <span className="truncate flex items-center gap-1.5 text-primary font-medium">
                      <LinkIcon className="size-3 text-muted-foreground" />
                      {link}
                    </span>
                    <button type="button" onClick={() => removeLink(idx)} className="text-muted-foreground hover:text-destructive transition-colors cursor-pointer">
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Right Sidebar Widgets */}
        <aside className="space-y-4">
          
          {/* Profile Language & Public URL Card */}
          <div className="bg-card rounded-lg border border-border p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Profile language</h3>
                <p className="text-xs text-muted-foreground mt-0.5">English</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground">Public profile & URL</h3>
              <div className="flex items-center justify-between gap-2 mt-1">
                <p className="text-xs text-muted-foreground truncate select-all flex-1 bg-secondary/30 p-1.5 rounded text-[10px]">
                  {typeof window !== 'undefined' ? `${window.location.origin}/in/${form.username || 'user'}` : `agora.app/in/${form.username || 'user'}`}
                </p>
                <button
                  onClick={() => {
                    const url = typeof window !== 'undefined' ? `${window.location.origin}/in/${form.username || 'user'}` : `https://agora.app/in/${form.username || 'user'}`
                    navigator.clipboard.writeText(url)
                    alert('Copied profile link to clipboard!')
                  }}
                  className="text-[10px] font-bold text-primary hover:underline shrink-0"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>

          {/* Who your viewers also viewed Widget - Dynamic Links */}
          <div className="bg-card rounded-lg border border-border p-5 space-y-4 shadow-xs">
            <h3 className="text-sm font-semibold text-foreground">Who your viewers also viewed</h3>
            <div className="space-y-3">
              {[
                { name: 'Sarah Jenkins', role: 'UI/UX Designer @ DesignCorp', initials: 'SJ', targetId: 'sarah' },
                { name: 'University Professor', role: 'Higher Education Industry', initials: 'UP', targetId: 'professor' },
                { name: 'Software Founder', role: 'Development & Strategy', initials: 'SF', targetId: 'founder' }
              ].map((person, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <button
                    onClick={() => onViewMember?.(person.targetId)}
                    className="flex items-center gap-2.5 text-left hover:opacity-85 transition-opacity"
                  >
                    <div className="size-8 rounded-full bg-secondary text-primary font-bold flex items-center justify-center shrink-0">
                      {person.initials}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-semibold text-foreground hover:underline truncate max-w-[130px]">{person.name}</p>
                      <p className="text-muted-foreground text-[10px] truncate max-w-[130px]">{person.role}</p>
                    </div>
                  </button>
                  <button
                    onClick={() => onViewMember?.(person.targetId)}
                    className="px-3 py-1 rounded-full border border-border text-foreground font-semibold hover:bg-muted transition-colors text-center cursor-pointer text-[10px]"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        </aside>

      </div>

      {/* Edit Profile details modal */}
      {isEditModalOpen && (
        <Modal title="Edit Profile Details" close={() => setIsEditModalOpen(false)}>
          <div className="space-y-4 p-1">
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Username</label>
              <input
                type="text"
                value={editForm.username}
                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                className="w-full rounded-lg border border-input bg-background p-2.5 text-xs outline-none focus:ring-1.5 focus:ring-primary/30"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Pronouns</label>
                <select
                  value={editForm.pronouns}
                  onChange={(e) => setEditForm({ ...editForm, pronouns: e.target.value })}
                  className="h-9 w-full px-3 text-xs bg-card border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23666%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:14px_14px] bg-[right_10px_center] pr-8 cursor-pointer transition-all"
                >
                  <option value="">Select pronouns</option>
                  <option value="He/Him">He/Him</option>
                  <option value="She/Her">She/Her</option>
                  <option value="They/Them">They/Them</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Location / Country</label>
                <select
                  value={editForm.country}
                  onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                  className="h-9 w-full px-3 text-xs bg-card border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23666%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:14px_14px] bg-[right_10px_center] pr-8 cursor-pointer transition-all"
                >
                  {countries.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-baseline mb-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase block">Headline / Bio</label>
                <span className="text-[10px] text-muted-foreground">{120 - editForm.bio.length} characters remaining</span>
              </div>
              <input
                type="text"
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value.slice(0, 120) })}
                maxLength={120}
                className="w-full rounded-lg border border-input bg-background p-2.5 text-xs outline-none focus:ring-1.5 focus:ring-primary/30"
                placeholder="e.g. Graphic Designer | Teaches Photoshop"
              />
            </div>

            <div>
              <div className="flex justify-between items-baseline mb-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase block">About Me</label>
                <span className="text-[10px] text-muted-foreground">{300 - editForm.about.length} characters remaining</span>
              </div>
              <textarea
                value={editForm.about}
                onChange={(e) => setEditForm({ ...editForm, about: e.target.value.slice(0, 300) })}
                maxLength={300}
                rows={4}
                className="w-full rounded-lg border border-input bg-background p-2.5 text-xs outline-none focus:ring-1.5 focus:ring-primary/30"
                placeholder="Write a brief introduction about your goals, background..."
              />
            </div>

            <button
              onClick={async () => {
                const updated = {
                  ...form,
                  username: editForm.username,
                  bio: editForm.bio,
                  about: editForm.about,
                  country: editForm.country,
                  pronouns: editForm.pronouns,
                  language: editForm.language,
                }
                await onSave(updated)
                setIsEditModalOpen(false)
              }}
              className="w-full rounded-lg bg-primary py-2.5 text-xs font-bold text-primary-foreground hover:opacity-90 transition-opacity mt-2 shadow-xs cursor-pointer"
            >
              Save Profile Details
            </button>
          </div>
        </Modal>
      )}

      {/* Followers list modal */}
      {isFollowersModalOpen && (
        <Modal title="Followers List" close={() => setIsFollowersModalOpen(false)}>
          <div className="space-y-4 p-1 max-h-96 overflow-y-auto">
            {connectionsCount === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No followers yet.</p>
            ) : (
              <div className="divide-y divide-border">
                {connections.map((conn) => (
                  <div key={conn.connectionId} className="flex items-center justify-between py-3">
                    <button
                      onClick={() => {
                        setIsFollowersModalOpen(false)
                        onViewMember?.(conn.partnerId)
                      }}
                      className="flex items-center gap-3 text-left hover:opacity-80 transition-opacity"
                    >
                      <Avatar person={{ name: conn.partner?.name, username: conn.partner?.username, image: conn.partner?.profileImage }} />
                      <div>
                        <p className="text-xs font-bold text-foreground hover:underline">
                          {conn.partner?.name || conn.partner?.username}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          @{conn.partner?.username}
                        </p>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setIsFollowersModalOpen(false)
                        setView('Messages')
                      }}
                      className="px-3 py-1 rounded-lg border border-primary text-xs font-bold text-primary hover:bg-primary/5 transition-colors cursor-pointer"
                    >
                      Message
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}


    </div>
  )
}
