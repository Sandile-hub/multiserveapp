import { useEffect, useMemo, useState } from "react";
import API from "../../api/axios";
import AdminLayout from "../../layouts/AdminLayout";
import {
  Users,
  Search,
  ShieldCheck,
  UserCheck,
  UserX,
  Trash2,
  Eye,
  X,
  Mail,
  Phone,
  Calendar,
  MapPin,
} from "lucide-react";
import "../../styles/Admin.css";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  // FETCH USERS
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/users");
      setUsers(res.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // FILTER USERS
  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        user.email?.toLowerCase().includes(search.toLowerCase()) ||
        user.role?.toLowerCase().includes(search.toLowerCase()) ||
        user.phone?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [users, search]);

  // STATS
  const totalUsers = users.length;
  const providers = users.filter((user) => user.role === "provider").length;
  const customers = users.filter((user) => user.role === "customer").length;
  const admins = users.filter((user) => user.role === "admin").length;

  // TOGGLE STATUS
  const toggleUserStatus = async (id, currentStatus) => {
    try {
      await API.put(`/admin/users/status/${id}`, {
        is_active: !currentStatus,
      });
      fetchUsers();
    } catch (error) {
      console.error("Error toggling user status:", error);
      alert("Failed to update user status");
    }
  };

  // DELETE USER
  const deleteUser = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user? This action cannot be undone.",
    );
    if (!confirmDelete) return;

    try {
      await API.delete(`/admin/users/${id}`);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user");
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="dashboard-loading">
          <div className="dashboard-loading-content">
            <div className="dashboard-loading-spinner" />
            <p className="dashboard-loading-text">Loading Users...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* HEADER */}
      <div className="users-header">
        <div>
          <h1 className="users-title">Users</h1>
          <p className="users-subtitle">Manage platform users</p>
        </div>

        {/* SEARCH */}
        <div className="users-search-wrapper">
          <Search size={18} className="users-search-icon" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="users-search-input"
          />
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="users-stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <p className="stat-card-title">Total Users</p>
              <h2 className="stat-card-value">{totalUsers}</h2>
            </div>
            <div className="stat-card-icon-wrapper">
              <Users size={24} className="stat-card-icon" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <p className="stat-card-title">Providers</p>
              <h2 className="stat-card-value">{providers}</h2>
            </div>
            <div className="stat-card-icon-wrapper">
              <ShieldCheck size={24} className="stat-card-icon" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <p className="stat-card-title">Customers</p>
              <h2 className="stat-card-value">{customers}</h2>
            </div>
            <div className="stat-card-icon-wrapper">
              <UserCheck size={24} className="stat-card-icon" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <p className="stat-card-title">Admins</p>
              <h2 className="stat-card-value">{admins}</h2>
            </div>
            <div className="stat-card-icon-wrapper">
              <ShieldCheck size={24} className="stat-card-icon" />
            </div>
          </div>
        </div>
      </div>

      {/* USERS TABLE */}
      <div className="users-table-container">
        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="users-table-empty">
                    <div className="users-empty-state">
                      <Users size={48} className="users-empty-icon" />
                      <p>No users found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="users-table-user">
                      <div className="users-user-info">
                        <div className="users-user-avatar">
                          {user.full_name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <h3 className="users-user-name">{user.full_name}</h3>
                          <p className="users-user-email">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`users-role users-role-${user.role}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`users-status ${user.is_active ? "users-status-active" : "users-status-suspended"}`}
                      >
                        {user.is_active ? "Active" : "Suspended"}
                      </span>
                    </td>
                    <td>
                      <div className="users-actions">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="users-action-btn users-action-view"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() =>
                            toggleUserStatus(user.id, user.is_active)
                          }
                          className={`users-action-btn ${user.is_active ? "users-action-suspend" : "users-action-activate"}`}
                          title={
                            user.is_active ? "Suspend User" : "Activate User"
                          }
                        >
                          {user.is_active ? (
                            <UserX size={18} />
                          ) : (
                            <UserCheck size={18} />
                          )}
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="users-action-btn users-action-delete"
                          title="Delete User"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* USER DETAILS MODAL */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div
            className="modal-container user-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 className="modal-title">User Details</h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="modal-close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="user-details">
              {/* Avatar */}
              <div className="user-detail-avatar">
                {selectedUser.full_name?.charAt(0)?.toUpperCase()}
              </div>

              {/* Full Name */}
              <div className="user-detail-field">
                <label>Full Name</label>
                <p>{selectedUser.full_name || "Not provided"}</p>
              </div>

              {/* Email */}
              <div className="user-detail-field">
                <label>
                  <Mail size={14} /> Email
                </label>
                <p>{selectedUser.email || "Not provided"}</p>
              </div>

              {/* Phone */}
              <div className="user-detail-field">
                <label>
                  <Phone size={14} /> Phone
                </label>
                <p>{selectedUser.phone || "Not provided"}</p>
              </div>

              {/* Role */}
              <div className="user-detail-field">
                <label>Role</label>
                <p
                  className={`user-detail-role user-detail-role-${selectedUser.role}`}
                >
                  {selectedUser.role}
                </p>
              </div>

              {/* Status */}
              <div className="user-detail-field">
                <label>Status</label>
                <p
                  className={`user-detail-status ${selectedUser.is_active ? "user-detail-status-active" : "user-detail-status-suspended"}`}
                >
                  {selectedUser.is_active ? "Active" : "Suspended"}
                </p>
              </div>

              {/* Joined Date */}
              <div className="user-detail-field">
                <label>
                  <Calendar size={14} /> Joined
                </label>
                <p>{formatDate(selectedUser.created_at)}</p>
              </div>

              {/* Address (if available) */}
              {selectedUser.address && (
                <div className="user-detail-field">
                  <label>
                    <MapPin size={14} /> Address
                  </label>
                  <p>{selectedUser.address}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminUsers;
