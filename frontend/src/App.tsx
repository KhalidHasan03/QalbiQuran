import { useEffect, useRef } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { SiteLayout } from '@/components/layout/site-layout'
import { PortalLayout } from '@/components/portal/portal-layout'
import { lazyPage } from '@/lib/lazy'
import { useAuth } from '@/store/auth'

const HomePage = lazyPage(() => import('@/pages/home'), 'HomePage')
const AboutPage = lazyPage(() => import('@/pages/about'), 'AboutPage')
const ContactPage = lazyPage(() => import('@/pages/contact'), 'ContactPage')
const NotFoundPage = lazyPage(() => import('@/pages/not-found'), 'NotFoundPage')
const LoginPage = lazyPage(() => import('@/pages/auth/login'), 'LoginPage')
const RegisterPage = lazyPage(() => import('@/pages/auth/register'), 'RegisterPage')
const ForgotPasswordPage = lazyPage(() => import('@/pages/auth/forgot-password'), 'ForgotPasswordPage')
const ResetPasswordPage = lazyPage(() => import('@/pages/auth/reset-password'), 'ResetPasswordPage')
const VerifyEmailPage = lazyPage(() => import('@/pages/auth/verify-email'), 'VerifyEmailPage')
const QuranIndexPage = lazyPage(() => import('@/pages/quran'), 'QuranIndexPage')
const QuranSearchPage = lazyPage(() => import('@/pages/quran/search'), 'QuranSearchPage')
const QuranShowPage = lazyPage(() => import('@/pages/quran/show'), 'QuranShowPage')
const DashboardPage = lazyPage(() => import('@/pages/portal/dashboard'), 'DashboardPage')
const AchievementsPage = lazyPage(() => import('@/pages/portal/achievements'), 'AchievementsPage')
const BookmarksPage = lazyPage(() => import('@/pages/portal/bookmarks'), 'BookmarksPage')
const FriendsPage = lazyPage(() => import('@/pages/portal/friends'), 'FriendsPage')
const LeaderboardPage = lazyPage(() => import('@/pages/portal/leaderboard'), 'LeaderboardPage')
const NotesPage = lazyPage(() => import('@/pages/portal/notes'), 'NotesPage')
const ProgressPage = lazyPage(() => import('@/pages/portal/progress'), 'ProgressPage')
const SettingsPage = lazyPage(() => import('@/pages/portal/settings'), 'SettingsPage')

export function App() {
  const bootstrap = useAuth((s) => s.bootstrap)
  const setUser = useAuth((s) => s.setUser)
  const navigate = useNavigate()
  const bootstrapped = useRef(false)

  useEffect(() => {
    if (bootstrapped.current) return
    bootstrapped.current = true
    void bootstrap()
  }, [bootstrap])

  useEffect(() => {
    function onUnauthorized() {
      if (useAuth.getState().user) {
        setUser(null)
      }
      if (window.location.pathname !== '/login') {
        navigate('/login', { state: { from: window.location.pathname } })
      }
    }

    window.addEventListener('qalbiquran:unauthorized', onUnauthorized)
    return () => window.removeEventListener('qalbiquran:unauthorized', onUnauthorized)
  }, [navigate, setUser])

  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<HomePage />} />
        <Route path="quran" element={<QuranIndexPage />} />
        <Route path="quran/search" element={<QuranSearchPage />} />
        <Route path="quran/:number" element={<QuranShowPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
        <Route path="verify-email" element={<VerifyEmailPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="portal" element={<PortalLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="progress" element={<ProgressPage />} />
            <Route path="bookmarks" element={<BookmarksPage />} />
            <Route path="notes" element={<NotesPage />} />
            <Route path="achievements" element={<AchievementsPage />} />
            <Route path="leaderboard" element={<LeaderboardPage />} />
            <Route path="friends" element={<FriendsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
