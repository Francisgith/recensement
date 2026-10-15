import Icon from './Icon'

export interface StatCardProps {
  label: string
  value: string | number
  icon: 'users' | 'home' | 'user-group' | 'scale' | 'activity' | 'award' | 'map' | 'shield'
  tone?: 'brand' | 'accent' | 'warning' | 'danger'
  sub?: string
}

export default function StatCard({
  label,
  value,
  icon,
  tone = 'brand',
  sub,
}: StatCardProps) {
  const toneMap = {
    brand: {
      bg: '#eff6ff',
      border: '#bfdbfe',
      text: '#1d4ed8',
      iconBg: '#2563eb',
    },
    accent: {
      bg: '#ecfdf5',
      border: '#a7f3d0',
      text: '#047857',
      iconBg: '#059669',
    },
    warning: {
      bg: '#fffbeb',
      border: '#fde68a',
      text: '#b45309',
      iconBg: '#d97706',
    },
    danger: {
      bg: '#fff1f2',
      border: '#fecdd3',
      text: '#be123c',
      iconBg: '#e11d48',
    },
  }

  const currentTone = toneMap[tone] || toneMap.brand

  return (
    <div className="col-12 col-sm-6 col-xl-3">
      <div
        className="card border-0 shadow-sm h-100 p-3 rounded-3 transition-all"
        style={{
          borderLeftWidth: '4px',
          borderLeftStyle: 'solid',
          borderLeftColor: currentTone.iconBg,
        }}
      >
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <div className="text-secondary small fw-medium mb-1" style={{ fontSize: '0.78rem' }}>
              {label}
            </div>
            <div className="h4 fw-bold mb-0 font-mono tracking-tight text-dark">
              {value}
            </div>
            {sub && (
              <div className="text-muted small mt-1" style={{ fontSize: '0.72rem' }}>
                {sub}
              </div>
            )}
          </div>
          <div
            className="rounded-3 d-flex align-items-center justify-content-center text-white shadow-xs flex-shrink-0"
            style={{
              width: 44,
              height: 44,
              backgroundColor: currentTone.iconBg,
            }}
          >
            <Icon name={icon} size={22} />
          </div>
        </div>
      </div>
    </div>
  )
}
