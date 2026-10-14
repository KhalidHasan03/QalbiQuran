import { useQuery } from '@tanstack/react-query'
import { Crown, Medal } from 'lucide-react'
import { useState } from 'react'
import { PortalHeading } from '@/components/portal/portal-layout'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import { portalApi } from '@/lib/portal'

export function LeaderboardPage() {
  const [scope, setScope] = useState<'global' | 'friends'>('global')
  const [period, setPeriod] = useState<'week' | 'all'>('week')

  const { data, isPending, isError } = useQuery({
    queryKey: ['leaderboard', scope, period],
    queryFn: () => portalApi.leaderboard(scope, period),
  })

  return (
    <div>
      <PortalHeading title="Leaderboard" subtitle="Friendly competition in reading the Qur'an." />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Segmented
          options={[
            { value: 'global', label: 'Global' },
            { value: 'friends', label: 'Friends' },
          ]}
          value={scope}
          onChange={(v) => setScope(v as 'global' | 'friends')}
        />
        <Segmented
          options={[
            { value: 'week', label: 'This week' },
            { value: 'all', label: 'All time' },
          ]}
          value={period}
          onChange={(v) => setPeriod(v as 'week' | 'all')}
        />
      </div>

      {data && (
        <div className="mb-5 rounded-xl border border-primary/30 bg-primary/5 p-4">
          <p className="text-xs text-muted-foreground">Your standing</p>
          <p className="mt-1 text-lg font-semibold">
            {data.me.rank ? `Rank #${data.me.rank}` : 'Not ranked yet'} · {data.me.score.toLocaleString()}{' '}
            {period === 'week' ? 'ayahs this week' : 'ayahs all time'}
          </p>
        </div>
      )}

      {isPending && (
        <div className="flex justify-center py-24">
          <Spinner className="size-7" />
        </div>
      )}

      {isError && <p className="py-24 text-center text-muted-foreground">Unable to load the leaderboard.</p>}

      {data && data.leaders.length === 0 && (
        <p className="py-16 text-center text-muted-foreground">No reading activity yet. Be the first!</p>
      )}

      {data && data.leaders.length > 0 && (
        <ol className="space-y-2 list-none">
          {data.leaders.map((entry) => (
            <li
              key={entry.user.id}
              className={cn(
                'flex items-center gap-4 rounded-xl border p-3',
                entry.is_me ? 'border-primary/40 bg-primary/5' : 'border-border bg-card',
              )}
            >
              <span
                className={cn(
                  'grid size-9 shrink-0 place-items-center rounded-full text-sm font-semibold',
                  entry.rank === 1 && 'bg-gold/20 text-gold',
                  entry.rank === 2 && 'bg-secondary text-foreground',
                  entry.rank === 3 && 'bg-accent text-accent-foreground',
                  entry.rank > 3 && 'bg-secondary text-muted-foreground',
                )}
              >
                {entry.rank <= 3 ? <Medal className="size-4" /> : entry.rank}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 truncate text-sm font-medium">
                  {entry.user.name}
                  {entry.rank === 1 && <Crown className="size-3.5 text-gold" />}
                  {entry.is_me && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">You</span>
                  )}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {entry.user.username ? `@${entry.user.username}` : ''}
                  {entry.user.current_streak > 0 && ` · 🔥 ${entry.user.current_streak} day streak`}
                </p>
              </div>
              <span className="shrink-0 text-sm font-semibold tabular-nums">{entry.score.toLocaleString()}</span>
            </li>
          ))}
        </ol>
      )}

      {data?.me.rank && !data.leaders.some((l) => l.is_me) && (
        <p className="mt-4 text-center text-xs text-muted-foreground">
          You are ranked #{data.me.rank} — keep reading to climb!
        </p>
      )}
    </div>
  )
}

function Segmented({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex items-center gap-1 rounded-lg bg-secondary p-1">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
            value === option.value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
