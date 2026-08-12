import {
  LayoutDashboard,
  Building2,
  Users,
  CalendarCheck,
  Bell,
  CreditCard,
  Star,
  Settings,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { useState } from "react"
import "../../styles/Admin.css"

function AdminSidebar() {
  const location = useLocation()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const menuItems = [
    { title: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
    { title: "Businesses", icon: Building2, path: "/admin/businesses" },
    { title: "Users", icon: Users, path: "/admin/users" },
    { title: "Bookings", icon: CalendarCheck, path: "/admin/bookings" },
    { title: "Payments", icon: CreditCard, path: "/admin/payments" },
    { title: "Reviews", icon: Star, path: "/admin/reviews" },
    { title: "Notifications", icon: Bell, path: "/admin/notifications" },
    { title: "Settings", icon: Settings, path: "/admin/settings" },
  ]

  const closeSidebar = () => setIsMobileOpen(false)
  const toggleSidebar = () => setIsMobileOpen(!isMobileOpen)

  return (
    <>
      {/* Mobile Menu Button - Hamburger */}
      <button className="admin-mobile-menu-btn" onClick={toggleSidebar}>
        <Menu size={24} />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && <div className="admin-sidebar-overlay" onClick={closeSidebar} />}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${isMobileOpen ? "admin-sidebar-mobile-open" : ""}`}>
        {/* Close Button for Mobile */}
        <button className="admin-sidebar-close" onClick={closeSidebar}>
          <X size={20} />
        </button>

        {/* Logo Section */}
        <div className="admin-sidebar-logo">
          <div className="admin-logo-wrapper">
            <div className="admin-logo-icon">
              <ShieldCheck />
            </div>
            <div className="admin-logo-text">
              <h1 className="admin-logo-title">MultiServe</h1>
              <p className="admin-logo-subtitle">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="admin-nav">
          {menuItems.map((item, index) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path

            return (
              <Link
                key={index}
                to={item.path}
                className={`admin-nav-item ${isActive ? "admin-nav-item-active" : ""}`}
                onClick={closeSidebar}
                data-tooltip={item.title}
              >
                <Icon size={20} />
                <span>{item.title}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="admin-sidebar-footer">
          <div className="admin-sidebar-version">Version 1.0.0</div>
        </div>
      </aside>
    </>
  )
}

export default AdminSidebar