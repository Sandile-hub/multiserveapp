import { useEffect, useMemo, useState } from "react";
import API from "../../api/axios";
import AdminLayout from "../../layouts/AdminLayout";
import {
  Bell,
  Search,
  CheckCheck,
  Trash2,
  Eye,
  X,
  RefreshCcw,
  MailOpen,
  Mail,
  Clock,
} from "lucide-react";
import "../../styles/Admin.css";

function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedNotification, setSelectedNotification] = useState(null);

  // FETCH NOTIFICATIONS
  const fetchNotifications = async () => {
    try {
      const res = await API.get("/notifications/admin");
      setNotifications(
        Array.isArray(res.data) ? res.data : res.data.notifications || [],
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

  // FILTER NOTIFICATIONS
  const filteredNotifications = useMemo(() => {
    return notifications.filter(
      (notification) =>
        notification.title?.toLowerCase().includes(search.toLowerCase()) ||
        notification.message?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [notifications, search]);

  // STATS
  const totalNotifications = notifications.length;
  const unreadNotifications = notifications.filter(
    (notification) => !notification.is_read,
  ).length;
  const readNotifications = notifications.filter(
    (notification) => notification.is_read,
  ).length;

  // MARK AS READ
  const markAsRead = async (id) => {
    try {
      await API.put(`/notifications/read/${id}`);
      fetchNotifications();
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  // MARK ALL READ
  const markAllRead = async () => {
    try {
      await API.put("/notifications/read-all");
      fetchNotifications();
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  // DELETE NOTIFICATION
  const deleteNotification = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this notification?",
    );
    if (!confirmDelete) return;
    try {
      await API.delete(`/notifications/delete/${id}`);
      fetchNotifications();
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  // FORMAT DATE
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="dashboard-loading">
          <div className="dashboard-loading-content">
            <div className="dashboard-loading-spinner" />
            <p className="dashboard-loading-text">Loading Notifications...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* HEADER */}
      <div className="notifications-header">
        <div>
          <h1 className="notifications-title">Notifications</h1>
          <p className="notifications-subtitle">
            Manage platform alerts and updates
          </p>
        </div>

        {/* ACTIONS */}
        <div className="notifications-actions">
          {/* SEARCH */}
          <div className="notifications-search-wrapper">
            <Search size={18} className="notifications-search-icon" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="notifications-search-input"
            />
          </div>

          {/* REFRESH */}
          <button
            onClick={fetchNotifications}
            className="notifications-refresh-btn"
            title="Refresh"
          >
            <RefreshCcw size={18} />
          </button>

          {/* MARK ALL READ */}
          <button onClick={markAllRead} className="notifications-markall-btn">
            <CheckCheck size={18} />
            Mark All Read
          </button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="notifications-stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <p className="stat-card-title">Total</p>
              <h2 className="stat-card-value">{totalNotifications}</h2>
            </div>
            <div className="stat-card-icon-wrapper indigo">
              <Bell size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <p className="stat-card-title">Unread</p>
              <h2 className="stat-card-value">{unreadNotifications}</h2>
            </div>
            <div className="stat-card-icon-wrapper yellow">
              <Mail size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <p className="stat-card-title">Read</p>
              <h2 className="stat-card-value">{readNotifications}</h2>
            </div>
            <div className="stat-card-icon-wrapper green">
              <MailOpen size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* NOTIFICATIONS LIST */}
      <div className="notifications-list">
        {filteredNotifications.length === 0 ? (
          <div className="notifications-empty">
            <Bell size={60} className="notifications-empty-icon" />
            <h2 className="notifications-empty-title">No Notifications</h2>
            <p className="notifications-empty-text">No notifications found</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-card ${!notification.is_read ? "notification-card-unread" : ""}`}
            >
              <div className="notification-card-content">
                {/* LEFT - Icon & Info */}
                <div className="notification-info">
                  <div
                    className={`notification-icon ${!notification.is_read ? "notification-icon-unread" : ""}`}
                  >
                    <Bell size={22} />
                  </div>
                  <div className="notification-details">
                    <div className="notification-header">
                      <h3 className="notification-title">
                        {notification.title}
                      </h3>
                      {!notification.is_read && (
                        <span className="notification-badge">New</span>
                      )}
                    </div>
                    <p className="notification-message">
                      {notification.message}
                    </p>
                    <div className="notification-time">
                      <Clock size={14} />
                      <span>{formatDate(notification.created_at)}</span>
                    </div>
                  </div>
                </div>

                {/* RIGHT - Actions */}
                <div className="notification-actions">
                  <button
                    onClick={() => setSelectedNotification(notification)}
                    className="notification-action-btn view"
                    title="View Details"
                  >
                    <Eye size={18} />
                  </button>
                  {!notification.is_read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="notification-action-btn mark"
                      title="Mark as Read"
                    >
                      <CheckCheck size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="notification-action-btn delete"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* NOTIFICATION MODAL */}
      {selectedNotification && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedNotification(null)}
        >
          <div
            className="modal-container notification-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 className="modal-title">Notification Details</h2>
              <button
                onClick={() => setSelectedNotification(null)}
                className="modal-close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="notification-detail">
              <div className="notification-detail-field">
                <label>Title</label>
                <p>{selectedNotification.title}</p>
              </div>

              <div className="notification-detail-field">
                <label>Message</label>
                <div className="notification-detail-message">
                  <p>{selectedNotification.message}</p>
                </div>
              </div>

              <div className="notification-detail-field">
                <label>Status</label>
                <span
                  className={`notification-status ${selectedNotification.is_read ? "status-read" : "status-unread"}`}
                >
                  {selectedNotification.is_read ? "Read" : "Unread"}
                </span>
              </div>

              <div className="notification-detail-field">
                <label>Created At</label>
                <p>{formatDate(selectedNotification.created_at)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminNotifications;
