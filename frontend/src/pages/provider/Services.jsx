import { useEffect, useState } from "react";
import API from "../../api/axios";
import ProviderSidebar from "../../components/provider/ProviderSidebar";
import ProviderNavbar from "../../components/provider/ProviderNavbar";
import {
  BriefcaseBusiness,
  Clock3,
  DollarSign,
  Trash2,
  Loader2,
  Plus,
  FileText,
  Sparkles,
} from "lucide-react";
import "../../styles/Provider.css";

function Services() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [services, setServices] = useState([]);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    service_name: "",
    description: "",
    price: "",
    duration_minutes: "",
  });

  // FETCH BUSINESS
  const fetchBusiness = async () => {
    try {
      const res = await API.get("/business/my-business");
      setBusiness(res.data);
    } catch (error) {
      console.error("Error fetching business:", error);
    }
  };

  // FETCH SERVICES
  const fetchServices = async () => {
    try {
      const res = await API.get("/services/provider");
      setServices(res.data || []);
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusiness();
    fetchServices();
  }, []);

  // HANDLE CHANGE
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // CREATE SERVICE
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    if (!business) {
      setError("Please create a business first");
      return;
    }

    try {
      setCreating(true);
      await API.post("/services/create", {
        ...formData,
        business_id: business.id,
      });
      setSuccess("Service created successfully");
      setFormData({
        service_name: "",
        description: "",
        price: "",
        duration_minutes: "",
      });
      fetchServices();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create service");
    } finally {
      setCreating(false);
    }
  };

  // DELETE SERVICE
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this service?")) {
      return;
    }
    try {
      await API.delete(`/services/delete/${id}`);
      setServices(services.filter((service) => service.id !== id));
    } catch (error) {
      console.error("Error deleting service:", error);
    }
  };

  // LOADING
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <Loader2 className="spinner" size={24} />
          <span>Loading services...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="provider-dashboard">
      {/* SIDEBAR */}
      <ProviderSidebar
  isOpen={sidebarOpen}
  onClose={() =>
    setSidebarOpen(false)
  }
/>

      {/* MAIN CONTENT */}
      <div className="provider-main">
        {/* NAVBAR */}
        <ProviderNavbar
  toggleSidebar={() =>
    setSidebarOpen(
      (previous) => !previous
    )
  }
/>

        {/* CONTENT */}
        <div className="provider-main-content">
          {/* HERO SECTION */}
          <div className="services-hero">
            <div className="services-hero-bg" />
            <div className="services-hero-content">
              <div className="services-hero-badge">
                <Sparkles size={16} />
                Services Management
              </div>
              <h1 className="services-hero-title">Your Services 🚀</h1>
              <p className="services-hero-description">
                Create, manage and optimize all your business services from one
                professional dashboard.
              </p>
            </div>
          </div>

          {/* ALERTS */}
          {success && (
            <div className="alert-success">
              <svg
                className="alert-icon"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              {success}
            </div>
          )}

          {error && (
            <div className="alert-error">
              <svg
                className="alert-icon"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </div>
          )}

          {/* CREATE FORM */}
          <div className="services-form-container">
            <div className="services-form-header">
              <div className="services-form-icon">
                <Plus size={26} />
              </div>
              <div>
                <h2 className="services-form-title">Add New Service</h2>
                <p className="services-form-subtitle">
                  Create a new service for customers
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="services-form">
              {/* Service Name */}
              <div className="form-field">
                <label className="form-label">Service Name</label>
                <input
                  type="text"
                  name="service_name"
                  value={formData.service_name}
                  onChange={handleChange}
                  placeholder="Enter service name"
                  required
                  className="form-input-plain"
                />
              </div>

              {/* Price */}
              <div className="form-field">
                <label className="form-label">Price (R)</label>
                <div className="input-wrapper">
                  <DollarSign className="input-icon" />
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="Service price"
                    required
                    className="form-input"
                  />
                </div>
              </div>

              {/* Duration */}
              <div className="form-field">
                <label className="form-label">Duration (Minutes)</label>
                <div className="input-wrapper">
                  <Clock3 className="input-icon" />
                  <input
                    type="number"
                    name="duration_minutes"
                    value={formData.duration_minutes}
                    onChange={handleChange}
                    placeholder="Duration in minutes"
                    required
                    className="form-input"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="form-field-full">
                <label className="form-label">Description</label>
                <div className="input-wrapper">
                  <FileText className="input-icon textarea-icon" />
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Service description..."
                    required
                    className="form-textarea"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={creating}
                className="services-submit-btn"
              >
                {creating ? (
                  <>
                    <Loader2 className="spinner" />
                    Creating Service...
                  </>
                ) : (
                  <>
                    <Plus size={20} />
                    Add Service
                  </>
                )}
              </button>
            </form>
          </div>

          {/* SERVICES LIST */}
          <div className="services-list-section">
            <div className="services-list-header">
              <div>
                <h2 className="services-list-title">Existing Services</h2>
                <p className="services-list-subtitle">
                  Manage all your registered services
                </p>
              </div>
            </div>

            {services.length > 0 ? (
              <div className="services-grid">
                {services.map((service) => (
                  <div key={service.id} className="service-card">
                    <div className="service-card-header">
                      <div className="service-card-icon">
                        <BriefcaseBusiness size={28} />
                      </div>
                      <button
                        onClick={() => handleDelete(service.id)}
                        className="service-delete-btn"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                    <h3 className="service-card-title">
                      {service.service_name}
                    </h3>
                    <p className="service-card-description">
                      {service.description}
                    </p>

                    <div className="service-card-footer">
                      <div>
                        <p className="service-card-label">Price</p>
                        <h4 className="service-card-price">R{service.price}</h4>
                      </div>
                      <div className="text-right">
                        <p className="service-card-label">Duration</p>
                        <h4 className="service-card-duration">
                          {service.duration_minutes} mins
                        </h4>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="services-empty-state">
                <div className="services-empty-icon">
                  <BriefcaseBusiness size={40} />
                </div>
                <h3 className="services-empty-title">No Services Yet</h3>
                <p className="services-empty-description">
                  Start by creating your first business service for customers.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Services;
