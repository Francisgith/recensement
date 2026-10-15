import axios from 'axios'

export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('recensement_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('recensement_token')
      localStorage.removeItem('recensement_user')
    }
    return Promise.reject(error)
  },
)

export function getApiError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    if (err.response?.data?.message) {
      return String(err.response.data.message)
    }
    if (err.response?.statusText) {
      return `Erreur ${err.response.status}: ${err.response.statusText}`
    }
    if (err.message) {
      return err.message
    }
  }
  if (err instanceof Error) {
    return err.message
  }
  return 'Une erreur inattendue est survenue.'
}
