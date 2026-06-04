import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const brands = [
  { name: 'Toyota', slug: 'toyota', country: 'JP' },
  { name: 'Volkswagen', slug: 'volkswagen', country: 'DE' },
  { name: 'Chevrolet', slug: 'chevrolet', country: 'US' },
  { name: 'Ford', slug: 'ford', country: 'US' },
  { name: 'Honda', slug: 'honda', country: 'JP' },
  { name: 'Nissan', slug: 'nissan', country: 'JP' },
  { name: 'BMW', slug: 'bmw', country: 'DE' },
  { name: 'Mercedes-Benz', slug: 'mercedes-benz', country: 'DE' },
  { name: 'Ferrari', slug: 'ferrari', country: 'IT' },
  { name: 'Lamborghini', slug: 'lamborghini', country: 'IT' },
  { name: 'Porsche', slug: 'porsche', country: 'DE' },
  { name: 'Audi', slug: 'audi', country: 'DE' },
  { name: 'Hyundai', slug: 'hyundai', country: 'KR' },
  { name: 'Kia', slug: 'kia', country: 'KR' },
  { name: 'Subaru', slug: 'subaru', country: 'JP' },
]

const seedCars = [
  {
    brand: 'Toyota', model: 'Corolla', type: 'SEDAN' as const,
    versions: [
      { year: 2024, name: '1.8 XEI CVT', trim: 'XEI', engine: '1.8L 4cil', horsepower: 140, torqueNm: 172, transmission: 'CVT', drivetrain: 'FWD', fuelType: 'Gasolina', rarity: 'COMMON' as const, isLatam: true },
    ]
  },
  {
    brand: 'Volkswagen', model: 'Golf', type: 'HATCHBACK' as const,
    versions: [
      { year: 2024, name: '1.4 TSI Trendline', trim: 'Trendline', engine: '1.4L TSI', horsepower: 150, torqueNm: 250, transmission: 'DSG 7v', drivetrain: 'FWD', fuelType: 'Gasolina', rarity: 'UNCOMMON' as const, isLatam: false },
    ]
  },
  {
    brand: 'BMW', model: 'M3', type: 'SEDAN' as const,
    versions: [
      { year: 2024, name: 'Competition xDrive', trim: 'Competition', engine: '3.0L BiTurbo', horsepower: 510, torqueNm: 650, transmission: 'Automática 8v', drivetrain: 'AWD', fuelType: 'Gasolina', rarity: 'RARE' as const, isLatam: false },
    ]
  },
  {
    brand: 'Ferrari', model: '296 GTB', type: 'SUPERCAR' as const,
    versions: [
      { year: 2024, name: 'Assetto Fiorano', trim: 'Assetto Fiorano', engine: '3.0L V6 Híbrido', horsepower: 830, torqueNm: 740, transmission: 'DCT 8v', drivetrain: 'RWD', fuelType: 'Híbrido', rarity: 'LEGENDARY' as const, isLatam: false },
    ]
  },
  {
    brand: 'Lamborghini', model: 'Huracán', type: 'SUPERCAR' as const,
    versions: [
      { year: 2024, name: 'EVO AWD', trim: 'EVO', engine: '5.2L V10', horsepower: 640, torqueNm: 600, transmission: 'DCT 7v', drivetrain: 'AWD', fuelType: 'Gasolina', rarity: 'EPIC' as const, isLatam: false },
    ]
  },
  {
    brand: 'Chevrolet', model: 'Onix', type: 'HATCHBACK' as const,
    versions: [
      { year: 2024, name: '1.0T Premier', trim: 'Premier', engine: '1.0L Turbo', horsepower: 116, torqueNm: 166, transmission: 'Automática 6v', drivetrain: 'FWD', fuelType: 'Gasolina', rarity: 'COMMON' as const, isLatam: true },
    ]
  },
  {
    brand: 'Ford', model: 'Ranger', type: 'PICKUP' as const,
    versions: [
      { year: 2024, name: '3.2 XLT 4x4', trim: 'XLT', engine: '3.2L Diesel', horsepower: 200, torqueNm: 470, transmission: 'Automática 6v', drivetrain: 'AWD', fuelType: 'Diésel', rarity: 'COMMON' as const, isLatam: true },
    ]
  },
  {
    brand: 'Porsche', model: '911', type: 'COUPE' as const,
    versions: [
      { year: 2024, name: 'Carrera 4S', trim: 'Carrera 4S', engine: '3.0L BiTurbo', horsepower: 450, torqueNm: 530, transmission: 'PDK 8v', drivetrain: 'AWD', fuelType: 'Gasolina', rarity: 'EPIC' as const, isLatam: false },
    ]
  },
]

