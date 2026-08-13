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

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [error, setError] = useState("");

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
  // NORMALIZE API ARRAY RESPONSE
  // ========================================

  const getArrayData = (response) => {
    const data = response?.data;

    // Direct array
    if (Array.isArray(data)) {
      return data;
    }

    // { data: [] }
    if (Array.isArray(data?.data)) {
      return data.data;
    }

    // { payments: [] }
    if (Array.isArray(data?.payments)) {
      return data.payments;
    }

    // { bookings: [] }
    if (Array.isArray(data?.bookings)) {
      return data.bookings;
    }

    // { reviews: [] }
    if (Array.isArray(data?.reviews)) {
      return data.reviews;
    }

    // { results: [] }
    if (Array.isArray(data?.results)) {
      return data.results;
    }

    return [];
  };

  // ========================================
  // FETCH DASHBOARD DATA
  // ========================================

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      // ====================================
      // BOOKINGS
      // ====================================

      const bookingsRes = await API.get("/bookings/provider");

      const bookings = getArrayData(bookingsRes);

      // ====================================
      // REVIEWS
      // ====================================

      const reviewsRes = await API.get("/reviews/provider");

      const reviews = getArrayData(reviewsRes);

      // ====================================
      // PAYMENTS
      // ====================================

      const paymentsRes = await API.get("/payments/provider");

      const payments = getArrayData(paymentsRes);

      console.log("Provider Dashboard Data:", {
        bookings,
        reviews,
        payments,
      });

      // ====================================
      // SUCCESSFUL PAYMENTS
      // ====================================

      const successfulPayments = payments.filter((payment) => {
        const status = String(payment.status || "").toLowerCase();

        return (
          status === "successful" ||
          status === "succeeded" ||
          status === "completed" ||
          status === "paid"
        );
      });

      // ====================================
      // GROSS REVENUE
      // ====================================

      const grossRevenue = successfulPayments.reduce((total, payment) => {
        return total + Number(payment.amount || 0);
      }, 0);

      // ====================================
      // PROVIDER EARNINGS
      // ====================================

      const totalRevenue = successfulPayments.reduce((total, payment) => {
        const earnings =
          payment.provider_earnings ??
          payment.provider_amount ??
          payment.net_amount ??
          0;

        return total + Number(earnings);
      }, 0);

      // ====================================
      // PLATFORM COMMISSION
      // ====================================

      const totalCommission = successfulPayments.reduce((total, payment) => {
        const commission =
          payment.commission_amount ??
          payment.platform_fee ??
          payment.commission ??
          0;

        return total + Number(commission);
      }, 0);

      // ====================================
      // UNIQUE CUSTOMERS
      // ====================================

      const customerIds = bookings
        .map((booking) => booking.customer_id)
        .filter((id) => id !== null && id !== undefined);

      const uniqueCustomers = [...new Set(customerIds)];

      // ====================================
      // AVERAGE RATING
      // ====================================

      const validRatings = reviews
        .map((review) => Number(review.rating))
        .filter((rating) => !Number.isNaN(rating));

      const averageRating =
        validRatings.length > 0
          ? (
              validRatings.reduce((total, rating) => total + rating, 0) /
              validRatings.length
            ).toFixed(1)
          : "0.0";

      // ====================================
      // SET STATS
      // ====================================

      setStats({
        bookings: bookings.length,

        revenue: totalRevenue,

        customers: uniqueCustomers.length,

        reviews: averageRating,

        commission: totalCommission,

        grossRevenue: grossRevenue,
      });

      // ====================================
      // RECENT BOOKINGS
      // ====================================

      setRecentBookings(bookings.slice(0, 5));
    } catch (error) {
      console.error("Error fetching dashboard:", error);

      setError(
        error.response?.data?.message || "Unable to load dashboard data.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // INITIAL LOAD
  // ========================================

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

      accepted: "booking-status-confirmed",
    };

    return statusMap[status?.toLowerCase()] || "booking-status-pending";
  };

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div
        className="
        loading-container
      "
      >
        <div
          className="
          loading-content
        "
        >
          <Loader2
            className="
              spinner
            "
            size={24}
          />

          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  // ========================================
  // DASHBOARD
  // ========================================

  return (
    <div
      className="
      provider-dashboard
    "
    >
      <ProviderSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div
        className="
        provider-main
      "
      >
        <ProviderNavbar
          toggleSidebar={() => setSidebarOpen((previous) => !previous)}
        />

        <div
          className="
          provider-main-content
        "
        >
          {/* ==================================
              ERROR MESSAGE
          ================================== */}

          {error && (
            <div
              className="
              mb-6
              p-4
              rounded-2xl
              bg-red-500/10
              border
              border-red-500/20
              text-red-400
              flex
              items-center
              justify-between
              gap-4
            "
            >
              <span>{error}</span>

              <button
                onClick={fetchDashboard}
                className="
                  px-4
                  py-2
                  rounded-xl
                  bg-red-500
                  text-white
                  font-semibold
                "
              >
                Retry
              </button>
            </div>
          )}

          {/* ==================================
              HERO
          ================================== */}

          <div
            className="
            hero-section
          "
          >
            <div
              className="
              hero-bg
            "
            />

            <div
              className="
              hero-inner
            "
            >
              <div
                className="
                hero-left
              "
              >
                <div
                  className="
                  hero-badge
                "
                >
                  <TrendingUp size={16} />
                  Provider Workspace
                </div>

                <h1
                  className="
                  hero-title
                "
                >
                  Welcome Back 👋
                </h1>

                <p
                  className="
                  hero-description
                "
                >
                  Monitor your bookings, earnings, commissions, customers and
                  business performance in realtime.
                </p>
              </div>

              <Link
                to="/provider/create-business"
                className="
                  hero-btn
                "
              >
                <Plus size={20} />
                New Business
              </Link>
            </div>
          </div>

          {/* ==================================
              STATS
          ================================== */}

          <div
            className="
            stats-grid
          "
          >
            {/* BOOKINGS */}

            <div
              className="
              stat-card
            "
            >
              <div
                className="
                stat-icon
                stat-icon-indigo
              "
              >
                <CalendarCheck2 size={24} />
              </div>

              <h2
                className="
                stat-value
              "
              >
                {stats.bookings}
              </h2>

              <p
                className="
                stat-label
              "
              >
                Total Bookings
              </p>
            </div>

            {/* PROVIDER EARNINGS */}

            <div
              className="
              stat-card
            "
            >
              <div
                className="
                stat-icon
                stat-icon-green
              "
              >
                <Wallet size={24} />
              </div>

              <h2
                className="
                stat-value
              "
              >
                R
                {Number(stats.revenue).toLocaleString("en-ZA", {
                  minimumFractionDigits: 2,

                  maximumFractionDigits: 2,
                })}
              </h2>

              <p
                className="
                stat-label
              "
              >
                Your Earnings
              </p>
            </div>

            {/* COMMISSION */}

            <div
              className="
              stat-card
            "
            >
              <div
                className="
                stat-icon
                stat-icon-red
              "
              >
                <BadgeDollarSign size={24} />
              </div>

              <h2
                className="
                stat-value
              "
              >
                R
                {Number(stats.commission).toLocaleString("en-ZA", {
                  minimumFractionDigits: 2,

                  maximumFractionDigits: 2,
                })}
              </h2>

              <p
                className="
                stat-label
              "
              >
                Platform Commission
              </p>
            </div>

            {/* GROSS REVENUE */}

            <div
              className="
              stat-card
            "
            >
              <div
                className="
                stat-icon
                stat-icon-cyan
              "
              >
                <PiggyBank size={24} />
              </div>

              <h2
                className="
                stat-value
              "
              >
                R
                {Number(stats.grossRevenue).toLocaleString("en-ZA", {
                  minimumFractionDigits: 2,

                  maximumFractionDigits: 2,
                })}
              </h2>

              <p
                className="
                stat-label
              "
              >
                Gross Revenue
              </p>
            </div>

            {/* CUSTOMERS */}

            <div
              className="
              stat-card
            "
            >
              <div
                className="
                stat-icon
                stat-icon-blue
              "
              >
                <Users size={24} />
              </div>

              <h2
                className="
                stat-value
              "
              >
                {stats.customers}
              </h2>

              <p
                className="
                stat-label
              "
              >
                Customers
              </p>
            </div>

            {/* REVIEWS */}

            <div
              className="
              stat-card
            "
            >
              <div
                className="
                stat-icon
                stat-icon-yellow
              "
              >
                <Star size={24} />
              </div>

              <h2
                className="
                stat-value
              "
              >
                ⭐ {stats.reviews}
              </h2>

              <p
                className="
                stat-label
              "
              >
                Rating
              </p>
            </div>
          </div>

          {/* ==================================
              QUICK ACTIONS
          ================================== */}

          <div
            className="
            quick-actions-grid
          "
          >
            {quickActions.map((action, index) => {
              const Icon = action.icon;

              return (
                <Link
                  key={index}
                  to={action.path}
                  className={`
                      quick-action-card
                      quick-action-${action.color}
                    `}
                >
                  <div
                    className="
                      quick-action-icon
                    "
                  >
                    <Icon size={28} />
                  </div>

                  <h3
                    className="
                      quick-action-title
                    "
                  >
                    {action.title}
                  </h3>

                  <p
                    className="
                      quick-action-description
                    "
                  >
                    {action.description}
                  </p>

                  <div
                    className="
                      quick-action-link
                    "
                  >
                    Open
                    <ArrowRight size={16} />
                  </div>
                </Link>
              );
            })}
          </div>

          {/* ==================================
              RECENT BOOKINGS
          ================================== */}

          <div
            className="
            recent-bookings
          "
          >
            <div
              className="
              section-header
            "
            >
              <h2
                className="
                section-title
              "
              >
                Recent Bookings
              </h2>

              <Link
                to="/provider/bookings"
                className="
                  section-link
                "
              >
                View All
              </Link>
            </div>

            <div
              className="
              bookings-list
            "
            >
              {recentBookings.length > 0 ? (
                recentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="
                        booking-item
                      "
                  >
                    <div
                      className="
                        booking-info
                      "
                    >
                      <h3
                        className="
                          booking-title
                        "
                      >
                        {booking.service_name || "Service Booking"}
                      </h3>

                      <p
                        className="
                          booking-customer
                        "
                      >
                        {booking.customer_name || "Customer"}
                      </p>
                    </div>

                    <div
                      className="
                        booking-details
                      "
                    >
                      <p
                        className="
                          booking-amount
                        "
                      >
                        R
                        {Number(
                          booking.total_amount || booking.amount || 0,
                        ).toLocaleString("en-ZA", {
                          minimumFractionDigits: 2,

                          maximumFractionDigits: 2,
                        })}
                      </p>

                      <span
                        className={`
                            booking-status
                            ${getStatusClass(booking.status)}
                          `}
                      >
                        {booking.status || "Pending"}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div
                  className="
                  empty-state
                "
                >
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
