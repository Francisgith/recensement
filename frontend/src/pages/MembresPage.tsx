import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Alert, Badge, Button, Card, Form, Modal, Spinner, Table } from '../components/ui'
import { getApiError } from '../api/client'
import { individuApi, membreApi } from '../api/resources'
import type { Individu, MembreFamille, MembrePayload, Sexe } from '../api/types'
import { SEXE_OPTIONS, sexeLabel } from '../api/types'
import Icon from '../components/Icon'
import DeleteConfirmModal from '../components/DeleteConfirmModal'
import PhotoUpload from '../components/PhotoUpload'

interface FormState {
  nom: string
  age: string
  sexe: Sexe
  profession: string
  lien: string
  chef: string
  photo: string | null
}

const emptyForm: FormState = { nom: '', age: '', sexe: 'VAVY', profession: '', lien: '', chef: '', photo: null }

export default function MembresPage() {
  const [items, setItems] = useState<MembreFamille[]>([])
  const [chefs, setChefs] = useState<Individu[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [q, setQ] = useState('')
  const [sexe, setSexe] = useState<Sexe | ''>('')

  const [show, setShow] = useState(false)
  const [editing, setEditing] = useState<MembreFamille | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<MembreFamille | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [membres, individus] = await Promise.all([membreApi.list({ q, sexe }), individuApi.list()])
      setItems(membres)
      setChefs(individus)
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
    setForm({ ...emptyForm, chef: chefs[0]?.id ?? '' })
    setFormError('')
    setShow(true)
  }

  const openEdit = (item: MembreFamille) => {
    setEditing(item)
    setForm({
      nom: item.nom,
      age: String(item.age),
      sexe: item.sexe,
      profession: item.profession ?? '',
      lien: item.lien ?? '',
      chef: item.chef?.id ?? chefs[0]?.id ?? '',
      photo: item.photo ?? null,
    })
    setFormError('')
    setShow(true)
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setFormError('')
    const payload: MembrePayload = {
      nom: form.nom.trim(),
      age: Number(form.age),
      sexe: form.sexe,
      profession: form.profession.trim() || null,
      lien: form.lien.trim() || null,
      photo: form.photo,
      chef: form.chef,
    }
    try {
      if (editing) {
        await membreApi.update(editing.id, payload)
      } else {
        await membreApi.create(payload)
      }
      setShow(false)
      await load()
    } catch (err) {
      setFormError(getApiError(err))
    } finally {
      setSaving(false)
    }
  }

  const remove = async (item: MembreFamille) => {
    setDeleteTarget(item)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await membreApi.remove(deleteTarget.id)
      setDeleteTarget(null)
      await load()
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <div className="page-header d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div>
          <h1>Membres de la famille</h1>
          <p>Ankohonana</p>
        </div>
        <Button variant="primary" onClick={openCreate} disabled={chefs.length === 0}>
          <Icon name="plus" size={16} className="me-1" /> Nouveau membre
        </Button>
      </div>

      <Card className="border-0 shadow-sm mb-3">
        <Card.Body>
          <div className="row g-2 align-items-end">
            <div className="col-md-6">
              <Form.Label className="small fw-semibold">Rechercher par nom</Form.Label>
              <Form.Control value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nom..." />
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
                <th>Rohy</th>
                <th>Chef de famille</th>
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
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        {item.photo ? (
                          <img
                            src={item.photo}
                            alt={item.nom}
                            className="rounded-circle"
                            style={{ width: 36, height: 36, objectFit: 'cover', border: '2px solid #e2e8f0' }}
                          />
                        ) : (
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                            style={{ width: 36, height: 36, backgroundColor: '#94a3b8', fontSize: '0.8rem', border: '2px solid #e2e8f0' }}
                          >
                            {item.nom.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="fw-semibold">{item.nom}</span>
                      </div>
                    </td>
                    <td>{item.age}</td>
                    <td>
                      <Badge bg={item.sexe === 'LAHY' ? 'primary' : 'danger'}>
                        {sexeLabel(item.sexe)}
                      </Badge>
                    </td>
                    <td>{item.profession ?? '—'}</td>
                    <td>{item.lien ?? '—'}</td>
                    <td>{item.chef?.nom ?? '—'}</td>
                    <td className="text-end">
                      <Button
                        size="sm"
                        variant="outline-primary"
                        className="me-1"
                        onClick={() => openEdit(item)}
                      >
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
              {editing ? 'Modifier le membre' : 'Nouveau membre'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {formError && (
              <Alert variant="danger" className="py-2 small">
                {formError}
              </Alert>
            )}
            <PhotoUpload
              value={form.photo}
              onChange={(photo) => setForm({ ...form, photo })}
              name={editing?.nom ?? 'Nouveau membre'}
            />
            <div className="row g-3">
              <div className="col-12">
                <Form.Label>Chef de famille (RAIM/RENIM) *</Form.Label>
                <Form.Select
                  value={form.chef}
                  required
                  onChange={(e) => setForm({ ...form, chef: e.target.value })}
                >
                  <option value="">— Sélectionner —</option>
                  {chefs.map((chef) => (
                    <option key={chef.id} value={chef.id}>
                      {chef.nom}
                    </option>
                  ))}
                </Form.Select>
              </div>
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
              <div className="col-6">
                <Form.Label>Asa</Form.Label>
                <Form.Control
                  value={form.profession}
                  onChange={(e) => setForm({ ...form, profession: e.target.value })}
                />
              </div>
              <div className="col-6">
                <Form.Label>Rohy (lien)</Form.Label>
                <Form.Control
                  value={form.lien}
                  onChange={(e) => setForm({ ...form, lien: e.target.value })}
                  placeholder="Fille, Fils, Épouse..."
                />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShow(false)} disabled={saving}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? <Spinner size="sm" animation="border" /> : editing ? 'Mettre à jour' : 'Enregistrer'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <DeleteConfirmModal
        show={deleteTarget !== null}
        name={deleteTarget?.nom ?? ''}
        message={`Supprimer « ${deleteTarget?.nom} » de la famille ?`}
        deleting={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
