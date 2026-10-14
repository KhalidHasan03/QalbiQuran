import type { ButtonHTMLAttributes } from 'react'
import {
  buttonVariants,
  type ButtonVariantProps,
} from '@/components/ui/button-variants'
import { cn } from '@/lib/utils'

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariantProps {}

export function Button({
  className,
  variant,
  size,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}
