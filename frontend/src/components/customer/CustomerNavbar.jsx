import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import API from "../../api/axios";

import {
  Bell,
  Search,
  UserCircle2,
  Settings,
  LogOut,
  CalendarDays,
  ChevronDown,
  Sparkles,
  Wallet,
  Plus,
  X,
} from "lucide-react";

import "../../styles/Customer.css";

function CustomerNavbar() {
  const navigate = useNavigate();

  const location = useLocation();

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user") || "{}")
  );

  // ====================================
  // STATES
  // ====================================

  const [search, setSearch] = useState("");

  const [menuOpen, setMenuOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);

  const [loading, setLoading] = useState(true);

  const [walletBalance, setWalletBalance] = useState(0);

  const [showTopUp, setShowTopUp] = useState(false);

  const [amount, setAmount] = useState("");

  const [walletLoading, setWalletLoading] = useState(false);

  // ====================================
  // PAGE TITLE
  // ====================================

  const pageTitle = useMemo(() => {
    const pathname = location.pathname;

    if (pathname.includes("/customer/bookings")) {
      return "My Bookings";
    }

    if (pathname.includes("/customer/payments")) {
      return "Payments";
    }

    if (pathname.includes("/customer/wallet")) {
      return "My Wallet";
    }

    if (pathname.includes("/customer/notifications")) {
      return "Notifications";
    }

    if (pathname.includes("/customer/profile")) {
      return "My Profile";
    }

    if (pathname.includes("/customer/settings")) {
      return "Settings";
    }

    return "Customer Dashboard";
  }, [location.pathname]);

  // ====================================
  // FETCH NOTIFICATIONS
  // ====================================

  const fetchNotifications = async () => {
    try {
      const res = await API.get("/notifications");

      const data = Array.isArray(res.data)
        ? res.data
        : res.data.notifications || [];

      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // ====================================
  // FETCH WALLET
  // ====================================

  const fetchWallet = async () => {
    try {
      const res = await API.get("/wallet");

      setWalletBalance(res.data.balance || 0);
    } catch (error) {
      console.error("Wallet error:", error);
    }
  };

  // ====================================
  // REFRESH USER
  // ====================================

  const refreshUser = () => {
    const updatedUser = JSON.parse(
      localStorage.getItem("user") || "{}"
    );

    setUser(updatedUser);
  };

  // ====================================
  // HANDLE TOP UP
  // ====================================

  const handleTopUp = async () => {
    if (!amount || Number(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    try {
      setWalletLoading(true);

      const res = await API.post("/yoco/checkout", {
        amount,
      });

      if (res.data?.redirectUrl) {
        window.location.href = res.data.redirectUrl;
      }
    } catch (error) {
      console.error("Top up error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to initiate payment"
      );
    } finally {
      setWalletLoading(false);
    }
  };

  // ====================================
  // INITIAL LOAD
  // ====================================

  useEffect(() => {
    fetchNotifications();

    fetchWallet();

    refreshUser();

    // AUTO REFRESH USER IMAGE
    const interval = setInterval(() => {
      refreshUser();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // ====================================
  // UNREAD COUNT
  // ====================================

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  // ====================================
  // LOGOUT
  // ====================================

  const handleLogout = () => {
    localStorage.removeItem("token");

    localStorage.removeItem("user");

    navigate("/login");
  };

  // ====================================
  // HANDLE SEARCH
  // ====================================

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter" && search.trim()) {
      navigate(`/customer/search?q=${search}`);

      setSearch("");
    }
  };

  return (
    <>
      <div className="customer-navbar">
        <div className="customer-navbar-container">
          {/* LEFT SECTION */}

          <div className="customer-navbar-left">
            <div className="customer-badge">
              <Sparkles size={16} />
              Customer Panel
            </div>

            <h1 className="customer-page-title">
              {pageTitle}
            </h1>

            <p className="customer-page-subtitle">
              Book and manage services easily
            </p>
          </div>

          {/* RIGHT SECTION */}

          <div className="customer-navbar-right">
            {/* SEARCH BAR */}

            <div className="customer-search-wrapper">
              <Search className="customer-search-icon" />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                onKeyDown={handleSearchKeyDown}
                placeholder="Search services..."
                className="customer-search-input"
              />
            </div>

            {/* BOOKINGS BUTTON */}

            <button
              onClick={() =>
                navigate("/customer/bookings")
              }
              className="customer-bookings-btn"
            >
              <CalendarDays size={20} />

              <span>My Bookings</span>
            </button>

            {/* WALLET BUTTON */}

            <div className="customer-wallet-wrapper">
              <button
                onClick={() =>
                  navigate("/customer/wallet")
                }
                className="customer-wallet-btn"
              >
                <div className="wallet-glow" />

                <Wallet
                  size={22}
                  className="customer-wallet-icon"
                />

                <div className="customer-wallet-info">
                  <span className="customer-wallet-label">
                    MultiServe Wallet
                  </span>

                  <strong className="customer-wallet-balance">
                    R
                    {Number(
                      walletBalance || 0
                    ).toFixed(2)}
                  </strong>
                </div>
              </button>

              {/* MINI TOPUP */}

              <button
                onClick={() =>
                  setShowTopUp(true)
                }
                className="wallet-topup-mini-btn"
              >
                <Plus size={15} />
              </button>
            </div>

            {/* NOTIFICATIONS */}

            <button
              onClick={() =>
                navigate(
                  "/customer/notifications"
                )
              }
              className="customer-notification-btn"
            >
              <Bell size={20} />

              {!loading &&
                unreadCount > 0 && (
                  <div className="customer-notification-badge">
                    {unreadCount > 9
                      ? "9+"
                      : unreadCount}
                  </div>
                )}
            </button>

            {/* PROFILE MENU */}

            <div className="customer-profile-dropdown">
              <button
                onClick={() =>
                  setMenuOpen(!menuOpen)
                }
                className="customer-profile-btn"
              >
                {/* PROFILE IMAGE */}

                {user?.profile_image ? (
                  <img
                    src={user.profile_image}
                    alt="Profile"
                    className="customer-profile-avatar-image"
                    onError={(e) => {
                      e.target.style.display =
                        "none";
                    }}
                  />
                ) : (
                  <div className="customer-profile-avatar">
                    {user?.full_name
                      ?.charAt(0)
                      ?.toUpperCase() || "U"}
                  </div>
                )}

                <div className="customer-profile-info">
                  <h3 className="customer-profile-name">
                    {user?.full_name || "User"}
                  </h3>

                  <p className="customer-profile-role">
                    Customer
                  </p>
                </div>

                <ChevronDown
                  className="customer-chevron"
                  size={18}
                />
              </button>

              {/* DROPDOWN MENU */}

              {menuOpen && (
                <div className="customer-dropdown">
                  <div className="customer-dropdown-header">
                    <div className="customer-dropdown-user">
                      {user?.profile_image ? (
                        <img
                          src={user.profile_image}
                          alt="Profile"
                          className="customer-dropdown-avatar-image"
                          onError={(e) => {
                            e.target.style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <div className="customer-dropdown-avatar">
                          {user?.full_name
                            ?.charAt(0)
                            ?.toUpperCase() || "U"}
                        </div>
                      )}

                      <div>
                        <h3 className="customer-dropdown-name">
                          {user?.full_name ||
                            "User"}
                        </h3>

                        <p className="customer-dropdown-email">
                          {user?.email ||
                            "user@example.com"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="customer-dropdown-items">
                    <button
                      onClick={() => {
                        setMenuOpen(false);

                        navigate(
                          "/customer/profile"
                        );
                      }}
                      className="customer-dropdown-item"
                    >
                      <UserCircle2 size={18} />
                      Profile
                    </button>

                    <button
                      onClick={() => {
                        setMenuOpen(false);

                        navigate(
                          "/customer/settings"
                        );
                      }}
                      className="customer-dropdown-item"
                    >
                      <Settings size={18} />
                      Settings
                    </button>

                    <button
                      onClick={handleLogout}
                      className="customer-dropdown-item logout"
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
      </div>

      {/* ==================================
          TOP UP MODAL
      ================================== */}

      {showTopUp && (
        <div className="wallet-modal-overlay">
          <div className="wallet-modal">
            {/* CLOSE */}

            <button
              onClick={() =>
                setShowTopUp(false)
              }
              className="wallet-modal-close"
            >
              <X size={20} />
            </button>

            {/* HEADER */}

            <div className="wallet-modal-header">
              <div className="wallet-modal-icon">
                <Wallet size={32} />
              </div>

              <h2>Top Up Wallet</h2>

              <p>
                Fund your MultiServe wallet
                securely
              </p>
            </div>

            {/* BODY */}

            <div className="wallet-modal-body">
              <label className="wallet-modal-label">
                Enter Amount
              </label>

              <input
                type="number"
                placeholder="e.g 100"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value)
                }
                className="wallet-modal-input"
              />

              {/* QUICK AMOUNTS */}

              <div className="wallet-quick-amounts">
                {[50, 100, 200, 500].map(
                  (value) => (
                    <button
                      key={value}
                      onClick={() =>
                        setAmount(value)
                      }
                      className="wallet-quick-btn"
                    >
                      R{value}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* ACTIONS */}

            <div className="wallet-modal-actions">
              <button
                onClick={() => {
                  setShowTopUp(false);

                  setAmount("");
                }}
                className="wallet-cancel-btn"
              >
                Cancel
              </button>

              <button
                onClick={handleTopUp}
                disabled={walletLoading}
                className="wallet-confirm-btn"
              >
                {walletLoading
                  ? "Processing..."
                  : "Continue Payment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CustomerNavbar;