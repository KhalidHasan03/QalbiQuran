import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, NotebookPen, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PortalHeading } from '@/components/portal/portal-layout'
import { Button } from '@/components/ui/button'
import { Modal, ModalFooter } from '@/components/ui/modal'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { apiErrorMessage } from '@/lib/api'
import { portalApi } from '@/lib/portal'
import { toast } from '@/store/toasts'
import type { Note } from '@/types/portal'

export function NotesPage() {
  const qc = useQueryClient()
  const [editing, setEditing] = useState<Note | null>(null)
  const [body, setBody] = useState('')

  const { data, isPending, isError } = useQuery({
    queryKey: ['notes'],
    queryFn: portalApi.notes,
  })

  const save = useMutation({
    mutationFn: () => portalApi.updateNote(editing!.id, { body }),
    onSuccess: () => {
      toast.success('Note updated')
      setEditing(null)
      void qc.invalidateQueries({ queryKey: ['notes'] })
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  })

  const remove = useMutation({
    mutationFn: (id: number) => portalApi.deleteNote(id),
    onSuccess: () => {
      toast.success('Note deleted')
      void qc.invalidateQueries({ queryKey: ['notes'] })
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
    return <p className="py-24 text-center text-muted-foreground">Unable to load your notes.</p>
  }

  return (
    <div>
      <PortalHeading title="Notes" subtitle="Your personal reflections on the ayahs." />

      {data.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-20 text-center">
          <NotebookPen className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            No notes yet. Add one while reading an ayah.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((note) => (
            <div key={note.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between gap-3">
                <Link
                  to={`/quran/${note.surah?.number}#ayah-${note.ayah.number_in_surah}`}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  {note.surah?.name_transliteration} · {note.surah?.number}:{note.ayah.number_in_surah}
                </Link>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground"
                    onClick={() => {
                      setEditing(note)
                      setBody(note.body)
                    }}
                    aria-label="Edit note"
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-destructive"
                    onClick={() => remove.mutate(note.id)}
                    aria-label="Delete note"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
              <p className="mt-3 border-l-2 border-border pl-3 text-sm text-muted-foreground">
                {note.ayah.text_english}
              </p>
              <p className="mt-3 text-sm">{note.body}</p>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit note">
        <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={5} />
        <ModalFooter>
          <Button variant="ghost" onClick={() => setEditing(null)}>
            Cancel
          </Button>
          <Button onClick={() => save.mutate()} disabled={!body.trim() || save.isPending}>
            {save.isPending ? <Loader2 className="animate-spin" /> : null}
            Save
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
