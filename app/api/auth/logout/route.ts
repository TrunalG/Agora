import { NextResponse } from 'next/server'
import { clearAuthCookieResponse } from '@/lib/auth'

export async function POST() {
  const response = NextResponse.json({ message: 'Logged out successfully' }, { status: 200 })
  return clearAuthCookieResponse(response)
}
