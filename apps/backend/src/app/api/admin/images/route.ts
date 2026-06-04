import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'
import { uploadImage } from '@/lib/r2'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const formData = await req.formData()
  const versionId = formData.get('versionId') as string
  const imageType = formData.get('type') as string
  const isPrimary = formData.get('isPrimary') === 'true'
  const file = formData.get('file') as File

  if (!versionId || !file) {
    return NextResponse.json({ error: 'versionId y file son requeridos' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const { url, thumbUrl } = await uploadImage(buffer, `cars/${versionId}`)

  if (isPrimary) {
    await prisma.carImage.updateMany({
      where: { versionId, isPrimary: true },
      data: { isPrimary: false },
    })
  }

  const image = await prisma.carImage.create({
    data: {
      versionId,
      url,
      thumbUrl,
      type: (imageType ?? 'EXTERIOR_FRONT') as never,
      isPrimary,
      uploadedBy: 'admin',
      verified: true,
    },
  })

  return NextResponse.json(image, { status: 201 })
}
