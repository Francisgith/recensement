import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import crypto from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = Number(process.env.PORT) || 3000
const JWT_SECRET = process.env.JWT_SECRET || 'recensement_secret_key_123456789_mg'

app.use(cors())
app.use(express.json({ limit: '10mb' }))

// --- IN-MEMORY DATABASE & SEED DATA ---

interface User {
  id: number
  email: string
  nom: string
  roles: string[]
  passwordHash: string
  actif: boolean
  createdAt: string
}

interface Individu {
  id: string
  nom: string
  age: number
  sexe: 'LAHY' | 'VAVY'
  profession: string | null
  adresse: string | null
  telephone: string | null
  photo: string | null
  province: string | null
  region: string | null
  district: string | null
  commune: string | null
  fokontany: string | null
  createdAt: string
  updatedAt: string
}

interface MembreFamille {
  id: string
  nom: string
  age: number
  sexe: 'LAHY' | 'VAVY'
  profession: string | null
  lien: string | null
  photo: string | null
  province: string | null
  region: string | null
  district: string | null
  commune: string | null
  fokontany: string | null
  chef: {
    id: string
    nom: string
    province?: string | null
    region?: string | null
    district?: string | null
    commune?: string | null
  } | null
  createdAt: string
  updatedAt: string
}

const users: User[] = [
  {
    id: 1,
    email: 'admin@recensement.mg',
    nom: 'Administrateur',
    roles: ['ROLE_ADMIN', 'ROLE_AGENT'],
    passwordHash: bcrypt.hashSync('Admin@1234', 10),
    actif: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    email: 'agent@recensement.mg',
    nom: 'Agent de terrain',
    roles: ['ROLE_AGENT'],
    passwordHash: bcrypt.hashSync('Agent@1234', 10),
    actif: true,
    createdAt: new Date().toISOString(),
  },
]

let nextUserId = 3

