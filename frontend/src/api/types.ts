export type Sexe = 'LAHY' | 'VAVY'

export interface Individu {
  id: string
  nom: string
  age: number
  sexe: Sexe
  profession: string | null
  adresse: string | null
  telephone: string | null
  photo: string | null
  createdAt: string
  updatedAt: string
}

export interface MembreFamille {
  id: string
  nom: string
  age: number
  sexe: Sexe
  profession: string | null
  lien: string | null
  photo: string | null
  chef: Pick<Individu, 'id' | 'nom'> | null
  createdAt: string
  updatedAt: string
}

export interface User {
  id: number
  email: string
  nom: string
  roles: string[]
  actif: boolean
  createdAt: string
}

export interface Overview {
  individus: number
  membres: number
  populationTotale: number
  hommes: number
  femmes: number
  tranches: {
    moins6: number
    de6a24: number
    plus18: number
    plus65: number
  }
}

export interface PopulationItem {
  id: string
  nom: string
  age: number
  sexe: Sexe
  source: 'individu' | 'membre'
  chef: string | null
}

export interface PopulationResult {
  total: number
  items: PopulationItem[]
}

export interface IndividuPayload {
  nom: string
  age: number
  sexe: Sexe
  profession: string | null
  adresse: string | null
  telephone: string | null
  photo?: string | null
}

export interface MembrePayload {
  nom: string
  age: number
  sexe: Sexe
  profession: string | null
  lien: string | null
  photo?: string | null
  chef: string
}

export interface UserPayload {
  email: string
  nom: string
  roles: string[]
  password?: string
  actif?: boolean
}

export const SEXE_OPTIONS: { value: Sexe; label: string }[] = [
  { value: 'LAHY', label: 'Lahy (Homme)' },
  { value: 'VAVY', label: 'Vavy (Femme)' },
]

export function sexeLabel(sexe: Sexe): string {
  return sexe === 'LAHY' ? 'Lahy' : 'Vavy'
}
