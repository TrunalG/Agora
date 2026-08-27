import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongodb'
import { Conversation } from '@/lib/db/models/Conversation'
import { Message } from '@/lib/db/models/Message'
import { Notification } from '@/lib/db/models/Notification'
import { User } from '@/lib/db/models/User'
import { Block } from '@/lib/db/models/Block'
import { getAuthFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthFromRequest(req)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const conversationId = searchParams.get('conversationId')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '50', 10)))

    if (!conversationId) {
      return NextResponse.json({ error: 'conversationId is required' }, { status: 400 })
    }

    await connectDB()

    const conversation = await Conversation.findById(conversationId)
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    if (!conversation.participants.some(p => p.toString() === auth.userId)) {
      return NextResponse.json({ error: 'Access denied to this conversation' }, { status: 403 })
    }

    const total = await Message.countDocuments({ conversationId })
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    return NextResponse.json({
      messages: messages.reverse().map(m => ({
        id: m._id.toString(),
        conversationId: m.conversationId.toString(),
        senderId: m.senderId.toString(),
        content: m.content,
        readAt: m.readAt,
        createdAt: m.createdAt,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error('Get messages error:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = getAuthFromRequest(req)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { conversationId, content } = await req.json()

    if (!conversationId || typeof conversationId !== 'string') {
      return NextResponse.json({ error: 'conversationId is required' }, { status: 400 })
    }

    if (!content || typeof content !== 'string' || !content.trim()) {
      return NextResponse.json({ error: 'Message content cannot be empty' }, { status: 400 })
    }

    await connectDB()

    const conversation = await Conversation.findById(conversationId)
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    if (!conversation.participants.some(p => p.toString() === auth.userId)) {
      return NextResponse.json({ error: 'Access denied to this conversation' }, { status: 403 })
    }

    const recipientId = conversation.participants.find(p => p.toString() !== auth.userId)

    if (recipientId) {
      const blocked = await Block.findOne({
        $or: [
          { blockerId: auth.userId, blockedId: recipientId },
          { blockerId: recipientId, blockedId: auth.userId },
        ],
      })
      if (blocked) {
        return NextResponse.json({ error: 'Cannot send message to blocked user' }, { status: 403 })
      }
    }

    const newMessage = await Message.create({
      conversationId,
      senderId: auth.userId,
      content: content.trim(),
    })

    conversation.updatedAt = new Date()
    await conversation.save()

    if (recipientId) {
      const recipient = await User.findById(recipientId)
      if (recipient && recipient.notificationPreference) {
        await Notification.create({
          recipientId: recipient._id,
          type: 'new_message',
          referenceId: conversationId,
          read: false,
        })
      }
    }

    return NextResponse.json({
      message: {
        id: newMessage._id.toString(),
        conversationId: newMessage.conversationId.toString(),
        senderId: newMessage.senderId.toString(),
        content: newMessage.content,
        readAt: newMessage.readAt,
        createdAt: newMessage.createdAt,
      },
    }, { status: 201 })
  } catch (error: any) {
    console.error('Send message error:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = getAuthFromRequest(req)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { conversationId } = await req.json()
    if (!conversationId) {
      return NextResponse.json({ error: 'conversationId is required' }, { status: 400 })
    }

    await connectDB()

    await Message.updateMany(
      { conversationId, senderId: { $ne: auth.userId }, readAt: null },
      { readAt: new Date() }
    )

    return NextResponse.json({ message: 'Messages marked as read' })
  } catch (error: any) {
    console.error('Mark messages read error:', error)
    return NextResponse.json({ error: 'Failed to mark messages read' }, { status: 500 })
  }
}
