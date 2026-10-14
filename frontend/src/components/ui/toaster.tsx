import { CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToasts } from '@/store/toasts'

const icons = {
  default: Info,
  success: CheckCircle2,
  error: XCircle,
}

export function Toaster() {
  const { toasts, dismiss } = useToasts()

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[200] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((t) => {
        const Icon = icons[t.variant]
        return (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto flex items-start gap-3 rounded-xl border border-border bg-popover p-4 shadow-lg animate-in slide-in-from-bottom-2',
              t.variant === 'success' && 'border-emerald/30',
              t.variant === 'error' && 'border-destructive/40',
            )}
          >
            <Icon
              className={cn(
                'mt-0.5 size-5 shrink-0',
                t.variant === 'success' && 'text-emerald',
                t.variant === 'error' && 'text-destructive',
                t.variant === 'default' && 'text-primary',
              )}
            />
            <div className="flex-1">
              <p className="text-sm font-medium">{t.title}</p>
              {t.description && <p className="mt-0.5 text-xs text-muted-foreground">{t.description}</p>}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Dismiss"
            >
              <X className="size-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
