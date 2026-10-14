import { useQuery } from '@tanstack/react-query'
import { BookOpen, Flame, Sparkles, Target, Trophy } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { PortalHeading } from '@/components/portal/portal-layout'
import { StatCard } from '@/components/portal/stat-card'
import { WeeklyActivity } from '@/components/portal/weekly-activity'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Spinner } from '@/components/ui/spinner'
import { portalApi } from '@/lib/portal'
import { useAuth } from '@/store/auth'

export function DashboardPage() {
  const user = useAuth((s) => s.user)
  const { data, isPending, isError } = useQuery({
    queryKey: ['dashboard'],
    queryFn: portalApi.dashboard,
  })

  if (isPending) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="size-7" />
      </div>
    )
  }

  if (isError || !data) {
    return <p className="py-24 text-center text-muted-foreground">Unable to load your dashboard.</p>
  }

  const { stat, today, goal, weekly, continue_reading, recent_achievements } = data
  const goalPercent = goal.target ? Math.min(100, (today.goal_value / goal.target) * 100) : 0
  const firstName = (user?.name ?? 'there').split(' ')[0]

  return (
    <div>
      <PortalHeading
        title={`As-salamu alaykum, ${firstName}`}
        subtitle="Here is your Qur'an journey so far."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Current streak" value={stat.current_streak} hint="days in a row" icon={Flame} />
        <StatCard label="Ayahs read" value={stat.total_ayahs_read} icon={BookOpen} />
        <StatCard label="Hasanat" value={stat.total_hasanat.toLocaleString()} icon={Sparkles} accent="gold" />
        <StatCard
          label="Khatmahs"
          value={stat.completed_khatmahs}
          hint={`Khatmah #${stat.current_khatmah} in progress`}
          icon={Trophy}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Today&apos;s goal</h2>
            <span className="text-xs text-muted-foreground">
              {today.goal_value} / {goal.target} {goal.type === 'ayahs' ? 'ayahs' : 'min'}
            </span>
          </div>
          <div className="mt-4 flex items-center gap-4">
            <Progress
              value={goalPercent}
              indicatorClassName={today.goal_met ? 'bg-gold' : undefined}
              className="h-3"
            />
            <span className="w-12 shrink-0 text-right text-sm font-medium tabular-nums">
              {Math.round(goalPercent)}%
            </span>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {today.goal_met
              ? 'Goal reached — masha’Allah!'
              : `${Math.max(0, goal.target - today.goal_value)} ${goal.type === 'ayahs' ? 'ayahs' : 'minutes'} to go today.`}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <p className="mb-4 text-sm font-medium">This week</p>
          <WeeklyActivity days={weekly} />
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-gradient-to-br from-primary/10 to-transparent p-5 lg:col-span-2">
          <div className="flex items-center gap-2 text-primary">
            <BookOpen className="size-4" />
            <span className="text-sm font-medium">Continue reading</span>
          </div>
          <p className="mt-3 text-lg font-semibold">
            {continue_reading.surah_number}:{continue_reading.ayah_number}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {stat.last_surah_number
              ? 'Pick up where you left off.'
              : 'Start your journey with Surah Al-Fatihah.'}
          </p>
          <Link
            to={`/quran/${continue_reading.surah_number}#ayah-${continue_reading.ayah_number}`}
            className="mt-4 inline-block"
          >
            <Button variant="gold" size="sm">
              Resume reading
            </Button>
          </Link>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Khatmah progress</span>
            <Trophy className="size-4 text-gold" />
          </div>
          <p className="mt-3 text-2xl font-semibold tabular-nums">{stat.khatmah_progress.percent}%</p>
          <Progress value={stat.khatmah_progress.percent} className="mt-3" indicatorClassName="bg-gold" />
          <p className="mt-2 text-xs text-muted-foreground">
            {stat.khatmah_progress.ayahs_read.toLocaleString()} / {stat.khatmah_progress.total_ayahs.toLocaleString()} ayahs
          </p>
        </div>
      </div>

      {recent_achievements.length > 0 && (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium">Recent achievements</h2>
            <Link to="/portal/achievements" className="text-xs font-medium text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recent_achievements.map((achievement) => (
              <div
                key={achievement.code}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gold/15 text-gold">
                  <Sparkles className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{achievement.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{achievement.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <MiniStat icon={<Flame className="size-4" />} label="Current streak" value={`${stat.current_streak} days`} />
        <MiniStat icon={<Trophy className="size-4" />} label="Longest streak" value={`${stat.longest_streak} days`} />
        <MiniStat icon={<Target className="size-4" />} label="Reading days" value={stat.reading_days} />
      </div>
    </div>
  )
}

function MiniStat({ icon, label, value }: { icon: ReactNode; label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
      <span className="text-primary">{icon}</span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  )
}
