import { useState, useMemo, useRef } from 'react'
import Icon from './Icon'
import {
  getAllProvinces,
  getRegionsForProvince,
  getCommunesForDistrict,
} from '../data/madagascarGeo'
import {
  REGIONS_GEO,
  PROVINCE_THEMES,
} from '../data/madagascarMapData'
import type { RegionGeoData } from '../data/madagascarMapData'
import type { TerritorialUnit } from '../api/types'
import { useTheme } from '../context/ThemeContext'

// Compute bounding box from SVG path coordinates
function getPathBoundingBox(pathStr: string, pad = 35) {
  const numbers = pathStr.match(/-?\d+(\.\d+)?/g)?.map(Number) || []
  if (numbers.length < 2) {
    return { minX: 70, minY: 20, width: 420, height: 750 }
  }
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity

  for (let i = 0; i < numbers.length; i += 2) {
    const x = numbers[i]
    const y = numbers[i + 1]
    if (x !== undefined && y !== undefined) {
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    }
  }

  const w = maxX - minX
  const h = maxY - minY
  const maxDim = Math.max(w, h)
  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2
  const viewSize = Math.max(maxDim + pad * 2, 130)

  return {
    minX: Math.round(cx - viewSize / 2),
    minY: Math.round(cy - viewSize / 2),
    width: Math.round(viewSize),
    height: Math.round(viewSize),
  }
}

