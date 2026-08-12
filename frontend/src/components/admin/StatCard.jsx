import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import "../../styles/Admin.css"

function StatCard({
  title,
  value,
  icon: Icon,
  trend, // Optional: { value: 12.5, direction: 'up' | 'down' | 'neutral' }
  variant = "primary", // primary, success, warning, danger, info
  tooltip, // Optional tooltip text
  animate = true, // Enable/disable animation
}) {
  
  // Map variant to CSS class
  const variantClasses = {
    primary: "stat-card-primary",
    success: "stat-card-success",
    warning: "stat-card-warning",
    danger: "stat-card-danger",
    info: "stat-card-info",
  }

  const cardClass = variantClasses[variant] || "stat-card-primary"

  // Render trend indicator
  const renderTrend = () => {
    if (!trend) return null

    const isUp = trend.direction === "up"
    const isDown = trend.direction === "down"
    const TrendIcon = isUp ? TrendingUp : isDown ? TrendingDown : Minus
    const trendClass = isUp ? "stat-card-trend-up" : isDown ? "stat-card-trend-down" : "stat-card-trend-neutral"
    const trendSign = isUp ? "+" : isDown ? "" : ""

    return (
      <div className={`stat-card-trend ${trendClass}`}>
        <TrendIcon size={14} />
        <span className="stat-card-trend-value">
          {trendSign}{trend.value}%
        </span>
      </div>
    )
  }

  return (
    <div 
      className={`stat-card ${cardClass} ${tooltip ? 'stat-card-tooltip' : ''}`}
      data-tooltip={tooltip}
    >
      <div className="stat-card-header">
        <div className="stat-card-icon-wrapper">
          <Icon size={24} className="stat-card-icon" />
        </div>
        {renderTrend()}
      </div>

      <div className="stat-card-content">
        <p className="stat-card-title">{title}</p>
        <h2 className={`stat-card-value ${animate ? 'stat-card-value-animate' : ''}`}>
          {value}
        </h2>
      </div>
    </div>
  )
}

export default StatCard