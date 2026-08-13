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
  toggleSidebar = () => {},
}) {

  const navigate = useNavigate()

  const dropdownRef = useRef(null)

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
      userData !== "undefined" &&
      userData !== "null"
    ) {

      user = JSON.parse(userData)

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

        const data = res.data

        /*
         * Support both:
         *
         * {
         *   notifications: [...]
         * }
         *
         * and:
         *
         * [...]
         */

        if (Array.isArray(data)) {

          setNotifications(data)

        } else if (
          Array.isArray(
            data?.notifications
          )
        ) {

          setNotifications(
            data.notifications
          )

        } else {

          setNotifications([])

        }

      } catch (error) {

        console.error(
          "Error fetching notifications:",
          error
        )

        setNotifications([])

      }

    }


  useEffect(() => {

    fetchNotifications()

  }, [])


  // ========================================
  // CLOSE PROFILE DROPDOWN
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
    Array.isArray(notifications)
      ? notifications.filter(
          (notification) =>
            !notification.is_read
        ).length
      : 0


  // ========================================
  // SEARCH
  // ========================================

  const handleSearch =
    (e) => {

      if (
        e.key === "Enter" &&
        search.trim()
      ) {

        navigate(
          `/provider/search?q=${encodeURIComponent(
            search.trim()
          )}`
        )

      }

    }


  // ========================================
  // RENDER
  // ========================================

  return (

    <header className="
      provider-navbar
    ">

      <div className="
        provider-navbar-container
      ">


        {/* ==================================
            LEFT SECTION
        ================================== */}

        <div className="
          provider-navbar-left
        ">


          {/* MOBILE MENU */}

          <button
            type="button"
            onClick={toggleSidebar}
            className="
              provider-mobile-menu
            "
            aria-label="Open provider sidebar"
            title="Open menu"
          >

            <Menu size={22} />

          </button>


          {/* TITLE */}

          <div>

            <div className="
              provider-workspace-badge
            ">

              <CalendarDays
                size={16}
                className="
                  provider-workspace-icon
                "
              />

              <span className="
                provider-workspace-text
              ">
                Provider Workspace
              </span>

            </div>


            <h1 className="
              provider-title
            ">
              Dashboard
            </h1>

          </div>

        </div>


        {/* ==================================
            RIGHT SECTION
        ================================== */}

        <div className="
          provider-navbar-right
        ">


          {/* SEARCH */}

          <div className="
            provider-search-wrapper
          ">

            <Search
              className="
                provider-search-icon
              "
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              onKeyDown={handleSearch}
              placeholder="
                Search bookings, services...
              "
              className="
                provider-search-input
              "
            />

          </div>


          {/* NOTIFICATIONS */}

          <Link
            to="/provider/notifications"
            className="
              provider-notification-btn
            "
            aria-label="Notifications"
          >

            <Bell size={22} />

            {unreadCount > 0 && (

              <div className="
                provider-notification-badge
              ">

                {unreadCount > 99
                  ? "99+"
                  : unreadCount}

              </div>

            )}

          </Link>


          {/* PROFILE */}

          <div
            ref={dropdownRef}
            className="
              provider-profile-dropdown
            "
          >

            <button
              type="button"
              onClick={() =>
                setShowMenu(
                  !showMenu
                )
              }
              className="
                provider-profile-btn
              "
              aria-expanded={showMenu}
            >


              {/* AVATAR */}

              <div className="
                provider-profile-avatar
              ">

                {user?.avatar ? (

                  <img
                    src={user.avatar}
                    alt={
                      user?.full_name ||
                      "Provider"
                    }
                    className="
                      provider-profile-avatar-img
                    "
                  />

                ) : (

                  user?.full_name
                    ?.charAt(0)
                    ?.toUpperCase() ||
                  "U"

                )}

              </div>


              {/* USER INFO */}

              <div className="
                provider-profile-info
              ">

                <h3 className="
                  provider-profile-name
                ">

                  {user?.full_name ||
                    "User"}

                </h3>

                <p className="
                  provider-profile-role
                ">
                  Provider
                </p>

              </div>


              <ChevronDown
                className="
                  provider-chevron-icon
                "
              />

            </button>


            {/* ==================================
                PROFILE DROPDOWN
            ================================== */}

            {showMenu && (

              <div className="
                provider-dropdown-menu
              ">


                <div className="
                  provider-dropdown-header
                ">

                  <h3 className="
                    provider-dropdown-name
                  ">

                    {user?.full_name ||
                      "User"}

                  </h3>

                  <p className="
                    provider-dropdown-email
                  ">

                    {user?.email ||
                      "user@example.com"}

                  </p>

                </div>


                <div className="
                  provider-dropdown-items
                ">


                  <Link
                    to="/provider/profile"
                    className="
                      provider-dropdown-link
                    "
                    onClick={() =>
                      setShowMenu(false)
                    }
                  >

                    <User size={18} />

                    Profile

                  </Link>


                  <Link
                    to="/provider/settings"
                    className="
                      provider-dropdown-link
                    "
                    onClick={() =>
                      setShowMenu(false)
                    }
                  >

                    <Settings size={18} />

                    Settings

                  </Link>


                  <button
                    type="button"
                    onClick={handleLogout}
                    className="
                      provider-dropdown-logout
                    "
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