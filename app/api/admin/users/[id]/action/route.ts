import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongodb'
import { User } from '@/lib/db/models/User'
import { getAuthFromRequest } from '@/lib/auth'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = getAuthFromRequest(req)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const admin = await User.findById(auth.userId)
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { action } = await req.json()
    const { id } = await params

    const targetUser = await User.findById(id)
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (action === 'warn') {
      targetUser.warningCount += 1
      targetUser.status = targetUser.warningCount >= 3 ? 'blocked' : 'warned'
      await targetUser.save()
      return NextResponse.json({ message: 'User warned', status: targetUser.status, warningCount: targetUser.warningCount })
    }

    if (action === 'block') {
      targetUser.status = 'blocked'
      await targetUser.save()
      return NextResponse.json({ message: 'User blocked', status: targetUser.status, warningCount: targetUser.warningCount })
    }

    if (action === 'delete') {
      await User.findByIdAndDelete(id)
      return NextResponse.json({ message: 'User deleted' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error performing admin action:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
