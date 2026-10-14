import { describe, expect, it } from 'vitest'
import { adminRedirectTarget } from './auth'
import type { User } from '@/types/auth'

function makeUser(overrides: Partial<User>): User {
  return {
    id: 1,
    name: 'Test',
    username: 'test',
    email: 'test@example.com',
    email_verified: true,
    timezone: 'UTC',
    is_admin: false,
    admin_url: null,
    ...overrides,
  }
}

describe('adminRedirectTarget', () => {
  it('returns the admin URL for administrators', () => {
    const target = adminRedirectTarget(
      makeUser({ is_admin: true, admin_url: 'http://localhost:8000/admin' }),
    )
    expect(target).toBe('http://localhost:8000/admin')
  })

  it('returns null for regular students', () => {
    expect(adminRedirectTarget(makeUser({ is_admin: false, admin_url: null }))).toBeNull()
  })

  it('returns null when the admin URL is missing', () => {
    expect(adminRedirectTarget(makeUser({ is_admin: true, admin_url: null }))).toBeNull()
  })
})