interface MadagascarMapProps {
  selectedProvince?: string
  selectedRegion?: string
  selectedDistrict?: string
  onSelectProvince?: (province: string) => void
  onSelectRegion?: (region: string, province?: string) => void
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
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [hoveredRegion, setHoveredRegion] = useState<RegionGeoData | null>(null)
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null)
  const [selectedCommune, setSelectedCommune] = useState<string>('')
  const [communeSearch, setCommuneSearch] = useState<string>('')
  const [mapSearch, setMapSearch] = useState<string>('')
  const [manualZoom, setManualZoom] = useState<'national' | 'region' | 'district' | null>(null)
  const [manualStepTab, setManualStepTab] = useState<'province' | 'region' | 'district' | 'commune' | null>(null)

  const searchInputRef = useRef<HTMLInputElement>(null)

  // Derived zoom mode and step tab based on selected entities and user override
  const activeStepTab =
    manualStepTab ??
    (selectedDistrict
      ? 'commune'
      : selectedRegion
        ? 'district'
        : selectedProvince
          ? 'region'
          : 'province')

  const zoomMode =
    manualZoom ??
    (selectedDistrict
      ? 'district'
      : selectedRegion
        ? 'region'
        : 'national')

  const setActiveStepTab = (tab: 'province' | 'region' | 'district' | 'commune') => {
    setManualStepTab(tab)
  }

  const setZoomMode = (zoom: 'national' | 'region' | 'district') => {
    setManualZoom(zoom)
  }

  // Get population count for a region if territorial stats exist
  const getRegionStats = (regionName: string) => {
    return (
      territorialUnits.find((u) => u.nom.toLowerCase() === regionName.toLowerCase()) || null
    )
  }

  // Find selected region geo object
  const activeRegionGeo = useMemo(() => {
    if (!selectedRegion) return null
    return (
      REGIONS_GEO.find((r) => r.nom.toLowerCase() === selectedRegion.toLowerCase()) || null
    )
  }, [selectedRegion])

  // Active district object in current region
  const activeDistrictGeo = useMemo(() => {
    if (!activeRegionGeo || !selectedDistrict) return null
    return (
      activeRegionGeo.districts.find(
        (d) => d.nom.toLowerCase() === selectedDistrict.toLowerCase(),
      ) || null
    )
  }, [activeRegionGeo, selectedDistrict])

  // Communes list for the selected district
  const allCommunes = useMemo(() => {
    if (!selectedDistrict) return []
    return getCommunesForDistrict(selectedDistrict)
  }, [selectedDistrict])

  // Filtered communes based on user search
  const filteredCommunes = useMemo(() => {
    if (!communeSearch.trim()) return allCommunes
    const term = communeSearch.toLowerCase()
    return allCommunes.filter((c) => c.toLowerCase().includes(term))
  }, [allCommunes, communeSearch])

  // Compute dynamic SVG viewBox
  const currentViewBox = useMemo(() => {
    const nationalView = '70 20 420 750'
    if (zoomMode === 'national' || !activeRegionGeo) {
      return nationalView
    }

    if (zoomMode === 'district' && activeDistrictGeo) {
      // Zoom close to district coordinates
      const boxSize = 85
      const vx = Math.round(activeDistrictGeo.x - boxSize / 2)
      const vy = Math.round(activeDistrictGeo.y - boxSize / 2)
      return `${vx} ${vy} ${boxSize} ${boxSize}`
    }

    if (zoomMode === 'region' && activeRegionGeo) {
      const bbox = getPathBoundingBox(activeRegionGeo.path, 30)
      return `${bbox.minX} ${bbox.minY} ${bbox.width} ${bbox.height}`
    }

    return nationalView
  }, [zoomMode, activeRegionGeo, activeDistrictGeo])

  // Handle click on a region
  const handleRegionClick = (reg: RegionGeoData) => {
    if (onSelectProvince) onSelectProvince(reg.province)
    if (onSelectRegion) onSelectRegion(reg.nom, reg.province)
    if (onSelectDistrict) onSelectDistrict('')
    setSelectedCommune('')
    setZoomMode('region')
    setActiveStepTab('district')
  }

  // Handle click on a district
  const handleDistrictClick = (districtName: string) => {
    if (onSelectDistrict) onSelectDistrict(districtName)
    setSelectedCommune('')
    setZoomMode('district')
    setActiveStepTab('commune')
  }

  // Global search handler (jumps directly to province, region, district or commune)
  const handleGlobalSearch = (val: string) => {
    setMapSearch(val)
    if (!val.trim()) return
    const term = val.trim().toLowerCase()

    // 1. Match Region
    const matchedReg = REGIONS_GEO.find(
      (r) => r.nom.toLowerCase().includes(term) || r.chefLieu.toLowerCase().includes(term),
    )
    if (matchedReg) {
      handleRegionClick(matchedReg)
      return
    }

    // 2. Match District
    for (const reg of REGIONS_GEO) {
      const dist = reg.districts.find((d) => d.nom.toLowerCase().includes(term))
      if (dist) {
        handleRegionClick(reg)
        handleDistrictClick(dist.nom)
        return
      }
    }

    // 3. Match Province
    const provinces = getAllProvinces()
    const matchedProv = provinces.find((p) => p.toLowerCase().includes(term))
    if (matchedProv) {
      if (onSelectProvince) onSelectProvince(matchedProv)
      if (onSelectRegion) onSelectRegion('')
      if (onSelectDistrict) onSelectDistrict('')
      setZoomMode('national')
    }
  }

  // Reset to national view
  const handleResetToNational = () => {
    if (onResetFilters) onResetFilters()
    setSelectedCommune('')
    setCommuneSearch('')
    setMapSearch('')
    setZoomMode('national')
    setActiveStepTab('province')
  }

  // Palette constants
  const oceanBg = isDark ? '#070f1e' : '#f0f9ff'
  const oceanBorder = isDark ? '#1e293b' : '#bae6fd'
  const graticuleStroke = isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(14, 116, 144, 0.08)'

  return (
    <div
      className="card border-0 shadow-sm overflow-hidden mb-4 transition-all"
      style={{
        backgroundColor: isDark ? '#0f172a' : '#ffffff',
        border: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0',
      }}
    >
      {/* 1. TOP HEADER & INTERACTIVE NAVIGATION BAR */}
      <div
        className="card-header border-bottom p-3 p-md-4"
        style={{
          backgroundColor: isDark ? '#0b1329' : '#f8fafc',
          borderColor: isDark ? '#1e293b' : '#e2e8f0',
        }}
      >
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span
                className="badge fw-semibold px-2.5 py-1 rounded-pill d-flex align-items-center gap-1.5 shadow-xs"
                style={{
                  backgroundColor: isDark ? '#064e3b' : '#ecfdf5',
                  color: isDark ? '#34d399' : '#059669',
                  border: isDark ? '1px solid #059669' : '1px solid #a7f3d0',
                  fontSize: '0.72rem',
                }}
              >
                <Icon name="map" size={13} />
                <span>Système Cartographique Intéractif</span>
              </span>
              <span className="text-secondary small font-mono">
                Madagascar · 6 Provinces · 23 Régions · 119 Districts
              </span>
            </div>
            <h3 className={`h6 fw-bold mb-0 ${isDark ? 'text-white' : 'text-dark'}`}>
              Visualisation &amp; Découpage Cartographique de Précision
            </h3>
          </div>

          {/* Quick Search and Reset Actions */}
          <div className="d-flex flex-wrap align-items-center gap-2">
            <div className="position-relative" style={{ minWidth: 240 }}>
              <input
                ref={searchInputRef}
                type="text"
                value={mapSearch}
                onChange={(e) => handleGlobalSearch(e.target.value)}
                placeholder="Rechercher (ex: Atsimo, Toliara...)"
                className="form-control form-control-sm ps-4 rounded-pill"
                style={{
                  fontSize: '0.76rem',
                  backgroundColor: isDark ? '#1e293b' : '#ffffff',
                  color: isDark ? '#f8fafc' : '#0f172a',
                  borderColor: isDark ? '#334155' : '#cbd5e1',
                }}
              />
              <span className="position-absolute top-50 start-0 translate-middle-y ms-2.5 text-muted pointer-events-none d-flex align-items-center">
                <Icon name="search" size={13} />
              </span>
              {mapSearch && (
                <button
                  type="button"
                  className="btn btn-sm btn-link p-0 position-absolute top-50 end-0 translate-middle-y me-2 text-muted"
                  onClick={() => setMapSearch('')}
                >
                  <Icon name="x" size={13} />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleResetToNational}
              className={`btn btn-sm d-flex align-items-center gap-1.5 rounded-pill px-3 ${
                isDark ? 'btn-outline-light' : 'btn-outline-primary'
              }`}
              style={{ fontSize: '0.76rem' }}
            >
              <Icon name="globe" size={14} />
              <span className="fw-semibold">Vue Nationale</span>
            </button>
          </div>
        </div>

        {/* 2. HIERARCHICAL STEPPER (PROVINCE -> REGION -> DISTRICT -> COMMUNE) */}
        <div className="mt-3 pt-3 border-top d-flex flex-wrap align-items-center justify-content-between gap-2">
          {/* Visual Step Pills */}
          <div className="d-flex flex-wrap align-items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setActiveStepTab('province')
                setZoomMode('national')
              }}
              className={`btn btn-sm py-1 px-2.5 rounded-pill border-0 d-flex align-items-center gap-1 transition-all ${
                activeStepTab === 'province'
                  ? 'btn-primary shadow-xs fw-bold'
                  : isDark
                    ? 'text-light hover:bg-dark'
                    : 'text-secondary hover:bg-white'
              }`}
              style={{ fontSize: '0.74rem' }}
            >
              <span className="badge rounded-circle bg-white text-dark" style={{ width: 16, height: 16, fontSize: '0.62rem', lineHeight: '16px', padding: 0 }}>
                1
              </span>
              <span>Province {selectedProvince ? `(${selectedProvince})` : ''}</span>
            </button>

            <span className="text-muted small">&rarr;</span>

            <button
              type="button"
              onClick={() => {
                setActiveStepTab('region')
                if (selectedRegion) setZoomMode('region')
              }}
              className={`btn btn-sm py-1 px-2.5 rounded-pill border-0 d-flex align-items-center gap-1 transition-all ${
                activeStepTab === 'region'
                  ? 'btn-primary shadow-xs fw-bold'
                  : isDark
                    ? 'text-light'
                    : 'text-secondary'
              }`}
              style={{ fontSize: '0.74rem' }}
            >
              <span className="badge rounded-circle bg-white text-dark" style={{ width: 16, height: 16, fontSize: '0.62rem', lineHeight: '16px', padding: 0 }}>
                2
              </span>
              <span>Région {selectedRegion ? `(${selectedRegion})` : ''}</span>
            </button>

            <span className="text-muted small">&rarr;</span>

            <button
              type="button"
              disabled={!selectedRegion}
              onClick={() => {
                setActiveStepTab('district')
                if (selectedRegion) setZoomMode('region')
              }}
              className={`btn btn-sm py-1 px-2.5 rounded-pill border-0 d-flex align-items-center gap-1 transition-all ${
                activeStepTab === 'district'
                  ? 'btn-primary shadow-xs fw-bold'
                  : !selectedRegion
                    ? 'opacity-40'
                    : isDark
                      ? 'text-light'
                      : 'text-secondary'
              }`}
              style={{ fontSize: '0.74rem' }}
            >
              <span className="badge rounded-circle bg-white text-dark" style={{ width: 16, height: 16, fontSize: '0.62rem', lineHeight: '16px', padding: 0 }}>
                3
              </span>
              <span>District {selectedDistrict ? `(${selectedDistrict})` : ''}</span>
            </button>

            <span className="text-muted small">&rarr;</span>

            <button
              type="button"
              disabled={!selectedDistrict}
              onClick={() => {
                setActiveStepTab('commune')
                if (selectedDistrict) setZoomMode('district')
              }}
              className={`btn btn-sm py-1 px-2.5 rounded-pill border-0 d-flex align-items-center gap-1 transition-all ${
                activeStepTab === 'commune'
                  ? 'btn-success shadow-xs fw-bold text-white'
                  : !selectedDistrict
                    ? 'opacity-40'
                    : isDark
                      ? 'text-light'
                      : 'text-secondary'
              }`}
              style={{ fontSize: '0.74rem' }}
            >
              <span className="badge rounded-circle bg-white text-dark" style={{ width: 16, height: 16, fontSize: '0.62rem', lineHeight: '16px', padding: 0 }}>
                4
              </span>
              <span>Commune {selectedCommune ? `(${selectedCommune})` : ''}</span>
            </button>
          </div>

          {/* Quick Zoom Mode Toggles */}
          <div className="d-flex align-items-center gap-1">
            <span className="text-muted small me-1 d-none d-md-inline" style={{ fontSize: '0.72rem' }}>
              Niveau de zoom :
            </span>
            <div
              className="btn-group btn-group-sm p-0.5 rounded-pill border"
              style={{ backgroundColor: isDark ? '#1e293b' : '#ffffff' }}
            >
              <button
                type="button"
                onClick={() => setZoomMode('national')}
                className={`btn btn-sm py-0.5 px-2 rounded-pill border-0 ${
                  zoomMode === 'national' ? 'btn-secondary text-white fw-bold' : 'text-muted'
                }`}
                style={{ fontSize: '0.7rem' }}
                title="Vue globale île de Madagascar"
              >
                National
              </button>
              <button
                type="button"
                disabled={!activeRegionGeo}
                onClick={() => setZoomMode('region')}
                className={`btn btn-sm py-0.5 px-2 rounded-pill border-0 ${
                  zoomMode === 'region' ? 'btn-primary text-white fw-bold' : 'text-muted'
                }`}
                style={{ fontSize: '0.7rem' }}
                title="Zoom ciblé sur la région"
              >
                Région
              </button>
              <button
                type="button"
                disabled={!activeDistrictGeo}
                onClick={() => setZoomMode('district')}
                className={`btn btn-sm py-0.5 px-2 rounded-pill border-0 ${
                  zoomMode === 'district' ? 'btn-success text-white fw-bold' : 'text-muted'
                }`}
                style={{ fontSize: '0.7rem' }}
                title="Zoom détaillé sur le district"
              >
                District
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN CARTE & PRECISION DRILLDOWN BODY */}
      <div className="card-body p-3 p-md-4">
        <div className="row g-4 align-items-start">
          {/* ========================================================================= */}
          {/* LEFT: THE CARTOGRAPHIC SVG MAP CANVAS */}
          {/* ========================================================================= */}
          <div className={activeRegionGeo ? 'col-lg-7' : 'col-lg-8'}>
            <div
              className="position-relative rounded-3 overflow-hidden shadow-inner"
              style={{
                backgroundColor: oceanBg,
                border: `1px solid ${oceanBorder}`,
                minHeight: '520px',
              }}
            >
              {/* Maritime Sea Watermarks */}
              <div
                className="position-absolute top-0 start-0 p-3 pointer-events-none"
                style={{ zIndex: 2 }}
              >
                <div
                  className="text-uppercase fw-bold font-mono text-muted tracking-wider"
                  style={{
                    fontSize: '0.68rem',
                    letterSpacing: '0.12em',
                    opacity: isDark ? 0.45 : 0.65,
                  }}
                >
                  Canal de Mozambique
                </div>
                <div className="text-muted" style={{ fontSize: '0.62rem', opacity: 0.5 }}>
                  Côte Ouest · Océan Indien
                </div>
              </div>

              <div
                className="position-absolute top-0 end-0 p-3 text-end pointer-events-none"
                style={{ zIndex: 2 }}
              >
                <div
                  className="text-uppercase fw-bold font-mono text-muted tracking-wider"
                  style={{
                    fontSize: '0.68rem',
                    letterSpacing: '0.12em',
                    opacity: isDark ? 0.45 : 0.65,
                  }}
                >
                  Océan Indien
                </div>
                <div className="text-muted" style={{ fontSize: '0.62rem', opacity: 0.5 }}>
                  Côte Est
                </div>
              </div>

              {/* FLOATING ZOOM CONTROLS OVERLAY */}
              <div
                className="position-absolute top-0 end-0 m-3 d-flex flex-column gap-1.5 shadow-sm rounded-2 overflow-hidden"
                style={{ zIndex: 10 }}
              >
                <button
                  type="button"
                  onClick={() => {
                    if (zoomMode === 'national' && activeRegionGeo) setZoomMode('region')
                    else if (zoomMode === 'region' && activeDistrictGeo) setZoomMode('district')
                  }}
                  className={`btn btn-sm ${isDark ? 'btn-dark border-secondary' : 'btn-white border'} p-1.5`}
                  title="Zoomer (+)"
                  disabled={zoomMode === 'district' || (!activeRegionGeo && !activeDistrictGeo)}
                >
                  <Icon name="search" size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (zoomMode === 'district') setZoomMode('region')
                    else if (zoomMode === 'region') setZoomMode('national')
                  }}
                  className={`btn btn-sm ${isDark ? 'btn-dark border-secondary' : 'btn-white border'} p-1.5`}
                  title="Dézoomer (-)"
                  disabled={zoomMode === 'national'}
                >
                  <Icon name="chevron-down" size={14} />
                </button>
                <button
                  type="button"
                  onClick={handleResetToNational}
                  className={`btn btn-sm ${isDark ? 'btn-dark border-secondary' : 'btn-white border'} p-1.5`}
                  title="Recadrer vue nationale"
                >
                  <Icon name="refresh" size={14} />
                </button>
              </div>

              {/* INTERACTIVE SVG MAP */}
              <svg
                viewBox={currentViewBox}
                className="w-100 h-auto"
                style={{
                  maxHeight: '620px',
                  transition: 'viewBox 0.75s cubic-bezier(0.16, 1, 0.3, 1)',
                  filter: isDark
                    ? 'drop-shadow(0 6px 18px rgba(0,0,0,0.5))'
                    : 'drop-shadow(0 6px 16px rgba(0,0,0,0.08))',
                }}
              >
                <defs>
                  {/* Ocean gradient background */}
                  <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={isDark ? '#060d1a' : '#e0f2fe'} />
                    <stop offset="50%" stopColor={isDark ? '#09152b' : '#f0f9ff'} />
                    <stop offset="100%" stopColor={isDark ? '#060d1a' : '#e0f2fe'} />
                  </linearGradient>

                  {/* Active Region Glow Filters */}
                  <filter id="activeRegionGlow" x="-25%" y="-25%" width="150%" height="150%">
                    <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#f59e0b" floodOpacity="0.75" />
                  </filter>
                  <filter id="hoverRegionGlow" x="-25%" y="-25%" width="150%" height="150%">
                    <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#10b981" floodOpacity="0.65" />
                  </filter>
                </defs>

                {/* Background Water Canvas */}
                <rect x="0" y="0" width="600" height="850" fill="url(#oceanGrad)" />

                {/* Cartographic Nautical Graticules (Latitude & Longitude parallels) */}
                <g stroke={graticuleStroke} strokeWidth="1" strokeDasharray="3 3">
                  <line x1="70" y1="120" x2="480" y2="120" />
                  <text x="80" y="116" fill={isDark ? '#64748b' : '#94a3b8'} fontSize="8" fontFamily="monospace">
                    14° S
                  </text>
                  <line x1="70" y1="280" x2="480" y2="280" />
                  <text x="80" y="276" fill={isDark ? '#64748b' : '#94a3b8'} fontSize="8" fontFamily="monospace">
                    18° S
                  </text>
                  <line x1="70" y1="450" x2="480" y2="450" />
                  <text x="80" y="446" fill={isDark ? '#64748b' : '#94a3b8'} fontSize="8" fontFamily="monospace">
                    22° S (Tropique du Capricorne)
                  </text>
                  <line x1="70" y1="650" x2="480" y2="650" />
                  <text x="80" y="646" fill={isDark ? '#64748b' : '#94a3b8'} fontSize="8" fontFamily="monospace">
                    25° S
                  </text>

                  <line x1="180" y1="30" x2="180" y2="780" />
                  <text x="184" y="42" fill={isDark ? '#64748b' : '#94a3b8'} fontSize="8" fontFamily="monospace">
                    44° E
                  </text>
                  <line x1="330" y1="30" x2="330" y2="780" />
                  <text x="334" y="42" fill={isDark ? '#64748b' : '#94a3b8'} fontSize="8" fontFamily="monospace">
                    48° E
                  </text>
                  <line x1="430" y1="30" x2="430" y2="780" />
                  <text x="434" y="42" fill={isDark ? '#64748b' : '#94a3b8'} fontSize="8" fontFamily="monospace">
                    50° E
                  </text>
                </g>

                {/* Coastal Bathymetry Halo Outer Glow */}
                <path
                  d="M 370 40 L 400 65 L 445 115 L 460 250 L 435 380 L 410 470 L 385 540 L 360 690 L 345 745 L 275 755 L 205 750 L 135 640 L 115 570 L 130 420 L 140 360 L 190 230 L 260 215 L 320 95 Z"
                  fill="none"
                  stroke={isDark ? '#0284c7' : '#38bdf8'}
                  strokeWidth="8"
                  strokeLinejoin="round"
                  opacity="0.3"
                />

                {/* RENDER ALL 23 REGIONS */}
                {REGIONS_GEO.map((reg) => {
                  const isSelected = selectedRegion.toLowerCase() === reg.nom.toLowerCase()
                  const isHovered = hoveredRegion?.id === reg.id
                  const isProvinceMatched =
                    selectedProvince &&
                    reg.province.toLowerCase() === selectedProvince.toLowerCase()

                  const themeCfg = PROVINCE_THEMES[reg.province] || PROVINCE_THEMES['Antananarivo']

                  // Calculate fill and stroke colors
                  let fill = isDark ? themeCfg.fillDark : themeCfg.fillLight
                  let stroke = isDark ? themeCfg.borderDark : themeCfg.stroke
                  let strokeWidth = 1.3
                  let filter = undefined
                  let opacity = 1

                  if (isSelected) {
                    fill = isDark ? '#b45309' : '#f59e0b'
                    stroke = '#ffffff'
                    strokeWidth = 3
                    filter = 'url(#activeRegionGlow)'
                  } else if (isHovered) {
                    fill = isDark ? '#065f46' : '#10b981'
                    stroke = '#ffffff'
                    strokeWidth = 2.4
                    filter = 'url(#hoverRegionGlow)'
                  } else if (isProvinceMatched) {
                    // Province highlighted
                    fill = isDark ? themeCfg.color : themeCfg.borderLight
                    stroke = '#ffffff'
                    strokeWidth = 2
                  } else if (selectedRegion) {
                    // Dim background regions when a region is in focus
                    opacity = isDark ? 0.35 : 0.45
                    fill = isDark ? '#1e293b' : '#f1f5f9'
                    stroke = isDark ? '#334155' : '#cbd5e1'
                    strokeWidth = 1
                  }

                  return (
                    <g key={reg.id} className="transition-all">
                      <path
                        d={reg.path}
                        fill={fill}
                        stroke={stroke}
                        strokeWidth={strokeWidth}
                        strokeLinejoin="round"
                        filter={filter}
                        opacity={opacity}
                        style={{
                          cursor: 'pointer',
                          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                        onMouseEnter={() => setHoveredRegion(reg)}
                        onMouseLeave={() => setHoveredRegion(null)}
                        onClick={() => handleRegionClick(reg)}
                      />

                      {/* Centroid Node */}
                      <circle
                        cx={reg.center.x}
                        cy={reg.center.y}
                        r={isSelected ? 5 : isHovered ? 4 : 2.5}
                        fill={isSelected ? '#ffffff' : themeCfg.color}
                        stroke={isSelected ? '#b45309' : '#ffffff'}
                        strokeWidth={isSelected ? 2 : 1}
                        style={{ pointerEvents: 'none' }}
                      />

                      {/* Region Label */}
                      {(isSelected || isHovered || isProvinceMatched || zoomMode === 'region') && (
                        <text
                          x={reg.center.x}
                          y={reg.center.y - (isSelected ? 10 : 7)}
                          textAnchor="middle"
                          className="font-mono fw-bold"
                          style={{
                            fontSize: isSelected ? '11px' : '9px',
                            fill: isSelected
                              ? '#ffffff'
                              : isDark
                                ? '#f8fafc'
                                : '#0f172a',
                            fontWeight: isSelected ? 800 : 700,
                            pointerEvents: 'none',
                            textShadow: isDark
                              ? '0 1px 4px #000, 0 -1px 4px #000'
                              : '0 1px 3px #fff, 0 -1px 3px #fff',
                          }}
                        >
                          {reg.nom}
                        </text>
                      )}
                    </g>
                  )
                })}

                {/* DISTRICT LEVEL PINS & LABELS (When a region is selected or zoomed) */}
                {activeRegionGeo && (
                  <g className="district-nodes-group">
                    {activeRegionGeo.districts.map((d) => {
                      const isDistActive =
                        selectedDistrict.toLowerCase() === d.nom.toLowerCase()
                      const isDistHover = hoveredDistrict === d.nom

                      return (
                        <g
                          key={d.nom}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDistrictClick(d.nom)
                          }}
                          onMouseEnter={() => setHoveredDistrict(d.nom)}
                          onMouseLeave={() => setHoveredDistrict(null)}
                          style={{ cursor: 'pointer' }}
                        >
                          {/* Pulsing beacon if active */}
                          {isDistActive && (
                            <circle
                              cx={d.x}
                              cy={d.y}
                              className="chart-pulse-ring"
                              fill="none"
                              stroke="#2563eb"
                              strokeWidth="2.5"
                            />
                          )}

                          {/* Outer pin halo */}
                          <circle
                            cx={d.x}
                            cy={d.y}
                            r={isDistActive ? 7 : isDistHover ? 6 : 4}
                            fill={isDistActive ? '#2563eb' : d.isChefLieu ? '#f59e0b' : '#059669'}
                            stroke="#ffffff"
                            strokeWidth={isDistActive ? 2.5 : 1.5}
                          />

                          {/* District Centroid Dot */}
                          <circle
                            cx={d.x}
                            cy={d.y}
                            r={isDistActive ? 3 : 1.8}
                            fill="#ffffff"
                          />

                          {/* District Name Label */}
                          <g transform={`translate(${d.x}, ${d.y + 12})`}>
                            <rect
                              x={-((d.nom.length * 5.5 + 10) / 2)}
                              y="-8"
                              width={d.nom.length * 5.5 + 10}
                              height="14"
                              rx="3"
                              fill={
                                isDistActive
                                  ? '#2563eb'
                                  : isDark
                                    ? 'rgba(15, 23, 42, 0.92)'
                                    : 'rgba(255, 255, 255, 0.95)'
                              }
                              stroke={isDistActive ? '#ffffff' : isDark ? '#334155' : '#cbd5e1'}
                              strokeWidth="0.8"
                            />
                            <text
                              x="0"
                              y="2"
                              textAnchor="middle"
                              fill={
                                isDistActive
                                  ? '#ffffff'
                                  : isDark
                                    ? '#f8fafc'
                                    : '#1e293b'
                              }
                              fontFamily="monospace"
                              fontSize="7.5px"
                              fontWeight={isDistActive || d.isChefLieu ? 'bold' : 'normal'}
                            >
                              {d.nom}
                            </text>
                          </g>
                        </g>
                      )
                    })}
                  </g>
                )}

                {/* ANIMATED PULSE PIN FOR ACTIVE REGION / CHEF LIEU */}
                {activeRegionGeo && !selectedDistrict && (
                  <g style={{ pointerEvents: 'none' }}>
                    <circle
                      cx={activeRegionGeo.center.x}
                      cy={activeRegionGeo.center.y}
                      className="chart-pulse-ring"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="2.5"
                    />
                    <circle
                      cx={activeRegionGeo.center.x}
                      cy={activeRegionGeo.center.y}
                      r="6"
                      fill="#f59e0b"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />

                    {/* Pin Callout Box */}
                    <g
                      transform={`translate(${activeRegionGeo.center.x - 65}, ${
                        activeRegionGeo.center.y - 44
                      })`}
                    >
                      <rect
                        width="130"
                        height="26"
                        rx="6"
                        fill={isDark ? '#0f172a' : '#1e293b'}
                        stroke="#f59e0b"
                        strokeWidth="1.5"
                        opacity="0.95"
                      />
                      <text
                        x="65"
                        y="17"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontFamily="monospace"
                        fontWeight="bold"
                        fontSize="10px"
                      >
                        {activeRegionGeo.nom.toUpperCase()}
                      </text>
                    </g>
                  </g>
                )}

                {/* NAUTICAL COMPASS ROSE (Boussole) */}
                <g transform="translate(100, 680)" style={{ pointerEvents: 'none', opacity: isDark ? 0.6 : 0.75 }}>
                  <circle cx="0" cy="0" r="22" fill="none" stroke={isDark ? '#475569' : '#94a3b8'} strokeWidth="1" />
                  <circle cx="0" cy="0" r="18" fill="none" stroke={isDark ? '#334155' : '#cbd5e1'} strokeWidth="0.5" strokeDasharray="2 2" />
                  {/* North needle */}
                  <polygon points="0,-20 4,-5 0,0" fill="#e11d48" />
                  <polygon points="0,-20 -4,-5 0,0" fill="#be123c" />
                  {/* South needle */}
                  <polygon points="0,20 4,5 0,0" fill={isDark ? '#94a3b8' : '#64748b'} />
                  <polygon points="0,20 -4,5 0,0" fill={isDark ? '#64748b' : '#475569'} />
                  {/* East / West */}
                  <polygon points="20,0 5,4 0,0" fill={isDark ? '#94a3b8' : '#64748b'} />
                  <polygon points="-20,0 -5,-4 0,0" fill={isDark ? '#94a3b8' : '#64748b'} />
                  {/* N label */}
                  <text x="0" y="-23" textAnchor="middle" fill="#e11d48" fontWeight="bold" fontSize="9" fontFamily="monospace">
                    N
                  </text>
                  <text x="0" y="29" textAnchor="middle" fill={isDark ? '#cbd5e1' : '#64748b'} fontSize="7" fontFamily="monospace">
                    S
                  </text>
                  <text x="25" y="3" textAnchor="start" fill={isDark ? '#cbd5e1' : '#64748b'} fontSize="7" fontFamily="monospace">
                    E
                  </text>
                  <text x="-25" y="3" textAnchor="end" fill={isDark ? '#cbd5e1' : '#64748b'} fontSize="7" fontFamily="monospace">
                    O
                  </text>
                </g>

                {/* GRAPHIC SCALE BAR (Échelle) */}
                <g transform="translate(260, 785)" style={{ pointerEvents: 'none', opacity: 0.8 }}>
                  <rect x="0" y="0" width="80" height="3" fill={isDark ? '#ffffff' : '#0f172a'} />
                  <rect x="80" y="0" width="80" height="3" fill={isDark ? '#64748b' : '#cbd5e1'} />
                  <line x1="0" y1="-2" x2="0" y2="5" stroke={isDark ? '#ffffff' : '#0f172a'} strokeWidth="1" />
                  <line x1="80" y1="-2" x2="80" y2="5" stroke={isDark ? '#ffffff' : '#0f172a'} strokeWidth="1" />
                  <line x1="160" y1="-2" x2="160" y2="5" stroke={isDark ? '#ffffff' : '#0f172a'} strokeWidth="1" />
                  <text x="0" y="-4" textAnchor="middle" fill={isDark ? '#94a3b8' : '#64748b'} fontSize="6.5" fontFamily="monospace">
                    0
                  </text>
                  <text x="80" y="-4" textAnchor="middle" fill={isDark ? '#94a3b8' : '#64748b'} fontSize="6.5" fontFamily="monospace">
                    100 km
                  </text>
                  <text x="160" y="-4" textAnchor="middle" fill={isDark ? '#94a3b8' : '#64748b'} fontSize="6.5" fontFamily="monospace">
                    200 km
                  </text>
                </g>
              </svg>

              {/* FLOATING PROVINCE THEMATIC LEGEND */}
              <div
                className="position-absolute bottom-0 start-0 p-2.5 pointer-events-none"
                style={{ zIndex: 10 }}
              >
                <div
                  className="p-2 rounded-3 shadow-sm border small"
                  style={{
                    backgroundColor: isDark ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(8px)',
                    borderColor: isDark ? '#334155' : '#e2e8f0',
                    fontSize: '0.68rem',
                    maxWidth: 240,
                  }}
                >
                  <div className={`fw-bold mb-1 ${isDark ? 'text-white' : 'text-dark'}`}>
                    Provinces &amp; Découpage
                  </div>
                  <div className="d-flex flex-wrap gap-x-2 gap-y-1">
                    {Object.values(PROVINCE_THEMES).map((pt) => (
                      <div key={pt.name} className="d-flex align-items-center gap-1">
                        <span
                          style={{
                            width: 9,
                            height: 9,
                            borderRadius: 2,
                            backgroundColor: pt.color,
                          }}
                        />
                        <span className={isDark ? 'text-light' : 'text-secondary'}>
                          {pt.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT: MULTI-LEVEL DRILLDOWN PANEL ("PROVINCE -> REGION -> DISTRICT -> COMMUNE") */}
          {/* ========================================================================= */}
          <div className={activeRegionGeo ? 'col-lg-5' : 'col-lg-4'}>
            {activeRegionGeo ? (
              <div className="d-flex flex-column gap-3">
                {/* 1. REGION HERO CARD */}
                <div
                  className="p-3 rounded-3 border position-relative overflow-hidden shadow-xs"
                  style={{
                    backgroundColor: isDark ? '#1e293b' : '#ffffff',
                    borderTopColor: isDark ? '#334155' : '#e2e8f0',
                    borderRightColor: isDark ? '#334155' : '#e2e8f0',
                    borderBottomColor: isDark ? '#334155' : '#e2e8f0',
                    borderLeftColor:
                      PROVINCE_THEMES[activeRegionGeo.province]?.color || '#2563eb',
                    borderLeftWidth: '4px',
                    borderLeftStyle: 'solid',
                  }}
                >
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <span
                        className="badge px-2 py-0.5 rounded-pill font-mono fw-semibold"
                        style={{
                          backgroundColor: PROVINCE_THEMES[activeRegionGeo.province]?.badgeBg || '#e0f2fe',
                          color: PROVINCE_THEMES[activeRegionGeo.province]?.badgeText || '#0369a1',
                          fontSize: '0.7rem',
                        }}
                      >
                        Province de {activeRegionGeo.province}
                      </span>
                      <h4 className={`h5 fw-bold mt-1 mb-0 ${isDark ? 'text-white' : 'text-dark'}`}>
                        Région {activeRegionGeo.nom}
                      </h4>
                      <p className="text-muted small mb-0" style={{ fontSize: '0.74rem' }}>
                        Chef-lieu régional : <strong>{activeRegionGeo.chefLieu}</strong>
                      </p>
                    </div>

                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary p-1 rounded-circle"
                      onClick={handleResetToNational}
                      title="Revenir à la vue nationale"
                    >
                      <Icon name="x" size={13} />
                    </button>
                  </div>

                  {/* Census stats summary for this region */}
                  {(() => {
                    const stats = getRegionStats(activeRegionGeo.nom)
                    if (!stats) return null
                    return (
                      <div className="row g-2 mt-2 pt-2 border-top">
                        <div className="col-4">
                          <div className="text-muted small" style={{ fontSize: '0.68rem' }}>
                            Population totale
                          </div>
                          <div className="fw-bold font-mono text-primary" style={{ fontSize: '0.88rem' }}>
                            {stats.populationTotale} hab.
                          </div>
                        </div>
                        <div className="col-4">
                          <div className="text-muted small" style={{ fontSize: '0.68rem' }}>
                            Ménages recensés
                          </div>
                          <div className={`fw-bold font-mono ${isDark ? 'text-white' : 'text-dark'}`} style={{ fontSize: '0.88rem' }}>
                            {stats.individus}
                          </div>
                        </div>
                        <div className="col-4">
                          <div className="text-muted small" style={{ fontSize: '0.68rem' }}>
                            Âge moyen
                          </div>
                          <div className={`fw-bold font-mono ${isDark ? 'text-white' : 'text-dark'}`} style={{ fontSize: '0.88rem' }}>
                            {stats.ageMoyen} ans
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </div>

                {/* 2. DISTRICT DRILLDOWN CARD (WITH SELECTABLE DISTRICTS) */}
                <div
                  className="p-3 rounded-3 border shadow-xs"
                  style={{
                    backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                    borderColor: isDark ? '#334155' : '#e2e8f0',
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div>
                      <h5 className={`fw-bold small mb-0 ${isDark ? 'text-white' : 'text-dark'}`}>
                        Districts de {activeRegionGeo.nom} ({activeRegionGeo.districts.length})
                      </h5>
                      <span className="text-muted" style={{ fontSize: '0.68rem' }}>
                        Cliquez sur un district pour afficher ses communes et zoomer
                      </span>
                    </div>

                    {selectedDistrict && (
                      <button
                        type="button"
                        onClick={() => {
                          if (onSelectDistrict) onSelectDistrict('')
                          setSelectedCommune('')
                          setZoomMode('region')
                          setActiveStepTab('district')
                        }}
                        className="btn btn-sm btn-link p-0 text-decoration-none small text-danger"
                        style={{ fontSize: '0.72rem' }}
                      >
                        Tous les districts
                      </button>
                    )}
                  </div>

                  {/* District buttons grid */}
                  <div className="d-flex flex-wrap gap-1.5 mt-2">
                    {activeRegionGeo.districts.map((d) => {
                      const isDistActive =
                        selectedDistrict.toLowerCase() === d.nom.toLowerCase()
                      return (
                        <button
                          key={d.nom}
                          type="button"
                          onClick={() => handleDistrictClick(d.nom)}
                          className={`btn btn-sm text-start d-flex align-items-center gap-1 rounded-2 transition-all ${
                            isDistActive
                              ? 'btn-primary shadow-xs fw-semibold'
                              : isDark
                                ? 'btn-dark border border-secondary text-light'
                                : 'btn-white border text-dark'
                          }`}
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.35rem 0.55rem',
                          }}
                        >
                          <Icon
                            name={isDistActive ? 'check' : 'map-pin'}
                            size={12}
                            className={isDistActive ? 'text-white' : 'text-primary'}
                          />
                          <span>{d.nom}</span>
                          {d.isChefLieu && (
                            <span
                              className={`badge rounded-pill ms-1 ${
                                isDistActive ? 'bg-white text-primary' : 'bg-warning text-dark'
                              }`}
                              style={{ fontSize: '0.6rem', padding: '0.15rem 0.4rem' }}
                            >
                              Chef-Lieu
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* 3. LEVEL 4 PRECISION: COMMUNES DRILLDOWN EXPLORER */}
                {selectedDistrict && (
                  <div
                    className="p-3 rounded-3 border shadow-xs"
                    style={{
                      backgroundColor: isDark ? '#1e293b' : '#ffffff',
                      borderColor: isDark ? '#334155' : '#e2e8f0',
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="d-flex align-items-center gap-1.5">
                        <Icon name="home" size={15} className="text-success" />
                        <h6 className={`fw-bold mb-0 small ${isDark ? 'text-white' : 'text-dark'}`}>
                          Communes de {selectedDistrict}
                        </h6>
                      </div>
                      <span className="badge bg-success bg-opacity-10 text-success font-mono small">
                        {allCommunes.length} communes
                      </span>
                    </div>

                    {/* Commune Search Filter */}
                    <div className="mb-2">
                      <input
                        type="text"
                        value={communeSearch}
                        onChange={(e) => setCommuneSearch(e.target.value)}
                        placeholder={`Filtrer parmi les communes de ${selectedDistrict}...`}
                        className="form-control form-control-sm rounded"
                        style={{
                          fontSize: '0.74rem',
                          backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                          color: isDark ? '#f8fafc' : '#0f172a',
                          borderColor: isDark ? '#334155' : '#cbd5e1',
                        }}
                      />
                    </div>

                    {/* Communes List */}
                    <div
                      className="d-flex flex-wrap gap-1.5 overflow-y-auto p-1"
                      style={{ maxHeight: '180px' }}
                    >
                      {filteredCommunes.map((comm) => {
                        const isCommActive = selectedCommune.toLowerCase() === comm.toLowerCase()
                        return (
                          <button
                            key={comm}
                            type="button"
                            onClick={() => setSelectedCommune(comm)}
                            className={`badge border text-start px-2 py-1.5 rounded transition-all cursor-pointer ${
                              isCommActive
                                ? 'bg-success text-white shadow-xs'
                                : isDark
                                  ? 'bg-dark text-light border-secondary hover:border-success'
                                  : 'bg-light text-dark border hover:border-success'
                            }`}
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: isCommActive ? 600 : 500,
                            }}
                          >
                            <span className="d-flex align-items-center gap-1.5">
                              <Icon name="building" size={12} className="opacity-75 flex-shrink-0" />
                              <span>{comm}</span>
                            </span>
                          </button>
                        )
                      })}
                    </div>

                    {/* Selected Commune Focus Detail */}
                    {selectedCommune && (
                      <div
                        className="mt-3 p-2.5 rounded-2 border"
                        style={{
                          backgroundColor: isDark ? '#064e3b' : '#ecfdf5',
                          borderColor: isDark ? '#059669' : '#a7f3d0',
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center gap-2">
                            <div className="text-success d-flex align-items-center">
                              <Icon name="map-pin" size={16} />
                            </div>
                            <div>
                              <div className="fw-bold small text-success">
                                {selectedCommune}
                              </div>
                              <div className="text-muted small" style={{ fontSize: '0.68rem' }}>
                                District : {selectedDistrict} · Région : {activeRegionGeo.nom}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedCommune('')}
                            className="btn btn-sm btn-link p-0 text-muted"
                          >
                            <Icon name="x" size={12} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* IF NO REGION SELECTED: PROVINCES & QUICK REGION DIRECTORY */
              <div className="d-flex flex-column gap-3">
                <div
                  className="p-4 rounded-3 border h-100 shadow-xs"
                  style={{
                    backgroundColor: isDark ? '#1e293b' : '#ffffff',
                    borderColor: isDark ? '#334155' : '#e2e8f0',
                  }}
                >
                  <div className="d-flex align-items-center gap-2.5 mb-2">
                    <svg
                      width="30"
                      height="20"
                      viewBox="0 0 30 20"
                      className="rounded border shadow-xs flex-shrink-0"
                      aria-label="Drapeau de Madagascar"
                    >
                      {/* Left white vertical stripe */}
                      <rect width="10" height="20" fill="#ffffff" />
                      {/* Top right red stripe */}
                      <rect x="10" width="20" height="10" fill="#dc2626" />
                      {/* Bottom right green stripe */}
                      <rect x="10" y="10" width="20" height="10" fill="#16a34a" />
                    </svg>
                    <div>
                      <h4 className={`h6 fw-bold mb-0 ${isDark ? 'text-white' : 'text-dark'}`}>
                        Sélectionnez une zone sur la carte
                      </h4>
                      <div className="text-muted small" style={{ fontSize: '0.74rem' }}>
                        Cliquez directement sur une région ou choisissez ci-dessous
                      </div>
                    </div>
                  </div>

                  <p className="text-secondary small mb-3">
                    La carte interactive de Madagascar permet de naviguer avec précision :
                    sélectionnez une <strong>Province</strong>, zoomez sur une <strong>Région</strong>,
                    explorez ses <strong>Districts</strong> puis descendez au niveau <strong>Commune</strong>.
                  </p>

                  <div className={`fw-semibold small mb-2 ${isDark ? 'text-white' : 'text-dark'}`}>
                    Provinces de Madagascar :
                  </div>

                  {/* Province Selector Cards */}
                  <div className="d-flex flex-column gap-1.5">
                    {getAllProvinces().map((provName) => {
                      const pTheme = PROVINCE_THEMES[provName] || PROVINCE_THEMES['Antananarivo']
                      const isProvSelected =
                        selectedProvince.toLowerCase() === provName.toLowerCase()
                      const provRegions = getRegionsForProvince(provName)

                      return (
                        <button
                          key={provName}
                          type="button"
                          onClick={() => {
                            if (onSelectProvince) onSelectProvince(provName)
                            if (onSelectRegion) onSelectRegion('')
                            if (onSelectDistrict) onSelectDistrict('')
                          }}
                          className={`btn text-start d-flex align-items-center justify-content-between p-2 rounded-2 border transition-all ${
                            isProvSelected
                              ? 'shadow-xs'
                              : isDark
                                ? 'btn-dark text-light border-secondary'
                                : 'btn-light text-dark'
                          }`}
                          style={{
                            borderLeftWidth: '4px',
                            borderLeftStyle: 'solid',
                            borderLeftColor: pTheme.color,
                            backgroundColor: isProvSelected
                              ? isDark
                                ? '#1e3a8a'
                                : '#e0f2fe'
                              : undefined,
                          }}
                        >
                          <div>
                            <div className="fw-bold small d-flex align-items-center gap-1.5">
                              <span
                                style={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  backgroundColor: pTheme.color,
                                }}
                              />
                              <span>Province de {provName}</span>
                            </div>
                            <div className="text-muted" style={{ fontSize: '0.68rem' }}>
                              {provRegions.length} régions : {provRegions.map((r) => r.nom).join(', ')}
                            </div>
                          </div>
                          <Icon name="chevron-right" size={13} className="text-muted" />
                        </button>
                      )
                    })}
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
