import {
  LayoutDashboard,
  Briefcase,
  CalendarCheck,
  MessageCircle,
  Star,
  CreditCard,
  Settings,
  Bell,
  Store,
} from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import "../../styles/Provider.css"

function ProviderSidebar({ isOpen = true, onClose = () => {} }) {
  const location = useLocation()

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/provider/dashboard",
    },
    {
      title: "Create Business",
      icon: Briefcase,
      path: "/provider/create-business",
    },
    {
      title: "Services",
      icon: Briefcase,
      path: "/provider/services",
    },
    {
      title: "Bookings",
      icon: CalendarCheck,
      path: "/provider/bookings",
    },
    {
      title: "Messages",
      icon: MessageCircle,
      path: "/provider/chat",
    },
    {
      title: "Reviews",
      icon: Star,
      path: "/provider/reviews",
    },
    {
      title: "Payments",
      icon: CreditCard,
      path: "/provider/payments",
    },
    {
      title: "Notifications",
      icon: Bell,
      path: "/provider/notifications",
    },
    {
      title: "Settings",
      icon: Settings,
      path: "/provider/settings",
    },
  ]

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div className="provider-sidebar-overlay" onClick={onClose} />
      )}

      <aside className={`provider-sidebar ${!isOpen ? 'provider-sidebar-mobile' : ''}`}>
        {/* Header */}
        <div className="provider-sidebar-header">
          <h1 className="provider-sidebar-logo">MultiServe</h1>
          <p className="provider-sidebar-subtitle">Provider Panel</p>
        </div>

        {/* Navigation Menu */}
        <nav className="provider-sidebar-nav">
          {menuItems.map((item, index) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path

            return (
              <Link
                key={index}
                to={item.path}
                className={`provider-nav-item ${
                  isActive ? "provider-nav-item-active" : ""
                }`}
                data-tooltip={item.title}
              >
                <Icon size={20} />
                <span>{item.title}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="provider-sidebar-footer">
          <div className="provider-sidebar-version">
            Version 1.0.0
          </div>
        </div>
      </aside>
    </>
  )
}

export default ProviderSidebar