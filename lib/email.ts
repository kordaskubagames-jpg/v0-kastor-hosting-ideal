import { Resend } from "resend"

const FROM = "KastorHub <onboarding@resend.dev>"

// Sends the 6-digit login code. If RESEND_API_KEY is missing (dev), we log the
// code to the server console so the flow is still testable without a provider.
export async function sendOtpEmail(to: string, code: string) {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.log(`[v0] [DEV] Email OTP for ${to}: ${code}`)
    return
  }
  const resend = new Resend(key)
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Your KastorHub login code: ${code}`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="margin:0 0 8px">Your login code</h2>
        <p style="color:#555;margin:0 0 16px">Enter this code to sign in to KastorHub.</p>
        <div style="font-size:32px;font-weight:700;letter-spacing:8px;background:#f4f4f5;padding:16px;text-align:center;border-radius:12px">${code}</div>
        <p style="color:#888;font-size:13px;margin:16px 0 0">This code expires in 5 minutes. Made via discord.gg/kastorhub</p>
      </div>`,
  })
}
