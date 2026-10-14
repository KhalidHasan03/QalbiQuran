import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/quran', () => ({
  quranApi: {
    surah: vi.fn().mockResolvedValue({
      number: 1,
      name_transliteration: 'Al-Fatihah',
      name_english: 'The Opening',
      name_arabic: 'الفاتحة',
      revelation_type: 'Meccan',
      ayah_count: 2,
      ayahs: [
        {
          id: 1,
          number_in_quran: 1,
          number_in_surah: 1,
          text_arabic: 'بِسْمِ اللَّهِ',
          text_english: 'In the name of Allah',
          text_bangla: 'আল্লাহর নামে',
          sajda: false,
          audio_url: 'https://example.test/1.mp3',
        },
        {
          id: 2,
          number_in_quran: 2,
          number_in_surah: 2,
          text_arabic: 'الْحَمْدُ لِلَّهِ',
          text_english: 'All praise is for Allah',
          text_bangla: 'সমস্ত প্রশংসা আল্লাহর',
          sajda: false,
          audio_url: 'https://example.test/2.mp3',
        },
      ],
    }),
    reciters: vi.fn().mockResolvedValue([
      {
        identifier: 'ar.alafasy',
        name: 'مشاري العفاسي',
        english_name: 'Mishary Alafasy',
        language: 'ar',
        is_default: true,
      },
    ]),
  },
}))

vi.mock('@/lib/portal', () => ({
  portalApi: {
    bookmarks: vi.fn().mockResolvedValue([]),
    notes: vi.fn().mockResolvedValue([]),
    saveContinue: vi.fn().mockResolvedValue(undefined),
    logSession: vi.fn().mockResolvedValue({ new_achievements: [] }),
  },
}))

import { QuranShowPage } from './show'

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/quran/1']}>
        <Routes>
          <Route path="/quran/:number" element={<QuranShowPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('QuranShowPage audio highlighting', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('highlights the playing ayah and scrolls it into view', async () => {
    renderPage()

    await waitFor(() => expect(screen.getByText('In the name of Allah')).toBeInTheDocument())

    const articles = screen.getAllByRole('article')
    expect(articles[0]).not.toHaveAttribute('aria-current')
    expect(articles[1]).not.toHaveAttribute('aria-current')

    fireEvent.click(screen.getAllByRole('button', { name: 'Play ayah' })[1])

    await waitFor(() => expect(articles[1]).toHaveAttribute('aria-current', 'true'))
    expect(articles[0]).not.toHaveAttribute('aria-current')
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled()
  })
})
