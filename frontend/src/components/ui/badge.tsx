import type * as React from 'react'
import { cn } from '@/lib/utils'
import { badgeVariants } from '@/components/ui/badge-variants'
import type { VariantProps } from 'class-variance-authority'

export interface BadgeProps
  extends React.ComponentProps<'span'>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
