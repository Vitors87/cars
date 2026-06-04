# @autodex/mobile

App móvil de AutoDex construida con Expo y React Native.

## Tecnologías

- **Expo SDK 52** — Plataforma React Native
- **Expo Router 4** — Navegación file-based (similar a Next.js)
- **React Native Web** — Vista web para desarrollo en navegador
- **TypeScript** — Tipado estático

## Estructura

```
apps/mobile/
├── app/
│   ├── _layout.tsx           # Root layout (providers)
│   ├── (tabs)/
│   │   ├── _layout.tsx       # Tab bar
│   │   ├── index.tsx         # Pantalla Explorar
│   │   ├── collection.tsx    # Pantalla Colección
│   │   ├── ranking.tsx       # Pantalla Ranking
│   │   └── profile.tsx       # Pantalla Perfil
│   ├── (auth)/
│   │   └── login.tsx         # Pantalla Login/Registro
│   └── car/
│       └── [id].tsx          # Detalle de un auto
├── components/
│   ├── CarCard.tsx           # Tarjeta de auto para el grid
│   ├── InteractionBar.tsx    # Barra con los 5 botones de interacción
│   └── ui/
│       ├── RarityBadge.tsx   # Badge de rareza (Común, Raro, etc.)
│       └── VerifiedBadge.tsx # Badge de avistamiento verificado
├── hooks/
│   ├── useCars.ts            # Carga y paginación del catálogo
│   ├── useInteraction.ts     # Registrar interacción con haptic feedback
│   └── useProfile.ts        # Perfil de usuario y rankings
├── lib/
│   ├── api.ts                # Cliente HTTP hacia el backend
│   └── mockAuth.tsx          # Auth mock para desarrollo local
├── constants/
│   └── theme.ts              # Colores, espaciados, tipografía
└── assets/                   # Íconos y splash screen
```

## Pantallas

### Explorar
Grid de autos con búsqueda en tiempo real y filtros por tipo de carrocería. Cada tarjeta muestra la imagen principal, marca, modelo, año y badge de rareza.

### Detalle de auto
Galería de imágenes, ficha técnica completa y barra de interacciones. Muestra cuántos usuarios vieron, manejaron y tuvieron cada auto.

### Colección
Historial de interacciones del usuario filtrable por tipo (Lo vi, Lo manejé, etc.). Muestra puntos ganados y si el avistamiento fue verificado.

### Ranking
Podio con top 3 y lista completa de usuarios ordenados por puntos. Resalta la posición del usuario autenticado.

### Perfil
Estadísticas del usuario, logros desbloqueados y acceso a Premium. Muestra puntos totales, autos únicos y marcas coleccionadas.

## Variables de entorno

| Variable | Descripción | Dev |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | URL del backend | `http://localhost:3001` |
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | Auth en producción | Placeholder en dev |

## Comandos

```bash
# Ver en el navegador (más rápido para desarrollar)
npx expo start --web --port 8082

# Ver en teléfono (misma red WiFi)
npx expo start --lan

# Build para distribuir
npx eas build --profile preview
```

## Modo dev

En desarrollo, la autenticación usa `MockClerkProvider` (`lib/mockAuth.tsx`) que simula un usuario logueado (`testdriver`) sin necesidad de Clerk. Todos los hooks (`useAuth`, `useSignIn`, `useSignUp`) tienen la misma interfaz que los de `@clerk/clerk-expo`.

Para cambiar a autenticación real (producción), reemplazar `MockClerkProvider` en `app/_layout.tsx` por `ClerkProvider` de `@clerk/clerk-expo`.

## Sistema de diseño

Todos los valores de diseño están centralizados en `constants/theme.ts`:

```ts
Colors.background   // #0F0F0F
Colors.primary      // #E63946 (rojo AutoDex)
Colors.rarity.*     // Colores por rareza
Spacing.*           // xs=4, sm=8, md=16, lg=24...
Radius.*            // sm=6, md=12, lg=18...
FontSize.*          // xs=11, sm=13, md=15, lg=18...
```
