import { calcPoints } from '@autodex/shared'
import type { InteractionType, Rarity } from '@autodex/shared'
import { prisma } from './prisma'

export { calcPoints }

export async function checkDailyLimit(userId: string, isPremium: boolean): Promise<boolean> {
  if (isPremium) return true

  const today = new Date().toISOString().split('T')[0]
  const record = await prisma.dailyInteractionCount.findUnique({
    where: { userId_date: { userId, date: today } },
  })

  return !record || record.count < 20
}

export async function incrementDailyCount(userId: string): Promise<void> {
  const today = new Date().toISOString().split('T')[0]
  await prisma.dailyInteractionCount.upsert({
    where: { userId_date: { userId, date: today } },
    update: { count: { increment: 1 } },
    create: { userId, date: today, count: 1 },
  })
}

export async function addPointsToUser(userId: string, points: number): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { totalPoints: { increment: points } },
  })
}

export async function checkAchievements(userId: string): Promise<string[]> {
  const [user, userInteractions, userAchievements] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { totalPoints: true } }),
    prisma.interaction.findMany({
      where: { userId },
      include: { version: { include: { model: { include: { brand: true } } } } },
    }),
    prisma.userAchievement.findMany({ where: { userId }, select: { achievementId: true } }),
  ])

  const unlockedIds = new Set(userAchievements.map((a) => a.achievementId))
  const allAchievements = await prisma.achievement.findMany()
  const newlyUnlocked: string[] = []

  for (const ach of allAchievements) {
    if (unlockedIds.has(ach.id)) continue

    const cond = JSON.parse(ach.condition as string) as Record<string, unknown>
    let unlocked = false

    if (cond.type === 'total_interactions') {
      unlocked = userInteractions.length >= (cond.count as number)
    } else if (cond.type === 'unique_cars') {
      const unique = new Set(userInteractions.map((i) => i.versionId))
      unlocked = unique.size >= (cond.count as number)
    } else if (cond.type === 'unique_brands') {
      const unique = new Set(userInteractions.map((i) => i.version.model.brand.id))
      unlocked = unique.size >= (cond.count as number)
    } else if (cond.type === 'brand_interaction') {
      unlocked = userInteractions.some((i) => i.version.model.brand.name === cond.brand)
    } else if (cond.type === 'interaction_type') {
      unlocked = userInteractions.filter((i) => i.type === cond.interactionType).length >= (cond.count as number)
    } else if (cond.type === 'verified_count') {
      unlocked = userInteractions.filter((i) => i.verified).length >= (cond.count as number)
    } else if (cond.type === 'rarity_interaction') {
      unlocked = userInteractions.some((i) => i.version.rarity === cond.rarity)
    } else if (cond.type === 'total_points') {
      unlocked = (user?.totalPoints ?? 0) >= (cond.points as number)
    } else if (cond.type === 'brand_country') {
      const count = userInteractions.filter((i) => i.version.model.brand.country === cond.country).length
      unlocked = count >= (cond.count as number)
    }

    if (unlocked) {
      await prisma.userAchievement.create({ data: { userId, achievementId: ach.id } })
      await addPointsToUser(userId, ach.points)
      newlyUnlocked.push(ach.key)
    }
  }

  return newlyUnlocked
}
