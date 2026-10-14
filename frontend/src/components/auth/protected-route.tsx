import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { FullPageSpinner } from '@/components/ui/spinner'
import { useAuth } from '@/store/auth'

export function ProtectedRoute() {
  const { user, loading, initialized } = useAuth()
  const location = useLocation()

  if (!initialized || loading) {
    return <FullPageSpinner />
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
