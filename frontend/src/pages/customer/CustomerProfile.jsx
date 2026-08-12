import { useEffect, useMemo, useState } from "react";
import API from "../../api/axios";

import CustomerSidebar from "../../components/customer/CustomerSidebar";
import CustomerNavbar from "../../components/customer/CustomerNavbar";

import {
  User,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Camera,
  Pencil,
  CalendarDays,
  BadgeCheck,
  Sparkles,
  Lock,
  Save,
  Globe,
  Briefcase,
  Loader2,
  Eye,
  EyeOff,
  Upload,
} from "lucide-react";

import "../../styles/Customer.css";

function CustomerProfile() {
  const storedUser = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const [user, setUser] = useState(storedUser);

  const [loading, setLoading] = useState(false);

  const [fetching, setFetching] =
    useState(true);

  const [editing, setEditing] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [profileImage, setProfileImage] =
    useState("");

  const [passwordData, setPasswordData] =
    useState({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

  const [formData, setFormData] =
    useState({
      full_name: "",
      email: "",
      phone: "",
      city: "",
      bio: "",
      profession: "",
    });

  // =========================================
  // FETCH PROFILE
  // =========================================

  const fetchProfile = async () => {
    try {
      setFetching(true);

      const response = await API.get(
        "/customers/profile"
      );

      const profile = response.data.user;

      setUser(profile);

      setFormData({
        full_name:
          profile.full_name || "",

        email: profile.email || "",

        phone: profile.phone || "",

        city: profile.city || "",

        bio:
          profile.bio ||
          "Professional MultiServe customer.",

        profession:
          profile.profession || "Customer",
      });

      setProfileImage(
        profile.profile_image || ""
      );

      localStorage.setItem(
        "user",
        JSON.stringify(profile)
      );
    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message ||
          "Failed to load profile"
      );
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // =========================================
  // HANDLE INPUT CHANGE
  // =========================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // =========================================
  // HANDLE PASSWORD CHANGE
  // =========================================

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  // =========================================
  // SAVE PROFILE
  // =========================================

  const saveProfile = async () => {
    try {
      setLoading(true);

      const response = await API.put(
        "/customers/profile",
        formData
      );

      const updatedUser =
        response.data.user;

      setUser(updatedUser);

      setProfileImage(
        updatedUser.profile_image ||
          profileImage
      );

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      alert(
        "Profile updated successfully"
      );

      setEditing(false);
    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message ||
          "Update failed"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // CHANGE PASSWORD
  // =========================================

  const changePassword = async () => {
    try {
      if (
        !passwordData.currentPassword ||
        !passwordData.newPassword ||
        !passwordData.confirmPassword
      ) {
        return alert(
          "Please fill all password fields"
        );
      }

      if (
        passwordData.newPassword !==
        passwordData.confirmPassword
      ) {
        return alert(
          "Passwords do not match"
        );
      }

      if (
        passwordData.newPassword.length < 6
      ) {
        return alert(
          "Password must be at least 6 characters"
        );
      }

      setLoading(true);

      await API.put(
        "/customers/change-password",
        {
          currentPassword:
            passwordData.currentPassword,

          newPassword:
            passwordData.newPassword,
        }
      );

      alert(
        "Password updated successfully"
      );

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message ||
          "Failed to update password"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // PROFILE IMAGE UPLOAD
  // =========================================

  const handleImageUpload = async (
    e
  ) => {
    try {
      const file = e.target.files[0];

      if (!file) return;

      const imageData = new FormData();

      imageData.append(
        "profile_image",
        file
      );

      setLoading(true);

      const response = await API.put(
        "/customers/upload-profile-image",
        imageData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      const imageUrl =
        response.data.profile_image;

      setProfileImage(imageUrl);

      const updatedUser = {
        ...user,
        profile_image: imageUrl,
      };

      setUser(updatedUser);

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      alert(
        "Profile image updated successfully"
      );
    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message ||
          "Failed to upload image"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // INITIALS
  // =========================================

  const initials = useMemo(() => {
    if (!formData.full_name) return "U";

    return formData.full_name
      .split(" ")
      .map((name) => name.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [formData.full_name]);

  // =========================================
  // LOADING
  // =========================================

  if (fetching) {
    return (
      <div className="customer-loading-screen">
        <Loader2
          size={45}
          className="spinner"
        />
      </div>
    );
  }

  return (
    <div className="customer-dashboard">
      <CustomerSidebar />

      <div className="customer-main">
        <CustomerNavbar />

        <div className="customer-main-content">{/* HERO */}
<div className="profile-hero">

  <div className="profile-hero-bg-1" />
  <div className="profile-hero-bg-2" />

  <div className="profile-hero-content">

    {/* LEFT */}
    <div className="profile-hero-left">

      {/* AVATAR */}
      <div className="profile-avatar-wrapper">

        {profileImage ? (
          <img
            src={profileImage}
            alt="Profile"
            className="profile-avatar-image"
            onError={(e) => {
              e.target.src = "/default-avatar.png";
            }}
          />
        ) : (
          <div className="profile-avatar-fallback">
            {initials}
          </div>
        )}

        <div className="online-indicator"></div>

        <label className="profile-avatar-edit">
          <Camera size={18} />

          <input
            type="file"
            accept="image/*"
            hidden
            onChange={handleImageUpload}
          />
        </label>

      </div>

      {/* INFO */}
      <div className="profile-hero-info">

        <div className="profile-badge">
          <Sparkles size={16} />
          Premium Customer
        </div>

        <h1 className="profile-name">
          {formData.full_name || "Customer"}
        </h1>

        <p className="profile-bio">
          {formData.bio || "Welcome to MultiServe"}
        </p>

        <div className="profile-tags">

          <div className="profile-tag">
            <BadgeCheck size={16} />

            {user?.is_verified
              ? "Verified User"
              : "Unverified User"}
          </div>

          <div className="profile-tag">
            <CalendarDays size={16} />

            Joined{" "}

            {user?.created_at
              ? new Date(user.created_at).getFullYear()
              : "2026"}
          </div>

        </div>

      </div>

    </div>

    {/* ACTION BUTTON */}
    <div>

      {!editing ? (
        <button
          onClick={() => setEditing(true)}
          className="profile-edit-btn"
        >
          <Pencil size={18} />
          Edit Profile
        </button>
      ) : (
        <button
          onClick={saveProfile}
          disabled={loading}
          className="profile-save-btn"
        >
          {loading ? (
            <Loader2
              size={18}
              className="spinner"
            />
          ) : (
            <Save size={18} />
          )}

          Save Changes
        </button>
      )}

    </div>

  </div>

</div>

          {/* PROFILE GRID */}
          <div className="profile-grid">
            {/* LEFT */}
            <div className="profile-left">
              {/* PERSONAL INFO */}
              <div className="profile-card">
                <div className="profile-card-header">
                  <div className="profile-card-icon cyan">
                    <User size={24} />
                  </div>

                  <div>
                    <h2 className="profile-card-title">
                      Personal Information
                    </h2>

                    <p className="profile-card-subtitle">
                      Manage your details
                    </p>
                  </div>
                </div>

                <div className="profile-form-grid">
                  <div className="profile-form-field">
                    <label className="profile-label">
                      Full Name
                    </label>

                    <div className="profile-input-wrapper">
                      <User
                        size={18}
                        className="profile-input-icon"
                      />

                      <input
                        type="text"
                        name="full_name"
                        value={
                          formData.full_name
                        }
                        onChange={
                          handleChange
                        }
                        disabled={!editing}
                        className="profile-input"
                      />
                    </div>
                  </div>

                  <div className="profile-form-field">
                    <label className="profile-label">
                      Email
                    </label>

                    <div className="profile-input-wrapper">
                      <Mail
                        size={18}
                        className="profile-input-icon"
                      />

                      <input
                        type="email"
                        name="email"
                        value={
                          formData.email
                        }
                        onChange={
                          handleChange
                        }
                        disabled={!editing}
                        className="profile-input"
                      />
                    </div>
                  </div>

                  <div className="profile-form-field">
                    <label className="profile-label">
                      Phone
                    </label>

                    <div className="profile-input-wrapper">
                      <Phone
                        size={18}
                        className="profile-input-icon"
                      />

                      <input
                        type="text"
                        name="phone"
                        value={
                          formData.phone
                        }
                        onChange={
                          handleChange
                        }
                        disabled={!editing}
                        className="profile-input"
                      />
                    </div>
                  </div>

                  <div className="profile-form-field">
                    <label className="profile-label">
                      City
                    </label>

                    <div className="profile-input-wrapper">
                      <MapPin
                        size={18}
                        className="profile-input-icon"
                      />

                      <input
                        type="text"
                        name="city"
                        value={
                          formData.city
                        }
                        onChange={
                          handleChange
                        }
                        disabled={!editing}
                        className="profile-input"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ABOUT */}
              <div className="profile-card">
                <div className="profile-card-header">
                  <div className="profile-card-icon purple">
                    <Briefcase size={24} />
                  </div>

                  <div>
                    <h2 className="profile-card-title">
                      About Me
                    </h2>

                    <p className="profile-card-subtitle">
                      Additional profile
                      information
                    </p>
                  </div>
                </div>

                <div className="profile-about-section">
                  <div className="profile-form-field">
                    <label className="profile-label">
                      Profession
                    </label>

                    <div className="profile-input-wrapper">
                      <Globe
                        size={18}
                        className="profile-input-icon"
                      />

                      <input
                        type="text"
                        name="profession"
                        value={
                          formData.profession
                        }
                        onChange={
                          handleChange
                        }
                        disabled={!editing}
                        className="profile-input"
                      />
                    </div>
                  </div>

                  <div className="profile-form-field">
                    <label className="profile-label">
                      Bio
                    </label>

                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      disabled={!editing}
                      className="profile-textarea"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="profile-right">
              {/* SECURITY */}
              <div className="profile-card">
                <div className="profile-card-header">
                  <div className="profile-card-icon green">
                    <ShieldCheck size={24} />
                  </div>

                  <div>
                    <h2 className="profile-card-title">
                      Security
                    </h2>

                    <p className="profile-card-subtitle">
                      Manage your password
                    </p>
                  </div>
                </div>

                <div className="profile-security-form">
                  <div className="profile-form-field">
                    <label className="profile-label">
                      Current Password
                    </label>

                    <div className="profile-input-wrapper">
                      <Lock
                        size={18}
                        className="profile-input-icon"
                      />

                      <input
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        name="currentPassword"
                        value={
                          passwordData.currentPassword
                        }
                        onChange={
                          handlePasswordChange
                        }
                        className="profile-input"
                      />

                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() =>
                          setShowPassword(
                            !showPassword
                          )
                        }
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="profile-form-field">
                    <label className="profile-label">
                      New Password
                    </label>

                    <div className="profile-input-wrapper">
                      <Lock
                        size={18}
                        className="profile-input-icon"
                      />

                      <input
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        name="newPassword"
                        value={
                          passwordData.newPassword
                        }
                        onChange={
                          handlePasswordChange
                        }
                        className="profile-input"
                      />
                    </div>
                  </div>

                  <div className="profile-form-field">
                    <label className="profile-label">
                      Confirm Password
                    </label>

                    <div className="profile-input-wrapper">
                      <Lock
                        size={18}
                        className="profile-input-icon"
                      />

                      <input
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        name="confirmPassword"
                        value={
                          passwordData.confirmPassword
                        }
                        onChange={
                          handlePasswordChange
                        }
                        className="profile-input"
                      />
                    </div>
                  </div>

                  <button
                    onClick={changePassword}
                    disabled={loading}
                    className="profile-save-btn full-width"
                  >
                    {loading ? (
                      <Loader2
                        size={18}
                        className="spinner"
                      />
                    ) : (
                      <ShieldCheck size={18} />
                    )}

                    Update Password
                  </button>
                </div>
              </div>

              {/* STATUS */}
              <div className="profile-status-card">
                <div className="profile-status-glow" />

                <div className="profile-status-content">
                  <div className="profile-status-icon">
                    <BadgeCheck size={40} />
                  </div>

                  <h2 className="profile-status-title">
                    {user.is_verified
                      ? "Verified Account"
                      : "Account Verification"}
                  </h2>

                  <p className="profile-status-text">
                    {user.is_verified
                      ? "Your account is fully verified and protected."
                      : "Complete account verification to unlock all platform features."}
                  </p>

                  <button className="profile-status-btn">
                    <Upload size={18} />
                    Upload Documents
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerProfile;