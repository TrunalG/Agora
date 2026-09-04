import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongodb'
import { User } from '@/lib/db/models/User'
import { getAuthFromRequest } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const auth = getAuthFromRequest(req)
    if (!auth?.userId) {
      return NextResponse.json({ error: 'Unauthorized. Please log in first.' }, { status: 401 })
    }

    await connectDB()

    const user = await User.findById(auth.userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    user.role = 'admin'
    await user.save()

    return NextResponse.json({
      message: `Success! Account '${user.email}' is now an Admin.`,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Make admin error:', error)
    return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  return POST(req)
}
