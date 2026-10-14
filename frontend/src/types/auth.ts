export interface User {
  id: number
  name: string
  username: string | null
  email: string
  email_verified: boolean
  timezone: string
  is_admin: boolean
  admin_url: string | null
}

export interface Credentials {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  username: string
  email: string
  password: string
  password_confirmation: string
}

export interface ProfilePayload {
  name: string
  username: string
  email: string
  timezone?: string
}

export interface PasswordPayload {
  current_password: string
  password: string
  password_confirmation: string
}
