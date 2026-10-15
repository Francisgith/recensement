export interface RegionGeoData {
  id: string
  nom: string
  province: string
  chefLieu: string
  path: string
  center: { x: number; y: number }
  districts: {
    nom: string
    x: number
    y: number
    isChefLieu?: boolean
  }[]
}

export interface ProvinceTheme {
  name: string
  color: string
  stroke: string
  fillLight: string
  fillDark: string
  borderLight: string
  borderDark: string
  badgeBg: string
  badgeText: string
}

export const REGIONS_GEO: RegionGeoData[] = [
  // --- PROVINCE ANTSIRANANA ---
  {
    id: 'diana',
    nom: 'Diana',
    province: 'Antsiranana',
    chefLieu: 'Antsiranana (Diego-Suarez)',
    path: 'M 370 45 L 395 70 L 400 110 L 370 145 L 330 135 L 320 95 L 340 65 Z',
    center: { x: 360, y: 95 },
    districts: [
      { nom: 'Antsiranana I', x: 380, y: 70, isChefLieu: true },
      { nom: 'Antsiranana II', x: 365, y: 85 },
      { nom: 'Ambilobe', x: 350, y: 115 },
      { nom: 'Ambanja', x: 335, y: 125 },
      { nom: 'Nosy Be', x: 310, y: 110 },
    ],
  },
  {
    id: 'sava',
    nom: 'Sava',
    province: 'Antsiranana',
    chefLieu: 'Sambava',
    path: 'M 395 70 L 440 120 L 445 190 L 415 220 L 370 185 L 370 145 L 400 110 Z',
    center: { x: 410, y: 150 },
    districts: [
      { nom: 'Sambava', x: 425, y: 145, isChefLieu: true },
      { nom: 'Antalaha', x: 435, y: 175 },
      { nom: 'Vohemar', x: 420, y: 110 },
      { nom: 'Andapa', x: 390, y: 160 },
    ],
  },

  // --- PROVINCE MAHAJANGA ---
  {
    id: 'sofia',
    nom: 'Sofia',
    province: 'Mahajanga',
    chefLieu: 'Antsohihy',
    path: 'M 330 135 L 370 145 L 370 185 L 360 250 L 300 260 L 260 215 L 285 160 Z',
    center: { x: 315, y: 200 },
    districts: [
      { nom: 'Antsohihy', x: 300, y: 180, isChefLieu: true },
      { nom: 'Analalava', x: 275, y: 170 },
      { nom: 'Bealanana', x: 340, y: 170 },
      { nom: 'Befandriana Nord', x: 345, y: 205 },
      { nom: 'Mandritsara', x: 340, y: 235 },
      { nom: 'Mampikony', x: 295, y: 220 },
      { nom: 'Port-Bergé', x: 315, y: 205 },
    ],
  },
  {
    id: 'boeny',
    nom: 'Boeny',
    province: 'Mahajanga',
    chefLieu: 'Mahajanga (Majunga)',
    path: 'M 260 215 L 300 260 L 280 295 L 220 280 L 190 230 L 225 210 Z',
    center: { x: 240, y: 250 },
    districts: [
      { nom: 'Mahajanga I', x: 220, y: 225, isChefLieu: true },
      { nom: 'Mahajanga II', x: 230, y: 240 },
      { nom: 'Ambato-Boeni', x: 270, y: 265 },
      { nom: 'Marovoay', x: 250, y: 255 },
      { nom: 'Mitsinjo', x: 205, y: 250 },
      { nom: 'Soalala', x: 195, y: 265 },
    ],
  },
  {
    id: 'betsiboka',
    nom: 'Betsiboka',
    province: 'Mahajanga',
    chefLieu: 'Maevatanana',
    path: 'M 300 260 L 345 260 L 335 320 L 280 325 L 280 295 Z',
    center: { x: 310, y: 290 },
    districts: [
      { nom: 'Maevatanana', x: 295, y: 285, isChefLieu: true },
      { nom: 'Kandreho', x: 275, y: 305 },
      { nom: 'Tsaratanana', x: 330, y: 295 },
    ],
  },
  {
    id: 'melaky',
    nom: 'Melaky',
    province: 'Mahajanga',
    chefLieu: 'Maintirano',
    path: 'M 190 230 L 220 280 L 210 365 L 140 360 L 150 280 Z',
    center: { x: 175, y: 315 },
    districts: [
      { nom: 'Maintirano', x: 155, y: 320, isChefLieu: true },
      { nom: 'Ambatomainty', x: 195, y: 325 },
      { nom: 'Antsalova', x: 165, y: 350 },
      { nom: 'Besalampy', x: 170, y: 275 },
      { nom: 'Morafenobe', x: 185, y: 305 },
    ],
  },

  // --- PROVINCE TOAMASINA ---
  {
    id: 'analanjirofo',
    nom: 'Analanjirofo',
    province: 'Toamasina',
    chefLieu: 'Fénérive-Est',
    path: 'M 415 220 L 445 190 L 455 250 L 420 330 L 375 310 L 370 250 Z',
    center: { x: 415, y: 270 },
    districts: [
      { nom: 'Fénérive-Est', x: 410, y: 295, isChefLieu: true },
      { nom: 'Mananara Nord', x: 430, y: 245 },
      { nom: 'Maroantsetra', x: 420, y: 215 },
      { nom: 'Sainte-Marie', x: 445, y: 285 },
      { nom: 'Soanierana Ivongo', x: 415, y: 275 },
      { nom: 'Vavatenina', x: 395, y: 310 },
    ],
  },
  {
    id: 'alaotra-mangoro',
    nom: 'Alaotra-Mangoro',
    province: 'Toamasina',
    chefLieu: 'Ambatondrazaka',
    path: 'M 345 260 L 370 250 L 375 310 L 385 385 L 340 395 L 335 320 Z',
    center: { x: 360, y: 330 },
    districts: [
      { nom: 'Ambatondrazaka', x: 360, y: 310, isChefLieu: true },
      { nom: 'Amparafaravola', x: 345, y: 300 },
      { nom: 'Andilamena', x: 360, y: 270 },
      { nom: 'Anosibe An\'ala', x: 365, y: 380 },
      { nom: 'Moramanga', x: 355, y: 360 },
    ],
  },
  {
    id: 'atsinanana',
    nom: 'Atsinanana',
    province: 'Toamasina',
    chefLieu: 'Toamasina (Tamatave)',
    path: 'M 420 330 L 435 380 L 405 470 L 370 460 L 385 385 L 375 310 Z',
    center: { x: 405, y: 400 },
    districts: [
      { nom: 'Toamasina I', x: 420, y: 355, isChefLieu: true },
      { nom: 'Toamasina II', x: 415, y: 370 },
      { nom: 'Brickaville', x: 400, y: 385 },
      { nom: 'Mahanoro', x: 385, y: 445 },
      { nom: 'Marolambo', x: 365, y: 435 },
      { nom: 'Vatomandry', x: 395, y: 420 },
      { nom: 'Antanambao Manampotsy', x: 380, y: 405 },
    ],
  },

  // --- PROVINCE ANTANANARIVO ---
  {
    id: 'analamanga',
    nom: 'Analamanga',
    province: 'Antananarivo',
    chefLieu: 'Antananarivo (Tana)',
    path: 'M 280 325 L 335 320 L 340 395 L 300 405 L 275 365 Z',
    center: { x: 310, y: 360 },
    districts: [
      { nom: 'Antananarivo Renivohitra', x: 312, y: 360, isChefLieu: true },
      { nom: 'Ambohidratrimo', x: 305, y: 348 },
      { nom: 'Andramasina', x: 318, y: 385 },
      { nom: 'Anjozorobe', x: 325, y: 330 },
      { nom: 'Ankazobe', x: 290, y: 335 },
      { nom: 'Manjakandriana', x: 328, y: 365 },
    ],
  },
  {
    id: 'itasy',
    nom: 'Itasy',
    province: 'Antananarivo',
    chefLieu: 'Miarinarivo',
    path: 'M 275 365 L 300 405 L 290 425 L 265 420 Z',
    center: { x: 280, y: 395 },
    districts: [
      { nom: 'Miarinarivo', x: 280, y: 390, isChefLieu: true },
      { nom: 'Arivonimamo', x: 290, y: 385 },
      { nom: 'Soavinandriana', x: 275, y: 410 },
    ],
  },
  {
    id: 'bongolava',
    nom: 'Bongolava',
    province: 'Antananarivo',
    chefLieu: 'Tsiroanomandidy',
    path: 'M 210 365 L 275 365 L 265 420 L 205 410 Z',
    center: { x: 240, y: 390 },
    districts: [
      { nom: 'Tsiroanomandidy', x: 245, y: 385, isChefLieu: true },
      { nom: 'Fenoarivobe', x: 235, y: 365 },
    ],
  },
  {
    id: 'vakinankaratra',
    nom: 'Vakinankaratra',
    province: 'Antananarivo',
    chefLieu: 'Antsirabe',
    path: 'M 265 420 L 300 405 L 340 395 L 340 455 L 265 470 Z',
    center: { x: 300, y: 435 },
    districts: [
      { nom: 'Antsirabe I', x: 305, y: 435, isChefLieu: true },
      { nom: 'Antsirabe II', x: 315, y: 445 },
      { nom: 'Ambatolampy', x: 310, y: 415 },
      { nom: 'Betafo', x: 285, y: 435 },
      { nom: 'Faratsiho', x: 280, y: 420 },
      { nom: 'Mandoto', x: 265, y: 445 },
    ],
  },

  // --- PROVINCE FIANARANTSOA ---
  {
    id: 'amoron-i-mania',
    nom: "Amoron'i Mania",
    province: 'Fianarantsoa',
    chefLieu: 'Ambositra',
    path: 'M 265 470 L 340 455 L 340 515 L 265 525 Z',
    center: { x: 300, y: 490 },
    districts: [
      { nom: 'Ambositra', x: 305, y: 485, isChefLieu: true },
      { nom: 'Ambatofinandrahana', x: 275, y: 495 },
      { nom: 'Fandriana', x: 320, y: 475 },
      { nom: 'Manandriana', x: 310, y: 505 },
    ],
  },
  {
    id: 'matsiatra-ambony',
    nom: 'Matsiatra Ambony',
    province: 'Fianarantsoa',
    chefLieu: 'Fianarantsoa',
    path: 'M 265 525 L 340 515 L 335 585 L 260 595 Z',
    center: { x: 300, y: 555 },
    districts: [
      { nom: 'Fianarantsoa', x: 305, y: 545, isChefLieu: true },
      { nom: 'Ambalavao', x: 295, y: 575 },
      { nom: 'Ambohimahasoa', x: 305, y: 525 },
      { nom: 'Ikalamavony', x: 270, y: 550 },
      { nom: 'Isandra', x: 290, y: 545 },
      { nom: 'Lalangina', x: 315, y: 555 },
      { nom: 'Vohibato', x: 315, y: 570 },
    ],
  },
  {
    id: 'vatovavy',
    nom: 'Vatovavy',
    province: 'Fianarantsoa',
    chefLieu: 'Mananjary',
    path: 'M 370 460 L 405 470 L 385 540 L 340 515 L 340 455 Z',
    center: { x: 365, y: 495 },
    districts: [
      { nom: 'Mananjary', x: 375, y: 500, isChefLieu: true },
      { nom: 'Ifanadiana', x: 345, y: 510 },
      { nom: 'Nosy Varika', x: 385, y: 475 },
    ],
  },
  {
    id: 'fitovinany',
    nom: 'Fitovinany',
    province: 'Fianarantsoa',
    chefLieu: 'Manakara',
    path: 'M 340 515 L 385 540 L 375 605 L 335 585 Z',
    center: { x: 355, y: 560 },
    districts: [
      { nom: 'Manakara', x: 365, y: 565, isChefLieu: true },
      { nom: 'Ikongo', x: 340, y: 575 },
      { nom: 'Vohipeno', x: 360, y: 585 },
    ],
  },
  {
    id: 'atsimo-atsinanana',
    nom: 'Atsimo-Atsinanana',
    province: 'Fianarantsoa',
    chefLieu: 'Farafangana',
    path: 'M 335 585 L 375 605 L 355 690 L 315 675 Z',
    center: { x: 345, y: 640 },
    districts: [
      { nom: 'Farafangana', x: 350, y: 620, isChefLieu: true },
      { nom: 'Befotaka', x: 325, y: 670 },
      { nom: 'Midongy du Sud', x: 325, y: 650 },
      { nom: 'Vangaindrano', x: 345, y: 650 },
      { nom: 'Vondrozo', x: 330, y: 620 },
    ],
  },
  {
    id: 'ihorombe',
    nom: 'Ihorombe',
    province: 'Fianarantsoa',
    chefLieu: 'Ihosy',
    path: 'M 260 595 L 335 585 L 315 675 L 255 655 Z',
    center: { x: 285, y: 625 },
    districts: [
      { nom: 'Ihosy', x: 285, y: 620, isChefLieu: true },
      { nom: 'Iakora', x: 305, y: 640 },
      { nom: 'Ivohibe', x: 305, y: 610 },
    ],
  },

  // --- PROVINCE TOLIARA ---
  {
    id: 'menabe',
    nom: 'Menabe',
    province: 'Toliara',
    chefLieu: 'Morondava',
    path: 'M 140 360 L 205 410 L 265 470 L 255 525 L 135 500 L 130 420 Z',
    center: { x: 195, y: 445 },
    districts: [
      { nom: 'Morondava', x: 145, y: 450, isChefLieu: true },
      { nom: 'Belo sur Tsiribihina', x: 155, y: 410 },
      { nom: 'Mahabo', x: 185, y: 455 },
      { nom: 'Manja', x: 165, y: 495 },
      { nom: 'Miandrivazo', x: 220, y: 435 },
    ],
  },
  {
    id: 'atsimo-andrefana',
    nom: 'Atsimo-Andrefana',
    province: 'Toliara',
    chefLieu: 'Toliara (Tuléar)',
    path: 'M 135 500 L 255 525 L 260 595 L 255 655 L 220 680 L 140 640 L 115 570 Z',
    center: { x: 185, y: 590 },
    districts: [
      { nom: 'Toliara I', x: 130, y: 595, isChefLieu: true },
      { nom: 'Toliara II', x: 140, y: 575 },
      { nom: 'Morombe', x: 125, y: 525 },
      { nom: 'Sakaraha', x: 190, y: 570 },
      { nom: 'Betioky Atsimo', x: 165, y: 625 },
      { nom: 'Ampanihy Ouest', x: 180, y: 660 },
      { nom: 'Ankazoabo', x: 180, y: 540 },
      { nom: 'Benenitra', x: 215, y: 590 },
      { nom: 'Beroroha', x: 200, y: 525 },
    ],
  },
  {
    id: 'androy',
    nom: 'Androy',
    province: 'Toliara',
    chefLieu: 'Ambovombe',
    path: 'M 220 680 L 255 655 L 295 675 L 275 750 L 205 745 Z',
    center: { x: 245, y: 705 },
    districts: [
      { nom: 'Ambovombe-Androy', x: 260, y: 715, isChefLieu: true },
      { nom: 'Bekily', x: 245, y: 675 },
      { nom: 'Beloha', x: 220, y: 710 },
      { nom: 'Tsihombe', x: 240, y: 735 },
    ],
  },
  {
    id: 'anosy',
    nom: 'Anosy',
    province: 'Toliara',
    chefLieu: 'Taolagnaro (Fort-Dauphin)',
    path: 'M 315 675 L 355 690 L 345 740 L 275 750 L 295 675 Z',
    center: { x: 310, y: 710 },
    districts: [
      { nom: 'Taolagnaro', x: 330, y: 725, isChefLieu: true },
      { nom: 'Amboasary Sud', x: 295, y: 725 },
      { nom: 'Betroka', x: 290, y: 675 },
    ],
  },
]

