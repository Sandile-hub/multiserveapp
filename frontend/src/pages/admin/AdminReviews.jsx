import { useEffect, useMemo, useState } from "react";
import API from "../../api/axios";
import AdminLayout from "../../layouts/AdminLayout";
import {
  Search,
  Star,
  Trash2,
  Eye,
  X,
  MessageSquare,
  TrendingUp,
  Users,
  User,
  Building2,
  Calendar,
} from "lucide-react";
import "../../styles/Admin.css";

function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedReview, setSelectedReview] = useState(null);

  // FETCH REVIEWS
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await API.get("/reviews/admin");
      setReviews(res.data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // FILTER REVIEWS
  const filteredReviews = useMemo(() => {
    return reviews.filter(
      (review) =>
        review.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
        review.business_name?.toLowerCase().includes(search.toLowerCase()) ||
        review.comment?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [reviews, search]);

  // STATS
  const totalReviews = reviews.length;
  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((acc, review) => acc + Number(review.rating), 0) /
          reviews.length
        ).toFixed(1)
      : 0;
  const fiveStarReviews = reviews.filter(
    (review) => Number(review.rating) === 5,
  ).length;
  const fourStarReviews = reviews.filter(
    (review) => Number(review.rating) === 4,
  ).length;
  const threeStarReviews = reviews.filter(
    (review) => Number(review.rating) === 3,
  ).length;

  // DELETE REVIEW
  const deleteReview = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this review?",
    );
    if (!confirmDelete) return;
    try {
      await API.delete(`/reviews/${id}`);
      fetchReviews();
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Failed to delete review");
    }
  };

  // FORMAT DATE
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // STAR RENDER
  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        size={16}
        className={index < Number(rating) ? "star-filled" : "star-empty"}
      />
    ));
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="dashboard-loading">
          <div className="dashboard-loading-content">
            <div className="dashboard-loading-spinner" />
            <p className="dashboard-loading-text">Loading Reviews...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* HEADER */}
      <div className="reviews-header">
        <div>
          <h1 className="reviews-title">Reviews</h1>
          <p className="reviews-subtitle">
            Moderate ratings and customer feedback
          </p>
        </div>

        {/* SEARCH */}
        <div className="reviews-search-wrapper">
          <Search size={18} className="reviews-search-icon" />
          <input
            type="text"
            placeholder="Search reviews..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="reviews-search-input"
          />
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="reviews-stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <p className="stat-card-title">Total Reviews</p>
              <h2 className="stat-card-value">{totalReviews}</h2>
            </div>
            <div className="stat-card-icon-wrapper indigo">
              <MessageSquare size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <p className="stat-card-title">Average Rating</p>
              <h2 className="stat-card-value">{averageRating}</h2>
            </div>
            <div className="stat-card-icon-wrapper yellow">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <p className="stat-card-title">5 Star Reviews</p>
              <h2 className="stat-card-value">{fiveStarReviews}</h2>
            </div>
            <div className="stat-card-icon-wrapper green">
              <Users size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* REVIEWS GRID */}
      <div className="reviews-grid">
        {filteredReviews.length === 0 ? (
          <div className="reviews-empty">
            <Star size={60} className="reviews-empty-icon" />
            <h2 className="reviews-empty-title">No Reviews Found</h2>
            <p className="reviews-empty-text">No reviews available</p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div key={review.id} className="review-card">
              {/* Header */}
              <div className="review-card-header">
                <div className="review-card-user">
                  <div className="review-card-avatar">
                    {review.customer_name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="review-card-name">{review.customer_name}</h3>
                    <p className="review-card-business">
                      {review.business_name}
                    </p>
                  </div>
                </div>
                <div className="review-card-actions">
                  <button
                    onClick={() => setSelectedReview(review)}
                    className="review-action-btn view"
                    title="View Details"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() => deleteReview(review.id)}
                    className="review-action-btn delete"
                    title="Delete Review"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Stars */}
              <div className="review-stars">{renderStars(review.rating)}</div>

              {/* Comment */}
              <div className="review-comment">
                <p>{review.comment}</p>
              </div>

              {/* Footer */}
              <div className="review-footer">
                <span className="review-rating-badge">
                  ⭐ {review.rating}/5
                </span>
                <span className="review-date">
                  {formatDate(review.created_at)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* REVIEW MODAL */}
      {selectedReview && (
        <div className="modal-overlay" onClick={() => setSelectedReview(null)}>
          <div
            className="modal-container review-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 className="modal-title">Review Details</h2>
              <button
                onClick={() => setSelectedReview(null)}
                className="modal-close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="review-details">
              <div className="review-details-grid">
                <div className="review-detail-field">
                  <label>
                    <User size={14} /> Customer
                  </label>
                  <p>{selectedReview.customer_name}</p>
                </div>

                <div className="review-detail-field">
                  <label>
                    <Building2 size={14} /> Business
                  </label>
                  <p>{selectedReview.business_name}</p>
                </div>

                <div className="review-detail-field">
                  <label>Rating</label>
                  <div className="review-detail-stars">
                    {renderStars(selectedReview.rating)}
                  </div>
                </div>

                <div className="review-detail-field">
                  <label>
                    <Calendar size={14} /> Date
                  </label>
                  <p>{formatDate(selectedReview.created_at)}</p>
                </div>
              </div>

              <div className="review-detail-comment">
                <label>Review Comment</label>
                <div className="review-detail-comment-box">
                  <p>{selectedReview.comment}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminReviews;
