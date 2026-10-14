import type { ComponentType } from 'react'
import { cn } from '@/lib/utils'

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = 'primary',
}: {
  label: string
  value: string | number
  hint?: string
  icon?: ComponentType<{ className?: string }>
  accent?: 'primary' | 'gold'
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        {Icon && <Icon className={cn('size-4', accent === 'gold' ? 'text-gold' : 'text-primary')} />}
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}
