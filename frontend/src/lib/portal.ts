import { api } from './api'
import type { UserStat } from '@/types/portal'
import type {
  Achievement,
  Bookmark,
  DashboardData,
  DayActivity,
  FriendsData,
  Goal,
  LeaderboardData,
  Note,
  TodayProgress,
} from '@/types/portal'

export interface SessionPayload {
  surah_number?: number
  from_ayah?: number
  to_ayah?: number
  ayahs_count: number
  duration_seconds?: number
  read_on?: string
}

export interface SessionResult {
  session: {
    id: number
    surah_number: number | null
    ayahs_count: number
    duration_seconds: number
    hasanat: number
    read_on: string
  }
  stat: UserStat
  today: TodayProgress
  new_achievements: Achievement[]
}

export const portalApi = {
  async dashboard(): Promise<DashboardData> {
    const { data } = await api.get<{ data: DashboardData }>('/me/dashboard')
    return data.data
  },

  async goal(): Promise<Goal> {
    const { data } = await api.get<{ data: Goal }>('/me/goal')
    return data.data
  },

  async updateGoal(payload: Goal): Promise<Goal> {
    const { data } = await api.put<{ data: Goal }>('/me/goal', payload)
    return data.data
  },

  async logSession(payload: SessionPayload): Promise<SessionResult> {
    const { data } = await api.post<{ data: SessionResult }>('/me/sessions', payload)
    return data.data
  },

  async progress(): Promise<{
    stat: UserStat
    weekly: DayActivity[]
    monthly: { ayahs: number; seconds: number; days: number }
    continue_reading: { surah_number: number | null; ayah_number: number | null }
  }> {
    const { data } = await api.get('/me/progress')
    return data.data
  },

  async saveContinue(payload: { surah_number: number; ayah_number: number }): Promise<void> {
    await api.put('/me/progress/continue', payload)
  },

  async bookmarks(): Promise<Bookmark[]> {
    const { data } = await api.get<{ data: Bookmark[] }>('/me/bookmarks')
    return data.data
  },

  async createBookmark(payload: { ayah_id: number; note?: string | null }): Promise<Bookmark> {
    const { data } = await api.post<{ data: Bookmark }>('/me/bookmarks', payload)
    return data.data
  },

  async updateBookmark(id: number, payload: { note: string | null }): Promise<Bookmark> {
    const { data } = await api.put<{ data: Bookmark }>(`/me/bookmarks/${id}`, payload)
    return data.data
  },

  async deleteBookmark(id: number): Promise<void> {
    await api.delete(`/me/bookmarks/${id}`)
  },

  async notes(): Promise<Note[]> {
    const { data } = await api.get<{ data: Note[] }>('/me/notes')
    return data.data
  },

  async createNote(payload: { ayah_id: number; body: string }): Promise<Note> {
    const { data } = await api.post<{ data: Note }>('/me/notes', payload)
    return data.data
  },

  async updateNote(id: number, payload: { body: string }): Promise<Note> {
    const { data } = await api.put<{ data: Note }>(`/me/notes/${id}`, payload)
    return data.data
  },

  async deleteNote(id: number): Promise<void> {
    await api.delete(`/me/notes/${id}`)
  },

  async achievements(): Promise<{ items: Achievement[]; meta: { total: number; unlocked: number } }> {
    const { data } = await api.get<{ data: Achievement[]; meta: { total: number; unlocked: number } }>(
      '/me/achievements',
    )
    return { items: data.data, meta: data.meta }
  },

  async friends(): Promise<FriendsData> {
    const { data } = await api.get<{ data: FriendsData }>('/me/friends')
    return data.data
  },

  async addFriend(username: string): Promise<{ message: string }> {
    const { data } = await api.post<{ message: string }>('/me/friends', { username })
    return data
  },

  async acceptFriend(id: number): Promise<void> {
    await api.put(`/me/friends/${id}/accept`)
  },

  async removeFriend(id: number): Promise<void> {
    await api.delete(`/me/friends/${id}`)
  },

  async leaderboard(scope: 'global' | 'friends', period: 'week' | 'all'): Promise<LeaderboardData> {
    const { data } = await api.get<{ data: LeaderboardData }>('/me/leaderboard', {
      params: { scope, period },
    })
    return data.data
  },
}
