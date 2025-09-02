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

export async function sendMail(opts: { to: string; subject: string; html: string; from?: string }) {
  const transport = getTransport()
  if (!transport) return { ok: false, reason: 'not_configured' }
  const from = opts.from || process.env.MAIL_FROM || 'noreply@mobilegamehunt.app'
  await transport.sendMail({ from, to: opts.to, subject: opts.subject, html: opts.html })
  return { ok: true }
}


