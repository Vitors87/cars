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

  return NextResponse.json({
    ...user,
    stats: {
      totalInteractions: interactionStats.reduce((sum, s) => sum + s._count.type, 0),
      uniqueCars: uniqueCars.length,
      uniqueBrands: new Set(uniqueBrands.map((i) => i.version.model.brandId)).size,
      verifiedCount,
    },
    achievements: achievements.map((a) => ({
      ...a.achievement,
      unlockedAt: a.unlockedAt,
    })),
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
