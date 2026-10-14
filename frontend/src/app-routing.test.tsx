import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/auth')>()
  return {
    ...actual,
    authApi: {
      me: vi.fn().mockRejectedValue({ isAxiosError: true, response: { status: 401 } }),
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    },
  }
})

import App from './App'

describe('App routing', () => {
  it('renders the login page through the real app shell', async () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>,
    )
    expect(await screen.findByRole('heading', { name: /welcome back/i })).toBeInTheDocument()
  })

  it('renders the register page through the real app shell', async () => {
    render(
      <MemoryRouter initialEntries={['/register']}>
        <App />
      </MemoryRouter>,
    )
    expect(await screen.findByRole('heading', { name: /begin your journey/i })).toBeInTheDocument()
  })
})
