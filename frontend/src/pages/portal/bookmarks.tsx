import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Bookmark as BookmarkIcon, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PortalHeading } from '@/components/portal/portal-layout'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { apiErrorMessage } from '@/lib/api'
import { portalApi } from '@/lib/portal'
import { toast } from '@/store/toasts'

export function BookmarksPage() {
  const qc = useQueryClient()
  const { data, isPending, isError } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: portalApi.bookmarks,
  })

  const remove = useMutation({
    mutationFn: (id: number) => portalApi.deleteBookmark(id),
    onSuccess: () => {
      toast.success('Bookmark removed')
      void qc.invalidateQueries({ queryKey: ['bookmarks'] })
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  })

  if (isPending) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="size-7" />
      </div>
    )
  }

  if (isError || !data) {
    return <p className="py-24 text-center text-muted-foreground">Unable to load your bookmarks.</p>
  }

  return (
    <div>
      <PortalHeading title="Bookmarks" subtitle="Ayahs you have saved for later." />

      {data.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-20 text-center">
          <BookmarkIcon className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            No bookmarks yet. Tap the bookmark icon while reading.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((bookmark) => (
            <div key={bookmark.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between gap-3">
                <Link
                  to={`/quran/${bookmark.surah?.number}#ayah-${bookmark.ayah.number_in_surah}`}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  {bookmark.surah?.name_transliteration} · {bookmark.surah?.number}:{bookmark.ayah.number_in_surah}
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:text-destructive"
                  onClick={() => remove.mutate(bookmark.id)}
                  aria-label="Remove bookmark"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <p className="font-arabic mt-3 text-right text-xl leading-loose" dir="rtl">
                {bookmark.ayah.text_arabic}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{bookmark.ayah.text_english}</p>
              {bookmark.note && (
                <p className="mt-3 rounded-lg bg-secondary px-3 py-2 text-xs text-secondary-foreground">
                  {bookmark.note}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
