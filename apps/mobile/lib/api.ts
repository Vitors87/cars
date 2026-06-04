import type {
  CarVersion, PaginatedResponse, UserProfile,
  Interaction, RankingEntry, CreateInteractionPayload,
} from '@autodex/shared'

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001'

async function apiFetch<T>(
  path: string,
  options?: RequestInit & { token?: string }
): Promise<T> {
  const { token, ...rest } = options ?? {}
  const res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...rest.headers,
    },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw Object.assign(new Error(err.error ?? 'API Error'), { code: err.code, status: res.status })
  }

  return res.json()
}

// ─── Cars ────────────────────────────────────────────────────────────────────

export interface CarsQuery {
  q?: string
  brand?: string
  type?: string
  rarity?: string
  year?: number
  latam?: boolean
  page?: number
  pageSize?: number
}

export const carsApi = {
  list: (params: CarsQuery = {}, token?: string) => {
    const qs = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => v != null && qs.set(k, String(v)))
    return apiFetch<PaginatedResponse<CarVersion>>(`/api/cars?${qs}`, { token })
  },

  get: (id: string, token?: string) =>
    apiFetch<CarVersion & { interactionCounts: Record<string, number>; userInteractions: Interaction[] }>(
      `/api/cars/${id}`,
      { token }
    ),
}

// ─── Interactions ─────────────────────────────────────────────────────────────

export const interactionsApi = {
  create: (payload: CreateInteractionPayload, token: string) =>
    apiFetch<{ interaction: Interaction; points: number; newAchievements: string[] }>(
      '/api/interactions',
      { method: 'POST', body: JSON.stringify(payload), token }
    ),

  list: (params: { type?: string; page?: number } = {}, token: string) => {
    const qs = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => v != null && qs.set(k, String(v)))
    return apiFetch<PaginatedResponse<Interaction>>(`/api/interactions?${qs}`, { token })
  },
}

// ─── User ─────────────────────────────────────────────────────────────────────

export const userApi = {
  me: (token: string) => apiFetch<UserProfile>('/api/me', { token }),
  update: (data: { displayName?: string; bio?: string; country?: string }, token: string) =>
    apiFetch<UserProfile>('/api/me', { method: 'PATCH', body: JSON.stringify(data), token }),
}

// ─── Rankings ─────────────────────────────────────────────────────────────────

export const rankingsApi = {
  get: (params: { scope?: string; country?: string; limit?: number } = {}, token?: string) => {
    const qs = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => v != null && qs.set(k, String(v)))
    return apiFetch<{ ranking: RankingEntry[]; myRank: number | null }>(`/api/rankings?${qs}`, { token })
  },
}
