'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import {
  Bell,
  Check,
  ChevronDown,
  Compass,
  LogOut,
  Menu,
  MessageCircle,
  MoreHorizontal,
  Search,
  Send,
  Settings,
  Shield,
  UserRound,
  Users,
  X,
  Plus,
  Trash2,
  Camera,
  Upload,
  MapPin,
  ArrowLeft,
  Ban,
  Eye,
  EyeOff,
} from 'lucide-react'
import {
  calculateMatch,
  getMatchScore,
  countries,
  getProfileCompletion,
  getProfileChecklist,
  people as initialPeople,
  skills,
  type Person,
  type Request,
  type Conversation,
} from '@/lib/prototype-utils'
import { Avatar } from '@/components/Avatar'
import { Chip } from '@/components/Chip'
import { Modal } from '@/components/Modal'
import { ProfileView } from '@/components/ProfileView'
import { SettingsView } from '@/components/SettingsView'
import { AuthModal, PasswordRequirements } from '@/components/AuthModal'

type View = 'Explore' | 'Network' | 'Messages' | 'Notifications' | 'Profile' | 'Settings'

const defaultGuest: Person = {
  id: 'guest',
  name: 'Guest User',
  username: 'guest',
  role: 'General Learner',
  location: 'Anywhere',
  initials: 'GU',
  tone: 'bg-muted text-foreground',
  teaches: [],
  learns: [],
  about: 'Please log in or register to connect.',
}

