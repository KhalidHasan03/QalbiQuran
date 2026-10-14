import { useMutation } from '@tanstack/react-query'
import { Loader2, Mail, MessageSquare, Send } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { apiErrorMessage } from '@/lib/api'
import { contactApi } from '@/lib/contact'
import { useSeo } from '@/lib/seo'
import { toast } from '@/store/toasts'

type Field = 'name' | 'email' | 'subject' | 'message'
type Errors = Partial<Record<Field, string>>

const emptyForm: Record<Field, string> = { name: '', email: '', subject: '', message: '' }

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const reasons = [
  'Share feedback or suggest a feature',
  'Report a bug or a problem with the site',
  'Flag a translation or text correction',
  'Say salaam — we love hearing from you',
]

export function ContactPage() {
  useSeo(
    'Contact',
    'Questions, feedback or a correction to report? Send the QalbiQuran team a message and we’ll get back to you as soon as we can.',
  )

  const [values, setValues] = useState<Record<Field, string>>(emptyForm)
  const [errors, setErrors] = useState<Errors>({})

  const send = useMutation({
    mutationFn: contactApi.send,
    onSuccess: (result) => {
      toast.success(result.message)
      setValues(emptyForm)
      setErrors({})
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  })

  function setField(field: Field, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev))
  }

  function validate(): boolean {
    const next: Errors = {}
    if (!values.name.trim()) next.name = 'Please enter your name.'
    if (!values.email.trim()) next.email = 'Please enter your email address.'
    else if (!emailPattern.test(values.email.trim())) next.email = 'Please enter a valid email address.'
    if (!values.message.trim()) next.message = 'Please enter a message.'
    else if (values.message.trim().length < 10) next.message = 'Please write at least 10 characters.'

    setErrors(next)
    return Object.keys(next).length === 0
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!validate()) return
    send.mutate({
      name: values.name.trim(),
      email: values.email.trim(),
      subject: values.subject.trim() || undefined,
      message: values.message.trim(),
    })
  }

  return (
    <>
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="pointer-events-none absolute inset-0 pattern-islamic opacity-[0.35]" />
        <div className="relative mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
            <Mail className="size-3.5" /> We’d love to hear from you
          </span>
          <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">Contact us</h1>
          <p className="mx-auto mt-4 max-w-2xl text-balance text-muted-foreground sm:text-lg">
            Questions, feedback, or a correction to report? Send us a message and we’ll get back to
            you as soon as we can.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-border/70 bg-card p-6 sm:p-8">
              <span className="grid size-11 place-items-center rounded-xl bg-secondary text-primary">
                <MessageSquare className="size-5" />
              </span>
              <h2 className="mt-4 text-lg font-semibold">How can we help?</h2>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                {reasons.map((reason) => (
                  <li key={reason} className="flex gap-3">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-gold" aria-hidden="true" />
                    {reason}
                  </li>
                ))}
              </ul>
              <p className="mt-6 rounded-lg bg-secondary px-3 py-2 text-xs text-secondary-foreground">
                We usually reply within a few days. Your message is stored securely and never shared.
              </p>
            </div>
          </div>

          <div className="lg:col-span-3">
            <form
              onSubmit={onSubmit}
              noValidate
              className="rounded-2xl border border-border/70 bg-card p-6 sm:p-8"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    autoComplete="name"
                    value={values.name}
                    onChange={(event) => setField('name', event.target.value)}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                  />
                  {errors.name && (
                    <p id="name-error" className="text-xs text-destructive">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={values.email}
                    onChange={(event) => setField('email', event.target.value)}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                  />
                  {errors.email && (
                    <p id="email-error" className="text-xs text-destructive">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <Label htmlFor="subject">
                  Subject <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="subject"
                  name="subject"
                  value={values.subject}
                  onChange={(event) => setField('subject', event.target.value)}
                />
              </div>

              <div className="mt-5 space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  rows={6}
                  value={values.message}
                  onChange={(event) => setField('message', event.target.value)}
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={errors.message ? 'message-error' : undefined}
                />
                {errors.message && (
                  <p id="message-error" className="text-xs text-destructive">
                    {errors.message}
                  </p>
                )}
              </div>

              <div className="mt-6 flex items-center gap-3">
                <Button type="submit" variant="gold" disabled={send.isPending}>
                  {send.isPending ? <Loader2 className="animate-spin" /> : <Send className="size-4" />}
                  Send message
                </Button>
                {send.isSuccess && (
                  <span className="text-sm text-muted-foreground">Jazakallahu khairan!</span>
                )}
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  )
}
