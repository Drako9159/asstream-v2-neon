import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function sendPasswordResetEmail({
  to,
  name,
  url,
}: {
  to: string
  name: string
  url: string
}) {
  if (!resend) {
    console.log('\n========================================')
    console.log(`[DEV EMAIL SIMULATION - RESET LINK for ${to}]:`)
    console.log(url)
    console.log('========================================\n')
    return { success: true, simulated: true }
  }

  const from = process.env.EMAIL_FROM || 'AsStream <onboarding@resend.dev>'

  return await resend.emails.send({
    from,
    to,
    subject: 'Reset your password - AsStream',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #222;">
        <h2 style="color: #111; margin-bottom: 16px;">Reset your password</h2>
        <p>Hello ${name || 'there'},</p>
        <p>We received a request to reset your password for your AsStream account.</p>
        <div style="margin: 28px 0;">
          <a href="${url}" style="background-color: #111; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">If you didn't request a password reset, you can safely ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="color: #999; font-size: 12px;">If the button doesn't work, copy and paste this URL into your browser:<br /><a href="${url}" style="color: #444;">${url}</a></p>
      </div>
    `,
  })
}
