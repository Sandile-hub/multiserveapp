import { useEffect, useState } from "react";
import API from "../../api/axios";
import ProviderSidebar from "../../components/provider/ProviderSidebar";
import ProviderNavbar from "../../components/provider/ProviderNavbar";
import {
  CalendarDays,
  Clock3,
  User,
  CreditCard,
  CheckCircle2,
  XCircle,
  Loader2,
  MessageSquareWarning,
  Sparkles,
} from "lucide-react";
import "../../styles/Provider.css";

function ProviderBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [declineModal, setDeclineModal] = useState(null);
  const [declineReason, setDeclineReason] = useState("");

  // FETCH BOOKINGS
  const fetchBookings = async () => {
    try {
      const res = await API.get("/bookings/provider");
      setBookings(res.data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // ACCEPT BOOKING
  const handleAccept = async (id) => {
    try {
      setProcessingId(id);
      await API.put(`/bookings/accept/${id}`);
      fetchBookings();
    } catch (error) {
      console.error("Error accepting booking:", error);
    } finally {
      setProcessingId(null);
    }
  };

  // DECLINE BOOKING
  const handleDecline = async () => {
    if (!declineReason.trim()) {
      alert("Please provide a decline reason");
      return;
    }
    try {
      setProcessingId(declineModal);
      await API.put(`/bookings/decline/${declineModal}`, {
        decline_reason: declineReason,
      });
      fetchBookings();
      setDeclineReason("");
      setDeclineModal(null);
    } catch (error) {
      console.error("Error declining booking:", error);
    } finally {
      setProcessingId(null);
    }
  };

  // CALCULATE STATS
  const totalBookings = bookings.length;
  const pendingCount = bookings.filter(
    (booking) => booking.status === "pending",
  ).length;
  const acceptedCount = bookings.filter(
    (booking) => booking.status === "accepted",
  ).length;

  // LOADING
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <Loader2 size={30} className="spinner" />
          <span>Loading bookings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="provider-dashboard">
      <ProviderSidebar />

      <div className="provider-main">
        <ProviderNavbar />

        <div className="provider-main-content">
          {/* HERO SECTION */}
          <div className="provider-bookings-hero">
            <div className="provider-bookings-hero-bg" />
            <div className="provider-bookings-hero-content">
              <div className="provider-bookings-hero-badge">
                <Sparkles size={16} />
                Bookings Management
              </div>
              <h1 className="provider-bookings-hero-title">
                Booking Requests 📅
              </h1>
              <p className="provider-bookings-hero-description">
                Manage customer bookings, approve appointments and monitor
                realtime service requests.
              </p>
            </div>
          </div>

          {/* STATS CARDS */}
          <div className="provider-bookings-stats">
            <div className="stat-card">
              <h3 className="stat-card-label">Total Bookings</h3>
              <h2 className="stat-card-value">{totalBookings}</h2>
            </div>
            <div className="stat-card">
              <h3 className="stat-card-label">Pending</h3>
              <h2 className="stat-card-value pending">{pendingCount}</h2>
            </div>
            <div className="stat-card">
              <h3 className="stat-card-label">Accepted</h3>
              <h2 className="stat-card-value accepted">{acceptedCount}</h2>
            </div>
          </div>

          {/* BOOKINGS GRID */}
          {bookings.length > 0 ? (
            <div className="provider-bookings-grid">
              {bookings.map((booking) => (
                <div key={booking.id} className="provider-booking-card">
                  {/* Card Header */}
                  <div className="provider-booking-card-header">
                    <div>
                      <h2 className="provider-booking-title">
                        {booking.service_name}
                      </h2>
                      <div
                        className={`provider-booking-status provider-booking-status-${booking.status}`}
                      >
                        {booking.status}
                      </div>
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div className="provider-booking-details">
                    <div className="provider-booking-detail">
                      <User
                        size={16}
                        className="provider-booking-detail-icon"
                      />
                      <span>{booking.customer_name}</span>
                    </div>
                    <div className="provider-booking-detail">
                      <CalendarDays
                        size={16}
                        className="provider-booking-detail-icon"
                      />
                      <span>{booking.booking_date}</span>
                    </div>
                    <div className="provider-booking-detail">
                      <Clock3
                        size={16}
                        className="provider-booking-detail-icon"
                      />
                      <span>{booking.booking_time}</span>
                    </div>
                    <div className="provider-booking-detail">
                      <CreditCard
                        size={16}
                        className="provider-booking-detail-icon"
                      />
                      <span className="capitalize">
                        {booking.payment_method}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {booking.status === "pending" && (
                    <div className="provider-booking-actions">
                      <button
                        onClick={() => handleAccept(booking.id)}
                        disabled={processingId === booking.id}
                        className="provider-booking-btn-accept"
                      >
                        {processingId === booking.id ? (
                          <Loader2 size={18} className="spinner" />
                        ) : (
                          <>
                            <CheckCircle2 size={18} />
                            Accept
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setDeclineModal(booking.id)}
                        className="provider-booking-btn-decline"
                      >
                        <XCircle size={18} />
                        Decline
                      </button>
                    </div>
                  )}

                  {/* Decline Reason */}
                  {booking.status === "declined" && (
                    <div className="provider-booking-decline">
                      <div className="provider-booking-decline-header">
                        <MessageSquareWarning
                          size={16}
                          className="provider-booking-decline-icon"
                        />
                        <h3 className="provider-booking-decline-title">
                          Decline Reason
                        </h3>
                      </div>
                      <p className="provider-booking-decline-text">
                        {booking.decline_reason}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="provider-bookings-empty">
              <div className="provider-bookings-empty-icon">
                <CalendarDays size={48} />
              </div>
              <h2 className="provider-bookings-empty-title">No Bookings Yet</h2>
              <p className="provider-bookings-empty-text">
                Customer booking requests will appear here once users start
                booking your services.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* DECLINE MODAL */}
      {declineModal && (
        <div className="modal-overlay" onClick={() => setDeclineModal(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Decline Booking</h2>
            <p className="modal-subtitle">
              Provide a reason for declining this booking.
            </p>
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="Enter decline reason..."
              className="modal-textarea"
            />
            <div className="modal-actions">
              <button
                onClick={() => {
                  setDeclineModal(null);
                  setDeclineReason("");
                }}
                className="modal-btn-cancel"
              >
                Cancel
              </button>
              <button onClick={handleDecline} className="modal-btn-decline">
                Decline Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProviderBookings;
