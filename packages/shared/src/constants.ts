import type { InteractionType, Rarity } from './types'

export const INTERACTION_POINTS: Record<InteractionType, number> = {
  WANT:  1,
  SAW:   5,
  RODE:  15,
  DROVE: 30,
  OWNED: 50,
}

export const RARITY_MULTIPLIER: Record<Rarity, number> = {
  COMMON:    1.0,
  UNCOMMON:  1.5,
  RARE:      2.0,
  EPIC:      3.0,
  LEGENDARY: 5.0,
}

export const VERIFIED_MULTIPLIER = 1.5

export const RARITY_LABEL: Record<Rarity, string> = {
  COMMON:    'Común',
  UNCOMMON:  'Inusual',
  RARE:      'Raro',
  EPIC:      'Épico',
  LEGENDARY: 'Legendario',
}

export const RARITY_COLOR: Record<Rarity, string> = {
  COMMON:    '#9CA3AF',
  UNCOMMON:  '#34D399',
  RARE:      '#60A5FA',
  EPIC:      '#A78BFA',
  LEGENDARY: '#FBBF24',
}

export const INTERACTION_LABEL: Record<InteractionType, string> = {
  WANT:  'Lo quiero',
  SAW:   'Lo vi',
  RODE:  'Me subí',
  DROVE: 'Lo manejé',
  OWNED: 'Lo tuve',
}

export const INTERACTION_EMOJI: Record<InteractionType, string> = {
  WANT:  '❤️',
  SAW:   '👁️',
  RODE:  '🚗',
  DROVE: '🏎️',
  OWNED: '🔑',
}

export const FREE_TIER_DAILY_LIMIT = 20
export const FREE_TIER_MAX_COLLECTION = 500
export const FREE_TIER_MAX_IMAGES = 4

export const CAR_TYPE_LABEL: Record<string, string> = {
  SEDAN:      'Sedán',
  HATCHBACK:  'Hatchback',
  COUPE:      'Coupé',
  CONVERTIBLE:'Convertible',
  SUV:        'SUV',
  PICKUP:     'Pickup',
  TRUCK:      'Camión',
  VAN:        'Van',
  MINIVAN:    'Minivan',
  SUPERCAR:   'Superauto',
  HYPERCAR:   'Hyperauto',
  CLASSIC:    'Clásico',
  ELECTRIC:   'Eléctrico',
  OTHER:      'Otro',
}

export function calcPoints(
  baseType: InteractionType,
  rarity: Rarity,
  verified: boolean
): number {
  const base = INTERACTION_POINTS[baseType]
  const rarityMult = RARITY_MULTIPLIER[rarity]
  const verifiedMult = verified ? VERIFIED_MULTIPLIER : 1.0
  return Math.round(base * rarityMult * verifiedMult)
}
