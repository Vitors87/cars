# @autodex/backend

API REST de AutoDex construida con Next.js 14 App Router y Prisma ORM.

## Tecnologías

- **Next.js 14** — API Routes con App Router
- **Prisma** — ORM con soporte SQLite (dev) y PostgreSQL (prod)
- **Zod** — Validación de payloads
- **Cloudflare R2** — Storage de imágenes (prod)
- **Clerk** — Autenticación (prod)

## Estructura

```
apps/backend/
├── prisma/
│   ├── schema.prisma       # Definición de modelos
│   └── seed.ts             # Datos iniciales (marcas, autos, logros)
└── src/
    ├── app/
    │   └── api/
    │       ├── cars/           # GET /api/cars, GET /api/cars/:id
    │       ├── interactions/   # GET y POST /api/interactions
    │       ├── me/             # GET y PATCH /api/me
    │       ├── rankings/       # GET /api/rankings
    │       ├── sync/cars/      # POST /api/sync/cars (admin)
    │       └── admin/images/   # POST /api/admin/images (admin)
    ├── lib/
    │   ├── auth.ts             # Autenticación (Clerk en prod, mock en dev)
    │   ├── points.ts           # Cálculo de puntos y logros
    │   ├── prisma.ts           # Cliente Prisma singleton
    │   ├── r2.ts               # Upload de imágenes a Cloudflare R2
    │   └── car-apis/
    │       └── api-ninjas.ts   # Sincronización desde API Ninjas
    └── middleware.ts           # Rutas protegidas
```

## Modelos de base de datos

```
User          → Perfil, puntos, premium
Brand         → Marca (Toyota, BMW, etc.)
CarModel      → Modelo (Corolla, M3, etc.)
CarVersion    → Versión específica con specs técnicas
CarImage      → Fotos por versión
Interaction   → Experiencia usuario↔auto (WANT/SAW/RODE/DROVE/OWNED)
Achievement   → Definición de logros
UserAchievement → Logros desbloqueados por usuario
Follow        → Relación seguidor/seguido
DailyInteractionCount → Límite diario para usuarios free
```

## Variables de entorno

Ver `.env.example` para la lista completa.

| Variable | Descripción | Dev |
|---|---|---|
| `DATABASE_URL` | URL de la base de datos | `file:./dev.db` |
| `DEV_MODE` | Activa auth mock y storage placeholder | `true` |
| `ADMIN_SECRET` | Secret para endpoints de administración | `dev-secret` |
| `API_NINJAS_KEY` | API key para sincronizar autos | Opcional |
| `CLERK_SECRET_KEY` | Auth en producción | Solo prod |
| `R2_*` | Credenciales Cloudflare R2 | Solo prod |

## Comandos

```bash
# Desarrollo
npx next dev --port 3001

# Base de datos
npx prisma db push          # Sincronizar schema
npx prisma generate         # Regenerar cliente Prisma
npx tsx prisma/seed.ts      # Cargar datos iniciales
npx prisma studio           # Explorador visual de la BD

# Sincronizar autos desde API externa (dev)
curl -X POST http://localhost:3001/api/sync/cars \
  -H "x-admin-secret: dev-secret" \
  -H "Content-Type: application/json" \
  -d '{"brand": "Toyota"}'
```

## Lógica de puntos

```
puntos = base_interacción × multiplicador_rareza × (1.5 si verificado)

Ejemplos:
  SAW  + RARE     = 5 × 2.0       = 10 pts
  SAW  + RARE     = 5 × 2.0 × 1.5 = 15 pts (verificado con foto)
  DROVE + LEGENDARY = 30 × 5.0    = 150 pts
```

## Modo dev vs producción

En `DEV_MODE=true`:
- Auth: usuario mock `testdriver` sin necesidad de Clerk
- Storage: URLs de `placehold.co` en lugar de Cloudflare R2
- BD: SQLite local (`prisma/dev.db`)

En producción:
- Auth: JWT validado por Clerk
- Storage: imágenes procesadas con sharp y subidas a R2
- BD: PostgreSQL en Neon
