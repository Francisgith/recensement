import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { statsApi } from '../api/resources'
import type { Overview, DemographicAnalysis, TerritorialOverview } from '../api/types'
import { getApiError } from '../api/client'
import StatCard from '../components/StatCard'
import DemographicCharts from '../components/DemographicCharts'
import { Alert, Card, Spinner } from '../components/ui'
import Icon from '../components/Icon'
import MadagascarMap from '../components/MadagascarMap'

export default function DashboardPage() {
  const [overview, setOverview] = useState<Overview | null>(null)
  const [demographics, setDemographics] = useState<DemographicAnalysis | null>(null)
  const [territorial, setTerritorial] = useState<TerritorialOverview | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [showDashboardMap, setShowDashboardMap] = useState(false)
  const [dashProvince, setDashProvince] = useState('')
  const [dashRegion, setDashRegion] = useState('')
  const [dashDistrict, setDashDistrict] = useState('')

  useEffect(() => {
    let ignore = false
    const fetchData = async () => {
      setLoading(true)
      setError('')
      try {
        const [ovData, demoData, terriData] = await Promise.all([
          statsApi.overview(),
          statsApi.demographics(),
          statsApi.territorial(),
        ])
        if (!ignore) {
          setOverview(ovData)
          setDemographics(demoData)
          setTerritorial(terriData)
        }
      } catch (err) {
        if (!ignore) setError(getApiError(err))
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    void fetchData()
    return () => {
      ignore = true
    }
  }, [])

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
        <div className="text-muted small mt-2">Chargement des données du recensement...</div>
      </div>
    )
  }

  return (
    <div className="d-flex flex-column gap-4">
      {/* Page Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span
              className="badge bg-success bg-opacity-10 text-success fw-semibold px-2 py-1 rounded"
              style={{ fontSize: '0.75rem' }}
            >
              Fanisam-bahoaka
            </span>
            <span className="text-muted small">Recensement Général de la Population</span>
          </div>
          <h1 className="h4 fw-bold text-dark mb-1">Tableau de Bord Démographique</h1>
          <p className="text-secondary small mb-0">
            Vue synthétique des ménages, structures démographiques et indicateurs clés
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            onClick={() => setShowDashboardMap(!showDashboardMap)}
            className={`btn btn-sm d-flex align-items-center gap-1.5 ${
              showDashboardMap ? 'btn-success text-white' : 'btn-outline-success'
            }`}
          >
            <Icon name="map" size={15} />
            <span>{showDashboardMap ? 'Masquer la Carte' : 'Carte Interactive'}</span>
          </button>
          <Link to="/regions" className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1">
            <Icon name="activity" size={15} />
            <span>Recensement Territorial</span>
          </Link>
          <Link to="/individus" className="btn btn-sm btn-primary d-flex align-items-center gap-1">
            <Icon name="plus" size={15} />
            <span>Nouveau Chef de famille</span>
          </Link>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Interactive Madagascar Map on Dashboard */}
      {showDashboardMap && territorial && (
        <MadagascarMap
          selectedProvince={dashProvince}
          selectedRegion={dashRegion}
          selectedDistrict={dashDistrict}
          onSelectProvince={(p) => {
            setDashProvince(p)
            setDashRegion('')
            setDashDistrict('')
          }}
          onSelectRegion={(r, p) => {
            if (p) setDashProvince(p)
            setDashRegion(r)
            setDashDistrict('')
          }}
          onSelectDistrict={(d) => setDashDistrict(d)}
          onResetFilters={() => {
            setDashProvince('')
            setDashRegion('')
            setDashDistrict('')
          }}
          territorialUnits={territorial.regions}
        />
      )}

      {overview && (
        <>
          {/* Main KPI StatCards */}
          <div className="row g-3">
            <StatCard
              label="Population totale"
              value={overview.populationTotale}
              icon="users"
              tone="brand"
            />
            <StatCard
              label="Chefs de famille (Ménages)"
              value={overview.individus}
              icon="home"
              tone="accent"
            />
            <StatCard
              label="Membres de famille"
              value={overview.membres}
              icon="user-group"
              tone="warning"
            />
            <StatCard
              label="Équilibre Sexe (Femmes / Hommes)"
              value={`${overview.femmes} / ${overview.hommes}`}
              icon="scale"
              tone="danger"
            />
          </div>

          {/* Demographic Interactive Charts (Pyramide des âges, structure par sexe, ménages) */}
          {demographics && <DemographicCharts data={demographics} />}

          {/* Regional Summary & Territorial Overview Teaser */}
          {territorial && (
            <div className="row g-3">
              {/* Regional snapshot */}
              <div className="col-lg-8">
                <Card className="border-0 shadow-sm bg-white h-100">
                  <Card.Body className="p-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <h2 className="h6 fw-bold mb-1 text-dark">
                          Répartition Géographique par Province
                        </h2>
                        <p className="text-muted small mb-0">
                          Chiffres de population recensée dans les 6 provinces de Madagascar
                        </p>
                      </div>
                      <Link
                        to="/regions"
                        className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                        style={{ fontSize: '0.78rem' }}
                      >
                        <span>Détails par Région &rarr;</span>
                      </Link>
                    </div>

                    <div className="d-flex flex-column gap-3">
                      {territorial.provinces.slice(0, 6).map((prov) => {
                        const pct =
                          overview.populationTotale > 0
                            ? Math.round((prov.populationTotale / overview.populationTotale) * 100)
                            : 0
                        return (
                          <div key={prov.nom}>
                            <div className="d-flex justify-content-between align-items-center small mb-1">
                              <span className="fw-semibold text-dark">{prov.nom}</span>
                              <span className="text-muted font-mono tabular-nums">
                                <strong>{prov.populationTotale}</strong> hab. ({pct}%) ·{' '}
                                {prov.individus} ménages
                              </span>
                            </div>
                            <div className="progress" style={{ height: 8, backgroundColor: '#f1f5f9' }}>
                              <div
                                className="progress-bar"
                                style={{
                                  width: `${pct}%`,
                                  backgroundColor: '#2563eb',
                                }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </Card.Body>
                </Card>
              </div>

              {/* Quick Navigation and Census Tools */}
              <div className="col-lg-4">
                <Card className="border-0 shadow-sm bg-white h-100">
                  <Card.Body className="p-4 d-flex flex-column justify-content-between">
                    <div>
                      <h2 className="h6 fw-bold mb-1 text-dark">Modules du Recensement</h2>
                      <p className="text-muted small mb-3">Accès rapide aux registres et opérations</p>

                      <div className="d-flex flex-column gap-2">
                        <Link
                          to="/regions"
                          className="btn btn-light text-start d-flex align-items-center justify-content-between p-2 rounded-3 border"
                        >
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="d-flex align-items-center justify-content-center rounded bg-primary bg-opacity-10 text-primary"
                              style={{ width: 32, height: 32 }}
                            >
                              <Icon name="map" size={16} />
                            </div>
                            <div>
                              <div className="fw-semibold small text-dark">Recensement Territorial</div>
                              <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                                Provinces, Régions, Districts, Communes
                              </div>
                            </div>
                          </div>
                          <Icon name="chevron-right" size={14} className="text-muted" />
                        </Link>

                        <Link
                          to="/individus"
                          className="btn btn-light text-start d-flex align-items-center justify-content-between p-2 rounded-3 border"
                        >
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="d-flex align-items-center justify-content-center rounded bg-success bg-opacity-10 text-success"
                              style={{ width: 32, height: 32 }}
                            >
                              <Icon name="home" size={16} />
                            </div>
                            <div>
                              <div className="fw-semibold small text-dark">Chefs de Famille</div>
                              <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                                Gestion des foyers et ménages recensés
                              </div>
                            </div>
                          </div>
                          <Icon name="chevron-right" size={14} className="text-muted" />
                        </Link>

                        <Link
                          to="/membres"
                          className="btn btn-light text-start d-flex align-items-center justify-content-between p-2 rounded-3 border"
                        >
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="d-flex align-items-center justify-content-center rounded bg-warning bg-opacity-10 text-warning"
                              style={{ width: 32, height: 32 }}
                            >
                              <Icon name="user-group" size={16} />
                            </div>
                            <div>
                              <div className="fw-semibold small text-dark">Membres Rattachés</div>
                              <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                                Époux, enfants, ascendants, dépendants
                              </div>
                            </div>
                          </div>
                          <Icon name="chevron-right" size={14} className="text-muted" />
                        </Link>

                        <Link
                          to="/population"
                          className="btn btn-light text-start d-flex align-items-center justify-content-between p-2 rounded-3 border"
                        >
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="d-flex align-items-center justify-content-center rounded bg-dark bg-opacity-10 text-dark"
                              style={{ width: 32, height: 32 }}
                            >
                              <Icon name="search" size={16} />
                            </div>
                            <div>
                              <div className="fw-semibold small text-dark">Recherche Population</div>
                              <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                                Filtres avancés par âge, sexe et territoire
                              </div>
                            </div>
                          </div>
                          <Icon name="chevron-right" size={14} className="text-muted" />
                        </Link>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-top text-muted small" style={{ fontSize: '0.75rem' }}>
                      Système National de Recensement · Madagascar
                    </div>
                  </Card.Body>
                </Card>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
