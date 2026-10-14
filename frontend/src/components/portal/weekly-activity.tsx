import { cn } from '@/lib/utils'
import type { DayActivity } from '@/types/portal'

export function WeeklyActivity({ days }: { days: DayActivity[] }) {
  const max = Math.max(1, ...days.map((d) => d.ayahs))

  return (
    <div className="flex items-end justify-between gap-2">
      {days.map((day) => {
        const height = day.ayahs === 0 ? 4 : Math.max(8, (day.ayahs / max) * 100)
        return (
          <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-28 w-full items-end justify-center">
              <div
                className={cn(
                  'w-full max-w-8 rounded-t-md transition-all',
                  day.goal_met ? 'bg-gold' : day.ayahs > 0 ? 'bg-primary/60' : 'bg-secondary',
                )}
                style={{ height: `${height}%` }}
                title={`${day.ayahs} ayahs`}
              />
            </div>
            <span className="text-[11px] font-medium text-muted-foreground">{day.label}</span>
          </div>
        )
      })}
    </div>
  )
}
