export interface Surah {
  number: number
  name_arabic: string
  name_transliteration: string
  name_english: string
  name_bangla: string
  revelation_type: string
  ayah_count: number
  bismillah_pre: boolean
}

export interface SurahRef {
  number: number
  name_transliteration: string
  name_english: string
  name_arabic: string
}

export interface Ayah {
  id: number
  number_in_surah: number
  number_in_quran: number
  text_arabic: string
  text_english: string
  text_bangla: string
  juz: number
  page: number
  sajda: boolean
  audio_url: string
  surah?: SurahRef
}

export interface SurahDetail extends Surah {
  ayahs: Ayah[]
}

export interface Reciter {
  identifier: string
  name: string
  english_name: string
  language: string
  is_default: boolean
}

export interface Paginated<T> {
  data: T[]
  links: {
    first: string | null
    last: string | null
    prev: string | null
    next: string | null
  }
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
    links: { url: string | null; label: string; active: boolean }[]
  }
}
