import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server' // Next.js standard imports
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev-only-change-in-env'
const TOKEN_NAME = 'auth_token'

export interface JWTPayload {
  userId: string
  email: string
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

export async function getAuthSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(TOKEN_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

export function getAuthFromRequest(req: NextRequest): JWTPayload | null {
  const token = req.cookies.get(TOKEN_NAME)?.value || req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return null
  return verifyToken(token)
}

export function setAuthCookieResponse(response: NextResponse, token: string): NextResponse {
  response.cookies.set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  })
  return response
}

export function clearAuthCookieResponse(response: NextResponse): NextResponse {
  response.cookies.set(TOKEN_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  return response
}
