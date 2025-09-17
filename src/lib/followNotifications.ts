import { prisma } from '@/lib/prisma'

interface NotificationData {
  type: 'followed_user_activity'
  actor: string
  action: string
  link: string
  createdAt?: Date
}

export async function notifyFollowersOfActivity(
  userId: string,
  actorUsername: string,
  action: string,
  link: string
) {
  try {
    // Get all followers of this user
    const followers = await prisma.follow.findMany({
      where: {
        followingId: userId
      },
      select: {
        followerId: true
      }
    })

    if (followers.length === 0) {
      return // No followers to notify
    }

    // Create notifications for all followers
    const notifications = followers.map(follow => ({
      userId: follow.followerId,
      message: `@${actorUsername} ${action}`,
      type: 'followed_user_activity',
      createdAt: new Date()
    }))

    // Batch create notifications
    await prisma.notification.createMany({
      data: notifications
    })

    console.log(`[FOLLOW_NOTIFICATIONS] Notified ${followers.length} followers about ${actorUsername}'s activity: ${action}`)

  } catch (error) {
    console.error('[FOLLOW_NOTIFICATIONS] Error notifying followers:', error)
    // Don't throw error to avoid breaking the main action
  }
}

export async function notifyFollowersOfGameSubmission(
  userId: string,
  actorUsername: string,
  gameTitle: string,
  gameId: string
) {
  const action = `submitted a new game: ${gameTitle}`
  const link = `/product/${gameId}`
  
  await notifyFollowersOfActivity(userId, actorUsername, action, link)
}

export async function notifyFollowersOfCommunityPost(
  userId: string,
  actorUsername: string,
  postId: string
) {
  const action = 'created a new community post'
  const link = `/community#post-${postId}`
  
  await notifyFollowersOfActivity(userId, actorUsername, action, link)
}

