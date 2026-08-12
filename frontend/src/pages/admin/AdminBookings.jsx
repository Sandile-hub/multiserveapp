import { useEffect, useMemo, useState } from "react";
import API from "../../api/axios";
import AdminLayout from "../../layouts/AdminLayout";
import {
  CalendarCheck,
  Search,
  CheckCircle2,
  XCircle,
  Clock3,
  Eye,
  X,
  Calendar,
  CreditCard,
  User,
  Building2,
  DollarSign,
} from "lucide-react";
import "../../styles/Admin.css";

function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);

  // FETCH BOOKINGS
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await API.get("/bookings/admin");
      setBookings(res.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // FILTER BOOKINGS
  const filteredBookings = useMemo(() => {
    return bookings.filter(
      (booking) =>
        booking.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
        booking.service_name?.toLowerCase().includes(search.toLowerCase()) ||
        booking.business_name?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [bookings, search]);

  // STATS
  const totalBookings = bookings.length;
  const acceptedBookings = bookings.filter(
    (booking) => booking.status === "accepted",
  ).length;
  const pendingBookings = bookings.filter(
    (booking) => booking.status === "pending",
  ).length;
  const declinedBookings = bookings.filter(
    (booking) => booking.status === "declined",
  ).length;
  const completedBookings = bookings.filter(
    (booking) => booking.status === "completed",
  ).length;

  // FORMAT DATE
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // GET STATUS CLASS
  const getStatusClass = (status) => {
    switch (status) {
      case "accepted":
        return "booking-status-accepted";
      case "completed":
        return "booking-status-completed";
      case "declined":
        return "booking-status-declined";
      default:
        return "booking-status-pending";
    }
  };

  // GET PAYMENT CLASS
  const getPaymentClass = (status) => {
    return status === "paid" ? "payment-status-paid" : "payment-status-pending";
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="dashboard-loading">
          <div className="dashboard-loading-content">
            <div className="dashboard-loading-spinner" />
            <p className="dashboard-loading-text">Loading Bookings...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* HEADER */}
      <div className="bookings-header">
        <div>
          <h1 className="bookings-title">Bookings</h1>
          <p className="bookings-subtitle">Track all platform bookings</p>
        </div>

        {/* SEARCH */}
        <div className="bookings-search-wrapper">
          <Search size={18} className="bookings-search-icon" />
          <input
            type="text"
            placeholder="Search bookings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bookings-search-input"
          />
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="bookings-stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <p className="stat-card-title">Total</p>
              <h2 className="stat-card-value">{totalBookings}</h2>
            </div>
            <div className="stat-card-icon-wrapper indigo">
              <CalendarCheck size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <p className="stat-card-title">Accepted</p>
              <h2 className="stat-card-value">{acceptedBookings}</h2>
            </div>
            <div className="stat-card-icon-wrapper green">
              <CheckCircle2 size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <p className="stat-card-title">Pending</p>
              <h2 className="stat-card-value">{pendingBookings}</h2>
            </div>
            <div className="stat-card-icon-wrapper yellow">
              <Clock3 size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <p className="stat-card-title">Declined</p>
              <h2 className="stat-card-value">{declinedBookings}</h2>
            </div>
            <div className="stat-card-icon-wrapper red">
              <XCircle size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <p className="stat-card-title">Completed</p>
              <h2 className="stat-card-value">{completedBookings}</h2>
            </div>
            <div className="stat-card-icon-wrapper cyan">
              <Calendar size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* BOOKINGS TABLE */}
      <div className="bookings-table-container">
        <div className="bookings-table-wrapper">
          <table className="bookings-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Service</th>
                <th>Date</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="6" className="bookings-table-empty">
                    <div className="bookings-empty-state">
                      <CalendarCheck
                        size={48}
                        className="bookings-empty-icon"
                      />
                      <p>No bookings found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="bookings-table-cell">
                      <div>
                        <h3 className="bookings-customer-name">
                          {booking.customer_name}
                        </h3>
                        <p className="bookings-business-name">
                          {booking.business_name}
                        </p>
                      </div>
                    </td>
                    <td className="bookings-table-cell">
                      <div>
                        <h3 className="bookings-service-name">
                          {booking.service_name}
                        </h3>
                        <p className="bookings-amount">
                          R{booking.total_amount}
                        </p>
                      </div>
                    </td>
                    <td className="bookings-table-cell">
                      <div>
                        <h3 className="bookings-date">
                          {booking.booking_date}
                        </h3>
                        <p className="bookings-time">{booking.booking_time}</p>
                      </div>
                    </td>
                    <td className="bookings-table-cell">
                      <span
                        className={`booking-status ${getStatusClass(booking.status)}`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="bookings-table-cell">
                      <span
                        className={`payment-status ${getPaymentClass(booking.payment_status)}`}
                      >
                        {booking.payment_status}
                      </span>
                    </td>
                    <td className="bookings-table-cell">
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="bookings-view-btn"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* BOOKING DETAILS MODAL */}
      {selectedBooking && (
        <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
          <div
            className="modal-container booking-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 className="modal-title">Booking Details</h2>
              <button
                onClick={() => setSelectedBooking(null)}
                className="modal-close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="booking-details">
              <div className="booking-details-grid">
                <div className="booking-detail-field">
                  <label>
                    <User size={14} /> Customer
                  </label>
                  <p>{selectedBooking.customer_name}</p>
                </div>

                <div className="booking-detail-field">
                  <label>
                    <Building2 size={14} /> Business
                  </label>
                  <p>{selectedBooking.business_name}</p>
                </div>

                <div className="booking-detail-field">
                  <label>Service</label>
                  <p>{selectedBooking.service_name}</p>
                </div>

                <div className="booking-detail-field">
                  <label>
                    <Calendar size={14} /> Booking Date
                  </label>
                  <p>{selectedBooking.booking_date}</p>
                </div>

                <div className="booking-detail-field">
                  <label>Booking Time</label>
                  <p>{selectedBooking.booking_time}</p>
                </div>

                <div className="booking-detail-field">
                  <label>
                    <DollarSign size={14} /> Total Amount
                  </label>
                  <p className="booking-detail-amount">
                    R{selectedBooking.total_amount}
                  </p>
                </div>

                <div className="booking-detail-field">
                  <label>
                    <CreditCard size={14} /> Payment Method
                  </label>
                  <p>{selectedBooking.payment_method}</p>
                </div>

                <div className="booking-detail-field">
                  <label>Payment Status</label>
                  <span
                    className={`payment-status ${getPaymentClass(selectedBooking.payment_status)}`}
                  >
                    {selectedBooking.payment_status}
                  </span>
                </div>

                <div className="booking-detail-field">
                  <label>Booking Status</label>
                  <span
                    className={`booking-status ${getStatusClass(selectedBooking.status)}`}
                  >
                    {selectedBooking.status}
                  </span>
                </div>
              </div>

              {/* Notes */}
              {selectedBooking.notes && (
                <div className="booking-notes">
                  <label>Notes</label>
                  <p>{selectedBooking.notes}</p>
                </div>
              )}

              {/* Decline Reason */}
              {selectedBooking.decline_reason && (
                <div className="booking-decline-reason">
                  <label>Decline Reason</label>
                  <p>{selectedBooking.decline_reason}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminBookings;
