import Link from 'next/link'
import { type ComponentProps } from 'react'
import { buttonVariants } from './button'
import { cn } from '@/lib/utils'
import type { VariantProps } from 'class-variance-authority'

type LinkButtonProps = ComponentProps<typeof Link> & VariantProps<typeof buttonVariants>

/** A Next.js Link styled as a shadcn Button. Use instead of `<Button asChild><Link>`. */
export function LinkButton({ className, variant, size, ...props }: LinkButtonProps) {
  return (
    <Link
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}
