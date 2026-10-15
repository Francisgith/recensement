import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Alert, Badge, Button, Card, Form, Modal, Spinner, Table } from '../components/ui'
import { getApiError } from '../api/client'
import { individuApi, membreApi } from '../api/resources'
import type { Individu, MembreFamille, MembrePayload, Sexe } from '../api/types'
import { SEXE_OPTIONS, sexeLabel } from '../api/types'
import Icon from '../components/Icon'
import DeleteConfirmModal from '../components/DeleteConfirmModal'
import PhotoUpload from '../components/PhotoUpload'
import BackButton from '../components/BackButton'

interface FormState {
  nom: string
  age: string
  sexe: Sexe
  profession: string
  lien: string
  chef: string
  photo: string | null
}

const emptyForm: FormState = {
  nom: '',
  age: '',
  sexe: 'VAVY',
  profession: '',
  lien: '',
  chef: '',
  photo: null,
}

export default function MembresPage() {
  const [items, setItems] = useState<MembreFamille[]>([])
  const [chefs, setChefs] = useState<Individu[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [q, setQ] = useState('')
  const [sexe, setSexe] = useState<Sexe | ''>('')
  const [chefFilter, setChefFilter] = useState('')

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
      const [membres, individus] = await Promise.all([
        membreApi.list({ q, sexe, ...(chefFilter ? { chef: chefFilter } : {}) }),
        individuApi.list(),
      ])
      setItems(membres)
      setChefs(individus)
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setLoading(false)
    }
  }, [q, sexe, chefFilter])

  useEffect(() => {
    let ignore = false
    const fetchMembres = async () => {
      setLoading(true)
      setError('')
      try {
        const [membres, individus] = await Promise.all([
          membreApi.list({ q, sexe, ...(chefFilter ? { chef: chefFilter } : {}) }),
          individuApi.list(),
        ])
        if (!ignore) {
          setItems(membres)
          setChefs(individus)
        }
      } catch (err) {
        if (!ignore) setError(getApiError(err))
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    void fetchMembres()
    return () => {
      ignore = true
    }
  }, [q, sexe, chefFilter])

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
        setSuccessMsg(`Membre « ${payload.nom} » mis à jour avec succès.`)
      } else {
        await membreApi.create(payload)
        setSuccessMsg(`Nouveau membre « ${payload.nom} » ajouté avec succès.`)
      }
      setShow(false)
      await load()
      setTimeout(() => setSuccessMsg(''), 4000)
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
      setSuccessMsg(`Le membre « ${deleteTarget.nom} » a été supprimé.`)
      setDeleteTarget(null)
      await load()
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="d-flex flex-column gap-3">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div className="d-flex align-items-center gap-3">
          <BackButton />
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span
                className="badge bg-warning bg-opacity-10 text-warning fw-semibold px-2 py-1 rounded border border-warning border-opacity-25"
                style={{ fontSize: '0.75rem' }}
              >
                Ankohonana
              </span>
              <span className="text-muted small">Membres rattachés aux foyers</span>
            </div>
            <h1 className="h4 fw-bold text-dark mb-1">Membres de la Famille</h1>
            <p className="text-secondary small mb-0">
              Gestion des membres dépendants, conjoints et enfants recensés
            </p>
          </div>
        </div>
        <Button variant="primary" size="sm" onClick={openCreate} disabled={chefs.length === 0}>
          <Icon name="plus" size={16} className="me-1" /> Nouveau membre
        </Button>
      </div>

      {successMsg && <Alert variant="success" className="py-2 small">{successMsg}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Filter toolbar */}
      <Card className="border-0 shadow-sm bg-white">
        <Card.Body className="p-3">
          <div className="row g-2 align-items-end">
            <div className="col-md-5">
              <Form.Label className="small fw-semibold text-secondary mb-1">Rechercher par nom</Form.Label>
              <Form.Control value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nom du membre..." />
            </div>
            <div className="col-md-3">
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
            <div className="col-md-4">
              <Form.Label className="small fw-semibold text-secondary mb-1">Filtrer par Chef de famille</Form.Label>
              <Form.Select value={chefFilter} onChange={(e) => setChefFilter(e.target.value)}>
                <option value="">Tous les chefs de famille</option>
                {chefs.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nom} {c.region ? `(${c.region})` : ''}
                  </option>
                ))}
              </Form.Select>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-sm bg-white">
        <div className="table-responsive">
          <Table hover className="align-middle mb-0 table-hover-soft">
            <thead className="table-light">
              <tr>
                <th>Anarana (Nom)</th>
                <th>Taona (Âge)</th>
                <th>Sokajy (Sexe)</th>
                <th>Asa (Profession)</th>
                <th>Rohy (Lien)</th>
                <th>Chef de famille (Foyer)</th>
                <th>Localisation</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-4">
                    <Spinner animation="border" size="sm" />
                    <span className="ms-2 text-muted small">Chargement...</span>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-muted py-4">
                    Aucun membre trouvé pour ces critères.
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
                            style={{
                              width: 36,
                              height: 36,
                              objectFit: 'cover',
                              border: '2px solid #e2e8f0',
                            }}
                          />
                        ) : (
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                            style={{
                              width: 36,
                              height: 36,
                              backgroundColor: item.sexe === 'LAHY' ? '#2563eb' : '#059669',
                              fontSize: '0.8rem',
                              border: '2px solid #e2e8f0',
                            }}
                          >
                            {item.nom.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="fw-semibold text-dark">{item.nom}</span>
                      </div>
                    </td>
                    <td className="font-mono tabular-nums">{item.age} ans</td>
                    <td>
                      <Badge bg={item.sexe === 'LAHY' ? 'primary' : 'success'}>
                        {sexeLabel(item.sexe)}
                      </Badge>
                    </td>
                    <td className="text-secondary small">{item.profession ?? '—'}</td>
                    <td>
                      <span className="badge bg-light text-secondary border">
                        {item.lien ?? 'Membre'}
                      </span>
                    </td>
                    <td>
                      <div className="fw-medium text-dark">{item.chef?.nom ?? '—'}</div>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                        Chef de ménage
                      </div>
                    </td>
                    <td className="text-secondary small">
                      {item.region ? `${item.region} · ${item.district || ''}` : item.province ?? '—'}
                    </td>
                    <td className="text-end text-nowrap">
                      <Link
                        to={`/documents?citizenId=${item.id}&type=residence`}
                        className="btn btn-sm btn-outline-success btn-icon me-1"
                        title="Établir un document officiel (Certificat, CIN, Acte)"
                        aria-label="Établir un document"
                      >
                        <Icon name="file-text" size={15} />
                      </Link>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary btn-icon me-1"
                        onClick={() => openEdit(item)}
                        title="Modifier ce membre"
                        aria-label="Modifier"
                      >
                        <Icon name="edit" size={15} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger btn-icon"
                        onClick={() => remove(item)}
                        title="Supprimer ce membre"
                        aria-label="Supprimer"
                      >
                        <Icon name="trash" size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </Card>

      {/* Modal create / edit */}
      <Modal show={show} onHide={() => setShow(false)} centered>
        <Form onSubmit={submit}>
          <Modal.Header closeButton>
            <Modal.Title className="h5">
              {editing ? 'Modifier le membre' : 'Nouveau membre de famille'}
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
                <Form.Label>Chef de famille (Raim/Renim-pianakavina) *</Form.Label>
                <Form.Select
                  value={form.chef}
                  required
                  onChange={(e) => setForm({ ...form, chef: e.target.value })}
                >
                  <option value="">— Sélectionner le chef de famille —</option>
                  {chefs.map((chef) => (
                    <option key={chef.id} value={chef.id}>
                      {chef.nom} {chef.region ? `(${chef.region})` : ''}
                    </option>
                  ))}
                </Form.Select>
              </div>

              <div className="col-12">
                <Form.Label>Anarana sy Fanampiny (Nom & Prénoms) *</Form.Label>
                <Form.Control
                  value={form.nom}
                  required
                  minLength={2}
                  placeholder="Ex : RAKOTO Faly"
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                />
              </div>

              <div className="col-6">
                <Form.Label>Taona (Âge) *</Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  max={130}
                  value={form.age}
                  required
                  placeholder="Ex : 18"
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                />
              </div>

              <div className="col-6">
                <Form.Label>Sokajy (Sexe) *</Form.Label>
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
                <Form.Label>Asa (Profession)</Form.Label>
                <Form.Control
                  value={form.profession}
                  placeholder="Ex : Mpianatra, Mpanjaitra..."
                  onChange={(e) => setForm({ ...form, profession: e.target.value })}
                />
              </div>

              <div className="col-6">
                <Form.Label>Rohy amin'ny Chef (Lien de parenté)</Form.Label>
                <Form.Control
                  value={form.lien}
                  placeholder="Époux, Fille, Fils, Frère..."
                  onChange={(e) => setForm({ ...form, lien: e.target.value })}
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

      {/* Delete Confirmation Modal */}
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
