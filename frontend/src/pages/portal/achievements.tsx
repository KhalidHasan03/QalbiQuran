import { useQuery } from '@tanstack/react-query'
import { Sparkles, Trophy } from 'lucide-react'
import { PortalHeading } from '@/components/portal/portal-layout'
import { Progress } from '@/components/ui/progress'
import { Spinner } from '@/components/ui/spinner'
import { portalApi } from '@/lib/portal'

export function AchievementsPage() {
  const { data, isPending, isError } = useQuery({
    queryKey: ['achievements'],
    queryFn: portalApi.achievements,
  })

  if (isPending) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="size-7" />
      </div>
    )
  }

  if (isError || !data) {
    return <p className="py-24 text-center text-muted-foreground">Unable to load achievements.</p>
  }

  const percent = data.meta.total ? (data.meta.unlocked / data.meta.total) * 100 : 0

  return (
    <div>
      <PortalHeading title="Achievements" subtitle="Milestones on your Qur'an journey." />

      <div className="mb-6 rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-medium">
            <Trophy className="size-4 text-gold" />
            {data.meta.unlocked} of {data.meta.total} unlocked
          </span>
          <span className="text-sm text-muted-foreground tabular-nums">{Math.round(percent)}%</span>
        </div>
        <Progress value={percent} className="mt-3" indicatorClassName="bg-gold" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.items.map((achievement) => (
          <div
            key={achievement.code}
            className={
              achievement.unlocked
                ? 'rounded-xl border border-gold/40 bg-gradient-to-br from-gold/10 to-transparent p-5'
                : 'rounded-xl border border-border bg-card p-5 opacity-70'
            }
          >
            <span
              className={
                achievement.unlocked
                  ? 'grid size-11 place-items-center rounded-full bg-gold/20 text-gold'
                  : 'grid size-11 place-items-center rounded-full bg-secondary text-muted-foreground'
              }
            >
              <Trophy className="size-5" />
            </span>
            <p className="mt-3 font-medium">{achievement.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{achievement.description}</p>
            {achievement.unlocked ? (
              <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-gold">
                <Sparkles className="size-3.5" /> Unlocked
              </p>
            ) : (
              <p className="mt-3 text-xs text-muted-foreground">Locked</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
