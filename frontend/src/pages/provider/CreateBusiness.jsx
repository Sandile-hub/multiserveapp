import { useState } from "react";
import API from "../../api/axios";
import ProviderSidebar from "../../components/provider/ProviderSidebar";
import ProviderNavbar from "../../components/provider/ProviderNavbar";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  FileText,
  Briefcase,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import "../../styles/Provider.css";

function CreateBusiness() {
  const [formData, setFormData] = useState({
    business_name: "",
    category: "",
    description: "",
    address: "",
    city: "",
    province: "",
    postal_code: "",
    business_phone: "",
    business_email: "",
  });
  const [sidebarOpen, setSidebarOpen] =
  useState(false)
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // HANDLE CHANGE
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // HANDLE SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      setLoading(true);
      const res = await API.post("/business/create", formData);
      setSuccess(res.data.message || "Business created successfully!");

      // RESET FORM
      setFormData({
        business_name: "",
        category: "",
        description: "",
        address: "",
        city: "",
        province: "",
        postal_code: "",
        business_phone: "",
        business_email: "",
      });
    } catch (error) {
      setError(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

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
          <div className="create-business-hero">
            <div className="create-business-hero-bg" />
            <div className="create-business-hero-content">
              <div className="create-business-hero-badge">
                <Building2 size={16} />
                Business Registration
              </div>
              <h1 className="create-business-hero-title">
                Register Your Business 🚀
              </h1>
              <p className="create-business-hero-description">
                Create your business profile and start receiving bookings from
                customers on MultiServe.
              </p>
            </div>
          </div>

          {/* ALERTS */}
          {success && (
            <div className="alert-success">
              <CheckCircle2 size={20} />
              {success}
            </div>
          )}

          {error && (
            <div className="alert-error">
              <XCircle size={20} />
              {error}
            </div>
          )}

          {/* FORM SECTION */}
          <div className="create-business-form-container">
            <form onSubmit={handleSubmit} className="create-business-form">
              {/* Business Name */}
              <div className="form-field">
                <label className="form-label">Business Name</label>
                <div className="input-wrapper">
                  <Building2 className="input-icon" />
                  <input
                    type="text"
                    name="business_name"
                    value={formData.business_name}
                    onChange={handleChange}
                    placeholder="Enter business name"
                    required
                    className="form-input"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="form-field">
                <label className="form-label">Category</label>
                <div className="input-wrapper">
                  <Briefcase className="input-icon" />
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="form-select"
                  >
                    <option value="">Select category</option>
                    <option value="Salon">Salon</option>
                    <option value="Barbershop">Barbershop</option>
                    <option value="Car Wash">Car Wash</option>
                    <option value="Laundry Hub">Laundry Hub</option>
                    <option value="Shoe Wash">Shoe Wash</option>
                  </select>
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
                    placeholder="Describe your business..."
                    required
                    className="form-textarea"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="form-field">
                <label className="form-label">Address</label>
                <div className="input-wrapper">
                  <MapPin className="input-icon" />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Street address"
                    required
                    className="form-input"
                  />
                </div>
              </div>

              {/* City */}
              <div className="form-field">
                <label className="form-label">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Enter city"
                  required
                  className="form-input-plain"
                />
              </div>

              {/* Province */}
              <div className="form-field">
                <label className="form-label">Province</label>
                <input
                  type="text"
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  placeholder="Enter province"
                  required
                  className="form-input-plain"
                />
              </div>

              {/* Postal Code */}
              <div className="form-field">
                <label className="form-label">Postal Code</label>
                <input
                  type="text"
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={handleChange}
                  placeholder="Postal code"
                  required
                  className="form-input-plain"
                />
              </div>

              {/* Business Phone */}
              <div className="form-field">
                <label className="form-label">Business Phone</label>
                <div className="input-wrapper">
                  <Phone className="input-icon" />
                  <input
                    type="tel"
                    name="business_phone"
                    value={formData.business_phone}
                    onChange={handleChange}
                    placeholder="Phone number"
                    required
                    className="form-input"
                  />
                </div>
              </div>

              {/* Business Email */}
              <div className="form-field">
                <label className="form-label">Business Email</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" />
                  <input
                    type="email"
                    name="business_email"
                    value={formData.business_email}
                    onChange={handleChange}
                    placeholder="Business email"
                    required
                    className="form-input"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? (
                  <>
                    <Loader2 className="spinner" />
                    Creating Business...
                  </>
                ) : (
                  <>
                    <Building2 size={20} />
                    Register Business
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateBusiness;
