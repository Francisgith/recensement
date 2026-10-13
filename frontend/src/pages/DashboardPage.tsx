import { useEffect, useState } from 'react'
import { Alert, Card, Col, Row, Spinner } from '../components/ui'
import { Link } from 'react-router-dom'
import { getApiError } from '../api/client'
import { statsApi } from '../api/resources'
import type { Overview } from '../api/types'
import StatCard from '../components/StatCard'

export default function DashboardPage() {
  const [overview, setOverview] = useState<Overview | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const data = await statsApi.overview()
        if (active) setOverview(data)
      } catch (err) {
        if (active) setError(getApiError(err))
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    )
  }

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h1 className="h3 fw-bold mb-0">Tableau de bord</h1>
          <p className="text-muted mb-0">Vue d'ensemble de la population recensée</p>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {overview && (
        <>
          <Row className="g-3 mb-2">
            <StatCard label="Population totale" value={overview.populationTotale} icon="👥" tone="brand" />
            <StatCard label="Chefs de famille" value={overview.individus} icon="🏠" tone="accent" />
            <StatCard label="Membres" value={overview.membres} icon="🧑‍🤝‍🧑" tone="warning" />
            <StatCard label="Femmes / Hommes" value={`${overview.femmes} / ${overview.hommes}`} icon="⚖️" tone="danger" />
          </Row>

          <Row className="g-3 mt-1">
            <Col lg={7}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body>
                  <h2 className="h5 fw-bold mb-3">Répartition par tranche d'âge</h2>
                  {[
                    { label: 'Moins de 6 ans', value: overview.tranches.moins6, tone: 'bg-info' },
                    { label: 'De 6 à 24 ans', value: overview.tranches.de6a24, tone: 'bg-primary' },
                    { label: 'Plus de 18 ans', value: overview.tranches.plus18, tone: 'bg-success' },
                    { label: 'Plus de 65 ans', value: overview.tranches.plus65, tone: 'bg-warning' },
                  ].map((row) => {
                    const pct =
                      overview.populationTotale > 0
                        ? Math.round((row.value / overview.populationTotale) * 100)
                        : 0
                    return (
                      <div key={row.label} className="mb-3">
                        <div className="d-flex justify-content-between small fw-semibold">
                          <span>{row.label}</span>
                          <span>
                            {row.value} ({pct}%)
                          </span>
                        </div>
                        <div className="progress mt-1" style={{ height: 8 }}>
                          <div className={`progress-bar ${row.tone}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </Card.Body>
              </Card>
            </Col>

            <Col lg={5}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="d-flex flex-column gap-2">
                  <h2 className="h5 fw-bold mb-2">Accès rapides</h2>
                  <Link to="/individus" className="btn btn-outline-success text-start">
                    🏠 Gérer les chefs de famille
                  </Link>
                  <Link to="/membres" className="btn btn-outline-primary text-start">
                    🧑‍🤝‍🧑 Gérer les membres
                  </Link>
                  <Link to="/population" className="btn btn-outline-dark text-start">
                    🔎 Rechercher dans la population
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  )
}
