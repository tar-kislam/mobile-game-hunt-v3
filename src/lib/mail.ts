import nodemailer from 'nodemailer'

export function getTransport() {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT || 587)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  if (!host || !user || !pass) return null
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  })
}

export async function sendMail(opts: { to: string; subject: string; html: string; from?: string; text?: string }) {
  const transport = getTransport()
  if (!transport) return { ok: false, reason: 'not_configured' }
  const from = opts.from || '"MobileGameHunt" <info@mobilegamehunt.com>'
  await transport.sendMail({ 
    from, 
    to: opts.to, 
    subject: opts.subject, 
    html: opts.html,
    text: opts.text || opts.html.replace(/<[^>]*>/g, '') // Strip HTML tags for text version
  })
  return { ok: true }
}


