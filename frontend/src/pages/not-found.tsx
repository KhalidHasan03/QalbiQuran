import { Link } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button-variants'
import { useSeo } from '@/lib/seo'
import { cn } from '@/lib/utils'

export function NotFoundPage() {
  useSeo('Page not found')

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-32 text-center">
      <p className="font-arabic text-6xl text-gold" dir="rtl">
        ٤٠٤
      </p>
      <h1 className="mt-6 text-3xl font-bold">Page not found</h1>
      <p className="mt-2 text-muted-foreground">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <Link to="/" className={cn(buttonVariants({ variant: 'gold' }), 'mt-8')}>
        Back home
      </Link>
    </div>
  )
}
