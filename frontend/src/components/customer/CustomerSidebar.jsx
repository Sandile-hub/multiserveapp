import {
  LayoutDashboard,
  CalendarCheck,
  Heart,
  MessageCircle,
  Bell,
  Settings,
  CreditCard,
  Search,
  UserCircle2,
  LogOut,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Wallet,
} from "lucide-react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useState } from "react"
import "../../styles/Customer.css"

function CustomerSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem("user") || "{}")
  const [collapsed, setCollapsed] = useState(false)

  // MENU ITEMS
  const menuItems = [
    { title: "Dashboard", icon: LayoutDashboard, path: "/customer/dashboard" },
    { title: "Browse Services", icon: Search, path: "/services" },
    { title: "Bookings", icon: CalendarCheck, path: "/customer/bookings" },
    { title: "Wallet", icon: Wallet, path: "/customer/wallet" },
    { title: "Payments", icon: CreditCard, path: "/customer/payments" },
    { title: "Favorites", icon: Heart, path: "/customer/favorites" },
    { title: "Messages", icon: MessageCircle, path: "/customer/chat" },
    { title: "Notifications", icon: Bell, path: "/customer/notifications" },
    { title: "Profile", icon: UserCircle2, path: "/customer/profile" },
    { title: "Settings", icon: Settings, path: "/customer/settings" },
  ]

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/login")
  }

  return (
    <aside className={`customer-sidebar ${collapsed ? "customer-sidebar-collapsed" : ""}`}>
      {/* TOP SECTION */}
      <div className="customer-sidebar-top">
        <div className="customer-sidebar-header">
          {!collapsed && (
            <div className="customer-sidebar-brand">
              <div className="customer-sidebar-badge">
                <Sparkles size={14} />
                Customer Panel
              </div>
              <h1 className="customer-sidebar-logo">MultiServe</h1>
              <p className="customer-sidebar-subtitle">Customer Dashboard</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="customer-sidebar-toggle"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
      </div>

{/* USER PROFILE SECTION */}
<div className="customer-sidebar-user">

  <div
    className={`customer-user-card ${
      collapsed
        ? "customer-user-card-collapsed"
        : ""
    }`}
  >

    {/* PROFILE IMAGE */}
    <div className="customer-user-avatar-wrapper">

      {user?.profile_image ? (
        <img
          src={user.profile_image}
          alt={user.full_name}
          className="customer-user-avatar-image"
          onError={(e) => {
            e.target.src =
              "/default-avatar.png";
          }}
        />
      ) : (
        <div className="customer-user-avatar">
          {user?.full_name
            ?.charAt(0)
            ?.toUpperCase() || "U"}
        </div>
      )}

      <div className="customer-user-online"></div>

    </div>

    {/* USER INFO */}
    {!collapsed && (
      <div className="customer-user-info">

        <h3 className="customer-user-name">
          {user?.full_name || "User"}
        </h3>

        <p className="customer-user-email">
          {user?.email || "user@example.com"}
        </p>

        <div className="customer-user-status">
          Active Customer
        </div>

      </div>
    )}

  </div>

</div>

      {/* NAVIGATION MENU */}
      <div className="customer-sidebar-nav">
        <div className="customer-nav-items">
          {menuItems.map((item, index) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path

            return (
              <Link
                key={index}
                to={item.path}
                className={`customer-nav-item ${isActive ? "customer-nav-item-active" : ""} ${
                  collapsed ? "customer-nav-item-collapsed" : ""
                }`}
              >
                {isActive && <div className="customer-nav-active-glow" />}
                <Icon size={22} className="customer-nav-icon" />
                {!collapsed && <span className="customer-nav-text">{item.title}</span>}
              </Link>
            )
          })}
        </div>
      </div>

      {/* FOOTER - LOGOUT BUTTON */}
      <div className="customer-sidebar-footer">
        <button
          onClick={handleLogout}
          className={`customer-logout-btn ${collapsed ? "customer-logout-btn-collapsed" : ""}`}
        >
          <LogOut size={20} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}

export default CustomerSidebar