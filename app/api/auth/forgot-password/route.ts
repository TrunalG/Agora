import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongodb'
import { User } from '@/lib/db/models/User'
import { hashPassword } from '@/lib/auth'
import { sendPasswordResetOtpEmail } from '@/lib/email'

const forgotPasswordOtpStore = new Map<string, { otp: string; expiresAt: number }>()

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, email, otp, newPassword } = body

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()

    // STEP 1: Send OTP
    if (action === 'send-otp') {
      await connectDB()
      const user = await User.findOne({ email: normalizedEmail })
      if (!user) {
        return NextResponse.json({ error: 'No user account found with this email' }, { status: 404 })
      }

      // Generate 6-digit OTP
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString()
      const expiresAt = Date.now() + 10 * 60 * 1000 // 10 minutes

      forgotPasswordOtpStore.set(normalizedEmail, {
        otp: generatedOtp,
        expiresAt,
      })

      console.log(`[PASSWORD RESET OTP] Code for ${normalizedEmail}: ${generatedOtp}`)

      // Send Email
      const emailResult = await sendPasswordResetOtpEmail(normalizedEmail, generatedOtp)

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

    // STEP 2: Verify OTP and Reset Password
    if (action === 'reset-password') {
      if (!otp || typeof otp !== 'string' || otp.trim().length !== 6) {
        return NextResponse.json({ error: 'Valid 6-digit OTP code is required' }, { status: 400 })
      }

      if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 12) {
        return NextResponse.json({ error: 'Password must be at least 12 characters long' }, { status: 400 })
      }

      const cached = forgotPasswordOtpStore.get(normalizedEmail)
      if (!cached) {
        return NextResponse.json({ error: 'No pending password reset request found. Please request a new code.' }, { status: 400 })
      }

      if (Date.now() > cached.expiresAt) {
        forgotPasswordOtpStore.delete(normalizedEmail)
        return NextResponse.json({ error: 'OTP code has expired. Please request a new code.' }, { status: 400 })
      }

      if (cached.otp !== otp.trim()) {
        return NextResponse.json({ error: 'Invalid OTP code. Please check and try again.' }, { status: 400 })
      }

      forgotPasswordOtpStore.delete(normalizedEmail)

      await connectDB()
      const user = await User.findOne({ email: normalizedEmail })
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      user.passwordHash = await hashPassword(newPassword)
      await user.save()

      return NextResponse.json({ message: 'Password reset successful! You can now log in.' }, { status: 200 })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: error.message || 'Forgot password failed' }, { status: 500 })
  }
}
