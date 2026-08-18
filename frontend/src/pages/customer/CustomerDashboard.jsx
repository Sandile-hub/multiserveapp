import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../api/axios";
import CustomerSidebar from "../../components/customer/CustomerSidebar";
import CustomerNavbar from "../../components/customer/CustomerNavbar";
import {
  CalendarCheck2,
  CreditCard,
  Bell,
  Search,
  Star,
  Wallet,
  Clock3,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Loader2,
} from "lucide-react";
import "../../styles/Customer.css";

function CustomerDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    bookings: 0,
    completed: 0,
    pending: 0,
    payments: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);

  // FETCH DASHBOARD
  const fetchDashboard = async () => {
    try {
      const res = await API.get("/analytics/customer");
      setStats(res.data.stats);
      setRecentBookings(res.data.recentBookings || []);
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // LOADING
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <Loader2 className="spinner" size={24} />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-dashboard">
      {/* SIDEBAR */}
      <CustomerSidebar
  isOpen={sidebarOpen}
  onClose={() => setSidebarOpen(false)}
/>

      {/* MAIN CONTENT */}
      <div className="customer-main">
        {/* NAVBAR */}
        <CustomerNavbar
  toggleSidebar={() =>
    setSidebarOpen((previous) => !previous)
  }
/>

        {/* PAGE CONTENT */}
        <div className="customer-main-content">
          {/* HERO SECTION */}
          <div className="customer-hero">
            <div className="customer-hero-bg" />
            <div className="customer-hero-content">
              <div className="customer-hero-badge">
                <Sparkles size={16} />
                Customer Dashboard
              </div>
              <h1 className="customer-hero-title">Welcome Back 👋</h1>
              <p className="customer-hero-description">
                Browse services, manage bookings, track payments and monitor
                your activities.
              </p>
            </div>
          </div>

          {/* STATS GRID */}
          <div className="customer-stats-grid">
            {/* Total Bookings */}
            <div className="customer-stat-card">
              <div className="customer-stat-icon cyan">
                <CalendarCheck2 size={28} />
              </div>
              <h2 className="customer-stat-value">{stats.bookings}</h2>
              <p className="customer-stat-label">Total Bookings</p>
            </div>

            {/* Completed */}
            <div className="customer-stat-card">
              <div className="customer-stat-icon green">
                <CheckCircle2 size={28} />
              </div>
              <h2 className="customer-stat-value">{stats.completed}</h2>
              <p className="customer-stat-label">Completed</p>
            </div>

            {/* Pending */}
            <div className="customer-stat-card">
              <div className="customer-stat-icon yellow">
                <Clock3 size={28} />
              </div>
              <h2 className="customer-stat-value">{stats.pending}</h2>
              <p className="customer-stat-label">Pending</p>
            </div>

            {/* Payments */}
            <div className="customer-stat-card">
              <div className="customer-stat-icon emerald">
                <Wallet size={28} />
              </div>
              <h2 className="customer-stat-value">
                R{Number(stats.payments).toLocaleString()}
              </h2>
              <p className="customer-stat-label">Payments</p>
            </div>
          </div>

          {/* ACTION CARDS GRID */}
          <div className="customer-actions-grid">
            {/* Browse Services */}
            <Link to="/services" className="customer-action-card">
              <div className="customer-action-header">
                <div className="customer-action-icon cyan">
                  <Search size={28} />
                </div>
                <ArrowRight size={22} className="customer-action-arrow" />
              </div>
              <h2 className="customer-action-title">Browse Services</h2>
              <p className="customer-action-description">
                Discover providers and book services instantly.
              </p>
            </Link>

            {/* My Bookings */}
            <Link to="/customer/bookings" className="customer-action-card">
              <div className="customer-action-header">
                <div className="customer-action-icon blue">
                  <CalendarCheck2 size={28} />
                </div>
                <ArrowRight size={22} className="customer-action-arrow" />
              </div>
              <h2 className="customer-action-title">My Bookings</h2>
              <p className="customer-action-description">
                Manage all your service bookings in one place.
              </p>
            </Link>

            {/* Payments */}
            <Link to="/customer/payments" className="customer-action-card">
              <div className="customer-action-header">
                <div className="customer-action-icon green">
                  <CreditCard size={28} />
                </div>
                <ArrowRight size={22} className="customer-action-arrow" />
              </div>
              <h2 className="customer-action-title">Payments</h2>
              <p className="customer-action-description">
                View payment history and transactions.
              </p>
            </Link>

            {/* Notifications */}
            <Link to="/customer/notifications" className="customer-action-card">
              <div className="customer-action-header">
                <div className="customer-action-icon purple">
                  <Bell size={28} />
                </div>
                <ArrowRight size={22} className="customer-action-arrow" />
              </div>
              <h2 className="customer-action-title">Notifications</h2>
              <p className="customer-action-description">
                Stay updated with realtime alerts and updates.
              </p>
            </Link>
          </div>

          {/* RECENT BOOKINGS SECTION */}
          <div className="customer-recent-bookings">
            <div className="customer-recent-header">
              <div>
                <h2 className="customer-recent-title">Recent Bookings</h2>
                <p className="customer-recent-subtitle">
                  Latest customer activity
                </p>
              </div>
            </div>

            {recentBookings.length > 0 ? (
              <div className="customer-recent-table-wrapper">
                <table className="customer-recent-table">
                  <thead>
                    <tr>
                      <th>Service</th>
                      <th>Provider</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((booking) => (
                      <tr key={booking.id}>
                        <td className="customer-booking-service">
                          {booking.service_name}
                        </td>
                        <td className="customer-booking-provider">
                          {booking.provider_name}
                        </td>
                        <td>
                          <span
                            className={`customer-booking-status ${
                              booking.status === "completed"
                                ? "customer-status-completed"
                                : booking.status === "pending"
                                  ? "customer-status-pending"
                                  : "customer-status-confirmed"
                            }`}
                          >
                            {booking.status}
                          </span>
                        </td>
                        <td className="customer-booking-date">
                          {new Date(booking.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="customer-empty-state">
                <div className="customer-empty-icon">
                  <Star size={42} />
                </div>
                <h2 className="customer-empty-title">No Bookings Yet</h2>
                <p className="customer-empty-text">
                  Start booking services to see activity here.
                </p>
                <Link to="/services" className="customer-empty-btn">
                  Browse Services
                  <ArrowRight size={20} />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerDashboard;
