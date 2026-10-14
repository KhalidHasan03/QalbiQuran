import { BookOpen, LayoutDashboard, LogOut, Menu, Settings, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { buttonVariants } from '@/components/ui/button-variants'
import { cn } from '@/lib/utils'
import { useAuth } from '@/store/auth'

const links = [
  { to: '/', label: 'Home' },
  { to: '/quran', label: "Qur'an" },
  { to: '/quran/search', label: 'Search' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

function linkClasses({ isActive }: { isActive: boolean }) {
  return cn(
    'rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
    isActive && 'text-foreground',
  )
}

function UserMenu() {
  const user = useAuth((s) => s.user)
  const logout = useAuth((s) => s.logout)
  const [open, setOpen] = useState(false)

  if (!user) return null

  const initials = user.name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors hover:bg-secondary"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="grid size-8 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          {initials}
        </span>
        <span className="hidden max-w-28 truncate sm:inline">{user.name.split(' ')[0]}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-lg">
            <div className="px-3 py-2">
              <p className="truncate text-sm font-medium">{user.name}</p>
              {user.username && (
                <p className="truncate text-xs text-muted-foreground">@{user.username}</p>
              )}
            </div>
            <div className="my-1 h-px bg-border" />
            <Link
              to="/portal"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-secondary"
            >
              <LayoutDashboard className="size-4" />
              Dashboard
            </Link>
            <Link
              to="/portal/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-secondary"
            >
              <Settings className="size-4" />
              Settings
            </Link>
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                void logout()
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-destructive transition-colors hover:bg-destructive/10"
            >
              <LogOut className="size-4" />
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function MobileNav({
  open,
  onClose,
  returnFocusRef,
}: {
  open: boolean
  onClose: () => void
  returnFocusRef: RefObject<HTMLButtonElement | null>
}) {
  const user = useAuth((s) => s.user)
  const logout = useAuth((s) => s.logout)

  useEffect(() => {
    if (!open) return

    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
        returnFocusRef.current?.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [open, onClose, returnFocusRef])

  if (!open) return null

  return (
    <div id="mobile-nav" className="md:hidden">
      <div
        className="fixed inset-0 top-16 z-40 bg-background/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <nav
        aria-label="Mobile"
        className="absolute inset-x-0 top-16 z-50 max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-border/60 bg-popover shadow-lg"
      >
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
          <div className="space-y-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/' || link.to === '/quran'}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-secondary text-foreground'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="my-3 h-px bg-border" />

          {user ? (
            <div className="space-y-1 pb-1">
              <Link
                to="/portal"
                onClick={onClose}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <LayoutDashboard className="size-4" />
                Dashboard
              </Link>
              <Link
                to="/portal/settings"
                onClick={onClose}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <Settings className="size-4" />
                Settings
              </Link>
              <button
                type="button"
                onClick={() => {
                  onClose()
                  void logout()
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
              >
                <LogOut className="size-4" />
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pb-1">
              <Link
                to="/login"
                onClick={onClose}
                className={cn(buttonVariants({ variant: 'outline' }), 'justify-center')}
              >
                Sign in
              </Link>
              <Link
                to="/register"
                onClick={onClose}
                className={cn(buttonVariants({ variant: 'gold' }), 'justify-center')}
              >
                Create free account
              </Link>
            </div>
          )}
        </div>
      </nav>
    </div>
  )
}

export function SiteHeader() {
  const user = useAuth((s) => s.user)
  const [menuOpen, setMenuOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const closeMenu = useCallback(() => setMenuOpen(false), [])

  return (
    <header className="glass sticky top-0 z-50 w-full border-b border-border/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2" onClick={closeMenu}>
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <BookOpen className="size-5" />
          </span>
          <span className="font-semibold tracking-tight">
            Qalbi<span className="text-gold">Quran</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/' || link.to === '/quran'}
              className={linkClasses}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <UserMenu />
            ) : (
              <>
                <Link to="/login" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
                  Sign in
                </Link>
                <Link to="/register" className={buttonVariants({ variant: 'gold', size: 'sm' })}>
                  Get started
                </Link>
              </>
            )}
          </div>

          <button
            ref={toggleRef}
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:hidden"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <MobileNav open={menuOpen} onClose={closeMenu} returnFocusRef={toggleRef} />
    </header>
  )
}
