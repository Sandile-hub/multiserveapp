import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import "../../styles/Admin.css"

function QuickActionCard({
  to,
  title,
  description,
  icon: Icon,
  color = "indigo",
  stats, // Optional: { value, label } for stats variation
}) {
  
  // Map color to CSS class
  const colorClasses = {
    purple: "quick-action-card-purple",
    blue: "quick-action-card-blue",
    cyan: "quick-action-card-cyan",
    green: "quick-action-card-green",
    orange: "quick-action-card-orange",
    pink: "quick-action-card-pink",
    indigo: "quick-action-card-indigo",
  }

  const cardClass = colorClasses[color] || "quick-action-card-indigo"
  const hasStats = stats && stats.value

  return (
    <Link
      to={to}
      className={`quick-action-card ${cardClass} ${hasStats ? 'quick-action-card-stats' : ''}`}
    >
      <div className="quick-action-card-content">
        <div className="quick-action-card-icon">
          <Icon />
        </div>

        <h3 className="quick-action-card-title">{title}</h3>
        
        <p className="quick-action-card-description">{description}</p>

        {/* Optional Stats Section */}
        {hasStats && (
          <div className="quick-action-stat">
            <span className="quick-action-stat-value">{stats.value}</span>
            <span className="quick-action-stat-label">{stats.label}</span>
          </div>
        )}
      </div>

      {/* Animated Arrow Indicator */}
      <div className="quick-action-card-footer">
        <div className="quick-action-card-arrow">
          <span>Quick Action</span>
          <ArrowRight />
        </div>
      </div>
    </Link>
  )
}

export default QuickActionCard