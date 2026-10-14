import { useState, useMemo } from 'react'
import type { DemographicAnalysis } from '../api/types'
import AnimatedCurveChart from './AnimatedCurveChart'
import type { CurveSeriesPoint } from './AnimatedCurveChart'
import Icon from './Icon'

interface DemographicChartsProps {
  data: DemographicAnalysis
}

type ChartDisplayMode = 'combined' | 'curves' | 'pyramid'

export default function DemographicCharts({ data }: DemographicChartsProps) {
  const [hoveredTier, setHoveredTier] = useState<string | null>(null)
  const [displayMode, setDisplayMode] = useState<ChartDisplayMode>('combined')

  const { pyramide, taillesMenages, repartitionSexe, indicateurs } = data

  // Find max value in pyramid to scale the bars symmetrically
  const maxTierValue = Math.max(
    ...pyramide.map((t) => Math.max(t.hommes, t.femmes)),
    1,
  )

  // Calculate total population in pyramid
  const totalPyramid = pyramide.reduce((sum, t) => sum + t.total, 0) || 1

  // Format data for AnimatedCurveChart
  const curveSeriesData: CurveSeriesPoint[] = useMemo(() => {
    return pyramide.map((t) => ({
      label: t.tranche,
      hommes: t.hommes,
      femmes: t.femmes,
      total: t.total,
    }))
  }, [pyramide])

  return (
    <div className="d-flex flex-column gap-4">
      {/* KPI Cards Strip */}
      <div className="row g-3">
        <div className="col-6 col-lg-3">
          <div className="p-3 bg-white rounded-3 border h-100 shadow-sm">
            <div
              className="text-secondary small fw-medium text-uppercase mb-1"
              style={{ fontSize: '0.72rem', letterSpacing: '0.04em' }}
            >
              Âge Médian
            </div>
            <div className="d-flex align-items-baseline gap-2">
              <span className="fs-3 fw-bold text-dark font-mono tabular-nums">
                {indicateurs.ageMedian}
              </span>
              <span className="text-muted small">ans</span>
            </div>
            <div className="text-muted small mt-1" style={{ fontSize: '0.75rem' }}>
              Moyenne : {indicateurs.ageMoyen} ans
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="p-3 bg-white rounded-3 border h-100 shadow-sm">
            <div
              className="text-secondary small fw-medium text-uppercase mb-1"
              style={{ fontSize: '0.72rem', letterSpacing: '0.04em' }}
            >
              Ratio de Masculinité
            </div>
            <div className="d-flex align-items-baseline gap-2">
              <span className="fs-3 fw-bold text-dark font-mono tabular-nums">
                {indicateurs.ratioMasculinite}
              </span>
              <span className="text-muted small">H / 100 F</span>
            </div>
            <div className="text-muted small mt-1" style={{ fontSize: '0.75rem' }}>
              {repartitionSexe.hommes} hommes · {repartitionSexe.femmes} femmes
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="p-3 bg-white rounded-3 border h-100 shadow-sm">
            <div
              className="text-secondary small fw-medium text-uppercase mb-1"
              style={{ fontSize: '0.72rem', letterSpacing: '0.04em' }}
            >
              Taille Moy. Ménage
            </div>
            <div className="d-flex align-items-baseline gap-2">
              <span className="fs-3 fw-bold text-dark font-mono tabular-nums">
                {indicateurs.menagesTotal > 0
                  ? (indicateurs.populationTotale / indicateurs.menagesTotal).toFixed(1)
                  : '0'}
              </span>
              <span className="text-muted small">pers. / foyer</span>
            </div>
            <div className="text-muted small mt-1" style={{ fontSize: '0.75rem' }}>
              {indicateurs.menagesTotal} ménages recensés
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="p-3 bg-white rounded-3 border h-100 shadow-sm">
            <div
              className="text-secondary small fw-medium text-uppercase mb-1"
              style={{ fontSize: '0.72rem', letterSpacing: '0.04em' }}
            >
              Taux de Dépendance
            </div>
            <div className="d-flex align-items-baseline gap-2">
              <span className="fs-3 fw-bold text-dark font-mono tabular-nums">
                {indicateurs.tauxDependance}%
              </span>
              <span className="text-muted small">inactifs / actifs</span>
            </div>
            <div className="text-muted small mt-1" style={{ fontSize: '0.75rem' }}>
              Pop. &lt;15 et &ge;65 ans vs 15-64 ans
            </div>
          </div>
        </div>
      </div>

      {/* Chart Display Mode Switcher */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div className="d-flex align-items-center gap-2">
          <span className="fw-semibold text-dark small">Mode de visualisation graphique :</span>
          <div className="d-flex p-1 bg-white rounded-3 border shadow-sm">
            <button
              type="button"
              className={`btn btn-sm border-0 d-flex align-items-center gap-1.5 ${
                displayMode === 'combined'
                  ? 'bg-primary text-white shadow-sm fw-semibold'
                  : 'text-secondary'
              }`}
              style={{ fontSize: '0.78rem', padding: '0.3rem 0.7rem' }}
              onClick={() => setDisplayMode('combined')}
            >
              <Icon name="layers" size={14} />
              <span>Vue Combinée (Courbes + Pyramide)</span>
            </button>
            <button
              type="button"
              className={`btn btn-sm border-0 d-flex align-items-center gap-1.5 ${
                displayMode === 'curves'
                  ? 'bg-primary text-white shadow-sm fw-semibold'
                  : 'text-secondary'
              }`}
              style={{ fontSize: '0.78rem', padding: '0.3rem 0.7rem' }}
              onClick={() => setDisplayMode('curves')}
            >
              <Icon name="activity" size={14} />
              <span>Courbes Continues Animées</span>
            </button>
            <button
              type="button"
              className={`btn btn-sm border-0 d-flex align-items-center gap-1.5 ${
                displayMode === 'pyramid'
                  ? 'bg-primary text-white shadow-sm fw-semibold'
                  : 'text-secondary'
              }`}
              style={{ fontSize: '0.78rem', padding: '0.3rem 0.7rem' }}
              onClick={() => setDisplayMode('pyramid')}
            >
              <Icon name="chart" size={14} />
              <span>Pyramide des Âges</span>
            </button>
          </div>
        </div>

        <div className="text-muted small d-flex align-items-center gap-1" style={{ fontSize: '0.75rem' }}>
          <Icon name="info" size={14} />
          <span>Survolez les tracés pour afficher les valeurs exactes et statistiques</span>
        </div>
      </div>

      {/* 1. ANIMATED CURVE CHART (Courbes de distribution par âge et sexe) */}
      {(displayMode === 'combined' || displayMode === 'curves') && (
        <AnimatedCurveChart
          title="Courbes de Distribution Démographique Continue (Lahy vs Vavy)"
          subtitle="Interpolation spline de la population selon les cohortes d'âge avec zones dégradées et indicateur dynamique"
          data={curveSeriesData}
          unit="habitants"
          showCumulativeOption={true}
        />
      )}

      {/* 2. Pyramide des âges & Structures secondaires */}
      {(displayMode === 'combined' || displayMode === 'pyramid') && (
        <div className="row g-3">
          {/* Pyramide des Âges Sémantique */}
          <div className={displayMode === 'combined' ? 'col-lg-7' : 'col-lg-7'}>
            <div className="card border-0 shadow-sm h-100 bg-white">
              <div className="card-body p-4">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                  <div>
                    <h3 className="h6 fw-bold mb-1 text-dark">
                      Pyramide des Âges par Tranches
                    </h3>
                    <p className="text-muted small mb-0">
                      Distribution symétrique de la population par tranches d'âge et par sexe
                    </p>
                  </div>
                  {/* Legend */}
                  <div className="d-flex align-items-center gap-3 small">
                    <div className="d-flex align-items-center gap-1">
                      <span
                        style={{
                          width: 12,
                          height: 12,
                          backgroundColor: '#2563eb',
                          borderRadius: 2,
                        }}
                      />
                      <span className="text-secondary">Hommes (Lahy)</span>
                    </div>
                    <div className="d-flex align-items-center gap-1">
                      <span
                        style={{
                          width: 12,
                          height: 12,
                          backgroundColor: '#059669',
                          borderRadius: 2,
                        }}
                      />
                      <span className="text-secondary">Femmes (Vavy)</span>
                    </div>
                  </div>
                </div>

                {/* Symmetrical Pyramid Graphic */}
                <div className="pt-2">
                  {/* Header labels */}
                  <div
                    className="d-flex justify-content-between text-muted small mb-2 px-2"
                    style={{ fontSize: '0.72rem' }}
                  >
                    <span className="text-primary fw-medium">
                      &larr; Hommes ({repartitionSexe.hommes})
                    </span>
                    <span className="fw-semibold text-secondary">Tranche d'âge</span>
                    <span className="text-success fw-medium">
                      Femmes ({repartitionSexe.femmes}) &rarr;
                    </span>
                  </div>

                  <div className="d-flex flex-column gap-2">
                    {pyramide.map((tier) => {
                      const isHovered = hoveredTier === tier.tranche
                      const malePct = Math.round((tier.hommes / maxTierValue) * 100)
                      const femalePct = Math.round((tier.femmes / maxTierValue) * 100)
                      const tierSharePct = Math.round((tier.total / totalPyramid) * 100)

                      return (
                        <div
                          key={tier.tranche}
                          className={`p-1 rounded transition-colors ${isHovered ? 'bg-light' : ''}`}
                          onMouseEnter={() => setHoveredTier(tier.tranche)}
                          onMouseLeave={() => setHoveredTier(null)}
                        >
                          <div className="d-flex align-items-center gap-2">
                            {/* Male Bar (aligned right) */}
                            <div className="flex-grow-1 d-flex justify-content-end align-items-center gap-2">
                              <span
                                className="small text-muted font-mono tabular-nums"
                                style={{
                                  fontSize: '0.75rem',
                                  width: 24,
                                  textAlign: 'right',
                                }}
                              >
                                {tier.hommes}
                              </span>
                              <div
                                className="bg-light rounded overflow-hidden position-relative"
                                style={{ width: '100%', maxWidth: '160px', height: 20 }}
                              >
                                <div
                                  className="h-100 rounded-start"
                                  style={{
                                    width: `${malePct}%`,
                                    backgroundColor: '#2563eb',
                                    marginLeft: 'auto',
                                    transition: 'width 0.4s ease',
                                  }}
                                />
                              </div>
                            </div>

                            {/* Center Age Label */}
                            <div
                              className="text-center font-mono fw-semibold small text-dark shrink-0"
                              style={{ width: 84, fontSize: '0.75rem' }}
                            >
                              {tier.tranche}
                            </div>

                            {/* Female Bar (aligned left) */}
                            <div className="flex-grow-1 d-flex justify-content-start align-items-center gap-2">
                              <div
                                className="bg-light rounded overflow-hidden position-relative"
                                style={{ width: '100%', maxWidth: '160px', height: 20 }}
                              >
                                <div
                                  className="h-100 rounded-end"
                                  style={{
                                    width: `${femalePct}%`,
                                    backgroundColor: '#059669',
                                    transition: 'width 0.4s ease',
                                  }}
                                />
                              </div>
                              <span
                                className="small text-muted font-mono tabular-nums"
                                style={{ fontSize: '0.75rem', width: 24 }}
                              >
                                {tier.femmes}
                              </span>
                            </div>
                          </div>

                          {/* Interactive Tooltip Detail */}
                          {isHovered && (
                            <div
                              className="text-center text-muted small mt-1"
                              style={{ fontSize: '0.72rem' }}
                            >
                              <strong>{tier.tranche}</strong> : {tier.total} personnes au
                              total ({tierSharePct}% de la population recensée)
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Charts: Sex Donut & Household Sizes */}
          <div className="col-lg-5 d-flex flex-column gap-3">
            {/* Sex Distribution Gauge / Donut */}
            <div className="card border-0 shadow-sm bg-white">
              <div className="card-body p-4">
                <h3 className="h6 fw-bold mb-3 text-dark">Structure par Sexe</h3>

                <div className="d-flex align-items-center justify-content-around">
                  {/* Visual SVG Semi-Donut */}
                  <div style={{ position: 'relative', width: 120, height: 120 }}>
                    <svg
                      viewBox="0 0 36 36"
                      className="w-100 h-100"
                      style={{ transform: 'rotate(-90deg)' }}
                    >
                      {/* Background circle */}
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#f1f5f9"
                        strokeWidth="4"
                      />
                      {/* Men segment (Blue) */}
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="4"
                        strokeDasharray={`${repartitionSexe.pctHommes}, 100`}
                      />
                      {/* Women segment (Green) */}
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#059669"
                        strokeWidth="4"
                        strokeDasharray={`${repartitionSexe.pctFemmes}, 100`}
                        strokeDashoffset={`-${repartitionSexe.pctHommes}`}
                      />
                    </svg>
                    <div
                      className="position-absolute top-50 start-50 translate-middle text-center"
                      style={{ lineHeight: 1.1 }}
                    >
                      <span
                        className="fw-bold font-mono text-dark d-block"
                        style={{ fontSize: '1.1rem' }}
                      >
                        {indicateurs.populationTotale}
                      </span>
                      <span className="text-muted" style={{ fontSize: '0.65rem' }}>
                        Total
                      </span>
                    </div>
                  </div>

                  {/* Legend and metrics */}
                  <div className="d-flex flex-column gap-2">
                    <div className="d-flex align-items-center gap-2">
                      <span
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 2,
                          backgroundColor: '#2563eb',
                        }}
                      />
                      <div>
                        <div className="fw-semibold small text-dark">
                          Hommes :{' '}
                          <span className="font-mono">{repartitionSexe.hommes}</span> (
                          {repartitionSexe.pctHommes}%)
                        </div>
                        <div
                          className="text-muted small"
                          style={{ fontSize: '0.72rem' }}
                        >
                          Lahy recensés
                        </div>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      <span
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 2,
                          backgroundColor: '#059669',
                        }}
                      />
                      <div>
                        <div className="fw-semibold small text-dark">
                          Femmes :{' '}
                          <span className="font-mono">{repartitionSexe.femmes}</span> (
                          {repartitionSexe.pctFemmes}%)
                        </div>
                        <div
                          className="text-muted small"
                          style={{ fontSize: '0.72rem' }}
                        >
                          Vavy recensées
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Household Size Distribution */}
            <div className="card border-0 shadow-sm bg-white flex-grow-1">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h3 className="h6 fw-bold mb-0 text-dark">Taille des Ménages</h3>
                  <span className="text-muted small font-mono tabular-nums">
                    {indicateurs.menagesTotal} foyers
                  </span>
                </div>
                <p className="text-muted small mb-3">
                  Nombre de personnes regroupées sous un même chef de famille
                </p>

                <div className="d-flex flex-column gap-2">
                  {taillesMenages.map((item) => (
                    <div key={item.taille}>
                      <div className="d-flex justify-content-between small mb-1">
                        <span className="text-secondary fw-medium">{item.taille}</span>
                        <span className="text-muted font-mono tabular-nums">
                          {item.count} ({item.pourcentage}%)
                        </span>
                      </div>
                      <div
                        className="progress"
                        style={{ height: 6, backgroundColor: '#f1f5f9' }}
                      >
                        <div
                          className="progress-bar"
                          style={{
                            width: `${item.pourcentage}%`,
                            backgroundColor: '#0f172a',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
