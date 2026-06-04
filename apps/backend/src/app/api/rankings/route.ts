import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getOrCreateUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const scope = searchParams.get('scope') ?? 'global'   // global | country
  const country = searchParams.get('country')
  const limit = Math.min(Number(searchParams.get('limit') ?? 50), 100)

  const user = await getOrCreateUser()

  if (scope === 'country' && !user?.isPremium) {
    return NextResponse.json({ error: 'Requiere Premium', code: 'PREMIUM_REQUIRED' }, { status: 403 })
  }

  const where = scope === 'country' && country ? { country } : {}

  const users = await prisma.user.findMany({
    where,
    orderBy: { totalPoints: 'desc' },
    take: limit,
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      country: true,
      totalPoints: true,
      _count: { select: { interactions: true } },
    },
  })

  const ranking = users.map((u, i) => ({
    rank: i + 1,
    user: { id: u.id, username: u.username, displayName: u.displayName, avatarUrl: u.avatarUrl, country: u.country },
    totalPoints: u.totalPoints,
    totalInteractions: u._count.interactions,
  }))

  const myRank = user
    ? ranking.findIndex((r) => r.user.id === user.id) + 1
    : null

  return NextResponse.json({ ranking, myRank: myRank || null })
}
