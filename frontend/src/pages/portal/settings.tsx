import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BadgeCheck, Loader2, LogOut } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { PortalHeading } from '@/components/portal/portal-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { apiErrorMessage } from '@/lib/api'
import { authApi } from '@/lib/auth'
import { portalApi } from '@/lib/portal'
import { cn } from '@/lib/utils'
import { useAuth } from '@/store/auth'
import { toast } from '@/store/toasts'
import type { User } from '@/types/auth'
import type { Goal } from '@/types/portal'

export function SettingsPage() {
  const user = useAuth((s) => s.user)
  const logout = useAuth((s) => s.logout)
  const navigate = useNavigate()

  const { data: goal, isPending } = useQuery({ queryKey: ['goal'], queryFn: portalApi.goal })

  return (
    <div>
      <PortalHeading title="Settings" subtitle="Customise your reading experience." />

      <div className="space-y-6">
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-medium">Daily reading goal</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Set a target for each day. Your streak is based on reading at least once daily.
          </p>
          <div className="mt-4">
            {isPending ? <Spinner /> : goal ? <GoalForm goal={goal} /> : null}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">Profile</h2>
            {user?.email_verified ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald">
                <BadgeCheck className="size-3.5" /> Email verified
              </span>
            ) : (
              <Link to="/verify-email" className="text-xs font-medium text-gold hover:underline">
                Verify your email
              </Link>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Update your name, username, email address and timezone.
          </p>
          <div className="mt-4">{user ? <ProfileForm user={user} /> : null}</div>
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-medium">Password</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Choose a strong password you don’t use anywhere else.
          </p>
          <div className="mt-4">
            <PasswordForm />
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-medium">Appearance</h2>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Theme</p>
            <ThemeToggle />
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-medium">Session</h2>
          <Button
            variant="outline"
            className="mt-4 text-destructive"
            onClick={async () => {
              await logout()
              navigate('/')
            }}
          >
            <LogOut className="size-4" />
            Sign out
          </Button>
        </section>
      </div>
    </div>
  )
}

function ProfileForm({ user }: { user: User }) {
  const setUser = useAuth((s) => s.setUser)
  const [name, setName] = useState(user.name)
  const [username, setUsername] = useState(user.username ?? '')
  const [email, setEmail] = useState(user.email)
  const [timezone, setTimezone] = useState(user.timezone ?? 'UTC')

  const save = useMutation({
    mutationFn: () => authApi.updateProfile({ name, username, email, timezone }),
    onSuccess: (updated) => {
      setUser(updated)
      toast.success('Profile updated')
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  })

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    save.mutate()
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input id="username" required value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Input
            id="timezone"
            placeholder="e.g. Europe/London"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Changing your email will require verifying the new address again.
      </p>
      <Button type="submit" disabled={save.isPending}>
        {save.isPending ? <Loader2 className="animate-spin" /> : null}
        Save profile
      </Button>
    </form>
  )
}

function PasswordForm() {
  const [current, setCurrent] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')

  const save = useMutation({
    mutationFn: () =>
      authApi.updatePassword({
        current_password: current,
        password,
        password_confirmation: confirmation,
      }),
    onSuccess: (result) => {
      toast.success(result.message)
      setCurrent('')
      setPassword('')
      setConfirmation('')
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  })

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (password !== confirmation) {
      toast.error('Passwords do not match.')
      return
    }
    save.mutate()
  }

  return (
    <form className="max-w-md space-y-4" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="current_password">Current password</Label>
        <Input
          id="current_password"
          type="password"
          autoComplete="current-password"
          required
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="new_password">New password</Label>
        <Input
          id="new_password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm_password">Confirm new password</Label>
        <Input
          id="confirm_password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
        />
      </div>
      {confirmation.length > 0 && password !== confirmation && (
        <p className="text-xs text-destructive">Passwords do not match.</p>
      )}
      <Button type="submit" disabled={save.isPending || password !== confirmation}>
        {save.isPending ? <Loader2 className="animate-spin" /> : null}
        Update password
      </Button>
    </form>
  )
}

function GoalForm({ goal }: { goal: Goal }) {
  const qc = useQueryClient()
  const [type, setType] = useState<'minutes' | 'ayahs'>(goal.type)
  const [target, setTarget] = useState(goal.target)

  const save = useMutation({
    mutationFn: () => portalApi.updateGoal({ type, target }),
    onSuccess: () => {
      toast.success('Goal updated')
      void qc.invalidateQueries({ queryKey: ['goal'] })
      void qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  })

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        save.mutate()
      }}
    >
      <div className="flex gap-1 rounded-lg bg-secondary p-1 sm:w-64">
        {(['minutes', 'ayahs'] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setType(value)}
            className={cn(
              'flex-1 rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors',
              type === value
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {value}
          </button>
        ))}
      </div>
      <div className="max-w-xs space-y-2">
        <Label htmlFor="target">Daily target ({type})</Label>
        <Input
          id="target"
          type="number"
          min={1}
          max={100000}
          value={target}
          onChange={(e) => setTarget(Number(e.target.value))}
        />
      </div>
      <Button type="submit" disabled={save.isPending || target < 1}>
        {save.isPending ? <Loader2 className="animate-spin" /> : null}
        Save goal
      </Button>
    </form>
  )
}
