import * as React from 'react'
import nodemailer from 'nodemailer'
import { render } from '@react-email/render'
import { subDays } from 'date-fns'
import WeeklyTop5Email from '@/emails/WeeklyTop5Email'
import NewGameEmail from '@/emails/NewGameEmail'
import { prisma } from '@/lib/prisma'

type WeeklyGame = {
  title: string
  pitch: string
  image: string
  link: string
}

type WeeklyTop5Options = {
  testEmail?: string
}

type NewGameEmailData = {
  title: string
  shortPitch?: string | null
  thumbnail?: string | null
  link: string
}

type NewsletterSendResult = {
  attempted: number
  sent: number
  failed: number
  errors: Array<{ email: string; error: string }>
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mobilegamehunt.com'
const defaultImage = `${baseUrl}/logo/mgh-main.png`

const globalTransporterKey = Symbol.for('mgh.newsletterTransporter')

type ProductRecord = {
  id: string
  title: string
  tagline: string | null
  description: string | null
  slug: string
  thumbnail: string | null
  image: string | null
}

function getTransporter(): nodemailer.Transporter | null {
  const globalSymbols = globalThis as unknown as Record<symbol, nodemailer.Transporter | null | undefined>
  if (globalSymbols[globalTransporterKey]) {
    return globalSymbols[globalTransporterKey] || null
  }

  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT || 587)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) {
    console.error('[NEWSLETTER] Missing SMTP configuration')
    globalSymbols[globalTransporterKey] = null
    return null
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === 'true' || port === 465,
    auth: { user, pass },
  })

  globalSymbols[globalTransporterKey] = transporter
  return transporter
}

async function getActiveSubscribers(testEmail?: string) {
  if (testEmail) {
    return [{ email: testEmail }]
  }

  const subscribers = await prisma.newsletterSubscription.findMany({
    where: { isActive: true },
    select: { email: true },
  })

  return subscribers
}

export async function getWeeklyTopGames(): Promise<WeeklyGame[]> {
  const oneWeekAgo = subDays(new Date(), 7)

  const weeklyVotes = await prisma.vote.groupBy({
    by: ['productId'],
    where: {
      createdAt: { gte: oneWeekAgo },
      product: { status: 'PUBLISHED' },
    },
    _count: { productId: true },
    orderBy: { _count: { productId: 'desc' } },
    take: 5,
  })

  const weeklyIds = weeklyVotes.map((vote) => vote.productId)
  const productsMap = new Map<string, ProductRecord>()

  if (weeklyIds.length > 0) {
    const weeklyProducts = await prisma.product.findMany({
      where: { id: { in: weeklyIds } },
      select: {
        id: true,
        title: true,
        tagline: true,
        description: true,
        slug: true,
        thumbnail: true,
        image: true,
      },
    })

    weeklyProducts.forEach((product) => {
      productsMap.set(product.id, product)
    })
  }

  if (productsMap.size < 5) {
    const fallbackProducts = await prisma.product.findMany({
      where: {
        status: 'PUBLISHED',
        id: { notIn: Array.from(productsMap.keys()) },
      },
      select: {
        id: true,
        title: true,
        tagline: true,
        description: true,
        slug: true,
        thumbnail: true,
        image: true,
      },
      take: 5 - productsMap.size,
      orderBy: {
        votes: { _count: 'desc' },
      },
    })

    fallbackProducts.forEach((product) => {
      productsMap.set(product.id, product)
    })
  }

  const products = weeklyIds
    .map((id) => productsMap.get(id))
    .filter((product): product is ProductRecord => Boolean(product))

  // Append fallback items if the weekly list had fewer than 5 entries
  if (products.length < 5) {
    const additionalProducts = Array.from(productsMap.values()).filter(
      (product) => !products.some((p) => p.id === product.id),
    )
    products.push(...additionalProducts.slice(0, 5 - products.length))
  }

  return products.slice(0, 5).map((product) => ({
    title: product?.title ?? 'Untitled Game',
    pitch:
      product?.tagline ??
      (product?.description ? `${product.description.slice(0, 140)}${product.description.length > 140 ? '…' : ''}` : ''),
    image: product?.thumbnail || product?.image || defaultImage,
    link: `${baseUrl}/game/${product?.slug}`,
  }))
}

