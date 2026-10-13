import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Alert, Badge, Button, Card, Form, Modal, Spinner, Table } from '../components/ui'
import { getApiError } from '../api/client'
import { individuApi } from '../api/resources'
import type { Individu, IndividuPayload, Sexe } from '../api/types'
import { SEXE_OPTIONS, sexeLabel } from '../api/types'

interface FormState {
  nom: string
  age: string
  sexe: Sexe
  profession: string
  adresse: string
  telephone: string
}

const emptyForm: FormState = { nom: '', age: '', sexe: 'LAHY', profession: '', adresse: '', telephone: '' }

export default function IndividusPage() {
  const [items, setItems] = useState<Individu[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [q, setQ] = useState('')
  const [sexe, setSexe] = useState<Sexe | ''>('')

  const [show, setShow] = useState(false)
  const [editing, setEditing] = useState<Individu | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setItems(await individuApi.list({ q, sexe }))
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setLoading(false)
    }
  }, [q, sexe])

  useEffect(() => {
    void load()
  }, [load])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setFormError('')
    setShow(true)
  }

  const openEdit = (item: Individu) => {
    setEditing(item)
    setForm({
      nom: item.nom,
      age: String(item.age),
      sexe: item.sexe,
      profession: item.profession ?? '',
      adresse: item.adresse ?? '',
      telephone: item.telephone ?? '',
    })
    setFormError('')
    setShow(true)
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setFormError('')
    const payload: IndividuPayload = {
      nom: form.nom.trim(),
      age: Number(form.age),
      sexe: form.sexe,
      profession: form.profession.trim() || null,
      adresse: form.adresse.trim() || null,
      telephone: form.telephone.trim() || null,
    }
    try {
      if (editing) {
        await individuApi.update(editing.id, payload)
      } else {
        await individuApi.create(payload)
      }
      setShow(false)
      await load()
    } catch (err) {
      setFormError(getApiError(err))
    } finally {
      setSaving(false)
    }
  }

  const remove = async (item: Individu) => {
    if (!window.confirm(`Supprimer « ${item.nom} » et sa famille ?`)) return
    try {
      await individuApi.remove(item.id)
      await load()
    } catch (err) {
      setError(getApiError(err))
    }
  }

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
        <div>
          <h1 className="h3 fw-bold mb-0">Chefs de famille</h1>
          <p className="text-muted mb-0">Raim(na renim-)-pianakavina</p>
        </div>
        <Button variant="success" onClick={openCreate}>
          ➕ Nouveau chef de famille
        </Button>
      </div>

      <Card className="border-0 shadow-sm mb-3">
        <Card.Body>
          <div className="row g-2 align-items-end">
            <div className="col-md-6">
              <Form.Label className="small fw-semibold">Rechercher par nom</Form.Label>
              <Form.Control
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Nom..."
              />
            </div>
            <div className="col-md-6">
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
          </div>
        </Card.Body>
      </Card>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="border-0 shadow-sm">
        <div className="table-responsive">
          <Table hover className="align-middle mb-0 table-hover-soft">
            <thead className="table-light">
              <tr>
                <th>Anarana</th>
                <th>Taona</th>
                <th>Sokajy</th>
                <th>Asa</th>
                <th>Adiresy</th>
                <th>Telefaona</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-4">
                    <Spinner animation="border" size="sm" />
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-4">
                    Aucun résultat
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id}>
                    <td className="fw-semibold">{item.nom}</td>
                    <td>{item.age}</td>
                    <td>
                      <Badge bg={item.sexe === 'LAHY' ? 'primary' : 'danger'}>
                        {sexeLabel(item.sexe)}
                      </Badge>
                    </td>
                    <td>{item.profession ?? '—'}</td>
                    <td>{item.adresse ?? '—'}</td>
                    <td>{item.telephone ?? '—'}</td>
                    <td className="text-end">
                      <Button size="sm" variant="outline-primary" className="me-1" onClick={() => openEdit(item)}>
                        Modifier
                      </Button>
                      <Button size="sm" variant="outline-danger" onClick={() => remove(item)}>
                        Supprimer
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </Card>

      <Modal show={show} onHide={() => setShow(false)} centered>
        <Form onSubmit={submit}>
          <Modal.Header closeButton>
            <Modal.Title className="h5">
              {editing ? 'Modifier le chef de famille' : 'Nouveau chef de famille'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {formError && (
              <Alert variant="danger" className="py-2 small">
                {formError}
              </Alert>
            )}
            <div className="row g-3">
              <div className="col-12">
                <Form.Label>Anarana *</Form.Label>
                <Form.Control
                  value={form.nom}
                  required
                  minLength={2}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                />
              </div>
              <div className="col-6">
                <Form.Label>Taona *</Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  max={130}
                  value={form.age}
                  required
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                />
              </div>
              <div className="col-6">
                <Form.Label>Sokajy *</Form.Label>
                <Form.Select
                  value={form.sexe}
                  onChange={(e) => setForm({ ...form, sexe: e.target.value as Sexe })}
                >
                  {SEXE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </div>
              <div className="col-12">
                <Form.Label>Asa</Form.Label>
                <Form.Control
                  value={form.profession}
                  onChange={(e) => setForm({ ...form, profession: e.target.value })}
                />
              </div>
              <div className="col-12">
                <Form.Label>Adiresy</Form.Label>
                <Form.Control
                  value={form.adresse}
                  onChange={(e) => setForm({ ...form, adresse: e.target.value })}
                />
              </div>
              <div className="col-12">
                <Form.Label>Telefaona</Form.Label>
                <Form.Control
                  value={form.telephone}
                  onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShow(false)} disabled={saving}>
              Annuler
            </Button>
            <Button type="submit" variant="success" disabled={saving}>
              {saving ? <Spinner size="sm" animation="border" /> : 'Enregistrer'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  )
}
