/**
 * Returns the UTC start-of-day for the provided date.
 */
export function getUtcStartOfDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
}

/**
 * Returns true when the provided stored date represents the same UTC day as targetDay.
 */
export function isSameUtcDay(storedDate: Date | null | undefined, targetDay: Date): boolean {
  if (!storedDate) {
    return false
  }

  const storedStart = getUtcStartOfDay(new Date(storedDate))
  return storedStart.getTime() === targetDay.getTime()
}

/**
 * Determines if the persisted quota date needs to be reset for the provided target day.
 */
export function needsDailyReset(storedDate: Date | null | undefined, targetDay: Date): boolean {
  return !isSameUtcDay(storedDate, targetDay)
}

/**
 * Returns the UTC start-of-day for the next day relative to the provided day.
 */
export function getNextUtcStartOfDay(dayStart: Date): Date {
  const next = new Date(dayStart)
  next.setUTCDate(next.getUTCDate() + 1)
  return next
}

export interface DailyQuotaEvaluation {
  todayStart: Date
  nextReset: Date
  needsReset: boolean
  used: number
  remaining: number
  canPost: boolean
}

/**
 * Evaluates the user's daily quota state using the provided counters.
 */
export function evaluateDailyQuota(
  currentCount: number | null | undefined,
  lastResetDate: Date | null | undefined,
  limit: number,
  reference: Date = new Date()
): DailyQuotaEvaluation {
  const todayStart = getUtcStartOfDay(reference)
  const nextReset = getNextUtcStartOfDay(todayStart)
  const requiresReset = needsDailyReset(lastResetDate, todayStart)
  const used = requiresReset ? 0 : currentCount ?? 0
  const remaining = Math.max(0, limit - used)

  return {
    todayStart,
    nextReset,
    needsReset: requiresReset,
    used,
    remaining,
    canPost: remaining > 0
  }
}

