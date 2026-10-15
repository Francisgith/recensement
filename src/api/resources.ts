import { api } from './client'
import type {
  DemographicAnalysis,
  Individu,
  IndividuPayload,
  MembreFamille,
  MembrePayload,
  Overview,
  PopulationResult,
  RegisterPayload,
  Sexe,
  TerritorialOverview,
  User,
  UserPayload,
} from './types'

export interface SearchParams {
  q?: string
  sexe?: Sexe | ''
  min?: number | ''
  max?: number | ''
  province?: string
  region?: string
  district?: string
  commune?: string
}

function clean(params: SearchParams): Record<string, string> {
  const out: Record<string, string> = {}
  if (params.q) out.q = params.q.trim()
  if (params.sexe) out.sexe = params.sexe
  if (params.min !== undefined && params.min !== '') out.min = String(params.min)
  if (params.max !== undefined && params.max !== '') out.max = String(params.max)
  if (params.province) out.province = params.province
  if (params.region) out.region = params.region
  if (params.district) out.district = params.district
  if (params.commune) out.commune = params.commune
  return out
}

export const authApi = {
  async login(email: string, password: string): Promise<string> {
    const { data } = await api.post<{ token: string }>('/login_check', { email, password })
    return data.token
  },
  async register(payload: RegisterPayload): Promise<{ token: string; user: User; message: string }> {
    const { data } = await api.post<{ token: string; user: User; message: string }>('/register', payload)
    return data
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
  async overview(params: SearchParams = {}): Promise<Overview> {
    const { data } = await api.get<Overview>('/stats/overview', { params: clean(params) })
    return data
  },
  async population(params: SearchParams = {}): Promise<PopulationResult> {
    const { data } = await api.get<PopulationResult>('/population', { params: clean(params) })
    return data
  },
  async territorial(params: SearchParams = {}): Promise<TerritorialOverview> {
    const { data } = await api.get<TerritorialOverview>('/stats/territorial', { params: clean(params) })
    return data
  },
  async demographics(params: SearchParams = {}): Promise<DemographicAnalysis> {
    const { data } = await api.get<DemographicAnalysis>('/stats/demographics', { params: clean(params) })
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
