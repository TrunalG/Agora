import { NextRequest, NextResponse } from 'next/server'
import { connectDB, findUserByIdOrSlug } from '@/lib/db/mongodb'
import { User } from '@/lib/db/models/User'
import { ConnectionRequest } from '@/lib/db/models/ConnectionRequest'
import { Block } from '@/lib/db/models/Block'
import { Notification } from '@/lib/db/models/Notification'
import { getAuthFromRequest } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const auth = getAuthFromRequest(req)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { receiverId, message } = await req.json()

    if (!receiverId || typeof receiverId !== 'string') {
      return NextResponse.json({ error: 'Target user ID is required' }, { status: 400 })
    }

    await connectDB()

    const [sender, receiver] = await Promise.all([
      findUserByIdOrSlug(auth.userId),
      findUserByIdOrSlug(receiverId),
    ])

    if (!sender || !receiver) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const realSenderId = sender._id.toString()
    const realReceiverId = receiver._id.toString()

    if (realSenderId === realReceiverId) {
      return NextResponse.json({ error: 'Cannot send connection request to yourself' }, { status: 400 })
    }

    // Check blocked relationship
    const blocked = await Block.findOne({
      $or: [
        { blockerId: realSenderId, blockedId: realReceiverId },
        { blockerId: realReceiverId, blockedId: realSenderId },
      ],
    })

    if (blocked) {
      return NextResponse.json({ error: 'Cannot connect with blocked user' }, { status: 403 })
    }

    // Check existing pending or accepted request
    const existing = await ConnectionRequest.findOne({
      $or: [
        { senderId: realSenderId, receiverId: realReceiverId },
        { senderId: realReceiverId, receiverId: realSenderId },
      ],
    })

    if (existing) {
      if (existing.status === 'pending') {
        return NextResponse.json({ error: 'A pending connection request already exists' }, { status: 400 })
      }
      if (existing.status === 'accepted') {
        return NextResponse.json({ error: 'You are already connected with this user' }, { status: 400 })
      }
      // If rejected, update to pending
      existing.senderId = realSenderId as any
      existing.receiverId = realReceiverId as any
      existing.message = message || ''
      existing.status = 'pending'
      await existing.save()

      if (receiver.notificationPreference) {
        await Notification.create({
          recipientId: receiver._id,
          type: 'connection_request',
          referenceId: existing._id.toString(),
          read: false,
        })
      }

      return NextResponse.json({ request: existing, message: 'Connection request sent' }, { status: 200 })
    }

    const newRequest = await ConnectionRequest.create({
      senderId: realSenderId,
      receiverId: realReceiverId,
      message: message || '',
      status: 'pending',
    })

    if (receiver.notificationPreference) {
      await Notification.create({
        recipientId: receiver._id,
        type: 'connection_request',
        referenceId: newRequest._id.toString(),
        read: false,
      })
    }

    return NextResponse.json({ request: newRequest, message: 'Connection request sent' }, { status: 201 })
  } catch (error: any) {
    console.error('Send connection request error:', error)
    return NextResponse.json({ error: 'Failed to send connection request' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = getAuthFromRequest(req)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { requestId, action } = await req.json()

    if (!requestId || !['accept', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Valid requestId and action (accept/reject) required' }, { status: 400 })
    }

    await connectDB()

    const request = await ConnectionRequest.findById(requestId)

    if (!request) {
      return NextResponse.json({ error: 'Connection request not found' }, { status: 404 })
    }

    if (request.receiverId.toString() !== auth.userId) {
      return NextResponse.json({ error: 'Only the recipient can respond to this request' }, { status: 403 })
    }

    request.status = action === 'accept' ? 'accepted' : 'rejected'
    await request.save()

    if (action === 'accept') {
      const sender = await User.findById(request.senderId)
      if (sender && sender.notificationPreference) {
        await Notification.create({
          recipientId: sender._id,
          type: 'connection_accepted',
          referenceId: request._id.toString(),
          read: false,
        })
      }
    }

    return NextResponse.json({
      request,
      message: action === 'accept' ? 'Connection request accepted' : 'Connection request rejected',
    })
  } catch (error: any) {
    console.error('Respond connection request error:', error)
    return NextResponse.json({ error: 'Failed to respond to connection request' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = getAuthFromRequest(req)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    let requestId = searchParams.get('requestId')
    let receiverId = searchParams.get('receiverId')

    if (!requestId && !receiverId) {
      try {
        const body = await req.json()
        requestId = body.requestId
        receiverId = body.receiverId
      } catch {
        // body optional if searchParams provided
      }
    }

    if (!requestId && !receiverId) {
      return NextResponse.json({ error: 'requestId or receiverId is required' }, { status: 400 })
    }

    await connectDB()

    let request = null
    if (requestId && (requestId.length === 24 || requestId.length === 12)) {
      try {
        request = await ConnectionRequest.findById(requestId)
      } catch {
        request = null
      }
    }
    if (!request && receiverId) {
      const targetUser = await findUserByIdOrSlug(receiverId)
      if (targetUser) {
        request = await ConnectionRequest.findOne({
          senderId: auth.userId,
          receiverId: targetUser._id,
          status: 'pending',
        })
      }
    }

    if (!request) {
      return NextResponse.json({ error: 'Pending connection request not found' }, { status: 404 })
    }

    if (request.senderId.toString() !== auth.userId) {
      return NextResponse.json({ error: 'Only the sender can withdraw this request' }, { status: 403 })
    }

    const reqId = request._id.toString()
    await ConnectionRequest.findByIdAndDelete(request._id)

    // Clean up any pending notification sent to receiver
    await Notification.deleteMany({
      recipientId: request.receiverId,
      type: 'connection_request',
      referenceId: reqId,
    })

    return NextResponse.json({ message: 'Connection request withdrawn successfully' }, { status: 200 })
  } catch (error: any) {
    console.error('Withdraw connection request error:', error)
    return NextResponse.json({ error: 'Failed to withdraw connection request' }, { status: 500 })
  }
}

