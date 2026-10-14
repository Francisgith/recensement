import { useState, useMemo, useRef, useCallback } from 'react'
import type { MouseEvent } from 'react'
import Icon from './Icon'

export interface CurveSeriesPoint {
  label: string
  hommes: number
  femmes: number
  total: number
  subLabel?: string
}

interface AnimatedCurveChartProps {
  title?: string
  subtitle?: string
  data: CurveSeriesPoint[]
  height?: number
  showCumulativeOption?: boolean
  unit?: string
}

type ChartViewMode = 'all' | 'sexes' | 'total' | 'cumulative'

// Helper to compute smooth cubic bezier path through points
function buildSmoothPath(
  points: { x: number; y: number }[],
  tension: number = 0.25,
): string {
  if (points.length === 0) return ''
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`

  let path = `M ${points[0].x} ${points[0].y}`

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[Math.min(points.length - 1, i + 2)]

    const cp1x = p1.x + (p2.x - p0.x) * tension
    const cp1y = p1.y + (p2.y - p0.y) * tension

    const cp2x = p2.x - (p3.x - p1.x) * tension
    const cp2y = p2.y - (p3.y - p1.y) * tension

    path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`
  }

  return path
}

export default function AnimatedCurveChart({
  title = 'Courbes Démographiques Continues',
  subtitle = 'Évolution et profil lissé de la population selon les âges',
  data,
  showCumulativeOption = true,
  unit = 'hab.',
}: AnimatedCurveChartProps) {
  const [viewMode, setViewMode] = useState<ChartViewMode>('all')
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [showHommes, setShowHommes] = useState(true)
  const [showFemmes, setShowFemmes] = useState(true)
  const [showTotal, setShowTotal] = useState(true)
  const [animKey, setAnimKey] = useState(0)

  const svgRef = useRef<SVGSVGElement>(null)

  // Dimensions
  const svgWidth = 820
  const svgHeight = 320
  const padding = { top: 35, right: 35, bottom: 50, left: 60 }
  const plotWidth = svgWidth - padding.left - padding.right
  const plotHeight = svgHeight - padding.top - padding.bottom

  // Cumulative data if needed
  const totalSum = useMemo(
    () => data.reduce((acc, d) => acc + d.total, 0) || 1,
    [data],
  )

  const cumulativeData = useMemo(() => {
    return data.map((d, index) => {
      const running = data
        .slice(0, index + 1)
        .reduce((sum, item) => sum + item.total, 0)
      return {
        ...d,
        cumulValue: running,
        cumulPct: Math.round((running / totalSum) * 100),
      }
    })
  }, [data, totalSum])

  // Max value calculation based on mode
  const maxValue = useMemo(() => {
    if (viewMode === 'cumulative') {
      return 100 // percent
    }
    const maxData = Math.max(
      ...data.map((d) => {
        if (viewMode === 'total') return d.total
        if (viewMode === 'sexes') return Math.max(d.hommes, d.femmes)
        return d.total
      }),
      1,
    )
    // Round up nicely
    const factor = Math.pow(10, Math.floor(Math.log10(maxData)) || 1)
    return Math.ceil((maxData * 1.15) / factor) * factor || maxData + 2
  }, [data, viewMode])

  // Compute point coordinates
  const pointsHommes = useMemo(() => {
    if (data.length === 0) return []
    const step = plotWidth / (data.length - 1 || 1)
    return data.map((d, i) => {
      const x = padding.left + i * step
      const y = padding.top + plotHeight - (d.hommes / maxValue) * plotHeight
      return { x, y, value: d.hommes, label: d.label }
    })
  }, [data, maxValue, plotWidth, plotHeight, padding.left, padding.top])

  const pointsFemmes = useMemo(() => {
    if (data.length === 0) return []
    const step = plotWidth / (data.length - 1 || 1)
    return data.map((d, i) => {
      const x = padding.left + i * step
      const y = padding.top + plotHeight - (d.femmes / maxValue) * plotHeight
      return { x, y, value: d.femmes, label: d.label }
    })
  }, [data, maxValue, plotWidth, plotHeight, padding.left, padding.top])

  const pointsTotal = useMemo(() => {
    if (data.length === 0) return []
    const step = plotWidth / (data.length - 1 || 1)
    return data.map((d, i) => {
      const x = padding.left + i * step
      const y = padding.top + plotHeight - (d.total / maxValue) * plotHeight
      return { x, y, value: d.total, label: d.label }
    })
  }, [data, maxValue, plotWidth, plotHeight, padding.left, padding.top])

  const pointsCumulative = useMemo(() => {
    if (cumulativeData.length === 0) return []
    const step = plotWidth / (cumulativeData.length - 1 || 1)
    return cumulativeData.map((d, i) => {
      const x = padding.left + i * step
      const y = padding.top + plotHeight - (d.cumulPct / 100) * plotHeight
      return { x, y, value: d.cumulPct, label: d.label }
    })
  }, [cumulativeData, plotWidth, plotHeight, padding.left, padding.top])

  // Spline paths
  const baselineY = padding.top + plotHeight

  const pathHommes = useMemo(() => buildSmoothPath(pointsHommes), [pointsHommes])
  const areaHommes = useMemo(() => {
    if (pointsHommes.length < 2) return ''
    const firstX = pointsHommes[0].x
    const lastX = pointsHommes[pointsHommes.length - 1].x
    return `${pathHommes} L ${lastX} ${baselineY} L ${firstX} ${baselineY} Z`
  }, [pathHommes, pointsHommes, baselineY])

  const pathFemmes = useMemo(() => buildSmoothPath(pointsFemmes), [pointsFemmes])
  const areaFemmes = useMemo(() => {
    if (pointsFemmes.length < 2) return ''
    const firstX = pointsFemmes[0].x
    const lastX = pointsFemmes[pointsFemmes.length - 1].x
    return `${pathFemmes} L ${lastX} ${baselineY} L ${firstX} ${baselineY} Z`
  }, [pathFemmes, pointsFemmes, baselineY])

  const pathTotal = useMemo(() => buildSmoothPath(pointsTotal), [pointsTotal])
  const areaTotal = useMemo(() => {
    if (pointsTotal.length < 2) return ''
    const firstX = pointsTotal[0].x
    const lastX = pointsTotal[pointsTotal.length - 1].x
    return `${pathTotal} L ${lastX} ${baselineY} L ${firstX} ${baselineY} Z`
  }, [pathTotal, pointsTotal, baselineY])

  const pathCumulative = useMemo(() => buildSmoothPath(pointsCumulative), [pointsCumulative])
  const areaCumulative = useMemo(() => {
    if (pointsCumulative.length < 2) return ''
    const firstX = pointsCumulative[0].x
    const lastX = pointsCumulative[pointsCumulative.length - 1].x
    return `${pathCumulative} L ${lastX} ${baselineY} L ${firstX} ${baselineY} Z`
  }, [pathCumulative, pointsCumulative, baselineY])

  // Y-axis grid ticks (5 divisions)
  const yTicks = useMemo(() => {
    const ticks = []
    const count = 4
    for (let i = 0; i <= count; i++) {
      const val = Math.round((maxValue / count) * i)
      const y = padding.top + plotHeight - (i / count) * plotHeight
      ticks.push({ val, y })
    }
    return ticks
  }, [maxValue, plotHeight, padding.top])

  // Mouse hover detection along the chart
  const handleMouseMove = useCallback(
    (e: MouseEvent<SVGSVGElement>) => {
      if (!svgRef.current || data.length === 0) return
      const rect = svgRef.current.getBoundingClientRect()
      const clientX = e.clientX - rect.left
      const scaleX = svgWidth / rect.width
      const svgX = clientX * scaleX

      // Find closest data point
      const step = plotWidth / (data.length - 1 || 1)
      const relativeX = svgX - padding.left
      const index = Math.round(relativeX / step)
      if (index >= 0 && index < data.length) {
        setHoveredIndex(index)
      } else {
        setHoveredIndex(null)
      }
    },
    [data.length, plotWidth, padding.left, svgWidth],
  )

  const handleMouseLeave = () => {
    setHoveredIndex(null)
  }

  // Replay animation
  const replayAnimation = () => {
    setAnimKey((k) => k + 1)
  }

  const activePoint = hoveredIndex !== null && data[hoveredIndex] ? data[hoveredIndex] : null
  const activeCumul = hoveredIndex !== null && cumulativeData[hoveredIndex] ? cumulativeData[hoveredIndex] : null

  // Peak group calculation
  const peakGroup = useMemo(() => {
    if (data.length === 0) return null
    return [...data].sort((a, b) => b.total - a.total)[0]
  }, [data])

  return (
    <div className="card border-0 shadow-sm bg-white overflow-hidden">
      <div className="card-body p-4">
        {/* Header toolbar */}
        <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span
                className="badge bg-primary bg-opacity-10 text-primary fw-semibold px-2 py-1 rounded d-flex align-items-center gap-1"
                style={{ fontSize: '0.72rem' }}
              >
                <Icon name="activity" size={13} />
                <span>Courbes & Graphiques Animés</span>
              </span>
              {peakGroup && (
                <span className="badge bg-light text-secondary border small" style={{ fontSize: '0.7rem' }}>
                  Pic démographique : <strong>{peakGroup.label}</strong> ({peakGroup.total} {unit})
                </span>
              )}
            </div>
            <h3 className="h6 fw-bold mb-1 text-dark">{title}</h3>
            <p className="text-muted small mb-0">{subtitle}</p>
          </div>

          <div className="d-flex flex-wrap align-items-center gap-2">
            {/* View level pills */}
            <div className="d-flex p-1 bg-light rounded-3 border">
              <button
                type="button"
                className={`btn btn-sm border-0 ${viewMode === 'all' ? 'bg-white shadow-sm fw-semibold text-primary' : 'text-secondary'}`}
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}
                onClick={() => {
                  setViewMode('all')
                  replayAnimation()
                }}
              >
                Toutes les courbes
              </button>
              <button
                type="button"
                className={`btn btn-sm border-0 ${viewMode === 'sexes' ? 'bg-white shadow-sm fw-semibold text-primary' : 'text-secondary'}`}
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}
                onClick={() => {
                  setViewMode('sexes')
                  replayAnimation()
                }}
              >
                Hommes vs Femmes
              </button>
              <button
                type="button"
                className={`btn btn-sm border-0 ${viewMode === 'total' ? 'bg-white shadow-sm fw-semibold text-primary' : 'text-secondary'}`}
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}
                onClick={() => {
                  setViewMode('total')
                  replayAnimation()
                }}
              >
                Total
              </button>
              {showCumulativeOption && (
                <button
                  type="button"
                  className={`btn btn-sm border-0 ${viewMode === 'cumulative' ? 'bg-white shadow-sm fw-semibold text-primary' : 'text-secondary'}`}
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}
                  onClick={() => {
                    setViewMode('cumulative')
                    replayAnimation()
                  }}
                >
                  Courbe Cumulative (%)
                </button>
              )}
            </div>

            {/* Replay button */}
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
              onClick={replayAnimation}
              title="Rejouer l'animation de tracé"
            >
              <Icon name="play" size={13} />
              <span>Animer</span>
            </button>
          </div>
        </div>

        {/* Legend buttons & toggles */}
        {viewMode !== 'cumulative' && (
          <div className="d-flex flex-wrap align-items-center gap-3 mb-3 pb-2 border-bottom small">
            {(viewMode === 'all' || viewMode === 'total') && (
              <button
                type="button"
                className={`btn btn-sm border-0 p-0 d-flex align-items-center gap-1.5 ${showTotal ? 'opacity-100' : 'opacity-40'}`}
                onClick={() => setShowTotal(!showTotal)}
                title="Cliquer pour afficher/masquer"
              >
                <span
                  style={{
                    width: 16,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: '#6366f1',
                    display: 'inline-block',
                  }}
                />
                <span className="fw-medium text-dark" style={{ fontSize: '0.78rem' }}>
                  Population Totale
                </span>
              </button>
            )}

            {(viewMode === 'all' || viewMode === 'sexes') && (
              <>
                <button
                  type="button"
                  className={`btn btn-sm border-0 p-0 d-flex align-items-center gap-1.5 ${showHommes ? 'opacity-100' : 'opacity-40'}`}
                  onClick={() => setShowHommes(!showHommes)}
                  title="Cliquer pour afficher/masquer"
                >
                  <span
                    style={{
                      width: 16,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: '#2563eb',
                      display: 'inline-block',
                    }}
                  />
                  <span className="fw-medium text-primary" style={{ fontSize: '0.78rem' }}>
                    Hommes (Lahy)
                  </span>
                </button>

                <button
                  type="button"
                  className={`btn btn-sm border-0 p-0 d-flex align-items-center gap-1.5 ${showFemmes ? 'opacity-100' : 'opacity-40'}`}
                  onClick={() => setShowFemmes(!showFemmes)}
                  title="Cliquer pour afficher/masquer"
                >
                  <span
                    style={{
                      width: 16,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: '#059669',
                      display: 'inline-block',
                    }}
                  />
                  <span className="fw-medium text-success" style={{ fontSize: '0.78rem' }}>
                    Femmes (Vavy)
                  </span>
                </button>
              </>
            )}

            <span className="text-muted ms-auto" style={{ fontSize: '0.7rem' }}>
              Survolez la courbe pour explorer les détails
            </span>
          </div>
        )}

        {/* SVG Chart Area */}
        <div className="position-relative">
          <svg
            key={animKey}
            ref={svgRef}
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-100 h-auto"
            style={{ overflow: 'visible', userSelect: 'none', cursor: 'crosshair' }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <defs>
              {/* Gradients for smooth curve areas */}
              <linearGradient id="gradHommes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
              </linearGradient>

              <linearGradient id="gradFemmes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#059669" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
              </linearGradient>

              <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
              </linearGradient>

              <linearGradient id="gradCumulative" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.32" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
              </linearGradient>

              {/* Glow filter */}
              <filter id="curveGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Horizontal Grid lines and Y-axis labels */}
            {yTicks.map((t) => (
              <g key={t.y}>
                <line
                  x1={padding.left}
                  y1={t.y}
                  x2={svgWidth - padding.right}
                  y2={t.y}
                  className="chart-grid-line"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 10}
                  y={t.y + 4}
                  textAnchor="end"
                  className="chart-axis-text font-mono"
                  style={{ fontSize: '10px' }}
                >
                  {viewMode === 'cumulative' ? `${t.val}%` : t.val}
                </text>
              </g>
            ))}

            {/* Baseline */}
            <line
              x1={padding.left}
              y1={baselineY}
              x2={svgWidth - padding.right}
              y2={baselineY}
              stroke="#cbd5e1"
              strokeWidth="1.5"
            />

            {/* X-axis labels */}
            {data.map((d, i) => {
              const step = plotWidth / (data.length - 1 || 1)
              const x = padding.left + i * step
              const isHovered = hoveredIndex === i
              return (
                <g key={d.label}>
                  <line
                    x1={x}
                    y1={baselineY}
                    x2={x}
                    y2={baselineY + 5}
                    stroke="#94a3b8"
                    strokeWidth="1.5"
                  />
                  <text
                    x={x}
                    y={baselineY + 22}
                    textAnchor="middle"
                    className={`chart-axis-text font-mono ${isHovered ? 'fw-bold' : ''}`}
                    style={{
                      fontSize: isHovered ? '11px' : '10px',
                      fill: isHovered ? '#2563eb' : undefined,
                    }}
                  >
                    {d.label}
                  </text>
                </g>
              )
            })}

            {/* DRAW CURVES BASED ON VIEW MODE */}

            {/* MODE: CUMULATIVE */}
            {viewMode === 'cumulative' && (
              <g>
                <path
                  d={areaCumulative}
                  fill="url(#gradCumulative)"
                  className="chart-area-fill"
                />
                <path
                  d={pathCumulative}
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  className="chart-curve-path"
                  filter="url(#curveGlow)"
                />
                {pointsCumulative.map((pt, idx) => (
                  <circle
                    key={idx}
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredIndex === idx ? 6 : 4}
                    fill="#ffffff"
                    stroke="#0284c7"
                    strokeWidth="2.5"
                    className="chart-node-appear"
                    style={{ animationDelay: `${0.2 + idx * 0.08}s` }}
                  />
                ))}
              </g>
            )}

            {/* MODE: TOTAL */}
            {viewMode !== 'cumulative' && showTotal && (viewMode === 'all' || viewMode === 'total') && (
              <g>
                <path d={areaTotal} fill="url(#gradTotal)" className="chart-area-fill" />
                <path
                  d={pathTotal}
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  className="chart-curve-path"
                />
                {pointsTotal.map((pt, idx) => (
                  <circle
                    key={idx}
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredIndex === idx ? 6.5 : 4}
                    fill="#ffffff"
                    stroke="#6366f1"
                    strokeWidth="2.5"
                    className="chart-node-appear"
                    style={{ animationDelay: `${0.15 + idx * 0.07}s` }}
                  />
                ))}
              </g>
            )}

            {/* MODE: HOMMES */}
            {viewMode !== 'cumulative' && showHommes && (viewMode === 'all' || viewMode === 'sexes') && (
              <g>
                <path d={areaHommes} fill="url(#gradHommes)" className="chart-area-fill" />
                <path
                  d={pathHommes}
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="chart-curve-path"
                />
                {pointsHommes.map((pt, idx) => (
                  <circle
                    key={idx}
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredIndex === idx ? 6 : 3.5}
                    fill="#ffffff"
                    stroke="#2563eb"
                    strokeWidth="2"
                    className="chart-node-appear"
                    style={{ animationDelay: `${0.25 + idx * 0.07}s` }}
                  />
                ))}
              </g>
            )}

            {/* MODE: FEMMES */}
            {viewMode !== 'cumulative' && showFemmes && (viewMode === 'all' || viewMode === 'sexes') && (
              <g>
                <path d={areaFemmes} fill="url(#gradFemmes)" className="chart-area-fill" />
                <path
                  d={pathFemmes}
                  fill="none"
                  stroke="#059669"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="chart-curve-path"
                />
                {pointsFemmes.map((pt, idx) => (
                  <circle
                    key={idx}
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredIndex === idx ? 6 : 3.5}
                    fill="#ffffff"
                    stroke="#059669"
                    strokeWidth="2"
                    className="chart-node-appear"
                    style={{ animationDelay: `${0.35 + idx * 0.07}s` }}
                  />
                ))}
              </g>
            )}

            {/* HOVER CROSSHAIR AND PULSE RINGS */}
            {hoveredIndex !== null && (
              <g>
                {/* Vertical cursor guide */}
                {(() => {
                  const step = plotWidth / (data.length - 1 || 1)
                  const curX = padding.left + hoveredIndex * step
                  return (
                    <>
                      <line
                        x1={curX}
                        y1={padding.top}
                        x2={curX}
                        y2={baselineY}
                        stroke="#2563eb"
                        strokeWidth="1.5"
                        strokeDasharray="4 3"
                        opacity="0.8"
                      />

                      {/* Radar pulse rings at hover points */}
                      {viewMode === 'cumulative' && pointsCumulative[hoveredIndex] && (
                        <>
                          <circle
                            cx={pointsCumulative[hoveredIndex].x}
                            cy={pointsCumulative[hoveredIndex].y}
                            className="chart-pulse-ring"
                            fill="none"
                            stroke="#0284c7"
                          />
                          <circle
                            cx={pointsCumulative[hoveredIndex].x}
                            cy={pointsCumulative[hoveredIndex].y}
                            r="6"
                            fill="#0284c7"
                          />
                        </>
                      )}

                      {viewMode !== 'cumulative' && showTotal && pointsTotal[hoveredIndex] && (
                        <circle
                          cx={pointsTotal[hoveredIndex].x}
                          cy={pointsTotal[hoveredIndex].y}
                          className="chart-pulse-ring"
                          fill="none"
                          stroke="#6366f1"
                        />
                      )}

                      {viewMode !== 'cumulative' && showHommes && pointsHommes[hoveredIndex] && (
                        <circle
                          cx={pointsHommes[hoveredIndex].x}
                          cy={pointsHommes[hoveredIndex].y}
                          className="chart-pulse-ring"
                          fill="none"
                          stroke="#2563eb"
                        />
                      )}

                      {viewMode !== 'cumulative' && showFemmes && pointsFemmes[hoveredIndex] && (
                        <circle
                          cx={pointsFemmes[hoveredIndex].x}
                          cy={pointsFemmes[hoveredIndex].y}
                          className="chart-pulse-ring"
                          fill="none"
                          stroke="#059669"
                        />
                      )}
                    </>
                  )
                })()}
              </g>
            )}
          </svg>

          {/* FLOATING HOVER CARD / TOOLTIP */}
          {activePoint && hoveredIndex !== null && (
            <div
              className="chart-tooltip-glass position-absolute p-3 shadow-lg pointer-events-none"
              style={{
                top: 15,
                left: `${Math.min(
                  Math.max(
                    ((padding.left + (hoveredIndex * plotWidth) / (data.length - 1 || 1)) / svgWidth) * 100,
                    12,
                  ),
                  80,
                )}%`,
                transform: 'translateX(-50%)',
                minWidth: '200px',
                zIndex: 10,
              }}
            >
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="badge bg-primary bg-opacity-25 text-white fw-semibold">
                  {activePoint.label}
                </span>
                <span className="font-mono small opacity-75">
                  {Math.round((activePoint.total / totalSum) * 100)}% du total
                </span>
              </div>

              {viewMode === 'cumulative' && activeCumul ? (
                <div className="mt-2">
                  <div className="small opacity-75">Cumul de population :</div>
                  <div className="fs-5 fw-bold font-mono text-cyan-300">
                    {activeCumul.cumulValue} {unit} ({activeCumul.cumulPct}%)
                  </div>
                  <div className="small opacity-75 mt-1" style={{ fontSize: '0.72rem' }}>
                    Tranche courante : +{activePoint.total} personnes
                  </div>
                </div>
              ) : (
                <div className="d-flex flex-column gap-1 mt-2">
                  <div className="d-flex justify-content-between align-items-center small">
                    <span className="opacity-80">Population totale :</span>
                    <strong className="font-mono text-white fs-6">
                      {activePoint.total} {unit}
                    </strong>
                  </div>

                  <div className="d-flex justify-content-between align-items-center small text-blue-200">
                    <span className="d-flex align-items-center gap-1">
                      <span style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: '#3b82f6' }} />
                      Hommes :
                    </span>
                    <span className="font-mono fw-semibold">
                      {activePoint.hommes} ({activePoint.total > 0 ? Math.round((activePoint.hommes / activePoint.total) * 100) : 0}%)
                    </span>
                  </div>

                  <div className="d-flex justify-content-between align-items-center small text-emerald-200">
                    <span className="d-flex align-items-center gap-1">
                      <span style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: '#10b981' }} />
                      Femmes :
                    </span>
                    <span className="font-mono fw-semibold">
                      {activePoint.femmes} ({activePoint.total > 0 ? Math.round((activePoint.femmes / activePoint.total) * 100) : 0}%)
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info pills */}
        <div className="d-flex flex-wrap justify-content-between align-items-center pt-3 mt-2 border-top small text-muted">
          <div className="d-flex align-items-center gap-3">
            <span>
              Total recensé analysé : <strong className="text-dark font-mono">{totalSum}</strong> {unit}
            </span>
            <span>·</span>
            <span>
              Tranches d'âge : <strong className="text-dark font-mono">{data.length}</strong>
            </span>
          </div>

          <div className="d-flex align-items-center gap-2" style={{ fontSize: '0.72rem' }}>
            <span className="badge bg-light text-secondary border">Interpolation Spline Bézier Cubique</span>
            <span className="badge bg-light text-secondary border">Rendu SVG Vectoriel 60fps</span>
          </div>
        </div>
      </div>
    </div>
  )
}
