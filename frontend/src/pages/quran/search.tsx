import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { ArrowLeft, ArrowRight, Search as SearchIcon } from 'lucide-react'
import { useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { apiErrorMessage } from '@/lib/api'
import { quranApi } from '@/lib/quran'
import { useSeo } from '@/lib/seo'
import { cn } from '@/lib/utils'
import { useReader, type TranslationMode } from '@/store/reader'
import type { Ayah } from '@/types/quran'

const PER_PAGE = 20

const translationModes: { value: TranslationMode; label: string }[] = [
  { value: 'english', label: 'English' },
  { value: 'bangla', label: 'বাংলা' },
  { value: 'both', label: 'Both' },
  { value: 'none', label: 'Arabic only' },
]

export function QuranSearchPage() {
  const [params, setParams] = useSearchParams()
  const query = (params.get('q') ?? '').trim()
  const page = Math.max(1, Number(params.get('page')) || 1)

  const [draft, setDraft] = useState(() => params.get('q') ?? '')
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const translation = useReader((s) => s.translation)
  const setTranslation = useReader((s) => s.setTranslation)

  const enabled = query.length >= 2

  useSeo(
    enabled ? `Search: ${query}` : 'Search the Qur’an',
    'Search the Holy Qur’an by keyword across the Arabic text and English & Bangla translations, with deep links to every ayah.',
  )

  const { data, isPending, isError, error, isFetching, refetch } = useQuery({
    queryKey: ['ayah-search', query, page],
    queryFn: () => quranApi.search(query, page, PER_PAGE),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  })

  function commitDraft(value: string) {
    const trimmed = value.trim()
    if (trimmed === query) return
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (trimmed) next.set('q', trimmed)
        else next.delete('q')
        next.delete('page')
        return next
      },
      { replace: true },
    )
  }

  function onDraftChange(value: string) {
    setDraft(value)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => commitDraft(value), 350)
  }

  function goToPage(target: number) {
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      if (target <= 1) next.delete('page')
      else next.set('page', String(target))
      return next
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight">Search the Qur'an</h1>
      <p className="mt-1 text-muted-foreground">
        Search the Arabic text and the English &amp; Bangla translations.
      </p>

      <div className="relative mt-6">
        <SearchIcon className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          autoFocus
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          placeholder="Search Arabic, English or Bangla…"
          className="h-12 pl-11 text-base"
          aria-label="Search the Qur'an"
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">Translation</span>
        <div className="flex gap-1 rounded-lg bg-secondary p-1">
          {translationModes.map((mode) => (
            <button
              key={mode.value}
              type="button"
              onClick={() => setTranslation(mode.value)}
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
      </div>

      <div className="mt-8">
        {!enabled && <SearchHint hasInput={draft.trim().length > 0} />}

        {enabled && isError && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/5 py-16 text-center">
            <p className="text-sm text-muted-foreground">{apiErrorMessage(error)}</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => void refetch()}>
              Try again
            </Button>
          </div>
        )}

        {enabled && !isError && isPending && (
          <div className="flex justify-center py-24">
            <Spinner className="size-7" />
          </div>
        )}

        {enabled && !isError && data && data.data.length === 0 && (
          <div className="rounded-xl border border-dashed border-border py-20 text-center">
            <SearchIcon className="mx-auto size-8 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">No ayahs found for “{query}”.</p>
            <p className="mt-1 text-xs text-muted-foreground">Try a different word or spelling.</p>
          </div>
        )}

        {enabled && !isError && data && data.data.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {data.meta.total} {data.meta.total === 1 ? 'result' : 'results'} for “{query}”
              </p>
              {isFetching && <Spinner className="size-4" />}
            </div>

            <div className="mt-4 space-y-4">
              {data.data.map((ayah) => (
                <ResultCard key={ayah.id} ayah={ayah} term={query} translation={translation} />
              ))}
            </div>

            {data.meta.last_page > 1 && (
              <div className="mt-8 flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={data.meta.current_page <= 1}
                  onClick={() => goToPage(data.meta.current_page - 1)}
                >
                  <ArrowLeft className="size-4" />
                  Previous
                </Button>
                <span className="text-xs text-muted-foreground">
                  Page {data.meta.current_page} of {data.meta.last_page}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={data.meta.current_page >= data.meta.last_page}
                  onClick={() => goToPage(data.meta.current_page + 1)}
                >
                  Next
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function SearchHint({ hasInput }: { hasInput: boolean }) {
  return (
    <div className="rounded-xl border border-dashed border-border py-20 text-center">
      <SearchIcon className="mx-auto size-8 text-muted-foreground" />
      <p className="mt-3 text-sm text-muted-foreground">
        {hasInput
          ? 'Keep typing — enter at least 2 characters.'
          : 'Search across the Arabic text and the English & Bangla translations.'}
      </p>
      {!hasInput && <p className="mt-1 text-xs text-muted-foreground">Type at least 2 characters to begin.</p>}
    </div>
  )
}

function Highlight({ text, term }: { text: string | null; term: string }) {
  if (!text) return null
  const needle = term.trim()
  if (!needle) return <>{text}</>

  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'))

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === needle.toLowerCase() ? (
          <mark key={index} className="rounded bg-gold/30 px-0.5 text-inherit">
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  )
}

function ResultCard({
  ayah,
  term,
  translation,
}: {
  ayah: Ayah
  term: string
  translation: TranslationMode
}) {
  const surah = ayah.surah

  return (
    <article className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/30 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to={surah ? `/quran/${surah.number}#ayah-${ayah.number_in_surah}` : '/quran'}
          className="text-xs font-medium text-primary hover:underline"
        >
          {surah
            ? `${surah.name_transliteration} · ${surah.number}:${ayah.number_in_surah}`
            : `Ayah ${ayah.number_in_quran}`}
        </Link>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Juz {ayah.juz}</Badge>
          <Badge variant="outline">Page {ayah.page}</Badge>
        </div>
      </div>

      <p className="font-arabic mt-4 text-right text-2xl leading-loose" dir="rtl">
        <Highlight text={ayah.text_arabic} term={term} />
      </p>

      {(translation === 'english' || translation === 'both') && (
        <p className="mt-3 text-sm text-muted-foreground">
          <Highlight text={ayah.text_english} term={term} />
        </p>
      )}

      {(translation === 'bangla' || translation === 'both') && (
        <p className="mt-2 text-sm text-muted-foreground">
          <Highlight text={ayah.text_bangla} term={term} />
        </p>
      )}
    </article>
  )
}
