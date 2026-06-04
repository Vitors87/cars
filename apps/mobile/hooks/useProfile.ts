import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/mockAuth'
import { userApi, rankingsApi } from '@/lib/api'
import type { UserProfile, RankingEntry } from '@autodex/shared'

export function useProfile() {
  const { getToken } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    try {
      setLoading(true)
      const token = await getToken()
      if (!token) return
      const data = await userApi.me(token)
      setProfile(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return { profile, loading, error, refresh: load, setProfile }
}

export function useRanking(scope: 'global' | 'country' = 'global', country?: string) {
  const { getToken } = useAuth()
  const [ranking, setRanking] = useState<RankingEntry[]>([])
  const [myRank, setMyRank] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const token = await getToken()
        const data = await rankingsApi.get({ scope, country }, token ?? undefined)
        setRanking(data.ranking)
        setMyRank(data.myRank)
      } finally {
        setLoading(false)
      }
    })()
  }, [scope, country])

  return { ranking, myRank, loading }
}
