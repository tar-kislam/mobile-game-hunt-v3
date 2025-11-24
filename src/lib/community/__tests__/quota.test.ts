import { getUtcStartOfDay, getNextUtcStartOfDay, isSameUtcDay, needsDailyReset, evaluateDailyQuota } from '@/lib/community/quota'

describe('community quota helpers', () => {
  const sampleDate = new Date(Date.UTC(2025, 10, 24, 15, 30, 0))

  test('getUtcStartOfDay normalizes to midnight UTC', () => {
    const start = getUtcStartOfDay(sampleDate)
    expect(start.getUTCHours()).toBe(0)
    expect(start.getUTCMinutes()).toBe(0)
    expect(start.getUTCSeconds()).toBe(0)
    expect(start.getUTCFullYear()).toBe(2025)
    expect(start.getUTCMonth()).toBe(10)
    expect(start.getUTCDate()).toBe(24)
  })

  test('getNextUtcStartOfDay advances one calendar day', () => {
    const start = getUtcStartOfDay(sampleDate)
    const next = getNextUtcStartOfDay(start)
    expect(next.getTime()).toBe(start.getTime() + 24 * 60 * 60 * 1000)
  })

  test('isSameUtcDay compares dates regardless of time component', () => {
    const start = getUtcStartOfDay(sampleDate)
    const laterSameDay = new Date(Date.UTC(2025, 10, 24, 23, 59))
    const nextDay = new Date(Date.UTC(2025, 10, 25, 0, 0))

    expect(isSameUtcDay(laterSameDay, start)).toBe(true)
    expect(isSameUtcDay(nextDay, start)).toBe(false)
  })

  test('needsDailyReset returns true when stored date differs from target day', () => {
    const today = getUtcStartOfDay(sampleDate)
    const yesterday = new Date(today)
    yesterday.setUTCDate(today.getUTCDate() - 1)

    expect(needsDailyReset(null, today)).toBe(true)
    expect(needsDailyReset(yesterday, today)).toBe(true)
    expect(needsDailyReset(today, today)).toBe(false)
  })

  test('evaluateDailyQuota resets usage when day changes and enforces limit', () => {
    const reference = new Date(Date.UTC(2025, 10, 24, 12, 0))
    const todayStart = getUtcStartOfDay(reference)
    const yesterday = new Date(todayStart)
    yesterday.setUTCDate(todayStart.getUTCDate() - 1)

    const fresh = evaluateDailyQuota(2, todayStart, 3, reference)
    expect(fresh.used).toBe(2)
    expect(fresh.remaining).toBe(1)
    expect(fresh.canPost).toBe(true)
    expect(fresh.needsReset).toBe(false)

    const afterReset = evaluateDailyQuota(3, yesterday, 3, reference)
    expect(afterReset.used).toBe(0)
    expect(afterReset.remaining).toBe(3)
    expect(afterReset.canPost).toBe(true)
    expect(afterReset.needsReset).toBe(true)

    const exhausted = evaluateDailyQuota(3, todayStart, 3, reference)
    expect(exhausted.remaining).toBe(0)
    expect(exhausted.canPost).toBe(false)
  })
})

