import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongodb'
import { User } from '@/lib/db/models/User'
import { getAuthFromRequest } from '@/lib/auth'

export async function PUT(req: NextRequest) {
  try {
    const auth = getAuthFromRequest(req)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { notificationPreference, appearancePreference } = await req.json()

    await connectDB()

    const update: any = {}
    if (typeof notificationPreference === 'boolean') {
      update.notificationPreference = notificationPreference
    }
    if (['light', 'dark', 'system'].includes(appearancePreference)) {
      update.appearancePreference = appearancePreference
    }

    const user = await User.findByIdAndUpdate(auth.userId, update, { new: true }).select('-passwordHash')

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      settings: {
        notificationPreference: user.notificationPreference,
        appearancePreference: user.appearancePreference,
      },
      message: 'Settings updated successfully',
    })
  } catch (error: any) {
    console.error('Update settings error:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
