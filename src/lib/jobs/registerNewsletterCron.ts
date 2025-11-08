import cron, { ScheduledTask } from 'node-cron'
import { sendWeeklyTop5 } from '@/lib/newsletter'

const GLOBAL_KEY = '__mghNewsletterCron' as const

function registerWeeklyTop5Cron() {
  if (typeof window !== 'undefined') {
    return
  }

  const globalRef = globalThis as unknown as Record<typeof GLOBAL_KEY, ScheduledTask | null | undefined>
  if (globalRef[GLOBAL_KEY]) {
    return
  }

  if (process.env.CRON_ENABLED !== 'true') {
    console.log('[CRON] Newsletter cron disabled. Set CRON_ENABLED=true to enable scheduled sends.')
    globalRef[GLOBAL_KEY] = null
    return
  }

  const timezone = process.env.CRON_TIMEZONE || 'UTC'

  try {
    const task = cron.schedule(
      '0 9 * * 1',
      async () => {
        console.log(`[CRON] Weekly top 5 newsletter job started at ${new Date().toISOString()}`)
        try {
          await sendWeeklyTop5()
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error'
          console.error('[CRON] Weekly top 5 newsletter job failed:', message)
        }
      },
      {
        scheduled: true,
        timezone,
      },
    )

    globalRef[GLOBAL_KEY] = task
    console.log(`[CRON] Weekly top 5 newsletter scheduled for Mondays at 09:00 (${timezone})`)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[CRON] Failed to register weekly top 5 newsletter cron:', message)
    globalRef[GLOBAL_KEY] = null
  }
}

registerWeeklyTop5Cron()


