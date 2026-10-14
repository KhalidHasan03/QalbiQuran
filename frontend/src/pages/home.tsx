import { useQuery } from '@tanstack/react-query'
import {
  BookOpen,
  Flame,
  Languages,
  PlayCircle,
  Sparkles,
  Target,
  Trophy,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button-variants'
import { fetchHealth } from '@/lib/api'
import { useSeo } from '@/lib/seo'
import { cn } from '@/lib/utils'
import { useAuth } from '@/store/auth'

function HealthBadge() {
  const { data, isPending, isError } = useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
    refetchInterval: 30_000,
  })

  const label = isPending
    ? 'Checking API…'
    : isError
      ? 'API offline'
      : `${data?.app} API online`

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium',
        isError
          ? 'border-destructive/40 text-destructive'
          : 'border-border text-muted-foreground',
      )}
    >
      <span
        className={cn(
          'size-2 rounded-full',
          isError
            ? 'bg-destructive'
            : isPending
              ? 'bg-gold animate-pulse'
              : 'bg-emerald',
        )}
      />
      {label}
    </span>
  )
}

function Feature({
  icon,
  title,
  children,
}: {
  icon: ReactNode
  title: string
  children: ReactNode
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-6 transition-colors hover:border-gold/50">
      <span className="grid size-11 place-items-center rounded-xl bg-secondary text-primary">
        {icon}
      </span>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">{children}</p>
    </div>
  )
}

export function HomePage() {
  const user = useAuth((s) => s.user)

  useSeo(
    undefined,
    'QalbiQuran — read, listen and reflect on the Holy Qur’an in Arabic, English and Bangla with daily streaks, reading goals and progress tracking.',
  )

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 pattern-islamic opacity-[0.35]" />
        <div
          className="pointer-events-none absolute -top-40 left-1/2 size-[36rem] -translate-x-1/2 rounded-full opacity-30 blur-3xl"
          style={{
            background:
              'radial-gradient(circle, var(--emerald-light), transparent 60%)',
          }}
        />
        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 sm:py-28 lg:px-8">
          <HealthBadge />

          <p className="mt-8 font-arabic text-2xl text-gold sm:text-3xl" dir="rtl">
            بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </p>

          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">
            Build a lifelong habit with the{' '}
            <span className="text-gold">Holy Qur&apos;an</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-balance text-muted-foreground sm:text-lg">
            Read, listen and reflect in Arabic, English and Bangla. Track your
            daily streaks, set reading goals, and deepen your connection — one
            ayah at a time.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/quran"
              className={cn(buttonVariants({ size: 'lg', variant: 'gold' }), 'gap-2')}
            >
              <BookOpen className="size-5" /> Start reading
            </Link>
            <Link
              to={user ? '/portal' : '/register'}
              className={cn(buttonVariants({ size: 'lg', variant: 'outline' }), 'gap-2')}
            >
              <PlayCircle className="size-5" />
              {user ? 'Go to dashboard' : 'Create free account'}
            </Link>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            Free forever — tracking progress, streaks &amp; hasanat.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
            <Sparkles className="size-3.5" /> Everything you need
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            A habit-building Qur&apos;an companion
          </h2>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Feature icon={<BookOpen className="size-5" />} title="Qur'an reader">
            Arabic with translation in English and Bangla — with verse-by-verse
            audio and beautiful, readable typography.
          </Feature>
          <Feature icon={<Flame className="size-5" />} title="Daily streaks">
            Stay consistent with weekly trackers and gentle reminders that keep
            you coming back every day.
          </Feature>
          <Feature icon={<Target className="size-5" />} title="Reading goals">
            Set a daily goal from a couple of minutes to an hour and watch your
            progress grow.
          </Feature>
          <Feature icon={<Trophy className="size-5" />} title="Leaderboards">
            Add family and friends and compete in good deeds — ranked by your
            weekly reading.
          </Feature>
          <Feature icon={<Languages className="size-5" />} title="Multi-language">
            Switch between Arabic, English and Bangla instantly without ever
            altering the original text.
          </Feature>
          <Feature icon={<Sparkles className="size-5" />} title="Reflect & notes">
            Bookmark ayahs, leave personal notes, and build your own
            understanding over time.
          </Feature>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-card p-10 text-center sm:p-16">
          <div className="pointer-events-none absolute inset-0 pattern-islamic opacity-25" />
          <div className="relative">
            <p
              className="font-arabic text-3xl leading-relaxed text-gold sm:text-4xl"
              dir="rtl"
            >
              فَإِنَّ مَعَ ٱلْعُسْرِ يُسْرًا
            </p>
            <p className="mt-4 text-sm italic text-muted-foreground">
              “For indeed, with hardship [will be] ease.” — Ash-Sharh 94:5
            </p>
            <div className="mt-8">
              <Link
                to="/quran"
                className={cn(buttonVariants({ size: 'lg', variant: 'gold' }))}
              >
                Begin your journey
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