async function sendEmails(
  subject: string,
  getHtml: (email: string) => Promise<string>,
  getText: (email: string) => string,
  recipients: Array<{ email: string }>,
): Promise<NewsletterSendResult> {
  const transporter = getTransporter()

  if (!transporter) {
    return { attempted: 0, sent: 0, failed: recipients.length, errors: recipients.map((r) => ({ email: r.email, error: 'SMTP not configured' })) }
  }

  const fromAddress = process.env.SMTP_FROM || 'info@mobilegamehunt.com'
  let sent = 0
  const errors: Array<{ email: string; error: string }> = []

  for (const recipient of recipients) {
    try {
      const html = await getHtml(recipient.email)
      const text = getText(recipient.email)

      await transporter.sendMail({
        from: `"Mobile Game Hunt" <${fromAddress}>`,
        to: recipient.email,
        subject,
        html,
        text,
      })

      sent += 1
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      errors.push({ email: recipient.email, error: message })
      console.error(`[NEWSLETTER] Failed to send email to ${recipient.email}:`, message)
    }
  }

  return {
    attempted: recipients.length,
    sent,
    failed: recipients.length - sent,
    errors,
  }
}

export async function sendWeeklyTop5(options: WeeklyTop5Options = {}) {
  try {
    const games = await getWeeklyTopGames()

    if (games.length === 0) {
      console.warn('[NEWSLETTER] No published games found for weekly roundup; skipping send')
      return { attempted: 0, sent: 0, failed: 0, errors: [] }
    }

    const recipients = await getActiveSubscribers(options.testEmail)

    console.log(`[NEWSLETTER] Preparing to send weekly top 5 email to ${recipients.length} subscriber(s)`)

    const result = await sendEmails(
      '🔥 This Week’s Top 5 Mobile Games',
      async (email) =>
        await render(
          <WeeklyTop5Email
            games={games}
            unsubscribeUrl={`${baseUrl}/unsubscribe?email=${encodeURIComponent(email)}`}
            baseUrl={baseUrl}
          />,
        ),
      () => {
        const intro = 'This week’s hottest mobile games are here:\n'
        const list = games.map((game, index) => `${index + 1}. ${game.title} – ${game.link}`).join('\n')
        const footer = '\nDiscover more at mobilegamehunt.com'
        return `${intro}${list}${footer}`
      },
      recipients,
    )

    console.log(
      `[NEWSLETTER] Weekly top 5 email complete. Sent: ${result.sent}, Failed: ${result.failed}, Attempted: ${result.attempted}`,
    )

    return result
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[NEWSLETTER] Failed to prepare weekly top games email:', message)
    throw error
  }
}

export async function sendNewGameEmail(data: NewGameEmailData, options: WeeklyTop5Options = {}) {
  try {
    const recipients = await getActiveSubscribers(options.testEmail)

    if (recipients.length === 0) {
      console.warn('[NEWSLETTER] No active subscribers found for new game announcement')
      return { attempted: 0, sent: 0, failed: 0, errors: [] }
    }

    const pitch =
      data.shortPitch && data.shortPitch.trim().length > 0
        ? data.shortPitch
        : 'Jump in and see why the community is excited about this new release!'
    const image = data.thumbnail && data.thumbnail.trim().length > 0 ? data.thumbnail : defaultImage

    console.log(`[NEWSLETTER] Preparing to send new game announcement for "${data.title}" to ${recipients.length} subscriber(s)`)

    const result = await sendEmails(
      `🚀 New Game Added: ${data.title}`,
      async (email) =>
        await render(
          <NewGameEmail
            title={data.title}
            pitch={pitch}
            image={image}
            link={data.link}
            unsubscribeUrl={`${baseUrl}/unsubscribe?email=${encodeURIComponent(email)}`}
            baseUrl={baseUrl}
          />,
        ),
      () => {
        const lines = [
          `A new game just launched on Mobile Game Hunt: ${data.title}`,
          '',
          pitch,
          '',
          `Check it out: ${data.link}`,
          '',
          'Discover more at mobilegamehunt.com',
        ]
        return lines.join('\n')
      },
      recipients,
    )

    console.log(
      `[NEWSLETTER] New game announcement complete. Sent: ${result.sent}, Failed: ${result.failed}, Attempted: ${result.attempted}`,
    )

    return result
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[NEWSLETTER] Failed to send new game announcement:', message)
    throw error
  }
}


