import { calcPoints } from '@autodex/shared'
import type { InteractionType, Rarity } from '@autodex/shared'
import { prisma } from './prisma'

export { calcPoints }

type AchievementRecord = {
  id: string
  key: string
  points: number
  condition: string
}

type UserAchievementRecord = {
  achievementId: string
}

type InteractionWithVehicle = {
  versionId: string
  type: InteractionType | string
  verified: boolean
  version: {
    rarity: Rarity | string
    model: {
      brand: {
        id: string
        name: string
        country: string | null
      }
    }
  }
}

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
  const [user, userInteractionsRaw, userAchievementsRaw] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { totalPoints: true } }),
    prisma.interaction.findMany({
      where: { userId },
      include: { version: { include: { model: { include: { brand: true } } } } },
    }),
    prisma.userAchievement.findMany({ where: { userId }, select: { achievementId: true } }),
  ])

  const userInteractions = userInteractionsRaw as InteractionWithVehicle[]
  const userAchievements = userAchievementsRaw as UserAchievementRecord[]
  const unlockedIds = new Set(userAchievements.map((achievement) => achievement.achievementId))
  const allAchievements = (await prisma.achievement.findMany()) as AchievementRecord[]
  const newlyUnlocked: string[] = []

  for (const achievement of allAchievements) {
    if (unlockedIds.has(achievement.id)) continue

    const condition = JSON.parse(achievement.condition) as Record<string, unknown>
    let unlocked = false

    if (condition.type === 'total_interactions') {
      unlocked = userInteractions.length >= (condition.count as number)
    } else if (condition.type === 'unique_cars') {
      const unique = new Set(userInteractions.map((interaction) => interaction.versionId))
      unlocked = unique.size >= (condition.count as number)
    } else if (condition.type === 'unique_brands') {
      const unique = new Set(userInteractions.map((interaction) => interaction.version.model.brand.id))
      unlocked = unique.size >= (condition.count as number)
    } else if (condition.type === 'brand_interaction') {
      unlocked = userInteractions.some((interaction) => interaction.version.model.brand.name === condition.brand)
    } else if (condition.type === 'interaction_type') {
      unlocked = userInteractions.filter((interaction) => interaction.type === condition.interactionType).length >= (condition.count as number)
    } else if (condition.type === 'verified_count') {
      unlocked = userInteractions.filter((interaction) => interaction.verified).length >= (condition.count as number)
    } else if (condition.type === 'rarity_interaction') {
      unlocked = userInteractions.some((interaction) => interaction.version.rarity === condition.rarity)
    } else if (condition.type === 'total_points') {
      unlocked = (user?.totalPoints ?? 0) >= (condition.points as number)
    } else if (condition.type === 'brand_country') {
      const count = userInteractions.filter((interaction) => interaction.version.model.brand.country === condition.country).length
      unlocked = count >= (condition.count as number)
    }

    if (unlocked) {
      await prisma.userAchievement.create({ data: { userId, achievementId: achievement.id } })
      await addPointsToUser(userId, achievement.points)
      newlyUnlocked.push(achievement.key)
    }
  }

  return newlyUnlocked
}
