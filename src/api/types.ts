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
  province?: string | null
  region?: string | null
  district?: string | null
  commune?: string | null
  fokontany?: string | null
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
  province?: string | null
  region?: string | null
  district?: string | null
  commune?: string | null
  fokontany?: string | null
  chef: (Pick<Individu, 'id' | 'nom'> & { province?: string | null; region?: string | null; district?: string | null; commune?: string | null }) | null
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
  photo?: string | null
  telephone?: string | null
  fonction?: string | null
  province?: string | null
  region?: string | null
  district?: string | null
}

export interface Overview {
  individus: number
  membres: number
  populationTotale: number
  hommes: number
  femmes: number
  ageMedian: number
  tailleMoyenneMenage: number
  tauxDependance: number
  tranches: {
    moins6: number
    de6a24: number
    plus18: number
    plus65: number
  }
}

export interface TerritorialUnit {
  nom: string
  province?: string
  region?: string
  district?: string
  populationTotale: number
  individus: number
  membres: number
  hommes: number
  femmes: number
  ageMoyen: number
}

export interface TerritorialOverview {
  provinces: TerritorialUnit[]
  regions: TerritorialUnit[]
  districts: TerritorialUnit[]
  communes: TerritorialUnit[]
}

export interface AgePyramidTier {
  tranche: string
  minAge: number
  maxAge: number
  hommes: number
  femmes: number
  total: number
}

export interface HouseholdSizeGroup {
  taille: string
  count: number
  pourcentage: number
}

export interface DemographicAnalysis {
  pyramide: AgePyramidTier[]
  taillesMenages: HouseholdSizeGroup[]
  repartitionSexe: {
    hommes: number
    femmes: number
    pctHommes: number
    pctFemmes: number
  }
  indicateurs: {
    populationTotale: number
    menagesTotal: number
    ageMedian: number
    ageMoyen: number
    ratioMasculinite: number
    tauxDependance: number
  }
}

export interface PopulationItem {
  id: string
  nom: string
  age: number
  sexe: Sexe
  source: 'individu' | 'membre'
  chef: string | null
  province?: string | null
  region?: string | null
  district?: string | null
  commune?: string | null
  fokontany?: string | null
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
  province?: string | null
  region?: string | null
  district?: string | null
  commune?: string | null
  fokontany?: string | null
}

export interface MembrePayload {
  nom: string
  age: number
  sexe: Sexe
  profession: string | null
  lien: string | null
  photo?: string | null
  chef: string
  province?: string | null
  region?: string | null
  district?: string | null
  commune?: string | null
  fokontany?: string | null
}

export interface UserPayload {
  email: string
  nom: string
  roles: string[]
  password?: string
  actif?: boolean
  photo?: string | null
  telephone?: string | null
  fonction?: string | null
  province?: string | null
  region?: string | null
  district?: string | null
}

export interface RegisterPayload {
  email: string
  nom: string
  password: string
  photo?: string | null
  telephone?: string | null
  fonction?: string | null
  province?: string | null
  region?: string | null
  district?: string | null
}

export const SEXE_OPTIONS: { value: Sexe; label: string }[] = [
  { value: 'LAHY', label: 'Lahy (Homme)' },
  { value: 'VAVY', label: 'Vavy (Femme)' },
]

export function sexeLabel(sexe: Sexe): string {
  return sexe === 'LAHY' ? 'Lahy' : 'Vavy'
}
