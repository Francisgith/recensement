import axios from 'axios'

const TOKEN_KEY = 'recensement.token'
const USER_KEY = 'recensement.user'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  headers: { Accept: 'application/json' },
})

export const tokenStore = {
  get(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  },
  set(token: string): void {
    localStorage.setItem(TOKEN_KEY, token)
  },
  clear(): void {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },
}

api.interceptors.request.use((config) => {
  const token = tokenStore.get()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      !String(error.config?.url ?? '').includes('/login_check')
    ) {
      tokenStore.clear()
      if (!window.location.pathname.startsWith('/login')) {
        window.location.assign('/login')
      }
    }
    return Promise.reject(error)
  },
)

export function getApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; detail?: string; title?: string; errors?: Record<string, string> }
      | undefined

    if (data?.errors) {
      const first = Object.values(data.errors)[0]
      if (first) return first
    }
    return data?.detail ?? data?.message ?? data?.title ?? `Erreur ${error.response?.status ?? ''}`.trim()
  }
  if (error instanceof Error) return error.message
  return 'Une erreur inattendue est survenue.'
}

export function fieldErrors(error: unknown): Record<string, string> {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { errors?: Record<string, string> } | undefined
    return data?.errors ?? {}
  }
  return {}
}
