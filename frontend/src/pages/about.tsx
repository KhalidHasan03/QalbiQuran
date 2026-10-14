import { BookOpen, HeartHandshake, Languages, LineChart, ShieldCheck, Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button-variants'
import { useSeo } from '@/lib/seo'
import { cn } from '@/lib/utils'

const values: { icon: ReactNode; title: string; body: string }[] = [
  {
    icon: <BookOpen className="size-5" />,
    title: 'Read & reflect',
    body: 'The complete Qur’an in the Uthmani script, with English and Bangla translations and verse-by-verse audio.',
  },
  {
    icon: <LineChart className="size-5" />,
    title: 'Track your journey',
    body: 'Gentle daily goals, reading streaks and hasanat help you stay consistent without pressure or guilt.',
  },
  {
    icon: <HeartHandshake className="size-5" />,
    title: 'Learn together',
    body: 'Add family and friends, and encourage one another through a shared leaderboard of good deeds.',
  },
  {
    icon: <Languages className="size-5" />,
    title: 'Your language',
    body: 'Switch between Arabic, English and Bangla instantly — the original Arabic is never altered.',
  },
  {
    icon: <Sparkles className="size-5" />,
    title: 'Reflect & notes',
    body: 'Bookmark ayahs and keep personal notes, building your own understanding over time.',
  },
  {
    icon: <ShieldCheck className="size-5" />,
    title: 'Free & respectful',
    body: 'No ads, no tracking for advertising, and no selling of your data. Built to serve, not to exploit.',
  },
]

const sources: { label: string; value: string; href?: string }[] = [
  {
    label: 'Qur’anic text & translations',
    value: 'Al Quran Cloud',
    href: 'https://alquran.cloud',
  },
  {
    label: 'Arabic (Uthmani script)',
    value: 'Tanzil Project',
    href: 'https://tanzil.net',
  },
  { label: 'English translation', value: 'Saheeh International' },
  { label: 'Bangla translation', value: 'Muhiuddin Khan' },
  {
    label: 'Verse-by-verse audio',
    value: 'Islamic Network CDN',
    href: 'https://islamic.network',
  },
]

export function AboutPage() {
  useSeo(
    'About',
    'QalbiQuran is a calm, ad-free Qur’an companion — our intention, what we offer, sources and attribution, and our privacy commitment.',
  )

  return (
    <>
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="pointer-events-none absolute inset-0 pattern-islamic opacity-[0.35]" />
        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 sm:py-24 lg:px-8">
          <p className="font-arabic text-2xl text-gold sm:text-3xl" dir="rtl">
            وَرَتِّلِ ٱلْقُرْآنَ تَرْتِيلًا
          </p>
          <p className="mt-4 text-sm italic text-muted-foreground">
            “And recite the Qur’an with measured recitation.” — Al-Muzzammil 73:4
          </p>

          <h1 className="mt-8 text-4xl font-bold tracking-tight sm:text-5xl">About QalbiQuran</h1>
          <p className="mx-auto mt-5 max-w-2xl text-balance text-muted-foreground sm:text-lg">
            A calm, ad-free Qur’an companion built to help you build a lifelong habit of reading,
            listening and reflecting — one ayah at a time.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border/70 bg-card p-6 sm:p-10">
          <h2 className="text-2xl font-semibold tracking-tight">Our intention</h2>
          <div className="mt-4 space-y-4 text-muted-foreground">
            <p>
              QalbiQuran — “the heart of the Qur’an” — began with a simple wish: to make daily
              recitation feel natural and rewarding. The Qur’an is a lifelong companion, and the
              small, steady habit matters far more than the occasional effort.
            </p>
            <p>
              So we kept it simple. Read a page, listen to a reciter, save a thought. Over time,
              those small moments become a relationship with the Book of Allah. The application is
              a tool — the connection is yours.
            </p>
            <p className="text-foreground">
              The original Arabic text is never altered. Translations are shown alongside it as an
              aid, never as a replacement.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
          What you’ll find here
        </h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {values.map((value) => (
            <div
              key={value.title}
              className="rounded-2xl border border-border/70 bg-card p-6 transition-colors hover:border-gold/50"
            >
              <span className="grid size-11 place-items-center rounded-xl bg-secondary text-primary">
                {value.icon}
              </span>
              <h3 className="mt-4 font-semibold">{value.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{value.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border/70 bg-card p-6 sm:p-8">
          <h2 className="text-xl font-semibold tracking-tight">Sources & attribution</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            We are grateful to the projects whose work makes this possible.
          </p>
          <dl className="mt-6 divide-y divide-border">
            {sources.map((source) => (
              <div key={source.label} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <dt className="text-sm text-muted-foreground">{source.label}</dt>
                <dd className="text-sm font-medium">
                  {source.href ? (
                    <a
                      href={source.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-primary hover:underline"
                    >
                      {source.value}
                    </a>
                  ) : (
                    source.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="privacy" className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border/70 bg-card p-6 sm:p-8">
          <h2 className="text-2xl font-bold tracking-tight">Privacy &amp; your data</h2>
          <p className="mt-4 text-muted-foreground">
            You can read the Qur’an without an account. Creating one is optional and only used to
            save your goals, progress, bookmarks, notes and friendships across devices.
          </p>
          <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald" />
              We never sell your personal data, and we do not use advertising trackers.
            </li>
            <li className="flex gap-3">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald" />
              Your email is used only for signing in and account recovery.
            </li>
            <li className="flex gap-3">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald" />
              Your notes and reflections are private to you.
            </li>
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-card p-10 text-center sm:p-16">
          <div className="pointer-events-none absolute inset-0 pattern-islamic opacity-25" />
          <div className="relative">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Begin where you are
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Whether it’s a single ayah or a full khatmah, every step counts.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/quran" className={buttonVariants({ size: 'lg', variant: 'gold' })}>
                Start reading
              </Link>
              <Link to="/contact" className={cn(buttonVariants({ size: 'lg', variant: 'outline' }))}>
                Contact us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
