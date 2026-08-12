import {
  Bell,
  Search,
  Menu,
  ChevronDown,
  User,
  Settings,
  LogOut,
  CalendarDays,
} from "lucide-react"

import {
  useState,
  useEffect,
  useRef,
} from "react"

import {
  Link,
  useNavigate,
} from "react-router-dom"

import API from "../../api/axios"

import "../../styles/Provider.css"

function ProviderNavbar({
  toggleSidebar,
}) {

  const navigate =
    useNavigate()

  const dropdownRef =
    useRef(null)

  const [showMenu, setShowMenu] =
    useState(false)

  const [notifications, setNotifications] =
    useState([])

  const [search, setSearch] =
    useState("")

  // ========================================
  // SAFE USER PARSING
  // ========================================

  let user = {}

  try {

    const userData =
      localStorage.getItem("user")

    if (
      userData &&
      userData !== "undefined"
    ) {

      user =
        JSON.parse(userData)
    }

  } catch (error) {

    console.error(
      "Error parsing user:",
      error
    )

    localStorage.removeItem("user")
  }

  // ========================================
  // FETCH NOTIFICATIONS
  // ========================================

  const fetchNotifications =
  async () => {

    try {

      const res =
      await API.get(
        "/notifications"
      )

      setNotifications(
        res.data.notifications || []
      )

    } catch (error) {

      console.error(
        "Error fetching notifications:",
        error
      )
    }
  }

  useEffect(() => {

    fetchNotifications()

  }, [])

  // ========================================
  // CLOSE DROPDOWN
  // ========================================

  useEffect(() => {

    const handleClickOutside =
    (event) => {

      if (

        dropdownRef.current &&

        !dropdownRef.current.contains(
          event.target
        )
      ) {

        setShowMenu(false)
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    )

    return () => {

      document.removeEventListener(
        "mousedown",
        handleClickOutside
      )
    }

  }, [])

  // ========================================
  // LOGOUT
  // ========================================

  const handleLogout = () => {

    localStorage.removeItem(
      "token"
    )

    localStorage.removeItem(
      "user"
    )

    navigate("/login")
  }

  // ========================================
  // UNREAD NOTIFICATIONS
  // ========================================

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.is_read
    ).length

  // ========================================
  // SEARCH
  // ========================================

  const handleSearch = (e) => {

    if (
      e.key === "Enter" &&
      search.trim()
    ) {

      navigate(
        `/provider/search?q=${search}`
      )
    }
  }

  return (

    <header className="provider-navbar">

      <div className="provider-navbar-container">

        {/* LEFT SECTION */}

        <div className="provider-navbar-left">

          {/* MOBILE MENU */}

          <button
            onClick={toggleSidebar}
            className="provider-mobile-menu"
          >

            <Menu size={22} />

          </button>

          {/* TITLE */}

          <div>

            <div className="provider-workspace-badge">

              <CalendarDays
                size={16}
                className="provider-workspace-icon"
              />

              <span className="provider-workspace-text">
                Provider Workspace
              </span>
            </div>

            <h1 className="provider-title">
              Dashboard
            </h1>

          </div>
        </div>

        {/* RIGHT SECTION */}

        <div className="provider-navbar-right">

          {/* SEARCH */}

          <div className="provider-search-wrapper">

            <Search className="provider-search-icon" />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              onKeyDown={handleSearch}
              placeholder="Search bookings, services..."
              className="provider-search-input"
            />
          </div>

          {/* NOTIFICATIONS */}

          <Link
            to="/provider/notifications"
            className="provider-notification-btn"
          >

            <Bell size={22} />

            {unreadCount > 0 && (

              <div className="provider-notification-badge">

                {unreadCount > 99
                  ? "99+"
                  : unreadCount}

              </div>
            )}
          </Link>

          {/* PROFILE */}

          <div
            ref={dropdownRef}
            className="provider-profile-dropdown"
          >

            <button
              onClick={() =>
                setShowMenu(!showMenu)
              }
              className="provider-profile-btn"
            >

              {/* AVATAR */}

              <div className="provider-profile-avatar">

                {user?.avatar ? (

                  <img
                    src={user.avatar}
                    alt={user?.full_name}
                    className="provider-profile-avatar-img"
                  />

                ) : (

                  user?.full_name
                    ?.charAt(0)
                    ?.toUpperCase() || "U"
                )}
              </div>

              {/* USER INFO */}

              <div className="provider-profile-info">

                <h3 className="provider-profile-name">

                  {user?.full_name || "User"}

                </h3>

                <p className="provider-profile-role">
                  Provider
                </p>

              </div>

              <ChevronDown className="provider-chevron-icon" />

            </button>

            {/* DROPDOWN */}

            {showMenu && (

              <div className="provider-dropdown-menu">

                <div className="provider-dropdown-header">

                  <h3 className="provider-dropdown-name">

                    {user?.full_name || "User"}

                  </h3>

                  <p className="provider-dropdown-email">

                    {user?.email ||
                      "user@example.com"}

                  </p>
                </div>

                <div className="provider-dropdown-items">

                  <Link
                    to="/provider/profile"
                    className="provider-dropdown-link"
                  >

                    <User size={18} />

                    Profile

                  </Link>

                  <Link
                    to="/provider/settings"
                    className="provider-dropdown-link"
                  >

                    <Settings size={18} />

                    Settings

                  </Link>

                  <button
                    onClick={handleLogout}
                    className="provider-dropdown-logout"
                  >

                    <LogOut size={18} />

                    Logout

                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default ProviderNavbar