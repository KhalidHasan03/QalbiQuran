import { BookOpen } from 'lucide-react'
import { Link } from 'react-router-dom'

const currentYear = new Date().getFullYear()

const exploreLinks = [
  { to: '/quran', label: "The Qur'an" },
  { to: '/quran/search', label: 'Search' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

const accountLinks = [
  { to: '/login', label: 'Sign in' },
  { to: '/register', label: 'Create account' },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-card/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <BookOpen className="size-5" />
            </span>
            <span className="font-semibold tracking-tight">
              Qalbi<span className="text-gold">Quran</span>
            </span>
          </Link>
          <p className="mt-4 max-w-md text-sm text-muted-foreground">
            Read, listen and reflect in Arabic, English and Bangla. Track your daily streaks, set
            reading goals, and deepen your connection — one ayah at a time.
          </p>
        </div>

        <nav aria-label="Footer">
          <h2 className="text-sm font-semibold">Explore</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {exploreLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="transition-colors hover:text-foreground">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-semibold">Account</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {accountLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="transition-colors hover:text-foreground">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>© {currentYear} QalbiQuran. All rights reserved.</p>
          <p>Qur&apos;anic text and translations are unaltered from their sources.</p>
        </div>
      </div>
    </footer>
  )
}
