# AutoDex 🚗

**La Pokédex social de autos.** Explorá, coleccioná y competí registrando tus experiencias con vehículos reales.

Cada auto que ves, tocás o manejás suma puntos a tu perfil. Verificá tus avistamientos con fotos tomadas desde la app y subí en el ranking global.

---

## Estructura del proyecto

Monorepo con [Turborepo](https://turbo.build/):

```
autodex/
├── apps/
│   ├── backend/        # API REST — Next.js 14 + Prisma
│   └── mobile/         # App móvil — Expo (React Native)
├── packages/
│   └── shared/         # Tipos TypeScript y constantes compartidas
├── turbo.json
└── package.json
```

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Mobile | React Native + Expo SDK 52 + Expo Router |
| Backend | Next.js 14 (App Router) |
| Base de datos | PostgreSQL (Neon) / SQLite (dev local) |
| ORM | Prisma |
| Auth | Clerk |
| Storage | Cloudflare R2 |
| Pagos | RevenueCat |
| Monorepo | Turborepo |

---

## Inicio rápido (desarrollo local)

### Requisitos

- Node.js 20+
- npm 10+

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

```bash
# Backend
cp apps/backend/.env.example apps/backend/.env

# Mobile
cp apps/mobile/.env.example apps/mobile/.env
```

Editar `apps/backend/.env`:
```env
DATABASE_URL="file:./dev.db"
DEV_MODE=true
ADMIN_SECRET=dev-secret
```

Editar `apps/mobile/.env`:
```env
EXPO_PUBLIC_API_URL=http://localhost:3001
```

### 3. Preparar la base de datos

```bash
cd apps/backend
npx prisma db push        # Crea las tablas
npx tsx prisma/seed.ts    # Carga datos iniciales
```

### 4. Levantar los servicios

**Terminal 1 — Backend:**
```bash
cd apps/backend
npx next dev --port 3001
```

**Terminal 2 — App web (para ver en el navegador):**
```bash
cd apps/mobile
npx expo start --web --port 8082
```

Abrir **http://localhost:8082** en el navegador.

**Terminal 2 alternativa — App en teléfono:**
```bash
cd apps/mobile
npx expo start --lan
```
Escanear el QR con [Expo Go](https://expo.dev/go) (Android/iOS).

---

## Funcionalidades

### Catálogo de autos
Exploración por marca, modelo, año, tipo de carrocería y rareza. Búsqueda en tiempo real.

### Sistema de interacciones

Cinco niveles de experiencia con cada auto:

| Interacción | Puntos base |
|---|---|
| ❤️ Lo quiero | 1 pto |
| 👁️ Lo vi | 5 pts |
| 🚗 Me subí | 15 pts |
| 🏎️ Lo manejé | 30 pts |
| 🔑 Lo tuve | 50 pts |

### Sistema de rareza

Los puntos se multiplican según la rareza del auto:

| Rareza | Multiplicador | Ejemplos |
|---|---|---|
| Común | ×1.0 | Toyota Corolla, Chevrolet Onix |
| Inusual | ×1.5 | VW Golf, Honda Civic |
| Raro | ×2.0 | BMW M3, Subaru WRX |
| Épico | ×3.0 | Lamborghini Huracán, Porsche 911 |
| Legendario | ×5.0 | Bugatti Chiron, Ferrari LaFerrari |

**Avistamientos verificados** (foto tomada desde la app): ×1.5 adicional.

### Logros
10 logros iniciales que se desbloquean automáticamente al cumplir condiciones (primer Ferrari visto, 100 puntos alcanzados, etc.).

### Rankings
- Global: top usuarios por puntos
- Por país (Premium)

### Modelo Freemium

| Feature | Free | Premium |
|---|---|---|
| Catálogo completo | ✅ | ✅ |
| Ficha técnica | ✅ | ✅ |
| Interacciones | 20/día | Ilimitadas |
| Galería de fotos | 4 por auto | Completa |
| Rankings | Global | Global + País + Amigos |
| Publicidad | Sí | No |

---

## API

Base URL: `http://localhost:3001`

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/cars` | Listado de autos con filtros y paginación |
| `GET` | `/api/cars/:id` | Detalle completo de una versión |
| `POST` | `/api/interactions` | Registrar interacción con un auto |
| `GET` | `/api/interactions` | Historial de interacciones del usuario |
| `GET` | `/api/me` | Perfil del usuario autenticado |
| `PATCH` | `/api/me` | Actualizar perfil |
| `GET` | `/api/rankings` | Ranking de usuarios |
| `POST` | `/api/sync/cars` | Sincronizar autos desde API externa (admin) |
| `POST` | `/api/admin/images` | Subir imagen a un auto (admin) |

### Parámetros de `/api/cars`

| Parámetro | Tipo | Descripción |
|---|---|---|
| `q` | string | Búsqueda por marca/modelo/nombre |
| `brand` | string | Slug de la marca (ej: `toyota`) |
| `type` | string | Tipo: `SEDAN`, `SUV`, `SUPERCAR`, etc. |
| `rarity` | string | `COMMON`, `RARE`, `LEGENDARY`, etc. |
| `year` | number | Año del modelo |
| `latam` | boolean | Solo modelos disponibles en Latam |
| `page` | number | Página (default: 1) |
| `pageSize` | number | Resultados por página (max: 50) |

---

## Integración con APIs de autos

El proyecto incluye un cliente para [API Ninjas Cars](https://api-ninjas.com/api/cars).

Para sincronizar modelos reales:

1. Obtener API key gratis en [api-ninjas.com](https://api-ninjas.com)
2. Agregar al `.env`: `API_NINJAS_KEY=tu_key`
3. Ejecutar sync:

```bash
curl -X POST http://localhost:3001/api/sync/cars \
  -H "x-admin-secret: dev-secret" \
  -H "Content-Type: application/json" \
  -d '{"brand": "Toyota"}'
```

---

## Deployment (producción)

| Servicio | Proveedor | Costo estimado |
|---|---|---|
| Backend + API | Vercel | Free → $20/mes |
| Base de datos | Neon PostgreSQL | Free → $19/mes |
| Storage imágenes | Cloudflare R2 | ~$0.015/GB |
| Auth | Clerk | Free hasta 10k usuarios |
| Push notifications | OneSignal | Free |

**Break-even:** 20 usuarios premium cubren todos los costos operativos.

---

## Roadmap

- **Semanas 1-4:** MVP — catálogo, interacciones, colección, ranking
- **Semanas 5-6:** Verificación con cámara, logros, streaks
- **Semana 7:** Modelo premium + pagos (RevenueCat)
- **Semana 8:** Lanzamiento público + App Store / Play Store
- **V2:** Feed social, follows, listas públicas
- **V3:** Reconocimiento de autos por foto (IA)

---

## Licencia

MIT
