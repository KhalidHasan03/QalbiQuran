import { api, ensureCsrf } from './api'

export interface ContactPayload {
  name: string
  email: string
  subject?: string
  message: string
}

export const contactApi = {
  async send(payload: ContactPayload): Promise<{ message: string }> {
    await ensureCsrf()
    const { data } = await api.post<{ message: string }>('/contact', payload)
    return data
  },
}
