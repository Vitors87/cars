import { View, Text, StyleSheet } from 'react-native'
import type { Rarity } from '@autodex/shared'
import { RARITY_LABEL } from '@autodex/shared'
import { Colors, FontSize, Radius, Spacing } from '@/constants/theme'

interface Props {
  rarity: Rarity
  size?: 'sm' | 'md'
}

export function RarityBadge({ rarity, size = 'md' }: Props) {
  const color = Colors.rarity[rarity]
  const isSmall = size === 'sm'

  return (
    <View style={[styles.badge, { borderColor: color, backgroundColor: color + '20' }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.label, { color, fontSize: isSmall ? FontSize.xs : FontSize.sm }]}>
        {RARITY_LABEL[rarity]}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: Radius.full,
  },
  label: {
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
})
