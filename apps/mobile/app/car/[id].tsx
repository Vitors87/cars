import { useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  Pressable, Dimensions, Alert, ActivityIndicator,
} from 'react-native'
import { Image } from 'expo-image'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useCarDetail } from '@/hooks/useCars'
import { InteractionBar } from '@/components/InteractionBar'
import { RarityBadge } from '@/components/ui/RarityBadge'
import { VerifiedBadge } from '@/components/ui/VerifiedBadge'
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme'
import type { InteractionType } from '@autodex/shared'
import { INTERACTION_LABEL, INTERACTION_EMOJI, CAR_TYPE_LABEL } from '@autodex/shared'

const { width } = Dimensions.get('window')

const SPEC_ROWS = [
  { label: 'Motor', key: 'engine' },
  { label: 'Potencia', key: 'horsepower', suffix: ' CV' },
  { label: 'Torque', key: 'torqueNm', suffix: ' Nm' },
  { label: 'Transmisión', key: 'transmission' },
  { label: 'Tracción', key: 'drivetrain' },
  { label: 'Combustible', key: 'fuelType' },
  { label: 'Consumo ciudad', key: 'fuelCity', suffix: ' km/l' },
  { label: 'Consumo ruta', key: 'fuelHwy', suffix: ' km/l' },
  { label: 'Puertas', key: 'doors' },
  { label: 'Asientos', key: 'seats' },
  { label: 'Peso', key: 'weightKg', suffix: ' kg' },
] as const

export default function CarDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { car, loading, error, setCar } = useCarDetail(id)
  const [activeImage, setActiveImage] = useState(0)

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    )
  }

  if (error || !car) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error ?? 'Auto no encontrado'}</Text>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Volver</Text>
        </Pressable>
      </View>
    )
  }

  const brand = car.model?.brand
  const images = car.images ?? []
  const activeInteractions: InteractionType[] = (car as unknown as { userInteractions?: { type: InteractionType }[] }).userInteractions?.map((i) => i.type) ?? []
  const counts = (car as unknown as { interactionCounts?: Record<InteractionType, number> }).interactionCounts ?? {}

  const handleInteractionSuccess = (type: InteractionType, points: number, achievements: string[]) => {
    setCar((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        userInteractions: [...(prev as unknown as { userInteractions: { type: InteractionType }[] }).userInteractions ?? [], { type }],
      } as typeof prev
    })
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Image Gallery */}
      <View style={styles.galleryContainer}>
        {images.length > 0 ? (
          <>
            <Image
              source={{ uri: images[activeImage]?.url }}
              style={styles.mainImage}
              contentFit="cover"
              transition={150}
            />
            {images.length > 1 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbScroll} contentContainerStyle={styles.thumbContent}>
                {images.map((img, i) => (
                  <Pressable key={img.id} onPress={() => setActiveImage(i)}>
                    <Image
                      source={{ uri: img.thumbUrl }}
                      style={[styles.thumb, i === activeImage && styles.thumbActive]}
                      contentFit="cover"
                    />
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </>
        ) : (
          <View style={[styles.mainImage, styles.imagePlaceholder]}>
            <Text style={{ fontSize: 64 }}>🚗</Text>
          </View>
        )}
      </View>

      {/* Header info */}
      <View style={styles.headerInfo}>
        <View style={styles.headerTop}>
          {brand && <Text style={styles.brandName}>{brand.name}</Text>}
          <RarityBadge rarity={car.rarity} />
        </View>
        <Text style={styles.modelName}>{car.model?.name}</Text>
        <Text style={styles.versionName}>{car.year} · {car.name}</Text>
        {car.model?.type && (
          <Text style={styles.carType}>{CAR_TYPE_LABEL[car.model.type]}</Text>
        )}
      </View>

      {/* Interaction counts */}
      <View style={styles.countsRow}>
        {(['SAW', 'DROVE', 'OWNED'] as InteractionType[]).map((type) => (
          <View key={type} style={styles.countItem}>
            <Text style={styles.countEmoji}>{INTERACTION_EMOJI[type]}</Text>
            <Text style={styles.countNumber}>{counts[type] ?? 0}</Text>
            <Text style={styles.countLabel}>{INTERACTION_LABEL[type]}</Text>
          </View>
        ))}
      </View>

      {/* Interaction Bar */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tu experiencia</Text>
        <InteractionBar
          versionId={car.id}
          rarity={car.rarity}
          activeInteractions={activeInteractions}
          onSuccess={handleInteractionSuccess}
        />
      </View>

      {/* Specs */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ficha técnica</Text>
        <View style={styles.specsCard}>
          {SPEC_ROWS.map(({ label, key, suffix }, i) => {
            const value = (car as unknown as Record<string, unknown>)[key]
            if (!value) return null
            return (
              <View key={key} style={[styles.specRow, i > 0 && styles.specRowBorder]}>
                <Text style={styles.specLabel}>{label}</Text>
                <Text style={styles.specValue}>{String(value)}{suffix ?? ''}</Text>
              </View>
            )
          })}
        </View>
      </View>

      <View style={{ height: Spacing.xxl }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  errorText: { color: Colors.error, fontSize: FontSize.md, marginBottom: Spacing.md },
  backBtn: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, backgroundColor: Colors.surface, borderRadius: Radius.md },
  backBtnText: { color: Colors.text, fontWeight: FontWeight.medium },
  galleryContainer: { width, backgroundColor: Colors.surface },
  mainImage: { width, height: 280 },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  thumbScroll: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  thumbContent: { paddingHorizontal: Spacing.sm, paddingBottom: Spacing.sm, gap: Spacing.xs },
  thumb: { width: 60, height: 44, borderRadius: Radius.sm, opacity: 0.6 },
  thumbActive: { opacity: 1, borderWidth: 2, borderColor: Colors.primary },
  headerInfo: { padding: Spacing.md },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xs },
  brandName: { color: Colors.textMuted, fontSize: FontSize.sm, fontWeight: FontWeight.medium, textTransform: 'uppercase', letterSpacing: 1 },
  modelName: { color: Colors.text, fontSize: FontSize.xxl, fontWeight: FontWeight.black },
  versionName: { color: Colors.textSecondary, fontSize: FontSize.md, marginTop: 2 },
  carType: { color: Colors.textMuted, fontSize: FontSize.sm, marginTop: 4 },
  countsRow: {
    flexDirection: 'row', justifyContent: 'space-around',
    marginHorizontal: Spacing.md, marginBottom: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    paddingVertical: Spacing.md, borderWidth: 1, borderColor: Colors.border,
  },
  countItem: { alignItems: 'center', gap: 2 },
  countEmoji: { fontSize: 20 },
  countNumber: { color: Colors.text, fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  countLabel: { color: Colors.textMuted, fontSize: FontSize.xs },
  section: { marginBottom: Spacing.md },
  sectionTitle: { color: Colors.text, fontSize: FontSize.lg, fontWeight: FontWeight.bold, paddingHorizontal: Spacing.md, marginBottom: Spacing.sm },
  specsCard: { marginHorizontal: Spacing.md, backgroundColor: Colors.surface, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  specRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 2 },
  specRowBorder: { borderTopWidth: 1, borderTopColor: Colors.border },
  specLabel: { color: Colors.textSecondary, fontSize: FontSize.md },
  specValue: { color: Colors.text, fontSize: FontSize.md, fontWeight: FontWeight.semibold },
})