const achievements = [
  { key: 'first_interaction', name: '¡Primera vez!', description: 'Registra tu primera interacción', iconUrl: '/achievements/first.png', points: 10, condition: JSON.stringify({ type: 'total_interactions', count: 1 }) },
  { key: 'first_ferrari', name: '¡Mi primer Ferrari!', description: 'Registra una Ferrari', iconUrl: '/achievements/ferrari.png', points: 50, condition: JSON.stringify({ type: 'brand_interaction', brand: 'Ferrari', count: 1 }) },
  { key: 'ten_cars', name: 'Coleccionista', description: 'Agrega 10 autos a tu colección', iconUrl: '/achievements/collector.png', points: 25, condition: JSON.stringify({ type: 'unique_cars', count: 10 }) },
  { key: 'five_brands', name: 'Explorador de marcas', description: 'Interactúa con 5 marcas distintas', iconUrl: '/achievements/brands.png', points: 30, condition: JSON.stringify({ type: 'unique_brands', count: 5 }) },
  { key: 'first_drive', name: 'Al volante', description: 'Registra tu primer auto que manejaste', iconUrl: '/achievements/drive.png', points: 40, condition: JSON.stringify({ type: 'interaction_type', interactionType: 'DROVE', count: 1 }) },
  { key: 'first_owned', name: 'Propietario', description: 'Registra tu primer auto que tuviste', iconUrl: '/achievements/owned.png', points: 60, condition: JSON.stringify({ type: 'interaction_type', interactionType: 'OWNED', count: 1 }) },
  { key: 'verified_spotter', name: 'Spotter verificado', description: 'Registra 5 avistamientos verificados con foto', iconUrl: '/achievements/verified.png', points: 50, condition: JSON.stringify({ type: 'verified_count', count: 5 }) },
  { key: 'legendary_spotted', name: '¡Legendario!', description: 'Avista un auto legendario', iconUrl: '/achievements/legendary.png', points: 100, condition: JSON.stringify({ type: 'rarity_interaction', rarity: 'LEGENDARY', count: 1 }) },
  { key: 'hundred_points', name: 'Triple dígito', description: 'Alcanza 100 puntos', iconUrl: '/achievements/100pts.png', points: 20, condition: JSON.stringify({ type: 'total_points', points: 100 }) },
  { key: 'japan_lover', name: 'Japan car lover', description: 'Interactúa con 10 autos japoneses', iconUrl: '/achievements/japan.png', points: 35, condition: JSON.stringify({ type: 'brand_country', country: 'JP', count: 10 }) },
]

async function main() {
  console.log('🌱 Seeding database...')

  for (const b of brands) {
    await prisma.brand.upsert({
      where: { slug: b.slug },
      update: {},
      create: b,
    })
  }
  console.log(`✅ ${brands.length} brands`)

  for (const car of seedCars) {
    const brand = await prisma.brand.findUnique({ where: { slug: car.brand.toLowerCase() } })
    if (!brand) continue

    const model = await prisma.carModel.upsert({
      where: { brandId_slug: { brandId: brand.id, slug: car.model.toLowerCase().replace(/\s+/g, '-') } },
      update: {},
      create: {
        brandId: brand.id,
        name: car.model,
        slug: car.model.toLowerCase().replace(/\s+/g, '-'),
        type: car.type,
      },
    })

    for (const v of car.versions) {
      const versionId = `${model.id}-${v.year}-${v.trim?.toLowerCase().replace(/\s+/g, '-')}`
      await prisma.carVersion.upsert({
        where: { id: versionId },
        update: {},
        create: { id: versionId, modelId: model.id, ...v },
      })
      // Imagen placeholder para que la UI muestre algo visual
      const existing = await prisma.carImage.findFirst({ where: { versionId } })
      if (!existing) {
        const label = encodeURIComponent(`${car.brand} ${car.model}`)
        await prisma.carImage.create({
          data: {
            versionId,
            url: `https://placehold.co/800x500/1A1A1A/E63946?text=${label}`,
            thumbUrl: `https://placehold.co/400x250/1A1A1A/E63946?text=${label}`,
            type: 'EXTERIOR_FRONT',
            isPrimary: true,
            uploadedBy: 'seed',
            verified: true,
          },
        })
      }
    }
  }
  console.log(`✅ ${seedCars.length} models with versions`)

  for (const ach of achievements) {
    await prisma.achievement.upsert({
      where: { key: ach.key },
      update: {},
      create: ach,
    })
  }
  console.log(`✅ ${achievements.length} achievements`)

  console.log('🎉 Seed complete!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
