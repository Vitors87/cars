import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'
import { syncBrandFromApiNinjas } from '@/lib/car-apis/api-ninjas'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await req.json()
  const brand: string = body.brand

  if (!brand) {
    return NextResponse.json({ error: 'brand es requerido' }, { status: 400 })
  }

  try {
    const count = await syncBrandFromApiNinjas(brand)
    return NextResponse.json({ synced: count, brand })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

// Cron: sync top brands weekly (called by Vercel Cron)
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const brands = await prisma.brand.findMany({ select: { name: true } })
  const results: Record<string, number> = {}

  for (const b of brands.slice(0, 5)) {
    try {
      results[b.name] = await syncBrandFromApiNinjas(b.name)
    } catch (e) {
      results[b.name] = -1
    }
  }

  return NextResponse.json({ results })
}
