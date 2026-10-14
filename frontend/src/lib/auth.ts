import { api, ensureCsrf, resetCsrf } from './api'
import type { Credentials, PasswordPayload, ProfilePayload, RegisterPayload, User } from '@/types/auth'

/**
 * Admins finish authentication in the Filament admin panel, everyone else
 * continues into the student portal. Returns the admin panel URL when the
 * signed-in user is an administrator.
 */
export function adminRedirectTarget(user: User): string | null {
  return user.is_admin && user.admin_url ? user.admin_url : null
}

export const authApi = {
  async me(): Promise<User> {
    const { data } = await api.get<{ data: User }>('/auth/user')
    return data.data
  },

  async register(payload: RegisterPayload): Promise<User> {
    await ensureCsrf()
    const { data } = await api.post<{ data: User }>('/auth/register', payload)
    resetCsrf()
    return data.data
  },

  async login(payload: Credentials): Promise<User> {
    await ensureCsrf()
    const { data } = await api.post<{ data: User }>('/auth/login', payload)
    resetCsrf()
    return data.data
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout')
    resetCsrf()
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    await ensureCsrf()
    const { data } = await api.post<{ message: string }>('/auth/forgot-password', { email })
    return data
  },

  async resetPassword(payload: {
    token: string
    email: string
    password: string
    password_confirmation: string
  }): Promise<{ message: string }> {
    await ensureCsrf()
    const { data } = await api.post<{ message: string }>('/auth/reset-password', payload)
    return data
  },

  async resendVerification(): Promise<{ message: string }> {
    const { data } = await api.post<{ message: string }>('/auth/email/verification-notification')
    return data
  },

  async updateProfile(payload: ProfilePayload): Promise<User> {
    const { data } = await api.put<{ data: User }>('/me/profile', payload)
    return data.data
  },

  async updatePassword(payload: PasswordPayload): Promise<{ message: string }> {
    const { data } = await api.put<{ message: string }>('/me/password', payload)
    return data
  },
}
