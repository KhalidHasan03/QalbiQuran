import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Bookmark as BookmarkIcon,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  Copy,
  Loader2,
  Minus,
  Pause,
  Play,
  Plus,
  Search,
  Share2,
  StickyNote,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Modal, ModalFooter } from '@/components/ui/modal'
import { Textarea } from '@/components/ui/textarea'
import { apiErrorMessage } from '@/lib/api'
import { portalApi } from '@/lib/portal'
import { quranApi } from '@/lib/quran'
import { useSeo } from '@/lib/seo'
import { cn } from '@/lib/utils'
import { useAuth } from '@/store/auth'
import { ayahAudioUrl, useReader, type TranslationMode } from '@/store/reader'
import { toast } from '@/store/toasts'
import type { Ayah, Reciter, SurahDetail } from '@/types/quran'

const translationModes: { value: TranslationMode; label: string }[] = [
  { value: 'english', label: 'EN' },
  { value: 'bangla', label: 'বাং' },
  { value: 'both', label: 'Both' },
  { value: 'none', label: 'Off' },
]

export function QuranShowPage() {
  const { number } = useParams<{ number: string }>()
  const surahNumber = Number(number)
  const navigate = useNavigate()
  const location = useLocation()
  const qc = useQueryClient()
  const user = useAuth((s) => s.user)

  const valid = Number.isInteger(surahNumber) && surahNumber >= 1 && surahNumber <= 114

  const { data: surah, isPending, isError } = useQuery({
    queryKey: ['surah', surahNumber],
    queryFn: () => quranApi.surah(surahNumber),
    enabled: valid,
    staleTime: Infinity,
  })

  useSeo(
    surah ? `Surah ${surah.number}: ${surah.name_transliteration}` : undefined,
    surah
      ? `Read Surah ${surah.name_transliteration} (${surah.name_english}) — ${surah.ayah_count} ayahs in Arabic with English & Bangla translations and verse-by-verse audio.`
      : undefined,
  )

  const { data: reciters } = useQuery({
    queryKey: ['reciters'],
    queryFn: quranApi.reciters,
    staleTime: Infinity,
  })

  const { data: bookmarks } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: portalApi.bookmarks,
    enabled: !!user,
  })

  const { data: notes } = useQuery({
    queryKey: ['notes'],
    queryFn: portalApi.notes,
    enabled: !!user,
  })

  const { translation, setTranslation, fontScale, setFontScale, reciter, setReciter } = useReader()

  const bookmarkByAyah = useMemo(() => {
    const map = new Map<number, number>()
    bookmarks?.forEach((b) => map.set(b.ayah.number_in_quran, b.id))
    return map
  }, [bookmarks])

  const noteByAyah = useMemo(() => {
    const map = new Map<number, { id: number; body: string }>()
    notes?.forEach((n) => map.set(n.ayah.number_in_quran, { id: n.id, body: n.body }))
    return map
  }, [notes])

  const audioRef = useRef<HTMLAudioElement>(null)
  const [playingNumber, setPlayingNumber] = useState<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const [noteAyah, setNoteAyah] = useState<Ayah | null>(null)
  const [noteBody, setNoteBody] = useState('')

  const ayahRefs = useRef<Map<number, HTMLElement>>(new Map())

  function playAyah(ayah: Ayah) {
    const audio = audioRef.current
    if (!audio) return
    if (playingNumber === ayah.number_in_quran && !audio.paused) {
      audio.pause()
      return
    }
    audio.src = ayahAudioUrl(reciter, ayah.number_in_quran)
    void audio.play()
    setPlayingNumber(ayah.number_in_quran)
  }

  function handleEnded() {
    if (!surah || playingNumber === null) return
    const index = surah.ayahs.findIndex((a) => a.number_in_quran === playingNumber)
    const next = surah.ayahs[index + 1]
    if (next) {
      const audio = audioRef.current
      if (audio) {
        audio.src = ayahAudioUrl(reciter, next.number_in_quran)
        void audio.play()
      }
      setPlayingNumber(next.number_in_quran)
    } else {
      setPlayingNumber(null)
    }
  }

  // Keep the ayah that is currently playing highlighted and scrolled into view.
  useEffect(() => {
    if (playingNumber === null) return
    const element = ayahRefs.current.get(playingNumber)
    if (!element) return

    const reduceMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    element.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'center',
    })
  }, [playingNumber])

  // Track viewed ayahs and log a reading session when leaving the surah.
  const viewedRef = useRef<Set<number>>(new Set())
  const startRef = useRef<number>(Date.now())

  useEffect(() => {
    if (!surah || !location.hash) return
    const element = document.getElementById(location.hash.slice(1))
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [surah, location.hash])

  useEffect(() => {
    if (!surah) return
    viewedRef.current = new Set()
    startRef.current = Date.now()

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const n = Number((entry.target as HTMLElement).dataset.ayah)
            if (n) viewedRef.current.add(n)
          }
        }
      },
      { threshold: 0.6 },
    )

    document.querySelectorAll('[data-ayah]').forEach((node) => observer.observe(node))

    const currentNumber = surah.number

    return () => {
      observer.disconnect()
      if (!user) return

      const seconds = Math.round((Date.now() - startRef.current) / 1000)
      const viewed = [...viewedRef.current]
      const maxViewed = viewed.length ? Math.max(...viewed) : null

      if (maxViewed) {
        void portalApi
          .saveContinue({ surah_number: currentNumber, ayah_number: maxViewed })
          .catch(() => {})
      }

      if (viewed.length === 0 || seconds < 10) return

      void portalApi
        .logSession({
          surah_number: currentNumber,
          from_ayah: Math.min(...viewed),
          to_ayah: maxViewed ?? undefined,
          ayahs_count: viewed.length,
          duration_seconds: seconds,
        })
        .then((res) => {
          res.new_achievements.forEach((a) => toast.success('Achievement unlocked', a.title))
          toast.success('Reading logged', `${viewed.length} ayahs · ${Math.max(1, Math.round(seconds / 60))} min`)
          void qc.invalidateQueries({ queryKey: ['dashboard'] })
        })
        .catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surah?.number, user?.id])

  const toggleBookmark = useMutation({
    mutationFn: async (ayah: Ayah) => {
      const existingId = bookmarkByAyah.get(ayah.number_in_quran)
      if (existingId) {
        await portalApi.deleteBookmark(existingId)
      } else {
        await portalApi.createBookmark({ ayah_id: ayah.id })
      }
    },
    onSuccess: (_result, ayah) => {
      const wasBookmarked = bookmarkByAyah.has(ayah.number_in_quran)
      toast.success(wasBookmarked ? 'Bookmark removed' : 'Bookmark saved')
      void qc.invalidateQueries({ queryKey: ['bookmarks'] })
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  })

  const saveNote = useMutation({
    mutationFn: async () => {
      if (!noteAyah) return
      const existing = noteByAyah.get(noteAyah.number_in_quran)
      if (existing) {
        await portalApi.updateNote(existing.id, { body: noteBody })
      } else {
        await portalApi.createNote({ ayah_id: noteAyah.id, body: noteBody })
      }
    },
    onSuccess: () => {
      toast.success('Note saved')
      setNoteAyah(null)
      setNoteBody('')
      void qc.invalidateQueries({ queryKey: ['notes'] })
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  })

  function requireUser(action: () => void) {
    if (!user) {
      toast.info('Sign in required', 'Create a free account to save your progress.')
      navigate('/login', { state: { from: `/quran/${surahNumber}` } })
      return
    }
    action()
  }

  async function copyText(text: string, successMessage: string) {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(successMessage)
    } catch {
      toast.error('Could not copy to clipboard.')
    }
  }

  function copyAyah(ayah: Ayah) {
    void copyText(
      `${ayah.text_arabic}\n\n${ayah.text_english}\n\n— Qur’an ${surahNumber}:${ayah.number_in_surah}`,
      'Ayah copied',
    )
  }

  function shareAyah(ayah: Ayah) {
    const url = `${window.location.origin}/quran/${surahNumber}#ayah-${ayah.number_in_surah}`
    const title = `Qur’an ${surahNumber}:${ayah.number_in_surah}`
    const text = `${ayah.text_arabic}\n\n${ayah.text_english}`

    if (typeof navigator.share === 'function') {
      void navigator.share({ title, text, url }).catch(() => {})
      return
    }

    void copyText(url, 'Ayah link copied')
  }

  if (!valid) {
    return <CenteredMessage>This surah does not exist.</CenteredMessage>
  }

  if (isPending) {
    return (
      <div className="flex justify-center py-32">
        <Loader2 className="size-7 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isError || !surah) {
    return <CenteredMessage>Unable to load this surah.</CenteredMessage>
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <ReaderHeader
        surah={surah}
        reciters={reciters ?? []}
        reciter={reciter}
        onReciterChange={setReciter}
        translation={translation}
        onTranslationChange={setTranslation}
        fontScale={fontScale}
        onFontScaleChange={setFontScale}
      />

      {surah.bismillah_pre && surah.number !== 1 && surah.number !== 9 && (
        <p className="font-arabic mt-10 text-center text-3xl text-foreground/80">
          بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </p>
      )}

      <div className="mt-8 space-y-4">
        {surah.ayahs.map((ayah) => {
          const isBookmarked = bookmarkByAyah.has(ayah.number_in_quran)
          const hasNote = noteByAyah.has(ayah.number_in_quran)
          const isPlayingAyah = playingNumber === ayah.number_in_quran
          return (
            <article
              key={ayah.id}
              id={`ayah-${ayah.number_in_surah}`}
              data-ayah={ayah.number_in_surah}
              ref={(element) => {
                if (element) {
                  ayahRefs.current.set(ayah.number_in_quran, element)
                } else {
                  ayahRefs.current.delete(ayah.number_in_quran)
                }
              }}
              aria-current={isPlayingAyah ? 'true' : undefined}
              className={cn(
                'scroll-mt-24 rounded-2xl border border-border bg-card p-5 transition-colors sm:p-6',
                isPlayingAyah
                  ? 'border-gold/60 bg-gold/5 ring-1 ring-gold/40'
                  : 'hover:border-primary/30',
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="grid size-8 place-items-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                    {surah.number}:{ayah.number_in_surah}
                  </span>
                  {ayah.sajda && <Badge variant="gold">Sajda</Badge>}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => playAyah(ayah)}
                    className={cn(
                      'rounded-lg p-2 transition-colors hover:bg-secondary',
                      isPlayingAyah ? 'text-gold' : 'text-muted-foreground hover:text-foreground',
                    )}
                    aria-label={isPlayingAyah && isPlaying ? 'Pause ayah' : 'Play ayah'}
                  >
                    {isPlayingAyah && isPlaying ? (
                      <Pause className="size-4" />
                    ) : (
                      <Play className="size-4" />
                    )}
                  </button>
                  <button
                    onClick={() => requireUser(() => toggleBookmark.mutate(ayah))}
                    className={cn(
                      'rounded-lg p-2 transition-colors hover:bg-secondary',
                      isBookmarked ? 'text-gold' : 'text-muted-foreground hover:text-foreground',
                    )}
                    aria-label="Bookmark ayah"
                  >
                    {isBookmarked ? <BookmarkCheck className="size-4" /> : <BookmarkIcon className="size-4" />}
                  </button>
                  <button
                    onClick={() =>
                      requireUser(() => {
                        setNoteAyah(ayah)
                        setNoteBody(noteByAyah.get(ayah.number_in_quran)?.body ?? '')
                      })
                    }
                    className={cn(
                      'rounded-lg p-2 transition-colors hover:bg-secondary',
                      hasNote ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                    )}
                    aria-label="Add note"
                  >
                    <StickyNote className="size-4" />
                  </button>
                  <button
                    onClick={() => copyAyah(ayah)}
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    aria-label="Copy ayah"
                  >
                    <Copy className="size-4" />
                  </button>
                  <button
                    onClick={() => shareAyah(ayah)}
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    aria-label="Share ayah"
                  >
                    <Share2 className="size-4" />
                  </button>
                </div>
              </div>

              <p
                className="font-arabic mt-4 text-right leading-loose text-foreground"
                dir="rtl"
                style={{ fontSize: `${1.7 * fontScale}rem`, lineHeight: 2.1 }}
              >
                {ayah.text_arabic}
              </p>

              {(translation === 'english' || translation === 'both') && (
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{ayah.text_english}</p>
              )}
              {(translation === 'bangla' || translation === 'both') && (
                <p className="font-bangla mt-3 text-sm leading-relaxed text-muted-foreground">
                  {ayah.text_bangla}
                </p>
              )}
            </article>
          )
        })}
      </div>

      <audio
        ref={audioRef}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className="hidden"
      />

      <SurahNav number={surah.number} onNavigate={(path) => navigate(path)} />

      <Modal open={!!noteAyah} onClose={() => setNoteAyah(null)} title="Your note">
        {noteAyah && (
          <>
            <p className="font-arabic mb-4 text-right text-lg text-foreground" dir="rtl">
              {noteAyah.text_arabic}
            </p>
            <Textarea
              value={noteBody}
              onChange={(e) => setNoteBody(e.target.value)}
              placeholder="Write your reflection…"
              rows={5}
            />
            <ModalFooter>
              <Button variant="ghost" onClick={() => setNoteAyah(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => saveNote.mutate()}
                disabled={!noteBody.trim() || saveNote.isPending}
              >
                {saveNote.isPending ? <Loader2 className="animate-spin" /> : null}
                Save note
              </Button>
            </ModalFooter>
          </>
        )}
      </Modal>
    </div>
  )
}

function ReaderHeader({
  surah,
  reciters,
  reciter,
  onReciterChange,
  translation,
  onTranslationChange,
  fontScale,
  onFontScaleChange,
}: {
  surah: SurahDetail
  reciters: Reciter[]
  reciter: string
  onReciterChange: (value: string) => void
  translation: TranslationMode
  onTranslationChange: (value: TranslationMode) => void
  fontScale: number
  onFontScaleChange: (value: number) => void
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            to="/quran"
            className="mb-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="size-3" /> All surahs
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">
            {surah.number}. {surah.name_transliteration}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {surah.name_english} · {surah.revelation_type} · {surah.ayah_count} ayahs
          </p>
        </div>
        <span className="font-arabic text-4xl text-gold">{surah.name_arabic}</span>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-4">
        <div className="flex items-center gap-1 rounded-lg bg-secondary p-1">
          {translationModes.map((mode) => (
            <button
              key={mode.value}
              onClick={() => onTranslationChange(mode.value)}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                translation === mode.value
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {mode.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-border px-1">
          <button
            onClick={() => onFontScaleChange(Math.max(0.85, fontScale - 0.1))}
            className="rounded-md p-1.5 text-muted-foreground hover:text-foreground"
            aria-label="Decrease font size"
          >
            <Minus className="size-3.5" />
          </button>
          <span className="w-8 text-center text-xs text-muted-foreground">
            {Math.round(fontScale * 100)}%
          </span>
          <button
            onClick={() => onFontScaleChange(Math.min(2, fontScale + 0.1))}
            className="rounded-md p-1.5 text-muted-foreground hover:text-foreground"
            aria-label="Increase font size"
          >
            <Plus className="size-3.5" />
          </button>
        </div>

        <select
          value={reciter}
          onChange={(e) => onReciterChange(e.target.value)}
          className="h-9 rounded-lg border border-input bg-background px-2 text-xs shadow-sm focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none"
          aria-label="Reciter"
        >
          {reciters.map((r) => (
            <option key={r.identifier} value={r.identifier}>
              {r.english_name}
            </option>
          ))}
        </select>

        <Link
          to="/quran/search"
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Search className="size-3.5" />
          Search
        </Link>
      </div>
    </div>
  )
}

function SurahNav({ number, onNavigate }: { number: number; onNavigate: (to: string) => void }) {
  const prev = number > 1 ? number - 1 : null
  const next = number < 114 ? number + 1 : null

  return (
    <div className="mt-10 flex items-center justify-between gap-4">
      {prev ? (
        <Button variant="outline" onClick={() => onNavigate(`/quran/${prev}`)}>
          <ChevronLeft /> Surah {prev}
        </Button>
      ) : (
        <span />
      )}
      {next && (
        <Button variant="outline" onClick={() => onNavigate(`/quran/${next}`)}>
          Surah {next} <ChevronRight />
        </Button>
      )}
    </div>
  )
}

function CenteredMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-muted-foreground">{children}</p>
      <Link to="/quran" className="text-sm font-medium text-primary hover:underline">
        Back to all surahs
      </Link>
    </div>
  )
}
