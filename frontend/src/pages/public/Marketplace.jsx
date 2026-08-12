import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import {
  Search,
  MapPin,
  Star,
  Clock3,
  Sparkles,
  SlidersHorizontal,
  Loader2,
  ArrowRight,
  Heart,
  Flame,
  BadgeCheck,
  Filter,
  X,
} from "lucide-react";
import "../../styles/Public.css";

function Marketplace() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("popular");
  const [favorites, setFavorites] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // FETCH SERVICES
  const fetchServices = async () => {
    try {
      const res = await API.get("/services/all");
      setServices(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
    // LOAD FAVORITES
    const savedFavorites = JSON.parse(
      localStorage.getItem("favorites") || "[]",
    );
    setFavorites(savedFavorites);
  }, []);

  // CATEGORIES
  const categories = [
    "All",
    "Salon",
    "Barbershop",
    "Car Wash",
    "Laundry",
    "Shoe Wash",
  ];

  // TOGGLE FAVORITE
  const toggleFavorite = (serviceId) => {
    let updatedFavorites = [];
    if (favorites.includes(serviceId)) {
      updatedFavorites = favorites.filter((id) => id !== serviceId);
    } else {
      updatedFavorites = [...favorites, serviceId];
    }
    setFavorites(updatedFavorites);
    localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
  };

  // FILTER & SORT SERVICES
  const filteredServices = useMemo(() => {
    let filtered = services.filter((service) => {
      const matchesSearch =
        service.service_name?.toLowerCase().includes(search.toLowerCase()) ||
        service.business_name?.toLowerCase().includes(search.toLowerCase()) ||
        service.provider_name?.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" ||
        service.category
          ?.toLowerCase()
          .includes(selectedCategory.toLowerCase());

      return matchesSearch && matchesCategory;
    });

    // SORTING
    if (sortBy === "price-low") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      filtered.sort(
        (a, b) => (b.average_rating || 0) - (a.average_rating || 0),
      );
    }
    // "popular" is default - no sorting needed

    return filtered;
  }, [services, search, selectedCategory, sortBy]);

  // LOADING
  if (loading) {
    return (
      <div className="marketplace-loading">
        <div className="marketplace-loading-content">
          <Loader2 size={50} className="marketplace-loading-spinner" />
          <p className="marketplace-loading-text">Loading marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="marketplace-container">
      {/* BACKGROUND */}
      <div className="marketplace-bg">
        <div className="marketplace-bg-blur-1" />
        <div className="marketplace-bg-blur-2" />
      </div>

      {/* CONTENT */}
      <div className="marketplace-content">
        {/* HERO SECTION */}
        <div className="marketplace-hero">
          <div className="marketplace-hero-badge">
            <Sparkles size={16} />
            Discover Premium Services
          </div>
          <h1 className="marketplace-hero-title">
            Find Trusted
            <span className="marketplace-hero-highlight">
              {" "}
              Service Providers
            </span>
          </h1>
          <p className="marketplace-hero-description">
            Browse professional services near you and book instantly through
            MultiServe.
          </p>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="marketplace-search-container">
          <div className="marketplace-search-wrapper">
            <div className="marketplace-search-input-wrapper">
              <Search className="marketplace-search-icon" />
              <input
                type="text"
                placeholder="Search services, providers or businesses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="marketplace-search-input"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="marketplace-filter-btn"
            >
              <Filter size={20} />
              Filters
            </button>
          </div>

          {/* FILTER PANEL */}
          {showFilters && (
            <div className="marketplace-filter-panel">
              <div className="marketplace-filter-header">
                <h3 className="marketplace-filter-title">Sort Services</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="marketplace-filter-close"
                >
                  <X size={18} />
                </button>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="marketplace-sort-select"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="price-low">Lowest Price</option>
                <option value="price-high">Highest Price</option>
              </select>
            </div>
          )}

          {/* CATEGORIES */}
          <div className="marketplace-categories">
            {categories.map((category, index) => (
              <button
                key={index}
                onClick={() => setSelectedCategory(category)}
                className={`marketplace-category-btn ${
                  selectedCategory === category
                    ? "marketplace-category-active"
                    : ""
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* SERVICES GRID */}
        {filteredServices.length > 0 ? (
          <div className="marketplace-services-grid">
            {filteredServices.map((service) => (
              <div key={service.id} className="marketplace-service-card">
                {/* IMAGE SECTION */}
                <div className="marketplace-service-image">
                  <img
                    src={
                      service.image ||
                      "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=1200"
                    }
                    alt={service.service_name}
                    className="marketplace-service-img"
                  />
                  <div className="marketplace-service-overlay" />

                  {/* FAVORITE BUTTON */}
                  <button
                    onClick={() => toggleFavorite(service.id)}
                    className={`marketplace-favorite-btn ${favorites.includes(service.id) ? "favorite-active" : ""}`}
                  >
                    <Heart
                      size={20}
                      fill={
                        favorites.includes(service.id) ? "currentColor" : "none"
                      }
                    />
                  </button>

                  {/* PRICE BADGE */}
                  <div className="marketplace-service-price">
                    R{service.price}
                  </div>

                  {/* POPULAR BADGE */}
                  {service.total_reviews > 10 && (
                    <div className="marketplace-popular-badge">
                      <Flame size={14} />
                      Popular
                    </div>
                  )}
                </div>

                {/* CONTENT */}
                <div className="marketplace-service-content">
                  {/* CATEGORY */}
                  <div className="marketplace-service-category">
                    <Sparkles size={14} />
                    {service.category || "Professional"}
                  </div>

                  {/* TITLE */}
                  <h2 className="marketplace-service-title">
                    {service.service_name}
                  </h2>

                  {/* DESCRIPTION */}
                  <p className="marketplace-service-description">
                    {service.description}
                  </p>

                  {/* DETAILS */}
                  <div className="marketplace-service-details">
                    <div className="marketplace-service-detail">
                      <span className="marketplace-detail-label">Provider</span>
                      <span className="marketplace-detail-value">
                        {service.provider_name}
                      </span>
                    </div>
                    <div className="marketplace-service-detail">
                      <span className="marketplace-detail-label">Business</span>
                      <span className="marketplace-detail-value">
                        {service.business_name}
                      </span>
                    </div>
                    <div className="marketplace-service-detail">
                      <span className="marketplace-detail-label">
                        <MapPin size={14} /> Location
                      </span>
                      <span className="marketplace-detail-value">
                        {service.city || "Unknown"}
                      </span>
                    </div>
                    <div className="marketplace-service-detail">
                      <span className="marketplace-detail-label">
                        <Clock3 size={14} /> Duration
                      </span>
                      <span className="marketplace-detail-value">
                        {service.duration_minutes || 60} mins
                      </span>
                    </div>
                  </div>

                  {/* REVIEWS & VERIFIED */}
                  <div className="marketplace-service-reviews">
                    <div className="marketplace-rating">
                      <Star size={16} fill="currentColor" />
                      <span className="marketplace-rating-value">
                        {service.average_rating || "5.0"}
                      </span>
                    </div>
                    <span className="marketplace-review-count">
                      ({service.total_reviews || 0} reviews)
                    </span>
                    <div className="marketplace-verified">
                      <BadgeCheck size={14} />
                      Verified
                    </div>
                  </div>

                  {/* BOOK BUTTON */}
                  <button
                    onClick={() =>
                      navigate("/customer/book-service", { state: service })
                    }
                    className="marketplace-book-btn"
                  >
                    Book Service
                    <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="marketplace-empty-state">
            <Search size={80} className="marketplace-empty-icon" />
            <h2 className="marketplace-empty-title">No Services Found</h2>
            <p className="marketplace-empty-text">
              We couldn't find any services matching your search criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Marketplace;
