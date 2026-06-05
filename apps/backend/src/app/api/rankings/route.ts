import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getOrCreateUser } from '@/lib/auth'

type RankingUser = {
  id: string
  username: string
  displayName: string
  avatarUrl: string | null
  country: string
  totalPoints: number
  _count: { interactions: number }
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const scope = searchParams.get('scope') ?? 'global'
  const country = searchParams.get('country')
  const limit = Math.min(Number(searchParams.get('limit') ?? 50), 100)

  const user = await getOrCreateUser()

  if (scope === 'country' && !user?.isPremium) {
    return NextResponse.json({ error: 'Requiere Premium', code: 'PREMIUM_REQUIRED' }, { status: 403 })
  }

  const where = scope === 'country' && country ? { country } : {}

  const users = (await prisma.user.findMany({
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
  })) as RankingUser[]

  const ranking = users.map((rankingUser: RankingUser, index: number) => ({
    rank: index + 1,
    user: {
      id: rankingUser.id,
      username: rankingUser.username,
      displayName: rankingUser.displayName,
      avatarUrl: rankingUser.avatarUrl,
      country: rankingUser.country,
    },
    totalPoints: rankingUser.totalPoints,
    totalInteractions: rankingUser._count.interactions,
  }))

  const myRank = user
    ? ranking.findIndex((entry: { user: { id: string } }) => entry.user.id === user.id) + 1
    : null

  return NextResponse.json({ ranking, myRank: myRank || null })
}
