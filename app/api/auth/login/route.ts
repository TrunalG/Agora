import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongodb'
import { User } from '@/lib/db/models/User'
import { comparePassword, signToken, setAuthCookieResponse } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    await connectDB()

    const normalizedIdentifier = email.trim().toLowerCase()
    const user = await User.findOne({
      $or: [{ email: normalizedIdentifier }, { username: normalizedIdentifier }],
    })

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const isMatch = await comparePassword(password, user.passwordHash)
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const token = signToken({ userId: user._id.toString(), email: user.email })

    const userObj = {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      name: user.name || user.username,
      profileImage: user.profileImage,
      bio: user.bio,
      country: user.country,
      skillsToLearn: user.skillsToLearn,
      skillsToTeach: user.skillsToTeach,
      links: user.links,
      notificationPreference: user.notificationPreference,
      appearancePreference: user.appearancePreference,
      onboarded: user.onboarded,
    }

    const response = NextResponse.json({ user: userObj, message: 'Login successful' }, { status: 200 })
    return setAuthCookieResponse(response, token)
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json({ error: error.message || 'Login failed due to a server error' }, { status: 500 })
  }
}
