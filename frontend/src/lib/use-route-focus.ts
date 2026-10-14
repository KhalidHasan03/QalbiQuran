import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Moves focus to the main landmark whenever the route changes so keyboard and
 * screen-reader users land on the new content instead of the top of the page.
 */
export function useRouteFocus(targetId = 'main-content') {
  const { pathname } = useLocation()

  useEffect(() => {
    const target = document.getElementById(targetId)
    if (target && document.activeElement !== target) {
      target.focus({ preventScroll: true })
    }
  }, [pathname, targetId])
}
