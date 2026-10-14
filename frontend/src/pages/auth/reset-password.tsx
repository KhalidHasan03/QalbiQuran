import { ShieldCheck } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AuthLayout } from '@/components/auth/auth-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { apiErrorMessage } from '@/lib/api'
import { authApi } from '@/lib/auth'
import { useSeo } from '@/lib/seo'

export function ResetPasswordPage() {
  useSeo('Choose a new password', 'Set a new password for your QalbiQuran account.')

  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const email = params.get('email') ?? ''

  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await authApi.resetPassword({
        token,
        email,
        password,
        password_confirmation: confirmation,
      })
      setDone(true)
    } catch (err) {
      setError(apiErrorMessage(err, 'Unable to reset your password.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Choose a new password"
      subtitle="Pick a strong password you don’t use anywhere else."
      footer={
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link to="/login" className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      }
    >
      {!token || !email ? (
        <p className="rounded-lg bg-destructive/10 px-3 py-3 text-center text-sm text-destructive">
          This reset link is invalid or incomplete. Please request a new one from the{' '}
          <Link to="/forgot-password" className="font-medium underline">
            forgot password
          </Link>{' '}
          page.
        </p>
      ) : done ? (
        <div className="space-y-4 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
            <ShieldCheck className="size-6" />
          </span>
          <p className="text-sm text-muted-foreground">
            Your password has been updated. You can now sign in with your new password.
          </p>
          <Link to="/login" className="inline-block font-medium text-primary hover:underline">
            Go to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <input type="hidden" name="email" value={email} readOnly />

          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password_confirmation">Confirm new password</Label>
            <Input
              id="password_confirmation"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
            />
          </div>

          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting && <Spinner className="size-4 text-primary-foreground" />}
            Update password
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}
