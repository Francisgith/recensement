import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Badge, Button, Card, Form, Spinner, Table } from '../components/ui'
import { getApiError } from '../api/client'
import { statsApi } from '../api/resources'
import type { PopulationResult, Sexe } from '../api/types'
import { SEXE_OPTIONS, sexeLabel } from '../api/types'
import { getAllProvinces, getRegionsForProvince } from '../data/madagascarGeo'
import Icon from '../components/Icon'

interface Preset {
  label: string
  min?: number
  max?: number
}

const presets: Preset[] = [
  { label: 'Enfants (< 6 ans)', max: 5 },
  { label: 'Scolarisables (6 à 14 ans)', min: 6, max: 14 },
  { label: 'Jeunes (15 à 24 ans)', min: 15, max: 24 },
  { label: 'Majeurs (18 ans et +)', min: 18 },
  { label: 'Population active (15-64 ans)', min: 15, max: 64 },
  { label: 'Seniors (65 ans et +)', min: 65 },
]

export default function PopulationPage() {
  const [result, setResult] = useState<PopulationResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [q, setQ] = useState('')
  const [sexe, setSexe] = useState<Sexe | ''>('')
  const [min, setMin] = useState('')
  const [max, setMax] = useState('')
  const [province, setProvince] = useState('')
  const [region, setRegion] = useState('')

  const provinces = useMemo(() => getAllProvinces(), [])
  const regions = useMemo(
    () => (province ? getRegionsForProvince(province).map((r) => r.nom) : []),
    [province],
  )

  useEffect(() => {
    let ignore = false
    const searchPopulation = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await statsApi.population({
          q,
          sexe,
          min: min === '' ? '' : Number(min),
          max: max === '' ? '' : Number(max),
          province,
          region,
        })
        if (!ignore) setResult(data)
      } catch (err) {
        if (!ignore) setError(getApiError(err))
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    const timer = setTimeout(() => {
      void searchPopulation()
    }, 250)

    return () => {
      ignore = true
      clearTimeout(timer)
    }
  }, [q, sexe, min, max, province, region])

  const applyPreset = (preset: Preset) => {
    setMin(preset.min !== undefined ? String(preset.min) : '')
    setMax(preset.max !== undefined ? String(preset.max) : '')
  }

  const reset = () => {
    setQ('')
    setSexe('')
    setMin('')
    setMax('')
    setProvince('')
    setRegion('')
  }

  const handleExportCSV = () => {
    if (!result?.items.length) return
    const headers = [
      'Nom',
      'Age',
      'Sexe',
      'Statut',
      'Chef de famille',
      'Province',
      'Region',
      'District',
      'Commune',
      'Fokontany',
    ]
    const rows = result.items.map((item) => [
      `"${item.nom}"`,
      item.age,
      item.sexe,
      item.source === 'individu' ? 'Chef de famille' : 'Membre',
      `"${item.chef || ''}"`,
      `"${item.province || ''}"`,
      `"${item.region || ''}"`,
      `"${item.district || ''}"`,
      `"${item.commune || ''}"`,
      `"${item.fokontany || ''}"`,
    ])
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute(
      'download',
      `population_recensee_${new Date().toISOString().slice(0, 10)}.csv`,
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="d-flex flex-column gap-3">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span
              className="badge bg-dark bg-opacity-10 text-dark fw-semibold px-2 py-1 rounded"
              style={{ fontSize: '0.75rem' }}
            >
              Fikarohana
            </span>
            <span className="text-muted small">Registres combinés chefs et membres</span>
          </div>
          <h1 className="h4 fw-bold text-dark mb-1">Recherche dans la Population</h1>
          <p className="text-secondary small mb-0">
            Filtres démographiques multicritères : âge, sexe, foyer et province
          </p>
        </div>

        <Button
          variant="outline-primary"
          size="sm"
          onClick={handleExportCSV}
          disabled={!result?.items.length}
        >
          <Icon name="download" size={14} className="me-1" />
          Exporter CSV ({result?.total ?? 0})
        </Button>
      </div>

      {/* Advanced Filter Card */}
      <Card className="border-0 shadow-sm bg-white">
        <Card.Body className="p-3 p-md-4">
          <div className="row g-2 align-items-end">
            <div className="col-md-4">
              <Form.Label className="small fw-semibold text-secondary mb-1">Recherche par nom</Form.Label>
              <Form.Control
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Ex : Rakoto, Eugene, Annie..."
              />
            </div>
            <div className="col-md-2">
              <Form.Label className="small fw-semibold text-secondary mb-1">Sexe</Form.Label>
              <Form.Select value={sexe} onChange={(e) => setSexe(e.target.value as Sexe | '')}>
                <option value="">Tous</option>
                {SEXE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Form.Select>
            </div>
            <div className="col-md-2">
              <Form.Label className="small fw-semibold text-secondary mb-1">Âge minimum</Form.Label>
              <Form.Control
                type="number"
                min={0}
                max={130}
                value={min}
                placeholder="Ex : 18"
                onChange={(e) => setMin(e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <Form.Label className="small fw-semibold text-secondary mb-1">Âge maximum</Form.Label>
              <Form.Control
                type="number"
                min={0}
                max={130}
                value={max}
                placeholder="Ex : 60"
                onChange={(e) => setMax(e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <Button variant="outline-secondary" size="sm" className="w-100" onClick={reset}>
                Réinitialiser
              </Button>
            </div>

            {/* Geographical row */}
            <div className="col-md-6 pt-2">
              <Form.Label className="small fw-semibold text-secondary mb-1">Province</Form.Label>
              <Form.Select
                value={province}
                onChange={(e) => {
                  setProvince(e.target.value)
                  setRegion('')
                }}
              >
                <option value="">Toutes les provinces</option>
                {provinces.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Form.Select>
            </div>

            <div className="col-md-6 pt-2">
              <Form.Label className="small fw-semibold text-secondary mb-1">Région</Form.Label>
              <Form.Select
                value={region}
                disabled={!province}
                onChange={(e) => setRegion(e.target.value)}
              >
                <option value="">Toutes les régions</option>
                {regions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </Form.Select>
            </div>
          </div>

          {/* Quick presets */}
          <div className="mt-3 pt-3 border-top d-flex flex-wrap align-items-center gap-2">
            <span className="small text-muted align-self-center me-1">Filtres rapides d'âge :</span>
            {presets.map((preset) => (
              <Button
                key={preset.label}
                size="sm"
                variant="outline-success"
                onClick={() => applyPreset(preset)}
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </Card.Body>
      </Card>

      {error && <div className="alert alert-danger py-2 small">{error}</div>}

      {/* Result Count and Table */}
      <div className="d-flex justify-content-between align-items-center mb-1">
        <span className="badge bg-dark px-3 py-2 fs-6 font-mono tabular-nums">
          {loading ? '…' : result?.total ?? 0} individu(s) trouvé(s)
        </span>
      </div>

      <Card className="border-0 shadow-sm bg-white">
        <div className="table-responsive">
          <Table hover className="align-middle mb-0 table-hover-soft">
            <thead className="table-light">
              <tr>
                <th>Nom & Prénoms</th>
                <th>Âge</th>
                <th>Sexe</th>
                <th>Statut</th>
                <th>Rattaché au foyer de</th>
                <th>Province / Région</th>
                <th>Fokontany</th>
                <th className="text-end">Actes</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-4">
                    <Spinner animation="border" size="sm" />
                    <span className="ms-2 text-muted small">Recherche en cours...</span>
                  </td>
                </tr>
              ) : !result || result.items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-muted py-4">
                    Aucun individu ne correspond aux filtres appliqués.
                  </td>
                </tr>
              ) : (
                result.items.map((item) => (
                  <tr key={`${item.source}-${item.id}`}>
                    <td className="fw-semibold text-dark">{item.nom}</td>
                    <td className="font-mono tabular-nums">{item.age} ans</td>
                    <td>
                      <Badge bg={item.sexe === 'LAHY' ? 'primary' : 'success'}>
                        {sexeLabel(item.sexe)}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={item.source === 'individu' ? 'primary' : 'secondary'}>
                        {item.source === 'individu' ? 'Chef de famille' : 'Membre'}
                      </Badge>
                    </td>
                    <td>
                      {item.chef ? (
                        <span className="text-dark fw-medium">{item.chef}</span>
                      ) : (
                        <span className="text-muted small">Titulaire du foyer</span>
                      )}
                    </td>
                    <td className="text-secondary small">
                      {item.region ? `${item.region} (${item.province || ''})` : item.province ?? '—'}
                    </td>
                    <td className="text-muted small">{item.fokontany ?? '—'}</td>
                    <td className="text-end text-nowrap">
                      <Link
                        to={`/documents?citizenId=${item.id}&type=residence`}
                        className="btn btn-sm btn-outline-success btn-icon"
                        title="Établir un document officiel (Certificat de résidence, CIN, Acte de naissance)"
                        aria-label="Établir un document officiel"
                      >
                        <Icon name="file-text" size={15} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
