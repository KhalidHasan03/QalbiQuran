import { useQuery } from '@tanstack/react-query'
import { CalendarDays, Clock, Flame, Trophy } from 'lucide-react'
import { PortalHeading } from '@/components/portal/portal-layout'
import { StatCard } from '@/components/portal/stat-card'
import { WeeklyActivity } from '@/components/portal/weekly-activity'
import { Progress } from '@/components/ui/progress'
import { Spinner } from '@/components/ui/spinner'
import { portalApi } from '@/lib/portal'

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

export function ProgressPage() {
  const { data, isPending, isError } = useQuery({
    queryKey: ['progress'],
    queryFn: portalApi.progress,
  })

  if (isPending) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="size-7" />
      </div>
    )
  }

  if (isError || !data) {
    return <p className="py-24 text-center text-muted-foreground">Unable to load your progress.</p>
  }

  const { stat, weekly, monthly } = data

  return (
    <div>
      <PortalHeading title="Your progress" subtitle="A closer look at your reading habits." />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Current streak" value={`${stat.current_streak} days`} icon={Flame} />
        <StatCard label="Longest streak" value={`${stat.longest_streak} days`} icon={Trophy} accent="gold" />
        <StatCard label="Ayahs read" value={stat.total_ayahs_read.toLocaleString()} icon={CalendarDays} />
        <StatCard
          label="Time reading"
          value={formatDuration(stat.total_seconds)}
          icon={Clock}
          accent="gold"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
          <p className="mb-4 text-sm font-medium">Last 7 days</p>
          <WeeklyActivity days={weekly} />
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-medium">Last 30 days</p>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Ayahs</dt>
              <dd className="font-semibold tabular-nums">{monthly.ayahs.toLocaleString()}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Active days</dt>
              <dd className="font-semibold tabular-nums">{monthly.days}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Time</dt>
              <dd className="font-semibold tabular-nums">{formatDuration(monthly.seconds)}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Khatmah {stat.current_khatmah}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {stat.khatmah_progress.ayahs_read.toLocaleString()} of{' '}
              {stat.khatmah_progress.total_ayahs.toLocaleString()} ayahs
            </p>
          </div>
          <span className="flex items-center gap-2 text-sm font-semibold">
            <Trophy className="size-4 text-gold" />
            {stat.completed_khatmahs > 0 && `${stat.completed_khatmahs} completed`}
          </span>
        </div>
        <Progress value={stat.khatmah_progress.percent} className="mt-4" indicatorClassName="bg-gold" />
        <p className="mt-2 text-xs text-muted-foreground">{stat.khatmah_progress.percent}% complete</p>
      </div>
    </div>
  )
}
