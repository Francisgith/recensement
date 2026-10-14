import { useCallback, useEffect, useState, useMemo } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Alert, Badge, Button, Card, Form, Modal, Spinner, Table } from '../components/ui'
import { getApiError } from '../api/client'
import { individuApi } from '../api/resources'
import type { Individu, IndividuPayload, Sexe } from '../api/types'
import { SEXE_OPTIONS, sexeLabel } from '../api/types'
import {
  getAllProvinces,
  getRegionsForProvince,
  getDistrictsForRegion,
  getCommunesForDistrict,
} from '../data/madagascarGeo'
import Icon from '../components/Icon'
import DeleteConfirmModal from '../components/DeleteConfirmModal'
import PhotoUpload from '../components/PhotoUpload'

interface FormState {
  nom: string
  age: string
  sexe: Sexe
  profession: string
  adresse: string
  telephone: string
  photo: string | null
  province: string
  region: string
  district: string
  commune: string
  fokontany: string
}

const emptyForm: FormState = {
  nom: '',
  age: '',
  sexe: 'LAHY',
  profession: '',
  adresse: '',
  telephone: '',
  photo: null,
  province: '',
  region: '',
  district: '',
  commune: '',
  fokontany: '',
}

export default function IndividusPage() {
  const [items, setItems] = useState<Individu[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [q, setQ] = useState('')
  const [sexe, setSexe] = useState<Sexe | ''>('')
  const [filterProvince, setFilterProvince] = useState('')
  const [filterRegion, setFilterRegion] = useState('')

  const [show, setShow] = useState(false)
  const [editing, setEditing] = useState<Individu | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<Individu | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Geographical lists for form
  const provincesList = useMemo(() => getAllProvinces(), [])
  const formRegions = useMemo(
    () => (form.province ? getRegionsForProvince(form.province).map((r) => r.nom) : []),
    [form.province],
  )
  const formDistricts = useMemo(
    () => (form.region ? getDistrictsForRegion(form.region).map((d) => d.nom) : []),
    [form.region],
  )
  const formCommunes = useMemo(
    () => (form.district ? getCommunesForDistrict(form.district) : []),
    [form.district],
  )

  // Regions for filter toolbar
  const filterRegionsList = useMemo(
    () => (filterProvince ? getRegionsForProvince(filterProvince).map((r) => r.nom) : []),
    [filterProvince],
  )

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await individuApi.list({
        q,
        sexe,
        province: filterProvince,
        region: filterRegion,
      })
      setItems(data)
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setLoading(false)
    }
  }, [q, sexe, filterProvince, filterRegion])

  useEffect(() => {
    let ignore = false
    const fetchItems = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await individuApi.list({
          q,
          sexe,
          province: filterProvince,
          region: filterRegion,
        })
        if (!ignore) setItems(data)
      } catch (err) {
        if (!ignore) setError(getApiError(err))
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    void fetchItems()
    return () => {
      ignore = true
    }
  }, [q, sexe, filterProvince, filterRegion])

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
      photo: item.photo ?? null,
      province: item.province ?? '',
      region: item.region ?? '',
      district: item.district ?? '',
      commune: item.commune ?? '',
      fokontany: item.fokontany ?? '',
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
      photo: form.photo,
      province: form.province.trim() || null,
      region: form.region.trim() || null,
      district: form.district.trim() || null,
      commune: form.commune.trim() || null,
      fokontany: form.fokontany.trim() || null,
    }

    try {
      if (editing) {
        await individuApi.update(editing.id, payload)
        setSuccessMsg(`Chef de famille « ${payload.nom} » mis à jour avec succès.`)
      } else {
        await individuApi.create(payload)
        setSuccessMsg(`Nouveau chef de famille « ${payload.nom} » enregistré avec succès.`)
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

  const remove = async (item: Individu) => {
    setDeleteTarget(item)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await individuApi.remove(deleteTarget.id)
      setSuccessMsg(`« ${deleteTarget.nom} » et les membres rattachés ont été supprimés.`)
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
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span
              className="badge bg-primary bg-opacity-10 text-primary fw-semibold px-2 py-1 rounded"
              style={{ fontSize: '0.75rem' }}
            >
              Registre des Ménages
            </span>
            <span className="text-muted small">Raim(na renim-)-pianakavina</span>
          </div>
          <h1 className="h4 fw-bold text-dark mb-1">Chefs de Famille</h1>
          <p className="text-secondary small mb-0">
            Gestion des déclarants principaux et de leur localisation territoriale
          </p>
        </div>
        <Button variant="success" size="sm" onClick={openCreate}>
          <Icon name="plus" size={16} className="me-1" /> Nouveau chef de famille
        </Button>
      </div>

      {successMsg && <Alert variant="success" className="py-2 small">{successMsg}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Filter bar */}
      <Card className="border-0 shadow-sm bg-white">
        <Card.Body className="p-3">
          <div className="row g-2 align-items-end">
            <div className="col-md-4">
              <Form.Label className="small fw-semibold text-secondary mb-1">Recherche par nom</Form.Label>
              <Form.Control
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Ex : Rakoto, Randria..."
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
            <div className="col-md-3">
              <Form.Label className="small fw-semibold text-secondary mb-1">Province</Form.Label>
              <Form.Select
                value={filterProvince}
                onChange={(e) => {
                  setFilterProvince(e.target.value)
                  setFilterRegion('')
                }}
              >
                <option value="">Toutes les provinces</option>
                {provincesList.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Form.Select>
            </div>
            <div className="col-md-3">
              <Form.Label className="small fw-semibold text-secondary mb-1">Région</Form.Label>
              <Form.Select
                value={filterRegion}
                disabled={!filterProvince}
                onChange={(e) => setFilterRegion(e.target.value)}
              >
                <option value="">Toutes les régions</option>
                {filterRegionsList.map((r) => (
                  <option key={r} value={r}>
                    {r}
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
                <th>Faritra (Région / District)</th>
                <th>Fokontany / Adiresy</th>
                <th>Telefaona</th>
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
                    Aucun chef de famille trouvé pour ces critères.
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
                    <td className="text-secondary small">
                      {item.region ? (
                        <>
                          <div className="fw-medium text-dark">{item.region}</div>
                          <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                            {item.district || item.province}
                          </div>
                        </>
                      ) : (
                        item.province ?? '—'
                      )}
                    </td>
                    <td className="text-secondary small">
                      {item.fokontany ? (
                        <>
                          <div className="text-dark">{item.fokontany}</div>
                          {item.adresse && (
                            <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                              {item.adresse}
                            </div>
                          )}
                        </>
                      ) : (
                        item.adresse ?? '—'
                      )}
                    </td>
                    <td className="text-secondary font-mono small">{item.telephone ?? '—'}</td>
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
                        title="Modifier les informations"
                        aria-label="Modifier"
                      >
                        <Icon name="edit" size={15} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger btn-icon"
                        onClick={() => remove(item)}
                        title="Supprimer ce chef de famille"
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

      {/* Create / Edit Modal */}
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

            <PhotoUpload
              value={form.photo}
              onChange={(photo) => setForm({ ...form, photo })}
              name={editing?.nom ?? 'Nouveau chef de famille'}
            />

            <div className="row g-3">
              <div className="col-12">
                <Form.Label>Anarana sy Fanampiny (Nom & Prénoms) *</Form.Label>
                <Form.Control
                  value={form.nom}
                  required
                  minLength={2}
                  placeholder="Ex : RAKOTOMENA Christian"
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
                  placeholder="Ex : 45"
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

              <div className="col-12">
                <Form.Label>Asa (Profession)</Form.Label>
                <Form.Control
                  value={form.profession}
                  placeholder="Ex : Chauffeur, Enseignant, Agriculteur..."
                  onChange={(e) => setForm({ ...form, profession: e.target.value })}
                />
              </div>

              {/* Geographic selection section */}
              <div className="col-12 pt-2 border-top">
                <div className="fw-semibold small text-primary mb-2 d-flex align-items-center gap-1">
                  <Icon name="map-pin" size={14} />
                  <span>Localisation Territoriale (Madagascar)</span>
                </div>
              </div>

              <div className="col-6">
                <Form.Label>Faritany (Province)</Form.Label>
                <Form.Select
                  value={form.province}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      province: e.target.value,
                      region: '',
                      district: '',
                      commune: '',
                    })
                  }
                >
                  <option value="">— Choisir —</option>
                  {provincesList.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </Form.Select>
              </div>

              <div className="col-6">
                <Form.Label>Faritra (Région)</Form.Label>
                <Form.Select
                  value={form.region}
                  disabled={!form.province}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      region: e.target.value,
                      district: '',
                      commune: '',
                    })
                  }
                >
                  <option value="">— Choisir —</option>
                  {formRegions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </Form.Select>
              </div>

              <div className="col-6">
                <Form.Label>Distrika (District)</Form.Label>
                <Form.Select
                  value={form.district}
                  disabled={!form.region}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      district: e.target.value,
                      commune: '',
                    })
                  }
                >
                  <option value="">— Choisir —</option>
                  {formDistricts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </Form.Select>
              </div>

              <div className="col-6">
                <Form.Label>Kaominina (Commune)</Form.Label>
                {formCommunes.length > 0 ? (
                  <Form.Select
                    value={form.commune}
                    onChange={(e) => setForm({ ...form, commune: e.target.value })}
                  >
                    <option value="">— Choisir —</option>
                    {formCommunes.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Form.Select>
                ) : (
                  <Form.Control
                    value={form.commune}
                    placeholder="Commune..."
                    onChange={(e) => setForm({ ...form, commune: e.target.value })}
                  />
                )}
              </div>

              <div className="col-6">
                <Form.Label>Fokontany</Form.Label>
                <Form.Control
                  value={form.fokontany}
                  placeholder="Ex : Mahamasina-Sud..."
                  onChange={(e) => setForm({ ...form, fokontany: e.target.value })}
                />
              </div>

              <div className="col-6">
                <Form.Label>Telefaona</Form.Label>
                <Form.Control
                  value={form.telephone}
                  placeholder="Ex : 034 00 000 01"
                  onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                />
              </div>

              <div className="col-12">
                <Form.Label>Adiresy feno (Adresse précise)</Form.Label>
                <Form.Control
                  value={form.adresse}
                  placeholder="Ex : Lot VF 55 Mahamasina"
                  onChange={(e) => setForm({ ...form, adresse: e.target.value })}
                />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShow(false)} disabled={saving}>
              Annuler
            </Button>
            <Button type="submit" variant="success" disabled={saving}>
              {saving ? <Spinner size="sm" animation="border" /> : editing ? 'Mettre à jour' : 'Enregistrer'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        show={deleteTarget !== null}
        name={deleteTarget?.nom ?? ''}
        message={`Supprimer « ${deleteTarget?.nom} » et tous les membres de son foyer ?`}
        deleting={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
