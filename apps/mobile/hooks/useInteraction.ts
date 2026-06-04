import { useState } from 'react'
import { useAuth } from '@/lib/mockAuth'
import * as Haptics from 'expo-haptics'
import { Platform } from 'react-native'
import { interactionsApi } from '@/lib/api'
import type { InteractionType } from '@autodex/shared'

interface UseInteractionOptions {
  onSuccess?: (points: number, newAchievements: string[]) => void
  onError?: (code?: string) => void
}

export function useInteraction(versionId: string, opts: UseInteractionOptions = {}) {
  const { getToken } = useAuth()
  const [loading, setLoading] = useState(false)

  const interact = async (
    type: InteractionType,
    extras?: { photoBase64?: string; latitude?: number; longitude?: number; note?: string }
  ) => {
    if (loading) return
    setLoading(true)
    try {
      const token = await getToken()
      if (!token) throw Object.assign(new Error('No autorizado'), { code: 'UNAUTHORIZED' })

      if (Platform.OS !== 'web') await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      const result = await interactionsApi.create({ versionId, type, ...extras }, token)
      if (Platform.OS !== 'web') await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      opts.onSuccess?.(result.points, result.newAchievements)
      return result
    } catch (e: unknown) {
      if (Platform.OS !== 'web') await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      opts.onError?.((e as { code?: string }).code)
      throw e
    } finally {
      setLoading(false)
    }
  }

  return { interact, loading }
}
