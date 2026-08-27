'use client'

import React, { useState } from 'react'
import { Modal } from '@/components/Modal'
import { skills } from '@/lib/prototype-utils'

interface AuthModalProps {
  mode: 'login' | 'register' | 'onboarding'
  setMode: (m: 'login' | 'register' | 'onboarding' | null) => void
  onSuccess: (user: any) => void
  notify: (msg: string) => void
}

/**
 * AuthModal component handling Login, 2-step Email OTP Registration with real-time Password Policy validation, and Onboarding skill selection.
 */
export function AuthModal({ mode, setMode, onSuccess, notify }: AuthModalProps) {
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

  const add = (arr: string[], set: (v: string[]) => void, s: string) => set(arr.includes(s) ? arr.filter((x) => x !== s) : [...arr, s])

  // Password Policy Validation Rules (12-64 chars, Uppercase, Lowercase, Number, Symbol)
  const lenOk = password.length >= 12 && password.length <= 64
  const upperOk = /[A-Z]/.test(password)
  const lowerOk = /[a-z]/.test(password)
  const digitOk = /[0-9]/.test(password)
  const symbolOk = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)
  const passwordValid = lenOk && upperOk && lowerOk && digitOk && symbolOk

  async function handleSendOtp() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send-otp', email, password }),
      })
      const data = await res.json()
      setLoading(false)
      if (!res.ok) {
        setError(data.error || 'Failed to send OTP')
        return
      }
      setOtpStep(true)
      setOtpMessage(data.message || `Verification code sent to ${email}`)
      notify('Verification OTP sent!')
    } catch {
      setLoading(false)
      setError('Server connection error')
    }
  }

  async function handleVerifyOtp() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify-otp', email, otp: otpCode }),
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
      notify('Email verified successfully!')
    } catch {
      setLoading(false)
      setError('Server connection error')
    }
  }

  async function handleLogin() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
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
    } catch {
      setLoading(false)
      setError('Server connection error')
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
          className="mt-6 w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-40 hover:opacity-90 transition-opacity"
        >
          {step === 1 ? 'Continue' : 'Finish onboarding'}
        </button>
      </Modal>
    )
  }

  if (mode === 'register' && otpStep) {
    return (
      <Modal title="Verify Email (OTP)" close={() => setMode(null)}>
        <div className="flex flex-col gap-4">
          <div className="rounded-lg bg-primary/10 p-3 text-xs text-primary font-medium leading-5">
            {otpMessage || `Enter the 6-digit OTP code sent to ${email}.`}
          </div>
          {error && <div className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive">{error}</div>}

          <label className="text-sm font-medium">
            6-Digit Verification Code
            <input
              type="text"
              maxLength={6}
              placeholder="123456"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              className="mt-2 h-12 w-full rounded-lg border border-input bg-background px-3 text-center text-lg font-mono tracking-widest outline-none focus:ring-2 focus:ring-ring"
            />
          </label>

          <button
            disabled={loading || otpCode.trim().length !== 6}
            onClick={handleVerifyOtp}
            className="rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-40 hover:opacity-90 transition-opacity"
          >
            {loading ? 'Verifying...' : 'Verify & Create Account'}
          </button>

          <div className="flex justify-between text-xs pt-1">
            <button type="button" onClick={() => setOtpStep(false)} className="text-muted-foreground hover:underline">
              ← Edit Registration Details
            </button>
            <button type="button" onClick={handleSendOtp} className="text-primary hover:underline font-medium">
              Resend OTP Code
            </button>
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <Modal title={mode === 'login' ? 'Welcome back' : 'Create your account'} close={() => setMode(null)}>
      <div className="flex flex-col gap-4">
        {error && <div className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive">{error}</div>}
        <label className="text-sm font-medium">
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 h-10 w-full rounded-lg border border-input bg-background px-3 outline-none focus:ring-2 focus:ring-ring" />
        </label>
        <label className="text-sm font-medium">
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 h-10 w-full rounded-lg border border-input bg-background px-3 outline-none focus:ring-2 focus:ring-ring" />
        </label>

        {/* Real-time Password Complexity Rules (Registration Mode) */}
        {mode === 'register' && (
          <div className="rounded-lg border border-border bg-muted/30 p-3 text-[11px]">
            <p className="font-semibold text-muted-foreground mb-1.5">Password Policy Requirements:</p>
            <div className="grid grid-cols-2 gap-1 font-medium">
              <span className={lenOk ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}>
                {lenOk ? '✓' : '○'} 12–64 characters
              </span>
              <span className={upperOk ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}>
                {upperOk ? '✓' : '○'} Uppercase letter (A-Z)
              </span>
              <span className={lowerOk ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}>
                {lowerOk ? '✓' : '○'} Lowercase letter (a-z)
              </span>
              <span className={digitOk ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}>
                {digitOk ? '✓' : '○'} Number (0-9)
              </span>
              <span className={symbolOk ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}>
                {symbolOk ? '✓' : '○'} Special symbol (!@#$)
              </span>
            </div>
          </div>
        )}

        <button
          disabled={loading || !email.includes('@') || (mode === 'register' ? !passwordValid : password.length < 6)}
          onClick={mode === 'login' ? handleLogin : handleSendOtp}
          className="rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-40 hover:opacity-90 transition-opacity"
        >
          {loading ? 'Processing...' : mode === 'login' ? 'Log in' : 'Send Verification OTP'}
        </button>

        <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setOtpStep(false); }} className="text-sm text-primary hover:underline">
          {mode === 'login' ? 'Create account' : 'Log in instead'}
        </button>
      </div>
    </Modal>
  )
}
