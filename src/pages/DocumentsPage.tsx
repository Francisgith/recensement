import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { individuApi, membreApi } from '../api/resources'
import type { Individu, MembreFamille } from '../api/types'
import { Alert, Button, Card, Col, Form, Row, Spinner } from '../components/ui'
import Icon from '../components/Icon'
import BackButton from '../components/BackButton'

type DocumentType = 'residence' | 'cin' | 'naissance'

interface CitizenOption {
  id: string
  nom: string
  age: number
  sexe: 'LAHY' | 'VAVY'
  profession: string | null
  adresse: string | null
  telephone: string | null
  photo: string | null
  province: string | null
  region: string | null
  district: string | null
  commune: string | null
  fokontany: string | null
  source: 'Chef de famille' | 'Membre'
  chefNom?: string
}

const CURRENT_YEAR = new Date().getFullYear()

export default function DocumentsPage() {
  const [searchParams] = useSearchParams()
  const initialType = searchParams.get('type') as DocumentType | null
  const [docType, setDocType] = useState<DocumentType>(
    initialType && ['residence', 'cin', 'naissance'].includes(initialType) ? initialType : 'residence',
  )
  const [citizens, setCitizens] = useState<CitizenOption[]>([])
  const [loading, setLoading] = useState(true)

  // Document Fields
  const [selectedCitizenId, setSelectedCitizenId] = useState<string>('')
  const [nom, setNom] = useState('RAKOTOMENA Christian Eugene')
  const [age, setAge] = useState('50')
  const [sexe, setSexe] = useState<'LAHY' | 'VAVY'>('LAHY')
  const [profession, setProfession] = useState('Chauffeur')
  const [province, setProvince] = useState('Antananarivo')
  const [region, setRegion] = useState('Analamanga')
  const [district, setDistrict] = useState('Antananarivo Renivohitra')
  const [commune, setCommune] = useState('4ème Arrondissement')
  const [fokontany, setFokontany] = useState('Mahamasina-Sud')
  const [adresse, setAdresse] = useState('Lot VF 55 Mahamasina')
  const [photo, setPhoto] = useState<string | null>(null)

  // Document-specific metadata
  const [numeroDoc, setNumeroDoc] = useState('CR-2026/0482')
  const [dateDelivrance, setDateDelivrance] = useState('2026-10-14')
  const [nomSignataire, setNomSignataire] = useState('RAZAFINDRABE Andry (Président du Fokontany)')
  const [motif, setMotif] = useState('Démarches administratives et bancaires')
  const [cinNumero, setCinNumero] = useState('101 221 045 892')
  const [cinLieuDelivrance, setCinLieuDelivrance] = useState('Antananarivo Renivohitra')
  const [pereNom, setPereNom] = useState('RAKOTOMENA Jean-Baptiste')
  const [mereNom, setMereNom] = useState('RAZANABOLOLONA Marie')
  const [lieuNaissance, setLieuNaissance] = useState('Maternité Befelatanana, Antananarivo')

  const applyCitizen = useCallback((c: CitizenOption) => {
    setSelectedCitizenId(c.id)
    setNom(c.nom)
    setAge(String(c.age))
    setSexe(c.sexe)
    setProfession(c.profession || 'Sans profession')
    setProvince(c.province || 'Antananarivo')
    setRegion(c.region || 'Analamanga')
    setDistrict(c.district || 'Antananarivo Renivohitra')
    setCommune(c.commune || 'Antananarivo')
    setFokontany(c.fokontany || 'Centre')
    setAdresse(c.adresse || 'Lot...')
    setPhoto(c.photo)

    // Generate random realistic numbers
    const randomNum = Math.floor(1000 + Math.random() * 9000)
    setNumeroDoc(`ACT-${new Date().getFullYear()}/${randomNum}`)
    setCinNumero(`101 ${Math.floor(100 + Math.random() * 900)} ${Math.floor(100 + Math.random() * 900)} ${Math.floor(100 + Math.random() * 900)}`)
  }, [])

  // Load citizens
  useEffect(() => {
    async function load() {
      try {
        const [inds, mems] = await Promise.all([individuApi.list(), membreApi.list()])
        const options: CitizenOption[] = [
          ...inds.map((i: Individu) => ({
            id: i.id,
            nom: i.nom,
            age: i.age,
            sexe: i.sexe,
            profession: i.profession,
            adresse: i.adresse,
            telephone: i.telephone,
            photo: i.photo,
            province: i.province ?? 'Antananarivo',
            region: i.region ?? 'Analamanga',
            district: i.district ?? 'Antananarivo Renivohitra',
            commune: i.commune ?? '4ème Arrondissement',
            fokontany: i.fokontany ?? 'Mahamasina-Sud',
            source: 'Chef de famille' as const,
          })),
          ...mems.map((m: MembreFamille) => ({
            id: m.id,
            nom: m.nom,
            age: m.age,
            sexe: m.sexe,
            profession: m.profession,
            adresse: m.chef?.nom ? `Foyer de ${m.chef.nom}` : null,
            telephone: null,
            photo: m.photo,
            province: m.province ?? m.chef?.province ?? 'Antananarivo',
            region: m.region ?? m.chef?.region ?? 'Analamanga',
            district: m.district ?? m.chef?.district ?? 'Antananarivo Renivohitra',
            commune: m.commune ?? m.chef?.commune ?? '4ème Arrondissement',
            fokontany: m.fokontany ?? 'Mahamasina-Sud',
            source: 'Membre' as const,
            chefNom: m.chef?.nom,
          })),
        ]
        setCitizens(options)

        const queryCitizenId = searchParams.get('citizenId')
        if (queryCitizenId) {
          const match = options.find((c) => c.id === queryCitizenId)
          if (match) {
            applyCitizen(match)
            return
          }
        }
        if (options.length > 0) {
          applyCitizen(options[0])
        }
      } catch (e) {
        console.error('Failed to load citizens', e)
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [searchParams, applyCitizen])

  const handleCitizenSelect = (id: string) => {
    const found = citizens.find((c) => c.id === id)
    if (found) applyCitizen(found)
  }

  const documentRef = useRef<HTMLDivElement>(null)
  const [exportingPdf, setExportingPdf] = useState(false)
  const [exportSuccessMsg, setExportSuccessMsg] = useState('')
  const [exportErrorMsg, setExportErrorMsg] = useState('')

  // RELIABLE PRINT HANDLER (Works inside iframes & standard browsers)
  const handlePrint = () => {
    try {
      if (!documentRef.current) {
        window.print()
        return
      }

      // Try creating an isolated hidden print iframe for pristine A4 formatting
      let printFrame = document.getElementById('official-doc-print-frame') as HTMLIFrameElement | null
      if (!printFrame) {
        printFrame = document.createElement('iframe')
        printFrame.id = 'official-doc-print-frame'
        printFrame.style.position = 'fixed'
        printFrame.style.right = '0'
        printFrame.style.bottom = '0'
        printFrame.style.width = '0'
        printFrame.style.height = '0'
        printFrame.style.border = '0'
        document.body.appendChild(printFrame)
      }

      const frameDoc = printFrame.contentDocument || printFrame.contentWindow?.document
      if (frameDoc) {
        frameDoc.open()
        frameDoc.write(`
          <!DOCTYPE html>
          <html lang="mg">
            <head>
              <meta charset="utf-8">
              <title>${docType.toUpperCase()} - ${nom}</title>
              <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
              <style>
                @page {
                  size: ${docType === 'cin' ? 'A5 landscape' : 'A4 portrait'};
                  margin: 10mm;
                }
                body {
                  background-color: #ffffff !important;
                  color: #0f172a !important;
                  margin: 0;
                  padding: 15px;
                  font-family: serif;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                .print-area {
                  max-width: 100% !important;
                  width: 100% !important;
                  box-shadow: none !important;
                  border: none !important;
                  margin: 0 auto;
                }
              </style>
            </head>
            <body>
              ${documentRef.current.innerHTML}
            </body>
          </html>
        `)
        frameDoc.close()
        setTimeout(() => {
          printFrame?.contentWindow?.focus()
          printFrame?.contentWindow?.print()
        }, 400)
      } else {
        window.print()
      }
    } catch (e) {
      console.warn('Iframe print fallback triggered standard window.print:', e)
      window.print()
    }
  }

  // DIRECT PDF EXPORT HANDLER (Generates and downloads true .pdf file)
  const handleExportPDF = async () => {
    if (!documentRef.current) return
    setExportingPdf(true)
    setExportErrorMsg('')
    try {
      const element = documentRef.current
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      })

      const imgData = canvas.toDataURL('image/jpeg', 0.98)
      const cleanNom = (nom || 'Citoyen').replace(/[^a-zA-Z0-9]/g, '_')

      if (docType === 'cin') {
        // Landscape card layout for CIN
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a5',
        })
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = pdf.internal.pageSize.getHeight()
        const imgProps = pdf.getImageProperties(imgData)
        const ratio = Math.min((pdfWidth - 20) / imgProps.width, (pdfHeight - 20) / imgProps.height)
        const renderW = imgProps.width * ratio
        const renderH = imgProps.height * ratio
        const posX = (pdfWidth - renderW) / 2
        const posY = (pdfHeight - renderH) / 2
        pdf.addImage(imgData, 'JPEG', posX, posY, renderW, renderH)
        pdf.save(`CIN_${cleanNom}.pdf`)
      } else {
        // Portrait A4 layout for Certificat de Residence and Acte de Naissance
        const pdf = new jsPDF('p', 'mm', 'a4')
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = pdf.internal.pageSize.getHeight()
        const imgProps = pdf.getImageProperties(imgData)
        const ratio = Math.min((pdfWidth - 20) / imgProps.width, (pdfHeight - 20) / imgProps.height)
        const renderW = imgProps.width * ratio
        const renderH = imgProps.height * ratio
        const posX = (pdfWidth - renderW) / 2
        const posY = 10
        pdf.addImage(imgData, 'JPEG', posX, posY, renderW, renderH)
        const docPrefix = docType === 'residence' ? 'Certificat_Residence' : 'Acte_Naissance'
        pdf.save(`${docPrefix}_${cleanNom}.pdf`)
      }

      setExportSuccessMsg('Document officiel téléchargé en format PDF avec succès !')
      setTimeout(() => setExportSuccessMsg(''), 5000)
    } catch (err) {
      console.error('Failed to export PDF:', err)
      setExportErrorMsg('Erreur lors de la génération du PDF. Tentative via impression...')
      setTimeout(() => handlePrint(), 800)
    } finally {
      setExportingPdf(false)
    }
  }

  // Calculate simulated birth year
  const birthYear = CURRENT_YEAR - Number(age || 20)

  return (
    <div className="d-flex flex-column gap-4">
      {/* Page Header (No Print) */}
      <div className="no-print d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div className="d-flex align-items-center gap-3">
          <BackButton />
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span
                className="badge bg-primary bg-opacity-10 text-primary fw-semibold px-2 py-1 rounded"
                style={{ fontSize: '0.75rem' }}
              >
                Fanamasinam-panjakana
              </span>
              <span className="text-muted small">État Civil &amp; Actes d'Identification</span>
            </div>
            <h1 className="h4 fw-bold text-dark mb-1">Génération de Documents Officiels</h1>
            <p className="text-secondary small mb-0">
              Établissement instantané de Certificat de Résidence, Carte d'Identité (CIN) et Copie d'Acte de Naissance
            </p>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={handleExportPDF}
            disabled={exportingPdf}
            className="d-flex align-items-center gap-1.5 shadow-sm"
          >
            {exportingPdf ? (
              <>
                <Spinner size="sm" className="me-1" />
                <span>Génération PDF...</span>
              </>
            ) : (
              <>
                <Icon name="download" size={15} />
                <span>Télécharger PDF</span>
              </>
            )}
          </Button>

          <Button
            variant="outline-secondary"
            size="sm"
            onClick={handlePrint}
            className="d-flex align-items-center gap-1.5"
          >
            <Icon name="printer" size={15} />
            <span>Imprimer</span>
          </Button>
        </div>
      </div>

      {exportSuccessMsg && (
        <Alert variant="success" className="no-print py-2 d-flex align-items-center gap-2 shadow-xs">
          <Icon name="check" size={16} />
          <span>{exportSuccessMsg}</span>
        </Alert>
      )}

      {exportErrorMsg && (
        <Alert variant="warning" className="no-print py-2 d-flex align-items-center gap-2 shadow-xs">
          <Icon name="info" size={16} />
          <span>{exportErrorMsg}</span>
        </Alert>
      )}

      {/* Configuration & Selection Panel (No Print) */}
      <Card className="no-print border-0 shadow-sm bg-white">
        <Card.Body className="p-3 p-md-4">
          <Row className="g-3 align-items-end">
            {/* Document type switch */}
            <Col lg={4}>
              <Form.Label className="small fw-semibold text-secondary mb-1">
                Type d'acte ou document à générer
              </Form.Label>
              <div className="d-flex gap-1 p-1 bg-light rounded-3 border">
                <button
                  type="button"
                  onClick={() => setDocType('residence')}
                  className={`btn btn-sm flex-fill border-0 ${
                    docType === 'residence'
                      ? 'bg-primary text-white shadow-sm fw-semibold'
                      : 'text-secondary'
                  }`}
                  style={{ fontSize: '0.78rem' }}
                >
                  Certificat de Résidence
                </button>
                <button
                  type="button"
                  onClick={() => setDocType('cin')}
                  className={`btn btn-sm flex-fill border-0 ${
                    docType === 'cin'
                      ? 'bg-primary text-white shadow-sm fw-semibold'
                      : 'text-secondary'
                  }`}
                  style={{ fontSize: '0.78rem' }}
                >
                  Carte CIN
                </button>
                <button
                  type="button"
                  onClick={() => setDocType('naissance')}
                  className={`btn btn-sm flex-fill border-0 ${
                    docType === 'naissance'
                      ? 'bg-primary text-white shadow-sm fw-semibold'
                      : 'text-secondary'
                  }`}
                  style={{ fontSize: '0.78rem' }}
                >
                  Acte de Naissance
                </button>
              </div>
            </Col>

            {/* Select Citizen Dropdown */}
            <Col lg={4}>
              <Form.Label className="small fw-semibold text-secondary mb-1">
                Sélectionner un citoyen recensé (auto-remplissage)
              </Form.Label>
              <select
                className="form-select form-select-sm"
                value={selectedCitizenId}
                onChange={(e) => handleCitizenSelect(e.target.value)}
                disabled={loading}
              >
                {loading ? (
                  <option>Chargement des résidents...</option>
                ) : (
                  citizens.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nom} ({c.source} · {c.age} ans · {c.region})
                    </option>
                  ))
                )}
              </select>
            </Col>

            {/* Date de délivrance */}
            <Col sm={6} lg={2}>
              <Form.Label className="small fw-semibold text-secondary mb-1">Date d'émission</Form.Label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={dateDelivrance}
                onChange={(e) => setDateDelivrance(e.target.value)}
              />
            </Col>

            {/* Numéro officiel */}
            <Col sm={6} lg={2}>
              <Form.Label className="small fw-semibold text-secondary mb-1">N° de Référence</Form.Label>
              <input
                type="text"
                className="form-control form-control-sm font-mono"
                value={numeroDoc}
                onChange={(e) => setNumeroDoc(e.target.value)}
              />
            </Col>
          </Row>

          {/* Collapsible custom fields */}
          <div className="mt-3 pt-3 border-top">
            <div className="row g-2">
              <div className="col-md-3">
                <Form.Label className="small text-muted mb-0" style={{ fontSize: '0.72rem' }}>
                  Nom complet
                </Form.Label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <Form.Label className="small text-muted mb-0" style={{ fontSize: '0.72rem' }}>
                  Profession
                </Form.Label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <Form.Label className="small text-muted mb-0" style={{ fontSize: '0.72rem' }}>
                  Fokontany / Adresse
                </Form.Label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={fokontany}
                  onChange={(e) => setFokontany(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <Form.Label className="small text-muted mb-0" style={{ fontSize: '0.72rem' }}>
                  Autorité signataire
                </Form.Label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={nomSignataire}
                  onChange={(e) => setNomSignataire(e.target.value)}
                />
              </div>

              {/* Conditional document-specific fields */}
              {docType === 'residence' && (
                <div className="col-12 mt-2">
                  <Form.Label className="small text-muted mb-0" style={{ fontSize: '0.72rem' }}>
                    Motif de délivrance du certificat
                  </Form.Label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={motif}
                    onChange={(e) => setMotif(e.target.value)}
                    placeholder="Ex : Démarches administratives, inscription scolaire, compte bancaire..."
                  />
                </div>
              )}

              {(docType === 'cin' || docType === 'naissance') && (
                <>
                  <div className="col-md-4 mt-2">
                    <Form.Label className="small text-muted mb-0" style={{ fontSize: '0.72rem' }}>
                      Nom du Père (Ray)
                    </Form.Label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={pereNom}
                      onChange={(e) => setPereNom(e.target.value)}
                    />
                  </div>
                  <div className="col-md-4 mt-2">
                    <Form.Label className="small text-muted mb-0" style={{ fontSize: '0.72rem' }}>
                      Nom de la Mère (Reny)
                    </Form.Label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={mereNom}
                      onChange={(e) => setMereNom(e.target.value)}
                    />
                  </div>
                  <div className="col-md-4 mt-2">
                    <Form.Label className="small text-muted mb-0" style={{ fontSize: '0.72rem' }}>
                      {docType === 'cin' ? 'Lieu de délivrance CIN' : 'Lieu de naissance'}
                    </Form.Label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={docType === 'cin' ? cinLieuDelivrance : lieuNaissance}
                      onChange={(e) =>
                        docType === 'cin'
                          ? setCinLieuDelivrance(e.target.value)
                          : setLieuNaissance(e.target.value)
                      }
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* DOCUMENT PREVIEW CONTAINER (Ready for Print & PDF Export) */}
      <div ref={documentRef} id="document-print-target" className="d-flex justify-content-center">
        {/* DOCUMENT 1: CERTIFICAT DE RÉSIDENCE */}
        {docType === 'residence' && (
          <div
            className="print-area bg-white shadow-sm border p-4 p-md-5 position-relative"
            style={{
              maxWidth: '800px',
              width: '100%',
              minHeight: '1050px',
              fontFamily: 'serif',
              color: '#0f172a',
              borderRadius: '0.5rem',
            }}
          >
            {/* Watermark / Seal background */}
            <div
              className="position-absolute top-50 start-50 translate-middle pointer-events-none opacity-5"
              style={{ zIndex: 0, width: 340, height: 340, opacity: 0.04 }}
            >
              <svg viewBox="0 0 100 100" fill="currentColor">
                <circle cx="50" cy="50" r="45" stroke="black" strokeWidth="2" fill="none" />
                <path d="M50 15 L50 85 M15 50 L85 50" stroke="black" strokeWidth="1" />
                <text x="50" y="55" fontSize="12" textAnchor="middle" fontWeight="bold">MADAGASIKARA</text>
              </svg>
            </div>

            {/* Official Header */}
            <div className="text-center pb-3 border-bottom border-2 border-dark position-relative" style={{ zIndex: 1 }}>
              <div className="fw-bold tracking-wider mb-1" style={{ fontSize: '0.95rem', letterSpacing: '0.15em' }}>
                REPOBLIKAN'I MADAGASIKARA
              </div>
              <div className="fst-italic text-secondary small mb-2" style={{ fontSize: '0.78rem' }}>
                Fitiavana — Tanindrazana — Fandrosoana
              </div>
              <div className="d-flex justify-content-center my-2">
                <div style={{ width: 80, height: 2, backgroundColor: '#dc2626' }} />
                <div style={{ width: 80, height: 2, backgroundColor: '#16a34a' }} />
              </div>
              <div className="row text-center text-muted small mt-2" style={{ fontSize: '0.78rem', fontFamily: 'sans-serif' }}>
                <div className="col-4">
                  <div>FARITANY : <strong>{province.toUpperCase()}</strong></div>
                  <div>FARITRA : <strong>{region.toUpperCase()}</strong></div>
                </div>
                <div className="col-4">
                  <div>DISTRIKA : <strong>{district.toUpperCase()}</strong></div>
                  <div>KAOMININA : <strong>{commune.toUpperCase()}</strong></div>
                </div>
                <div className="col-4">
                  <div>FOKONTANY : <strong>{fokontany.toUpperCase()}</strong></div>
                  <div>RÉF : <span className="font-mono"><strong>{numeroDoc}</strong></span></div>
                </div>
              </div>
            </div>

            {/* Document Title */}
            <div className="text-center my-4 position-relative" style={{ zIndex: 1 }}>
              <h2
                className="fw-bold text-uppercase mb-1"
                style={{
                  fontSize: '1.45rem',
                  letterSpacing: '0.08em',
                  textDecoration: 'underline',
                  textUnderlineOffset: '6px',
                }}
              >
                FANAMARINAM-PONENANA
              </h2>
              <div className="fw-bold text-muted small text-uppercase" style={{ letterSpacing: '0.05em' }}>
                CERTIFICAT DE RÉSIDENCE ET DE DOMICILE
              </div>
            </div>

            {/* Content Body */}
            <div className="position-relative" style={{ zIndex: 1, fontSize: '1rem', lineHeight: 1.8 }}>
              <p className="text-justify mb-4" style={{ textIndent: '2rem' }}>
                Ny Filohan'ny Fokontany eto <strong>{fokontany}</strong>, Kaominina <strong>{commune}</strong>,
                Distrikan'ny <strong>{district}</strong>, dia manamarina sy manambara amin'izao soratra izao fa :
              </p>

              {/* Citizen Card layout */}
              <div className="p-3 border border-dark rounded mb-4 bg-light bg-opacity-25 d-flex gap-4 align-items-center">
                {/* Photo box */}
                <div
                  className="border border-dark d-flex align-items-center justify-content-center bg-white flex-shrink-0"
                  style={{ width: 110, height: 130, overflow: 'hidden' }}
                >
                  {photo ? (
                    <img src={photo} alt={nom} className="w-100 h-100" style={{ objectFit: 'cover' }} />
                  ) : (
                    <div className="text-center p-2 text-muted small" style={{ fontSize: '0.7rem' }}>
                      <Icon name="user" size={32} className="opacity-50 mb-1" />
                      <div>Sary (Photo)</div>
                    </div>
                  )}
                </div>

                {/* Information table */}
                <div className="flex-grow-1" style={{ fontSize: '0.92rem' }}>
                  <div className="row g-2">
                    <div className="col-12">
                      <span className="text-muted">Anarana sy Fanampiny (Nom &amp; Prénoms) :</span>{' '}
                      <strong className="text-dark fs-6">{nom}</strong>
                    </div>
                    <div className="col-6">
                      <span className="text-muted">Taona (Âge) :</span>{' '}
                      <strong>{age} ans</strong> ({birthYear})
                    </div>
                    <div className="col-6">
                      <span className="text-muted">Sokajy (Sexe) :</span>{' '}
                      <strong>{sexe === 'LAHY' ? 'Lahy (Masculin)' : 'Vavy (Féminin)'}</strong>
                    </div>
                    <div className="col-12">
                      <span className="text-muted">Asa aman-draharaha (Profession) :</span>{' '}
                      <strong>{profession}</strong>
                    </div>
                    <div className="col-12">
                      <span className="text-muted">Adiresy (Adresse précise) :</span>{' '}
                      <strong>{adresse}, Fokontany {fokontany}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-justify mb-4" style={{ textIndent: '2rem' }}>
                Dia olona mipetraka sy monina ara-dalàna eto amin'ny Fokontany voalaza etsy ambony
                ka efa voasoratra ao amin'ny bokin'ny mponina (Registre de Recensement de la Population).
              </p>

              <p className="text-justify mb-4" style={{ textIndent: '2rem' }}>
                Nomena ity taratasy ity mba hampiasaina amin'ny antony : <strong>{motif}</strong>,
                ary manan-kery mandritra ny telo (03) volana manomboka androany.
              </p>

              {/* Signatures & Seal Block */}
              <div className="mt-5 pt-3">
                <div className="d-flex justify-content-between align-items-end">
                  <div className="text-center" style={{ width: 220 }}>
                    <div className="small text-muted mb-2 font-sans" style={{ fontSize: '0.78rem' }}>
                      Karakara sy sonian'ny Tompon-draharaha
                    </div>
                    <div
                      className="border border-dashed border-secondary rounded p-3 text-muted small"
                      style={{ height: 90 }}
                    >
                      <span style={{ fontSize: '0.72rem' }}>Sonian'ny voakasika</span>
                    </div>
                  </div>

                  {/* Cachet rond officiel */}
                  <div className="text-center" style={{ width: 140 }}>
                    <div
                      className="rounded-circle border border-2 border-danger d-flex flex-column align-items-center justify-content-center text-danger p-2 mx-auto"
                      style={{
                        width: 105,
                        height: 105,
                        transform: 'rotate(-12deg)',
                        boxShadow: 'inset 0 0 0 2px rgba(220, 38, 38, 0.2)',
                      }}
                    >
                      <div className="fw-bold" style={{ fontSize: '0.58rem', letterSpacing: '0.04em' }}>
                        FOKONTANY {fokontany.slice(0, 10).toUpperCase()}
                      </div>
                      <div className="my-1">
                        <Icon name="award" size={18} />
                      </div>
                      <div className="fw-bold" style={{ fontSize: '0.55rem' }}>
                        MADAGASIKARA
                      </div>
                    </div>
                    <div className="text-muted mt-1" style={{ fontSize: '0.68rem' }}>Sombin-kase (Cachet)</div>
                  </div>

                  <div className="text-center" style={{ width: 260 }}>
                    <div className="small mb-1">
                      Natao teto <strong>{district}</strong>,
                    </div>
                    <div className="small mb-2 font-mono">
                      Androany faha-<strong>{dateDelivrance}</strong>
                    </div>
                    <div className="fw-bold text-dark small mb-4">
                      Ny Filohan'ny Fokontany
                    </div>
                    <div className="fw-semibold text-primary pt-3" style={{ fontSize: '0.85rem' }}>
                      {nomSignataire}
                    </div>
                  </div>
                </div>
              </div>

              {/* Barcode footer */}
              <div className="mt-5 pt-3 border-top text-muted small d-flex justify-content-between align-items-center font-sans" style={{ fontSize: '0.7rem' }}>
                <span>ID Numérique : REC-MG-{birthYear}-{selectedCitizenId.slice(0, 8).toUpperCase()}</span>
                <span className="font-mono">|||| | ||||| || |||||| | ||| |||||||</span>
                <span>Fanamarinam-panjakana ara-dalàna</span>
              </div>
            </div>
          </div>
        )}

        {/* DOCUMENT 2: CARTE NATIONALE D'IDENTITÉ (CIN) */}
        {docType === 'cin' && (
          <div className="print-area d-flex flex-column gap-4 align-items-center w-100">
            {/* CIN RECTO */}
            <div
              className="bg-white border rounded-3 p-4 position-relative shadow-sm"
              style={{
                maxWidth: '620px',
                width: '100%',
                minHeight: '360px',
                background: 'linear-gradient(135deg, #fdfbf7 0%, #f4ede4 100%)',
                border: '2px solid #94a3b8',
                borderRadius: '1rem',
                color: '#0f172a',
                fontFamily: 'sans-serif',
              }}
            >
              {/* Card Header */}
              <div className="d-flex justify-content-between align-items-start border-bottom pb-2 mb-3">
                <div className="d-flex align-items-center gap-2">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center text-white"
                    style={{ width: 36, height: 36, backgroundColor: '#059669' }}
                  >
                    <Icon name="building" size={20} />
                  </div>
                  <div>
                    <div className="fw-bold tracking-wider" style={{ fontSize: '0.85rem' }}>
                      REPOBLIKAN'I MADAGASIKARA
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.65rem' }}>
                      Fitiavana - Tanindrazana - Fandrosoana
                    </div>
                  </div>
                </div>

                <div className="text-end">
                  <div className="fw-bold text-primary" style={{ fontSize: '0.95rem', letterSpacing: '0.04em' }}>
                    CARTE NATIONALE D'IDENTITÉ
                  </div>
                  <div className="text-muted fw-semibold" style={{ fontSize: '0.68rem' }}>
                    KARATRA FAMARITANA NY MAHA-OLOM-PIRENENA
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="row g-3 align-items-center">
                {/* Photo & Fingerprint */}
                <div className="col-4 d-flex flex-column align-items-center">
                  <div
                    className="border border-dark rounded overflow-hidden bg-white mb-2 shadow-sm"
                    style={{ width: 110, height: 135 }}
                  >
                    {photo ? (
                      <img src={photo} alt={nom} className="w-100 h-100" style={{ objectFit: 'cover' }} />
                    ) : (
                      <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
                        <Icon name="user" size={40} className="opacity-50" />
                        <span style={{ fontSize: '0.6rem' }}>Photo d'identité</span>
                      </div>
                    )}
                  </div>
                  <div className="text-center font-mono fw-bold text-danger" style={{ fontSize: '0.72rem' }}>
                    N° {cinNumero}
                  </div>
                </div>

                {/* Details */}
                <div className="col-8">
                  <div className="d-flex flex-column gap-1" style={{ fontSize: '0.82rem' }}>
                    <div>
                      <span className="text-muted small">Anarana (Nom) :</span>
                      <div className="fw-bold text-dark fs-6">{nom}</div>
                    </div>
                    <div className="row g-1">
                      <div className="col-6">
                        <span className="text-muted small">Teraka tamin'ny (Né le) :</span>
                        <div className="fw-semibold">15/06/{birthYear} ({age} ans)</div>
                      </div>
                      <div className="col-6">
                        <span className="text-muted small">Sokajy (Sexe) :</span>
                        <div className="fw-semibold">{sexe === 'LAHY' ? 'Lahy (M)' : 'Vavy (F)'}</div>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted small">Tao (Lieu de naissance) :</span>
                      <div className="fw-semibold">{lieuNaissance}</div>
                    </div>
                    <div>
                      <span className="text-muted small">Asa (Profession) :</span>
                      <div className="fw-semibold">{profession}</div>
                    </div>
                    <div>
                      <span className="text-muted small">Adiresy (Domicile) :</span>
                      <div className="fw-semibold">{adresse}, {commune}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom chip & expiration */}
              <div className="mt-3 pt-2 border-top d-flex justify-content-between align-items-center" style={{ fontSize: '0.7rem' }}>
                <div className="text-muted">
                  Nomena teto : <strong>{cinLieuDelivrance}</strong>
                </div>
                <div className="text-muted">
                  Tamin'ny : <strong>{dateDelivrance}</strong>
                </div>
                <div className="fw-bold text-success font-mono">
                  Manan-kery : 10 ANS
                </div>
              </div>
            </div>

            {/* CIN VERSO */}
            <div
              className="bg-white border rounded-3 p-4 position-relative shadow-sm"
              style={{
                maxWidth: '620px',
                width: '100%',
                minHeight: '260px',
                background: 'linear-gradient(135deg, #fdfbf7 0%, #f4ede4 100%)',
                border: '2px solid #94a3b8',
                borderRadius: '1rem',
                color: '#0f172a',
                fontFamily: 'sans-serif',
              }}
            >
              <div className="row g-3 align-items-center">
                <div className="col-7">
                  <div className="d-flex flex-column gap-2" style={{ fontSize: '0.78rem' }}>
                    <div>
                      <span className="text-muted small">Ray (Père) :</span>
                      <div className="fw-bold">{pereNom}</div>
                    </div>
                    <div>
                      <span className="text-muted small">Reny (Mère) :</span>
                      <div className="fw-bold">{mereNom}</div>
                    </div>
                    <div>
                      <span className="text-muted small">Famantarana manokana (Signes particuliers) :</span>
                      <div className="fw-semibold">TSY MISY (Néant)</div>
                    </div>
                  </div>
                </div>

                {/* Fingerprint stamp and signature */}
                <div className="col-5 text-center">
                  <div className="border border-secondary border-dashed p-2 rounded bg-white mb-2" style={{ height: 100 }}>
                    <div className="d-flex align-items-center justify-content-center h-100 opacity-60">
                      <span className="text-muted" style={{ fontSize: '0.65rem' }}>
                        [ Fanondro Havanana / Empreinte Digitale ]
                      </span>
                    </div>
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.65rem' }}>
                    Sonian'ny Tompony
                  </div>
                </div>
              </div>

              {/* Machine readable zone MRZ simulation */}
              <div className="mt-4 pt-2 border-top font-mono small text-secondary" style={{ letterSpacing: '0.15em', fontSize: '0.72rem' }}>
                <div>IDMDG{cinNumero.replace(/\s/g, '')}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</div>
                <div>{birthYear}06152{sexe === 'LAHY' ? 'M' : 'F'}3610145MDG&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;6</div>
                <div>{nom.replace(/\s/g, '<').toUpperCase()}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</div>
              </div>
            </div>
          </div>
        )}

        {/* DOCUMENT 3: COPIE D'ACTE DE NAISSANCE */}
        {docType === 'naissance' && (
          <div
            className="print-area bg-white shadow-sm border p-4 p-md-5 position-relative"
            style={{
              maxWidth: '800px',
              width: '100%',
              minHeight: '1050px',
              fontFamily: 'serif',
              color: '#0f172a',
              borderRadius: '0.5rem',
            }}
          >
            {/* Header */}
            <div className="text-center pb-3 border-bottom border-2 border-dark">
              <div className="fw-bold tracking-wider mb-1" style={{ fontSize: '0.95rem', letterSpacing: '0.15em' }}>
                REPOBLIKAN'I MADAGASIKARA
              </div>
              <div className="fst-italic text-secondary small mb-2" style={{ fontSize: '0.78rem' }}>
                Fitiavana — Tanindrazana — Fandrosoana
              </div>
              <div className="row text-center text-muted small mt-2" style={{ fontSize: '0.78rem', fontFamily: 'sans-serif' }}>
                <div className="col-6 text-start">
                  <div>FARITRA : <strong>{region.toUpperCase()}</strong></div>
                  <div>DISTRIKA : <strong>{district.toUpperCase()}</strong></div>
                  <div>KAOMININA : <strong>{commune.toUpperCase()}</strong></div>
                </div>
                <div className="col-6 text-end">
                  <div>BIROON'NY SORA-PIANTOHANA</div>
                  <div>SERVICE DE L'ÉTAT CIVIL</div>
                  <div>TAONA : <strong>{birthYear}</strong></div>
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="text-center my-4">
              <h2
                className="fw-bold text-uppercase mb-1"
                style={{
                  fontSize: '1.45rem',
                  letterSpacing: '0.08em',
                  textDecoration: 'underline',
                  textUnderlineOffset: '6px',
                }}
              >
                KOPIA NY SORA-PIANTOHANA NAHATERAHANA
              </h2>
              <div className="fw-bold text-muted small text-uppercase" style={{ letterSpacing: '0.05em' }}>
                COPIE LITTÉRALE DE L'ACTE DE NAISSANCE
              </div>
              <div className="mt-2 font-mono fw-bold text-primary">
                ACTE N° {numeroDoc.replace('ACT-', '')} / {birthYear}
              </div>
            </div>

            {/* Act body */}
            <div style={{ fontSize: '1rem', lineHeight: 2 }}>
              <p className="text-justify mb-4" style={{ textIndent: '2rem' }}>
                Tamin'ny <strong>dimy ambin'ny folo jona taona {birthYear}</strong> tamin'ny <strong>valora maraina</strong>,
                dia teraka tao <strong>{lieuNaissance}</strong> :
              </p>

              <div className="p-3 border border-dark rounded mb-4 bg-light bg-opacity-25">
                <div className="fs-5 fw-bold text-center text-dark mb-2">
                  {nom}
                </div>
                <div className="row text-center small" style={{ fontSize: '0.88rem' }}>
                  <div className="col-6">
                    Sokajy : <strong>{sexe === 'LAHY' ? 'Lahy (Masculin)' : 'Vavy (Féminin)'}</strong>
                  </div>
                  <div className="col-6">
                    Mponina ao : <strong>{commune}, Fokontany {fokontany}</strong>
                  </div>
                </div>
              </div>

              <p className="text-justify mb-3" style={{ textIndent: '2rem' }}>
                Zanak'i <strong>{pereNom}</strong>, asa aman-draharahany : <strong>Mpamboly</strong>,
                monina ao {district},
              </p>

              <p className="text-justify mb-4" style={{ textIndent: '2rem' }}>
                Sy <strong>{mereNom}</strong>, vadiny, asa aman-draharahany : <strong>Mpandranto</strong>,
                monina ao {district}.
              </p>

              <div className="p-3 border rounded mb-4" style={{ fontSize: '0.88rem', backgroundColor: '#fcfcfc' }}>
                <div className="fw-bold text-decoration-underline mb-1">Fanazavana an-tsisiny (Mentions marginales) :</div>
                <div className="text-muted fst-italic">Tsy misy fanamarihana manokana (Néant).</div>
              </div>

              <p className="text-justify mb-4" style={{ textIndent: '2rem' }}>
                Nokarakaraina araka ny lalàna mifehy ny sora-piankohonana eto Madagasikara,
                ary nanamarina fa mifanaraka tanteraka amin'ny bokim-panjakana.
              </p>

              {/* Signature block */}
              <div className="mt-5 pt-3">
                <div className="d-flex justify-content-between align-items-end">
                  <div className="text-center" style={{ width: 220 }}>
                    <div
                      className="rounded-circle border border-2 border-danger d-flex flex-column align-items-center justify-content-center text-danger p-2 mx-auto"
                      style={{ width: 100, height: 100, transform: 'rotate(8deg)' }}
                    >
                      <div className="fw-bold" style={{ fontSize: '0.55rem' }}>ÉTAT CIVIL</div>
                      <Icon name="award" size={16} />
                      <div className="fw-bold" style={{ fontSize: '0.55rem' }}>COMMUNE {commune.slice(0, 8).toUpperCase()}</div>
                    </div>
                    <div className="text-muted small mt-1" style={{ fontSize: '0.7rem' }}>Sombin-kase ofisialy</div>
                  </div>

                  <div className="text-center" style={{ width: 280 }}>
                    <div className="small mb-1">
                      Nomena teto <strong>{district}</strong>,
                    </div>
                    <div className="small mb-3 font-mono">
                      Androany faha-<strong>{dateDelivrance}</strong>
                    </div>
                    <div className="fw-bold text-dark small">
                      Ny Mpiandraikitra ny Sora-piankohonana
                    </div>
                    <div className="fst-italic text-muted small" style={{ fontSize: '0.75rem' }}>
                      (Officier de l'État Civil délégué)
                    </div>
                    <div className="fw-semibold text-primary pt-3" style={{ fontSize: '0.88rem' }}>
                      {nomSignataire}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
