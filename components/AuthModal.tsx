'use client'

import React, { useState } from 'react'
import { Modal } from '@/components/Modal'
import { skills } from '@/lib/prototype-utils'
import { Eye, EyeOff } from 'lucide-react'

interface AuthModalProps {
  mode: 'login' | 'register' | 'onboarding'
  setMode: (m: 'login' | 'register' | 'onboarding' | null) => void
  onSuccess: (user: any) => void
  notify: (msg: string) => void
}

/**
 * Spinner component for button loading states.
 */
function Spinner() {
  return (
    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current inline-block" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

/**
 * Redesigned Password Requirements & Strength Indicator component.
 */
export function PasswordRequirements({ password }: { password: string }) {
  const lenOk = password.length >= 12 && password.length <= 64
  const upperOk = /[A-Z]/.test(password)
  const lowerOk = /[a-z]/.test(password)
  const digitOk = /[0-9]/.test(password)
  const symbolOk = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)

  const score = [lenOk, upperOk, lowerOk, digitOk, symbolOk].filter(Boolean).length

  let strengthLabel = 'Too short'
  let strengthColor = 'bg-muted-foreground/30'
  let strengthTextColor = 'text-muted-foreground'

  if (password.length > 0) {
    if (score <= 2) {
      strengthLabel = 'Weak'
      strengthColor = 'bg-destructive'
      strengthTextColor = 'text-destructive font-bold'
    } else if (score <= 4) {
      strengthLabel = 'Medium'
      strengthColor = 'bg-amber-500'
      strengthTextColor = 'text-amber-500 font-bold'
    } else {
      strengthLabel = 'Strong'
      strengthColor = 'bg-emerald-500'
      strengthTextColor = 'text-emerald-500 font-extrabold'
    }
  }

  const renderItem = (label: string, isOk: boolean) => {
    return (
      <span className={`flex items-center gap-1.5 transition-colors duration-200 ${isOk ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-muted-foreground'}`}>
        {isOk ? (
          <svg className="size-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" stroke="currentColor" />
          </svg>
        ) : (
          <span className="size-1.5 rounded-full bg-muted-foreground/30 ml-1.5 mr-1" />
        )}
        {label}
      </span>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-muted/20 p-3.5 text-xs space-y-3.5">
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          <span>Password Strength</span>
          <span className={strengthTextColor}>{strengthLabel}</span>
        </div>
        <div className="h-1.5 w-full bg-muted-foreground/20 rounded-full overflow-hidden flex gap-0.5">
          <div className={`h-full transition-all duration-300 ${strengthColor}`} style={{ width: `${password.length > 0 ? (score / 5) * 100 : 0}%` }} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[11px] font-medium pt-2 border-t border-border/50">
        {renderItem('12–64 characters', lenOk)}
        {renderItem('Uppercase (A-Z)', upperOk)}
        {renderItem('Lowercase (a-z)', lowerOk)}
        {renderItem('Number (0-9)', digitOk)}
        {renderItem('Special symbol', symbolOk)}
      </div>
    </div>
  )
}

export function AuthModal({ mode, setMode, onSuccess, notify }: AuthModalProps) {
  // Local sub-views for authentication options: login, register, forgot-password, forgot-password-otp
  const [view, setView] = useState<'login' | 'register' | 'forgot-password' | 'forgot-password-otp'>(
    mode === 'register' ? 'register' : 'login'
  )

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otpStep, setOtpStep] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [otpMessage, setOtpMessage] = useState('')
  const [step, setStep] = useState(1)
  const [learn, setLearn] = useState<string[]>([])
  const [teach, setTeach] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Forgot Password specific states
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const add = (arr: string[], set: (v: string[]) => void, s: string) =>
    set(arr.includes(s) ? arr.filter((x) => x !== s) : [...arr, s])

  // Helper to clear sensitive credentials on view switch or log out
  const resetAuthInputs = () => {
    setPassword('')
    setOtpCode('')
    setNewPassword('')
    setConfirmPassword('')
    setError('')
    setShowPassword(false)
    setShowNewPassword(false)
    setShowConfirmPassword(false)
  }

  // Password Validation helper
  const lenOk = password.length >= 12 && password.length <= 64
  const upperOk = /[A-Z]/.test(password)
  const lowerOk = /[a-z]/.test(password)
  const digitOk = /[0-9]/.test(password)
  const symbolOk = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)
  const passwordValid = lenOk && upperOk && lowerOk && digitOk && symbolOk

  const newLenOk = newPassword.length >= 12 && newPassword.length <= 64
  const newUpperOk = /[A-Z]/.test(newPassword)
  const newLowerOk = /[a-z]/.test(newPassword)
  const newDigitOk = /[0-9]/.test(newPassword)
  const newSymbolOk = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(newPassword)
  const newPasswordValid = newLenOk && newUpperOk && newLowerOk && newDigitOk && newSymbolOk

  async function handleSendOtp() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send-otp', email: email.trim().toLowerCase(), password }),
      })
      const data = await res.json()
      setLoading(false)
      if (!res.ok) {
        setError(data.error || 'Failed to send OTP')
        return
      }
      setOtpStep(true)
      setOtpCode('')
      setOtpMessage(data.message || `Verification code sent to ${email}`)
      notify('Verification OTP sent!')
    } catch (err: any) {
      setLoading(false)
      setError(err.message || 'Server connection error')
    }
  }

  async function handleVerifyOtp() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify-otp', email: email.trim().toLowerCase(), otp: otpCode.trim() }),
      })
      const data = await res.json()
      setLoading(false)
      if (!res.ok) {
        setError(data.error || 'OTP verification failed')
        return
      }
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('agora_demo_password', password)
      }
      onSuccess(data.user)
      setMode('onboarding')
      resetAuthInputs()
      setEmail('') // Clear email upon successful registration
      setOtpStep(false)
      notify('Email verified successfully!')
    } catch (err: any) {
      setLoading(false)
      setError(err.message || 'Server connection error')
    }
  }

  async function handleLogin() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      })
      const data = await res.json()
      setLoading(false)
      if (!res.ok) {
        setError(data.error || 'Authentication failed')
        return
      }
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('agora_demo_password', password)
      }
      onSuccess(data.user)
      setMode(null)
      resetAuthInputs()
      setEmail('') // Clear email upon successful login
    } catch (err: any) {
      setLoading(false)
      setError(err.message || 'Server connection error')
    }
  }

  async function handleForgotPasswordSendOtp() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send-otp', email: email.trim().toLowerCase() }),
      })
      const data = await res.json()
      setLoading(false)
      if (!res.ok) {
        setError(data.error || 'Failed to request password reset code')
        return
      }
      setView('forgot-password-otp')
      setOtpCode('')
      setOtpMessage(data.message || `Password reset code sent to ${email}`)
      notify('Reset code sent successfully!')
    } catch (err: any) {
      setLoading(false)
      setError(err.message || 'Server connection error')
    }
  }

  async function handleResetPassword() {
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset-password',
          email: email.trim().toLowerCase(),
          otp: otpCode.trim(),
          newPassword,
        }),
      })
      const data = await res.json()
      setLoading(false)
      if (!res.ok) {
        setError(data.error || 'Password reset failed')
        return
      }
      notify('Password updated successfully! Please log in.')
      setView('login')
      resetAuthInputs()
    } catch (err: any) {
      setLoading(false)
      setError(err.message || 'Server connection error')
    }
  }

  async function finishOnboarding() {
    setLoading(true)
    try {
      const res = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillsToLearn: learn, skillsToTeach: teach }),
      })
      const data = await res.json()
      setLoading(false)
      if (res.ok) {
        onSuccess(data.user)
        setMode(null)
        notify('Onboarding complete!')
      } else {
        notify(data.error || 'Failed to complete onboarding')
      }
    } catch {
      setLoading(false)
      notify('Server error during onboarding')
    }
  }

  // ONBOARDING VIEW
  if (mode === 'onboarding') {
    return (
      <Modal title={step === 1 ? 'What do you want to learn?' : 'What can you teach?'} close={() => setMode(null)}>
        <p className="text-sm text-muted-foreground">Choose at least one skill to continue.</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {skills.slice(0, 16).map((s) => (
            <button
              key={s}
              onClick={() => add(step === 1 ? learn : teach, step === 1 ? setLearn : setTeach, s)}
              className={`rounded-md border px-3 py-2 text-xs transition-colors ${(step === 1 ? learn : teach).includes(s) ? 'bg-primary text-primary-foreground font-semibold' : 'hover:bg-muted'}`}
            >
              {s}
            </button>
          ))}
        </div>
        <button
          disabled={loading || !(step === 1 ? learn : teach).length}
          onClick={() => {
            if (step === 1) setStep(2)
            else finishOnboarding()
          }}
          className="mt-6 w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-40 hover:opacity-90 transition-opacity flex items-center justify-center cursor-pointer shadow-xs"
        >
          {loading && <Spinner />}
          {step === 1 ? 'Continue' : 'Finish onboarding'}
        </button>
      </Modal>
    )
  }

  // REGISTRATION OTP VIEW
  if (view === 'register' && otpStep) {
    return (
      <Modal title="Verify Email (OTP)" close={() => setMode(null)}>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!loading && otpCode.trim().length === 6) handleVerifyOtp()
          }}
          className="flex flex-col gap-4"
        >
          <div className="rounded-lg bg-primary/10 p-3 text-xs text-primary font-medium leading-5">
            {otpMessage || `Enter the 6-digit OTP code sent to ${email}.`}
          </div>
          {error && <div className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive font-medium border border-destructive/20">{error}</div>}

          <label className="text-sm font-medium">
            6-Digit Verification Code
            <input
              type="text"
              maxLength={6}
              placeholder="123456"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
              className="mt-2 h-12 w-full rounded-lg border border-input bg-background px-3 text-center text-lg font-mono tracking-widest outline-none focus:ring-2 focus:ring-ring"
              autoComplete="one-time-code"
              required
            />
          </label>

          <button
            type="submit"
            disabled={loading || otpCode.trim().length !== 6}
            className="rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-40 hover:opacity-90 transition-opacity flex items-center justify-center cursor-pointer shadow-xs"
          >
            {loading && <Spinner />}
            {loading ? 'Verifying...' : 'Verify & Create Account'}
          </button>

          <div className="flex justify-between text-xs pt-1">
            <button
              type="button"
              onClick={() => {
                setOtpStep(false)
                resetAuthInputs()
              }}
              className="text-muted-foreground hover:underline"
            >
              ← Edit Registration Details
            </button>
            <button type="button" onClick={handleSendOtp} className="text-primary hover:underline font-medium">
              Resend OTP Code
            </button>
          </div>
        </form>
      </Modal>
    )
  }

  // FORGOT PASSWORD SUB-VIEW 1 (Request OTP)
  if (view === 'forgot-password') {
    return (
      <Modal title="Reset Password" close={() => setMode(null)}>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!loading && email.includes('@')) handleForgotPasswordSendOtp()
          }}
          className="flex flex-col gap-4"
        >
          <p className="text-xs text-muted-foreground">
            Enter the email address associated with your account, and we will send you a 6-digit OTP to reset your password.
          </p>
          {error && <div className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive font-medium border border-destructive/20">{error}</div>}

          <label className="text-sm font-medium">
            Email Address
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 h-10 w-full rounded-lg border border-input bg-background px-3 outline-none focus:ring-2 focus:ring-ring"
              autoComplete="email"
              required
            />
          </label>

          <button
            type="submit"
            disabled={loading || !email.includes('@')}
            className="rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-40 hover:opacity-90 transition-opacity flex items-center justify-center cursor-pointer shadow-xs"
          >
            {loading && <Spinner />}
            {loading ? 'Sending code...' : 'Send Password Reset Code'}
          </button>

          <button
            type="button"
            onClick={() => {
              setView('login')
              resetAuthInputs()
            }}
            className="text-xs text-primary font-medium hover:underline text-center mt-1 cursor-pointer"
          >
            ← Back to Log In
          </button>
        </form>
      </Modal>
    )
  }

  // FORGOT PASSWORD SUB-VIEW 2 (Verify OTP & Set New Password)
  if (view === 'forgot-password-otp') {
    return (
      <Modal title="Set New Password" close={() => setMode(null)}>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!loading && otpCode.trim().length === 6 && newPasswordValid && newPassword === confirmPassword) {
              handleResetPassword()
            }
          }}
          className="flex flex-col gap-4"
        >
          <div className="rounded-lg bg-primary/10 p-3 text-xs text-primary font-medium leading-5">
            {otpMessage || `Enter the 6-digit verification code sent to ${email} and your new password.`}
          </div>
          {error && <div className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive font-medium border border-destructive/20">{error}</div>}

          <label className="text-sm font-medium">
            Verification Code
            <input
              type="text"
              maxLength={6}
              placeholder="123456"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
              className="mt-2 h-10 w-full rounded-lg border border-input bg-background px-3 text-center font-mono tracking-widest outline-none focus:ring-2 focus:ring-ring"
              autoComplete="one-time-code"
              required
            />
          </label>

          <label className="text-sm font-medium">
            New Password
            <div className="relative mt-2">
              <input
                type={showNewPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-10 w-full rounded-lg border border-input bg-background pl-3 pr-10 outline-none focus:ring-2 focus:ring-ring text-xs"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-1"
              >
                {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </label>

          <label className="text-sm font-medium">
            Confirm Password
            <div className="relative mt-2">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-10 w-full rounded-lg border border-input bg-background pl-3 pr-10 outline-none focus:ring-2 focus:ring-ring text-xs"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-1"
              >
                {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {confirmPassword.length > 0 && (
              <p className={`text-[10px] font-semibold mt-1 ${newPassword === confirmPassword ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}>
                {newPassword === confirmPassword ? '✓ Passwords match' : '× Passwords do not match'}
              </p>
            )}
          </label>

          {newPassword.length > 0 && <PasswordRequirements password={newPassword} />}

          <button
            type="submit"
            disabled={loading || otpCode.trim().length !== 6 || !newPasswordValid || newPassword !== confirmPassword}
            className="rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-40 hover:opacity-90 transition-opacity flex items-center justify-center cursor-pointer shadow-xs"
          >
            {loading && <Spinner />}
            {loading ? 'Updating password...' : 'Reset Password'}
          </button>

          <button
            type="button"
            onClick={() => {
              setView('login')
              resetAuthInputs()
            }}
            className="text-xs text-primary font-medium hover:underline text-center mt-1 cursor-pointer"
          >
            ← Cancel & Back to Log In
          </button>
        </form>
      </Modal>
    )
  }

  // MAIN LOGIN / REGISTER MODAL VIEW
  return (
    <Modal title={view === 'login' ? 'Welcome back' : 'Create your account'} close={() => setMode(null)}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (!loading && email.includes('@') && (view === 'register' ? passwordValid : password.length >= 6)) {
            if (view === 'login') handleLogin()
            else handleSendOtp()
          }
        }}
        className="flex flex-col gap-4"
      >
        {error && <div className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive font-medium border border-destructive/20">{error}</div>}

        <label className="text-sm font-medium">
          Email Address
          <input
            type="email"
            value={email}
            placeholder="you@example.com"
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 h-10 w-full rounded-lg border border-input bg-background px-3 outline-none focus:ring-2 focus:ring-ring text-xs"
            autoComplete="email"
            required
          />
        </label>

        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">Password</label>
            {view === 'login' && (
              <button
                type="button"
                onClick={() => {
                  setView('forgot-password')
                  resetAuthInputs()
                }}
                className="text-xs text-primary font-semibold hover:underline cursor-pointer"
              >
                Forgot Password?
              </button>
            )}
          </div>
          <div className="relative mt-2">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              placeholder="••••••••••••"
              onChange={(e) => setPassword(e.target.value)}
              className="h-10 w-full rounded-lg border border-input bg-background pl-3 pr-10 outline-none focus:ring-2 focus:ring-ring text-xs"
              autoComplete={view === 'login' ? 'current-password' : 'new-password'}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-1"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        {/* Dynamic Password Strength Indicator (Registration Mode) */}
        {view === 'register' && <PasswordRequirements password={password} />}

        <button
          type="submit"
          disabled={loading || !email.includes('@') || (view === 'register' ? !passwordValid : password.length < 6)}
          className="rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-40 hover:opacity-90 transition-opacity flex items-center justify-center cursor-pointer shadow-xs"
        >
          {loading && <Spinner />}
          {loading ? 'Processing...' : view === 'login' ? 'Log in' : 'Send Verification OTP'}
        </button>

        <button
          type="button"
          onClick={() => {
            setView(view === 'login' ? 'register' : 'login')
            resetAuthInputs()
          }}
          className="text-sm text-primary font-semibold hover:underline text-center cursor-pointer"
        >
          {view === 'login' ? 'Create account' : 'Log in instead'}
        </button>
      </form>
    </Modal>
  )
}
