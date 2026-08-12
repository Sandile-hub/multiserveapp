import { useEffect, useMemo, useState } from "react";
import API from "../../api/axios";
import AdminLayout from "../../layouts/AdminLayout";
import {
  Building2,
  CheckCircle2,
  Search,
  Store,
  XCircle,
  Clock3,
  X,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import "../../styles/Admin.css";

function AdminBusinesses() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectLoading, setRejectLoading] = useState(false);

  // FETCH BUSINESSES
  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      const res = await API.get("/business/all");
      setBusinesses(res.data);
    } catch (error) {
      console.error("Error fetching businesses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  // FILTERED DATA
  const filteredBusinesses = useMemo(() => {
    return businesses.filter(
      (business) =>
        business.business_name?.toLowerCase().includes(search.toLowerCase()) ||
        business.category?.toLowerCase().includes(search.toLowerCase()) ||
        business.full_name?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [businesses, search]);

  // STATS
  const approvedCount = businesses.filter(
    (b) => b.status === "approved",
  ).length;
  const pendingCount = businesses.filter((b) => b.status === "pending").length;
  const rejectedCount = businesses.filter(
    (b) => b.status === "rejected",
  ).length;

  // APPROVE BUSINESS
  const approveBusiness = async (id) => {
    try {
      await API.put(`/business/approve/${id}`);
      fetchBusinesses();
    } catch (error) {
      console.error("Error approving business:", error);
      alert("Failed to approve business");
    }
  };

  // OPEN REJECT MODAL
  const openRejectModal = (business) => {
    setSelectedBusiness(business);
    setRejectionReason("");
  };

  // REJECT BUSINESS
  const rejectBusiness = async () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    try {
      setRejectLoading(true);
      await API.put(`/business/reject/${selectedBusiness.id}`, {
        rejection_reason: rejectionReason,
      });
      setSelectedBusiness(null);
      fetchBusinesses();
    } catch (error) {
      console.error("Error rejecting business:", error);
      alert("Failed to reject business");
    } finally {
      setRejectLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="dashboard-loading">
          <div className="dashboard-loading-content">
            <div className="dashboard-loading-spinner" />
            <p className="dashboard-loading-text">Loading Businesses...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="businesses-header">
        <div>
          <h1 className="businesses-title">Businesses</h1>
          <p className="businesses-subtitle">Manage provider verification</p>
        </div>

        {/* Search */}
        <div className="businesses-search-wrapper">
          <Search size={18} className="businesses-search-icon" />
          <input
            type="text"
            placeholder="Search businesses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="businesses-search-input"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="businesses-stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <p className="stat-card-title">Approved</p>
              <h2 className="stat-card-value">{approvedCount}</h2>
            </div>
            <div className="stat-card-icon-wrapper success">
              <CheckCircle2 size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <p className="stat-card-title">Pending</p>
              <h2 className="stat-card-value">{pendingCount}</h2>
            </div>
            <div className="stat-card-icon-wrapper warning">
              <Clock3 size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <p className="stat-card-title">Rejected</p>
              <h2 className="stat-card-value">{rejectedCount}</h2>
            </div>
            <div className="stat-card-icon-wrapper danger">
              <XCircle size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Businesses Grid */}
      {filteredBusinesses.length === 0 ? (
        <div className="businesses-empty-state">
          <Store size={64} className="businesses-empty-icon" />
          <p className="businesses-empty-text">No businesses found</p>
        </div>
      ) : (
        <div className="businesses-grid">
          {filteredBusinesses.map((business) => (
            <div key={business.id} className="business-card">
              {/* Header */}
              <div className="business-card-header">
                <div className="business-card-info">
                  <div className="business-card-icon">
                    <Store size={28} />
                  </div>
                  <div>
                    <h2 className="business-card-title">
                      {business.business_name}
                    </h2>
                    <p className="business-card-category">
                      {business.category}
                    </p>
                  </div>
                </div>
                <span
                  className={`business-status business-status-${business.status}`}
                >
                  {business.status}
                </span>
              </div>

              {/* Details */}
              <div className="business-card-details">
                <div className="business-card-detail">
                  <span className="business-card-detail-label">Provider:</span>
                  <span>{business.full_name}</span>
                </div>
                <div className="business-card-detail">
                  <span className="business-card-detail-label">City:</span>
                  <span>{business.city}</span>
                </div>
                <div className="business-card-detail">
                  <span className="business-card-detail-label">Email:</span>
                  <span>{business.business_email}</span>
                </div>
                {business.phone && (
                  <div className="business-card-detail">
                    <span className="business-card-detail-label">Phone:</span>
                    <span>{business.phone}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="business-card-description">
                <p>{business.description}</p>
              </div>

              {/* Actions */}
              {business.status === "pending" && (
                <div className="business-card-actions">
                  <button
                    onClick={() => approveBusiness(business.id)}
                    className="business-btn-approve"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => openRejectModal(business)}
                    className="business-btn-reject"
                  >
                    Reject
                  </button>
                </div>
              )}

              {/* Rejection Reason */}
              {business.status === "rejected" && business.rejection_reason && (
                <div className="business-card-rejection">
                  <p className="business-card-rejection-title">
                    Rejection Reason
                  </p>
                  <p className="business-card-rejection-text">
                    {business.rejection_reason}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Rejection Modal */}
      {selectedBusiness && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedBusiness(null)}
        >
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Reject Business</h2>
              <button
                onClick={() => setSelectedBusiness(null)}
                className="modal-close"
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-subtitle">
                Please provide a reason for rejecting this business.
              </p>
              <textarea
                placeholder="Enter rejection reason..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="modal-textarea"
                rows={5}
              />
            </div>
            <div className="modal-actions">
              <button
                onClick={() => setSelectedBusiness(null)}
                className="modal-btn-cancel"
              >
                Cancel
              </button>
              <button
                onClick={rejectBusiness}
                disabled={rejectLoading}
                className="modal-btn-reject"
              >
                {rejectLoading ? "Rejecting..." : "Reject Business"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminBusinesses;
