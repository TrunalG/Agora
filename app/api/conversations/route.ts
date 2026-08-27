import { NextRequest, NextResponse } from 'next/server'
import { connectDB, findUserByIdOrSlug } from '@/lib/db/mongodb'
import { Conversation } from '@/lib/db/models/Conversation'
import { ConnectionRequest } from '@/lib/db/models/ConnectionRequest'
import { User } from '@/lib/db/models/User'
import { Block } from '@/lib/db/models/Block'
import { Message } from '@/lib/db/models/Message'
import { getAuthFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthFromRequest(req)
    if (!auth) {
      return NextResponse.json({ conversations: [] }, { status: 401 })
    }

    await connectDB()

    const [conversations, blocks] = await Promise.all([
      Conversation.find({
        participants: auth.userId,
      })
        .populate('participants', 'name username profileImage bio country')
        .sort({ updatedAt: -1 }),
      Block.find({
        $or: [{ blockerId: auth.userId }, { blockedId: auth.userId }],
      })
    ])

    const blockedUserIds = new Set(blocks.map(b => 
      b.blockerId.toString() === auth.userId ? b.blockedId.toString() : b.blockerId.toString()
    ))

    const formatted = await Promise.all(
      conversations.map(async (conv) => {
        const otherParticipant = conv.participants.find(
          (p: any) => p._id.toString() !== auth.userId
        ) as any

        const lastMessage = await Message.findOne({ conversationId: conv._id })
          .sort({ createdAt: -1 })

        const unreadCount = await Message.countDocuments({
          conversationId: conv._id,
          senderId: { $ne: auth.userId },
          readAt: null,
        })

        return {
          id: conv._id.toString(),
          participant: otherParticipant
            ? {
                id: otherParticipant._id.toString(),
                name: otherParticipant.name || otherParticipant.username,
                username: otherParticipant.username,
                profileImage: otherParticipant.profileImage,
              }
            : null,
          lastMessage: lastMessage
            ? {
                id: lastMessage._id.toString(),
                content: lastMessage.content,
                senderId: lastMessage.senderId.toString(),
                createdAt: lastMessage.createdAt,
              }
            : null,
          unreadCount,
          updatedAt: conv.updatedAt,
        }
      })
    )

    const filtered = formatted.filter(conv => conv.participant && !blockedUserIds.has(conv.participant.id))

    return NextResponse.json({ conversations: filtered })
  } catch (error: any) {
    console.error('Get conversations error:', error)
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = getAuthFromRequest(req)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { participantId } = await req.json()

    if (!participantId || typeof participantId !== 'string') {
      return NextResponse.json({ error: 'Participant ID is required' }, { status: 400 })
    }

    await connectDB()

    const partner = await findUserByIdOrSlug(participantId)
    if (!partner) {
      return NextResponse.json({ error: 'Participant user not found' }, { status: 404 })
    }

    const realParticipantId = partner._id.toString()

    if (auth.userId === realParticipantId) {
      return NextResponse.json({ error: 'Cannot create conversation with yourself' }, { status: 400 })
    }

    // 1. Verify connection status (must be accepted connection)
    const connection = await ConnectionRequest.findOne({
      $or: [
        { senderId: auth.userId, receiverId: realParticipantId, status: 'accepted' },
        { senderId: realParticipantId, receiverId: auth.userId, status: 'accepted' },
      ],
    })

    if (!connection) {
      return NextResponse.json({ error: 'You must be connected with this user to start a conversation' }, { status: 403 })
    }

    // 2. Check if blocked
    const blocked = await Block.findOne({
      $or: [
        { blockerId: auth.userId, blockedId: realParticipantId },
        { blockerId: realParticipantId, blockedId: auth.userId },
      ],
    })

    if (blocked) {
      return NextResponse.json({ error: 'Cannot start conversation with blocked user' }, { status: 403 })
    }

    // 3. Find or create existing conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [auth.userId, realParticipantId] },
    })

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [auth.userId, realParticipantId],
      })
    }

    return NextResponse.json({
      conversation: {
        id: conversation._id.toString(),
        participant: {
          id: partner._id.toString(),
          name: partner.name || partner.username,
          username: partner.username,
          profileImage: partner.profileImage,
        },
        updatedAt: conversation.updatedAt,
      },
    })
  } catch (error: any) {
    console.error('Create conversation error:', error)
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
  }
}
