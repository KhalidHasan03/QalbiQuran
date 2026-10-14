import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/components/auth/auth-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { apiErrorMessage } from '@/lib/api'
import { adminRedirectTarget } from '@/lib/auth'
import { useSeo } from '@/lib/seo'
import { useAuth } from '@/store/auth'

export function RegisterPage() {
  useSeo(
    'Create account',
    'Create a free QalbiQuran account to track reading streaks, set daily goals and save bookmarks and notes across devices.',
  )

  const register = useAuth((s) => s.register)
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    password_confirmation: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const user = await register(form)
      const adminUrl = adminRedirectTarget(user)
      if (adminUrl) {
        window.location.assign(adminUrl)
        return
      }
      navigate('/portal', { replace: true })
    } catch (err) {
      setError(apiErrorMessage(err, 'Unable to create your account.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Begin your journey"
      subtitle="Create a free account and start reading today."
      footer={
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" required value={form.name} onChange={(e) => update('name', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            required
            value={form.username}
            onChange={(e) => update('username', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password_confirmation">Confirm</Label>
            <Input
              id="password_confirmation"
              type="password"
              autoComplete="new-password"
              required
              value={form.password_confirmation}
              onChange={(e) => update('password_confirmation', e.target.value)}
            />
          </div>
        </div>

        {error && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
        )}

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? <Spinner className="text-primary-foreground" /> : null}
          Create account
        </Button>
      </form>
    </AuthLayout>
  )
}
