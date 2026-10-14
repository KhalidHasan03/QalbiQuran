import { api } from './api'
import type { Ayah, Paginated, Reciter, Surah, SurahDetail } from '@/types/quran'

export const quranApi = {
  async surahs(): Promise<Surah[]> {
    const { data } = await api.get<{ data: Surah[] }>('/surahs')
    return data.data
  },

  async surah(number: number): Promise<SurahDetail> {
    const { data } = await api.get<{ data: { surah: Surah; ayahs: SurahDetail['ayahs'] } }>(
      `/surahs/${number}`,
    )
    return { ...data.data.surah, ayahs: data.data.ayahs }
  },

  async search(term: string, page = 1, perPage = 20): Promise<Paginated<Ayah>> {
    const { data } = await api.get<Paginated<Ayah>>('/ayahs/search', {
      params: { q: term, page, per_page: perPage },
    })
    return data
  },

  async reciters(): Promise<Reciter[]> {
    const { data } = await api.get<{ data: Reciter[] }>('/reciters')
    return data.data
  },
}