export default function AgoraApp() {
  const [view, setView] = useState<View>('Explore')
  
  const navigateToView = (newView: View) => {
    setView(newView)
    if (typeof window !== 'undefined') {
      const url = newView === 'Explore' ? '/' : `?view=${newView.toLowerCase()}`
      window.history.pushState({ view: newView }, '', url)
    }
  }
  const [query, setQuery] = useState('')
  const [searchVal, setSearchVal] = useState('')
  const [searchChatQuery, setSearchChatQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'teach' | 'learn' | 'match'>('all')
  const [networkTab, setNetworkTab] = useState<'received' | 'sent' | 'following'>('received')
  const [country, setCountry] = useState('Anywhere')
  const [profile, setProfile] = useState<Person | null>(null)
  const [auth, setAuth] = useState<'guest' | 'logged'>('guest')
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'onboarding' | null>(null)
  const [toast, setToast] = useState('')
  const [activeChat, setActiveChat] = useState<string | null>(null)
  const [chatMessage, setChatMessage] = useState('')
  const [peopleList, setPeopleList] = useState<Person[]>(initialPeople)
  const [connections, setConnections] = useState<Array<{ connectionId: string; partnerId: string; partner: any; connectedAt: string }>>([])
  const [pendingRequests, setPendingRequests] = useState<Array<{ id: string; senderId: string; sender: any; receiverId: string; receiver: any; message: string; status: string; createdAt: string }>>([])
  const [incomingRequests, setIncomingRequests] = useState<Array<{ id: string; senderId: string; sender: any; receiverId: string; receiver: any; message: string; status: string; createdAt: string }>>([])
  const [outgoingRequests, setOutgoingRequests] = useState<Array<{ id: string; senderId: string; sender: any; receiverId: string; receiver: any; message: string; status: string; createdAt: string }>>([])
  const [conversationsList, setConversationsList] = useState<Array<{ id: string; participant: any; lastMessage: any; unreadCount: number; updatedAt: string }>>([])
  const [chatHistory, setChatHistory] = useState<Array<{ id: string; conversationId: string; senderId: string; content: string; createdAt: string }>>([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [me, setMe] = useState<Person>(defaultGuest)
  const [myProfileData, setMyProfileData] = useState({
    username: '',
    bio: '',
    about: '',
    country: 'Select your country',
    learns: [] as string[],
    teaches: [] as string[],
    image: '',
    links: [] as string[],
    pronouns: '',
    language: 'English',
    profileVisibility: 'public' as 'public' | 'private',
  })
  const [blockedUsers, setBlockedUsers] = useState<Array<{ id: string; name: string; username: string }>>([])
  const [unreadNotifCount, setUnreadNotifCount] = useState(0)
  const [notificationsList, setNotificationsList] = useState<any[]>([])
  const [connectionsCount, setConnectionsCount] = useState(0)
  const [activePartnerModal, setActivePartnerModal] = useState<Person | null>(null)
  const [meDropdownOpen, setMeDropdownOpen] = useState(false)
  const [messagingDrawerOpen, setMessagingDrawerOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Inline authentication state hooks
  const [inlineAuthMode, setInlineAuthMode] = useState<'login' | 'register' | 'otp' | 'forgot-password' | 'forgot-password-otp'>('login')
  const [inlineError, setInlineError] = useState('')
  const [inlineLoading, setInlineLoading] = useState(false)
  const [inlineOtpCode, setInlineOtpCode] = useState('')
  const [inlineOtpMessage, setInlineOtpMessage] = useState('')
  const [inlineNewPassword, setInlineNewPassword] = useState('')
  const [inlineConfirmPassword, setInlineConfirmPassword] = useState('')

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Local optimistic states to keep track of accepted/rejected requests instantly
  const [acceptedRequests, setAcceptedRequests] = useState<Set<string>>(new Set())
  const [rejectedRequests, setRejectedRequests] = useState<Set<string>>(new Set())

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMeDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function notify(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3500)
  }

  function updateMeState(userObj: any) {
    if (!userObj) return
    const id = userObj.id || userObj._id || 'guest'
    const name = userObj.name || userObj.username || 'User'
    const username = userObj.username || ''
    const learns = userObj.skillsToLearn || []
    const teaches = userObj.skillsToTeach || []
    const bio = userObj.bio || ''
    const about = userObj.about || ''
    const location = userObj.country || 'Select your country'
    const image = userObj.profileImage || ''
    const links = userObj.links || []
    const email = userObj.email || ''
    const pronouns = userObj.pronouns || ''
    const language = userObj.language || 'English'
    const profileVisibility = userObj.profileVisibility || 'public'
    const notificationPreference = userObj.notificationPreference !== false
    const initials = name.slice(0, 2).toUpperCase()

    setMe({
      id,
      name,
      username,
      role: teaches[0] ? `${teaches[0]} Enthusiast` : 'Member',
      location,
      initials,
      tone: 'bg-primary text-primary-foreground',
      teaches,
      learns,
      about: about || bio,
      image,
      links,
      email,
      pronouns,
      language,
      profileVisibility,
      notificationPreference,
    })

    setMyProfileData({
      username,
      bio,
      about: about || bio,
      country: location,
      learns,
      teaches,
      image,
      links,
      pronouns,
      language,
      profileVisibility,
    })
  }

  useEffect(() => {
    async function initSession() {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          const data = await res.json()
          if (data.user) {
            setAuth('logged')
            updateMeState(data.user)
          }
        }
      } catch {
        // Guest fallback
      }
    }
    initSession()
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const viewParam = params.get('view')
      if (viewParam) {
        const matched = ['explore', 'network', 'messages', 'notifications', 'profile', 'settings'].find(
          (v) => v === viewParam.toLowerCase()
        )
        if (matched) {
          const capitalized = (matched === 'explore' ? 'Explore' : matched.charAt(0).toUpperCase() + matched.slice(1)) as View
          setView(capitalized)
        }
      }

      const handlePopState = (e: PopStateEvent) => {
        if (e.state && e.state.view) {
          setView(e.state.view)
        } else {
          const p = new URLSearchParams(window.location.search)
          const vp = p.get('view')
          if (vp) {
            const m = ['explore', 'network', 'messages', 'notifications', 'profile', 'settings'].find(
              (v) => v === vp.toLowerCase()
            )
            if (m) {
              setView((m === 'explore' ? 'Explore' : m.charAt(0).toUpperCase() + m.slice(1)) as View)
              return
            }
          }
          setView('Explore')
        }
      }
      window.addEventListener('popstate', handlePopState)
      return () => window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  async function loadUserData() {
    if (auth !== 'logged') return
    try {
      const [usersRes, connRes, notifRes, blockRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/connections'),
        fetch('/api/notifications'),
        fetch('/api/user/block'),
      ])

      if (usersRes.ok) {
        const data = await usersRes.json()
        const users = data.people || data.users
        if (users && users.length > 0) {
          setPeopleList(users)
        }
      }

      if (connRes.ok) {
        const data = await connRes.json()
        const activeConns = data.connections || []
        setConnections(activeConns)
        setConnectionsCount(activeConns.length)

        const reqs = data.requests || []
        setPendingRequests(reqs)
        const currentUserId = me.id
        setIncomingRequests(reqs.filter((r: any) => r.receiverId === currentUserId))
        setOutgoingRequests(reqs.filter((r: any) => r.senderId === currentUserId))
      }

      if (notifRes.ok) {
        const data = await notifRes.json()
        const allNotifs = data.notifications || []
        setNotificationsList(allNotifs)
        setUnreadNotifCount(allNotifs.filter((n: any) => !n.read).length)
      }

      if (blockRes.ok) {
        const data = await blockRes.json()
        setBlockedUsers(data.blockedUsers || [])
      }
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    loadUserData()
  }, [auth, me.id])

  useEffect(() => {
    async function loadConversations() {
      if (auth !== 'logged' || view !== 'Messages') return
      try {
        const res = await fetch('/api/conversations')
        if (res.ok) {
          const data = await res.json()
          setConversationsList(data.conversations || [])
        }
      } catch {
        // ignore
      }
    }
    loadConversations()
  }, [auth, view])

  useEffect(() => {
    async function loadChatMessages() {
      if (!activeChat) return
      try {
        const res = await fetch(`/api/messages?conversationId=${activeChat}`)
        if (res.ok) {
          const data = await res.json()
          setChatHistory(data.messages || [])
        }
      } catch {
        // ignore
      }
    }
    loadChatMessages()
  }, [activeChat])

  const completion = useMemo(() => getProfileCompletion(myProfileData), [myProfileData])

  const shown = useMemo(() => {
    const connectedPartnerIds = new Set(connections.map((c) => c.partnerId))

    const filtered = peopleList.filter((p) => {
      if (p.id === me.id) return false
      if (connectedPartnerIds.has(p.id)) return false
      if (country !== 'Anywhere' && p.location !== country) return false

      if (query.trim()) {
        const q = query.toLowerCase()
        const textMatch =
          p.name.toLowerCase().includes(q) ||
          p.username.toLowerCase().includes(q) ||
          p.role.toLowerCase().includes(q) ||
          p.about.toLowerCase().includes(q)
        const teachMatch = p.teaches.some((s) => s.toLowerCase().includes(q))
        const learnMatch = p.learns.some((s) => s.toLowerCase().includes(q))
        if (!textMatch && !teachMatch && !learnMatch) return false
      }

      if (filter === 'teach') return p.teaches.length > 0
      if (filter === 'learn') return p.learns.length > 0
      if (filter === 'match') {
        const score = getMatchScore(me, p)
        return score > 0
      }
      return true
    })

    // Sort by match score descending to prioritize Strong Matches at the top of the grid
    return [...filtered].sort((a, b) => getMatchScore(me, b) - getMatchScore(me, a))
  }, [peopleList, me, query, filter, country, connections])

  // Helper to check if follow request is pending
  const isRequestPending = (personId: string) => {
    const person = peopleList.find((p) => p.id === personId)
    if (!person) return false
    return outgoingRequests.some((r) => {
      const rReceiverId = r.receiverId
      const rReceiverUsername = r.receiver?.username || ''
      return (
        rReceiverId === person.id ||
        (person.username && rReceiverUsername.toLowerCase() === person.username.toLowerCase())
      )
    })
  }

  // Helper to check if connected (following)
  const isMemberConnected = (personId: string) => {
    const person = peopleList.find((p) => p.id === personId)
    if (!person) return false
    return connections.some((c) => {
      return (
        c.partnerId === person.id ||
        (person.username && c.partner?.username?.toLowerCase() === person.username.toLowerCase())
      )
    })
  }

  async function sendConnectionRequest(targetId: string) {
    if (auth === 'guest') {
      setAuthMode('login')
      return
    }
    // Optimistic UI update: instantly add a temporary pending request to outgoingRequests
    const targetPerson = peopleList.find(p => p.id === targetId)
    const tempRequest = {
      id: `temp-${targetId}`,
      senderId: me.id,
      receiverId: targetId,
      receiver: targetPerson ? { id: targetPerson.id, name: targetPerson.name, username: targetPerson.username, profileImage: targetPerson.image } : { id: targetId },
      status: 'pending',
      createdAt: new Date().toISOString()
    }
    setOutgoingRequests(prev => [...prev, tempRequest])

    try {
      const res = await fetch('/api/connections/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId: targetId }),
      })
      const data = await res.json()
      if (res.ok) {
        notify('Connection request sent!')
        loadUserData()
      } else {
        // Rollback on failure
        setOutgoingRequests(prev => prev.filter(r => r.id !== `temp-${targetId}`))
        notify(data.error || 'Could not send request')
      }
    } catch {
      // Rollback on failure
      setOutgoingRequests(prev => prev.filter(r => r.id !== `temp-${targetId}`))
      notify('Network error')
    }
  }

  async function withdrawConnectionRequest(targetId: string) {
    if (auth === 'guest') return
    // Optimistic UI update: instantly remove request from outgoingRequests
    const removedRequest = outgoingRequests.find(r => r.receiverId === targetId || r.senderId === targetId)
    setOutgoingRequests(prev => prev.filter(r => r.receiverId !== targetId && r.senderId !== targetId))

    try {
      const res = await fetch(`/api/connections/request?receiverId=${targetId}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (res.ok) {
        notify('Connection request withdrawn')
        loadUserData()
      } else {
        // Rollback on failure
        if (removedRequest) {
          setOutgoingRequests(prev => [...prev, removedRequest])
        }
        notify(data.error || 'Could not withdraw request')
      }
    } catch {
      // Rollback on failure
      if (removedRequest) {
        setOutgoingRequests(prev => [...prev, removedRequest])
      }
      notify('Network error')
    }
  }

  async function respondConnectionRequest(requestId: string, action: 'accept' | 'reject') {
    // Optimistic UI update: immediately add the requestId to local sets to change status and message options
    if (action === 'accept') {
      setAcceptedRequests((prev) => {
        const next = new Set(prev)
        next.add(requestId)
        return next
      })
    } else {
      setRejectedRequests((prev) => {
        const next = new Set(prev)
        next.add(requestId)
        return next
      })
    }

    try {
      const res = await fetch('/api/connections/request', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action }),
      })
      const data = await res.json()
      if (res.ok) {
        notify(action === 'accept' ? 'Connection request accepted!' : 'Request rejected')
        loadUserData()
      } else {
        // Rollback on failure
        if (action === 'accept') {
          setAcceptedRequests((prev) => {
            const next = new Set(prev)
            next.delete(requestId)
            return next
          })
        } else {
          setRejectedRequests((prev) => {
            const next = new Set(prev)
            next.delete(requestId)
            return next
          })
        }
        notify(data.error || 'Failed to update request')
      }
    } catch {
      // Rollback on failure
      if (action === 'accept') {
        setAcceptedRequests((prev) => {
          const next = new Set(prev)
          next.delete(requestId)
          return next
        })
      } else {
        setRejectedRequests((prev) => {
          const next = new Set(prev)
          next.delete(requestId)
          return next
        })
      }
      notify('Network error')
    }
  }

  async function startConversation(partnerId: string) {
    if (auth === 'guest') {
      setAuthMode('login')
      return
    }
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId: partnerId }),
      })
      const data = await res.json()
      if (res.ok && data.conversation) {
        setActiveChat(data.conversation.id)
        setView('Messages')
      } else {
        notify(data.error || 'Failed to start chat')
      }
    } catch {
      notify('Network error')
    }
  }

  async function sendMessage() {
    if (!activeChat || !chatMessage.trim()) return
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: activeChat, content: chatMessage }),
      })
      if (res.ok) {
        setChatMessage('')
        const data = await res.json()
        setChatHistory((prev) => [...prev, data.message])
      } else {
        notify('Failed to send message')
      }
    } catch {
      notify('Network error')
    }
  }

  async function saveProfile(updated: typeof myProfileData) {
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: updated.username,
          bio: updated.bio,
          about: updated.about,
          country: updated.country,
          pronouns: updated.pronouns,
          language: updated.language,
          profileVisibility: updated.profileVisibility,
          skillsToLearn: updated.learns,
          skillsToTeach: updated.teaches,
          profileImage: updated.image,
          links: updated.links,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        updateMeState(data.profile || data.user)
        notify('Profile updated successfully!')
      } else {
        notify(data.error || 'Failed to update profile')
      }
    } catch {
      notify('Network error saving profile')
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    setAuth('guest')
    setMe(defaultGuest)
    setView('Explore')
    notify('Logged out successfully')
    // Clear all auth credentials and reset view state on logout
    setEmail('')
    setPassword('')
    setInlineAuthMode('login')
    setInlineError('')
    setInlineOtpCode('')
    setInlineOtpMessage('')
    setInlineNewPassword('')
    setInlineConfirmPassword('')
    setShowPassword(false)
    setShowNewPassword(false)
    setShowConfirmPassword(false)
  }

  async function handleUnblock(blockedId: string) {
    try {
      const res = await fetch(`/api/user/block?blockedId=${blockedId}`, { method: 'DELETE' })
      if (res.ok) {
        notify('User unblocked')
        loadUserData()
      }
    } catch {
      // ignore
    }
  }

  async function handleDeleteAccount() {
    try {
      const res = await fetch('/api/user/account', { method: 'DELETE' })
      if (res.ok) {
        handleLogout()
        notify('Account deleted')
      }
    } catch {
      notify('Network error')
    }
  }

  // Password Validation Rules for Inline Forms
  const lenOk = password.length >= 12 && password.length <= 64
  const upperOk = /[A-Z]/.test(password)
  const lowerOk = /[a-z]/.test(password)
  const digitOk = /[0-9]/.test(password)
  const symbolOk = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)
  const passwordValid = lenOk && upperOk && lowerOk && digitOk && symbolOk

  const inlineNewLenOk = inlineNewPassword.length >= 12 && inlineNewPassword.length <= 64
  const inlineNewUpperOk = /[A-Z]/.test(inlineNewPassword)
  const inlineNewLowerOk = /[a-z]/.test(inlineNewPassword)
  const inlineNewDigitOk = /[0-9]/.test(inlineNewPassword)
  const inlineNewSymbolOk = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(inlineNewPassword)
  const inlineNewPasswordValid = inlineNewLenOk && inlineNewUpperOk && inlineNewLowerOk && inlineNewDigitOk && inlineNewSymbolOk

  function Spinner() {
    return (
      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current inline-block" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    )
  }

  async function handleInlineLogin() {
    setInlineLoading(true)
    setInlineError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      })
      const data = await res.json()
      setInlineLoading(false)
      if (!res.ok) {
        setInlineError(data.error || 'Authentication failed')
        return
      }
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('agora_demo_password', password)
      }
      setAuth('logged')
      updateMeState(data.user)
      loadUserData()
      notify('Welcome to Agora!')
      setInlineAuthMode('login')
      setEmail('')
      setPassword('')
      setShowPassword(false)
    } catch (err: any) {
      setInlineLoading(false)
      setInlineError(err.message || 'Server connection error')
    }
  }

  async function handleInlineSendRegisterOtp() {
    setInlineLoading(true)
    setInlineError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send-otp', email: email.trim().toLowerCase(), password }),
      })
      const data = await res.json()
      setInlineLoading(false)
      if (!res.ok) {
        setInlineError(data.error || 'Failed to send verification code')
        return
      }
      setInlineOtpCode('') // Clear any old OTP input
      setInlineOtpMessage(data.message || `Verification code sent to ${email}`)
      setInlineAuthMode('otp')
      notify('Verification OTP sent!')
    } catch (err: any) {
      setInlineLoading(false)
      setInlineError(err.message || 'Server connection error')
    }
  }

  async function handleInlineVerifyRegisterOtp() {
    setInlineLoading(true)
    setInlineError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify-otp', email: email.trim().toLowerCase(), otp: inlineOtpCode.trim() }),
      })
      const data = await res.json()
      setInlineLoading(false)
      if (!res.ok) {
        setInlineError(data.error || 'OTP verification failed')
        return
      }
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('agora_demo_password', password)
      }
      setAuth('logged')
      updateMeState(data.user)
      loadUserData()
      setAuthMode('onboarding')
      notify('Registration complete! Please finish onboarding.')
      setEmail('')
      setPassword('')
      setInlineOtpCode('')
      setShowPassword(false)
    } catch (err: any) {
      setInlineLoading(false)
      setInlineError(err.message || 'Server connection error')
    }
  }

  async function handleInlineSendForgotPasswordOtp() {
    setInlineLoading(true)
    setInlineError('')
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send-otp', email: email.trim().toLowerCase() }),
      })
      const data = await res.json()
      setInlineLoading(false)
      if (!res.ok) {
        setInlineError(data.error || 'Failed to send reset code')
        return
      }
      setInlineOtpCode('') // Clear any old OTP input
      setInlineOtpMessage(data.message || `Password reset code sent to ${email}`)
      setInlineAuthMode('forgot-password-otp')
      notify('Password reset OTP sent!')
    } catch (err: any) {
      setInlineLoading(false)
      setInlineError(err.message || 'Server connection error')
    }
  }

  async function handleInlineResetPassword() {
    if (inlineNewPassword !== inlineConfirmPassword) {
      setInlineError('Passwords do not match')
      return
    }
    setInlineLoading(true)
    setInlineError('')
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset-password',
          email: email.trim().toLowerCase(),
          otp: inlineOtpCode.trim(),
          newPassword: inlineNewPassword,
        }),
      })
      const data = await res.json()
      setInlineLoading(false)
      if (!res.ok) {
        setInlineError(data.error || 'Password reset failed')
        return
      }
      notify('Password reset successful! You can now log in.')
      setInlineAuthMode('login')
      setInlineOtpCode('')
      setInlineNewPassword('')
      setInlineConfirmPassword('')
      setShowNewPassword(false)
      setShowConfirmPassword(false)
    } catch (err: any) {
      setInlineLoading(false)
      setInlineError(err.message || 'Server connection error')
    }
  }

  if (auth === 'guest') {
    return (
      <div className="min-h-screen flex bg-background text-foreground antialiased selection:bg-primary/20">
        {/* Left column: branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-primary/5 flex-col justify-between p-12 border-r border-border relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-background" />
          <div className="relative z-10">
            <span className="font-extrabold text-2xl tracking-tight text-primary">Agora</span>
          </div>
          <div className="space-y-6 relative z-10 max-w-lg my-auto">
            <h1 className="text-4xl font-extrabold text-foreground tracking-tight leading-tight">
              Learn new skills. <br/>
              Teach what you love. <br/>
              Grow your connection.
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Agora is a peer-to-peer skill exchange platform designed to match you with learners and experts nearby or globally. Exchange knowledge, level up your career, and build lasting professional relationships.
            </p>
          </div>
          <div className="relative z-10 text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Agora Inc. All rights reserved.
          </div>
        </div>

        {/* Right column: login / registration forms */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-card relative">
          <div className="w-full max-w-md space-y-6">
            <div className="text-center space-y-1.5">
              <span className="font-extrabold text-2xl tracking-tight text-primary lg:hidden block mb-2">Agora</span>
              <h2 className="text-xl font-bold tracking-tight text-foreground">Welcome to the Skill Exchange</h2>
              <p className="text-xs text-muted-foreground">Sign in to browse recommended matches, exchange skills, and message members.</p>
            </div>

            {/* Auth Cards directly inline! */}
            <div className="rounded-xl border border-border bg-background p-6 shadow-sm space-y-4">
              {/* Only show tab headers if we are in login or register views */}
              {(inlineAuthMode === 'login' || inlineAuthMode === 'register') && (
                <div className="flex border-b border-border bg-slate-50/50 rounded-t-lg overflow-hidden">
                  <button
                    onClick={() => {
                      setInlineAuthMode('login')
                      setInlineError('')
                    }}
                    className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition-all cursor-pointer ${inlineAuthMode === 'login' ? 'border-primary text-primary bg-background' : 'border-transparent text-muted-foreground hover:bg-muted/40'}`}
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => {
                      setInlineAuthMode('register')
                      setInlineError('')
                    }}
                    className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition-all cursor-pointer ${inlineAuthMode === 'register' ? 'border-primary text-primary bg-background' : 'border-transparent text-muted-foreground hover:bg-muted/40'}`}
                  >
                    Sign Up
                  </button>
                </div>
              )}

              {/* 1. Login View */}
              {inlineAuthMode === 'login' && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (!inlineLoading && email && password) handleInlineLogin()
                  }}
                  className="space-y-4 pt-2 animate-in fade-in duration-200"
                >
                  {inlineError && (
                    <div className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive font-medium border border-destructive/20">
                      {inlineError}
                    </div>
                  )}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Email Address</label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-10 w-full rounded-lg border border-input bg-card px-3 text-xs outline-none focus:ring-1.5 focus:ring-primary/30"
                      autoComplete="email"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">Password</label>
                      <button
                        type="button"
                        onClick={() => {
                          setInlineAuthMode('forgot-password')
                          setInlineError('')
                          setPassword('')
                        }}
                        className="text-[10px] text-primary font-bold hover:underline cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-10 w-full rounded-lg border border-input bg-card pl-3 pr-10 text-xs outline-none focus:ring-1.5 focus:ring-primary/30"
                        autoComplete="current-password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-1"
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={inlineLoading || !email || !password}
                    className="w-full rounded-lg bg-primary py-2.5 text-xs font-bold text-primary-foreground disabled:opacity-40 hover:opacity-90 transition-opacity mt-2 cursor-pointer shadow-xs flex items-center justify-center"
                  >
                    {inlineLoading && <Spinner />}
                    {inlineLoading ? 'Logging In...' : 'Log In to your Account'}
                  </button>
                </form>
              )}

              {/* 2. Register View */}
              {inlineAuthMode === 'register' && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (!inlineLoading && email.includes('@') && passwordValid) handleInlineSendRegisterOtp()
                  }}
                  className="space-y-4 pt-2 animate-in fade-in duration-200"
                >
                  {inlineError && (
                    <div className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive font-medium border border-destructive/20">
                      {inlineError}
                    </div>
                  )}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Email Address</label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-10 w-full rounded-lg border border-input bg-card px-3 text-xs outline-none focus:ring-1.5 focus:ring-primary/30"
                      autoComplete="email"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-10 w-full rounded-lg border border-input bg-card pl-3 pr-10 text-xs outline-none focus:ring-1.5 focus:ring-primary/30"
                        autoComplete="new-password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-1"
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>

                  {password.length > 0 && <PasswordRequirements password={password} />}

                  <button
                    type="submit"
                    disabled={inlineLoading || !email.includes('@') || !passwordValid}
                    className="w-full rounded-lg bg-primary py-2.5 text-xs font-bold text-primary-foreground disabled:opacity-40 hover:opacity-90 transition-opacity mt-2 cursor-pointer shadow-xs flex items-center justify-center"
                  >
                    {inlineLoading && <Spinner />}
                    {inlineLoading ? 'Sending OTP...' : 'Send Verification OTP'}
                  </button>
                </form>
              )}

              {/* 3. OTP Verification View */}
              {inlineAuthMode === 'otp' && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (!inlineLoading && inlineOtpCode.trim().length === 6) handleInlineVerifyRegisterOtp()
                  }}
                  className="space-y-4 pt-2 animate-in fade-in duration-200"
                >
                  <h3 className="text-sm font-bold text-foreground">Verify Your Email</h3>
                  <div className="rounded-lg bg-primary/10 p-3 text-xs text-primary font-medium leading-5">
                    {inlineOtpMessage || `Enter the 6-digit OTP code sent to ${email}.`}
                  </div>
                  {inlineError && (
                    <div className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive font-medium border border-destructive/20">
                      {inlineError}
                    </div>
                  )}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">6-Digit OTP Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="123456"
                      value={inlineOtpCode}
                      onChange={(e) => setInlineOtpCode(e.target.value.replace(/\D/g, ''))}
                      className="h-12 w-full rounded-lg border border-input bg-card px-3 text-center text-lg font-mono tracking-widest outline-none focus:ring-1.5 focus:ring-primary/30"
                      autoComplete="one-time-code"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={inlineLoading || inlineOtpCode.trim().length !== 6}
                    className="w-full rounded-lg bg-primary py-2.5 text-xs font-bold text-primary-foreground disabled:opacity-40 hover:opacity-90 transition-opacity mt-2 cursor-pointer shadow-xs flex items-center justify-center"
                  >
                    {inlineLoading && <Spinner />}
                    {inlineLoading ? 'Verifying...' : 'Verify & Create Account'}
                  </button>
                  <div className="flex justify-between text-[11px] pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setInlineAuthMode('register')
                        setInlineError('')
                        setPassword('')
                        setInlineOtpCode('')
                        setShowPassword(false)
                      }}
                      className="text-muted-foreground hover:underline cursor-pointer"
                    >
                      ← Edit Registration Details
                    </button>
                    <button
                      type="button"
                      onClick={handleInlineSendRegisterOtp}
                      className="text-primary hover:underline font-bold cursor-pointer"
                    >
                      Resend Code
                    </button>
                  </div>
                </form>
              )}

              {/* 4. Forgot Password View */}
              {inlineAuthMode === 'forgot-password' && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (!inlineLoading && email.includes('@')) handleInlineSendForgotPasswordOtp()
                  }}
                  className="space-y-4 pt-2 animate-in fade-in duration-200"
                >
                  <h3 className="text-sm font-bold text-foreground">Reset Password</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Enter the email address associated with your account, and we will send you a 6-digit OTP to reset your password.
                  </p>
                  {inlineError && (
                    <div className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive font-medium border border-destructive/20">
                      {inlineError}
                    </div>
                  )}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Email Address</label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-10 w-full rounded-lg border border-input bg-card px-3 text-xs outline-none focus:ring-1.5 focus:ring-primary/30"
                      autoComplete="email"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={inlineLoading || !email.includes('@')}
                    className="w-full rounded-lg bg-primary py-2.5 text-xs font-bold text-primary-foreground disabled:opacity-40 hover:opacity-90 transition-opacity mt-2 cursor-pointer shadow-xs flex items-center justify-center"
                  >
                    {inlineLoading && <Spinner />}
                    {inlineLoading ? 'Sending...' : 'Send Password Reset Code'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInlineAuthMode('login')
                      setInlineError('')
                      setPassword('')
                      setInlineOtpCode('')
                    }}
                    className="text-xs text-primary font-bold hover:underline block text-center w-full mt-2 cursor-pointer"
                  >
                    ← Back to Log In
                  </button>
                </form>
              )}

              {/* 5. Forgot Password Set New Password View */}
              {inlineAuthMode === 'forgot-password-otp' && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (
                      !inlineLoading &&
                      inlineOtpCode.trim().length === 6 &&
                      inlineNewPasswordValid &&
                      inlineNewPassword === inlineConfirmPassword
                    ) {
                      handleInlineResetPassword()
                    }
                  }}
                  className="space-y-4 pt-2 animate-in fade-in duration-200"
                >
                  <h3 className="text-sm font-bold text-foreground">Set New Password</h3>
                  <div className="rounded-lg bg-primary/10 p-3 text-xs text-primary font-medium leading-5">
                    {inlineOtpMessage || `Enter the 6-digit verification code sent to ${email} and your new password.`}
                  </div>
                  {inlineError && (
                    <div className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive font-medium border border-destructive/20">
                      {inlineError}
                    </div>
                  )}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Verification Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="123456"
                      value={inlineOtpCode}
                      onChange={(e) => setInlineOtpCode(e.target.value.replace(/\D/g, ''))}
                      className="h-10 w-full rounded-lg border border-input bg-card px-3 text-center font-mono tracking-widest outline-none focus:ring-1.5 focus:ring-primary/30"
                      autoComplete="one-time-code"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="••••••••••••"
                        value={inlineNewPassword}
                        onChange={(e) => setInlineNewPassword(e.target.value)}
                        className="h-10 w-full rounded-lg border border-input bg-card pl-3 pr-10 text-xs outline-none focus:ring-1.5 focus:ring-primary/30"
                        autoComplete="new-password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-1"
                      >
                        {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••••••"
                        value={inlineConfirmPassword}
                        onChange={(e) => setInlineConfirmPassword(e.target.value)}
                        className="h-10 w-full rounded-lg border border-input bg-card pl-3 pr-10 text-xs outline-none focus:ring-1.5 focus:ring-primary/30"
                        autoComplete="new-password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-1"
                      >
                        {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                    {inlineConfirmPassword.length > 0 && (
                      <p className={`text-[10px] font-semibold mt-1 ${inlineNewPassword === inlineConfirmPassword ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}>
                        {inlineNewPassword === inlineConfirmPassword ? '✓ Passwords match' : '× Passwords do not match'}
                      </p>
                    )}
                  </div>

                  {inlineNewPassword.length > 0 && <PasswordRequirements password={inlineNewPassword} />}

                  <button
                    type="submit"
                    disabled={
                      inlineLoading ||
                      inlineOtpCode.trim().length !== 6 ||
                      !inlineNewPasswordValid ||
                      inlineNewPassword !== inlineConfirmPassword
                    }
                    className="w-full rounded-lg bg-primary py-2.5 text-xs font-bold text-primary-foreground disabled:opacity-40 hover:opacity-90 transition-opacity mt-2 cursor-pointer shadow-xs flex items-center justify-center"
                  >
                    {inlineLoading && <Spinner />}
                    {inlineLoading ? 'Updating password...' : 'Reset Password'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInlineAuthMode('login')
                      setInlineError('')
                      setPassword('')
                      setInlineOtpCode('')
                      setInlineNewPassword('')
                      setInlineConfirmPassword('')
                      setShowNewPassword(false)
                      setShowConfirmPassword(false)
                    }}
                    className="text-xs text-primary font-bold hover:underline block text-center w-full mt-2 cursor-pointer"
                  >
                    ← Cancel & Back to Log In
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Trigger original Modal overlay if clicked for onboarding or registrations */}
          {authMode && (authMode === 'register' || authMode === 'onboarding') && (
            <AuthModal
              mode={authMode}
              setMode={setAuthMode}
              onSuccess={(user: any) => {
                setAuth('logged')
                updateMeState(user)
                loadUserData()
                notify('Welcome to Agora!')
              }}
              notify={notify}
            />
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200 antialiased">
      {/* Top Navbar Header (Agora Workspace Navigation) */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-md shadow-xs">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          
          {/* Brand Logo & Search */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted lg:hidden"
              aria-label="Toggle navigation menu"
            >
              <Menu className="size-5" />
            </button>
            
            <button onClick={() => navigateToView('Explore')} className="flex items-center gap-2 group">
              <span className="font-extrabold text-xl tracking-tight text-primary">Agora</span>
            </button>

            {/* Global Search Bar */}
            <div className="relative max-w-xs flex-1 ml-2">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search skills, members, topics..."
                value={searchVal}
                onChange={(e) => {
                  setSearchVal(e.target.value)
                  if (!e.target.value.trim()) {
                    setQuery('')
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setQuery(searchVal)
                  }
                }}
                className="h-8.5 w-full rounded-lg border border-input bg-secondary/50 pl-9 pr-8 text-xs outline-none focus:bg-background focus:ring-1.5 focus:ring-primary/40 focus:border-primary transition-all"
              />
              {searchVal && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchVal('')
                    setQuery('')
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-0.5"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Desktop Navigation Items */}
          <nav className="hidden lg:flex items-center gap-2 h-full">
            {[
              { id: 'Network', label: 'Network', icon: Users, badge: incomingRequests.length || null },
              { id: 'Messages', label: 'Messaging', icon: MessageCircle, badge: conversationsList.reduce((acc, c) => acc + (c.unreadCount || 0), 0) || null },
              { id: 'Notifications', label: 'Notifications', icon: Bell, badge: unreadNotifCount || null },
            ].map((item, idx) => {
              const Icon = item.icon
              const isActive = view === item.id
              return (
                <button
                  key={idx}
                  onClick={() => navigateToView(item.id as View)}
                  className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-primary/5 text-primary'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  }`}
                >
                  <Icon className="size-4" />
                  <span>{item.label}</span>
                  {item.badge ? (
                    <span className="flex size-4.5 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white shadow-xs">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              )
            })}

            {/* Profile Dropdown */}
            <div ref={dropdownRef} className="relative border-l border-border pl-3 ml-2 h-8 flex items-center">
              {auth === 'logged' ? (
                <div className="relative">
                  <button
                    onClick={() => setMeDropdownOpen(!meDropdownOpen)}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Avatar person={me} />
                    <ChevronDown className="size-3 ml-0.5" />
                  </button>

                  {/* Me Dropdown Menu */}
                  {meDropdownOpen && (
                    <div
                      className="absolute right-0 top-10 z-50 w-72 rounded-xl border border-border bg-card p-3 shadow-xl space-y-3"
                      onClick={() => setMeDropdownOpen(false)}
                    >
                      {/* Mini Header Card */}
                      <div className="flex items-center gap-3 pb-3 border-b border-border">
                        <Avatar person={me} large />
                        <div className="flex-1 overflow-hidden">
                          <p className="font-bold text-xs text-foreground truncate">{me.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{myProfileData.bio || me.role || 'Agora Member'}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => navigateToView('Profile')}
                        className="w-full rounded-lg border border-primary text-xs font-bold text-primary py-1.5 hover:bg-primary/5 transition-colors"
                      >
                        View Profile
                      </button>

                      {/* Account Section */}
                      <div className="pt-2 border-t border-border space-y-1.5 text-xs text-foreground font-semibold">
                        <p className="text-muted-foreground font-normal text-[10px]">Account Settings</p>
                        <button
                          onClick={() => navigateToView('Settings')}
                          className="w-full text-left py-1 text-xs hover:underline flex items-center gap-2"
                        >
                          <Settings className="size-3.5 text-muted-foreground" /> Settings & Preferences
                        </button>
                        <button
                          onClick={() => navigateToView('Settings')}
                          className="w-full text-left py-1 text-xs hover:underline flex items-center gap-2"
                        >
                          <Shield className="size-3.5 text-muted-foreground" /> Privacy & Security
                        </button>
                      </div>

                      {/* Sign Out */}
                      <div className="pt-2 border-t border-border space-y-1.5 text-xs text-foreground font-semibold">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left py-1.5 text-xs text-destructive hover:underline"
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setAuthMode('login')}
                  className="rounded-lg bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  Log in
                </button>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        
        {/* Mobile Navigation Menu Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setMobileMenuOpen(false)}>
            <div className="h-full w-64 bg-card p-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
                <span className="font-bold text-base tracking-tight">Agora</span>
                <button onClick={() => setMobileMenuOpen(false)} className="rounded-lg p-1 text-muted-foreground">
                  <X className="size-5" />
                </button>
              </div>
              <div className="flex flex-col gap-1">
                {['Explore', 'Network', 'Messages', 'Notifications', 'Profile', 'Settings'].map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      navigateToView(item as View)
                      setMobileMenuOpen(false)
                    }}
                    className={`rounded-lg px-4 py-3 text-left text-xs font-bold ${view === item ? 'bg-primary/5 text-primary' : 'hover:bg-muted'}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* View Shell */}
        <main className="w-full">
          {view === 'Explore' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              
              {/* Left Column: Discovery Filters Panel */}
              <aside className="hidden lg:block lg:col-span-1 space-y-6">
                
                {/* Horizontal / Vertical Filter Panel (Dashboard Style) */}
                <div className="bg-card rounded-xl border border-border p-5 space-y-4 shadow-xs">
                  <h3 className="font-bold text-xs text-foreground uppercase tracking-wider">Discovery Filters</h3>
                  <div className="flex flex-col gap-1.5">
                    {[
                      { key: 'all', label: 'All Members' },
                      { key: 'match', label: 'Recommended Matches' },
                      { key: 'teach', label: 'Available to Teach' },
                      { key: 'learn', label: 'Looking to Learn' },
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => {
                          setFilter(tab.key as any)
                          if (tab.key === 'all') {
                            setQuery('')
                            setSearchVal('')
                          }
                        }}
                        className={`w-full text-left rounded-lg px-3 py-2 text-xs font-semibold transition-all border ${
                          filter === tab.key
                            ? 'bg-primary/5 text-primary border-primary/20 font-bold'
                            : 'border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-border pt-4 space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase block">Location Filter</label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="h-9 w-full px-3 text-xs bg-card border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23666%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:14px_14px] bg-[right_10px_center] pr-8 cursor-pointer shadow-2xs hover:border-muted-foreground/30 transition-all"
                    >
                      {countries.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Left Mini Widget: My Summary Info */}
                <div className="bg-card rounded-xl border border-border p-5 space-y-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <Avatar person={me} large />
                    <div>
                      <h4 className="font-bold text-xs text-foreground">{me.name}</h4>
                      <p className="text-[10px] text-muted-foreground line-clamp-1">{myProfileData.bio || me.role}</p>
                    </div>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between text-[11px] text-muted-foreground">
                    <span>Connections</span>
                    <span className="font-bold text-foreground">{connectionsCount}</span>
                  </div>
                </div>

              </aside>

              {/* Right Columns: Member Grid */}
              <section className="lg:col-span-3 space-y-4">
                
                {/* Mobile Filter Tabs (Visible only on mobile/tablet) */}
                <div className="lg:hidden bg-card rounded-xl border border-border p-3 flex flex-col gap-3 shadow-xs mb-4">
                  <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {[
                      { key: 'all', label: 'All Members' },
                      { key: 'match', label: 'Recommended Matches' },
                      { key: 'teach', label: 'Available to Teach' },
                      { key: 'learn', label: 'Looking to Learn' },
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => {
                          setFilter(tab.key as any)
                          if (tab.key === 'all') {
                            setQuery('')
                            setSearchVal('')
                          }
                        }}
                        className={`rounded-full px-4 py-1.5 text-xs font-semibold whitespace-nowrap border transition-all ${
                          filter === tab.key
                            ? 'bg-primary text-primary-foreground border-primary font-bold'
                            : 'border-border text-muted-foreground hover:bg-muted/40'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between gap-3 border-t border-border pt-2 text-xs">
                    <span className="font-semibold text-[10px] text-muted-foreground uppercase flex items-center gap-1">
                      <MapPin className="size-3 text-primary" /> Location
                    </span>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="h-8.5 px-3 text-xs bg-card border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23666%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:12px_12px] bg-[right_8px_center] pr-6 cursor-pointer shadow-2xs transition-all"
                    >
                      {countries.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Search Metadata Header */}
                <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                  <span>Showing {shown.length} members based on filter preferences</span>
                </div>

                {/* Member Grid Layout (Diverges from LinkedIn stream) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {shown.map((person) => {
                    const matchScore = getMatchScore(me, person)
                    const isPending = isRequestPending(person.id)

                    return (
                      <div
                        key={person.id}
                        className="bg-card rounded-xl border border-border p-5 flex flex-col justify-between gap-4.5 hover:shadow-xs transition-all duration-200 relative group"
                      >
                        {/* Match Tag Badge in Top Right */}
                        {matchScore === 95 && (
                          <span className="absolute top-4 right-4 inline-flex items-center rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-700 border border-emerald-200/60 px-2.5 py-0.5 shadow-2xs">
                            Strong Match
                          </span>
                        )}

                        <div className="space-y-3">
                          {/* Member Main Metadata Header */}
                          <button onClick={() => setProfile(person)} className="flex items-start gap-3.5 text-left w-full">
                            <Avatar person={person} large />
                            <div className="space-y-0.5">
                              <h3 className="font-bold text-xs text-foreground group-hover:text-primary hover:underline transition-colors">{person.name}</h3>
                              <p className="text-[11px] text-muted-foreground line-clamp-1">{person.about || person.role}</p>
                              <span className="text-[10px] bg-secondary/70 text-secondary-foreground inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-medium mt-1">
                                <MapPin className="size-3 text-primary" /> {person.location}
                              </span>
                            </div>
                          </button>

                          {/* Structured Skill Sets */}
                          <div className="pt-3 border-t border-border space-y-2">
                            {person.teaches.length > 0 && (
                              <div className="text-[11px] leading-relaxed">
                                <span className="text-muted-foreground font-semibold block text-[10px] uppercase tracking-wider mb-1">Teaches</span>
                                <div className="flex flex-wrap gap-1">
                                  {person.teaches.slice(0, 3).map((s) => (
                                    <Chip key={s}>{s}</Chip>
                                  ))}
                                </div>
                              </div>
                            )}
                            {person.learns.length > 0 && (
                              <div className="text-[11px] leading-relaxed">
                                <span className="text-muted-foreground font-semibold block text-[10px] uppercase tracking-wider mb-1">Wants to Learn</span>
                                <div className="flex flex-wrap gap-1">
                                  {person.learns.slice(0, 3).map((s) => (
                                    <Chip key={s} muted>{s}</Chip>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Interactive Buttons */}
                        <div className="flex items-center gap-2 pt-3 border-t border-border justify-end">
                          <button
                            onClick={() => startConversation(person.id)}
                            className="px-4 py-1.5 rounded-lg border border-primary text-xs font-bold text-primary hover:bg-primary/5 transition-all"
                          >
                            Message
                          </button>

                          {isPending ? (
                            <button
                              onClick={() => withdrawConnectionRequest(person.id)}
                              className="px-4 py-1.5 rounded-lg border border-border bg-muted/30 text-xs font-bold text-foreground hover:bg-muted transition-all flex items-center justify-center min-w-[80px] cursor-pointer"
                              title="Click to withdraw follow request"
                            >
                              Requested
                            </button>
                          ) : (
                            <button
                              onClick={() => sendConnectionRequest(person.id)}
                              className="px-4 py-1.5 rounded-lg bg-primary text-xs font-bold text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer"
                            >
                              Follow
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}

                  {shown.length === 0 && (
                    <div className="bg-card rounded-xl border border-border p-12 text-center col-span-2">
                      <p className="text-sm font-semibold">No member profiles found</p>
                      <p className="mt-1 text-xs text-muted-foreground">Try tweaking your discovery filters or locations selection.</p>
                    </div>
                  )}
                </div>
              </section>

            </div>
          )}

          {view === 'Network' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Left Column: Quick Profile Info Block (Desktop Only) */}
              <aside className="hidden lg:block lg:col-span-1 space-y-6">
                <div className="bg-card rounded-xl border border-border p-5 space-y-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <Avatar person={me} large />
                    <div>
                      <h4 className="font-bold text-xs text-foreground">{me.name}</h4>
                      <p className="text-[10px] text-muted-foreground line-clamp-1">{myProfileData.bio || me.role}</p>
                    </div>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1 font-semibold">
                      <Users className="size-3 text-muted-foreground" /> Followers
                    </span>
                    <span className="font-bold text-foreground">{connectionsCount}</span>
                  </div>
                </div>
              </aside>

              {/* Right Column: Network Management Tabs and Lists */}
              <section className="lg:col-span-3 space-y-4">
                <div className="bg-card rounded-xl border border-border overflow-hidden shadow-xs">
                  {/* Tab Navigation */}
                  <div className="flex border-b border-border bg-slate-50/50">
                    {[
                      { key: 'received', label: 'Received Requests', count: incomingRequests.length },
                      { key: 'sent', label: 'Sent Requests', count: outgoingRequests.length },
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setNetworkTab(tab.key as any)}
                        className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all ${
                          networkTab === tab.key
                            ? 'border-primary text-primary bg-background'
                            : 'border-transparent text-muted-foreground hover:bg-muted/40'
                        }`}
                      >
                        {tab.label}
                        {tab.count > 0 && (
                          <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                            {tab.count}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Tab Content Panels */}
                  <div className="p-5">
                    {networkTab === 'received' && (
                      <div className="space-y-3">
                        {incomingRequests
                          .filter((req) => !rejectedRequests.has(req.id))
                          .map((req) => {
                            const isAccepted = acceptedRequests.has(req.id)
                            return (
                              <div key={req.id} className="flex items-center justify-between rounded-xl border border-border p-4 shadow-2xs">
                                <button onClick={() => setProfile(req.sender)} className="flex items-center gap-3 text-left">
                                  <Avatar person={{ name: req.sender?.name, username: req.sender?.username, image: req.sender?.profileImage }} />
                                  <div>
                                    <p className="text-xs font-bold text-foreground hover:underline">
                                      {req.sender?.name || req.sender?.username}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">
                                      @{req.sender?.username} · {req.sender?.country || 'Global'}
                                    </p>
                                  </div>
                                </button>
                                {isAccepted ? (
                                  <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                                      <Check className="size-3.5" strokeWidth={3} /> Connected
                                    </span>
                                    <button
                                      onClick={() => startConversation(req.senderId)}
                                      className="rounded-lg bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer animate-in zoom-in-95 duration-150"
                                    >
                                      Message
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => respondConnectionRequest(req.id, 'accept')}
                                      className="rounded-lg bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer"
                                    >
                                      Accept
                                    </button>
                                    <button
                                      onClick={() => respondConnectionRequest(req.id, 'reject')}
                                      className="rounded-lg border border-border px-3.5 py-1.5 text-xs font-semibold hover:bg-muted text-foreground transition-colors cursor-pointer"
                                    >
                                      Ignore
                                    </button>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        {incomingRequests.filter((req) => !rejectedRequests.has(req.id)).length === 0 && (
                          <div className="text-center py-8 text-xs text-muted-foreground">
                            No received follow requests.
                          </div>
                        )}
                      </div>
                    )}

                    {networkTab === 'sent' && (
                      <div className="space-y-3">
                        {outgoingRequests.map((req) => (
                          <div key={req.id} className="flex items-center justify-between rounded-xl border border-border p-4 shadow-2xs">
                            <button onClick={() => setProfile(req.receiver)} className="flex items-center gap-3 text-left">
                              <Avatar person={{ name: req.receiver?.name, username: req.receiver?.username, image: req.receiver?.profileImage }} />
                              <div>
                                <p className="text-xs font-bold text-foreground hover:underline">
                                  {req.receiver?.name || req.receiver?.username}
                                </p>
                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                  @{req.receiver?.username} · {req.receiver?.country || 'Global'}
                                </p>
                              </div>
                            </button>
                            <button
                              onClick={() => withdrawConnectionRequest(req.receiverId)}
                              className="rounded-lg border border-border bg-muted/30 px-3.5 py-1.5 text-xs font-bold text-foreground hover:bg-muted transition-colors cursor-pointer"
                            >
                              Requested
                            </button>
                          </div>
                        ))}
                        {outgoingRequests.length === 0 && (
                          <div className="text-center py-8 text-xs text-muted-foreground">
                            No sent follow requests.
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                </div>
              </section>
            </div>
          )}

          {view === 'Messages' && (
            <section className="mx-auto max-w-5xl">
              <div className="flex h-[78vh] overflow-hidden rounded-xl border border-border bg-card shadow-xs">
                {/* Conversations Sidebar */}
                <div className={`w-full lg:w-80 border-r border-border flex flex-col bg-card shrink-0 ${activeChat ? 'hidden lg:flex' : 'flex'}`}>
                  <div className="p-4.5 border-b border-border font-bold text-sm text-foreground space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="tracking-tight">Conversations</span>
                    </div>
                    {/* Conversations Search */}
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search chats..."
                        value={searchChatQuery}
                        onChange={(e) => setSearchChatQuery(e.target.value)}
                        className="h-8 w-full rounded-lg border border-input bg-secondary/30 pl-8 pr-3 text-xs outline-none focus:bg-background focus:ring-1 focus:ring-primary/30 transition-all"
                      />
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {conversationsList
                      .filter((conv) => {
                        const name = conv.participant?.name || ''
                        const username = conv.participant?.username || ''
                        const q = searchChatQuery.toLowerCase()
                        return name.toLowerCase().includes(q) || username.toLowerCase().includes(q)
                      })
                      .map((conv) => {
                        const active = activeChat === conv.id
                        const partner = conv.participant
                        return (
                          <button
                            key={conv.id}
                            onClick={() => setActiveChat(conv.id)}
                            className={`flex w-full items-center gap-3 p-3 rounded-lg text-left transition-all ${
                              active
                                ? 'bg-primary/5 text-primary font-semibold border-l-2 border-primary'
                                : 'hover:bg-muted/40 text-foreground'
                            }`}
                          >
                            <Avatar person={{ name: partner?.name, username: partner?.username, image: partner?.profileImage }} />
                            <div className="flex-1 overflow-hidden">
                              <p className="truncate text-xs font-bold">{partner?.name || partner?.username || 'User'}</p>
                              <p className="truncate text-[10px] text-muted-foreground mt-0.5">
                                {conv.lastMessage?.content || 'New chat started'}
                              </p>
                            </div>
                          </button>
                        )
                      })}
                    {conversationsList.length === 0 && (
                      <div className="p-6 text-center text-xs text-muted-foreground">No active messages yet.</div>
                    )}
                  </div>
                </div>

                {/* Active Chat Pane */}
                <div className={`flex-1 flex flex-col bg-card ${!activeChat ? 'hidden lg:flex' : 'flex'}`}>
                  {activeChat ? (
                    <>
                      {/* Chat Header Bar */}
                      {(() => {
                        const currentConv = conversationsList.find((c) => c.id === activeChat)
                        const partner = currentConv?.participant
                        return (
                          <div className="flex items-center justify-between border-b border-border p-4.5">
                            <div className="flex items-center">
                              {/* Mobile Back Button */}
                              <button
                                onClick={() => setActiveChat(null)}
                                className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:bg-muted mr-2 transition-colors"
                                title="Back to conversations"
                              >
                                <ArrowLeft className="size-4" />
                              </button>

                              <button
                                onClick={() => {
                                  if (partner) {
                                    setActivePartnerModal({
                                      id: partner.id,
                                      name: partner.name || partner.username,
                                      username: partner.username,
                                      role: 'Agora Member',
                                      location: partner.country || 'Anywhere',
                                      initials: (partner.name || partner.username || 'U').slice(0, 2).toUpperCase(),
                                      tone: 'bg-primary text-primary-foreground',
                                      teaches: partner.skillsToTeach || [],
                                      learns: partner.skillsToLearn || [],
                                      about: partner.bio || '',
                                      image: partner.profileImage || '',
                                    })
                                  }
                                }}
                                className="flex items-center gap-3 text-left hover:opacity-85 transition-opacity"
                              >
                                <Avatar person={{ name: partner?.name, username: partner?.username, image: partner?.profileImage }} />
                                <div>
                                  <p className="font-bold text-xs text-foreground hover:underline">{partner?.name || partner?.username}</p>
                                  <p className="text-[10px] text-muted-foreground">@{partner?.username} · Online</p>
                                </div>
                              </button>
                            </div>

                            {/* Block User Button in Chat Header */}
                            {partner && (
                              <button
                                onClick={async () => {
                                  if (window.confirm(`Are you sure you want to block ${partner.name || partner.username}?`)) {
                                    try {
                                      const res = await fetch('/api/user/block', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ targetUserId: partner.id || partner._id }),
                                      })
                                      if (res.ok) {
                                        notify('User blocked')
                                        setActiveChat(null)
                                        loadUserData()
                                      } else {
                                        const d = await res.json()
                                        notify(d.error || 'Failed to block user')
                                      }
                                    } catch {
                                      notify('Network error blocking user')
                                    }
                                  }
                                }}
                                className="p-2 rounded-lg border border-destructive/20 bg-destructive/5 text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                                title={`Block ${partner.name || partner.username}`}
                              >
                                <Ban className="size-4" />
                              </button>
                            )}
                          </div>
                        )
                      })()}

                      {/* Messages History */}
                      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3.5 bg-slate-50/30 dark:bg-slate-900/5">
                        {chatHistory.map((msg) => {
                          const isMe = msg.senderId === me.id
                          return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                              <div
                                className={`max-w-[70%] rounded-xl px-4 py-2 text-xs leading-relaxed shadow-2xs ${
                                  isMe
                                    ? 'bg-primary text-primary-foreground rounded-br-none'
                                    : 'bg-card text-foreground border border-border rounded-bl-none'
                                }`}
                              >
                                {msg.content}
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {/* Input Field Composer */}
                      <div className="p-4 border-t border-border bg-card flex gap-2">
                        <input
                          type="text"
                          placeholder="Type your reply..."
                          value={chatMessage}
                          onChange={(e) => setChatMessage(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                          className="h-9.5 flex-1 rounded-lg border border-input bg-background px-4 text-xs outline-none focus:ring-1.5 focus:ring-primary/30"
                        />
                        <button onClick={sendMessage} className="flex size-9.5 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                          <Send className="size-4" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-1 items-center justify-center text-xs text-muted-foreground">
                      Select a contact on the left side to continue chatting.
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {view === 'Notifications' && (
            <section className="mx-auto max-w-3xl space-y-5">
              <div className="flex items-center justify-between">
                <h1 className="text-lg font-bold text-foreground tracking-tight">Notifications & Activity</h1>
                {notificationsList.length > 0 && (
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch('/api/notifications', {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ markAllRead: true }),
                        })
                        if (res.ok) {
                          loadUserData()
                        }
                      } catch {
                        // ignore
                      }
                    }}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {me.notificationPreference === false ? (
                  <div className="rounded-xl border border-border bg-card p-12 text-center text-xs text-muted-foreground shadow-2xs">
                    Notifications are disabled. Enable them in Settings to receive activity alerts.
                  </div>
                ) : (
                  <>
                    {notificationsList
                      .filter((notif) => !rejectedRequests.has(notif.referenceId))
                      .map((notif) => {
                        const triggerUser = notif.triggerUser
                        const initials = triggerUser ? (triggerUser.name || triggerUser.username || 'U').slice(0, 2).toUpperCase() : 'U'
                        const isAccepted = acceptedRequests.has(notif.referenceId)

                        return (
                          <div
                            key={notif.id}
                            className={`flex items-center justify-between rounded-xl border p-4.5 shadow-2xs transition-all ${
                              notif.read ? 'border-border bg-card' : 'border-primary/20 bg-primary/5'
                            }`}
                          >
                            <div className="flex items-center gap-3.5">
                              {triggerUser ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const triggerPerson = {
                                      id: triggerUser.id || triggerUser._id,
                                      name: triggerUser.name || triggerUser.username,
                                      username: triggerUser.username,
                                      role: triggerUser.role || (triggerUser.skillsToTeach?.[0] ? `${triggerUser.skillsToTeach[0]} Mentor` : 'Member'),
                                      location: triggerUser.location || triggerUser.country || 'Anywhere',
                                      initials: triggerUser.initials || (triggerUser.name || triggerUser.username || 'U').slice(0, 2).toUpperCase(),
                                      tone: 'bg-accent text-accent-foreground',
                                      teaches: triggerUser.teaches || triggerUser.skillsToTeach || [],
                                      learns: triggerUser.learns || triggerUser.skillsToLearn || [],
                                      about: triggerUser.about || triggerUser.bio || '',
                                      image: triggerUser.image || triggerUser.profileImage || '',
                                      links: triggerUser.links || [],
                                      connectionsCount: triggerUser.connectionsCount || 0,
                                    }
                                    setProfile(triggerPerson)
                                  }}
                                  className="flex items-center gap-3.5 text-left hover:underline group cursor-pointer"
                                >
                                  <Avatar person={{ name: triggerUser.name, username: triggerUser.username, image: triggerUser.profileImage }} />
                                  <div>
                                    <p className="text-xs text-foreground">
                                      <span className="font-bold group-hover:text-primary transition-colors">{triggerUser.name || triggerUser.username} </span>
                                      <span className="text-muted-foreground">
                                        {notif.type === 'connection_request' && 'sent you a follow request.'}
                                        {notif.type === 'connection_accepted' && 'accepted your follow request.'}
                                        {notif.type === 'new_message' && 'sent you a new message.'}
                                      </span>
                                    </p>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">
                                      {new Date(notif.createdAt).toLocaleDateString()} · {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  </div>
                                </button>
                              ) : (
                                <>
                                  <div className={`size-9 rounded-full flex items-center justify-center font-bold text-xs ${me.tone || 'bg-accent text-accent-foreground'}`}>
                                    {initials}
                                  </div>
                                  <div>
                                    <p className="text-xs text-foreground">
                                      <span className="font-bold">Someone </span>
                                      <span className="text-muted-foreground">
                                        {notif.type === 'connection_request' && 'sent you a follow request.'}
                                        {notif.type === 'connection_accepted' && 'accepted your follow request.'}
                                        {notif.type === 'new_message' && 'sent you a new message.'}
                                      </span>
                                    </p>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">
                                      {new Date(notif.createdAt).toLocaleDateString()} · {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  </div>
                                </>
                              )}
                            </div>

                            <div className="flex gap-2">
                              {notif.type === 'connection_request' && (
                                <>
                                  {isAccepted ? (
                                    <div className="flex items-center gap-2.5">
                                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                                        <Check className="size-3" strokeWidth={3} /> Connected
                                      </span>
                                      <button
                                        onClick={() => startConversation(triggerUser?.id || triggerUser?._id)}
                                        className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:opacity-90 cursor-pointer"
                                      >
                                        Message
                                      </button>
                                    </div>
                                  ) : (
                                    <>
                                      <button
                                        onClick={() => respondConnectionRequest(notif.referenceId, 'accept')}
                                        className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:opacity-90 cursor-pointer"
                                      >
                                        Accept
                                      </button>
                                      <button
                                        onClick={() => respondConnectionRequest(notif.referenceId, 'reject')}
                                        className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted text-foreground cursor-pointer"
                                      >
                                        Ignore
                                      </button>
                                    </>
                                  )}
                                </>
                              )}
                              {notif.type === 'new_message' && (
                                <button
                                  onClick={() => {
                                    setActiveChat(notif.referenceId)
                                    navigateToView('Messages')
                                  }}
                                  className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:opacity-90 cursor-pointer"
                                >
                                  View Chat
                                </button>
                              )}
                              {!notif.read && notif.type !== 'connection_request' && (
                                <button
                                  onClick={async () => {
                                    try {
                                      const res = await fetch('/api/notifications', {
                                        method: 'PATCH',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ notificationId: notif.id }),
                                      })
                                      if (res.ok) {
                                        loadUserData()
                                      }
                                    } catch {
                                      // ignore
                                    }
                                  }}
                                  className="text-[10px] text-muted-foreground hover:text-foreground font-semibold px-2 cursor-pointer"
                                >
                                  Mark Read
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      })}

                    {notificationsList.length === 0 && (
                      <div className="rounded-xl border border-border bg-card p-12 text-center text-xs text-muted-foreground shadow-2xs">
                        No new updates or alerts.
                      </div>
                    )}
                  </>
                )}
              </div>
            </section>
          )}

          {view === 'Profile' && (
            <ProfileView
              me={me}
              auth={auth}
              data={myProfileData}
              completion={completion}
              connectionsCount={connectionsCount}
              connections={connections}
              setAuthMode={setAuthMode}
              setView={navigateToView}
              onSave={saveProfile}
              onLogout={handleLogout}
              onViewMember={async (id) => {
                const found = peopleList.find((p) => p.id === id || p.username === id)
                if (found) {
                  setProfile(found)
                } else {
                  try {
                    const res = await fetch(`/api/users?q=${id}`)
                    if (res.ok) {
                      const data = await res.json()
                      const matched = (data.people || data.users)?.find((u: any) => u.username === id || u.id === id || u._id === id)
                      if (matched) {
                        setProfile({
                          id: matched.id || matched._id,
                          name: matched.name || matched.username,
                          username: matched.username,
                          role: matched.role || (matched.skillsToTeach?.[0] ? `${matched.skillsToTeach[0]} Mentor` : 'Member'),
                          location: matched.location || matched.country || 'Anywhere',
                          initials: matched.initials || (matched.name || matched.username || 'U').slice(0, 2).toUpperCase(),
                          tone: 'bg-accent text-accent-foreground',
                          teaches: matched.teaches || matched.skillsToTeach || [],
                          learns: matched.learns || matched.skillsToLearn || [],
                          about: matched.about || matched.bio || '',
                          image: matched.image || matched.profileImage || '',
                          links: matched.links || [],
                          connectionsCount: matched.connectionsCount || 0,
                        })
                      }
                    }
                  } catch (e) {
                    console.error(e)
                  }
                }
              }}
            />
          )}

          {view === 'Settings' && (
            <SettingsView
              me={me}
              blocked={blockedUsers}
              unblock={handleUnblock}
              onDelete={handleDeleteAccount}
              onUpdateSettings={async (updatedSettings) => {
                try {
                  const res = await fetch('/api/user/profile', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedSettings),
                  })
                  if (res.ok) {
                    const data = await res.json()
                    updateMeState(data.profile || data.user)
                  }
                } catch {
                  // ignore
                }
              }}
            />
          )}
        </main>
      </div>

      {/* Floating Bottom-Right Messaging Drawer */}
      <div className="fixed bottom-0 right-6 z-40 w-72 rounded-t-xl border border-border bg-card shadow-lg overflow-hidden hidden sm:block">
        <button
          onClick={() => setMessagingDrawerOpen(!messagingDrawerOpen)}
          className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/20 hover:bg-muted/40 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-xs text-foreground">Active Chats</span>
          </div>
          <ChevronDown className={`size-4 text-muted-foreground transition-transform ${messagingDrawerOpen ? 'rotate-180' : ''}`} />
        </button>

        {messagingDrawerOpen && (
          <div className="h-80 flex flex-col bg-card">
            <div className="flex-1 overflow-y-auto p-1 divide-y divide-border">
              {conversationsList.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => {
                    setActiveChat(conv.id)
                    navigateToView('Messages')
                  }}
                  className="flex items-center gap-3 p-2.5 hover:bg-muted/40 cursor-pointer text-xs rounded-lg transition-colors"
                >
                  <Avatar person={{ name: conv.participant?.name, image: conv.participant?.profileImage }} />
                  <div className="flex-1 overflow-hidden">
                    <p className="font-bold text-foreground truncate">{conv.participant?.name || 'User'}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{conv.lastMessage?.content || 'Continue messaging'}</p>
                  </div>
                </div>
              ))}
              {conversationsList.length === 0 && (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  No active messaging threads yet.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Member Profile Modal Overlay */}
      {(profile || activePartnerModal) && (
        <Modal title="Member Profile" close={() => { setProfile(null); setActivePartnerModal(null); }}>
          {(() => {
            const target = profile || activePartnerModal!
            const isConnected = isMemberConnected(target.id)
            const isPending = isRequestPending(target.id)

            return (
              <div className="flex flex-col gap-4.5 p-1">
                <div className="flex items-center gap-4.5 border-b border-border pb-4">
                  <Avatar person={target} large />
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-foreground">{target.name}</h3>
                    <p className="text-xs text-muted-foreground">@{target.username} · {target.location}</p>
                    <p className="text-[10px] font-bold text-primary bg-primary/5 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                      <Users className="size-3 text-primary" /> {target.connectionsCount || 0} Followers
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">About</span>
                  <p className="text-xs text-foreground leading-relaxed">{target.about || 'No description provided.'}</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Teaches</span>
                    <div className="flex flex-wrap gap-1">
                      {target.teaches.map((s) => (
                        <Chip key={s}>{s}</Chip>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Wants to Learn</span>
                    <div className="flex flex-wrap gap-1">
                      {target.learns.map((s) => (
                        <Chip key={s} muted>{s}</Chip>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2 border-t border-border pt-4">
                  {isConnected ? (
                    <>
                      <button onClick={() => { setProfile(null); setActivePartnerModal(null); startConversation(target.id); }} className="flex-1 rounded-lg bg-primary py-2 text-xs font-bold text-primary-foreground hover:opacity-90 transition-opacity">
                        Send Message
                      </button>
                      <button
                        onClick={async () => {
                          if (window.confirm(`Are you sure you want to block ${target.name}?`)) {
                            try {
                              const res = await fetch('/api/user/block', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ targetUserId: target.id }),
                              })
                              if (res.ok) {
                                notify('User blocked')
                                setProfile(null)
                                setActivePartnerModal(null)
                                loadUserData()
                              } else {
                                const d = await res.json()
                                notify(d.error || 'Failed to block user')
                              }
                            } catch {
                              notify('Network error')
                            }
                          }
                        }}
                        className="rounded-lg border border-destructive/20 bg-destructive/5 p-2 text-destructive hover:bg-destructive/10 transition-colors flex items-center justify-center cursor-pointer"
                        title={`Block ${target.name}`}
                      >
                        <Ban className="size-4" />
                      </button>
                    </>
                  ) : isPending ? (
                    <button
                      onClick={() => withdrawConnectionRequest(target.id)}
                      className="w-full rounded-lg border border-border bg-muted/30 text-xs font-bold text-foreground hover:bg-muted py-2 transition-colors cursor-pointer"
                    >
                      Requested
                    </button>
                  ) : (
                    <button onClick={() => sendConnectionRequest(target.id)} className="w-full rounded-lg bg-primary py-2 text-xs font-bold text-primary-foreground hover:opacity-90 transition-opacity">
                      Follow
                    </button>
                  )}
                </div>
              </div>
            )
          })()}
        </Modal>
      )}

      {/* Auth Modal */}
      {authMode && (
        <AuthModal
          mode={authMode}
          setMode={setAuthMode}
          onSuccess={(user: any) => {
            setAuth('logged')
            updateMeState(user)
            loadUserData()
            notify('Welcome to Agora!')
          }}
          notify={notify}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <div role="status" className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
          {toast}
        </div>
      )}
    </div>
  )
}
