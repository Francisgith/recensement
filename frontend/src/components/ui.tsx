import { createContext, useContext } from 'react'
import type {
  ButtonHTMLAttributes,
  FormHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  LabelHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from 'react'

type BtnVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'dark'
  | 'light'
  | 'outline-primary'
  | 'outline-secondary'
  | 'outline-success'
  | 'outline-danger'
  | 'outline-dark'

export function Button({
  variant = 'primary',
  size,
  className = '',
  type = 'button',
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; size?: 'sm' | 'lg' }) {
  const sizeClass = size ? `btn-${size}` : ''
  return (
    <button type={type} className={`btn btn-${variant} ${sizeClass} ${className}`.trim()} {...rest}>
      {children}
    </button>
  )
}

function CardRoot({ className = '', children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`card ${className}`.trim()} {...rest}>
      {children}
    </div>
  )
}

function CardBody({ className = '', children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`card-body ${className}`.trim()} {...rest}>
      {children}
    </div>
  )
}

export const Card = Object.assign(CardRoot, { Body: CardBody })

export function Spinner({
  size,
  className = '',
  role,
}: {
  size?: 'sm'
  className?: string
  role?: string
  animation?: string
}) {
  const sizeClass = size ? `spinner-border-${size}` : ''
  return <span className={`spinner-border ${sizeClass} ${className}`.trim()} role={role} />
}

export function Table({
  hover,
  className = '',
  children,
}: {
  hover?: boolean
  className?: string
  children: ReactNode
}) {
  return <table className={`table ${hover ? 'table-hover' : ''} ${className}`.trim()}>{children}</table>
}

export function Badge({
  bg = 'secondary',
  className = '',
  children,
}: {
  bg?: string
  className?: string
  children: ReactNode
}) {
  return <span className={`badge text-bg-${bg} ${className}`.trim()}>{children}</span>
}

export function Alert({
  variant = 'danger',
  className = '',
  children,
}: {
  variant?: string
  className?: string
  children: ReactNode
}) {
  return (
    <div className={`alert alert-${variant} ${className}`.trim()} role="alert">
      {children}
    </div>
  )
}

export function Row({ className = '', children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`row ${className}`.trim()} {...rest}>
      {children}
    </div>
  )
}

export function Col({
  xs,
  sm,
  md,
  lg,
  className = '',
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { xs?: number; sm?: number; md?: number; lg?: number }) {
  const parts = [
    xs ? `col-${xs}` : '',
    sm ? `col-sm-${sm}` : '',
    md ? `col-md-${md}` : '',
    lg ? `col-lg-${lg}` : '',
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <div className={`${parts || 'col'} ${className}`.trim()} {...rest}>
      {children}
    </div>
  )
}

function FormRoot({ className = '', children, ...rest }: FormHTMLAttributes<HTMLFormElement>) {
  return (
    <form className={className} {...rest}>
      {children}
    </form>
  )
}

function FormGroup({ className = '', children }: { className?: string; controlId?: string; children: ReactNode }) {
  return <div className={`mb-3 ${className}`.trim()}>{children}</div>
}

function FormLabel({ className = '', children, ...rest }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={`form-label ${className}`.trim()} {...rest}>
      {children}
    </label>
  )
}

function FormControl({ className = '', ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`form-control ${className}`.trim()} {...rest} />
}

function FormSelect({
  className = '',
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={`form-select ${className}`.trim()} {...rest}>
      {children}
    </select>
  )
}

function FormCheck({
  type = 'checkbox',
  label,
  className = '',
  id,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label?: ReactNode }) {
  const isSwitch = type === 'switch'
  return (
    <div className={`form-check ${isSwitch ? 'form-switch' : ''} ${className}`.trim()}>
      <input className="form-check-input" type={isSwitch ? 'checkbox' : type} id={id} {...rest} />
      {label && (
        <label className="form-check-label" htmlFor={id}>
          {label}
        </label>
      )}
    </div>
  )
}

export const Form = Object.assign(FormRoot, {
  Group: FormGroup,
  Label: FormLabel,
  Control: FormControl,
  Select: FormSelect,
  Check: FormCheck,
})

const ModalContext = createContext<() => void>(() => {})

function ModalRoot({
  show,
  onHide,
  centered,
  children,
}: {
  show: boolean
  onHide: () => void
  centered?: boolean
  children: ReactNode
}) {
  if (!show) return null
  return (
    <ModalContext.Provider value={onHide}>
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        role="dialog"
        onMouseDown={onHide}
        style={{ backgroundColor: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(4px)' }}
      >
        <div
          className={`modal-dialog ${centered ? 'modal-dialog-centered' : ''}`.trim()}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className="modal-content">{children}</div>
        </div>
      </div>
    </ModalContext.Provider>
  )
}

function ModalHeader({
  closeButton,
  className = '',
  children,
}: {
  closeButton?: boolean
  className?: string
  children: ReactNode
}) {
  const onHide = useContext(ModalContext)
  return (
    <div className={`modal-header ${className}`.trim()}>
      {children}
      {closeButton && <button type="button" className="btn-close" aria-label="Fermer" onClick={onHide} />}
    </div>
  )
}

function ModalTitle({ className = '', children }: { className?: string; children: ReactNode }) {
  return <h5 className={`modal-title fw-semibold ${className}`.trim()}>{children}</h5>
}

function ModalBody({ className = '', children }: { className?: string; children: ReactNode }) {
  return <div className={`modal-body ${className}`.trim()}>{children}</div>
}

function ModalFooter({ className = '', children }: { className?: string; children: ReactNode }) {
  return <div className={`modal-footer ${className}`.trim()}>{children}</div>
}

export const Modal = Object.assign(ModalRoot, {
  Header: ModalHeader,
  Title: ModalTitle,
  Body: ModalBody,
  Footer: ModalFooter,
})
