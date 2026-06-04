import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import type { CarVersion } from '@autodex/shared'
import { INTERACTION_EMOJI, INTERACTION_LABEL } from '@autodex/shared'
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme'
import { RarityBadge } from './ui/RarityBadge'

const CARD_WIDTH = (Dimensions.get('window').width - Spacing.md * 2 - Spacing.sm) / 2

interface Props {
  car: CarVersion
  onPress?: () => void
}

export function CarCard({ car, onPress }: Props) {
  const router = useRouter()
  const brand = car.model?.brand
  const imageUrl = car.primaryImage?.thumbUrl ?? car.images?.[0]?.thumbUrl

  const handlePress = () => {
    if (onPress) { onPress(); return }
    router.push(`/car/${car.id}`)
  }

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={handlePress}
    >
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} contentFit="cover" transition={200} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderText}>🚗</Text>
          </View>
        )}
        <View style={styles.gradient} />
        <View style={styles.badgeRow}>
          <RarityBadge rarity={car.rarity} size="sm" />
        </View>
        {car.userInteraction && (
          <View style={styles.interactionBadge}>
            <Text style={styles.interactionEmoji}>
              {INTERACTION_EMOJI[car.userInteraction]}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        {brand && <Text style={styles.brand}>{brand.name}</Text>}
        <Text style={styles.model} numberOfLines={1}>
          {car.model?.name}
        </Text>
        <Text style={styles.version} numberOfLines={1}>
          {car.year} · {car.name}
        </Text>
        {car.horsepower && (
          <Text style={styles.hp}>{car.horsepower} CV</Text>
        )}
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  imageContainer: { position: 'relative', height: 130 },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: {
    width: '100%', height: '100%',
    backgroundColor: Colors.surfaceHigh,
    alignItems: 'center', justifyContent: 'center',
  },
  placeholderText: { fontSize: 40 },
  gradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' as never },
  badgeRow: { position: 'absolute', top: Spacing.xs, left: Spacing.xs },
  interactionBadge: {
    position: 'absolute', top: Spacing.xs, right: Spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: Radius.full, width: 26, height: 26,
    alignItems: 'center', justifyContent: 'center',
  },
  interactionEmoji: { fontSize: 14 },
  info: { padding: Spacing.sm },
  brand: { color: Colors.textMuted, fontSize: FontSize.xs, fontWeight: FontWeight.medium, textTransform: 'uppercase', letterSpacing: 0.5 },
  model: { color: Colors.text, fontSize: FontSize.md, fontWeight: FontWeight.bold, marginTop: 2 },
  version: { color: Colors.textSecondary, fontSize: FontSize.xs, marginTop: 2 },
  hp: { color: Colors.primary, fontSize: FontSize.xs, fontWeight: FontWeight.semibold, marginTop: 4 },
})
