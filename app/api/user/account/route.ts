import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongodb'
import { User } from '@/lib/db/models/User'
import { ConnectionRequest } from '@/lib/db/models/ConnectionRequest'
import { Conversation } from '@/lib/db/models/Conversation'
import { Message } from '@/lib/db/models/Message'
import { Notification } from '@/lib/db/models/Notification'
import { Block } from '@/lib/db/models/Block'
import { clearAuthCookieResponse, getAuthFromRequest } from '@/lib/auth'

export async function DELETE(req: NextRequest) {
  try {
    const auth = getAuthFromRequest(req)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const userId = auth.userId

    // Clean up user and associated records
    await Promise.all([
      User.findByIdAndDelete(userId),
      ConnectionRequest.deleteMany({ $or: [{ senderId: userId }, { receiverId: userId }] }),
      Conversation.deleteMany({ participants: userId }),
      Message.deleteMany({ senderId: userId }),
      Notification.deleteMany({ recipientId: userId }),
      Block.deleteMany({ $or: [{ blockerId: userId }, { blockedId: userId }] }),
    ])

    const response = NextResponse.json({ message: 'Account deleted successfully' }, { status: 200 })
    return clearAuthCookieResponse(response)
  } catch (error: any) {
    console.error('Delete account error:', error)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }
}
