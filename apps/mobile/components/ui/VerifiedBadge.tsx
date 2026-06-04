import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, FontSize, Radius, Spacing } from '@/constants/theme'

interface Props {
  verified: boolean
  showLabel?: boolean
}

export function VerifiedBadge({ verified, showLabel = true }: Props) {
  if (!verified) return null
  return (
    <View style={styles.badge}>
      <Ionicons name="checkmark-circle" size={12} color={Colors.success} />
      {showLabel && <Text style={styles.label}>Verificado</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    backgroundColor: Colors.success + '20',
    borderWidth: 1,
    borderColor: Colors.success + '60',
  },
  label: {
    color: Colors.success,
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
})
