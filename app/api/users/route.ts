import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongodb'
import { User } from '@/lib/db/models/User'
import { Block } from '@/lib/db/models/Block'
import { ConnectionRequest } from '@/lib/db/models/ConnectionRequest'
import { getAuthFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q')?.trim() || ''
    const filter = searchParams.get('filter') || 'all'
    const country = searchParams.get('country') || 'Anywhere'
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get('limit') || '20', 10)))

    const auth = getAuthFromRequest(req)
    const excludedIds: string[] = []

    if (auth?.userId) {
      excludedIds.push(auth.userId)
      const [blocks, activeConnections] = await Promise.all([
        Block.find({
          $or: [{ blockerId: auth.userId }, { blockedId: auth.userId }],
        }),
        ConnectionRequest.find({
          status: 'accepted',
          $or: [{ senderId: auth.userId }, { receiverId: auth.userId }],
        }),
      ])

      blocks.forEach((b) => {
        excludedIds.push(b.blockerId.toString())
        excludedIds.push(b.blockedId.toString())
      })

      activeConnections.forEach((c) => {
        excludedIds.push(c.senderId.toString())
        excludedIds.push(c.receiverId.toString())
      })
    }

    const mongoQuery: any = {
      _id: { $nin: Array.from(new Set(excludedIds)) },
    }

    if (country && country !== 'Anywhere') {
      mongoQuery.country = { $regex: new RegExp(country, 'i') }
    }

    if (filter === 'match' && auth?.userId) {
      const currentUser = await User.findById(auth.userId)
      if (currentUser) {
        const learns = currentUser.skillsToLearn || []
        const teaches = currentUser.skillsToTeach || []
        mongoQuery.$or = [
          { skillsToTeach: { $in: learns.map((s: string) => new RegExp(`^${s}$`, 'i')) } },
          { skillsToLearn: { $in: teaches.map((s: string) => new RegExp(`^${s}$`, 'i')) } },
        ]
      }
    }

    if (q) {
      const searchRegex = new RegExp(q, 'i')
      if (filter === 'teach') {
        // User can teach skill Q -> find members who want to learn skill Q
        mongoQuery.skillsToLearn = { $elemMatch: { $regex: searchRegex } }
      } else if (filter === 'learn') {
        // User wants to learn skill Q -> find members who can teach skill Q
        mongoQuery.skillsToTeach = { $elemMatch: { $regex: searchRegex } }
      } else if (filter !== 'match') {
        mongoQuery.$or = [
          { name: searchRegex },
          { username: searchRegex },
          { bio: searchRegex },
          { country: searchRegex },
          { skillsToTeach: { $elemMatch: { $regex: searchRegex } } },
          { skillsToLearn: { $elemMatch: { $regex: searchRegex } } },
        ]
      }
    }

    const total = await User.countDocuments(mongoQuery)
    const users = await User.find(mongoQuery)
      .select('-passwordHash')
      .skip((page - 1) * limit)
      .limit(limit)

    const userIds = users.map((u) => u._id)
    const connCounts = await ConnectionRequest.aggregate([
      {
        $match: {
          status: 'accepted',
          $or: [{ senderId: { $in: userIds } }, { receiverId: { $in: userIds } }],
        },
      },
      {
        $project: {
          participants: ['$senderId', '$receiverId'],
        },
      },
      { $unwind: '$participants' },
      {
        $match: {
          participants: { $in: userIds },
        },
      },
      {
        $group: {
          _id: '$participants',
          count: { $sum: 1 },
        },
      },
    ])
    const countMap = new Map(connCounts.map((c) => [c._id.toString(), c.count]))

    const mappedPeople = users.map((u) => {
      const initials = (u.name || u.username)
        .split(' ')
        .map((part: string) => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'U'

      return {
        id: u._id.toString(),
        name: u.name || u.username,
        username: u.username,
        role: u.bio ? (u.bio.length > 30 ? u.bio.slice(0, 30) + '...' : u.bio) : 'Member',
        location: u.country || 'Anywhere',
        initials,
        tone: 'bg-accent text-accent-foreground',
        teaches: u.skillsToTeach || [],
        learns: u.skillsToLearn || [],
        about: u.bio || 'No bio provided.',
        image: u.profileImage,
        links: u.links || [],
        connectionsCount: countMap.get(u._id.toString()) || 0,
      }
    })

    return NextResponse.json({
      people: mappedPeople,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error('Get users error:', error)
    return NextResponse.json({ error: 'Failed to search users' }, { status: 500 })
  }
}
