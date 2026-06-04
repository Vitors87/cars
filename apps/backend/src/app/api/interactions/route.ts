import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth'
import { calcPoints, checkDailyLimit, incrementDailyCount, addPointsToUser, checkAchievements } from '@/lib/points'
import { uploadImage } from '@/lib/r2'

const schema = z.object({
  versionId: z.string(),
  type: z.enum(['WANT', 'SAW', 'RODE', 'DROVE', 'OWNED']),
  photoBase64: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  note: z.string().max(200).optional(),
})

export async function POST(req: NextRequest) {
  let user
  try {
    user = await requireUser()
  } catch {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.flatten() }, { status: 400 })
  }

  const { versionId, type, photoBase64, latitude, longitude, note } = parsed.data

  const withinLimit = await checkDailyLimit(user.id, user.isPremium)
  if (!withinLimit) {
    return NextResponse.json(
      { error: 'Límite diario alcanzado. Actualiza a Premium para interacciones ilimitadas.', code: 'DAILY_LIMIT' },
      { status: 429 }
    )
  }

  const version = await prisma.carVersion.findUnique({ where: { id: versionId } })
  if (!version) return NextResponse.json({ error: 'Auto no encontrado' }, { status: 404 })

  const existing = await prisma.interaction.findUnique({
    where: { userId_versionId_type: { userId: user.id, versionId, type } },
  })
  if (existing) {
    return NextResponse.json({ error: 'Ya registraste esta interacción', code: 'DUPLICATE' }, { status: 409 })
  }

  let photoUrl: string | undefined
  let photoHash: string | undefined
  let verified = false

  if (photoBase64) {
    try {
      const buffer = Buffer.from(photoBase64, 'base64')
      const uploaded = await uploadImage(buffer, `interactions/${user.id}`)
      photoUrl = uploaded.url
      photoHash = uploaded.hash
      verified = true
    } catch (e) {
      console.error('Upload failed:', e)
    }
  }

  const points = calcPoints(type, version.rarity, verified)

  const interaction = await prisma.interaction.create({
    data: {
      userId: user.id,
      versionId,
      type,
      points,
      verified,
      photoUrl,
      photoHash,
      latitude,
      longitude,
      note,
    },
    include: {
      version: { include: { model: { include: { brand: true } } } },
    },
  })

  await Promise.all([
    incrementDailyCount(user.id),
    addPointsToUser(user.id, points),
  ])

  const newAchievements = await checkAchievements(user.id)

  return NextResponse.json({ interaction, points, newAchievements }, { status: 201 })
}

export async function GET(req: NextRequest) {
  let user
  try {
    user = await requireUser()
  } catch {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { searchParams } = req.nextUrl
  const type = searchParams.get('type')
  const page = Number(searchParams.get('page') ?? 1)
  const pageSize = 20

  const where = {
    userId: user.id,
    ...(type && { type: type as never }),
  }

  const [data, total] = await Promise.all([
    prisma.interaction.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        version: {
          include: {
            model: { include: { brand: true } },
            images: { where: { isPrimary: true }, take: 1 },
          },
        },
      },
    }),
    prisma.interaction.count({ where }),
  ])

  return NextResponse.json({ data, total, page, pageSize, hasMore: page * pageSize < total })
}