const individus: Individu[] = [
  {
    id: 'd0c5a242-7c30-4e58-94f3-a11111111111',
    nom: 'RAKOTOMENA Christian Eugene',
    age: 50,
    sexe: 'LAHY',
    profession: 'Chauffeur',
    adresse: 'Lot VF 55 Mahamasina',
    telephone: '0340000001',
    photo: null,
    province: 'Antananarivo',
    region: 'Analamanga',
    district: 'Antananarivo Renivohitra',
    commune: '4ème Arrondissement (Mahamasina, Anosy)',
    fokontany: 'Mahamasina-Sud',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'd0c5a242-7c30-4e58-94f3-a22222222222',
    nom: 'RAKOTOMENA Nicolas',
    age: 23,
    sexe: 'LAHY',
    profession: 'Cuisinier',
    adresse: 'Lot VF 55 Mahamasina',
    telephone: '0340000002',
    photo: null,
    province: 'Antananarivo',
    region: 'Analamanga',
    district: 'Antananarivo Renivohitra',
    commune: '4ème Arrondissement (Mahamasina, Anosy)',
    fokontany: 'Mahamasina-Sud',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'd0c5a242-7c30-4e58-94f3-a33333333333',
    nom: 'RANDRIAMBELOSOA Mireille',
    age: 40,
    sexe: 'VAVY',
    profession: 'Commerçante',
    adresse: 'Lot II A 12 Analakely',
    telephone: '0340000003',
    photo: null,
    province: 'Antananarivo',
    region: 'Analamanga',
    district: 'Antananarivo Renivohitra',
    commune: '1er Arrondissement (Analakely, Soarano)',
    fokontany: 'Analakely',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'd0c5a242-7c30-4e58-94f3-a44444444444',
    nom: 'ANDRIANIRINA Jean-Claude',
    age: 45,
    sexe: 'LAHY',
    profession: 'Agriculteur',
    adresse: 'Ambohitsiroa',
    telephone: '0321122334',
    photo: null,
    province: 'Antananarivo',
    region: 'Vakinankaratra',
    district: 'Antsirabe I',
    commune: 'Antsirabe Centre',
    fokontany: 'Ivohitra',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'd0c5a242-7c30-4e58-94f3-a55555555555',
    nom: 'BEZARA Jean Jacques',
    age: 38,
    sexe: 'LAHY',
    profession: 'Pêcheur artisanal',
    adresse: 'Quartier Bazarikely',
    telephone: '0331122445',
    photo: null,
    province: 'Antsiranana',
    region: 'Diana',
    district: 'Antsiranana I',
    commune: 'Bazarikely',
    fokontany: 'Bazarikely-Port',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'd0c5a242-7c30-4e58-94f3-a66666666666',
    nom: 'RAVELONJANAHARY Monique',
    age: 52,
    sexe: 'VAVY',
    profession: 'Enseignante',
    adresse: 'Boulevard Joffre',
    telephone: '0342233445',
    photo: null,
    province: 'Toamasina',
    region: 'Atsinanana',
    district: 'Toamasina I',
    commune: 'Tanambao',
    fokontany: 'Tanambao V',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'd0c5a242-7c30-4e58-94f3-a77777777777',
    nom: 'RAKOTOARISOA Hery Lova',
    age: 48,
    sexe: 'LAHY',
    profession: 'Artisan bois marqueté',
    adresse: 'Rue Philibert Tsiranana',
    telephone: '0334455667',
    photo: null,
    province: 'Fianarantsoa',
    region: 'Haute Matsiatra',
    district: 'Fianarantsoa',
    commune: 'Fianarantsoa Ville',
    fokontany: 'Ambalapaiso',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'd0c5a242-7c30-4e58-94f3-a88888888888',
    nom: 'JAOMANGA Victor',
    age: 42,
    sexe: 'LAHY',
    profession: 'Commerçant export',
    adresse: 'Bord de la mer Majunga',
    telephone: '0329988776',
    photo: null,
    province: 'Mahajanga',
    region: 'Boeny',
    district: 'Mahajanga I',
    commune: 'Mahajanga Ville',
    fokontany: 'Mangarivotra',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'd0c5a242-7c30-4e58-94f3-a99999999999',
    nom: 'SOAMARANY Christine',
    age: 36,
    sexe: 'VAVY',
    profession: 'Guide touristique',
    adresse: 'Avenue de France',
    telephone: '0348877665',
    photo: null,
    province: 'Toliara',
    region: 'Atsimo-Andrefana',
    district: 'Toliara I',
    commune: 'Toliara Centre',
    fokontany: 'Besakoa',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const membres: MembreFamille[] = [
  {
    id: 'e0c5a242-7c30-4e58-94f3-b11111111111',
    nom: 'RAKOTOMENA Christelle',
    age: 19,
    sexe: 'VAVY',
    profession: 'Mpianatra (Étudiante)',
    lien: 'Fille',
    photo: null,
    province: 'Antananarivo',
    region: 'Analamanga',
    district: 'Antananarivo Renivohitra',
    commune: '4ème Arrondissement (Mahamasina, Anosy)',
    fokontany: 'Mahamasina-Sud',
    chef: {
      id: 'd0c5a242-7c30-4e58-94f3-a11111111111',
      nom: 'RAKOTOMENA Christian Eugene',
      province: 'Antananarivo',
      region: 'Analamanga',
      district: 'Antananarivo Renivohitra',
      commune: '4ème Arrondissement (Mahamasina, Anosy)',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'e0c5a242-7c30-4e58-94f3-b22222222222',
    nom: 'RAKOTOMENA Fitia Arnelle',
    age: 4,
    sexe: 'VAVY',
    profession: 'Mpianatra (Écolière)',
    lien: 'Fille',
    photo: null,
    province: 'Antananarivo',
    region: 'Analamanga',
    district: 'Antananarivo Renivohitra',
    commune: '4ème Arrondissement (Mahamasina, Anosy)',
    fokontany: 'Mahamasina-Sud',
    chef: {
      id: 'd0c5a242-7c30-4e58-94f3-a11111111111',
      nom: 'RAKOTOMENA Christian Eugene',
      province: 'Antananarivo',
      region: 'Analamanga',
      district: 'Antananarivo Renivohitra',
      commune: '4ème Arrondissement (Mahamasina, Anosy)',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'e0c5a242-7c30-4e58-94f3-b33333333333',
    nom: 'RALALANIAINA Annie',
    age: 24,
    sexe: 'VAVY',
    profession: 'Mpianatra (Étudiante)',
    lien: 'Épouse',
    photo: null,
    province: 'Antananarivo',
    region: 'Analamanga',
    district: 'Antananarivo Renivohitra',
    commune: '4ème Arrondissement (Mahamasina, Anosy)',
    fokontany: 'Mahamasina-Sud',
    chef: {
      id: 'd0c5a242-7c30-4e58-94f3-a22222222222',
      nom: 'RAKOTOMENA Nicolas',
      province: 'Antananarivo',
      region: 'Analamanga',
      district: 'Antananarivo Renivohitra',
      commune: '4ème Arrondissement (Mahamasina, Anosy)',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'e0c5a242-7c30-4e58-94f3-b44444444444',
    nom: 'RAKOTOMENA Mitia Arrys',
    age: 2,
    sexe: 'VAVY',
    profession: null,
    lien: 'Fils',
    photo: null,
    province: 'Antananarivo',
    region: 'Analamanga',
    district: 'Antananarivo Renivohitra',
    commune: '1er Arrondissement (Analakely, Soarano)',
    fokontany: 'Analakely',
    chef: {
      id: 'd0c5a242-7c30-4e58-94f3-a33333333333',
      nom: 'RANDRIAMBELOSOA Mireille',
      province: 'Antananarivo',
      region: 'Analamanga',
      district: 'Antananarivo Renivohitra',
      commune: '1er Arrondissement (Analakely, Soarano)',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'e0c5a242-7c30-4e58-94f3-b55555555555',
    nom: 'ANDRIANIRINA Voahirana',
    age: 41,
    sexe: 'VAVY',
    profession: 'Agricultrice',
    lien: 'Épouse',
    photo: null,
    province: 'Antananarivo',
    region: 'Vakinankaratra',
    district: 'Antsirabe I',
    commune: 'Antsirabe Centre',
    fokontany: 'Ivohitra',
    chef: {
      id: 'd0c5a242-7c30-4e58-94f3-a44444444444',
      nom: 'ANDRIANIRINA Jean-Claude',
      province: 'Antananarivo',
      region: 'Vakinankaratra',
      district: 'Antsirabe I',
      commune: 'Antsirabe Centre',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'e0c5a242-7c30-4e58-94f3-b66666666666',
    nom: 'ANDRIANIRINA Faly',
    age: 14,
    sexe: 'LAHY',
    profession: 'Collégien',
    lien: 'Fils',
    photo: null,
    province: 'Antananarivo',
    region: 'Vakinankaratra',
    district: 'Antsirabe I',
    commune: 'Antsirabe Centre',
    fokontany: 'Ivohitra',
    chef: {
      id: 'd0c5a242-7c30-4e58-94f3-a44444444444',
      nom: 'ANDRIANIRINA Jean-Claude',
      province: 'Antananarivo',
      region: 'Vakinankaratra',
      district: 'Antsirabe I',
      commune: 'Antsirabe Centre',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'e0c5a242-7c30-4e58-94f3-b77777777777',
    nom: 'BEZARA Tombo',
    age: 10,
    sexe: 'LAHY',
    profession: 'Écolier',
    lien: 'Fils',
    photo: null,
    province: 'Antsiranana',
    region: 'Diana',
    district: 'Antsiranana I',
    commune: 'Bazarikely',
    fokontany: 'Bazarikely-Port',
    chef: {
      id: 'd0c5a242-7c30-4e58-94f3-a55555555555',
      nom: 'BEZARA Jean Jacques',
      province: 'Antsiranana',
      region: 'Diana',
      district: 'Antsiranana I',
      commune: 'Bazarikely',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'e0c5a242-7c30-4e58-94f3-b88888888888',
    nom: 'RAVELONJANAHARY Mialy',
    age: 17,
    sexe: 'VAVY',
    profession: 'Lycéenne',
    lien: 'Fille',
    photo: null,
    province: 'Toamasina',
    region: 'Atsinanana',
    district: 'Toamasina I',
    commune: 'Tanambao',
    fokontany: 'Tanambao V',
    chef: {
      id: 'd0c5a242-7c30-4e58-94f3-a66666666666',
      nom: 'RAVELONJANAHARY Monique',
      province: 'Toamasina',
      region: 'Atsinanana',
      district: 'Toamasina I',
      commune: 'Tanambao',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'e0c5a242-7c30-4e58-94f3-b99999999999',
    nom: 'RAKOTOARISOA Bakoly',
    age: 72,
    sexe: 'VAVY',
    profession: 'Retraitée',
    lien: 'Mère',
    photo: null,
    province: 'Fianarantsoa',
    region: 'Haute Matsiatra',
    district: 'Fianarantsoa',
    commune: 'Fianarantsoa Ville',
    fokontany: 'Ambalapaiso',
    chef: {
      id: 'd0c5a242-7c30-4e58-94f3-a77777777777',
      nom: 'RAKOTOARISOA Hery Lova',
      province: 'Fianarantsoa',
      region: 'Haute Matsiatra',
      district: 'Fianarantsoa',
      commune: 'Fianarantsoa Ville',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'e0c5a242-7c30-4e58-94f3-baaaaaaaaaaa',
    nom: 'SOAMARANY Tsiliva',
    age: 8,
    sexe: 'LAHY',
    profession: 'Écolier',
    lien: 'Fils',
    photo: null,
    province: 'Toliara',
    region: 'Atsimo-Andrefana',
    district: 'Toliara I',
    commune: 'Toliara Centre',
    fokontany: 'Besakoa',
    chef: {
      id: 'd0c5a242-7c30-4e58-94f3-a99999999999',
      nom: 'SOAMARANY Christine',
      province: 'Toliara',
      region: 'Atsimo-Andrefana',
      district: 'Toliara I',
      commune: 'Toliara Centre',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

function sanitizeUser(u: User) {
  return {
    id: u.id,
    email: u.email,
    nom: u.nom,
    roles: u.roles,
    actif: u.actif,
    createdAt: u.createdAt,
  }
}

// --- AUTH & MIDDLEWARE ---

interface AuthRequest extends express.Request {
  user?: User
}

function requireAuth(req: AuthRequest, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'JWT Token not found' })
  }

  const token = authHeader.substring(7)
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string }
    const user = users.find((u) => u.id === decoded.id && u.actif)
    if (!user) {
      return res.status(401).json({ message: 'Utilisateur inactif ou introuvable.' })
    }
    req.user = user
    next()
  } catch {
    return res.status(401).json({ message: 'Token invalide ou expiré.' })
  }
}

function requireAdmin(req: AuthRequest, res: express.Response, next: express.NextFunction) {
  if (!req.user || !req.user.roles.includes('ROLE_ADMIN')) {
    return res.status(403).json({ message: 'Accès refusé. Rôle administrateur requis.' })
  }
  next()
}

// --- API ROUTES ---

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

// Login
app.post('/api/login_check', (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) {
    return res.status(401).json({ message: 'Identifiants invalides.' })
  }

  const user = users.find((u) => u.email.toLowerCase() === String(email).toLowerCase())
  if (!user || !user.actif) {
    return res.status(401).json({ message: 'Identifiants invalides.' })
  }

  const matches = bcrypt.compareSync(String(password), user.passwordHash)
  if (!matches) {
    return res.status(401).json({ message: 'Identifiants invalides.' })
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      roles: user.roles,
    },
    JWT_SECRET,
    { expiresIn: '24h' },
  )

  res.json({ token })
})

// Current user
app.get('/api/me', requireAuth, (req: AuthRequest, res) => {
  res.json(sanitizeUser(req.user!))
})

// Helper to filter by territory
function filterByTerritory<T extends { province?: string | null; region?: string | null; district?: string | null; commune?: string | null }>(
  items: T[],
  province?: string,
  region?: string,
  district?: string,
  commune?: string,
): T[] {
  let list = items
  if (province) list = list.filter((i) => i.province?.toLowerCase() === province.toLowerCase())
  if (region) list = list.filter((i) => i.region?.toLowerCase() === region.toLowerCase())
  if (district) list = list.filter((i) => i.district?.toLowerCase() === district.toLowerCase())
  if (commune) list = list.filter((i) => i.commune?.toLowerCase() === commune.toLowerCase())
  return list
}

// Stats overview
app.get('/api/stats/overview', requireAuth, (req, res) => {
  const province = req.query.province as string | undefined
  const region = req.query.region as string | undefined
  const district = req.query.district as string | undefined
  const commune = req.query.commune as string | undefined

  const filteredIndividus = filterByTerritory(individus, province, region, district, commune)
  const filteredMembres = filterByTerritory(membres, province, region, district, commune)

  const allPersons = [...filteredIndividus, ...filteredMembres]
  const ages = allPersons.map((p) => p.age).sort((a, b) => a - b)
  let hommes = 0
  let femmes = 0

  for (const p of allPersons) {
    if (p.sexe === 'LAHY') hommes++
    else if (p.sexe === 'VAVY') femmes++
  }

  // Median age
  let ageMedian = 0
  if (ages.length > 0) {
    const mid = Math.floor(ages.length / 2)
    ageMedian = ages.length % 2 !== 0 ? ages[mid] : Math.round((ages[mid - 1] + ages[mid]) / 2)
  }

  // Dependency ratio: (pop < 15 + pop >= 65) / pop 15-64 * 100
  const young = ages.filter((a) => a < 15).length
  const old = ages.filter((a) => a >= 65).length
  const activePop = ages.filter((a) => a >= 15 && a < 65).length
  const tauxDependance = activePop > 0 ? Math.round(((young + old) / activePop) * 100) : 0

  // Average household size
  const tailleMoyenneMenage =
    filteredIndividus.length > 0
      ? Number((allPersons.length / filteredIndividus.length).toFixed(1))
      : 0

  res.json({
    individus: filteredIndividus.length,
    membres: filteredMembres.length,
    populationTotale: allPersons.length,
    hommes,
    femmes,
    ageMedian,
    tailleMoyenneMenage,
    tauxDependance,
    tranches: {
      moins6: ages.filter((a) => a < 6).length,
      de6a24: ages.filter((a) => a >= 6 && a <= 24).length,
      plus18: ages.filter((a) => a > 18).length,
      plus65: ages.filter((a) => a > 65).length,
    },
  })
})

// Territorial statistics breakdown
app.get('/api/stats/territorial', requireAuth, (req, res) => {
  const provinceFilter = req.query.province as string | undefined
  const regionFilter = req.query.region as string | undefined
  const districtFilter = req.query.district as string | undefined

  interface AggregateGroup {
    nom: string
    province?: string
    region?: string
    district?: string
    individus: number
    membres: number
    populationTotale: number
    hommes: number
    femmes: number
    ages: number[]
  }

  const provMap = new Map<string, AggregateGroup>()
  const regMap = new Map<string, AggregateGroup>()
  const distMap = new Map<string, AggregateGroup>()
  const commMap = new Map<string, AggregateGroup>()

  const allPersons = [
    ...individus.map((i) => ({ ...i, source: 'individu' })),
    ...membres.map((m) => ({ ...m, source: 'membre' })),
  ]

  for (const p of allPersons) {
    const prov = p.province || 'Non spécifié'
    const reg = p.region || 'Non spécifié'
    const dist = p.district || 'Non spécifié'
    const comm = p.commune || 'Non spécifié'

    // Provinces aggregate
    if (!provMap.has(prov)) {
      provMap.set(prov, {
        nom: prov,
        individus: 0,
        membres: 0,
        populationTotale: 0,
        hommes: 0,
        femmes: 0,
        ages: [],
      })
    }
    const provEntry = provMap.get(prov)!
    provEntry.populationTotale++
    if (p.source === 'individu') provEntry.individus++
    else provEntry.membres++
    if (p.sexe === 'LAHY') provEntry.hommes++
    else provEntry.femmes++
    provEntry.ages.push(p.age)

    // Regions aggregate (if matches province filter)
    if (!provinceFilter || prov.toLowerCase() === provinceFilter.toLowerCase()) {
      if (!regMap.has(reg)) {
        regMap.set(reg, {
          nom: reg,
          province: prov,
          individus: 0,
          membres: 0,
          populationTotale: 0,
          hommes: 0,
          femmes: 0,
          ages: [],
        })
      }
      const regEntry = regMap.get(reg)!
      regEntry.populationTotale++
      if (p.source === 'individu') regEntry.individus++
      else regEntry.membres++
      if (p.sexe === 'LAHY') regEntry.hommes++
      else regEntry.femmes++
      regEntry.ages.push(p.age)
    }

    // Districts aggregate (if matches region filter)
    if (!regionFilter || reg.toLowerCase() === regionFilter.toLowerCase()) {
      if (!distMap.has(dist)) {
        distMap.set(dist, {
          nom: dist,
          province: prov,
          region: reg,
          individus: 0,
          membres: 0,
          populationTotale: 0,
          hommes: 0,
          femmes: 0,
          ages: [],
        })
      }
      const distEntry = distMap.get(dist)!
      distEntry.populationTotale++
      if (p.source === 'individu') distEntry.individus++
      else distEntry.membres++
      if (p.sexe === 'LAHY') distEntry.hommes++
      else distEntry.femmes++
      distEntry.ages.push(p.age)
    }

    // Communes aggregate (if matches district filter)
    if (!districtFilter || dist.toLowerCase() === districtFilter.toLowerCase()) {
      if (!commMap.has(comm)) {
        commMap.set(comm, {
          nom: comm,
          province: prov,
          region: reg,
          district: dist,
          individus: 0,
          membres: 0,
          populationTotale: 0,
          hommes: 0,
          femmes: 0,
          ages: [],
        })
      }
      const commEntry = commMap.get(comm)!
      commEntry.populationTotale++
      if (p.source === 'individu') commEntry.individus++
      else commEntry.membres++
      if (p.sexe === 'LAHY') commEntry.hommes++
      else commEntry.femmes++
      commEntry.ages.push(p.age)
    }
  }

  const formatList = (map: Map<string, AggregateGroup>) =>
    Array.from(map.values())
      .map((item) => ({
        nom: item.nom,
        province: item.province,
        region: item.region,
        district: item.district,
        populationTotale: item.populationTotale,
        individus: item.individus,
        membres: item.membres,
        hommes: item.hommes,
        femmes: item.femmes,
        ageMoyen:
          item.ages.length > 0
            ? Math.round(item.ages.reduce((a, b) => a + b, 0) / item.ages.length)
            : 0,
      }))
      .sort((a, b) => b.populationTotale - a.populationTotale)

  res.json({
    provinces: formatList(provMap),
    regions: formatList(regMap),
    districts: formatList(distMap),
    communes: formatList(commMap),
  })
})

// Detailed demographic analysis (Age pyramid, household sizes, indicators)
app.get('/api/stats/demographics', requireAuth, (req, res) => {
  const province = req.query.province as string | undefined
  const region = req.query.region as string | undefined
  const district = req.query.district as string | undefined
  const commune = req.query.commune as string | undefined

  const filteredInds = filterByTerritory(individus, province, region, district, commune)
  const filteredMems = filterByTerritory(membres, province, region, district, commune)
  const allPersons = [...filteredInds, ...filteredMems]

  // Pyramid age tiers: 0-9, 10-19, 20-29, 30-39, 40-49, 50-59, 60+
  const tiersConfig = [
    { tranche: '0-9 ans', minAge: 0, maxAge: 9 },
    { tranche: '10-19 ans', minAge: 10, maxAge: 19 },
    { tranche: '20-29 ans', minAge: 20, maxAge: 29 },
    { tranche: '30-39 ans', minAge: 30, maxAge: 39 },
    { tranche: '40-49 ans', minAge: 40, maxAge: 49 },
    { tranche: '50-59 ans', minAge: 50, maxAge: 59 },
    { tranche: '60+ ans', minAge: 60, maxAge: 130 },
  ]

  const pyramide = tiersConfig.map((tier) => {
    const people = allPersons.filter((p) => p.age >= tier.minAge && p.age <= tier.maxAge)
    const hommes = people.filter((p) => p.sexe === 'LAHY').length
    const femmes = people.filter((p) => p.sexe === 'VAVY').length
    return {
      tranche: tier.tranche,
      minAge: tier.minAge,
      maxAge: tier.maxAge,
      hommes,
      femmes,
      total: people.length,
    }
  })

  // Household size groups
  // For each chef in filteredInds, count members + 1 (the chef)
  const householdSizes = filteredInds.map((ind) => {
    const count = 1 + membres.filter((m) => m.chef?.id === ind.id).length
    return count
  })

  const size1 = householdSizes.filter((s) => s === 1).length
  const size2to3 = householdSizes.filter((s) => s >= 2 && s <= 3).length
  const size4to5 = householdSizes.filter((s) => s >= 4 && s <= 5).length
  const size6plus = householdSizes.filter((s) => s >= 6).length
  const totalMenages = householdSizes.length || 1

  const taillesMenages = [
    {
      taille: '1 personne (Isolée)',
      count: size1,
      pourcentage: Math.round((size1 / totalMenages) * 100),
    },
    {
      taille: '2 à 3 personnes',
      count: size2to3,
      pourcentage: Math.round((size2to3 / totalMenages) * 100),
    },
    {
      taille: '4 à 5 personnes',
      count: size4to5,
      pourcentage: Math.round((size4to5 / totalMenages) * 100),
    },
    {
      taille: '6 personnes et plus',
      count: size6plus,
      pourcentage: Math.round((size6plus / totalMenages) * 100),
    },
  ]

  // Sex distribution
  const hommes = allPersons.filter((p) => p.sexe === 'LAHY').length
  const femmes = allPersons.filter((p) => p.sexe === 'VAVY').length
  const totalPop = allPersons.length || 1

  // Indicators
  const sortedAges = allPersons.map((p) => p.age).sort((a, b) => a - b)
  const mid = Math.floor(sortedAges.length / 2)
  const ageMedian =
    sortedAges.length > 0
      ? sortedAges.length % 2 !== 0
        ? sortedAges[mid]
        : Math.round((sortedAges[mid - 1] + sortedAges[mid]) / 2)
      : 0
  const ageMoyen =
    sortedAges.length > 0
      ? Math.round(sortedAges.reduce((a, b) => a + b, 0) / sortedAges.length)
      : 0
  const ratioMasculinite = femmes > 0 ? Number(((hommes / femmes) * 100).toFixed(1)) : 100

  const young = sortedAges.filter((a) => a < 15).length
  const old = sortedAges.filter((a) => a >= 65).length
  const actives = sortedAges.filter((a) => a >= 15 && a < 65).length
  const tauxDependance = actives > 0 ? Math.round(((young + old) / actives) * 100) : 0

  res.json({
    pyramide,
    taillesMenages,
    repartitionSexe: {
      hommes,
      femmes,
      pctHommes: Math.round((hommes / totalPop) * 100),
      pctFemmes: Math.round((femmes / totalPop) * 100),
    },
    indicateurs: {
      populationTotale: allPersons.length,
      menagesTotal: filteredInds.length,
      ageMedian,
      ageMoyen,
      ratioMasculinite,
      tauxDependance,
    },
  })
})

// Population search
app.get('/api/population', requireAuth, (req, res) => {
  const q = req.query.q as string | undefined
  const sexe = req.query.sexe as string | undefined
  const min = req.query.min !== undefined && req.query.min !== '' ? Number(req.query.min) : null
  const max = req.query.max !== undefined && req.query.max !== '' ? Number(req.query.max) : null
  const province = req.query.province as string | undefined
  const region = req.query.region as string | undefined
  const district = req.query.district as string | undefined
  const commune = req.query.commune as string | undefined

  const items: Array<{
    id: string
    nom: string
    age: number
    sexe: 'LAHY' | 'VAVY'
    source: 'individu' | 'membre'
    chef: string | null
    province: string | null
    region: string | null
    district: string | null
    commune: string | null
    fokontany: string | null
  }> = []

  for (const ind of individus) {
    if (q && !ind.nom.toLowerCase().includes(q.trim().toLowerCase())) continue
    if (sexe && ind.sexe !== sexe) continue
    if (min !== null && ind.age < min) continue
    if (max !== null && ind.age > max) continue
    if (province && ind.province?.toLowerCase() !== province.toLowerCase()) continue
    if (region && ind.region?.toLowerCase() !== region.toLowerCase()) continue
    if (district && ind.district?.toLowerCase() !== district.toLowerCase()) continue
    if (commune && ind.commune?.toLowerCase() !== commune.toLowerCase()) continue

    items.push({
      id: ind.id,
      nom: ind.nom,
      age: ind.age,
      sexe: ind.sexe,
      source: 'individu',
      chef: null,
      province: ind.province,
      region: ind.region,
      district: ind.district,
      commune: ind.commune,
      fokontany: ind.fokontany,
    })
  }

  for (const m of membres) {
    if (q && !m.nom.toLowerCase().includes(q.trim().toLowerCase())) continue
    if (sexe && m.sexe !== sexe) continue
    if (min !== null && m.age < min) continue
    if (max !== null && m.age > max) continue
    if (province && m.province?.toLowerCase() !== province.toLowerCase()) continue
    if (region && m.region?.toLowerCase() !== region.toLowerCase()) continue
    if (district && m.district?.toLowerCase() !== district.toLowerCase()) continue
    if (commune && m.commune?.toLowerCase() !== commune.toLowerCase()) continue

    items.push({
      id: m.id,
      nom: m.nom,
      age: m.age,
      sexe: m.sexe,
      source: 'membre',
      chef: m.chef?.nom ?? null,
      province: m.province,
      region: m.region,
      district: m.district,
      commune: m.commune,
      fokontany: m.fokontany,
    })
  }

  items.sort((a, b) => a.nom.localeCompare(b.nom))

  res.json({
    total: items.length,
    items,
  })
})

// Individus CRUD
app.get('/api/individus', requireAuth, (req, res) => {
  const q = req.query.q as string | undefined
  const sexe = req.query.sexe as string | undefined
  const min = req.query.min !== undefined && req.query.min !== '' ? Number(req.query.min) : null
  const max = req.query.max !== undefined && req.query.max !== '' ? Number(req.query.max) : null
  const province = req.query.province as string | undefined
  const region = req.query.region as string | undefined
  const district = req.query.district as string | undefined
  const commune = req.query.commune as string | undefined

  let results = [...individus]

  if (q && q.trim()) {
    const term = q.trim().toLowerCase()
    results = results.filter((i) => i.nom.toLowerCase().includes(term))
  }
  if (sexe) {
    results = results.filter((i) => i.sexe === sexe)
  }
  if (min !== null) {
    results = results.filter((i) => i.age >= min)
  }
  if (max !== null) {
    results = results.filter((i) => i.age <= max)
  }
  if (province) {
    results = results.filter((i) => i.province?.toLowerCase() === province.toLowerCase())
  }
  if (region) {
    results = results.filter((i) => i.region?.toLowerCase() === region.toLowerCase())
  }
  if (district) {
    results = results.filter((i) => i.district?.toLowerCase() === district.toLowerCase())
  }
  if (commune) {
    results = results.filter((i) => i.commune?.toLowerCase() === commune.toLowerCase())
  }

  results.sort((a, b) => a.nom.localeCompare(b.nom))
  res.json(results)
})

app.get('/api/individus/:id', requireAuth, (req, res) => {
  const ind = individus.find((i) => i.id === req.params.id)
  if (!ind) {
    return res.status(404).json({ message: 'Individu introuvable.' })
  }
  res.json(ind)
})

app.post('/api/individus', requireAuth, (req, res) => {
  const {
    nom,
    age,
    sexe,
    profession,
    adresse,
    telephone,
    photo,
    province,
    region,
    district,
    commune,
    fokontany,
  } = req.body || {}

  if (!nom || typeof age !== 'number' || !sexe) {
    return res.status(400).json({ message: 'Données invalides : nom, âge et sexe sont requis.' })
  }

  const now = new Date().toISOString()
  const newInd: Individu = {
    id: crypto.randomUUID(),
    nom: String(nom).trim(),
    age: Number(age),
    sexe: sexe === 'VAVY' ? 'VAVY' : 'LAHY',
    profession: profession ? String(profession).trim() : null,
    adresse: adresse ? String(adresse).trim() : null,
    telephone: telephone ? String(telephone).trim() : null,
    photo: photo || null,
    province: province ? String(province).trim() : null,
    region: region ? String(region).trim() : null,
    district: district ? String(district).trim() : null,
    commune: commune ? String(commune).trim() : null,
    fokontany: fokontany ? String(fokontany).trim() : null,
    createdAt: now,
    updatedAt: now,
  }

  individus.push(newInd)
  res.status(201).json(newInd)
})

app.put('/api/individus/:id', requireAuth, (req, res) => {
  const ind = individus.find((i) => i.id === req.params.id)
  if (!ind) {
    return res.status(404).json({ message: 'Individu introuvable.' })
  }

  const {
    nom,
    age,
    sexe,
    profession,
    adresse,
    telephone,
    photo,
    province,
    region,
    district,
    commune,
    fokontany,
  } = req.body || {}

  if (nom !== undefined) ind.nom = String(nom).trim()
  if (age !== undefined) ind.age = Number(age)
  if (sexe !== undefined) ind.sexe = sexe === 'VAVY' ? 'VAVY' : 'LAHY'
  if (profession !== undefined) ind.profession = profession ? String(profession).trim() : null
  if (adresse !== undefined) ind.adresse = adresse ? String(adresse).trim() : null
  if (telephone !== undefined) ind.telephone = telephone ? String(telephone).trim() : null
  if (photo !== undefined) ind.photo = photo || null
  if (province !== undefined) ind.province = province ? String(province).trim() : null
  if (region !== undefined) ind.region = region ? String(region).trim() : null
  if (district !== undefined) ind.district = district ? String(district).trim() : null
  if (commune !== undefined) ind.commune = commune ? String(commune).trim() : null
  if (fokontany !== undefined) ind.fokontany = fokontany ? String(fokontany).trim() : null
  ind.updatedAt = new Date().toISOString()

  // Update chef info in associated members
  for (const m of membres) {
    if (m.chef?.id === ind.id) {
      m.chef.nom = ind.nom
      m.chef.province = ind.province
      m.chef.region = ind.region
      m.chef.district = ind.district
      m.chef.commune = ind.commune
      // Inherit location if not overridden
      if (!m.province) m.province = ind.province
      if (!m.region) m.region = ind.region
      if (!m.district) m.district = ind.district
      if (!m.commune) m.commune = ind.commune
      if (!m.fokontany) m.fokontany = ind.fokontany
    }
  }

  res.json(ind)
})

app.delete('/api/individus/:id', requireAuth, (req, res) => {
  const index = individus.findIndex((i) => i.id === req.params.id)
  if (index === -1) {
    return res.status(404).json({ message: 'Individu introuvable.' })
  }

  const id = individus[index].id
  individus.splice(index, 1)

  // Cascade delete members belonging to this chef
  for (let i = membres.length - 1; i >= 0; i--) {
    if (membres[i].chef?.id === id) {
      membres.splice(i, 1)
    }
  }

  res.status(204).send()
})

app.get('/api/individus/:id/membres', requireAuth, (req, res) => {
  const ind = individus.find((i) => i.id === req.params.id)
  if (!ind) {
    return res.status(404).json({ message: 'Individu introuvable.' })
  }

  const related = membres
    .filter((m) => m.chef?.id === ind.id)
    .sort((a, b) => a.nom.localeCompare(b.nom))

  res.json(related)
})

// Membres CRUD
app.get('/api/membres', requireAuth, (req, res) => {
  const q = req.query.q as string | undefined
  const sexe = req.query.sexe as string | undefined
  const min = req.query.min !== undefined && req.query.min !== '' ? Number(req.query.min) : null
  const max = req.query.max !== undefined && req.query.max !== '' ? Number(req.query.max) : null
  const chef = req.query.chef as string | undefined
  const province = req.query.province as string | undefined
  const region = req.query.region as string | undefined
  const district = req.query.district as string | undefined
  const commune = req.query.commune as string | undefined

  if (chef) {
    const list = membres.filter((m) => m.chef?.id === chef).sort((a, b) => a.nom.localeCompare(b.nom))
    return res.json(list)
  }

  let results = [...membres]

  if (q && q.trim()) {
    const term = q.trim().toLowerCase()
    results = results.filter((m) => m.nom.toLowerCase().includes(term))
  }
  if (sexe) {
    results = results.filter((m) => m.sexe === sexe)
  }
  if (min !== null) {
    results = results.filter((m) => m.age >= min)
  }
  if (max !== null) {
    results = results.filter((m) => m.age <= max)
  }
  if (province) {
    results = results.filter((m) => m.province?.toLowerCase() === province.toLowerCase())
  }
  if (region) {
    results = results.filter((m) => m.region?.toLowerCase() === region.toLowerCase())
  }
  if (district) {
    results = results.filter((m) => m.district?.toLowerCase() === district.toLowerCase())
  }
  if (commune) {
    results = results.filter((m) => m.commune?.toLowerCase() === commune.toLowerCase())
  }

  results.sort((a, b) => a.nom.localeCompare(b.nom))
  res.json(results)
})

app.get('/api/membres/:id', requireAuth, (req, res) => {
  const m = membres.find((item) => item.id === req.params.id)
  if (!m) {
    return res.status(404).json({ message: 'Membre introuvable.' })
  }
  res.json(m)
})

app.post('/api/membres', requireAuth, (req, res) => {
  const { nom, age, sexe, profession, lien, photo, chef, province, region, district, commune, fokontany } = req.body || {}
  if (!nom || typeof age !== 'number' || !sexe || !chef) {
    return res.status(400).json({ message: 'Données requises manquantes.' })
  }

  const chefIndividu = individus.find((i) => i.id === String(chef))
  if (!chefIndividu) {
    return res.status(404).json({ message: 'Chef de famille introuvable.' })
  }

  const now = new Date().toISOString()
  const newMembre: MembreFamille = {
    id: crypto.randomUUID(),
    nom: String(nom).trim(),
    age: Number(age),
    sexe: sexe === 'VAVY' ? 'VAVY' : 'LAHY',
    profession: profession ? String(profession).trim() : null,
    lien: lien ? String(lien).trim() : null,
    photo: photo || null,
    province: province ? String(province).trim() : chefIndividu.province,
    region: region ? String(region).trim() : chefIndividu.region,
    district: district ? String(district).trim() : chefIndividu.district,
    commune: commune ? String(commune).trim() : chefIndividu.commune,
    fokontany: fokontany ? String(fokontany).trim() : chefIndividu.fokontany,
    chef: {
      id: chefIndividu.id,
      nom: chefIndividu.nom,
      province: chefIndividu.province,
      region: chefIndividu.region,
      district: chefIndividu.district,
      commune: chefIndividu.commune,
    },
    createdAt: now,
    updatedAt: now,
  }

  membres.push(newMembre)
  res.status(201).json(newMembre)
})

app.put('/api/membres/:id', requireAuth, (req, res) => {
  const m = membres.find((item) => item.id === req.params.id)
  if (!m) {
    return res.status(404).json({ message: 'Membre introuvable.' })
  }

  const { nom, age, sexe, profession, lien, photo, chef, province, region, district, commune, fokontany } = req.body || {}
  if (nom !== undefined) m.nom = String(nom).trim()
  if (age !== undefined) m.age = Number(age)
  if (sexe !== undefined) m.sexe = sexe === 'VAVY' ? 'VAVY' : 'LAHY'
  if (profession !== undefined) m.profession = profession ? String(profession).trim() : null
  if (lien !== undefined) m.lien = lien ? String(lien).trim() : null
  if (photo !== undefined) m.photo = photo || null
  if (province !== undefined) m.province = province ? String(province).trim() : null
  if (region !== undefined) m.region = region ? String(region).trim() : null
  if (district !== undefined) m.district = district ? String(district).trim() : null
  if (commune !== undefined) m.commune = commune ? String(commune).trim() : null
  if (fokontany !== undefined) m.fokontany = fokontany ? String(fokontany).trim() : null

  if (chef !== undefined) {
    const chefIndividu = individus.find((i) => i.id === String(chef))
    if (!chefIndividu) {
      return res.status(404).json({ message: 'Chef de famille introuvable.' })
    }
    m.chef = {
      id: chefIndividu.id,
      nom: chefIndividu.nom,
      province: chefIndividu.province,
      region: chefIndividu.region,
      district: chefIndividu.district,
      commune: chefIndividu.commune,
    }
  }

  m.updatedAt = new Date().toISOString()
  res.json(m)
})

app.delete('/api/membres/:id', requireAuth, (req, res) => {
  const index = membres.findIndex((item) => item.id === req.params.id)
  if (index === -1) {
    return res.status(404).json({ message: 'Membre introuvable.' })
  }

  membres.splice(index, 1)
  res.status(204).send()
})

// Users management (Admin only)
app.get('/api/users', requireAuth, requireAdmin, (_req, res) => {
  const sorted = [...users].sort((a, b) => a.id - b.id)
  res.json(sorted.map(sanitizeUser))
})

app.post('/api/users', requireAuth, requireAdmin, (req, res) => {
  const { email, nom, roles, password, actif } = req.body || {}
  if (!email || !nom || !password) {
    return res.status(400).json({ message: 'Email, nom et mot de passe sont requis.' })
  }

  const lowerEmail = String(email).trim().toLowerCase()
  if (users.some((u) => u.email.toLowerCase() === lowerEmail)) {
    return res.status(409).json({ message: 'Un utilisateur avec cet email existe déjà.' })
  }

  const newUser: User = {
    id: nextUserId++,
    email: lowerEmail,
    nom: String(nom).trim(),
    roles: Array.isArray(roles) && roles.length > 0 ? roles : ['ROLE_AGENT'],
    passwordHash: bcrypt.hashSync(String(password), 10),
    actif: actif !== undefined ? Boolean(actif) : true,
    createdAt: new Date().toISOString(),
  }

  users.push(newUser)
  res.status(201).json(sanitizeUser(newUser))
})

app.put('/api/users/:id', requireAuth, requireAdmin, (req, res) => {
  const id = Number(req.params.id)
  const user = users.find((u) => u.id === id)
  if (!user) {
    return res.status(404).json({ message: 'Utilisateur introuvable.' })
  }

  const { email, nom, roles, password, actif } = req.body || {}

  if (email && email.toLowerCase() !== user.email.toLowerCase()) {
    const conflict = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.id !== id)
    if (conflict) {
      return res.status(409).json({ message: 'Un utilisateur avec cet email existe déjà.' })
    }
    user.email = email.trim().toLowerCase()
  }

  if (nom !== undefined) user.nom = String(nom).trim()
  if (roles !== undefined && Array.isArray(roles)) user.roles = roles
  if (actif !== undefined) user.actif = Boolean(actif)
  if (password && String(password).trim().length > 0) {
    user.passwordHash = bcrypt.hashSync(String(password).trim(), 10)
  }

  res.json(sanitizeUser(user))
})

app.delete('/api/users/:id', requireAuth, requireAdmin, (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  const index = users.findIndex((u) => u.id === id)
  if (index === -1) {
    return res.status(404).json({ message: 'Utilisateur introuvable.' })
  }

  if (req.user?.id === id) {
    return res.status(409).json({ message: 'Vous ne pouvez pas supprimer votre propre compte.' })
  }

  users.splice(index, 1)
  res.status(204).send()
})

// --- STATIC ASSETS / VITE DEV INTEGRATION ---

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production'

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite')
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    })
    app.use(vite.middlewares)
  } else {
    const distPath = path.resolve(__dirname, 'dist')
    app.use(express.static(distPath))
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'))
    })
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Recensement server listening on http://0.0.0.0:${PORT}`)
  })
}

startServer().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
