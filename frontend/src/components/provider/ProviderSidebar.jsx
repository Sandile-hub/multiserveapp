import {
  LayoutDashboard,
  Briefcase,
  CalendarCheck,
  MessageCircle,
  Star,
  CreditCard,
  Settings,
  Bell,
  X,
} from "lucide-react"

import {
  Link,
  useLocation,
} from "react-router-dom"

import "../../styles/Provider.css"


function ProviderSidebar({
  isOpen = false,
  onClose = () => {},
}) {

  const location =
    useLocation()


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


  const handleNavigation = () => {

    // Close sidebar after selecting
    // a page on mobile/tablet.

    if (window.innerWidth < 1024) {
      onClose()
    }

  }


  return (

    <>

      {/* =====================================
          MOBILE OVERLAY
      ===================================== */}

      {isOpen && (

        <button
          type="button"
          aria-label="Close provider sidebar"
          className="provider-sidebar-overlay"
          onClick={onClose}
        />

      )}


      {/* =====================================
          SIDEBAR
      ===================================== */}

      <aside
        className={`
          provider-sidebar
          ${isOpen
            ? "provider-sidebar-open"
            : "provider-sidebar-closed"
          }
        `}
      >

        {/* ===================================
            MOBILE CLOSE BUTTON
        =================================== */}

        <button
          type="button"
          onClick={onClose}
          className="
            provider-sidebar-close
          "
          aria-label="Close sidebar"
        >

          <X size={22} />

        </button>


        {/* ===================================
            HEADER
        =================================== */}

        <div className="
          provider-sidebar-header
        ">

          <h1 className="
            provider-sidebar-logo
          ">

            MultiServe

          </h1>

          <p className="
            provider-sidebar-subtitle
          ">

            Provider Panel

          </p>

        </div>


        {/* ===================================
            NAVIGATION
        =================================== */}

        <nav className="
          provider-sidebar-nav
        ">

          {menuItems.map(
            (item) => {

              const Icon =
                item.icon

              const isActive =
                location.pathname ===
                item.path


              return (

                <Link
                  key={item.path}
                  to={item.path}
                  onClick={
                    handleNavigation
                  }
                  className={`
                    provider-nav-item

                    ${
                      isActive
                        ? "provider-nav-item-active"
                        : ""
                    }
                  `}
                >

                  <Icon
                    size={20}
                  />

                  <span>
                    {item.title}
                  </span>

                </Link>

              )

            }
          )}

        </nav>


        {/* ===================================
            FOOTER
        =================================== */}

        <div className="
          provider-sidebar-footer
        ">

          <div className="
            provider-sidebar-version
          ">

            MultiServe

            <span>
              Version 1.0.0
            </span>

          </div>

        </div>

      </aside>

    </>
  )
}


export default ProviderSidebar