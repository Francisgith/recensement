import { useEffect, useState, useMemo } from 'react'
import {
  statsApi,
  individuApi,
  membreApi,
} from '../api/resources'
import type {
  TerritorialOverview,
  TerritorialUnit,
  Individu,
  MembreFamille,
} from '../api/types'
import {
  getAllProvinces,
  getAllRegions,
  getRegionsForProvince,
  getDistrictsForRegion,
} from '../data/madagascarGeo'
import { getApiError } from '../api/client'
import { Alert, Button, Card, Col, Row, Spinner, Table } from '../components/ui'
import Icon from '../components/Icon'
import AnimatedCurveChart from '../components/AnimatedCurveChart'
import MadagascarMap from '../components/MadagascarMap'

type ViewLevel = 'provinces' | 'regions' | 'districts' | 'communes'

export default function TerritorialPage() {
  const [data, setData] = useState<TerritorialOverview | null>(null)
  const [individus, setIndividus] = useState<Individu[]>([])
  const [membres, setMembres] = useState<MembreFamille[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filter state
  const [viewLevel, setViewLevel] = useState<ViewLevel>('regions')
  const [selectedProvince, setSelectedProvince] = useState<string>('')
  const [selectedRegion, setSelectedRegion] = useState<string>('')
  const [selectedDistrict, setSelectedDistrict] = useState<string>('')
  const [chartType, setChartType] = useState<'curve' | 'bars'>('curve')
  const [showMap, setShowMap] = useState<boolean>(true)

  // Load territorial statistics and resident data
  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const [territorialData, inds, mems] = await Promise.all([
        statsApi.territorial({
          province: selectedProvince,
          region: selectedRegion,
          district: selectedDistrict,
        }),
        individuApi.list({
          province: selectedProvince,
          region: selectedRegion,
          district: selectedDistrict,
        }),
        membreApi.list({
          province: selectedProvince,
          region: selectedRegion,
          district: selectedDistrict,
        }),
      ])
      setData(territorialData)
      setIndividus(inds)
      setMembres(mems)
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProvince, selectedRegion, selectedDistrict])

  // Available options
  const provinces = useMemo(() => getAllProvinces(), [])
  const regions = useMemo(
    () =>
      selectedProvince
        ? getRegionsForProvince(selectedProvince).map((r) => r.nom)
        : getAllRegions().map((r) => r.region),
    [selectedProvince],
  )
  const districts = useMemo(
    () => (selectedRegion ? getDistrictsForRegion(selectedRegion).map((d) => d.nom) : []),
    [selectedRegion],
  )

  const handleProvinceChange = (p: string) => {
    setSelectedProvince(p)
    setSelectedRegion('')
    setSelectedDistrict('')
  }

  const handleRegionChange = (r: string, prov?: string) => {
    if (prov) {
      setSelectedProvince(prov)
    } else if (r) {
      const allRegs = getAllRegions()
      const match = allRegs.find((item) => item.region.toLowerCase() === r.toLowerCase())
      if (match) setSelectedProvince(match.province)
    }
    setSelectedRegion(r)
    setSelectedDistrict('')
  }

  const handleResetFilters = () => {
    setSelectedProvince('')
    setSelectedRegion('')
    setSelectedDistrict('')
  }

  // Active units based on selected view level
  const activeUnits: TerritorialUnit[] = useMemo(() => {
    if (!data) return []
    return data[viewLevel] || []
  }, [data, viewLevel])

  // Total population in current view
  const currentTotalPop = useMemo(() => {
    return activeUnits.reduce((acc, u) => acc + u.populationTotale, 0) || 1
  }, [activeUnits])

  // Territorial curve points for animated charts (top units)
  const territorialCurvePoints = useMemo(() => {
    return activeUnits.slice(0, 12).map((u) => ({
      label: u.nom,
      hommes: u.hommes,
      femmes: u.femmes,
      total: u.populationTotale,
    }))
  }, [activeUnits])

  // Export CSV
  const handleExportCSV = () => {
    if (!activeUnits.length) return
    const headers = [
      'Division',
      'Province',
      'Region',
      'District',
      'Population Totale',
      'Menages (Chefs)',
      'Membres',
      'Hommes',
      'Femmes',
      'Age Moyen',
    ]
    const rows = activeUnits.map((u) => [
      `"${u.nom}"`,
      `"${u.province || ''}"`,
      `"${u.region || ''}"`,
      `"${u.district || ''}"`,
      u.populationTotale,
      u.individus,
      u.membres,
      u.hommes,
      u.femmes,
      u.ageMoyen,
    ])
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute(
      'download',
      `recensement_${viewLevel}_${new Date().toISOString().slice(0, 10)}.csv`,
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="d-flex flex-column gap-4">
      {/* Page Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span
              className="badge bg-primary bg-opacity-10 text-primary fw-semibold px-2 py-1 rounded"
              style={{ fontSize: '0.75rem' }}
            >
              Découpage Administratif
            </span>
            <span className="text-muted small">Madagascar (6 Provinces · 23 Régions)</span>
          </div>
          <h1 className="h4 fw-bold text-dark mb-1">Recensement Territorial</h1>
          <p className="text-secondary small mb-0">
            Analyse et gestion des chiffres de la population par subdivision géographique
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <Button
            variant={showMap ? 'primary' : 'outline-primary'}
            size="sm"
            onClick={() => setShowMap(!showMap)}
          >
            <Icon name="map" size={14} className="me-1" />
            <span>{showMap ? 'Masquer la Carte' : 'Carte Interactive'}</span>
          </Button>
          <Button variant="outline-secondary" size="sm" onClick={() => void loadData()}>
            <Icon name="refresh" size={14} className="me-1" />
            Actualiser
          </Button>
          <Button variant="outline-primary" size="sm" onClick={handleExportCSV} disabled={!activeUnits.length}>
            <Icon name="download" size={14} className="me-1" />
            Exporter CSV
          </Button>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* CARTE INTERACTIVE DE MADAGASCAR AVEC PRÉCISION PAR ZONE */}
      {showMap && (
        <MadagascarMap
          selectedProvince={selectedProvince}
          selectedRegion={selectedRegion}
          selectedDistrict={selectedDistrict}
          onSelectProvince={handleProvinceChange}
          onSelectRegion={handleRegionChange}
          onSelectDistrict={(d) => setSelectedDistrict(d)}
          onResetFilters={handleResetFilters}
          territorialUnits={data?.regions || []}
        />
      )}

      {/* Filter and Drilldown Toolbar */}
      <Card className="border-0 shadow-sm bg-white">
        <Card.Body className="p-3 p-md-4">
          <div className="row g-3 align-items-end">
            {/* Level selection tabs */}
            <div className="col-12 col-xl-5">
              <label className="form-label small fw-semibold text-secondary mb-1">
                Niveau d'analyse territoriale
              </label>
              <div className="d-flex gap-1 p-1 bg-light rounded-3 border">
                {[
                  { id: 'provinces', label: 'Provinces (6)' },
                  { id: 'regions', label: 'Régions (23)' },
                  { id: 'districts', label: 'Districts' },
                  { id: 'communes', label: 'Communes' },
                ].map((lvl) => (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setViewLevel(lvl.id as ViewLevel)}
                    className={`btn btn-sm flex-fill border-0 ${
                      viewLevel === lvl.id
                        ? 'bg-white text-primary shadow-sm fw-semibold'
                        : 'text-secondary hover:text-dark'
                    }`}
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem' }}
                  >
                    {lvl.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Province Filter */}
            <div className="col-sm-6 col-md-4 col-xl-2">
              <label className="form-label small fw-semibold text-secondary mb-1">Province</label>
              <select
                className="form-select form-select-sm"
                value={selectedProvince}
                onChange={(e) => handleProvinceChange(e.target.value)}
              >
                <option value="">Toutes les provinces</option>
                {provinces.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Region Filter */}
            <div className="col-sm-6 col-md-4 col-xl-2">
              <label className="form-label small fw-semibold text-secondary mb-1">Région</label>
              <select
                className="form-select form-select-sm"
                value={selectedRegion}
                onChange={(e) => handleRegionChange(e.target.value)}
              >
                <option value="">Toutes les régions</option>
                {regions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* District Filter */}
            <div className="col-sm-6 col-md-4 col-xl-2">
              <label className="form-label small fw-semibold text-secondary mb-1">District</label>
              <select
                className="form-select form-select-sm"
                value={selectedDistrict}
                disabled={!selectedRegion}
                onChange={(e) => setSelectedDistrict(e.target.value)}
              >
                <option value="">Tous les districts</option>
                {districts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset */}
            <div className="col-sm-6 col-md-4 col-xl-1">
              {(selectedProvince || selectedRegion || selectedDistrict) && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="btn btn-sm btn-outline-danger w-100"
                  title="Réinitialiser les filtres"
                >
                  <Icon name="x" size={14} />
                </button>
              )}
            </div>
          </div>
        </Card.Body>
      </Card>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
          <div className="text-muted small mt-2">Calcul des chiffres territoriaux...</div>
        </div>
      ) : (
        <>
          {/* Territorial KPI summary */}
          <Row className="g-3">
            <Col sm={6} lg={3}>
              <div className="p-3 bg-white rounded-3 border shadow-sm">
                <div className="text-secondary small fw-medium text-uppercase mb-1" style={{ fontSize: '0.72rem' }}>
                  Population dans le périmètre
                </div>
                <div className="fs-3 fw-bold text-primary font-mono tabular-nums">
                  {individus.length + membres.length}
                </div>
                <div className="text-muted small mt-1" style={{ fontSize: '0.75rem' }}>
                  {selectedRegion || selectedProvince || 'Madagascar entier'}
                </div>
              </div>
            </Col>

            <Col sm={6} lg={3}>
              <div className="p-3 bg-white rounded-3 border shadow-sm">
                <div className="text-secondary small fw-medium text-uppercase mb-1" style={{ fontSize: '0.72rem' }}>
                  Chefs de famille (Ménages)
                </div>
                <div className="fs-3 fw-bold text-success font-mono tabular-nums">
                  {individus.length}
                </div>
                <div className="text-muted small mt-1" style={{ fontSize: '0.75rem' }}>
                  Foyers déclarés
                </div>
              </div>
            </Col>

            <Col sm={6} lg={3}>
              <div className="p-3 bg-white rounded-3 border shadow-sm">
                <div className="text-secondary small fw-medium text-uppercase mb-1" style={{ fontSize: '0.72rem' }}>
                  Membres Rattachés
                </div>
                <div className="fs-3 fw-bold text-warning font-mono tabular-nums">
                  {membres.length}
                </div>
                <div className="text-muted small mt-1" style={{ fontSize: '0.75rem' }}>
                  Conjoints, enfants, dépendants
                </div>
              </div>
            </Col>

            <Col sm={6} lg={3}>
              <div className="p-3 bg-white rounded-3 border shadow-sm">
                <div className="text-secondary small fw-medium text-uppercase mb-1" style={{ fontSize: '0.72rem' }}>
                  Subdivisions actives
                </div>
                <div className="fs-3 fw-bold text-dark font-mono tabular-nums">
                  {activeUnits.length}
                </div>
                <div className="text-muted small mt-1" style={{ fontSize: '0.75rem' }}>
                  {viewLevel} recensées
                </div>
              </div>
            </Col>
          </Row>

          {/* Graphical Comparison Header & Toggle */}
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-1">
            <h2 className="h6 fw-bold mb-0 text-dark">
              Visualisation Graphique par {viewLevel.slice(0, -1).toUpperCase()}
            </h2>

            <div className="d-flex p-1 bg-white rounded-3 border shadow-sm">
              <button
                type="button"
                className={`btn btn-sm border-0 d-flex align-items-center gap-1.5 ${
                  chartType === 'curve'
                    ? 'bg-primary text-white shadow-sm fw-semibold'
                    : 'text-secondary'
                }`}
                style={{ fontSize: '0.78rem', padding: '0.25rem 0.65rem' }}
                onClick={() => setChartType('curve')}
              >
                <Icon name="activity" size={14} />
                <span>Courbes Continues Animées</span>
              </button>
              <button
                type="button"
                className={`btn btn-sm border-0 d-flex align-items-center gap-1.5 ${
                  chartType === 'bars'
                    ? 'bg-primary text-white shadow-sm fw-semibold'
                    : 'text-secondary'
                }`}
                style={{ fontSize: '0.78rem', padding: '0.25rem 0.65rem' }}
                onClick={() => setChartType('bars')}
              >
                <Icon name="chart" size={14} />
                <span>Histogrammes Détaillés</span>
              </button>
            </div>
          </div>

          {/* Animated Curve Chart */}
          {chartType === 'curve' && territorialCurvePoints.length > 0 && (
            <AnimatedCurveChart
              title={`Courbes de Répartition de la Population par ${viewLevel.toUpperCase()}`}
              subtitle={`Tracé spline continu de la population totale, des hommes (Lahy) et des femmes (Vavy)`}
              data={territorialCurvePoints}
              unit="hab."
              showCumulativeOption={true}
            />
          )}

          {/* Graphical Comparison Bar Chart */}
          {(chartType === 'bars' || territorialCurvePoints.length === 0) && (
            <Card className="border-0 shadow-sm bg-white">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h3 className="h6 fw-bold mb-1 text-dark">
                      Comparatif Démographique par {viewLevel.slice(0, -1).toUpperCase()}
                    </h3>
                    <p className="text-muted small mb-0">
                      Volume d'individus et répartition relative de la population
                    </p>
                  </div>
                  <span className="badge bg-light text-secondary border font-mono">
                    {activeUnits.length} entités
                  </span>
                </div>

                {activeUnits.length === 0 ? (
                  <div className="text-center py-4 text-muted small">
                    Aucune donnée disponible pour cette sélection territoriale.
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3 pt-2">
                    {activeUnits.map((unit) => {
                      const pct = Math.round((unit.populationTotale / currentTotalPop) * 100)
                      const menPct =
                        unit.populationTotale > 0
                          ? Math.round((unit.hommes / unit.populationTotale) * 100)
                          : 0
                      const womenPct = 100 - menPct

                      return (
                        <div key={unit.nom}>
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <div className="d-flex align-items-center gap-2">
                              <span className="fw-semibold text-dark small">{unit.nom}</span>
                              {unit.province && unit.province !== unit.nom && (
                                <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                                  ({unit.province})
                                </span>
                              )}
                            </div>
                            <div className="text-end font-mono small tabular-nums">
                              <strong className="text-dark">{unit.populationTotale}</strong> hab.{' '}
                              <span className="text-muted">({pct}%)</span>
                            </div>
                          </div>

                          {/* Split Bar: Hommes (blue) / Femmes (green) */}
                          <div
                            className="progress"
                            style={{ height: 10, backgroundColor: '#f1f5f9' }}
                          >
                            <div
                              className="progress-bar bg-primary"
                              style={{
                                width: `${(unit.populationTotale / currentTotalPop) * (menPct / 100) * 100}%`,
                              }}
                              title={`Hommes: ${unit.hommes}`}
                            />
                            <div
                              className="progress-bar bg-success"
                              style={{
                                width: `${(unit.populationTotale / currentTotalPop) * (womenPct / 100) * 100}%`,
                              }}
                              title={`Femmes: ${unit.femmes}`}
                            />
                          </div>

                          <div
                            className="d-flex justify-content-between text-muted mt-1"
                            style={{ fontSize: '0.7rem' }}
                          >
                            <span>
                              {unit.individus} ménages · Âge moyen : {unit.ageMoyen} ans
                            </span>
                            <span>
                              H: {unit.hommes} ({menPct}%) · F: {unit.femmes} ({womenPct}%)
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </Card.Body>
            </Card>
          )}

          {/* Detailed Territorial Table */}
          <Card className="border-0 shadow-sm bg-white">
            <Card.Body className="p-0">
              <div className="p-4 border-bottom d-flex justify-content-between align-items-center">
                <div>
                  <h3 className="h6 fw-bold mb-1 text-dark">Tableau Détaillé des Données</h3>
                  <p className="text-muted small mb-0">
                    Statistiques ventilées par {viewLevel.slice(0, -1)}
                  </p>
                </div>
                <div className="text-muted small">
                  Total : <strong className="text-dark font-mono">{activeUnits.length}</strong> lignes
                </div>
              </div>

              <div className="table-responsive">
                <Table hover className="mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Division</th>
                      {viewLevel !== 'provinces' && <th>Province</th>}
                      {viewLevel === 'districts' && <th>Région</th>}
                      {viewLevel === 'communes' && <th>District</th>}
                      <th className="text-end">Population</th>
                      <th className="text-end">Ménages</th>
                      <th className="text-end">Membres</th>
                      <th className="text-end">Hommes</th>
                      <th className="text-end">Femmes</th>
                      <th className="text-end">Âge Moyen</th>
                      <th className="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeUnits.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="text-center py-4 text-muted">
                          Aucun résultat trouvé pour les filtres sélectionnés.
                        </td>
                      </tr>
                    ) : (
                      activeUnits.map((u) => (
                        <tr key={u.nom}>
                          <td className="fw-semibold text-dark">{u.nom}</td>
                          {viewLevel !== 'provinces' && (
                            <td className="text-secondary small">{u.province || '—'}</td>
                          )}
                          {viewLevel === 'districts' && (
                            <td className="text-secondary small">{u.region || '—'}</td>
                          )}
                          {viewLevel === 'communes' && (
                            <td className="text-secondary small">{u.district || '—'}</td>
                          )}
                          <td className="text-end font-mono fw-bold tabular-nums text-primary">
                            {u.populationTotale}
                          </td>
                          <td className="text-end font-mono tabular-nums">{u.individus}</td>
                          <td className="text-end font-mono tabular-nums">{u.membres}</td>
                          <td className="text-end font-mono tabular-nums text-secondary">
                            {u.hommes}
                          </td>
                          <td className="text-end font-mono tabular-nums text-secondary">
                            {u.femmes}
                          </td>
                          <td className="text-end font-mono tabular-nums">{u.ageMoyen} ans</td>
                          <td className="text-center">
                            {viewLevel === 'provinces' && (
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary py-0 px-2"
                                style={{ fontSize: '0.75rem' }}
                                onClick={() => {
                                  setSelectedProvince(u.nom)
                                  setViewLevel('regions')
                                }}
                              >
                                Explorer &rarr;
                              </button>
                            )}
                            {viewLevel === 'regions' && (
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary py-0 px-2"
                                style={{ fontSize: '0.75rem' }}
                                onClick={() => {
                                  setSelectedRegion(u.nom)
                                  setViewLevel('districts')
                                }}
                              >
                                Explorer &rarr;
                              </button>
                            )}
                            {viewLevel === 'districts' && (
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary py-0 px-2"
                                style={{ fontSize: '0.75rem' }}
                                onClick={() => {
                                  setSelectedDistrict(u.nom)
                                  setViewLevel('communes')
                                }}
                              >
                                Explorer &rarr;
                              </button>
                            )}
                            {viewLevel === 'communes' && (
                              <span className="text-muted small">—</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>

          {/* Residents of this territory list */}
          <Card className="border-0 shadow-sm bg-white">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h3 className="h6 fw-bold mb-1 text-dark">
                    Résidents Recensés dans cette Zone ({individus.length + membres.length})
                  </h3>
                  <p className="text-muted small mb-0">
                    Ménages et membres de famille enregistrés dans le secteur sélectionné
                  </p>
                </div>
              </div>

              <div className="table-responsive">
                <Table hover className="align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Nom & Prénoms</th>
                      <th>Statut</th>
                      <th>Sexe</th>
                      <th>Âge</th>
                      <th>Profession</th>
                      <th>Localisation</th>
                      <th>Fokontany / Adresse</th>
                    </tr>
                  </thead>
                  <tbody>
                    {individus.length + membres.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-4 text-muted">
                          Aucun résident recensé dans cette sélection géographique.
                        </td>
                      </tr>
                    ) : (
                      <>
                        {individus.map((ind) => (
                          <tr key={ind.id}>
                            <td className="fw-semibold text-dark">
                              <div className="d-flex align-items-center gap-2">
                                <Icon name="home" size={16} className="text-primary flex-shrink-0" />
                                <span>{ind.nom}</span>
                              </div>
                            </td>
                            <td>
                              <span className="badge bg-primary bg-opacity-10 text-primary">
                                Chef de famille
                              </span>
                            </td>
                            <td>{ind.sexe === 'LAHY' ? 'Homme' : 'Femme'}</td>
                            <td className="font-mono tabular-nums">{ind.age} ans</td>
                            <td className="text-secondary small">{ind.profession || '—'}</td>
                            <td className="text-secondary small">
                              {ind.region ? `${ind.region} · ${ind.district || ''}` : ind.province || '—'}
                            </td>
                            <td className="text-muted small">
                              {ind.fokontany || ind.adresse || '—'}
                            </td>
                          </tr>
                        ))}
                        {membres.map((m) => (
                          <tr key={m.id}>
                            <td className="text-dark">
                              <div className="d-flex align-items-center gap-2 ps-3">
                                <Icon name="user" size={14} className="text-secondary flex-shrink-0" />
                                <span>{m.nom}</span>
                              </div>
                            </td>
                            <td>
                              <span className="badge bg-success bg-opacity-10 text-success">
                                {m.lien || 'Membre'} (Chef : {m.chef?.nom})
                              </span>
                            </td>
                            <td>{m.sexe === 'LAHY' ? 'Homme' : 'Femme'}</td>
                            <td className="font-mono tabular-nums">{m.age} ans</td>
                            <td className="text-secondary small">{m.profession || '—'}</td>
                            <td className="text-secondary small">
                              {m.region ? `${m.region} · ${m.district || ''}` : m.province || '—'}
                            </td>
                            <td className="text-muted small">
                              {m.fokontany || '—'}
                            </td>
                          </tr>
                        ))}
                      </>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </>
      )}
    </div>
  )
}
