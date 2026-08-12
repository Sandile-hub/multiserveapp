import { useEffect, useMemo, useState } from "react";
import API from "../../api/axios";
import AdminLayout from "../../layouts/AdminLayout";
import {
  Search,
  CreditCard,
  Wallet,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Eye,
  X,
  Calendar,
  Receipt,
  User,
  Building2,
  DollarSign,
  Clock,
} from "lucide-react";
import "../../styles/Admin.css";

function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedPayment, setSelectedPayment] = useState(null);

  // FETCH PAYMENTS
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await API.get("/payments/admin");
      setPayments(res.data);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // FILTER PAYMENTS
  const filteredPayments = useMemo(() => {
    return payments.filter(
      (payment) =>
        payment.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
        payment.business_name?.toLowerCase().includes(search.toLowerCase()) ||
        payment.transaction_id?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [payments, search]);

  // STATS
  const totalPayments = payments.length;
  const totalRevenue = payments.reduce(
    (acc, payment) => acc + Number(payment.amount),
    0,
  );
  const successfulPayments = payments.filter(
    (payment) => payment.status === "successful",
  ).length;
  const failedPayments = payments.filter(
    (payment) => payment.status === "failed",
  ).length;
  const pendingPayments = payments.filter(
    (payment) => payment.status === "pending",
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
      case "successful":
        return "payment-status-successful";
      case "failed":
        return "payment-status-failed";
      default:
        return "payment-status-pending";
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="dashboard-loading">
          <div className="dashboard-loading-content">
            <div className="dashboard-loading-spinner" />
            <p className="dashboard-loading-text">Loading Payments...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* HEADER */}
      <div className="payments-header">
        <div>
          <h1 className="payments-title">Payments</h1>
          <p className="payments-subtitle">
            Monitor platform revenue and payments
          </p>
        </div>

        {/* SEARCH */}
        <div className="payments-search-wrapper">
          <Search size={18} className="payments-search-icon" />
          <input
            type="text"
            placeholder="Search payments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="payments-search-input"
          />
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="payments-stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <p className="stat-card-title">Total Payments</p>
              <h2 className="stat-card-value">{totalPayments}</h2>
            </div>
            <div className="stat-card-icon-wrapper indigo">
              <CreditCard size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <p className="stat-card-title">Revenue</p>
              <h2 className="stat-card-value green">
                R{totalRevenue.toLocaleString()}
              </h2>
            </div>
            <div className="stat-card-icon-wrapper green">
              <Wallet size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <p className="stat-card-title">Successful</p>
              <h2 className="stat-card-value">{successfulPayments}</h2>
            </div>
            <div className="stat-card-icon-wrapper success">
              <CheckCircle2 size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <p className="stat-card-title">Failed</p>
              <h2 className="stat-card-value">{failedPayments}</h2>
            </div>
            <div className="stat-card-icon-wrapper danger">
              <XCircle size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* PAYMENTS TABLE */}
      <div className="payments-table-container">
        <div className="payments-table-wrapper">
          <table className="payments-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Business</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="payments-table-empty">
                    <div className="payments-empty-state">
                      <CreditCard size={48} className="payments-empty-icon" />
                      <p>No payments found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="payments-table-cell">
                      <div>
                        <h3 className="payments-customer-name">
                          {payment.customer_name}
                        </h3>
                        <p className="payments-transaction-id">
                          {payment.transaction_id?.slice(0, 12)}...
                        </p>
                      </div>
                    </td>
                    <td className="payments-table-cell">
                      <h3 className="payments-business-name">
                        {payment.business_name}
                      </h3>
                    </td>
                    <td className="payments-table-cell">
                      <h3 className="payments-amount">
                        R{payment.amount.toLocaleString()}
                      </h3>
                    </td>
                    <td className="payments-table-cell">
                      <span className="payments-method">
                        {payment.payment_method}
                      </span>
                    </td>
                    <td className="payments-table-cell">
                      <span
                        className={`payment-status ${getStatusClass(payment.status)}`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="payments-table-cell">
                      <div className="payments-date">
                        <Clock size={12} />
                        <span>{formatDate(payment.created_at)}</span>
                      </div>
                    </td>
                    <td className="payments-table-cell">
                      <button
                        onClick={() => setSelectedPayment(payment)}
                        className="payments-view-btn"
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

      {/* PAYMENT DETAILS MODAL */}
      {selectedPayment && (
        <div className="modal-overlay" onClick={() => setSelectedPayment(null)}>
          <div
            className="modal-container payment-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 className="modal-title">Payment Details</h2>
              <button
                onClick={() => setSelectedPayment(null)}
                className="modal-close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="payment-details">
              <div className="payment-details-grid">
                <div className="payment-detail-field">
                  <label>
                    <User size={14} /> Customer
                  </label>
                  <p>{selectedPayment.customer_name}</p>
                </div>

                <div className="payment-detail-field">
                  <label>
                    <Building2 size={14} /> Business
                  </label>
                  <p>{selectedPayment.business_name}</p>
                </div>

                <div className="payment-detail-field">
                  <label>
                    <DollarSign size={14} /> Amount
                  </label>
                  <p className="payment-detail-amount">
                    R{selectedPayment.amount.toLocaleString()}
                  </p>
                </div>

                <div className="payment-detail-field">
                  <label>
                    <CreditCard size={14} /> Payment Method
                  </label>
                  <p className="capitalize">{selectedPayment.payment_method}</p>
                </div>

                <div className="payment-detail-field">
                  <label>Transaction ID</label>
                  <p className="payment-transaction-id">
                    {selectedPayment.transaction_id}
                  </p>
                </div>

                <div className="payment-detail-field">
                  <label>Status</label>
                  <span
                    className={`payment-status ${getStatusClass(selectedPayment.status)}`}
                  >
                    {selectedPayment.status}
                  </span>
                </div>

                <div className="payment-detail-field">
                  <label>
                    <Calendar size={14} /> Payment Date
                  </label>
                  <p>{formatDate(selectedPayment.created_at)}</p>
                </div>

                <div className="payment-detail-field">
                  <label>Receipt</label>
                  <button className="payment-receipt-btn">
                    <Receipt size={16} />
                    Download Receipt
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminPayments;
