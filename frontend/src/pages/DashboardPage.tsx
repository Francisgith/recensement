import { useEffect, useState } from 'react'
import { Alert, Card, Col, Row, Spinner } from '../components/ui'
import { Link } from 'react-router-dom'
import { getApiError } from '../api/client'
import { statsApi } from '../api/resources'
import type { Overview } from '../api/types'
import StatCard from '../components/StatCard'
import Icon from '../components/Icon'

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
      <div className="page-header d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div>
          <h1>Tableau de bord</h1>
          <p>Vue d'ensemble de la population recensée</p>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {overview && (
        <>
          <Row className="g-3 mb-3">
            <StatCard label="Population totale" value={overview.populationTotale} icon="users" tone="brand" />
            <StatCard label="Chefs de famille" value={overview.individus} icon="home" tone="accent" />
            <StatCard label="Membres" value={overview.membres} icon="user-group" tone="warning" />
            <StatCard label="Femmes / Hommes" value={`${overview.femmes} / ${overview.hommes}`} icon="scale" tone="danger" />
          </Row>

          <Row className="g-3">
            <Col lg={7}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body>
                  <h2 className="h6 fw-bold mb-3 text-uppercase" style={{ fontSize: '0.8rem', letterSpacing: '0.04em', color: 'var(--text-secondary)' }}>
                    Répartition par tranche d'âge
                  </h2>
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
                        <div className="d-flex justify-content-between small fw-semibold mb-1">
                          <span>{row.label}</span>
                          <span className="text-muted">
                            {row.value} <span className="fw-normal">({pct}%)</span>
                          </span>
                        </div>
                        <div className="progress" style={{ height: 6 }}>
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
                  <h2 className="h6 fw-bold mb-2 text-uppercase" style={{ fontSize: '0.8rem', letterSpacing: '0.04em', color: 'var(--text-secondary)' }}>
                    Accès rapides
                  </h2>
                  <Link to="/individus" className="btn btn-outline-primary text-start d-flex align-items-center gap-2">
                    <Icon name="home" size={18} /> Gérer les chefs de famille
                  </Link>
                  <Link to="/membres" className="btn btn-outline-success text-start d-flex align-items-center gap-2">
                    <Icon name="user-group" size={18} /> Gérer les membres
                  </Link>
                  <Link to="/population" className="btn btn-outline-dark text-start d-flex align-items-center gap-2">
                    <Icon name="search" size={18} /> Rechercher dans la population
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
