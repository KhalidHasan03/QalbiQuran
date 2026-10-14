import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type TranslationMode = 'english' | 'bangla' | 'both' | 'none'

interface ReaderState {
  translation: TranslationMode
  fontScale: number
  reciter: string
  setTranslation: (translation: TranslationMode) => void
  setFontScale: (fontScale: number) => void
  setReciter: (reciter: string) => void
}

export const useReader = create<ReaderState>()(
  persist(
    (set) => ({
      translation: 'english',
      fontScale: 1,
      reciter: 'ar.alafasy',
      setTranslation: (translation) => set({ translation }),
      setFontScale: (fontScale) => set({ fontScale }),
      setReciter: (reciter) => set({ reciter }),
    }),
    { name: 'qalbiquran-reader' },
  ),
)

export function ayahAudioUrl(reciter: string, numberInQuran: number, bitrate = 128): string {
  return `https://cdn.islamic.network/quran/audio/${bitrate}/${reciter}/${numberInQuran}.mp3`
}
