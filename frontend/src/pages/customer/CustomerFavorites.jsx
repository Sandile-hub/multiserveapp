import { useEffect, useMemo, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import API from "../../api/axios";

import CustomerSidebar from "../../components/customer/CustomerSidebar";
import CustomerNavbar from "../../components/customer/CustomerNavbar";

import {
  Heart,
  MapPin,
  Star,
  Trash2,
  Loader2,
  Sparkles,
  Search,
  Grid3X3,
  ArrowRight,
  HeartCrack,
  BadgeCheck,
  Clock3,
  Wallet,
  Flame,
  Filter,
  X,
} from "lucide-react";

import "../../styles/Customer.css";

function CustomerFavorites() {
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [sortBy, setSortBy] = useState("latest");

  const [showFilters, setShowFilters] = useState(false);

  // ========================================
  // FETCH FAVORITES
  // ========================================

  const fetchFavorites = async () => {
    try {
      const res = await API.get("/favorites");

      setFavorites(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  // ========================================
  // REMOVE FAVORITE
  // ========================================

  const removeFavorite = async (id) => {
    const confirmDelete = window.confirm("Remove this service from favorites?");

    if (!confirmDelete) return;

    try {
      await API.delete(`/favorites/${id}`);

      setFavorites(favorites.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  // ========================================
  // FILTER FAVORITES
  // ========================================

  const filteredFavorites = useMemo(() => {
    let filtered = favorites.filter(
      (item) =>
        item.service_name?.toLowerCase().includes(search.toLowerCase()) ||
        item.business_name?.toLowerCase().includes(search.toLowerCase()) ||
        item.category?.toLowerCase().includes(search.toLowerCase()),
    );

    // SORTING

    if (sortBy === "price-low") {
      filtered.sort((a, b) => a.price - b.price);
    }

    if (sortBy === "price-high") {
      filtered.sort((a, b) => b.price - a.price);
    }

    if (sortBy === "rating") {
      filtered.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    }

    return filtered;
  }, [favorites, search, sortBy]);

  // ========================================
  // TOTAL VALUE
  // ========================================

  const totalValue = useMemo(() => {
    return favorites.reduce(
      (sum, item) => sum + Number(item.price || 0),

      0,
    );
  }, [favorites]);

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <Loader2 size={55} className="spinner text-cyan" />

          <p className="loading-text">Loading favorites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-dashboard">
      <CustomerSidebar />

      <div className="customer-main">
        <CustomerNavbar />

        <div className="customer-main-content">
          {/* HERO */}

          <div className="favorites-hero">
            <div className="favorites-hero-bg-1" />

            <div className="favorites-hero-bg-2" />

            <div className="favorites-hero-content">
              {/* LEFT */}

              <div>
                <div className="favorites-hero-badge">
                  <Heart size={16} fill="currentColor" />
                  Saved Services
                </div>

                <h1 className="favorites-hero-title">My Favorites ❤️</h1>

                <p className="favorites-hero-description">
                  Quickly access your favorite services, providers and
                  businesses anytime.
                </p>
              </div>

              {/* STATS */}

              <div className="favorites-stats">
                {/* TOTAL SERVICES */}

                <div className="favorites-stat-card">
                  <div className="favorites-stat-header">
                    <Grid3X3 className="favorites-stat-icon" />

                    <BadgeCheck className="favorites-stat-badge" />
                  </div>

                  <p className="favorites-stat-label">Saved Services</p>

                  <h2 className="favorites-stat-value">{favorites.length}</h2>
                </div>

                {/* TOTAL VALUE */}

                <div className="favorites-stat-card">
                  <div className="favorites-stat-header">
                    <Wallet className="favorites-stat-sparkle" />
                  </div>

                  <p className="favorites-stat-label">Total Value</p>

                  <h2 className="favorites-stat-value cyan">
                    R{totalValue.toLocaleString()}
                  </h2>
                </div>
              </div>
            </div>
          </div>

          {/* SEARCH */}

          {favorites.length > 0 && (
            <div className="favorites-search-container">
              <div className="favorites-search-wrapper">
                <Search className="favorites-search-icon" />

                <input
                  type="text"
                  placeholder="Search favorites..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="favorites-search-input"
                />
              </div>

              {/* FILTERS */}

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="favorites-filter-btn"
              >
                <Filter size={18} />
                Filters
              </button>
            </div>
          )}

          {/* FILTER PANEL */}

          {showFilters && (
            <div className="favorites-filter-panel">
              <div className="favorites-filter-header">
                <h3>Sort Favorites</h3>

                <button onClick={() => setShowFilters(false)}>
                  <X size={18} />
                </button>
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="favorites-sort-select"
              >
                <option value="latest">Latest</option>

                <option value="rating">Highest Rated</option>

                <option value="price-low">Lowest Price</option>

                <option value="price-high">Highest Price</option>
              </select>
            </div>
          )}

          {/* FAVORITES GRID */}

          {filteredFavorites.length > 0 ? (
            <div className="favorites-grid">
              {filteredFavorites.map((item) => (
                <div key={item.id} className="favorite-card">
                  {/* IMAGE */}

                  <div className="favorite-card-image">
                    <img
                      src={
                        item.image ||
                        "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=1200"
                      }
                      alt={item.service_name}
                      className="favorite-service-img"
                    />

                    {/* REMOVE */}

                    <button
                      onClick={() => removeFavorite(item.id)}
                      className="favorite-remove-btn"
                    >
                      <Trash2 size={20} />
                    </button>

                    {/* PRICE */}

                    <div className="favorite-price">R{item.price}</div>

                    {/* POPULAR */}

                    {item.total_reviews > 10 && (
                      <div className="favorite-popular-badge">
                        <Flame size={14} />
                        Popular
                      </div>
                    )}
                  </div>

                  {/* CONTENT */}

                  <div className="favorite-card-content">
                    {/* CATEGORY */}

                    <div className="favorite-category">
                      <Sparkles size={12} />

                      {item.category || "Professional Service"}
                    </div>

                    {/* TITLE */}

                    <h2 className="favorite-title">{item.service_name}</h2>

                    {/* DESCRIPTION */}

                    <p className="favorite-description">
                      {item.description ||
                        "Premium professional service available for instant booking."}
                    </p>

                    {/* LOCATION */}

                    <div className="favorite-location">
                      <MapPin size={16} />

                      <span>
                        {item.business_name}

                        {" • "}

                        {item.city || "Unknown"}
                      </span>
                    </div>

                    {/* DURATION */}

                    <div className="favorite-duration">
                      <Clock3 size={16} />

                      <span>{item.duration_minutes || 60} mins</span>
                    </div>

                    {/* RATING */}

                    <div className="favorite-rating">
                      <div className="favorite-stars">
                        <Star size={16} fill="currentColor" />

                        <span className="favorite-rating-value">
                          {item.rating || "5.0"}
                        </span>
                      </div>

                      <span className="favorite-review-count">
                        ({item.total_reviews || 0} reviews)
                      </span>

                      <div className="favorite-verified">
                        <BadgeCheck size={14} />
                        Verified
                      </div>
                    </div>

                    {/* BUTTONS */}

                    <div className="favorite-actions">
                      <button
                        onClick={() =>
                          navigate("/customer/book-service", {
                            state: item,
                          })
                        }
                        className="favorite-book-btn"
                      >
                        Book Service
                        <ArrowRight size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="favorites-empty">
              <div className="favorites-empty-icon">
                <HeartCrack size={70} />
              </div>

              <h2 className="favorites-empty-title">No Favorites Yet</h2>

              <p className="favorites-empty-text">
                Start saving your favorite services to access them quickly and
                book anytime.
              </p>

              <Link to="/services" className="favorites-empty-btn">
                Browse Marketplace
                <ArrowRight size={18} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CustomerFavorites;
