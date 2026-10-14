import { Mail, MailCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AuthLayout } from '@/components/auth/auth-layout'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { apiErrorMessage } from '@/lib/api'
import { authApi } from '@/lib/auth'
import { useSeo } from '@/lib/seo'
import { useAuth } from '@/store/auth'

export function VerifyEmailPage() {
  useSeo(
    'Verify your email',
    'Confirm your email address to unlock your QalbiQuran reading streak and progress.',
  )

  const user = useAuth((s) => s.user)
  const setUser = useAuth((s) => s.setUser)
  const [params] = useSearchParams()
  const verified = params.get('verified') === '1'
  const invalid = params.get('verified') === '0'

  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (verified && user && !user.email_verified) {
      setUser({ ...user, email_verified: true })
    }
  }, [verified, user, setUser])

  async function resend() {
    setState('sending')
    setMessage(null)
    try {
      const result = await authApi.resendVerification()
      setState('sent')
      setMessage(result.message)
    } catch (err) {
      setState('error')
      setMessage(apiErrorMessage(err, 'Unable to resend the verification email.'))
    }
  }

  const alreadyVerified = verified || Boolean(user?.email_verified)

  return (
    <AuthLayout
      title="Verify your email"
      subtitle="Confirm your email address to unlock your reading streak and progress."
      footer={
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link to={user ? '/portal' : '/login'} className="font-medium text-primary hover:underline">
            {user ? 'Go to dashboard' : 'Back to sign in'}
          </Link>
        </p>
      }
    >
      <div className="space-y-4 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
          {alreadyVerified ? <MailCheck className="size-6" /> : <Mail className="size-6" />}
        </span>

        {alreadyVerified ? (
          <p className="rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">
            Your email is verified. Jazakallahu khairan!
          </p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              {invalid
                ? 'This verification link is invalid or has expired. Request a new one below.'
                : user
                  ? 'We sent a verification link to your email address. Open it to confirm your account.'
                  : 'Open the verification link we emailed you to confirm your account.'}
            </p>

            {user && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={resend}
                disabled={state === 'sending'}
              >
                {state === 'sending' ? <Spinner className="size-4" /> : <Mail className="size-4" />}
                Resend verification email
              </Button>
            )}

            {message && (
              <p
                className={
                  state === 'error'
                    ? 'rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive'
                    : 'rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary'
                }
              >
                {message}
              </p>
            )}
          </>
        )}
      </div>
    </AuthLayout>
  )
}
