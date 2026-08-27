import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongodb'
import { ConnectionRequest } from '@/lib/db/models/ConnectionRequest'
import { getAuthFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthFromRequest(req)
    if (!auth) {
      return NextResponse.json({ requests: [], connections: [] }, { status: 401 })
    }

    await connectDB()

    const allRequests = await ConnectionRequest.find({
      $or: [{ senderId: auth.userId }, { receiverId: auth.userId }],
    })
      .populate('senderId', 'name username profileImage bio country skillsToTeach skillsToLearn')
      .populate('receiverId', 'name username profileImage bio country skillsToTeach skillsToLearn')

    const pendingRequests = allRequests.filter(r => r.status === 'pending')
    const activeConnections = allRequests.filter(r => r.status === 'accepted')

    return NextResponse.json({
      requests: pendingRequests.map(r => ({
        id: r._id.toString(),
        senderId: (r.senderId as any)?._id?.toString() || r.senderId.toString(),
        sender: r.senderId,
        receiverId: (r.receiverId as any)?._id?.toString() || r.receiverId.toString(),
        receiver: r.receiverId,
        message: r.message,
        status: r.status,
        createdAt: r.createdAt,
      })),
      connections: activeConnections.map(c => {
        const isSender = (c.senderId as any)?._id?.toString() === auth.userId
        const partner = isSender ? c.receiverId : c.senderId
        return {
          connectionId: c._id.toString(),
          partnerId: (partner as any)?._id?.toString() || partner.toString(),
          partner,
          connectedAt: c.updatedAt,
        }
      }),
    })
  } catch (error: any) {
    console.error('Get connections error:', error)
    return NextResponse.json({ error: 'Failed to fetch connections' }, { status: 500 })
  }
}
