import { useEffect, useMemo, useState } from "react";
import API from "../../api/axios";
import ProviderSidebar from "../../components/provider/ProviderSidebar";
import ProviderNavbar from "../../components/provider/ProviderNavbar";
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Clock3,
  Loader2,
  Search,
  Filter,
  Sparkles,
  Trash2,
  Check,
  Mail,
} from "lucide-react";
import "../../styles/Provider.css";

function ProviderNotifications() {
  const [sidebarOpen, setSidebarOpen] =
  useState(false)
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  // FETCH NOTIFICATIONS
  const fetchNotifications = async () => {
    try {
const res = await API.get("/notifications");

setNotifications(
  Array.isArray(res.data?.notifications)
    ? res.data.notifications
    : []
);
    } catch (error) {
      console.error("Error fetching notifications:", error);
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
        prev.map((notification) =>
          notification.id === id
            ? { ...notification, is_read: 1 }
            : notification,
        ),
      );
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  // DELETE NOTIFICATION
  const deleteNotification = async (id) => {
    try {
      await API.delete(`/notifications/${id}`);
      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== id),
      );
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  // FILTERED NOTIFICATIONS
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      const matchesSearch =
        notification.title?.toLowerCase().includes(search.toLowerCase()) ||
        notification.message?.toLowerCase().includes(search.toLowerCase());
      const matchesFilter =
        filter === "all"
          ? true
          : filter === "read"
            ? notification.is_read
            : !notification.is_read;
      return matchesSearch && matchesFilter;
    });
  }, [notifications, search, filter]);

  // STATS
  const totalNotifications = notifications.length;
  const unreadNotifications = notifications.filter(
    (notification) => !notification.is_read,
  ).length;
  const readNotifications = notifications.filter(
    (notification) => notification.is_read,
  ).length;

  // LOADING
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <Loader2 size={30} className="spinner" />
          <span>Loading notifications...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="provider-dashboard">
      <ProviderSidebar
  isOpen={sidebarOpen}
  onClose={() =>
    setSidebarOpen(false)
  }
/>

      <div className="provider-main">
        <ProviderNavbar
  toggleSidebar={() =>
    setSidebarOpen(
      (previous) => !previous
    )
  }
/>

        <div className="provider-main-content">
          {/* HERO SECTION */}
          <div className="provider-notifications-hero">
            <div className="provider-notifications-hero-bg" />
            <div className="provider-notifications-hero-content">
              <div className="provider-notifications-hero-badge">
                <Sparkles size={16} />
                Notification Center
              </div>
              <h1 className="provider-notifications-hero-title">
                Provider Notifications 🔔
              </h1>
              <p className="provider-notifications-hero-description">
                Monitor realtime alerts, bookings, payments, reviews and
                customer activity instantly.
              </p>
            </div>
          </div>

          {/* STATS CARDS */}
          <div className="provider-notifications-stats">
            <div className="stat-card">
              <div className="stat-card-icon indigo">
                <Bell size={24} />
              </div>
              <h2 className="stat-card-value">{totalNotifications}</h2>
              <p className="stat-card-label">Total notifications</p>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon yellow">
                <AlertCircle size={24} />
              </div>
              <h2 className="stat-card-value yellow">{unreadNotifications}</h2>
              <p className="stat-card-label">Unread notifications</p>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon green">
                <CheckCircle2 size={24} />
              </div>
              <h2 className="stat-card-value green">{readNotifications}</h2>
              <p className="stat-card-label">Read notifications</p>
            </div>
          </div>

          {/* FILTER BAR */}
          <div className="provider-notifications-filter">
            <div className="provider-notifications-search">
              <Search
                size={18}
                className="provider-notifications-search-icon"
              />
              <input
                type="text"
                placeholder="Search notifications..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="provider-notifications-search-input"
              />
            </div>
            <div className="provider-notifications-filter-select">
              <div className="provider-notifications-filter-icon">
                <Filter size={18} />
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="provider-notifications-select"
              >
                <option value="all">All Notifications</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
            </div>
          </div>

          {/* NOTIFICATIONS LIST */}
          {filteredNotifications.length > 0 ? (
            <div className="provider-notifications-list">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-card ${!notification.is_read ? "notification-card-unread" : ""}`}
                >
                  <div className="notification-content">
                    {/* LEFT */}
                    <div className="notification-left">
                      <div
                        className={`notification-icon ${notification.is_read ? "notification-icon-read" : "notification-icon-unread"}`}
                      >
                        {notification.is_read ? (
                          <CheckCircle2 size={24} />
                        ) : (
                          <Mail size={24} />
                        )}
                      </div>
                      <div>
                        <div className="notification-header">
                          <h2 className="notification-title">
                            {notification.title}
                          </h2>
                          {!notification.is_read && (
                            <span className="notification-badge">NEW</span>
                          )}
                        </div>
                        <p className="notification-message">
                          {notification.message}
                        </p>
                        <div className="notification-time">
                          <Clock3 size={14} />
                          {new Date(notification.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="notification-actions">
                      {!notification.is_read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="notification-btn-read"
                        >
                          <Check size={16} />
                          Mark Read
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="notification-btn-delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="provider-notifications-empty">
              <div className="provider-notifications-empty-icon">
                <Bell size={48} />
              </div>
              <h2 className="provider-notifications-empty-title">
                No Notifications
              </h2>
              <p className="provider-notifications-empty-text">
                Provider notifications, booking updates and payment alerts will
                appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProviderNotifications;
