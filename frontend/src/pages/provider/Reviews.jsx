import { useEffect, useMemo, useState } from "react";
import API from "../../api/axios";
import ProviderSidebar from "../../components/provider/ProviderSidebar";
import ProviderNavbar from "../../components/provider/ProviderNavbar";
import {
  Star,
  TrendingUp,
  MessageSquare,
  BadgeCheck,
  Loader2,
  Search,
  Filter,
  Sparkles,
} from "lucide-react";
import "../../styles/Provider.css";

function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  // FETCH REVIEWS
  const fetchReviews = async () => {
    try {
      const res = await API.get("/reviews/provider");
      setReviews(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // FILTERED REVIEWS
  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      const matchesSearch = review.full_name
        ?.toLowerCase()
        .includes(search.toLowerCase());
      const matchesFilter =
        filter === "all" || review.rating === Number(filter);
      return matchesSearch && matchesFilter;
    });
  }, [reviews, search, filter]);

  // STATS
  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((acc, review) => acc + Number(review.rating), 0) /
          reviews.length
        ).toFixed(1)
      : 0;
  const totalReviews = reviews.length;
  const fiveStars = reviews.filter((review) => review.rating === 5).length;

  // LOADING
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <Loader2 size={30} className="spinner" />
          <span>Loading reviews...</span>
        </div>
      </div>
    );
  }

  // Helper function to render stars
  const renderStars = (rating) => {
    return "⭐".repeat(rating);
  };

  return (
    <div className="provider-dashboard">
      <ProviderSidebar />

      <div className="provider-main">
        <ProviderNavbar />

        <div className="provider-main-content">
          {/* HERO SECTION */}
          <div className="provider-reviews-hero">
            <div className="provider-reviews-hero-bg" />
            <div className="provider-reviews-hero-content">
              <div className="provider-reviews-hero-badge">
                <Sparkles size={16} />
                Customer Feedback
              </div>
              <h1 className="provider-reviews-hero-title">
                Reviews & Ratings ⭐
              </h1>
              <p className="provider-reviews-hero-description">
                Monitor customer satisfaction, analyze ratings and improve your
                business reputation.
              </p>
            </div>
          </div>

          {/* STATS CARDS */}
          <div className="provider-reviews-stats">
            <div className="stat-card">
              <div className="stat-card-header">
                <div className="stat-card-icon yellow">
                  <Star size={24} />
                </div>
                <span className="stat-card-badge">Average</span>
              </div>
              <h2 className="stat-card-value yellow">{averageRating}</h2>
              <p className="stat-card-label">Overall rating</p>
            </div>
            <div className="stat-card">
              <div className="stat-card-header">
                <div className="stat-card-icon indigo">
                  <MessageSquare size={24} />
                </div>
                <span className="stat-card-badge">Reviews</span>
              </div>
              <h2 className="stat-card-value">{totalReviews}</h2>
              <p className="stat-card-label">Customer reviews</p>
            </div>
            <div className="stat-card">
              <div className="stat-card-header">
                <div className="stat-card-icon green">
                  <BadgeCheck size={24} />
                </div>
                <span className="stat-card-badge">5 Stars</span>
              </div>
              <h2 className="stat-card-value green">{fiveStars}</h2>
              <p className="stat-card-label">Excellent ratings</p>
            </div>
          </div>

          {/* FILTER BAR */}
          <div className="provider-reviews-filter">
            <div className="provider-reviews-search">
              <Search size={18} className="provider-reviews-search-icon" />
              <input
                type="text"
                placeholder="Search customers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="provider-reviews-search-input"
              />
            </div>
            <div className="provider-reviews-filter-select">
              <div className="provider-reviews-filter-icon">
                <Filter size={18} />
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="provider-reviews-select"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
          </div>

          {/* REVIEWS GRID */}
          {filteredReviews.length > 0 ? (
            <div className="provider-reviews-grid">
              {filteredReviews.map((review) => (
                <div key={review.id} className="review-card">
                  {/* Header */}
                  <div className="review-card-header">
                    <div className="review-card-user">
                      <div className="review-card-avatar">
                        {review.full_name?.charAt(0)?.toUpperCase() || "C"}
                      </div>
                      <div>
                        <h2 className="review-card-name">{review.full_name}</h2>
                        <p className="review-card-business">
                          {review.business_name}
                        </p>
                      </div>
                    </div>
                    <div className="review-card-rating">
                      {renderStars(review.rating)} {review.rating}
                    </div>
                  </div>

                  {/* Comment */}
                  <div className="review-card-comment">
                    <p className="review-card-comment-text">
                      {review.comment || "No comment provided."}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="review-card-footer">
                    <div className="review-card-verified">
                      <TrendingUp size={14} />
                      Verified Review
                    </div>
                    <p className="review-card-date">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="provider-reviews-empty">
              <div className="provider-reviews-empty-icon">
                <Star size={48} />
              </div>
              <h2 className="provider-reviews-empty-title">No Reviews Found</h2>
              <p className="provider-reviews-empty-text">
                Customer reviews will appear here once users start rating your
                services.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Reviews;
