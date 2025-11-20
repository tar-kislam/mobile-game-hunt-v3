"use server"

import { TwitterApi } from "twitter-api-v2"
import { prisma } from "@/lib/prisma"
import { getSiteBaseUrl } from "@/lib/image-utils"

const REQUIRED_VARS = [
  "TWITTER_API_KEY",
  "TWITTER_API_SECRET",
  "TWITTER_ACCESS_TOKEN",
  "TWITTER_ACCESS_SECRET",
] as const

const HASHTAGS = ["#MobileGameHunt", "#GameOfTheDay", "#indiegame", "#mobilegames"]

function ensureEnv() {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key])
  if (missing.length > 0) {
    throw new Error(
      `[SOCIAL] Missing Twitter credentials: ${missing.join(
        ", ",
      )}. Please set them in your environment.`,
    )
  }
}

function buildTweetCopy(title: string, pitch: string, url: string) {
  const header = `🚀 GAME OF THE DAY: ${title}`
  const body = pitch
  const cta = `Play now → ${url}`
  const footer = HASHTAGS.join(" ")

  let tweet = [header, "", body, "", cta, footer].join("\n")

  if (tweet.length <= 280) {
    return tweet
  }

  const maxPitchLength =
    280 - (header.length + cta.length + footer.length + 8) // account for line breaks
  const truncatedBody = body.slice(0, Math.max(0, maxPitchLength - 3)).trimEnd() + "..."

  tweet = [header, "", truncatedBody, "", cta, footer].join("\n")
  return tweet.length > 280 ? tweet.slice(0, 277) + "..." : tweet
}

async function getRandomPublishedProduct() {
  const total = await prisma.product.count({
    where: { status: "PUBLISHED" },
  })

  if (total === 0) {
    throw new Error("[SOCIAL] No published products available for Game of the Day.")
  }

  const skip = Math.floor(Math.random() * total)
  const product = await prisma.product.findFirst({
    where: { status: "PUBLISHED" },
    skip,
    take: 1,
    select: {
      id: true,
      slug: true,
      title: true,
      shortPitch: true,
      tagline: true,
      description: true,
    },
  })

  if (!product) {
    throw new Error("[SOCIAL] Failed to fetch random product.")
  }

  return product
}

async function fetchPosterBuffer(slug: string) {
  const baseUrl = getSiteBaseUrl()
  const posterUrl = `${baseUrl}/api/social/game-of-day/${slug}`
  const response = await fetch(posterUrl)

  if (!response.ok) {
    throw new Error(`[SOCIAL] Failed to render poster: ${response.status} ${response.statusText}`)
  }

  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

export async function postGameOfTheDayTweet() {
  if (process.env.TWITTER_AUTOMATION_ENABLED !== "true") {
    console.log("[SOCIAL] Twitter automation disabled. Set TWITTER_AUTOMATION_ENABLED=true to enable.")
    return { status: "disabled" as const }
  }

  ensureEnv()

  const product = await getRandomPublishedProduct()
  const siteUrl = getSiteBaseUrl()
  const summary =
    product.shortPitch ||
    product.tagline ||
    (product.description ? product.description.replace(/\s+/g, " ").slice(0, 160) : "").trim() ||
    "Discover this indie gem on MobileGameHunt."

  const tweetText = buildTweetCopy(product.title, summary, `${siteUrl}/product/${product.slug}`)
  const mediaBuffer = await fetchPosterBuffer(product.slug)

  const twitter = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY!,
    appSecret: process.env.TWITTER_API_SECRET!,
    accessToken: process.env.TWITTER_ACCESS_TOKEN!,
    accessSecret: process.env.TWITTER_ACCESS_SECRET!,
  })

  const readWriteClient = twitter.readWrite

  console.log("[SOCIAL] Uploading Game of the Day poster to Twitter…")
  const mediaId = await readWriteClient.v1.uploadMedia(mediaBuffer, { mimeType: "image/png" })

  console.log("[SOCIAL] Posting Game of the Day tweet…")
  const result = await readWriteClient.v2.tweet({
    text: tweetText,
    media: {
      media_ids: [mediaId],
    },
  })

  console.log(`[SOCIAL] Tweet posted successfully. Tweet ID: ${result.data.id}`)

  return {
    status: "posted" as const,
    tweetId: result.data.id,
    productSlug: product.slug,
  }
}

