import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongodb'
import { Feedback } from '@/lib/db/models/Feedback'
import { getAuthFromRequest } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const body = await req.json()
    const { questionCategory, description, rating } = body

    if (!questionCategory || !description || !rating) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    // Try to get user from request token if logged in
    let submittedBy = null
    try {
      const auth = getAuthFromRequest(req)
      if (auth?.userId) {
        submittedBy = auth.userId
      }
    } catch (e) {
      // Ignore error if no valid token is found
    }

    const newFeedback = await Feedback.create({
      questionCategory,
      description,
      rating,
      submittedBy,
    })

    return NextResponse.json(
      { message: 'Feedback submitted successfully', feedbackId: newFeedback._id },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error submitting feedback:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
