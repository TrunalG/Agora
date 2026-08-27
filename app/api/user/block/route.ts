import { NextRequest, NextResponse } from 'next/server'
import { connectDB, findUserByIdOrSlug } from '@/lib/db/mongodb'
import { Block } from '@/lib/db/models/Block'
import { getAuthFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthFromRequest(req)
    if (!auth) {
      return NextResponse.json({ blocked: [] }, { status: 401 })
    }

    await connectDB()

    const blocks = await Block.find({ blockerId: auth.userId }).populate('blockedId', 'name username profileImage')

    return NextResponse.json({
      blocked: blocks.map(b => ({
        id: (b.blockedId as any)?._id?.toString() || b.blockedId.toString(),
        name: (b.blockedId as any)?.name || (b.blockedId as any)?.username || 'User',
        username: (b.blockedId as any)?.username || 'user',
      })),
    })
  } catch (error: any) {
    console.error('Get blocked users error:', error)
    return NextResponse.json({ error: 'Failed to fetch blocked users' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = getAuthFromRequest(req)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { targetUserId } = await req.json()

    if (!targetUserId) {
      return NextResponse.json({ error: 'Valid targetUserId required' }, { status: 400 })
    }

    await connectDB()

    const targetUser = await findUserByIdOrSlug(targetUserId)
    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 })
    }

    const realTargetUserId = targetUser._id.toString()

    if (realTargetUserId === auth.userId) {
      return NextResponse.json({ error: 'Cannot block yourself' }, { status: 400 })
    }

    const existing = await Block.findOne({ blockerId: auth.userId, blockedId: realTargetUserId })
    if (existing) {
      return NextResponse.json({ message: 'User is already blocked' })
    }

    await Block.create({ blockerId: auth.userId, blockedId: realTargetUserId })

    return NextResponse.json({ message: 'User blocked successfully' }, { status: 201 })
  } catch (error: any) {
    console.error('Block user error:', error)
    return NextResponse.json({ error: 'Failed to block user' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = getAuthFromRequest(req)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const targetUserId = searchParams.get('targetUserId') || searchParams.get('blockedId')

    if (!targetUserId) {
      return NextResponse.json({ error: 'targetUserId or blockedId query param is required' }, { status: 400 })
    }

    await connectDB()

    const targetUser = await findUserByIdOrSlug(targetUserId)
    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 })
    }

    const realTargetUserId = targetUser._id.toString()

    await Block.deleteOne({ blockerId: auth.userId, blockedId: realTargetUserId })

    return NextResponse.json({ message: 'User unblocked successfully' })
  } catch (error: any) {
    console.error('Unblock user error:', error)
    return NextResponse.json({ error: 'Failed to unblock user' }, { status: 500 })
  }
}
