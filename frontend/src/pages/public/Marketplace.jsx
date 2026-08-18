import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";

import {
  Search,
  MapPin,
  Star,
  Clock3,
  Sparkles,
  Loader2,
  ArrowRight,
  Heart,
  Flame,
  BadgeCheck,
  Filter,
  X,
  UserRound,
  Building2,
  Tag,
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

  // ==========================================
  // FETCH SERVICES
  // ==========================================

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

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    fetchServices();

    const savedFavorites = JSON.parse(
      localStorage.getItem("favorites") || "[]"
    );

    setFavorites(savedFavorites);
  }, []);

  // ==========================================
  // CATEGORIES
  // ==========================================

  const categories = [
    "All",
    "Salon",
    "Barbershop",
    "Car Wash",
    "Laundry",
    "Shoe Wash",
  ];

  // ==========================================
  // TOGGLE FAVORITE
  // ==========================================

  const toggleFavorite = (serviceId) => {
    let updatedFavorites;

    if (favorites.includes(serviceId)) {
      updatedFavorites = favorites.filter(
        (id) => id !== serviceId
      );
    } else {
      updatedFavorites = [...favorites, serviceId];
    }

    setFavorites(updatedFavorites);

    localStorage.setItem(
      "favorites",
      JSON.stringify(updatedFavorites)
    );
  };

  // ==========================================
  // FILTER + SORT
  // ==========================================

  const filteredServices = useMemo(() => {
    let filtered = services.filter((service) => {
      const searchTerm = search.toLowerCase().trim();

      const matchesSearch =
        service.service_name
          ?.toLowerCase()
          .includes(searchTerm) ||
        service.business_name
          ?.toLowerCase()
          .includes(searchTerm) ||
        service.provider_name
          ?.toLowerCase()
          .includes(searchTerm) ||
        service.category
          ?.toLowerCase()
          .includes(searchTerm) ||
        service.city
          ?.toLowerCase()
          .includes(searchTerm);

      const matchesCategory =
        selectedCategory === "All" ||
        service.category
          ?.toLowerCase()
          .includes(selectedCategory.toLowerCase());

      return matchesSearch && matchesCategory;
    });

    if (sortBy === "price-low") {
      filtered.sort(
        (a, b) =>
          Number(a.price || 0) -
          Number(b.price || 0)
      );
    }

    if (sortBy === "price-high") {
      filtered.sort(
        (a, b) =>
          Number(b.price || 0) -
          Number(a.price || 0)
      );
    }

    if (sortBy === "rating") {
      filtered.sort(
        (a, b) =>
          Number(b.average_rating || 0) -
          Number(a.average_rating || 0)
      );
    }

    return filtered;
  }, [
    services,
    search,
    selectedCategory,
    sortBy,
  ]);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="marketplace-loading">
        <div className="marketplace-loading-content">
          <Loader2
            size={50}
            className="marketplace-loading-spinner"
          />

          <p className="marketplace-loading-text">
            Loading marketplace...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN
  // ==========================================

  return (
    <div className="marketplace-container">

      {/* BACKGROUND */}

      <div className="marketplace-bg">
        <div className="marketplace-bg-blur-1" />
        <div className="marketplace-bg-blur-2" />
      </div>

      {/* CONTENT */}

      <div className="marketplace-content">

        {/* ======================================
            HERO
        ====================================== */}

        <div className="marketplace-hero">

          <div className="marketplace-hero-badge">
            <Sparkles size={16} />
            Discover Premium Services
          </div>

          <h1 className="marketplace-hero-title">
            Find Trusted
            <span className="marketplace-hero-highlight">
              {" "}Service Providers
            </span>
          </h1>

          <p className="marketplace-hero-description">
            Browse professional services near you
            and book instantly through MultiServe.
          </p>

        </div>

        {/* ======================================
            SEARCH + FILTER
        ====================================== */}

        <div className="marketplace-search-container">

          <div className="marketplace-search-wrapper">

            <div className="marketplace-search-input-wrapper">

              <Search
                className="marketplace-search-icon"
                size={21}
              />

              <input
                type="text"
                placeholder="Search services, providers or businesses..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="marketplace-search-input"
              />

              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="marketplace-search-clear"
                >
                  <X size={18} />
                </button>
              )}

            </div>

            <button
              onClick={() =>
                setShowFilters(!showFilters)
              }
              className="marketplace-filter-btn"
            >
              <Filter size={20} />

              <span>Filters</span>
            </button>

          </div>

          {/* FILTER PANEL */}

          {showFilters && (
            <div className="marketplace-filter-panel">

              <div className="marketplace-filter-header">

                <div>
                  <h3 className="marketplace-filter-title">
                    Sort Services
                  </h3>

                  <p className="marketplace-filter-subtitle">
                    Choose how services should be displayed
                  </p>
                </div>

                <button
                  onClick={() =>
                    setShowFilters(false)
                  }
                  className="marketplace-filter-close"
                >
                  <X size={18} />
                </button>

              </div>

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value)
                }
                className="marketplace-sort-select"
              >
                <option value="popular">
                  Most Popular
                </option>

                <option value="rating">
                  Highest Rated
                </option>

                <option value="price-low">
                  Lowest Price
                </option>

                <option value="price-high">
                  Highest Price
                </option>
              </select>

            </div>
          )}

          {/* CATEGORIES */}

          <div className="marketplace-categories">

            {categories.map((category) => (
              <button
                key={category}
                onClick={() =>
                  setSelectedCategory(category)
                }
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

        {/* RESULTS COUNT */}

        <div className="marketplace-results-header">

          <div>
            <span className="marketplace-results-count">
              {filteredServices.length}
            </span>

            <span className="marketplace-results-label">
              {" "}services available
            </span>
          </div>

          {selectedCategory !== "All" && (
            <span className="marketplace-current-filter">
              {selectedCategory}
            </span>
          )}

        </div>

        {/* ======================================
            SERVICE GRID
        ====================================== */}

        {filteredServices.length > 0 ? (

          <div className="marketplace-services-grid">

            {filteredServices.map((service) => {

              const isFavorite =
                favorites.includes(service.id);

              const rating =
                Number(
                  service.average_rating || 0
                ).toFixed(1);

              const isPopular =
                Number(
                  service.total_reviews || 0
                ) > 10;

              return (

                <div
                  key={service.id}
                  className="marketplace-service-card"
                >

                  {/* =================================
                      CARD HEADER — NO IMAGE
                  ================================= */}

                  <div className="marketplace-card-header">

                    <div className="marketplace-card-icon">

                      <Sparkles size={27} />

                    </div>

                    <div className="marketplace-card-header-info">

                      <div className="marketplace-card-category">

                        <Tag size={13} />

                        {service.category ||
                          "Professional Service"}

                      </div>

                      {isPopular && (
                        <div className="marketplace-popular-badge">
                          <Flame size={13} />
                          Popular
                        </div>
                      )}

                    </div>

                    <button
                      onClick={() =>
                        toggleFavorite(service.id)
                      }
                      className={`marketplace-favorite-btn ${
                        isFavorite
                          ? "favorite-active"
                          : ""
                      }`}
                      aria-label="Add to favorites"
                    >
                      <Heart
                        size={19}
                        fill={
                          isFavorite
                            ? "currentColor"
                            : "none"
                        }
                      />
                    </button>

                  </div>

                  {/* =================================
                      PRICE
                  ================================= */}

                  <div className="marketplace-price-row">

                    <div>

                      <span className="marketplace-price-label">
                        Starting from
                      </span>

                      <div className="marketplace-service-price">
                        R
                        {Number(
                          service.price || 0
                        ).toFixed(2)}
                      </div>

                    </div>

                    <div className="marketplace-verified">
                      <BadgeCheck size={14} />
                      Verified
                    </div>

                  </div>

                  {/* =================================
                      CONTENT
                  ================================= */}

                  <div className="marketplace-service-content">

                    <h2 className="marketplace-service-title">
                      {service.service_name ||
                        "Unnamed Service"}
                    </h2>

                    <p className="marketplace-service-description">
                      {service.description ||
                        "Professional service provided by a trusted MultiServe provider."}
                    </p>

                    {/* DETAILS */}

                    <div className="marketplace-service-details">

                      <div className="marketplace-service-detail">

                        <span className="marketplace-detail-label">
                          <UserRound size={15} />
                          Provider
                        </span>

                        <span className="marketplace-detail-value">
                          {service.provider_name ||
                            "Provider"}
                        </span>

                      </div>

                      <div className="marketplace-service-detail">

                        <span className="marketplace-detail-label">
                          <Building2 size={15} />
                          Business
                        </span>

                        <span className="marketplace-detail-value">
                          {service.business_name ||
                            "Business"}
                        </span>

                      </div>

                      <div className="marketplace-service-detail">

                        <span className="marketplace-detail-label">
                          <MapPin size={15} />
                          Location
                        </span>

                        <span className="marketplace-detail-value">
                          {service.city ||
                            "Location unavailable"}
                        </span>

                      </div>

                      <div className="marketplace-service-detail">

                        <span className="marketplace-detail-label">
                          <Clock3 size={15} />
                          Duration
                        </span>

                        <span className="marketplace-detail-value">
                          {service.duration_minutes ||
                            60}{" "}
                          mins
                        </span>

                      </div>

                    </div>

                    {/* =================================
                        RATING
                    ================================= */}

                    <div className="marketplace-service-reviews">

                      <div className="marketplace-rating">

                        <Star
                          size={16}
                          fill="currentColor"
                        />

                        <span className="marketplace-rating-value">
                          {rating}
                        </span>

                      </div>

                      <span className="marketplace-review-count">
                        (
                        {service.total_reviews ||
                          0}{" "}
                        reviews)
                      </span>

                    </div>

                    {/* =================================
                        BOOK
                    ================================= */}

                    <button
                      onClick={() =>
                        navigate(
                          "/customer/book-service",
                          {
                            state: service,
                          }
                        )
                      }
                      className="marketplace-book-btn"
                    >
                      Book Service

                      <ArrowRight size={19} />
                    </button>

                  </div>

                </div>

              );
            })}

          </div>

        ) : (

          /* ======================================
             EMPTY STATE
          ====================================== */

          <div className="marketplace-empty-state">

            <div className="marketplace-empty-icon-wrapper">
              <Search
                size={40}
              />
            </div>

            <h2 className="marketplace-empty-title">
              No Services Found
            </h2>

            <p className="marketplace-empty-text">
              We couldn't find any services
              matching your search criteria.
            </p>

            {(search ||
              selectedCategory !== "All") && (
              <button
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("All");
                }}
                className="marketplace-reset-btn"
              >
                Clear Filters
              </button>
            )}

          </div>

        )}

      </div>

    </div>
  );
}

export default Marketplace;