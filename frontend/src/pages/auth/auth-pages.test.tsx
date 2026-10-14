import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { User } from '@/types/auth'

const login = vi.fn()
const register = vi.fn()

vi.mock('@/lib/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/auth')>()
  return {
    ...actual,
    authApi: {
      login: (...args: unknown[]) => login(...args),
      register: (...args: unknown[]) => register(...args),
    },
  }
})

import { useAuth } from '@/store/auth'
import { LoginPage } from './login'
import { RegisterPage } from './register'
import { VerifyEmailPage } from './verify-email'

const user: User = {
  id: 1,
  name: 'Aisha',
  username: 'aisha',
  email: 'aisha@example.com',
  email_verified: false,
  timezone: 'UTC',
  is_admin: false,
  admin_url: null,
}

function renderRoute(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/portal" element={<div>Portal dashboard</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  login.mockReset()
  register.mockReset()
  useAuth.setState({ user: null, initialized: true, loading: false })
})

describe('LoginPage', () => {
  it('signs in and redirects to the portal', async () => {
    login.mockResolvedValueOnce(user)
    renderRoute('/login')

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'aisha@example.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret-password' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => expect(screen.getByText('Portal dashboard')).toBeInTheDocument())
    expect(login).toHaveBeenCalledWith({ email: 'aisha@example.com', password: 'secret-password' })
  })

  it('shows an error message when sign in fails', async () => {
    login.mockRejectedValueOnce({ isAxiosError: true, response: { data: { message: 'Bad credentials' } } })
    renderRoute('/login')

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'aisha@example.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => expect(screen.getByText('Bad credentials')).toBeInTheDocument())
  })
})

describe('RegisterPage', () => {
  it('creates an account and redirects to the portal', async () => {
    register.mockResolvedValueOnce(user)
    renderRoute('/register')

    fireEvent.change(screen.getByLabelText('Full name'), { target: { value: 'Aisha' } })
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'aisha' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'aisha@example.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret-password' } })
    fireEvent.change(screen.getByLabelText('Confirm'), { target: { value: 'secret-password' } })
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => expect(screen.getByText('Portal dashboard')).toBeInTheDocument())
  })
})

describe('VerifyEmailPage', () => {
  it('confirms the email when the link reports success', () => {
    renderRoute('/verify-email?verified=1')

    expect(screen.getByText(/your email is verified/i)).toBeInTheDocument()
  })

  it('explains when the verification link is invalid or expired', () => {
    renderRoute('/verify-email?verified=0')

    expect(screen.getByText(/invalid or has expired/i)).toBeInTheDocument()
  })
})
