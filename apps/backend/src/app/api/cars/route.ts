import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getOrCreateUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const page = Number(searchParams.get('page') ?? 1)
  const pageSize = Math.min(Number(searchParams.get('pageSize') ?? 20), 50)
  const search = searchParams.get('q')?.trim()
  const brand = searchParams.get('brand')
  const type = searchParams.get('type')
  const rarity = searchParams.get('rarity')
  const year = searchParams.get('year')
  const isLatam = searchParams.get('latam')

  const user = await getOrCreateUser()

  const where = {
    ...(rarity && { rarity: rarity as never }),
    ...(year && { year: Number(year) }),
    ...(isLatam === 'true' && { isLatam: true }),
    model: {
      ...(type && { type: type as never }),
      brand: {
        ...(brand && { slug: brand }),
        ...(search && {
          name: { contains: search, mode: 'insensitive' as const },
        }),
      },
    },
    ...(search && !brand && {
      OR: [
        { model: { name: { contains: search, mode: 'insensitive' as const } } },
        { model: { brand: { name: { contains: search, mode: 'insensitive' as const } } } },
        { name: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
  }

  const [data, total] = await Promise.all([
    prisma.carVersion.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: [{ model: { brand: { name: 'asc' } } }, { model: { name: 'asc' } }, { year: 'desc' }],
      include: {
        model: { include: { brand: true } },
        images: { where: { isPrimary: true }, take: 1 },
        _count: { select: { interactions: true } },
      },
    }),
    prisma.carVersion.count({ where }),
  ])

  const userInteractions = user
    ? await prisma.interaction.findMany({
        where: { userId: user.id, versionId: { in: data.map((c) => c.id) } },
        select: { versionId: true, type: true },
      })
    : []

  const interactionMap = new Map(userInteractions.map((i) => [i.versionId, i.type]))

  return NextResponse.json({
    data: data.map((v) => ({
      ...v,
      primaryImage: v.images[0] ?? null,
      images: undefined,
      userInteraction: interactionMap.get(v.id) ?? null,
    })),
    total,
    page,
    pageSize,
    hasMore: page * pageSize < total,
  })
}
