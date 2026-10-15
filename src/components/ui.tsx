import React from 'react'
import type {
  ReactNode,
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  SelectHTMLAttributes,
  FormHTMLAttributes,
  HTMLAttributes,
} from 'react'

// --- BUTTON ---
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'danger'
    | 'warning'
    | 'info'
    | 'light'
    | 'dark'
    | 'link'
    | 'outline-primary'
    | 'outline-secondary'
    | 'outline-success'
    | 'outline-danger'
    | 'outline-warning'
    | 'outline-info'
    | 'outline-light'
    | 'outline-dark'
  size?: 'sm' | 'lg'
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size,
  className = '',
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  const sizeClass = size ? `btn-${size}` : ''
  return (
    <button
      type={type}
      className={`btn btn-${variant} ${sizeClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  )
}

// --- BADGE ---
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  bg?: string
  text?: string
  pill?: boolean
  children: ReactNode
}

export function Badge({
  bg = 'primary',
  text,
  pill = false,
  className = '',
  children,
  ...props
}: BadgeProps) {
  const bgClass = bg.startsWith('bg-') ? bg : `bg-${bg}`
  const textClass = text ? (text.startsWith('text-') ? text : `text-${text}`) : ''
  const pillClass = pill ? 'rounded-pill' : ''
  return (
    <span className={`badge ${bgClass} ${textClass} ${pillClass} ${className}`.trim()} {...props}>
      {children}
    </span>
  )
}

// --- ALERT ---
export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark'
  dismissible?: boolean
  onClose?: () => void
  children: ReactNode
}

export function Alert({
  variant = 'danger',
  dismissible = false,
  onClose,
  className = '',
  children,
  ...props
}: AlertProps) {
  return (
    <div
      className={`alert alert-${variant} ${dismissible ? 'alert-dismissible fade show' : ''} ${className}`.trim()}
      role="alert"
      {...props}
    >
      {children}
      {dismissible && (
        <button
          type="button"
          className="btn-close"
          aria-label="Close"
          onClick={onClose}
        />
      )}
    </div>
  )
}

// --- SPINNER ---
export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  animation?: 'border' | 'grow'
  size?: 'sm'
  variant?: string
}

export function Spinner({
  animation = 'border',
  size,
  variant,
  className = '',
  ...props
}: SpinnerProps) {
  const sizeClass = size ? `spinner-${animation}-${size}` : ''
  const variantClass = variant ? `text-${variant}` : ''
  return (
    <div
      className={`spinner-${animation} ${sizeClass} ${variantClass} ${className}`.trim()}
      role="status"
      {...props}
    >
      <span className="visually-hidden">Chargement...</span>
    </div>
  )
}

// --- CARD ---
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function Card({ className = '', children, ...props }: CardProps) {
  return (
    <div className={`card ${className}`.trim()} {...props}>
      {children}
    </div>
  )
}

Card.Body = function CardBody({
  className = '',
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div className={`card-body ${className}`.trim()} {...props}>
      {children}
    </div>
  )
}

Card.Header = function CardHeader({
  className = '',
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div className={`card-header ${className}`.trim()} {...props}>
      {children}
    </div>
  )
}

Card.Title = function CardTitle({
  className = '',
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement> & { children: ReactNode }) {
  return (
    <h5 className={`card-title ${className}`.trim()} {...props}>
      {children}
    </h5>
  )
}

// --- ROW & COL ---
export function Row({
  className = '',
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div className={`row ${className}`.trim()} {...props}>
      {children}
    </div>
  )
}

export interface ColProps extends HTMLAttributes<HTMLDivElement> {
  xs?: number | string
  sm?: number | string
  md?: number | string
  lg?: number | string
  xl?: number | string
  children: ReactNode
}

export function Col({
  xs,
  sm,
  md,
  lg,
  xl,
  className = '',
  children,
  ...props
}: ColProps) {
  const classes = [
    xs ? `col-${xs}` : '',
    sm ? `col-sm-${sm}` : '',
    md ? `col-md-${md}` : '',
    lg ? `col-lg-${lg}` : '',
    xl ? `col-xl-${xl}` : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <div className={classes || 'col'} {...props}>
      {children}
    </div>
  )
}

// --- TABLE ---
export interface TableProps extends HTMLAttributes<HTMLTableElement> {
  responsive?: boolean
  striped?: boolean
  hover?: boolean
  bordered?: boolean
  children: ReactNode
}

export function Table({
  responsive = false,
  striped = false,
  hover = false,
  bordered = false,
  className = '',
  children,
  ...props
}: TableProps) {
  const tableClasses = [
    'table',
    striped ? 'table-striped' : '',
    hover ? 'table-hover' : '',
    bordered ? 'table-bordered' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const tableElem = (
    <table className={tableClasses} {...props}>
      {children}
    </table>
  )

  if (responsive) {
    return <div className="table-responsive">{tableElem}</div>
  }
  return tableElem
}

// --- FORM ---
export function Form({
  className = '',
  children,
  ...props
}: FormHTMLAttributes<HTMLFormElement> & { children: ReactNode }) {
  return (
    <form className={className} {...props}>
      {children}
    </form>
  )
}

export interface FormGroupProps extends HTMLAttributes<HTMLDivElement> {
  controlId?: string
  children: ReactNode
}

Form.Group = function FormGroup({
  controlId,
  className = 'mb-3',
  children,
  ...props
}: FormGroupProps) {
  return (
    <div id={controlId} className={className} {...props}>
      {children}
    </div>
  )
}

Form.Label = function FormLabel({
  className = 'form-label small fw-semibold',
  children,
  htmlFor,
  ...props
}: HTMLAttributes<HTMLLabelElement> & { children: ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className={className} {...props}>
      {children}
    </label>
  )
}

export interface FormControlProps
  extends InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  as?: 'input' | 'textarea'
  rows?: number
}

Form.Control = function FormControl({
  as = 'input',
  className = '',
  rows,
  ...props
}: FormControlProps) {
  if (as === 'textarea') {
    return (
      <textarea
        rows={rows || 3}
        className={`form-control ${className}`.trim()}
        {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
      />
    )
  }
  return (
    <input
      className={`form-control ${className}`.trim()}
      {...(props as InputHTMLAttributes<HTMLInputElement>)}
    />
  )
}

export interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode
}

Form.Select = function FormSelect({
  className = '',
  children,
  ...props
}: FormSelectProps) {
  return (
    <select className={`form-select ${className}`.trim()} {...props}>
      {children}
    </select>
  )
}

export interface FormCheckProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode
  type?: 'checkbox' | 'radio' | 'switch'
}

Form.Check = function FormCheck({
  label,
  type = 'checkbox',
  id,
  className = '',
  checked,
  onChange,
  ...props
}: FormCheckProps) {
  const isSwitch = type === 'switch'
  const wrapperClass = isSwitch ? 'form-check form-switch' : 'form-check'
  return (
    <div className={`${wrapperClass} ${className}`.trim()}>
      <input
        type={isSwitch ? 'checkbox' : type}
        id={id}
        className="form-check-input"
        checked={checked}
        onChange={onChange}
        {...props}
      />
      {label && (
        <label htmlFor={id} className="form-check-label small">
          {label}
        </label>
      )}
    </div>
  )
}

// --- MODAL ---
interface ModalContextType {
  onHide?: () => void
}

const ModalContext = React.createContext<ModalContextType>({})

export interface ModalProps {
  show: boolean
  onHide?: () => void
  size?: 'sm' | 'lg' | 'xl'
  centered?: boolean
  className?: string
  children: ReactNode
}

export function Modal({
  show,
  onHide,
  size,
  centered = true,
  className = '',
  children,
}: ModalProps) {
  React.useEffect(() => {
    if (!show) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onHide) {
        onHide()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [show, onHide])

  if (!show) return null

  const sizeClass = size ? `modal-${size}` : ''
  const centeredClass = centered ? 'modal-dialog-centered' : ''

  return (
    <ModalContext.Provider value={{ onHide }}>
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)' }}
        onClick={(e) => {
          if (e.target === e.currentTarget && onHide) {
            onHide()
          }
        }}
      >
        <div className={`modal-dialog ${sizeClass} ${centeredClass} ${className}`.trim()}>
          <div className="modal-content shadow-lg border-0">{children}</div>
        </div>
      </div>
    </ModalContext.Provider>
  )
}

Modal.Header = function ModalHeader({
  closeButton = true,
  className = 'p-3 border-bottom',
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { closeButton?: boolean; children: ReactNode }) {
  const { onHide } = React.useContext(ModalContext)
  return (
    <div className={`modal-header ${className}`.trim()} {...props}>
      {children}
      {closeButton && (
        <button
          type="button"
          className="btn-close"
          aria-label="Fermer"
          onClick={onHide}
        />
      )}
    </div>
  )
}

Modal.Title = function ModalTitle({
  className = 'modal-title h5 fw-bold',
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement> & { children: ReactNode }) {
  return (
    <h5 className={className} {...props}>
      {children}
    </h5>
  )
}

Modal.Body = function ModalBody({
  className = 'modal-body p-3 p-md-4',
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  )
}

Modal.Footer = function ModalFooter({
  className = 'modal-footer p-3 border-top',
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  )
}
