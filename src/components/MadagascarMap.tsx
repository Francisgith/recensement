import { useState, useMemo } from 'react'
import Icon from './Icon'
import { getCommunesForDistrict } from '../data/madagascarGeo'
import type { TerritorialUnit } from '../api/types'

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

const REGIONS_GEO: RegionGeoData[] = [
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

interface MadagascarMapProps {
  selectedProvince?: string
  selectedRegion?: string
  selectedDistrict?: string
  onSelectProvince?: (province: string) => void
  onSelectRegion?: (region: string) => void
  onSelectDistrict?: (district: string) => void
  onResetFilters?: () => void
  territorialUnits?: TerritorialUnit[]
}

export default function MadagascarMap({
  selectedProvince = '',
  selectedRegion = '',
  selectedDistrict = '',
  onSelectProvince,
  onSelectRegion,
  onSelectDistrict,
  onResetFilters,
  territorialUnits = [],
}: MadagascarMapProps) {
  const [hoveredRegion, setHoveredRegion] = useState<RegionGeoData | null>(null)
  const [activeTab, setActiveTab] = useState<'carte' | 'precision'>('carte')

  // Find selected region geo object
  const activeRegionGeo = useMemo(() => {
    if (!selectedRegion) return null
    return (
      REGIONS_GEO.find(
        (r) => r.nom.toLowerCase() === selectedRegion.toLowerCase(),
      ) || null
    )
  }, [selectedRegion])

  // Get population count for a region if territorial stats exist
  const getRegionStats = (regionName: string) => {
    const unit = territorialUnits.find(
      (u) => u.nom.toLowerCase() === regionName.toLowerCase(),
    )
    return unit || null
  }

  // Handle click on a region in map
  const handleRegionClick = (reg: RegionGeoData) => {
    if (onSelectProvince) onSelectProvince(reg.province)
    if (onSelectRegion) onSelectRegion(reg.nom)
    if (onSelectDistrict) onSelectDistrict('')
    setActiveTab('precision')
  }

  // Handle click on a district
  const handleDistrictClick = (districtName: string) => {
    if (onSelectDistrict) onSelectDistrict(districtName)
  }

  const communesForActiveDistrict = useMemo(() => {
    if (!selectedDistrict) return []
    return getCommunesForDistrict(selectedDistrict)
  }, [selectedDistrict])

  return (
    <div className="card border-0 shadow-sm bg-white overflow-hidden mb-4">
      {/* Map Header with breadcrumbs and view switcher */}
      <div className="card-header bg-white border-bottom p-3 p-md-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span
                className="badge bg-success bg-opacity-10 text-success fw-semibold px-2 py-1 rounded d-flex align-items-center gap-1"
                style={{ fontSize: '0.72rem' }}
              >
                <Icon name="map-pin" size={13} />
                <span>Système Cartographique Interactif</span>
              </span>
              <span className="text-muted small">Madagascar (23 Régions · 119 Districts)</span>
            </div>
            <h3 className="h6 fw-bold mb-0 text-dark">
              Carte Démographique &amp; Découpage Administratif
            </h3>
          </div>

          {/* Breadcrumb Navigation & Reset */}
          <div className="d-flex align-items-center gap-2">
            <div className="d-flex p-1 bg-light rounded-3 border">
              <button
                type="button"
                className={`btn btn-sm border-0 d-flex align-items-center gap-1 ${
                  activeTab === 'carte'
                    ? 'bg-white shadow-sm fw-semibold text-primary'
                    : 'text-secondary'
                }`}
                style={{ fontSize: '0.76rem', padding: '0.25rem 0.6rem' }}
                onClick={() => setActiveTab('carte')}
              >
                <Icon name="map" size={13} />
                <span>Carte Globale</span>
              </button>
              <button
                type="button"
                className={`btn btn-sm border-0 d-flex align-items-center gap-1 ${
                  activeTab === 'precision'
                    ? 'bg-white shadow-sm fw-semibold text-primary'
                    : 'text-secondary'
                }`}
                style={{ fontSize: '0.76rem', padding: '0.25rem 0.6rem' }}
                onClick={() => setActiveTab('precision')}
              >
                <Icon name="search" size={13} />
                <span>
                  Précision Régionale
                  {selectedRegion ? ` (${selectedRegion})` : ''}
                </span>
              </button>
            </div>

            {(selectedProvince || selectedRegion || selectedDistrict) && (
              <button
                type="button"
                onClick={onResetFilters}
                className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                title="Afficher tout Madagascar"
              >
                <Icon name="x" size={13} />
                <span>Vue Nationale</span>
              </button>
            )}
          </div>
        </div>

        {/* Interactive Breadcrumb Path */}
        <div className="d-flex flex-wrap align-items-center gap-1 mt-2 pt-2 border-top small">
          <button
            type="button"
            className="btn btn-sm btn-link text-decoration-none p-0 text-primary fw-semibold"
            style={{ fontSize: '0.75rem' }}
            onClick={onResetFilters}
          >
            Madagascar (National)
          </button>

          {selectedProvince && (
            <>
              <span className="text-muted">/</span>
              <button
                type="button"
                className="btn btn-sm btn-link text-decoration-none p-0 text-secondary"
                style={{ fontSize: '0.75rem' }}
                onClick={() => {
                  if (onSelectRegion) onSelectRegion('')
                  if (onSelectDistrict) onSelectDistrict('')
                }}
              >
                Province de {selectedProvince}
              </button>
            </>
          )}

          {selectedRegion && (
            <>
              <span className="text-muted">/</span>
              <span className="badge bg-primary text-white px-2 py-0.5 rounded font-mono" style={{ fontSize: '0.72rem' }}>
                Région : {selectedRegion}
              </span>
            </>
          )}

          {selectedDistrict && (
            <>
              <span className="text-muted">/</span>
              <span className="badge bg-success text-white px-2 py-0.5 rounded font-mono" style={{ fontSize: '0.72rem' }}>
                District : {selectedDistrict}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="card-body p-3 p-md-4">
        <div className="row g-4 align-items-start">
          {/* LEFT COLUMN: THE INTERACTIVE SVG MAP */}
          <div className={activeRegionGeo ? 'col-lg-6' : 'col-lg-8'}>
            <div
              className="p-3 rounded-3 position-relative overflow-hidden"
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                minHeight: '480px',
              }}
            >
              {/* Map Title watermark */}
              <div className="position-absolute top-0 start-0 p-3 pointer-events-none" style={{ zIndex: 1 }}>
                <span className="text-uppercase fw-bold text-muted small" style={{ fontSize: '0.68rem', letterSpacing: '0.08em' }}>
                  Canal de Mozambique
                </span>
              </div>
              <div className="position-absolute top-0 end-0 p-3 pointer-events-none" style={{ zIndex: 1 }}>
                <span className="text-uppercase fw-bold text-muted small" style={{ fontSize: '0.68rem', letterSpacing: '0.08em' }}>
                  Océan Indien
                </span>
              </div>

              {/* SVG MAP OF MADAGASCAR */}
              <svg
                viewBox="70 20 420 750"
                className="w-100 h-auto"
                style={{ maxHeight: '580px', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.06))' }}
              >
                <defs>
                  {/* Glowing filter for highlighted region */}
                  <filter id="mapGlowActive" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#2563eb" floodOpacity="0.6" />
                  </filter>
                  <filter id="mapGlowHover" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#059669" floodOpacity="0.5" />
                  </filter>
                </defs>

                {/* Ocean contour / Island Background glow */}
                <path
                  d="M 370 40 L 400 65 L 445 115 L 460 250 L 435 380 L 410 470 L 385 540 L 360 690 L 345 745 L 275 755 L 205 750 L 135 640 L 115 570 L 130 420 L 140 360 L 190 230 L 260 215 L 320 95 Z"
                  fill="#f1f5f9"
                  stroke="#cbd5e1"
                  strokeWidth="2"
                  strokeLinejoin="round"
                  opacity="0.5"
                />

                {/* RENDER ALL 23 REGIONS */}
                {REGIONS_GEO.map((reg) => {
                  const isSelected =
                    selectedRegion.toLowerCase() === reg.nom.toLowerCase()
                  const isHovered = hoveredRegion?.id === reg.id
                  const isProvinceMatched =
                    selectedProvince &&
                    reg.province.toLowerCase() === selectedProvince.toLowerCase()

                  // Styling
                  let fill = '#e2e8f0'
                  let stroke = '#94a3b8'
                  let strokeWidth = 1.2
                  let filter = undefined

                  if (isSelected) {
                    fill = '#2563eb'
                    stroke = '#ffffff'
                    strokeWidth = 2.5
                    filter = 'url(#mapGlowActive)'
                  } else if (isHovered) {
                    fill = '#10b981'
                    stroke = '#047857'
                    strokeWidth = 2
                    filter = 'url(#mapGlowHover)'
                  } else if (isProvinceMatched) {
                    fill = '#bfdbfe'
                    stroke = '#3b82f6'
                    strokeWidth = 1.8
                  } else if (selectedRegion) {
                    // Dim unselected regions when a specific region is focused
                    fill = '#f1f5f9'
                    stroke = '#cbd5e1'
                    strokeWidth = 1
                  }

                  return (
                    <g key={reg.id}>
                      <path
                        d={reg.path}
                        fill={fill}
                        stroke={stroke}
                        strokeWidth={strokeWidth}
                        strokeLinejoin="round"
                        filter={filter}
                        style={{
                          cursor: 'pointer',
                          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                        onMouseEnter={() => setHoveredRegion(reg)}
                        onMouseLeave={() => setHoveredRegion(null)}
                        onClick={() => handleRegionClick(reg)}
                      />

                      {/* Region centroid marker dot */}
                      <circle
                        cx={reg.center.x}
                        cy={reg.center.y}
                        r={isSelected ? 4.5 : 2.5}
                        fill={isSelected ? '#ffffff' : '#475569'}
                        stroke={isSelected ? '#2563eb' : '#ffffff'}
                        strokeWidth={isSelected ? 2 : 1}
                        style={{ pointerEvents: 'none' }}
                      />

                      {/* Region Name Label (abbreviated or full) */}
                      {(isSelected || isHovered || isProvinceMatched) && (
                        <text
                          x={reg.center.x}
                          y={reg.center.y - 8}
                          textAnchor="middle"
                          className="font-mono fw-bold"
                          style={{
                            fontSize: isSelected ? '11px' : '9px',
                            fill: isSelected ? '#1e293b' : '#334155',
                            pointerEvents: 'none',
                            textShadow: '0 1px 3px rgba(255,255,255,0.9), 0 -1px 3px rgba(255,255,255,0.9)',
                          }}
                        >
                          {reg.nom}
                        </text>
                      )}
                    </g>
                  )
                })}

                {/* ANIMATED RADAR BEACON PIN ON SELECTED REGION */}
                {activeRegionGeo && (
                  <g style={{ pointerEvents: 'none' }}>
                    <circle
                      cx={activeRegionGeo.center.x}
                      cy={activeRegionGeo.center.y}
                      className="chart-pulse-ring"
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="2.5"
                    />
                    <circle
                      cx={activeRegionGeo.center.x}
                      cy={activeRegionGeo.center.y}
                      r="6"
                      fill="#2563eb"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />

                    {/* Flag / Pin Card above selected region */}
                    <g
                      transform={`translate(${activeRegionGeo.center.x - 60}, ${
                        activeRegionGeo.center.y - 42
                      })`}
                    >
                      <rect
                        width="120"
                        height="26"
                        rx="5"
                        fill="#0f172a"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                        opacity="0.95"
                      />
                      <text
                        x="60"
                        y="17"
                        textAnchor="middle"
                        fill="#ffffff"
                        className="font-mono fw-bold"
                        style={{ fontSize: '10px' }}
                      >
                        📍 {activeRegionGeo.nom}
                      </text>
                    </g>
                  </g>
                )}
              </svg>

              {/* Map Floating Legend */}
              <div
                className="position-absolute bottom-0 start-0 p-3 pointer-events-none"
                style={{ zIndex: 1 }}
              >
                <div
                  className="p-2 rounded bg-white bg-opacity-90 border shadow-sm small"
                  style={{ fontSize: '0.72rem', maxWidth: 220 }}
                >
                  <div className="fw-semibold text-dark mb-1">Guide Interactif</div>
                  <div className="d-flex align-items-center gap-1.5 mb-0.5">
                    <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: '#2563eb' }} />
                    <span className="text-secondary">Région active / sélectionnée</span>
                  </div>
                  <div className="d-flex align-items-center gap-1.5 mb-0.5">
                    <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: '#10b981' }} />
                    <span className="text-secondary">Survol (Cliquer pour zoomer)</span>
                  </div>
                  <div className="d-flex align-items-center gap-1.5">
                    <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: '#bfdbfe' }} />
                    <span className="text-secondary">Province correspondante</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: PRECISION DRILL-DOWN PANEL ("comme map mais dans la carte") */}
          <div className={activeRegionGeo ? 'col-lg-6' : 'col-lg-4'}>
            {activeRegionGeo ? (
              <div className="d-flex flex-column gap-3">
                {/* Active Zone Detail Card */}
                <div
                  className="p-3 p-md-4 rounded-3 border position-relative overflow-hidden"
                  style={{
                    backgroundColor: '#ffffff',
                    borderLeft: '4px solid #2563eb !important',
                  }}
                >
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <span
                        className="badge bg-primary bg-opacity-10 text-primary fw-semibold px-2 py-0.5 rounded"
                        style={{ fontSize: '0.72rem' }}
                      >
                        Province de {activeRegionGeo.province}
                      </span>
                      <h4 className="h5 fw-bold text-dark mt-1 mb-0">
                        Région {activeRegionGeo.nom}
                      </h4>
                      <p className="text-muted small mb-0">
                        Chef-lieu régional : <strong>{activeRegionGeo.chefLieu}</strong>
                      </p>
                    </div>

                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => {
                        if (onSelectRegion) onSelectRegion('')
                        if (onSelectDistrict) onSelectDistrict('')
                      }}
                      title="Fermer le zoom régional"
                    >
                      <Icon name="x" size={14} />
                    </button>
                  </div>

                  {/* Census stats summary for this region */}
                  {(() => {
                    const stats = getRegionStats(activeRegionGeo.nom)
                    if (!stats) return null
                    return (
                      <div className="row g-2 mt-2 pt-2 border-top">
                        <div className="col-4">
                          <div className="text-muted small" style={{ fontSize: '0.7rem' }}>
                            Population
                          </div>
                          <div className="fw-bold font-mono text-primary fs-6">
                            {stats.populationTotale} hab.
                          </div>
                        </div>
                        <div className="col-4">
                          <div className="text-muted small" style={{ fontSize: '0.7rem' }}>
                            Chefs de foyer
                          </div>
                          <div className="fw-bold font-mono text-dark fs-6">
                            {stats.individus}
                          </div>
                        </div>
                        <div className="col-4">
                          <div className="text-muted small" style={{ fontSize: '0.7rem' }}>
                            Âge moyen
                          </div>
                          <div className="fw-bold font-mono text-dark fs-6">
                            {stats.ageMoyen} ans
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </div>

                {/* PRECISION MAP / DISTRICTS GRID */}
                <div className="p-3 bg-light rounded-3 border">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div>
                      <h5 className="fw-bold text-dark small mb-0">
                        Districts de {activeRegionGeo.nom} ({activeRegionGeo.districts.length})
                      </h5>
                      <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                        Sélectionnez un district pour affiner la précision
                      </span>
                    </div>

                    {selectedDistrict && (
                      <button
                        type="button"
                        onClick={() => onSelectDistrict && onSelectDistrict('')}
                        className="btn btn-sm btn-link p-0 text-decoration-none small text-danger"
                        style={{ fontSize: '0.72rem' }}
                      >
                        Tous les districts
                      </button>
                    )}
                  </div>

                  {/* District Interactive Buttons / Cards */}
                  <div className="d-flex flex-wrap gap-2">
                    {activeRegionGeo.districts.map((d) => {
                      const isDistActive =
                        selectedDistrict.toLowerCase() === d.nom.toLowerCase()
                      return (
                        <button
                          key={d.nom}
                          type="button"
                          onClick={() => handleDistrictClick(d.nom)}
                          className={`btn btn-sm text-start d-flex align-items-center gap-1.5 rounded-2 transition-all ${
                            isDistActive
                              ? 'btn-primary shadow-sm fw-semibold'
                              : 'btn-white border text-dark hover:bg-white'
                          }`}
                          style={{
                            fontSize: '0.78rem',
                            padding: '0.4rem 0.65rem',
                            backgroundColor: isDistActive ? '#2563eb' : '#ffffff',
                          }}
                        >
                          <Icon
                            name={isDistActive ? 'check' : 'map-pin'}
                            size={13}
                            className={isDistActive ? 'text-white' : 'text-primary'}
                          />
                          <span>{d.nom}</span>
                          {d.isChefLieu && (
                            <span
                              className={`badge rounded-pill ms-1 ${
                                isDistActive ? 'bg-white text-primary' : 'bg-primary bg-opacity-10 text-primary'
                              }`}
                              style={{ fontSize: '0.62rem' }}
                            >
                              Chef-Lieu
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* LEVEL 3 PRECISION: COMMUNES LIST */}
                {selectedDistrict && (
                  <div className="p-3 bg-white rounded-3 border">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="d-flex align-items-center gap-1.5">
                        <Icon name="home" size={15} className="text-success" />
                        <h6 className="fw-bold mb-0 text-dark small">
                          Communes &amp; Arrondissements de {selectedDistrict}
                        </h6>
                      </div>
                      <span className="badge bg-success bg-opacity-10 text-success font-mono small">
                        {communesForActiveDistrict.length} communes
                      </span>
                    </div>

                    <p className="text-muted small mb-2" style={{ fontSize: '0.72rem' }}>
                      Périmètre de découpage du recensement communal et focalisation fokontany :
                    </p>

                    <div className="d-flex flex-wrap gap-1.5">
                      {communesForActiveDistrict.map((comm) => (
                        <span
                          key={comm}
                          className="badge bg-light text-dark border px-2 py-1 rounded"
                          style={{ fontSize: '0.73rem', fontWeight: 500 }}
                        >
                          🏛️ {comm}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* If no region selected, show Madagascar overview details */
              <div className="d-flex flex-column gap-3">
                <div className="p-4 bg-white rounded-3 border h-100">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span className="fs-4">🇲🇬</span>
                    <div>
                      <h4 className="h6 fw-bold mb-0 text-dark">
                        Sélectionnez une zone sur la carte
                      </h4>
                      <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                        Cliquez directement sur une région pour zoomer
                      </div>
                    </div>
                  </div>

                  <p className="text-secondary small mb-3">
                    Cette carte interactive permet d'explorer et filtrer instantanément le
                    recensement à travers les 6 provinces et 23 régions de Madagascar.
                  </p>

                  <div className="fw-semibold text-dark small mb-2">
                    Exemples de régions clés :
                  </div>

                  <div className="d-flex flex-column gap-2">
                    {[
                      { nom: 'Atsimo-Andrefana', prov: 'Toliara', desc: 'Toliara, Morombe, Sakaraha' },
                      { nom: 'Analamanga', prov: 'Antananarivo', desc: 'Antananarivo, Ivato' },
                      { nom: 'Diana', prov: 'Antsiranana', desc: 'Diego-Suarez, Nosy Be' },
                      { nom: 'Boeny', prov: 'Mahajanga', desc: 'Mahajanga, Marovoay' },
                      { nom: 'Atsinanana', prov: 'Toamasina', desc: 'Tamatave, Brickaville' },
                      { nom: 'Matsiatra Ambony', prov: 'Fianarantsoa', desc: 'Fianarantsoa, Ambalavao' },
                    ].map((item) => (
                      <button
                        key={item.nom}
                        type="button"
                        onClick={() => {
                          const reg = REGIONS_GEO.find((r) => r.nom === item.nom)
                          if (reg) handleRegionClick(reg)
                        }}
                        className="btn btn-light text-start d-flex align-items-center justify-content-between p-2 rounded border"
                      >
                        <div>
                          <div className="fw-bold small text-primary">{item.nom}</div>
                          <div className="text-muted" style={{ fontSize: '0.68rem' }}>
                            {item.prov} · {item.desc}
                          </div>
                        </div>
                        <Icon name="chevron-right" size={13} className="text-muted" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
