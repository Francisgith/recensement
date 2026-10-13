import { api } from './client'
import type {
  Individu,
  IndividuPayload,
  MembreFamille,
  MembrePayload,
  Overview,
  PopulationResult,
  Sexe,
  User,
  UserPayload,
} from './types'

export interface SearchParams {
  q?: string
  sexe?: Sexe | ''
  min?: number | ''
  max?: number | ''
}

function clean(params: SearchParams): Record<string, string> {
  const out: Record<string, string> = {}
  if (params.q) out.q = params.q
  if (params.sexe) out.sexe = params.sexe
  if (params.min !== undefined && params.min !== '') out.min = String(params.min)
  if (params.max !== undefined && params.max !== '') out.max = String(params.max)
  return out
}

export const authApi = {
  async login(email: string, password: string): Promise<string> {
    const { data } = await api.post<{ token: string }>('/login_check', { email, password })
    return data.token
  },
  async me(): Promise<User> {
    const { data } = await api.get<User>('/me')
    return data
  },
}

export const individuApi = {
  async list(params: SearchParams = {}): Promise<Individu[]> {
    const { data } = await api.get<Individu[]>('/individus', { params: clean(params) })
    return data
  },
  async create(payload: IndividuPayload): Promise<Individu> {
    const { data } = await api.post<Individu>('/individus', payload)
    return data
  },
  async update(id: string, payload: IndividuPayload): Promise<Individu> {
    const { data } = await api.put<Individu>(`/individus/${id}`, payload)
    return data
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/individus/${id}`)
  },
  async membres(id: string): Promise<MembreFamille[]> {
    const { data } = await api.get<MembreFamille[]>(`/individus/${id}/membres`)
    return data
  },
}

export const membreApi = {
  async list(params: SearchParams = {}): Promise<MembreFamille[]> {
    const { data } = await api.get<MembreFamille[]>('/membres', { params: clean(params) })
    return data
  },
  async create(payload: MembrePayload): Promise<MembreFamille> {
    const { data } = await api.post<MembreFamille>('/membres', payload)
    return data
  },
  async update(id: string, payload: MembrePayload): Promise<MembreFamille> {
    const { data } = await api.put<MembreFamille>(`/membres/${id}`, payload)
    return data
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/membres/${id}`)
  },
}

export const statsApi = {
  async overview(): Promise<Overview> {
    const { data } = await api.get<Overview>('/stats/overview')
    return data
  },
  async population(params: SearchParams = {}): Promise<PopulationResult> {
    const { data } = await api.get<PopulationResult>('/population', { params: clean(params) })
    return data
  },
}

export const userApi = {
  async list(): Promise<User[]> {
    const { data } = await api.get<User[]>('/users')
    return data
  },
  async create(payload: UserPayload): Promise<User> {
    const { data } = await api.post<User>('/users', payload)
    return data
  },
  async update(id: number, payload: UserPayload): Promise<User> {
    const { data } = await api.put<User>(`/users/${id}`, payload)
    return data
  },
  async remove(id: number): Promise<void> {
    await api.delete(`/users/${id}`)
  },
}
