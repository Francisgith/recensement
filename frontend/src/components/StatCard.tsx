interface StatCardProps {
  label: string
  value: number | string
  icon: string
  tone?: 'brand' | 'accent' | 'warning' | 'danger'
}

const tones: Record<string, string> = {
  brand: 'text-bg-success',
  accent: 'text-bg-primary',
  warning: 'text-bg-warning',
  danger: 'text-bg-danger',
}

export default function StatCard({ label, value, icon, tone = 'brand' }: StatCardProps) {
  return (
    <div className="col-12 col-sm-6 col-lg-3">
      <div className="card stat-card border-0 shadow-sm h-100">
        <div className="card-body d-flex align-items-center gap-3">
          <div
            className={`d-flex align-items-center justify-content-center rounded-3 ${tones[tone]}`}
            style={{ width: 48, height: 48, fontSize: 22 }}
          >
            {icon}
          </div>
          <div>
            <div className="text-muted small text-uppercase fw-semibold">{label}</div>
            <div className="fs-3 fw-bold lh-1">{value}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
