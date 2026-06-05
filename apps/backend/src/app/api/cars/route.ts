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
    ...(rarity && { rarity }),
    ...(year && { year: Number(year) }),
    ...(isLatam === 'true' && { isLatam: true }),
    model: {
      ...(type && { type }),
      brand: {
        ...(brand && { slug: brand }),
        ...(search && {
          name: { contains: search },
        }),
      },
    },
    ...(search && !brand && {
      OR: [
        { model: { name: { contains: search } } },
        { model: { brand: { name: { contains: search } } } },
        { name: { contains: search } },
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

  const versionIds = data.map((car: { id: string }) => car.id)

  const userInteractions = user
    ? await prisma.interaction.findMany({
        where: { userId: user.id, versionId: { in: versionIds } },
        select: { versionId: true, type: true },
      })
    : []

  const interactionMap = new Map(
    userInteractions.map((interaction: { versionId: string; type: string }) => [interaction.versionId, interaction.type])
  )

  return NextResponse.json({
    data: data.map((version: any) => ({
      ...version,
      primaryImage: version.images[0] ?? null,
      images: undefined,
      userInteraction: interactionMap.get(version.id) ?? null,
    })),
    total,
    page,
    pageSize,
    hasMore: page * pageSize < total,
  })
}
