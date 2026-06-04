const BASE_URL = 'https://api.api-ninjas.com/v1'

interface ApiNinjasCar {
  make: string
  model: string
  year: number
  cylinders: number
  displacement: number
  drive: string
  fuel_type: string
  transmission: string
  highway_mpg: number
  city_mpg: number
  combination_mpg: number
  class: string
}

function mpgToKml(mpg: number): number {
  return Math.round((mpg * 0.425144) * 10) / 10
}

export async function fetchCarsByMake(make: string, year?: number): Promise<ApiNinjasCar[]> {
  const params = new URLSearchParams({ make, limit: '50' })
  if (year) params.set('year', String(year))

  const res = await fetch(`${BASE_URL}/cars?${params}`, {
    headers: { 'X-Api-Key': process.env.API_NINJAS_KEY! },
    next: { revalidate: 86400 },
  })

  if (!res.ok) throw new Error(`API Ninjas error: ${res.status}`)
  return res.json()
}

export async function syncBrandFromApiNinjas(brandName: string): Promise<number> {
  const { prisma } = await import('../prisma')

  const brand = await prisma.brand.findUnique({ where: { slug: brandName.toLowerCase() } })
  if (!brand) throw new Error(`Brand not found: ${brandName}`)

  const cars = await fetchCarsByMake(brandName)
  let synced = 0

  const modelMap = new Map<string, typeof cars>()
  for (const car of cars) {
    const key = car.model.toLowerCase()
    if (!modelMap.has(key)) modelMap.set(key, [])
    modelMap.get(key)!.push(car)
  }

  for (const [modelSlug, versions] of modelMap) {
    const modelName = versions[0].model
    const model = await prisma.carModel.upsert({
      where: { brandId_slug: { brandId: brand.id, slug: modelSlug } },
      update: {},
      create: {
        brandId: brand.id,
        name: modelName,
        slug: modelSlug,
        type: 'OTHER',
        apiSource: 'api-ninjas',
      },
    })

    for (const v of versions) {
      const versionId = `apinj-${brand.slug}-${modelSlug}-${v.year}`
      await prisma.carVersion.upsert({
        where: { id: versionId },
        update: {},
        create: {
          id: versionId,
          modelId: model.id,
          year: v.year,
          name: `${v.year} ${modelName}`,
          engine: `${v.displacement}L ${v.cylinders}cil`,
          transmission: v.transmission,
          drivetrain: v.drive?.toUpperCase(),
          fuelType: v.fuel_type === 'gas' ? 'Gasolina' : v.fuel_type === 'diesel' ? 'Diésel' : v.fuel_type,
          fuelCity: v.city_mpg ? mpgToKml(v.city_mpg) : null,
          fuelHwy: v.highway_mpg ? mpgToKml(v.highway_mpg) : null,
          rarity: 'COMMON',
          apiSource: 'api-ninjas',
          externalId: versionId,
        },
      })
      synced++
    }
  }

  return synced
}
