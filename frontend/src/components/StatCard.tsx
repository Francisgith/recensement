import Icon from './Icon'

interface StatCardProps {
  label: string
  value: number | string
  icon: 'users' | 'home' | 'user-group' | 'scale'
  tone?: 'brand' | 'accent' | 'warning' | 'danger'
}

const tones: Record<string, { bg: string; icon: string }> = {
  brand: { bg: 'bg-primary', icon: 'text-primary' },
  accent: { bg: 'bg-success', icon: 'text-success' },
  warning: { bg: 'bg-warning', icon: 'text-warning' },
  danger: { bg: 'bg-danger', icon: 'text-danger' },
}

export default function StatCard({ label, value, icon, tone = 'brand' }: StatCardProps) {
  return (
    <div className="col-12 col-sm-6 col-lg-3">
      <div className="card stat-card border-0 shadow-sm h-100">
        <div className="card-body d-flex align-items-center gap-3">
          <div
            className={`d-flex align-items-center justify-content-center rounded-3 ${tones[tone].bg} bg-opacity-10`}
            style={{ width: 52, height: 52 }}
          >
            <Icon name={icon} size={24} className={tones[tone].icon} />
          </div>
          <div>
            <div className="text-muted small text-uppercase fw-semibold" style={{ fontSize: '0.7rem', letterSpacing: '0.04em' }}>
              {label}
            </div>
            <div className="fs-3 fw-bold lh-1">{value}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
