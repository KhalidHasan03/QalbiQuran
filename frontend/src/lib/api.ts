import axios from 'axios'

const apiBaseURL = import.meta.env.VITE_API_URL ?? '/api/v1'

const serverRoot = apiBaseURL.replace(/\/api\/v1\/?$/, '')

export const api = axios.create({
  baseURL: apiBaseURL,
  headers: {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: true,
  withXSRFToken: true,
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const url = error.config?.url ?? ''
      if (!url.startsWith('/auth/')) {
        window.dispatchEvent(new Event('qalbiquran:unauthorized'))
      }
    }
    return Promise.reject(error)
  },
)

let csrfReady: Promise<void> | null = null

export function ensureCsrf(): Promise<void> {
  if (!csrfReady) {
    csrfReady = axios
      .get(`${serverRoot}/sanctum/csrf-cookie`, { withCredentials: true })
      .then(() => undefined)
  }
  return csrfReady
}

export function resetCsrf() {
  csrfReady = null
}

export function apiErrorMessage(error: unknown, fallback = 'Something went wrong.'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; errors?: Record<string, string[]> } | undefined
    if (data?.errors) {
      const first = Object.values(data.errors)[0]
      if (first?.length) return first[0]
    }
    if (data?.message) return data.message
  }
  return fallback
}

export interface HealthResponse {
  status: string
  app: string
  version: string
  time: string
}

export async function fetchHealth(): Promise<HealthResponse> {
  const { data } = await axios.get<HealthResponse>(`${serverRoot}/api/health`)
  return data
}
