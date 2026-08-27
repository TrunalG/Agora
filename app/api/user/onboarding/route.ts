import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongodb'
import { User } from '@/lib/db/models/User'
import { getAuthFromRequest } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const auth = getAuthFromRequest(req)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { skillsToLearn, skillsToTeach } = await req.json()

    if (!Array.isArray(skillsToLearn) || !Array.isArray(skillsToTeach)) {
      return NextResponse.json({ error: 'skillsToLearn and skillsToTeach must be arrays' }, { status: 400 })
    }

    await connectDB()

    const user = await User.findByIdAndUpdate(
      auth.userId,
      {
        skillsToLearn: skillsToLearn.map((s: string) => s.trim()).filter(Boolean),
        skillsToTeach: skillsToTeach.map((s: string) => s.trim()).filter(Boolean),
        onboarded: true,
      },
      { new: true }
    )

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        username: user.username,
        skillsToLearn: user.skillsToLearn,
        skillsToTeach: user.skillsToTeach,
        onboarded: user.onboarded,
      },
      message: 'Onboarding completed successfully',
    })
  } catch (error: any) {
    console.error('Onboarding error:', error)
    return NextResponse.json({ error: 'Failed to save onboarding data' }, { status: 500 })
  }
}
