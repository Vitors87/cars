import { View, Text, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native'
import { useAuth } from '@/lib/mockAuth'
import { useRouter } from 'expo-router'
import type { InteractionType } from '@autodex/shared'
import { INTERACTION_EMOJI, INTERACTION_LABEL, INTERACTION_POINTS, RARITY_MULTIPLIER } from '@autodex/shared'
import type { Rarity } from '@autodex/shared'
import { useInteraction } from '@/hooks/useInteraction'
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme'

const TYPES: InteractionType[] = ['WANT', 'SAW', 'RODE', 'DROVE', 'OWNED']

interface Props {
  versionId: string
  rarity: Rarity
  activeInteractions: InteractionType[]
  onSuccess?: (type: InteractionType, points: number, achievements: string[]) => void
}

export function InteractionBar({ versionId, rarity, activeInteractions, onSuccess }: Props) {
  const { isSignedIn } = useAuth()
  const router = useRouter()
  const { interact, loading } = useInteraction(versionId, {
    onSuccess: (points, achievements) => {
      if (achievements.length > 0) {
        Alert.alert('🏆 ¡Logro desbloqueado!', achievements.map((k) => `• ${k}`).join('\n'))
      }
    },
    onError: (code) => {
      if (code === 'DAILY_LIMIT') {
        Alert.alert('Límite alcanzado', 'Actualiza a Premium para interacciones ilimitadas.')
      } else if (code === 'DUPLICATE') {
        Alert.alert('Ya registrado', 'Ya tienes esta interacción con este auto.')
      }
    },
  })

  const handlePress = async (type: InteractionType) => {
    if (!isSignedIn) {
      Alert.alert('Inicia sesión', 'Necesitas una cuenta para registrar interacciones.', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Iniciar sesión', onPress: () => router.push('/(auth)/login') },
      ])
      return
    }

    if (activeInteractions.includes(type)) return

    const pts = Math.round(INTERACTION_POINTS[type] * RARITY_MULTIPLIER[rarity])
    Alert.alert(
      `${INTERACTION_EMOJI[type]} ${INTERACTION_LABEL[type]}`,
      `Ganarás ${pts} puntos${pts !== INTERACTION_POINTS[type] ? ` (×${RARITY_MULTIPLIER[rarity]} por rareza)` : ''}.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar', onPress: async () => {
            const result = await interact(type)
            if (result) onSuccess?.(type, result.points, result.newAchievements)
          }
        },
      ]
    )
  }

  return (
    <View style={styles.container}>
      {TYPES.map((type) => {
        const isActive = activeInteractions.includes(type)
        return (
          <Pressable
            key={type}
            style={[styles.btn, isActive && styles.btnActive]}
            onPress={() => handlePress(type)}
            disabled={loading || isActive}
          >
            <Text style={styles.emoji}>{INTERACTION_EMOJI[type]}</Text>
            <Text style={[styles.label, isActive && styles.labelActive]} numberOfLines={1}>
              {INTERACTION_LABEL[type]}
            </Text>
            {isActive && <View style={styles.activeDot} />}
          </Pressable>
        )
      })}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    position: 'relative',
  },
  btn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceHigh,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 3,
  },
  btnActive: {
    backgroundColor: Colors.primary + '20',
    borderColor: Colors.primary,
  },
  emoji: { fontSize: 18 },
  label: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    textAlign: 'center',
  },
  labelActive: { color: Colors.primary },
  activeDot: {
    width: 5, height: 5, borderRadius: Radius.full,
    backgroundColor: Colors.primary,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center', justifyContent: 'center',
    borderRadius: Radius.md,
  },
})
