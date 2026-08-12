import { useEffect, useState } from "react";
import API from "../../api/axios";
import ProviderSidebar from "../../components/provider/ProviderSidebar";
import ProviderNavbar from "../../components/provider/ProviderNavbar";

import {
  Camera,
  Mail,
  CalendarDays,
  Pencil,
  Save,
  Loader2,
  BadgeCheck,
  Sparkles,
  Star,
  Briefcase,
  CheckCircle2,
  X,
} from "lucide-react";

import "../../styles/Provider.css";

function ProviderProfile() {
  // ========================================
  // SAFE USER PARSING
  // ========================================

  let storedUser = {};

  try {
    const userData = localStorage.getItem("user");

    if (userData && userData !== "undefined") {
      storedUser = JSON.parse(userData);
    }
  } catch (error) {
    console.error("Error parsing user:", error);

    localStorage.removeItem("user");
  }

  // ========================================
  // STATES
  // ========================================

  const [user, setUser] = useState(storedUser);

  const [loading, setLoading] = useState(false);

  const [pageLoading, setPageLoading] = useState(true);

  const [editing, setEditing] = useState(false);

  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null);

  const [stats, setStats] = useState({
    services: 0,
    completedBookings: 0,
    rating: 0,
    revenue: 0,
  });

  const [formData, setFormData] = useState({
    full_name: storedUser?.full_name || "",

    email: storedUser?.email || "",

    phone: storedUser?.phone || "",

    address: storedUser?.address || "",

    bio: storedUser?.bio || "",
  });

  // ========================================
  // FETCH PROFILE
  // ========================================

  const fetchProfile = async () => {
    try {
      const res = await API.get("/users/provider/profile");

      const profileUser = res.data.user;

      setUser(profileUser);

      setStats(res.data.stats || {});

      setFormData({
        full_name: profileUser.full_name || "",

        email: profileUser.email || "",

        phone: profileUser.phone || "",

        address: profileUser.address || "",

        bio: profileUser.bio || "",
      });

      // UPDATE LOCAL STORAGE
      localStorage.setItem("user", JSON.stringify(profileUser));
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // ========================================
  // HANDLE INPUT CHANGE
  // ========================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ========================================
  // UPDATE PROFILE
  // ========================================

  const handleUpdate = async () => {
    try {
      setLoading(true);

      const res = await API.put("/users/profile", formData);

      const updatedUser = res.data.user;

      setUser(updatedUser);

      localStorage.setItem("user", JSON.stringify(updatedUser));

      setEditing(false);

      alert("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);

      alert(error.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // HANDLE IMAGE CHANGE
  // ========================================

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    // FILE SIZE CHECK
    if (file.size > 2 * 1024 * 1024) {
      alert("Image size must be less than 2MB");

      return;
    }

    // FILE TYPE CHECK
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");

      return;
    }

    setSelectedImage(file);
  };

  // ========================================
  // HANDLE AVATAR UPLOAD
  // ========================================

  const handleAvatarUpload = async () => {
    if (!selectedImage) {
      alert("Please select an image");

      return;
    }

    const avatarFormData = new FormData();

    avatarFormData.append("avatar", selectedImage);

    try {
      setLoading(true);

      const res = await API.post("/users/upload-avatar", avatarFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // UPDATE USER WITH NEW AVATAR
      const updatedUser = {
        ...user,
        avatar: res.data.avatar,
      };

      setUser(updatedUser);

      localStorage.setItem("user", JSON.stringify(updatedUser));

      setShowAvatarModal(false);

      setSelectedImage(null);

      alert("Avatar updated successfully");
    } catch (error) {
      console.error("Error uploading avatar:", error);

      alert(error.response?.data?.message || "Failed to upload avatar");
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // LOADING SCREEN
  // ========================================

  if (pageLoading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <Loader2 size={30} className="spinner" />

          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  // ========================================
  // AVATAR URL
  // ========================================

  const avatarUrl = user?.avatar || null;

  return (
    <div className="provider-dashboard">
      <ProviderSidebar />

      <div className="provider-main">
        <ProviderNavbar />

        <div className="provider-main-content">
          {/* HERO SECTION */}

          <div className="provider-profile-hero">
            <div className="provider-profile-hero-bg" />

            <div className="provider-profile-hero-content">
              {/* LEFT */}

              <div className="provider-profile-hero-left">
                <div className="provider-profile-avatar-wrapper">
                  <div className="provider-profile-avatar">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={user?.full_name}
                        className="provider-profile-avatar-img"
                      />
                    ) : (
                      user?.full_name?.charAt(0)?.toUpperCase() || "U"
                    )}
                  </div>

                  <button
                    onClick={() => setShowAvatarModal(true)}
                    className="provider-profile-avatar-edit"
                  >
                    <Camera size={18} />
                  </button>
                </div>

                <div>
                  <div className="provider-profile-badge">
                    <Sparkles size={14} />
                    Provider Account
                  </div>

                  <h1 className="provider-profile-name">{user?.full_name}</h1>

                  <div className="provider-profile-contact">
                    <div className="provider-profile-contact-item">
                      <Mail size={14} />
                      <span>{user?.email}</span>
                    </div>

                    <div className="provider-profile-contact-item">
                      <BadgeCheck
                        size={14}
                        className="provider-profile-verified"
                      />
                      Verified Provider
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT */}

              <button
                onClick={() => (editing ? handleUpdate() : setEditing(true))}
                disabled={loading}
                className="provider-profile-action-btn"
              >
                {loading ? (
                  <Loader2 size={18} className="spinner" />
                ) : editing ? (
                  <>
                    <Save size={18} />
                    Save Profile
                  </>
                ) : (
                  <>
                    <Pencil size={18} />
                    Edit Profile
                  </>
                )}
              </button>
            </div>
          </div>

          {/* STATS */}

          <div className="provider-profile-stats">
            <div className="stat-card">
              <div className="stat-card-icon primary">
                <Briefcase size={24} />
              </div>

              <h2 className="stat-card-value">{stats.services || 0}</h2>

              <p className="stat-card-label">Services</p>
            </div>

            <div className="stat-card">
              <div className="stat-card-icon success">
                <CheckCircle2 size={24} />
              </div>

              <h2 className="stat-card-value">
                {stats.completedBookings || 0}
              </h2>

              <p className="stat-card-label">Completed Jobs</p>
            </div>

            <div className="stat-card">
              <div className="stat-card-icon warning">
                <Star size={24} />
              </div>

              <h2 className="stat-card-value">
                ⭐ {Number(stats.rating || 0).toFixed(1)}
              </h2>

              <p className="stat-card-label">Rating</p>
            </div>

            <div className="stat-card">
              <div className="stat-card-icon revenue">
                <CalendarDays size={24} />
              </div>

              <h2 className="stat-card-value">
                R{Number(stats.revenue || 0).toLocaleString()}
              </h2>

              <p className="stat-card-label">Revenue</p>
            </div>
          </div>
        </div>
      </div>

      {/* AVATAR MODAL */}

      {showAvatarModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowAvatarModal(false)}
        >
          <div
            className="modal-container avatar-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 className="modal-title">Change Avatar</h2>

              <button
                onClick={() => setShowAvatarModal(false)}
                className="modal-close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="avatar-modal-content">
              <div className="avatar-preview">
                {selectedImage ? (
                  <img
                    src={URL.createObjectURL(selectedImage)}
                    alt="Preview"
                    className="avatar-preview-img"
                  />
                ) : (
                  <div className="avatar-preview-placeholder">
                    <Camera size={48} />
                    <p>Select an image</p>
                  </div>
                )}
              </div>

              <div className="avatar-upload-area">
                <label className="avatar-upload-label">
                  <Camera size={20} />
                  Choose Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="avatar-file-input"
                  />
                </label>

                <p className="avatar-hint">PNG, JPG up to 2MB</p>
              </div>

              <div className="modal-actions">
                <button
                  onClick={() => setShowAvatarModal(false)}
                  className="modal-btn-cancel"
                >
                  Cancel
                </button>

                <button
                  onClick={handleAvatarUpload}
                  disabled={!selectedImage || loading}
                  className="modal-btn-save"
                >
                  {loading ? (
                    <Loader2 size={18} className="spinner" />
                  ) : (
                    "Upload Avatar"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProviderProfile;
