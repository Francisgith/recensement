import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Alert, Badge, Button, Card, Form, Modal, Spinner, Table } from '../components/ui'
import { getApiError } from '../api/client'
import { userApi } from '../api/resources'
import type { User, UserPayload } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import Icon from '../components/Icon'
import DeleteConfirmModal from '../components/DeleteConfirmModal'

interface FormState {
  email: string
  nom: string
  role: 'ROLE_ADMIN' | 'ROLE_AGENT'
  password: string
  actif: boolean
}

const emptyForm: FormState = { email: '', nom: '', role: 'ROLE_AGENT', password: '', actif: true }

export default function UsersPage() {
  const { user: current } = useAuth()
  const [items, setItems] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const [show, setShow] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setItems(await userApi.list())
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let ignore = false
    const fetchUsers = async () => {
      setLoading(true)
      setError('')
      try {
        const users = await userApi.list()
        if (!ignore) setItems(users)
      } catch (err) {
        if (!ignore) setError(getApiError(err))
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    void fetchUsers()
    return () => {
      ignore = true
    }
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setFormError('')
    setShow(true)
  }

  const openEdit = (item: User) => {
    setEditing(item)
    setForm({
      email: item.email,
      nom: item.nom,
      role: item.roles.includes('ROLE_ADMIN') ? 'ROLE_ADMIN' : 'ROLE_AGENT',
      password: '',
      actif: item.actif,
    })
    setFormError('')
    setShow(true)
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setFormError('')
    const payload: UserPayload = {
      email: form.email.trim(),
      nom: form.nom.trim(),
      roles: [form.role],
      actif: form.actif,
      ...(form.password ? { password: form.password } : {}),
    }
    try {
      if (editing) {
        await userApi.update(editing.id, payload)
        setSuccessMsg(`Utilisateur « ${payload.nom} » mis à jour avec succès.`)
      } else {
        await userApi.create(payload)
        setSuccessMsg(`Nouvel utilisateur « ${payload.nom} » créé avec succès.`)
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

  const remove = async (item: User) => {
    setDeleteTarget(item)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await userApi.remove(deleteTarget.id)
      setSuccessMsg(`L'utilisateur « ${deleteTarget.nom} » a été supprimé.`)
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
              className="badge bg-dark bg-opacity-10 text-dark fw-semibold px-2 py-1 rounded"
              style={{ fontSize: '0.75rem' }}
            >
              Administration Système
            </span>
            <span className="text-muted small">Comptes d'accès & permissions</span>
          </div>
          <h1 className="h4 fw-bold text-dark mb-1">Gestion des Utilisateurs</h1>
          <p className="text-secondary small mb-0">
            Administrateurs et agents de terrain habilités pour le recensement
          </p>
        </div>
        <Button variant="success" size="sm" onClick={openCreate}>
          <Icon name="plus" size={16} className="me-1" /> Nouvel utilisateur
        </Button>
      </div>

      {successMsg && <Alert variant="success" className="py-2 small">{successMsg}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="border-0 shadow-sm bg-white">
        <div className="table-responsive">
          <Table hover className="align-middle mb-0 table-hover-soft">
            <thead className="table-light">
              <tr>
                <th>Nom &amp; Prénoms</th>
                <th>Adresse e-mail</th>
                <th>Rôle</th>
                <th>Statut</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-4">
                    <Spinner animation="border" size="sm" />
                    <span className="ms-2 text-muted small">Chargement...</span>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id}>
                    <td className="fw-semibold text-dark">
                      {item.nom}
                      {item.id === current?.id && (
                        <span className="badge bg-primary bg-opacity-10 text-primary ms-2" style={{ fontSize: '0.7rem' }}>
                          Vous
                        </span>
                      )}
                    </td>
                    <td className="font-mono text-secondary small">{item.email}</td>
                    <td>
                      <Badge bg={item.roles.includes('ROLE_ADMIN') ? 'dark' : 'secondary'}>
                        {item.roles.includes('ROLE_ADMIN') ? 'Administrateur' : 'Agent de terrain'}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={item.actif ? 'success' : 'danger'}>
                        {item.actif ? 'Actif' : 'Désactivé'}
                      </Badge>
                    </td>
                    <td className="text-end text-nowrap">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary btn-icon me-1"
                        onClick={() => openEdit(item)}
                        title="Modifier le compte"
                        aria-label="Modifier"
                      >
                        <Icon name="edit" size={15} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger btn-icon"
                        disabled={item.id === current?.id}
                        onClick={() => remove(item)}
                        title={item.id === current?.id ? 'Impossible de supprimer votre propre compte' : 'Supprimer le compte'}
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
              {editing ? 'Modifier l’utilisateur' : 'Nouvel utilisateur'}
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
                <Form.Label>Nom &amp; Prénoms *</Form.Label>
                <Form.Control
                  value={form.nom}
                  required
                  placeholder="Ex : Rakoto Jean"
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                />
              </div>
              <div className="col-12">
                <Form.Label>Adresse e-mail *</Form.Label>
                <Form.Control
                  type="email"
                  value={form.email}
                  required
                  placeholder="agent@recensement.mg"
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="col-6">
                <Form.Label>Rôle *</Form.Label>
                <Form.Select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as FormState['role'] })}
                >
                  <option value="ROLE_AGENT">Agent de terrain</option>
                  <option value="ROLE_ADMIN">Administrateur</option>
                </Form.Select>
              </div>
              <div className="col-6 d-flex align-items-end">
                <Form.Check
                  type="switch"
                  id="actif-switch"
                  label="Compte actif"
                  checked={form.actif}
                  onChange={(e) => setForm({ ...form, actif: e.target.checked })}
                />
              </div>
              <div className="col-12">
                <Form.Label>
                  Mot de passe {editing ? '(laisser vide pour conserver l’actuel)' : '*'}
                </Form.Label>
                <Form.Control
                  type="password"
                  value={form.password}
                  required={!editing}
                  minLength={8}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
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

      {/* Delete modal */}
      <DeleteConfirmModal
        show={deleteTarget !== null}
        name={deleteTarget?.nom ?? ''}
        message={`Supprimer l'utilisateur « ${deleteTarget?.nom} » ?`}
        deleting={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
