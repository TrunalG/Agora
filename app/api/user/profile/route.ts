import { NextRequest, NextResponse } from 'next/server'
import { connectDB, findUserByIdOrSlug } from '@/lib/db/mongodb'
import { User } from '@/lib/db/models/User'
import { ConnectionRequest } from '@/lib/db/models/ConnectionRequest'
import { getAuthFromRequest } from '@/lib/auth'

function isValidUrl(str: string): boolean {
  if (!str) return false
  try {
    const url = new URL(str.startsWith('http://') || str.startsWith('https://') ? str : `https://${str}`)
    return Boolean(url.hostname)
  } catch {
    return false
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('id')
    const username = searchParams.get('username')

    let user = null
    if (userId) {
      user = await findUserByIdOrSlug(userId)
    } else if (username) {
      user = await findUserByIdOrSlug(username)
    } else {
      const auth = getAuthFromRequest(req)
      if (!auth) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      user = await User.findById(auth.userId).select('-passwordHash')
    }

    if (!user) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    const connectionsCount = await ConnectionRequest.countDocuments({
      status: 'accepted',
      $or: [{ senderId: user._id }, { receiverId: user._id }],
    })

    return NextResponse.json({
      profile: {
        id: user._id.toString(),
        name: user.name || user.username,
        username: user.username,
        email: user.email,
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
        connectionsCount,
        notificationPreference: user.notificationPreference,
        appearancePreference: user.appearancePreference,
        onboarded: user.onboarded,
      },
    })
  } catch (error: any) {
    console.error('Get profile error:', error)
    return NextResponse.json({ error: 'Failed to retrieve profile' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = getAuthFromRequest(req)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { username, name, bio, about, country, pronouns, language, profileVisibility, skillsToLearn, skillsToTeach, links, profileImage, notificationPreference } = body

    await connectDB()

    const updateData: any = {}

    if (username && typeof username === 'string') {
      const cleanUsername = username.trim().toLowerCase()
      const existing = await User.findOne({ username: cleanUsername, _id: { $ne: auth.userId } })
      if (existing) {
        return NextResponse.json({ error: 'Username is already taken' }, { status: 400 })
      }
      updateData.username = cleanUsername
    }

    if (typeof name === 'string') updateData.name = name.trim()
    if (typeof bio === 'string') updateData.bio = bio.trim()
    if (typeof about === 'string') updateData.about = about.trim()
    if (typeof country === 'string') updateData.country = country.trim()
    if (typeof pronouns === 'string') updateData.pronouns = pronouns.trim()
    if (typeof language === 'string') updateData.language = language.trim()
    if (typeof profileVisibility === 'string') updateData.profileVisibility = profileVisibility.trim()
    if (typeof profileImage === 'string') updateData.profileImage = profileImage.trim()
    if (typeof notificationPreference === 'boolean') updateData.notificationPreference = notificationPreference

    if (Array.isArray(skillsToLearn)) {
      updateData.skillsToLearn = skillsToLearn.map((s: string) => s.trim()).filter(Boolean)
    }

    if (Array.isArray(skillsToTeach)) {
      updateData.skillsToTeach = skillsToTeach.map((s: string) => s.trim()).filter(Boolean)
    }

    if (Array.isArray(links)) {
      if (links.length > 5) {
        return NextResponse.json({ error: 'Maximum 5 links allowed' }, { status: 400 })
      }
      const validLinks = links.map((l: string) => l.trim()).filter(Boolean)
      for (const link of validLinks) {
        if (!isValidUrl(link)) {
          return NextResponse.json({ error: `Invalid URL format: ${link}` }, { status: 400 })
        }
      }
      // Deduplicate links
      updateData.links = Array.from(new Set(validLinks))
    }

    const updatedUser = await User.findByIdAndUpdate(auth.userId, updateData, { new: true }).select('-passwordHash')

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      profile: {
        id: updatedUser._id.toString(),
        name: updatedUser.name || updatedUser.username,
        username: updatedUser.username,
        email: updatedUser.email,
        profileImage: updatedUser.profileImage,
        bio: updatedUser.bio,
        about: updatedUser.about || '',
        country: updatedUser.country,
        pronouns: updatedUser.pronouns || '',
        language: updatedUser.language || 'English',
        profileVisibility: updatedUser.profileVisibility || 'public',
        skillsToLearn: updatedUser.skillsToLearn,
        skillsToTeach: updatedUser.skillsToTeach,
        links: updatedUser.links,
        notificationPreference: updatedUser.notificationPreference,
        appearancePreference: updatedUser.appearancePreference,
        onboarded: updatedUser.onboarded,
      },
      message: 'Profile updated successfully',
    })
  } catch (error: any) {
    console.error('Update profile error:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
