import { useEffect, useMemo, useState } from "react";
import API from "../../api/axios";
import CustomerSidebar from "../../components/customer/CustomerSidebar";
import CustomerNavbar from "../../components/customer/CustomerNavbar";
import {
  Bell,
  CheckCircle2,
  Sparkles,
  Search,
  CheckCheck,
  Trash2,
  CalendarDays,
  CreditCard,
  Gift,
  AlertCircle,
  Clock3,
  Filter,
  BellRing,
  Loader2,
} from "lucide-react";
import "../../styles/Customer.css";

function CustomerNotifications() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");

  // FETCH NOTIFICATIONS
  const fetchNotifications = async () => {
    try {
      const res = await API.get("/notifications");

      setNotifications(
        Array.isArray(res.data?.notifications) ? res.data.notifications : [],
      );
    } catch (error) {
      console.error("Error fetching notifications:", error);

      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // MARK AS READ
  const markAsRead = async (id) => {
    try {
      await API.put(`/notifications/read/${id}`);
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, is_read: 1 } : item)),
      );
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  // DELETE
  const deleteNotification = async (id) => {
    try {
      await API.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  // FILTERS
  const filters = ["All", "booking", "payment", "promotion", "system"];

  // FILTERED NOTIFICATIONS
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      const matchesSearch =
        item.title?.toLowerCase().includes(search.toLowerCase()) ||
        item.message?.toLowerCase().includes(search.toLowerCase());
      const matchesFilter =
        selectedFilter === "All" || item.type === selectedFilter;
      return matchesSearch && matchesFilter;
    });
  }, [notifications, search, selectedFilter]);

  // GET ICON
  const getIcon = (type) => {
    switch (type) {
      case "booking":
        return <CalendarDays size={24} />;
      case "payment":
        return <CreditCard size={24} />;
      case "promotion":
        return <Gift size={24} />;
      case "system":
        return <AlertCircle size={24} />;
      default:
        return <Bell size={24} />;
    }
  };

  // GET STYLES
  const getStyles = (type) => {
    switch (type) {
      case "booking":
        return "notification-icon-booking";
      case "payment":
        return "notification-icon-payment";
      case "promotion":
        return "notification-icon-promotion";
      case "system":
        return "notification-icon-system";
      default:
        return "notification-icon-default";
    }
  };

  // STATS
  const unreadCount = notifications.filter(
    (item) => !Number(item.is_read),
  ).length;

  // LOADING
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <Loader2 size={55} className="spinner text-cyan" />
          <p className="loading-text">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-dashboard">
      <CustomerSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="customer-main">
        <CustomerNavbar
          toggleSidebar={() => setSidebarOpen((previous) => !previous)}
        />

        <div className="customer-main-content">
          {/* HERO SECTION */}
          <div className="notifications-hero">
            <div className="notifications-hero-bg-1" />
            <div className="notifications-hero-bg-2" />
            <div className="notifications-hero-content">
              <div>
                <div className="notifications-hero-badge">
                  <Sparkles size={16} />
                  Real Notifications
                </div>
                <h1 className="notifications-hero-title">Notifications</h1>
                <p className="notifications-hero-description">
                  Stay updated with your latest bookings, payments, and account
                  activity.
                </p>
              </div>

              {/* STATS */}
              <div className="notifications-stats">
                <div className="notifications-stat-card">
                  <BellRing className="notifications-stat-icon" />
                  <p className="notifications-stat-label">Total Alerts</p>
                  <h2 className="notifications-stat-value">
                    {notifications.length}
                  </h2>
                </div>
                <div className="notifications-stat-card">
                  <CheckCheck className="notifications-stat-icon check" />
                  <p className="notifications-stat-label">Unread</p>
                  <h2 className="notifications-stat-value unread">
                    {unreadCount}
                  </h2>
                </div>
              </div>
            </div>
          </div>

          {/* SEARCH & FILTERS */}
          <div className="notifications-search-container">
            <div className="notifications-search-wrapper">
              <div className="notifications-search-input-wrapper">
                <Search className="notifications-search-icon" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="notifications-search-input"
                />
              </div>
              <button className="notifications-filter-btn">
                <Filter size={20} />
                Filters
              </button>
            </div>

            {/* FILTER BUTTONS */}
            <div className="notifications-filters">
              {filters.map((item, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedFilter(item)}
                  className={`notifications-filter-chip ${
                    selectedFilter === item
                      ? "notifications-filter-chip-active"
                      : ""
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* NOTIFICATIONS LIST */}
          <div className="notifications-list">
            {filteredNotifications.map((item) => (
              <div
                key={item.id}
                className={`notification-item ${
                  !Number(item.is_read) ? "notification-item-unread" : ""
                }`}
              >
                <div className="notification-content">
                  {/* ICON */}
                  <div className={`notification-icon ${getStyles(item.type)}`}>
                    {getIcon(item.type)}
                  </div>

                  {/* CONTENT */}
                  <div className="notification-text">
                    <div className="notification-header">
                      <div className="notification-title-wrapper">
                        <h2 className="notification-title">{item.title}</h2>
                        {!Number(item.is_read) && (
                          <span className="notification-badge">NEW</span>
                        )}
                      </div>
                      <div className="notification-time">
                        <Clock3 size={14} />
                        {new Date(item.created_at).toLocaleString()}
                      </div>
                    </div>
                    <p className="notification-message">{item.message}</p>
                  </div>

                  {/* ACTIONS */}
                  <div className="notification-actions">
                    {!Number(item.is_read) && (
                      <button
                        onClick={() => markAsRead(item.id)}
                        className="notification-action-btn read"
                      >
                        <CheckCircle2 size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(item.id)}
                      className="notification-action-btn delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* EMPTY STATE */}
          {filteredNotifications.length === 0 && (
            <div className="notifications-empty">
              <Bell size={80} className="notifications-empty-icon" />
              <h2 className="notifications-empty-title">No Notifications</h2>
              <p className="notifications-empty-text">
                No notifications found.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CustomerNotifications;