export const PROVINCE_THEMES: Record<string, ProvinceTheme> = {
  Antsiranana: {
    name: 'Antsiranana',
    color: '#059669',
    stroke: '#047857',
    fillLight: '#d1fae5',
    fillDark: '#064e3b',
    borderLight: '#10b981',
    borderDark: '#34d399',
    badgeBg: '#d1fae5',
    badgeText: '#065f46',
  },
  Mahajanga: {
    name: 'Mahajanga',
    color: '#d97706',
    stroke: '#b45309',
    fillLight: '#fef3c7',
    fillDark: '#78350f',
    borderLight: '#f59e0b',
    borderDark: '#fbbf24',
    badgeBg: '#fef3c7',
    badgeText: '#92400e',
  },
  Antananarivo: {
    name: 'Antananarivo',
    color: '#2563eb',
    stroke: '#1d4ed8',
    fillLight: '#dbeafe',
    fillDark: '#1e3a8a',
    borderLight: '#3b82f6',
    borderDark: '#60a5fa',
    badgeBg: '#dbeafe',
    badgeText: '#1e40af',
  },
  Toamasina: {
    name: 'Toamasina',
    color: '#0891b2',
    stroke: '#0e7490',
    fillLight: '#cffafe',
    fillDark: '#164e63',
    borderLight: '#06b6d4',
    borderDark: '#22d3ee',
    badgeBg: '#cffafe',
    badgeText: '#155e75',
  },
  Fianarantsoa: {
    name: 'Fianarantsoa',
    color: '#7c3aed',
    stroke: '#6d28d9',
    fillLight: '#ede9fe',
    fillDark: '#4c1d95',
    borderLight: '#8b5cf6',
    borderDark: '#a78bfa',
    badgeBg: '#ede9fe',
    badgeText: '#5b21b6',
  },
  Toliara: {
    name: 'Toliara',
    color: '#e11d48',
    stroke: '#be123c',
    fillLight: '#ffe4e6',
    fillDark: '#881337',
    borderLight: '#f43f5e',
    borderDark: '#fb7185',
    badgeBg: '#ffe4e6',
    badgeText: '#9f1239',
  },
}
