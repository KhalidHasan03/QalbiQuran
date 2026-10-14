import type { Ayah } from './quran'

export interface UserStat {
  current_streak: number
  longest_streak: number
  last_read_date: string | null
  reading_days: number
  total_ayahs_read: number
  total_seconds: number
  total_hasanat: number
  current_khatmah: number
  completed_khatmahs: number
  khatmah_progress: {
    ayahs_read: number
    total_ayahs: number
    percent: number
  }
  last_surah_number: number | null
  last_ayah_number: number | null
}

export interface Goal {
  type: 'minutes' | 'ayahs'
  target: number
}

export interface TodayProgress {
  ayahs: number
  seconds: number
  hasanat: number
  goal_met: boolean
  goal_type: 'minutes' | 'ayahs'
  goal_target: number
  goal_value: number
}

export interface DayActivity {
  date: string
  label: string
  ayahs: number
  seconds: number
  goal_met: boolean
}

export interface ContinueReading {
  surah_number: number
  ayah_number: number
}

export interface Achievement {
  code: string
  title: string
  description: string
  icon: string
  type: string
  threshold: number
  unlocked: boolean
  unlocked_at: string | null
}

export interface DashboardData {
  user: import('./auth').User
  stat: UserStat
  today: TodayProgress
  weekly: DayActivity[]
  goal: Goal
  continue_reading: ContinueReading
  recent_achievements: Achievement[]
}

export interface Bookmark {
  id: number
  note: string | null
  created_at: string
  ayah: Pick<Ayah, 'id' | 'number_in_quran' | 'number_in_surah' | 'text_arabic' | 'text_english' | 'text_bangla' | 'audio_url'>
  surah: {
    number: number
    name_transliteration: string
    name_english: string
    name_arabic: string
  } | null
}

export interface Note {
  id: number
  body: string
  created_at: string
  updated_at: string
  ayah: Pick<Ayah, 'id' | 'number_in_quran' | 'number_in_surah' | 'text_arabic' | 'text_english' | 'text_bangla'>
  surah: {
    number: number
    name_transliteration: string
    name_english: string
  } | null
}

export interface FriendSummary {
  id: number
  name: string
  username: string | null
  avatar_url: string | null
  current_streak: number
  total_ayahs_read: number
  total_hasanat: number
  weekly_ayahs: number | null
}

export interface FriendsData {
  friends: FriendSummary[]
  incoming_requests: { id: number; user: FriendSummary }[]
  outgoing_requests: { id: number; user: FriendSummary }[]
}

export interface LeaderboardEntry {
  rank: number
  score: number
  is_me: boolean
  user: FriendSummary
}

export interface LeaderboardData {
  scope: 'global' | 'friends'
  period: 'week' | 'all'
  leaders: LeaderboardEntry[]
  me: { rank: number | null; score: number }
}
