# @autodex/shared

Tipos TypeScript y constantes compartidas entre `@autodex/backend` y `@autodex/mobile`.

## Contenido

### Tipos (`src/types.ts`)

- Enums: `CarType`, `Rarity`, `InteractionType`, `ImageType`
- Entidades: `Brand`, `CarModel`, `CarVersion`, `CarImage`, `Interaction`, `UserProfile`
- Payloads de API: `CreateInteractionPayload`, `PaginatedResponse`, `ApiError`

### Constantes (`src/constants.ts`)

| Constante | Descripción |
|---|---|
| `INTERACTION_POINTS` | Puntos base por tipo de interacción |
| `RARITY_MULTIPLIER` | Multiplicador de puntos por rareza |
| `VERIFIED_MULTIPLIER` | Multiplicador por foto verificada (1.5) |
| `RARITY_LABEL` | Etiquetas en español por rareza |
| `RARITY_COLOR` | Colores hex por rareza |
| `INTERACTION_LABEL` | Labels en español (Lo vi, Lo manejé…) |
| `INTERACTION_EMOJI` | Emojis por interacción |
| `CAR_TYPE_LABEL` | Nombres en español por tipo de carrocería |
| `calcPoints()` | Función que calcula puntos totales |

### `calcPoints(type, rarity, verified)`

```ts
import { calcPoints } from '@autodex/shared'

calcPoints('SAW', 'RARE', false)   // 10 pts
calcPoints('SAW', 'RARE', true)    // 15 pts
calcPoints('DROVE', 'LEGENDARY', false) // 150 pts
```
