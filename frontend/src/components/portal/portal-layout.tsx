import {
  Bookmark,
  LayoutDashboard,
  ListOrdered,
  NotebookPen,
  Settings,
  TrendingUp,
  Trophy,
  Users,
} from 'lucide-react'
import { Suspense } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { FullPageSpinner } from '@/components/ui/spinner'
import { useSeo } from '@/lib/seo'
import { cn } from '@/lib/utils'
import { useAuth } from '@/store/auth'

const nav = [
  { to: '/portal', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/portal/progress', label: 'Progress', icon: TrendingUp },
  { to: '/portal/bookmarks', label: 'Bookmarks', icon: Bookmark },
  { to: '/portal/notes', label: 'Notes', icon: NotebookPen },
  { to: '/portal/achievements', label: 'Achievements', icon: Trophy },
  { to: '/portal/leaderboard', label: 'Leaderboard', icon: ListOrdered },
  { to: '/portal/friends', label: 'Friends', icon: Users },
  { to: '/portal/settings', label: 'Settings', icon: Settings },
]

export function PortalLayout() {
  const user = useAuth((s) => s.user)

  return (
    <div className="mx-auto flex max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <aside className="hidden w-56 shrink-0 lg:block">
        <nav className="sticky top-24 space-y-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                )
              }
            >
              <item.icon className="size-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="mb-6 flex gap-1 overflow-x-auto pb-1 lg:hidden">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                  isActive ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground',
                )
              }
            >
              <item.icon className="size-3.5" />
              {item.label}
            </NavLink>
          ))}
        </div>

        {user && !user.email_verified && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm">
            <span>Please verify your email address to secure your account.</span>
            <Link to="/verify-email" className="font-medium text-gold hover:underline">
              Verify now
            </Link>
          </div>
        )}

        <Suspense fallback={<FullPageSpinner />}>
          <Outlet />
        </Suspense>
      </div>
    </div>
  )
}

export function PortalHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  useSeo(title)
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  )
}
