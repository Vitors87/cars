export const Colors = {
  background:   '#0F0F0F',
  surface:      '#1A1A1A',
  surfaceHigh:  '#252525',
  border:       '#2A2A2A',
  text:         '#FFFFFF',
  textSecondary:'#9CA3AF',
  textMuted:    '#6B7280',
  primary:      '#E63946',
  primaryDark:  '#C1121F',
  success:      '#34D399',
  warning:      '#FBBF24',
  error:        '#F87171',

  rarity: {
    COMMON:    '#9CA3AF',
    UNCOMMON:  '#34D399',
    RARE:      '#60A5FA',
    EPIC:      '#A78BFA',
    LEGENDARY: '#FBBF24',
  },
}

export const Spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
}

export const Radius = {
  sm: 6,
  md: 12,
  lg: 18,
  xl: 24,
  full: 9999,
}

export const FontSize = {
  xs:   11,
  sm:   13,
  md:   15,
  lg:   18,
  xl:   22,
  xxl:  28,
  hero: 36,
}

export const FontWeight = {
  regular: '400' as const,
  medium:  '500' as const,
  semibold:'600' as const,
  bold:    '700' as const,
  black:   '900' as const,
}
