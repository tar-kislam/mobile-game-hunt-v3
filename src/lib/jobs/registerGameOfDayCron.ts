import cron, { ScheduledTask } from "node-cron"
import { postGameOfTheDayTweet } from "@/lib/social/postGameOfDayTweet"

const GLOBAL_KEY = "__mghGameOfDayCron" as const

function registerGameOfDayCron() {
  if (typeof window !== "undefined") {
    return
  }

  const globalRef = globalThis as unknown as Record<
    typeof GLOBAL_KEY,
    ScheduledTask | null | undefined
  >

  if (globalRef[GLOBAL_KEY]) {
    return
  }

  if (process.env.TWITTER_AUTOMATION_ENABLED !== "true") {
    console.log("[CRON] Game of the Day tweet cron disabled. Set TWITTER_AUTOMATION_ENABLED=true to enable.")
    globalRef[GLOBAL_KEY] = null
    return
  }

  const timezone = process.env.GAME_OF_DAY_TIMEZONE || "Europe/Istanbul"
  const schedule = process.env.GAME_OF_DAY_CRON || "0 19 * * *"

  try {
    const task = cron.schedule(
      schedule,
      async () => {
        console.log(`[CRON] Game of the Day tweet job started at ${new Date().toISOString()}`)
        try {
          await postGameOfTheDayTweet()
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown error"
          console.error("[CRON] Game of the Day tweet job failed:", message)
        }
      },
      {
        scheduled: true,
        timezone,
      },
    )

    globalRef[GLOBAL_KEY] = task
    console.log(`[CRON] Game of the Day tweet scheduled with cron "${schedule}" (${timezone})`)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("[CRON] Failed to register Game of the Day tweet cron:", message)
    globalRef[GLOBAL_KEY] = null
  }
}

registerGameOfDayCron()



