import { useCallback, useEffect, useState } from 'react'
import { Badge, Button, Card, Form, Spinner, Table } from '../components/ui'
import { getApiError } from '../api/client'
import { statsApi } from '../api/resources'
import type { PopulationResult, Sexe } from '../api/types'
import { SEXE_OPTIONS, sexeLabel } from '../api/types'

interface Preset {
  label: string
  min?: number
  max?: number
}

const presets: Preset[] = [
  { label: '+ 18 ans', min: 19 },
  { label: '+ 65 ans', min: 66 },
  { label: '- 6 ans', max: 5 },
  { label: '6 à 24 ans', min: 6, max: 24 },
]

export default function PopulationPage() {
  const [result, setResult] = useState<PopulationResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sexe, setSexe] = useState<Sexe | ''>('')
  const [min, setMin] = useState('')
  const [max, setMax] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setResult(
        await statsApi.population({
          sexe,
          min: min === '' ? '' : Number(min),
          max: max === '' ? '' : Number(max),
        }),
      )
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setLoading(false)
    }
  }, [sexe, min, max])

  useEffect(() => {
    void load()
  }, [load])

  const applyPreset = (preset: Preset) => {
    setMin(preset.min !== undefined ? String(preset.min) : '')
    setMax(preset.max !== undefined ? String(preset.max) : '')
  }

  const reset = () => {
    setSexe('')
    setMin('')
    setMax('')
  }

  return (
    <div>
      <div className="page-header">
        <h1>Recherche dans la population</h1>
        <p>Fitadiavana mponina amin'ny alalan'ny taona sy ny sokajy</p>
      </div>

      <Card className="border-0 shadow-sm mb-3">
        <Card.Body>
          <div className="row g-2 align-items-end">
            <div className="col-md-3">
              <Form.Label className="small fw-semibold">Sokajy</Form.Label>
              <Form.Select value={sexe} onChange={(e) => setSexe(e.target.value as Sexe | '')}>
                <option value="">Tous</option>
                {SEXE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Form.Select>
            </div>
            <div className="col-md-3">
              <Form.Label className="small fw-semibold">Âge minimum</Form.Label>
              <Form.Control type="number" min={0} max={130} value={min} onChange={(e) => setMin(e.target.value)} />
            </div>
            <div className="col-md-3">
              <Form.Label className="small fw-semibold">Âge maximum</Form.Label>
              <Form.Control type="number" min={0} max={130} value={max} onChange={(e) => setMax(e.target.value)} />
            </div>
            <div className="col-md-3 d-flex gap-2">
              <Button variant="outline-secondary" className="w-100" onClick={reset}>
                Réinitialiser
              </Button>
            </div>
          </div>

          <div className="mt-3 d-flex flex-wrap gap-2">
            <span className="small text-muted align-self-center me-1">Tranches rapides :</span>
            {presets.map((preset) => (
              <Button key={preset.label} size="sm" variant="outline-success" onClick={() => applyPreset(preset)}>
                {preset.label}
              </Button>
            ))}
          </div>
        </Card.Body>
      </Card>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="d-flex align-items-center gap-2 mb-2">
        <span className="badge text-bg-dark fs-6">
          {loading ? '…' : result?.total ?? 0} personne(s)
        </span>
      </div>

      <Card className="border-0 shadow-sm">
        <div className="table-responsive">
          <Table hover className="align-middle mb-0 table-hover-soft">
            <thead className="table-light">
              <tr>
                <th>Anarana</th>
                <th>Taona</th>
                <th>Sokajy</th>
                <th>Origine</th>
                <th>Chef de famille</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-4">
                    <Spinner animation="border" size="sm" />
                  </td>
                </tr>
              ) : !result || result.items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-muted py-4">
                    Aucun résultat
                  </td>
                </tr>
              ) : (
                result.items.map((item) => (
                  <tr key={`${item.source}-${item.id}`}>
                    <td className="fw-semibold">{item.nom}</td>
                    <td>{item.age}</td>
                    <td>
                      <Badge bg={item.sexe === 'LAHY' ? 'primary' : 'danger'}>{sexeLabel(item.sexe)}</Badge>
                    </td>
                    <td>
                      <Badge bg={item.source === 'individu' ? 'success' : 'secondary'}>
                        {item.source === 'individu' ? 'Chef' : 'Membre'}
                      </Badge>
                    </td>
                    <td>{item.chef ?? '—'}</td>
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
