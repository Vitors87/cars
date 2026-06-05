import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth'

export async function GET() {
  let user
  try {
    user = await requireUser()
  } catch {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const [interactionStats, achievements] = await Promise.all([
    prisma.interaction.groupBy({
      by: ['type'],
      where: { userId: user.id },
      _count: { type: true },
    }),
    prisma.userAchievement.findMany({
      where: { userId: user.id },
      include: { achievement: true },
      orderBy: { unlockedAt: 'desc' },
    }),
  ])

  const uniqueCars = await prisma.interaction.findMany({
    where: { userId: user.id },
    select: { versionId: true },
    distinct: ['versionId'],
  })

  const uniqueBrands = await prisma.interaction.findMany({
    where: { userId: user.id },
    select: { version: { select: { model: { select: { brandId: true } } } } },
    distinct: ['versionId'],
  })

  const verifiedCount = await prisma.interaction.count({
    where: { userId: user.id, verified: true },
  })

  const totalInteractions = interactionStats.reduce(
    (sum: number, stat: { _count: { type: number } }) => sum + stat._count.type,
    0,
  )

  const uniqueBrandCount = new Set(
    uniqueBrands.map(
      (interaction: { version: { model: { brandId: string } } }) => interaction.version.model.brandId,
    ),
  ).size

  return NextResponse.json({
    ...user,
    stats: {
      totalInteractions,
      uniqueCars: uniqueCars.length,
      uniqueBrands: uniqueBrandCount,
      verifiedCount,
    },
    achievements: achievements.map(
      (userAchievement: { achievement: unknown; unlockedAt: Date }) => ({
        ...(userAchievement.achievement as Record<string, unknown>),
        unlockedAt: userAchievement.unlockedAt,
      }),
    ),
  })
}

export async function PATCH(req: Request) {
  let user
  try {
    user = await requireUser()
  } catch {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await req.json()
  const allowed = ['displayName', 'bio', 'country'] as const
  const data: Record<string, string> = {}
  for (const key of allowed) {
    if (typeof body[key] === 'string') data[key] = body[key]
  }

  const updated = await prisma.user.update({ where: { id: user.id }, data })
  return NextResponse.json(updated)
}
