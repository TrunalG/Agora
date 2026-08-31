import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongodb'
import { User } from '@/lib/db/models/User'
import { hashPassword, signToken, setAuthCookieResponse } from '@/lib/auth'
import { sendVerificationOtpEmail } from '@/lib/email'

/**
 * In-memory OTP cache for 2-step registration verification.
 * Stores pending registration user data and expiration timestamps (10 minutes).
 */
const otpStore = new Map<string, { otp: string; expiresAt: number; userData: any }>()

/**
 * Validates password complexity requirements.
 * Rules: 12-64 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special symbol.
 *
 * @param password - Plaintext password input.
 * @returns Error string if validation fails, or null if valid.
 */
function validatePasswordPolicy(password: string): string | null {
  if (!password || typeof password !== 'string') return 'Password is required'
  if (password.length < 12) return 'Password must be at least 12 characters long'
  if (password.length > 64) return 'Password cannot exceed 64 characters'
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter (A-Z)'
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter (a-z)'
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number (0-9)'
  if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) return 'Password must contain at least one special symbol (e.g. !@#$%^&*)'
  return null
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, email, password, otp, username, name } = body

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()

    // STEP 1: Request OTP
    if (action === 'send-otp') {
      const passwordError = validatePasswordPolicy(password)
      if (passwordError) {
        return NextResponse.json({ error: passwordError }, { status: 400 })
      }

      await connectDB()

      const existingUser = await User.findOne({ email: normalizedEmail })
      if (existingUser) {
        return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 })
      }

      let finalUsername = username ? username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '') : ''
      if (!finalUsername) {
        finalUsername = normalizedEmail.split('@')[0].replace(/[^a-z0-9_]/g, '') + Math.floor(1000 + Math.random() * 9000)
      }

      const existingUsername = await User.findOne({ username: finalUsername })
      if (existingUsername) {
        return NextResponse.json({ error: 'Username is already taken' }, { status: 400 })
      }

      // Generate 6-digit OTP code
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString()
      const expiresAt = Date.now() + 10 * 60 * 1000 // 10 minutes

      otpStore.set(normalizedEmail, {
        otp: generatedOtp,
        expiresAt,
        userData: { email: normalizedEmail, password, username: finalUsername, name },
      })

      console.log(`[AUTH REGISTRATION OTP] Code for ${normalizedEmail}: ${generatedOtp}`)

      // Send OTP via Resend API
      const emailResult = await sendVerificationOtpEmail(normalizedEmail, generatedOtp)

      if (!emailResult.success) {
        return NextResponse.json({ error: `Failed to send verification email. If using Resend free tier, ensure ${normalizedEmail} is a verified testing address.` }, { status: 500 })
      }

      return NextResponse.json(
        {
          otpSent: true,
          message: `Verification code sent to ${normalizedEmail}! Please check your email inbox.`,
        },
        { status: 200 }
      )
    }

    // STEP 2: Verify OTP and create user
    if (action === 'verify-otp') {
      if (!otp || typeof otp !== 'string' || otp.trim().length !== 6) {
        return NextResponse.json({ error: 'Valid 6-digit OTP code is required' }, { status: 400 })
      }

      const cached = otpStore.get(normalizedEmail)
      if (!cached) {
        return NextResponse.json({ error: 'No pending OTP verification found for this email. Please request a new code.' }, { status: 400 })
      }

      if (Date.now() > cached.expiresAt) {
        otpStore.delete(normalizedEmail)
        return NextResponse.json({ error: 'OTP code has expired. Please request a new code.' }, { status: 400 })
      }

      if (cached.otp !== otp.trim()) {
        return NextResponse.json({ error: 'Invalid OTP code. Please check and try again.' }, { status: 400 })
      }

      const { userData } = cached
      otpStore.delete(normalizedEmail)

      await connectDB()

      const passwordHash = await hashPassword(userData.password)
      const newUser = await User.create({
        email: userData.email,
        passwordHash,
        username: userData.username,
        name: userData.name || userData.username,
        bio: '',
        country: 'Select your country',
        skillsToLearn: [],
        skillsToTeach: [],
        links: [],
        onboarded: false,
      })

      const token = signToken({ userId: newUser._id.toString(), email: newUser.email })

      const userObj = {
        id: newUser._id.toString(),
        email: newUser.email,
        username: newUser.username,
        name: newUser.name,
        profileImage: newUser.profileImage,
        bio: newUser.bio,
        country: newUser.country,
        skillsToLearn: newUser.skillsToLearn,
        skillsToTeach: newUser.skillsToTeach,
        links: newUser.links,
        notificationPreference: newUser.notificationPreference,
        appearancePreference: newUser.appearancePreference,
        onboarded: newUser.onboarded,
      }

      const response = NextResponse.json({ user: userObj, message: 'Registration verified and completed!' }, { status: 201 })
      return setAuthCookieResponse(response, token)
    }

    // Fallback: Direct registration with password validation
    const passwordError = validatePasswordPolicy(password)
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 })
    }

    await connectDB()

    const existingUser = await User.findOne({ email: normalizedEmail })
    if (existingUser) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 })
    }

    let finalUsername = username ? username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '') : ''
    if (!finalUsername) {
      finalUsername = normalizedEmail.split('@')[0].replace(/[^a-z0-9_]/g, '') + Math.floor(1000 + Math.random() * 9000)
    }

    const passwordHash = await hashPassword(password)
    const newUser = await User.create({
      email: normalizedEmail,
      passwordHash,
      username: finalUsername,
      name: name || finalUsername,
      bio: '',
      country: 'Select your country',
      skillsToLearn: [],
      skillsToTeach: [],
      links: [],
      onboarded: false,
    })

    const token = signToken({ userId: newUser._id.toString(), email: newUser.email })

    const userObj = {
      id: newUser._id.toString(),
      email: newUser.email,
      username: newUser.username,
      name: newUser.name,
      profileImage: newUser.profileImage,
      bio: newUser.bio,
      country: newUser.country,
      skillsToLearn: newUser.skillsToLearn,
      skillsToTeach: newUser.skillsToTeach,
      links: newUser.links,
      notificationPreference: newUser.notificationPreference,
      appearancePreference: newUser.appearancePreference,
      onboarded: newUser.onboarded,
    }

    const response = NextResponse.json({ user: userObj, message: 'Registration successful' }, { status: 201 })
    return setAuthCookieResponse(response, token)
  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: error.message || 'Registration failed due to a server error' }, { status: 500 })
  }
}

