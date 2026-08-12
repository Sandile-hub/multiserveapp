import { useEffect, useMemo, useState } from "react";

import API from "../../api/axios";

import ProviderSidebar from "../../components/provider/ProviderSidebar";
import ProviderNavbar from "../../components/provider/ProviderNavbar";

import {
  Wallet,
  CreditCard,
  TrendingUp,
  Landmark,
  Loader2,
  Search,
  CalendarDays,
  BadgeCheck,
  Clock3,
  Sparkles,
  ArrowUpRight,
  Download,
  PiggyBank,
  BadgeDollarSign,
} from "lucide-react";

import "../../styles/Provider.css";

function ProviderPayments() {
  const [payments, setPayments] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  // ========================================
  // FETCH PAYMENTS
  // ========================================

  const fetchPayments = async () => {
    try {
      const res = await API.get("/payments/provider");

      setPayments(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // ========================================
  // FILTER PAYMENTS
  // ========================================

  const filteredPayments = useMemo(() => {
    return payments.filter(
      (payment) =>
        payment.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
        payment.service_name?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [payments, search]);

  // ========================================
  // SUCCESSFUL PAYMENTS
  // ========================================

  const successfulPaymentsList = payments.filter(
    (payment) => payment.status === "successful",
  );

  // ========================================
  // TOTALS
  // ========================================

  // GROSS REVENUE
  const grossRevenue = successfulPaymentsList.reduce(
    (acc, payment) => acc + Number(payment.amount || 0),

    0,
  );

  // PROVIDER EARNINGS
  const providerRevenue = successfulPaymentsList.reduce(
    (acc, payment) => acc + Number(payment.provider_earnings || 0),

    0,
  );

  // PLATFORM COMMISSION
  const totalCommission = successfulPaymentsList.reduce(
    (acc, payment) => acc + Number(payment.commission_amount || 0),

    0,
  );

  // COUNTS
  const successfulPayments = successfulPaymentsList.length;

  const pendingPayments = payments.filter(
    (payment) => payment.status === "pending",
  ).length;

  // ========================================
  // DOWNLOAD CSV
  // ========================================

  const downloadCSV = () => {
    if (filteredPayments.length === 0) {
      alert("No payments available");

      return;
    }

    const headers = [
      "Customer Name",

      "Service",

      "Gross Amount",

      "Commission",

      "Provider Earnings",

      "Status",

      "Payment Method",

      "Transaction ID",

      "Date",
    ];

    const rows = filteredPayments.map((payment) => [
      payment.customer_name,

      payment.service_name,

      payment.amount,

      payment.commission_amount || 0,

      payment.provider_earnings || 0,

      payment.status,

      payment.payment_method,

      payment.transaction_id || "Pending",

      new Date(payment.created_at).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(","),

      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.setAttribute("download", `payments-history-${Date.now()}.csv`);

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  };

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <Loader2 size={30} className="spinner" />

          <span>Loading payments...</span>
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

          <div className="provider-payments-hero">
            <div className="provider-payments-hero-bg" />

            <div className="provider-payments-hero-content">
              <div className="provider-payments-hero-badge">
                <Sparkles size={16} />
                Revenue Dashboard
              </div>

              <h1 className="provider-payments-hero-title">
                Payments & Earnings 💳
              </h1>

              <p className="provider-payments-hero-description">
                Monitor your provider earnings, commission deductions, customer
                transactions and financial performance.
              </p>
            </div>
          </div>

          {/* STATS */}

          <div className="provider-payments-stats">
            {/* PROVIDER EARNINGS */}

            <div className="stat-card revenue">
              <div className="stat-card-header">
                <div className="stat-card-icon green">
                  <Wallet size={24} />
                </div>

                <ArrowUpRight size={20} className="stat-card-arrow" />
              </div>

              <h2 className="stat-card-value green">
                R{providerRevenue.toLocaleString()}
              </h2>

              <p className="stat-card-label">Your Earnings</p>
            </div>

            {/* PLATFORM COMMISSION */}

            <div className="stat-card">
              <div className="stat-card-header">
                <div className="stat-card-icon red">
                  <BadgeDollarSign size={24} />
                </div>

                <Landmark size={20} />
              </div>

              <h2 className="stat-card-value red">
                R{totalCommission.toLocaleString()}
              </h2>

              <p className="stat-card-label">Platform Commission</p>
            </div>

            {/* GROSS REVENUE */}

            <div className="stat-card">
              <div className="stat-card-header">
                <div className="stat-card-icon cyan">
                  <PiggyBank size={24} />
                </div>

                <TrendingUp size={20} />
              </div>

              <h2 className="stat-card-value cyan">
                R{grossRevenue.toLocaleString()}
              </h2>

              <p className="stat-card-label">Gross Revenue</p>
            </div>

            {/* SUCCESSFUL */}

            <div className="stat-card">
              <div className="stat-card-header">
                <div className="stat-card-icon indigo">
                  <BadgeCheck size={24} />
                </div>

                <TrendingUp size={20} className="stat-card-trend" />
              </div>

              <h2 className="stat-card-value">{successfulPayments}</h2>

              <p className="stat-card-label">Successful Payments</p>
            </div>

            {/* PENDING */}

            <div className="stat-card">
              <div className="stat-card-header">
                <div className="stat-card-icon yellow">
                  <Clock3 size={24} />
                </div>

                <Landmark size={20} className="stat-card-landmark" />
              </div>

              <h2 className="stat-card-value yellow">{pendingPayments}</h2>

              <p className="stat-card-label">Pending Payments</p>
            </div>
          </div>

          {/* SEARCH */}

          <div className="provider-payments-search">
            <div className="provider-payments-search-wrapper">
              <Search size={18} className="provider-payments-search-icon" />

              <input
                type="text"
                placeholder="Search customer or service..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="provider-payments-search-input"
              />
            </div>

            {/* DOWNLOAD */}

            <button onClick={downloadCSV} className="provider-download-btn">
              <Download size={18} />
              Download CSV
            </button>
          </div>

          {/* PAYMENTS */}

          {filteredPayments.length > 0 ? (
            <div className="provider-payments-grid">
              {filteredPayments.map((payment) => (
                <div key={payment.id} className="provider-payment-card">
                  {/* HEADER */}

                  <div className="provider-payment-card-header">
                    <div className="provider-payment-card-user">
                      <div className="provider-payment-card-avatar">
                        <CreditCard size={24} />
                      </div>

                      <div>
                        <h2 className="provider-payment-card-name">
                          {payment.customer_name}
                        </h2>

                        <p className="provider-payment-card-service">
                          {payment.service_name}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`provider-payment-status provider-payment-status-${payment.status}`}
                    >
                      {payment.status}
                    </div>
                  </div>

                  {/* GROSS */}

                  <div className="provider-payment-amount">
                    <p className="provider-payment-amount-label">
                      Gross Amount
                    </p>

                    <h2 className="provider-payment-amount-value">
                      R{Number(payment.amount).toLocaleString()}
                    </h2>
                  </div>

                  {/* DETAILS */}

                  <div className="provider-payment-details">
                    <div className="provider-payment-detail">
                      <span className="provider-payment-detail-label">
                        <Wallet size={16} />
                        Your Earnings
                      </span>

                      <span className="provider-payment-detail-value green">
                        R
                        {Number(
                          payment.provider_earnings || 0,
                        ).toLocaleString()}
                      </span>
                    </div>

                    <div className="provider-payment-detail">
                      <span className="provider-payment-detail-label">
                        <BadgeDollarSign size={16} />
                        Commission
                      </span>

                      <span className="provider-payment-detail-value red">
                        R
                        {Number(
                          payment.commission_amount || 0,
                        ).toLocaleString()}
                      </span>
                    </div>

                    <div className="provider-payment-detail">
                      <span className="provider-payment-detail-label">
                        <CalendarDays size={16} />
                        Payment Date
                      </span>

                      <span className="provider-payment-detail-value">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="provider-payment-detail">
                      <span className="provider-payment-detail-label">
                        <CreditCard size={16} />
                        Method
                      </span>

                      <span className="provider-payment-detail-value capitalize">
                        {payment.payment_method}
                      </span>
                    </div>

                    <div className="provider-payment-detail">
                      <span className="provider-payment-detail-label">
                        <Wallet size={16} />
                        Transaction ID
                      </span>

                      <span className="provider-payment-detail-id">
                        {payment.transaction_id || "Pending"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="provider-payments-empty">
              <div className="provider-payments-empty-icon">
                <Wallet size={48} />
              </div>

              <h2 className="provider-payments-empty-title">No Payments Yet</h2>

              <p className="provider-payments-empty-text">
                Payment transactions will appear here once customers start
                paying for your services.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProviderPayments;
