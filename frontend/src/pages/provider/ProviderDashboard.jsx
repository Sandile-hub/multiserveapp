import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import ProviderSidebar from "../../components/provider/ProviderSidebar";
import ProviderNavbar from "../../components/provider/ProviderNavbar";

import API from "../../api/axios";

import {
  Building2,
  BriefcaseBusiness,
  CalendarCheck2,
  Bell,
  Star,
  Wallet,
  TrendingUp,
  Users,
  ArrowRight,
  Plus,
  Loader2,
  BadgeDollarSign,
  PiggyBank,
} from "lucide-react";

import "../../styles/Provider.css";

function ProviderDashboard() {
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    bookings: 0,

    revenue: 0,

    customers: 0,

    reviews: 0,

    commission: 0,

    grossRevenue: 0,
  });

  const [recentBookings, setRecentBookings] = useState([]);

  // ========================================
  // FETCH DASHBOARD DATA
  // ========================================

  const fetchDashboard = async () => {
    try {
      // BOOKINGS
      const bookingsRes = await API.get("/bookings/provider");

      const bookings = bookingsRes.data || [];

      // REVIEWS
      const reviewsRes = await API.get("/reviews/provider");

      const reviews = reviewsRes.data || [];

      // PAYMENTS
      const paymentsRes = await API.get("/payments/provider");

      const payments = paymentsRes.data || [];

      // ====================================
      // SUCCESSFUL PAYMENTS
      // ====================================

      const successfulPayments = payments.filter(
        (payment) => payment.status === "successful",
      );

      // ====================================
      // GROSS REVENUE
      // ====================================

      const grossRevenue = successfulPayments.reduce(
        (acc, payment) => acc + Number(payment.amount || 0),

        0,
      );

      // ====================================
      // PROVIDER EARNINGS
      // ====================================

      const totalRevenue = successfulPayments.reduce(
        (acc, payment) => acc + Number(payment.provider_earnings || 0),

        0,
      );

      // ====================================
      // PLATFORM COMMISSION
      // ====================================

      const totalCommission = successfulPayments.reduce(
        (acc, payment) => acc + Number(payment.commission_amount || 0),

        0,
      );

      // ====================================
      // UNIQUE CUSTOMERS
      // ====================================

      const uniqueCustomers = [
        ...new Set(bookings.map((booking) => booking.customer_id)),
      ];

      // ====================================
      // AVERAGE RATING
      // ====================================

      const averageRating =
        reviews.length > 0
          ? (
              reviews.reduce(
                (acc, review) => acc + Number(review.rating),

                0,
              ) / reviews.length
            ).toFixed(1)
          : 0;

      // ====================================
      // SET STATS
      // ====================================

      setStats({
        bookings: bookings.length,

        revenue: totalRevenue,

        customers: uniqueCustomers.length,

        reviews: averageRating,

        commission: totalCommission,

        grossRevenue,
      });

      // RECENT BOOKINGS

      setRecentBookings(bookings.slice(0, 5));
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // ========================================
  // QUICK ACTIONS
  // ========================================

  const quickActions = [
    {
      title: "Register Business",

      description: "Create and manage your business profile",

      icon: Building2,

      path: "/provider/create-business",

      color: "indigo",
    },

    {
      title: "Manage Services",

      description: "Add and update services offered",

      icon: BriefcaseBusiness,

      path: "/provider/services",

      color: "purple",
    },

    {
      title: "Manage Bookings",

      description: "Track customer appointments",

      icon: CalendarCheck2,

      path: "/provider/bookings",

      color: "blue",
    },

    {
      title: "Notifications",

      description: "Realtime platform alerts",

      icon: Bell,

      path: "/provider/notifications",

      color: "pink",
    },

    {
      title: "Reviews & Ratings",

      description: "Monitor customer feedback",

      icon: Star,

      path: "/provider/reviews",

      color: "orange",
    },
  ];

  // ========================================
  // BOOKING STATUS
  // ========================================

  const getStatusClass = (status) => {
    const statusMap = {
      completed: "booking-status-completed",

      pending: "booking-status-pending",

      cancelled: "booking-status-cancelled",

      confirmed: "booking-status-confirmed",
    };

    return statusMap[status?.toLowerCase()] || "booking-status-pending";
  };

  // ========================================
  // LOADING
  // ========================================

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
    <div className="provider-dashboard">
      <ProviderSidebar />

      <div className="provider-main">
        <ProviderNavbar />

        <div className="provider-main-content">
          {/* HERO */}

          <div className="hero-section">
            <div className="hero-bg" />

            <div className="hero-inner">
              <div className="hero-left">
                <div className="hero-badge">
                  <TrendingUp size={16} />
                  Provider Workspace
                </div>

                <h1 className="hero-title">Welcome Back 👋</h1>

                <p className="hero-description">
                  Monitor your bookings, earnings, commissions, customers and
                  business performance in realtime.
                </p>
              </div>

              <Link to="/provider/create-business" className="hero-btn">
                <Plus size={20} />
                New Business
              </Link>
            </div>
          </div>

          {/* STATS */}

          <div className="stats-grid">
            {/* BOOKINGS */}

            <div className="stat-card">
              <div className="stat-icon stat-icon-indigo">
                <CalendarCheck2 size={24} />
              </div>

              <h2 className="stat-value">{stats.bookings}</h2>

              <p className="stat-label">Total Bookings</p>
            </div>

            {/* PROVIDER EARNINGS */}

            <div className="stat-card">
              <div className="stat-icon stat-icon-green">
                <Wallet size={24} />
              </div>

              <h2 className="stat-value">R{stats.revenue.toLocaleString()}</h2>

              <p className="stat-label">Your Earnings</p>
            </div>

            {/* PLATFORM COMMISSION */}

            <div className="stat-card">
              <div className="stat-icon stat-icon-red">
                <BadgeDollarSign size={24} />
              </div>

              <h2 className="stat-value">
                R{stats.commission.toLocaleString()}
              </h2>

              <p className="stat-label">Platform Commission</p>
            </div>

            {/* GROSS REVENUE */}

            <div className="stat-card">
              <div className="stat-icon stat-icon-cyan">
                <PiggyBank size={24} />
              </div>

              <h2 className="stat-value">
                R{stats.grossRevenue.toLocaleString()}
              </h2>

              <p className="stat-label">Gross Revenue</p>
            </div>

            {/* CUSTOMERS */}

            <div className="stat-card">
              <div className="stat-icon stat-icon-blue">
                <Users size={24} />
              </div>

              <h2 className="stat-value">{stats.customers}</h2>

              <p className="stat-label">Customers</p>
            </div>

            {/* REVIEWS */}

            <div className="stat-card">
              <div className="stat-icon stat-icon-yellow">
                <Star size={24} />
              </div>

              <h2 className="stat-value">⭐ {stats.reviews}</h2>

              <p className="stat-label">Rating</p>
            </div>
          </div>

          {/* QUICK ACTIONS */}

          <div className="quick-actions-grid">
            {quickActions.map((action, index) => {
              const Icon = action.icon;

              return (
                <Link
                  key={index}
                  to={action.path}
                  className={`quick-action-card quick-action-${action.color}`}
                >
                  <div className="quick-action-icon">
                    <Icon size={28} />
                  </div>

                  <h3 className="quick-action-title">{action.title}</h3>

                  <p className="quick-action-description">
                    {action.description}
                  </p>

                  <div className="quick-action-link">
                    Open
                    <ArrowRight size={16} />
                  </div>
                </Link>
              );
            })}
          </div>

          {/* RECENT BOOKINGS */}

          <div className="recent-bookings">
            <div className="section-header">
              <h2 className="section-title">Recent Bookings</h2>

              <Link to="/provider/bookings" className="section-link">
                View All
              </Link>
            </div>

            <div className="bookings-list">
              {recentBookings.length > 0 ? (
                recentBookings.map((booking) => (
                  <div key={booking.id} className="booking-item">
                    <div className="booking-info">
                      <h3 className="booking-title">
                        {booking.service_name || "Service Booking"}
                      </h3>

                      <p className="booking-customer">
                        {booking.customer_name || "Customer"}
                      </p>
                    </div>

                    <div className="booking-details">
                      <p className="booking-amount">
                        R{Number(booking.total_amount || 0).toLocaleString()}
                      </p>

                      <span
                        className={`booking-status ${getStatusClass(booking.status)}`}
                      >
                        {booking.status || "Pending"}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <p>No bookings yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProviderDashboard;
