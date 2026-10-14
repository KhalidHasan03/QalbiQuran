import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, Loader2, UserPlus, X } from 'lucide-react'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { PortalHeading } from '@/components/portal/portal-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { apiErrorMessage } from '@/lib/api'
import { portalApi } from '@/lib/portal'
import { toast } from '@/store/toasts'
import type { FriendSummary } from '@/types/portal'

export function FriendsPage() {
  const qc = useQueryClient()
  const [username, setUsername] = useState('')

  const { data, isPending, isError } = useQuery({
    queryKey: ['friends'],
    queryFn: portalApi.friends,
  })

  const invalidate = () => void qc.invalidateQueries({ queryKey: ['friends'] })

  const add = useMutation({
    mutationFn: () => portalApi.addFriend(username.trim()),
    onSuccess: (res) => {
      toast.success(res.message)
      setUsername('')
      invalidate()
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  })

  const accept = useMutation({
    mutationFn: (id: number) => portalApi.acceptFriend(id),
    onSuccess: () => {
      toast.success('Friend added')
      invalidate()
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  })

  const remove = useMutation({
    mutationFn: (id: number) => portalApi.removeFriend(id),
    onSuccess: () => {
      toast.success('Removed')
      invalidate()
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
    return <p className="py-24 text-center text-muted-foreground">Unable to load your friends.</p>
  }

  return (
    <div>
      <PortalHeading title="Friends" subtitle="Read together and stay motivated." />

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (username.trim()) add.mutate()
        }}
        className="mb-6 flex gap-2"
      >
        <Input
          placeholder="Add a friend by username…"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Button type="submit" disabled={!username.trim() || add.isPending}>
          {add.isPending ? <Loader2 className="animate-spin" /> : <UserPlus className="size-4" />}
          Add
        </Button>
      </form>

      {data.incoming_requests.length > 0 && (
        <Section title="Friend requests">
          {data.incoming_requests.map((request) => (
            <FriendRow key={request.id} user={request.user}>
              <Button size="sm" variant="gold" onClick={() => accept.mutate(request.id)}>
                <Check className="size-4" /> Accept
              </Button>
              <Button size="sm" variant="ghost" onClick={() => remove.mutate(request.id)}>
                <X className="size-4" />
              </Button>
            </FriendRow>
          ))}
        </Section>
      )}

      <Section title={`Friends (${data.friends.length})`}>
        {data.friends.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
            No friends yet. Invite someone by their username.
          </p>
        ) : (
          data.friends.map((friend) => (
            <FriendRow key={friend.id} user={friend}>
              <Button
                size="sm"
                variant="ghost"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => remove.mutate(friend.id)}
              >
                Remove
              </Button>
            </FriendRow>
          ))
        )}
      </Section>

      {data.outgoing_requests.length > 0 && (
        <Section title="Pending sent requests">
          {data.outgoing_requests.map((request) => (
            <FriendRow key={request.id} user={request.user}>
              <Button size="sm" variant="ghost" onClick={() => remove.mutate(request.id)}>
                Cancel
              </Button>
            </FriendRow>
          ))}
        </Section>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="mb-3 text-sm font-medium">{title}</h2>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function FriendRow({ user, children }: { user: FriendSummary; children: ReactNode }) {
  const initials = user.name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
        {initials}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{user.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {user.username ? `@${user.username}` : ''}
          {user.total_ayahs_read > 0 && ` · ${user.total_ayahs_read.toLocaleString()} ayahs`}
        </p>
      </div>
      <div className="flex items-center gap-1">{children}</div>
    </div>
  )
}
