import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongodb'
import { Report } from '@/lib/db/models/Report'
import { getAuthFromRequest } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const auth = getAuthFromRequest(req)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { reportedUserId, reason } = await req.json()

    if (!reportedUserId || !reason || !reason.trim()) {
      return NextResponse.json({ error: 'reportedUserId and reason are required' }, { status: 400 })
    }

    await connectDB()

    await Report.create({
      reporterId: auth.userId,
      reportedUserId,
      reason: reason.trim(),
    })

    return NextResponse.json({ message: 'Report submitted successfully' }, { status: 201 })
  } catch (error: any) {
    console.error('Submit report error:', error)
    return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 })
  }
}
