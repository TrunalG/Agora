import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongodb'
import { User } from '@/lib/db/models/User'
import { getAuthFromRequest } from '@/lib/auth'

export async function POST() {
  return NextResponse.json({ error: 'Endpoint disabled' }, { status: 404 })
}

export async function GET() {
  return POST()
}
