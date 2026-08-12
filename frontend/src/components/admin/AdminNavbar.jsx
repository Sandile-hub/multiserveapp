import {
  Bell,
  Search,
  Menu,
  ChevronDown,
  LogOut,
  Settings,
  User,
  LayoutDashboard,
  X,
} from "lucide-react"
import {
  useEffect,
  useRef,
  useState,
} from "react"
import {
  useLocation,
  useNavigate,
} from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import API from "../../api/axios"
import { io } from "socket.io-client"
import "../../styles/Admin.css"

const socket = io("http://localhost:5000")

function AdminNavbar({ toggleSidebar }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [search, setSearch] = useState("")
  const dropdownRef = useRef(null)
  const notificationRef = useRef(null)

  // Page Titles
  const pageTitles = {
    "/admin/dashboard": "Dashboard",
    "/admin/businesses": "Businesses",
    "/admin/users": "Users",
    "/admin/bookings": "Bookings",
    "/admin/payments": "Payments",
    "/admin/reviews": "Reviews",
    "/notifications": "Notifications",
    "/admin/settings": "Settings",
  }

  const currentTitle = pageTitles[location.pathname] || "Dashboard"

  // Fetch Notifications
  const fetchNotifications = async () => {
    try {
      const res = await API.get("/notifications")
      setNotifications(res.data)
      const unread = res.data.filter((item) => !item.is_read).length
      setUnreadCount(unread)
    } catch (error) {
      console.log(error)
    }
  }

  // Initial Fetch
  useEffect(() => {
    fetchNotifications()
  }, [])

  // Socket Connection
  useEffect(() => {
    if (user?.id) {
      socket.emit("register_user", user.id)
    }
    socket.on("receive_notification", () => {
      fetchNotifications()
    })
    return () => {
      socket.off("receive_notification")
    }
  }, [user])

  // Mark as Read
  const markAsRead = async (id) => {
    try {
      await API.put(`/notifications/read/${id}`)
      fetchNotifications()
    } catch (error) {
      console.log(error)
    }
  }

  // Close Dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Logout
  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  // Search
  const handleSearch = (e) => {
    if (e.key === "Enter") {
      navigate(`/admin/search?q=${search}`)
    }
  }

  return (
    <div className="admin-navbar-container">
      {/* Left Section */}
      <div className="admin-navbar-left">
        {/* Mobile Sidebar Toggle */}
        <button onClick={toggleSidebar} className="admin-mobile-toggle">
          <Menu size={22} />
        </button>

        {/* Page Info */}
        <div>
          <div className="admin-page-info">
            <div className="admin-page-icon">
              <LayoutDashboard />
            </div>
            <div>
              <h1 className="admin-page-title">{currentTitle}</h1>
              <p className="admin-welcome-text">
                Welcome back,{" "}
                <span className="admin-welcome-name">{user?.full_name}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="admin-navbar-right">
        {/* Search Bar */}
        <div className="admin-search-wrapper">
          <Search className="admin-search-icon" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
            className="admin-search-input"
          />
        </div>

        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="admin-notification-btn"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="admin-notification-badge">{unreadCount}</span>
            )}
          </button>

          {/* Notification Dropdown */}
          {notificationsOpen && (
            <div className="admin-dropdown admin-notification-dropdown">
              {/* Header */}
              <div className="admin-notification-header">
                <h3 className="admin-notification-title">Notifications</h3>
                <button
                  onClick={() => setNotificationsOpen(false)}
                  className="admin-notification-close"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Content */}
              <div className="admin-notification-list">
                {notifications.length === 0 ? (
                  <div className="admin-notification-empty">
                    No notifications
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => markAsRead(item.id)}
                      className={`admin-notification-item ${
                        !item.is_read ? "admin-notification-item-unread" : ""
                      }`}
                    >
                      <div className="admin-notification-content">
                        <div className="admin-notification-text">
                          <h4 className="admin-notification-item-title">
                            {item.title}
                          </h4>
                          <p className="admin-notification-item-message">
                            {item.message}
                          </p>
                        </div>
                        {!item.is_read && (
                          <div className="admin-notification-dot" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="admin-profile-btn"
          >
            <div className="admin-profile-avatar">
              {user?.full_name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="admin-profile-info">
              <h3 className="admin-profile-name">{user?.full_name}</h3>
              <p className="admin-profile-role">Administrator</p>
            </div>
            <ChevronDown className="admin-chevron-icon" />
          </button>

          {/* Profile Menu */}
          {dropdownOpen && (
            <div className="admin-dropdown admin-profile-dropdown">
              <button
                onClick={() => navigate("/admin/profile")}
                className="admin-dropdown-item"
              >
                <User size={18} />
                Profile
              </button>
              <button
                onClick={() => navigate("/admin/settings")}
                className="admin-dropdown-item"
              >
                <Settings size={18} />
                Settings
              </button>
              <button
                onClick={handleLogout}
                className="admin-dropdown-item admin-dropdown-item-danger"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminNavbar