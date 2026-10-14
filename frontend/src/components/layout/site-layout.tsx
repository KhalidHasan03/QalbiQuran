import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { SiteFooter } from '@/components/layout/site-footer'
import { SiteHeader } from '@/components/layout/site-header'
import { FullPageSpinner } from '@/components/ui/spinner'
import { useRouteFocus } from '@/lib/use-route-focus'

export function SiteLayout() {
  useRouteFocus()

  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        <Suspense fallback={<FullPageSpinner />}>
          <Outlet />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  )
}
