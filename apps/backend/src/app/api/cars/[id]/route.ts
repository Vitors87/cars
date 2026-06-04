import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getOrCreateUser } from '@/lib/auth'
import { FREE_TIER_MAX_IMAGES } from '@autodex/shared'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getOrCreateUser()

  const version = await prisma.carVersion.findUnique({
    where: { id: params.id },
    include: {
      model: { include: { brand: true } },
      images: { orderBy: [{ isPrimary: 'desc' }, { type: 'asc' }] },
      _count: { select: { interactions: true } },
    },
  })

  if (!version) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const images = user?.isPremium ? version.images : version.images.slice(0, FREE_TIER_MAX_IMAGES)

  const interactionCounts = await prisma.interaction.groupBy({
    by: ['type'],
    where: { versionId: params.id },
    _count: { type: true },
  })

  const counts = { WANT: 0, SAW: 0, RODE: 0, DROVE: 0, OWNED: 0 }
  for (const c of interactionCounts) counts[c.type] = c._count.type

  const userInteraction = user
    ? await prisma.interaction.findMany({
        where: { userId: user.id, versionId: params.id },
        select: { type: true, verified: true, createdAt: true },
      })
    : []

  return NextResponse.json({
    ...version,
    images,
    interactionCounts: counts,
    userInteractions: userInteraction,
    isFullGallery: user?.isPremium ?? false,
    totalImages: version.images.length,
  })
}
