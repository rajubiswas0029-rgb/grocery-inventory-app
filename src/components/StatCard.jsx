export default function StatCard({ title, value, subtitle, icon: Icon, variant = 'default' }) {
  return (
    <div className={`stat-card stat-card-${variant}`}>
      <div className="stat-card-content">
        <p className="stat-card-title">{title}</p>
        <p className="stat-card-value">{value}</p>
        {subtitle && <p className="stat-card-subtitle">{subtitle}</p>}
      </div>
      {Icon && (
        <div className="stat-card-icon">
          <Icon size={24} />
        </div>
      )}
    </div>
  )
}
