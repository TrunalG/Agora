import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongodb'
import { User } from '@/lib/db/models/User'
import { getAuthFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthFromRequest(req)
    if (!auth) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    await connectDB()
    const user = await User.findById(auth.userId)
    if (!user) {
      return NextResponse.json({ user: null }, { status: 404 })
    }

    const userObj = {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      name: user.name || user.username,
      profileImage: user.profileImage,
      bio: user.bio,
      about: user.about || '',
      country: user.country,
      pronouns: user.pronouns || '',
      language: user.language || 'English',
      profileVisibility: user.profileVisibility || 'public',
      skillsToLearn: user.skillsToLearn,
      skillsToTeach: user.skillsToTeach,
      links: user.links,
      notificationPreference: user.notificationPreference,
      appearancePreference: user.appearancePreference,
      onboarded: user.onboarded,
    }

    return NextResponse.json({ user: userObj }, { status: 200 })
  } catch (error: any) {
    console.error('Auth me error:', error)
    return NextResponse.json({ user: null, error: 'Server error' }, { status: 500 })
  }
}
