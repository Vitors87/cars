import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/mockAuth'
import { carsApi, type CarsQuery } from '@/lib/api'
import type { CarVersion } from '@autodex/shared'

export function useCars(query: CarsQuery = {}) {
  const { getToken } = useAuth()
  const [cars, setCars] = useState<CarVersion[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const load = useCallback(async (reset = false) => {
    try {
      const currentPage = reset ? 1 : page
      if (reset) { setLoading(true); setPage(1) }
      else setLoadingMore(true)

      const token = await getToken()
      const res = await carsApi.list({ ...query, page: currentPage }, token ?? undefined)

      setCars((prev) => reset ? res.data : [...prev, ...res.data])
      setHasMore(res.hasMore)
      if (!reset) setPage((p) => p + 1)
      setError(null)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al cargar autos')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [JSON.stringify(query), getToken])

  useEffect(() => {
    load(true)
  }, [JSON.stringify(query)])

  return {
    cars,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore: () => { if (hasMore && !loadingMore) load() },
    refresh: () => load(true),
  }
}

export function useCarDetail(id: string) {
  const { getToken } = useAuth()
  const [car, setCar] = useState<CarVersion | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        const token = await getToken()
        const data = await carsApi.get(id, token ?? undefined)
        if (!cancelled) setCar(data)
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [id])

  return { car, loading, error, setCar }
}
