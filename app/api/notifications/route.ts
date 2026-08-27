import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongodb'
import { Notification } from '@/lib/db/models/Notification'
import { ConnectionRequest } from '@/lib/db/models/ConnectionRequest'
import { Conversation } from '@/lib/db/models/Conversation'
import { User } from '@/lib/db/models/User'
import { getAuthFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthFromRequest(req)
    if (!auth) {
      return NextResponse.json({ notifications: [], unreadCount: 0 }, { status: 401 })
    }

    await connectDB()

    const user = await User.findById(auth.userId)
    if (!user || user.notificationPreference === false) {
      return NextResponse.json({ notifications: [], unreadCount: 0 }, { status: 200 })
    }

    const notifications = await Notification.find({ recipientId: auth.userId })
      .sort({ createdAt: -1 })
      .limit(50)

    const refIds = notifications.map(n => n.referenceId).filter((id): id is string => !!id)
    
    const [requests, conversations] = await Promise.all([
      ConnectionRequest.find({ _id: { $in: refIds } })
        .populate('senderId', 'name username profileImage bio country')
        .populate('receiverId', 'name username profileImage bio country'),
      Conversation.find({ _id: { $in: refIds } })
        .populate('participants', 'name username profileImage bio country')
    ])

    const requestMap = new Map(requests.map(r => [r._id.toString(), r]))
    const conversationMap = new Map(conversations.map(c => [c._id.toString(), c]))

    const formatted = notifications.map(n => {
      let triggerUser: any = null
      if (n.type === 'new_message') {
        const conv = n.referenceId ? conversationMap.get(n.referenceId) : null
        if (conv) {
          const other = (conv.participants as any[]).find((p: any) => p._id.toString() !== auth.userId)
          if (other) {
            triggerUser = {
              id: other._id.toString(),
              name: other.name || other.username,
              username: other.username,
              profileImage: other.profileImage,
              bio: other.bio,
              country: other.country,
            }
          }
        }
      } else {
        const reqInfo = n.referenceId ? requestMap.get(n.referenceId) : null
        if (reqInfo) {
          const sender = reqInfo.senderId as any
          const receiver = reqInfo.receiverId as any
          const other = sender._id.toString() === auth.userId ? receiver : sender
          if (other) {
            triggerUser = {
              id: other._id.toString(),
              name: other.name || other.username,
              username: other.username,
              profileImage: other.profileImage,
              bio: other.bio,
              country: other.country,
            }
          }
        }
      }

      return {
        id: n._id.toString(),
        type: n.type,
        referenceId: n.referenceId,
        read: n.read,
        createdAt: n.createdAt,
        triggerUser,
      }
    })

    const unreadCount = notifications.filter(n => !n.read).length

    return NextResponse.json({
      notifications: formatted,
      unreadCount,
    })
  } catch (error: any) {
    console.error('Get notifications error:', error)
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = getAuthFromRequest(req)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { notificationId, markAllRead } = await req.json()

    await connectDB()

    if (markAllRead) {
      await Notification.updateMany({ recipientId: auth.userId, read: false }, { read: true })
      return NextResponse.json({ message: 'All notifications marked as read' })
    }

    if (notificationId) {
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, recipientId: auth.userId },
        { read: true },
        { new: true }
      )
      if (!notification) {
        return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
      }
      return NextResponse.json({ notification, message: 'Notification marked as read' })
    }

    return NextResponse.json({ error: 'notificationId or markAllRead required' }, { status: 400 })
  } catch (error: any) {
    console.error('Update notification error:', error)
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 })
  }
}
