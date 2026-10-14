import { useQuery } from '@tanstack/react-query'
import { Loader2, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button-variants'
import { Input } from '@/components/ui/input'
import { quranApi } from '@/lib/quran'
import { useSeo } from '@/lib/seo'
import { cn } from '@/lib/utils'

export function QuranIndexPage() {
  useSeo(
    "The Noble Qur'an",
    'Read all 114 surahs of the Holy Qur’an in Arabic with English and Bangla translations, verse-by-verse audio and deep links to every ayah.',
  )

  const { data, isPending, isError } = useQuery({
    queryKey: ['surahs'],
    queryFn: quranApi.surahs,
    staleTime: Infinity,
  })

  const [query, setQuery] = useState('')

  const surahs = useMemo(() => {
    if (!data) return []
    const q = query.trim().toLowerCase()
    if (!q) return data
    return data.filter(
      (s) =>
        s.name_transliteration.toLowerCase().includes(q) ||
        s.name_english.toLowerCase().includes(q) ||
        s.name_arabic.includes(query.trim()) ||
        String(s.number) === q,
    )
  }, [data, query])

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">The Noble Qur'an</h1>
          <p className="mt-1 text-muted-foreground">
            114 surahs · Arabic text with English &amp; Bangla translations
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 md:w-72">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search surah…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Link
            to="/quran/search"
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'justify-center')}
          >
            <Search className="size-4" />
            Search ayah text
          </Link>
        </div>
      </div>

      {isPending && (
        <div className="flex justify-center py-24">
          <Loader2 className="size-7 animate-spin text-muted-foreground" />
        </div>
      )}

      {isError && (
        <p className="py-24 text-center text-muted-foreground">
          Unable to load surahs. Please try again.
        </p>
      )}

      {!isPending && !isError && (
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {surahs.map((surah) => (
            <Link
              key={surah.number}
              to={`/quran/${surah.number}`}
              className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-md"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-primary/10 text-sm font-semibold text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                {surah.number}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-medium">{surah.name_transliteration}</p>
                  <span className="font-arabic text-lg text-gold">{surah.name_arabic}</span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="truncate">{surah.name_english}</span>
                  <span aria-hidden>·</span>
                  <span className="shrink-0">{surah.ayah_count} ayahs</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!isPending && !isError && surahs.length === 0 && (
        <p className="py-16 text-center text-muted-foreground">No surahs matched "{query}".</p>
      )}

      <p className="mt-10 text-center text-xs text-muted-foreground">
        <Badge variant="secondary">Madani &amp; Makki</Badge>
      </p>
    </div>
  )
}
