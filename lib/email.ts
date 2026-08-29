/**
 * @file lib/email.ts
 * @description Transactional email utility service using the Resend API.
 * Handles HTML email generation and delivery for verification OTPs and user notifications.
 */

export interface SendOtpEmailResult {
  success: boolean
  id?: string
  error?: string
}

/**
 * Sends a 6-digit verification OTP email to a user during account registration.
 *
 * @param toEmail - The recipient's email address.
 * @param otpCode - The 6-digit verification OTP code.
 * @returns Object indicating success status and Resend email ID or error message.
 */
export async function sendVerificationOtpEmail(toEmail: string, otpCode: string): Promise<SendOtpEmailResult> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('[RESEND EMAIL] RESEND_API_KEY is not configured in environment variables.')
    return { success: false, error: 'Resend API key is missing' }
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 20px; }
          .container { max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e4e4e7; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { background-color: #09090b; color: #ffffff; padding: 24px; text-align: center; }
          .header h1 { margin: 0; font-size: 20px; font-weight: 600; letter-spacing: 0.5px; }
          .content { padding: 32px 24px; text-align: center; color: #18181b; }
          .otp-box { background-color: #f4f4f5; border: 1px solid #e4e4e7; border-radius: 8px; padding: 16px; font-size: 32px; font-weight: 700; letter-spacing: 8px; font-family: monospace; color: #09090b; margin: 24px 0; }
          .footer { font-size: 12px; color: #71717a; text-align: center; padding-bottom: 24px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Agora</h1>
          </div>
          <div class="content">
            <p style="font-size: 16px; margin-bottom: 8px;">Verify Your Email Address</p>
            <p style="font-size: 14px; color: #71717a; margin-top: 0;">Use the 6-digit verification code below to complete your Agora registration:</p>
            <div class="otp-box">${otpCode}</div>
            <p style="font-size: 12px; color: #a1a1aa;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Agora. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Agora <onboarding@resend.dev>',
        to: [toEmail],
        subject: `${otpCode} is your Agora verification code`,
        html: htmlContent,
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      console.error('[RESEND EMAIL API ERROR]:', data)
      return { success: false, error: data.message || data.name || 'Failed to send email via Resend API' }
    }

    console.log(`[RESEND EMAIL SENT SUCCESS] Email sent to ${toEmail}, Resend ID: ${data.id}`)
    return { success: true, id: data.id }
  } catch (err: any) {
    console.error('[RESEND EMAIL FETCH EXCEPTION]:', err)
    return { success: false, error: err.message || 'Network exception when sending email' }
  }
}

/**
 * Sends a 6-digit password reset OTP email to a user.
 *
 * @param toEmail - The recipient's email address.
 * @param otpCode - The 6-digit password reset OTP code.
 * @returns Object indicating success status and Resend email ID or error message.
 */
export async function sendPasswordResetOtpEmail(toEmail: string, otpCode: string): Promise<SendOtpEmailResult> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('[RESEND EMAIL] RESEND_API_KEY is not configured in environment variables.')
    return { success: false, error: 'Resend API key is missing' }
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 20px; }
          .container { max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e4e4e7; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { background-color: #09090b; color: #ffffff; padding: 24px; text-align: center; }
          .header h1 { margin: 0; font-size: 20px; font-weight: 600; letter-spacing: 0.5px; }
          .content { padding: 32px 24px; text-align: center; color: #18181b; }
          .otp-box { background-color: #f4f4f5; border: 1px solid #e4e4e7; border-radius: 8px; padding: 16px; font-size: 32px; font-weight: 700; letter-spacing: 8px; font-family: monospace; color: #09090b; margin: 24px 0; }
          .footer { font-size: 12px; color: #71717a; text-align: center; padding-bottom: 24px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Agora</h1>
          </div>
          <div class="content">
            <p style="font-size: 16px; margin-bottom: 8px;">Reset Your Password</p>
            <p style="font-size: 14px; color: #71717a; margin-top: 0;">Use the 6-digit verification code below to reset your Agora account password:</p>
            <div class="otp-box">${otpCode}</div>
            <p style="font-size: 12px; color: #a1a1aa;">This code will expire in 10 minutes. If you did not request a password reset, please ignore this email.</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Agora. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Agora <onboarding@resend.dev>',
        to: [toEmail],
        subject: `${otpCode} is your Agora password reset code`,
        html: htmlContent,
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      console.error('[RESEND EMAIL API ERROR]:', data)
      return { success: false, error: data.message || data.name || 'Failed to send email via Resend API' }
    }

    console.log(`[RESEND EMAIL SENT SUCCESS] Password reset email sent to ${toEmail}, Resend ID: ${data.id}`)
    return { success: true, id: data.id }
  } catch (err: any) {
    console.error('[RESEND EMAIL FETCH EXCEPTION]:', err)
    return { success: false, error: err.message || 'Network exception when sending email' }
  }
}
