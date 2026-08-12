import { useEffect, useState } from "react";
import API from "../../api/axios";
import ProviderSidebar from "../../components/provider/ProviderSidebar";
import ProviderNavbar from "../../components/provider/ProviderNavbar";
import {
  Bell,
  Moon,
  Shield,
  Lock,
  Globe,
  Smartphone,
  Save,
  Loader2,
  CheckCircle2,
  Sparkles,
  UserCog,
  Mail,
  Eye,
  EyeOff,
} from "lucide-react";
import "../../styles/Provider.css";

function ProviderSettings() {
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState({
    email_notifications: true,
    push_notifications: true,
    dark_mode: true,
    public_profile: true,
    two_factor_auth: false,
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // FETCH SETTINGS
  const fetchSettings = async () => {
    try {
      const res = await API.get("/users/provider/settings");
      if (res.data.settings) {
        setSettings(res.data.settings);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // TOGGLE SETTINGS
  const toggleSetting = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  // SAVE SETTINGS
  const handleSave = async () => {
    try {
      setLoading(true);
      await API.put("/users/provider/settings", settings);
      alert("Settings updated successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert(error.response?.data?.message || "Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  // HANDLE PASSWORD INPUT
  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  // UPDATE PASSWORD
  const updatePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return alert("Passwords do not match");
    }
    if (passwordData.newPassword.length < 6) {
      return alert("Password must be at least 6 characters");
    }
    try {
      setPasswordLoading(true);
      await API.put("/auth/change-password", passwordData);
      alert("Password updated successfully");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error updating password:", error);
      alert(error.response?.data?.message || "Password update failed");
    } finally {
      setPasswordLoading(false);
    }
  };

  // TOGGLE COMPONENT
  const ToggleSwitch = ({ enabled, onClick }) => (
    <button
      onClick={onClick}
      className={`settings-toggle ${enabled ? "settings-toggle-enabled" : ""}`}
    >
      <div
        className={`settings-toggle-knob ${enabled ? "settings-toggle-knob-enabled" : ""}`}
      />
    </button>
  );

  return (
    <div className="provider-dashboard">
      <ProviderSidebar />

      <div className="provider-main">
        <ProviderNavbar />

        <div className="provider-main-content">
          {/* HERO SECTION */}
          <div className="provider-settings-hero">
            <div className="provider-settings-hero-bg" />
            <div className="provider-settings-hero-content">
              <div className="provider-settings-hero-badge">
                <Sparkles size={16} />
                Provider Settings
              </div>
              <h1 className="provider-settings-hero-title">
                Account Settings ⚙️
              </h1>
              <p className="provider-settings-hero-description">
                Manage your provider preferences, security, notifications and
                account settings.
              </p>
            </div>
          </div>

          {/* SETTINGS GRID */}
          <div className="provider-settings-grid">
            {/* LEFT COLUMN */}
            <div className="provider-settings-left">
              {/* NOTIFICATIONS */}
              <div className="settings-card">
                <div className="settings-card-header">
                  <div className="settings-card-icon indigo">
                    <Bell size={24} />
                  </div>
                  <div>
                    <h2 className="settings-card-title">Notifications</h2>
                    <p className="settings-card-subtitle">
                      Control alerts and realtime updates
                    </p>
                  </div>
                </div>

                <div className="settings-options">
                  <div className="settings-option">
                    <div className="settings-option-content">
                      <Mail size={18} className="settings-option-icon" />
                      <div>
                        <h3 className="settings-option-title">
                          Email Notifications
                        </h3>
                        <p className="settings-option-desc">
                          Receive booking updates via email
                        </p>
                      </div>
                    </div>
                    <ToggleSwitch
                      enabled={settings.email_notifications}
                      onClick={() => toggleSetting("email_notifications")}
                    />
                  </div>

                  <div className="settings-option">
                    <div className="settings-option-content">
                      <Smartphone size={18} className="settings-option-icon" />
                      <div>
                        <h3 className="settings-option-title">
                          Push Notifications
                        </h3>
                        <p className="settings-option-desc">
                          Receive instant dashboard alerts
                        </p>
                      </div>
                    </div>
                    <ToggleSwitch
                      enabled={settings.push_notifications}
                      onClick={() => toggleSetting("push_notifications")}
                    />
                  </div>
                </div>
              </div>

              {/* APPEARANCE */}
              <div className="settings-card">
                <div className="settings-card-header">
                  <div className="settings-card-icon purple">
                    <Moon size={24} />
                  </div>
                  <div>
                    <h2 className="settings-card-title">Appearance</h2>
                    <p className="settings-card-subtitle">
                      Customize your dashboard experience
                    </p>
                  </div>
                </div>

                <div className="settings-options">
                  <div className="settings-option">
                    <div className="settings-option-content">
                      <Moon size={18} className="settings-option-icon purple" />
                      <div>
                        <h3 className="settings-option-title">Dark Mode</h3>
                        <p className="settings-option-desc">
                          Enable dashboard dark theme
                        </p>
                      </div>
                    </div>
                    <ToggleSwitch
                      enabled={settings.dark_mode}
                      onClick={() => toggleSetting("dark_mode")}
                    />
                  </div>
                </div>
              </div>

              {/* PRIVACY & SECURITY */}
              <div className="settings-card">
                <div className="settings-card-header">
                  <div className="settings-card-icon green">
                    <Shield size={24} />
                  </div>
                  <div>
                    <h2 className="settings-card-title">Privacy & Security</h2>
                    <p className="settings-card-subtitle">
                      Protect your provider account
                    </p>
                  </div>
                </div>

                <div className="settings-options">
                  <div className="settings-option">
                    <div className="settings-option-content">
                      <Globe size={18} className="settings-option-icon green" />
                      <div>
                        <h3 className="settings-option-title">
                          Public Profile
                        </h3>
                        <p className="settings-option-desc">
                          Make your business visible publicly
                        </p>
                      </div>
                    </div>
                    <ToggleSwitch
                      enabled={settings.public_profile}
                      onClick={() => toggleSetting("public_profile")}
                    />
                  </div>

                  <div className="settings-option">
                    <div className="settings-option-content">
                      <Lock size={18} className="settings-option-icon green" />
                      <div>
                        <h3 className="settings-option-title">
                          Two Factor Authentication
                        </h3>
                        <p className="settings-option-desc">
                          Extra account protection layer
                        </p>
                      </div>
                    </div>
                    <ToggleSwitch
                      enabled={settings.two_factor_auth}
                      onClick={() => toggleSetting("two_factor_auth")}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="provider-settings-right">
              {/* CHANGE PASSWORD */}
              <div className="settings-card">
                <div className="settings-card-header">
                  <div className="settings-card-icon red">
                    <UserCog size={24} />
                  </div>
                  <div>
                    <h2 className="settings-card-title">Change Password</h2>
                    <p className="settings-card-subtitle">
                      Keep your account secure
                    </p>
                  </div>
                </div>

                <div className="password-form">
                  <div className="password-field">
                    <label className="password-label">Current Password</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter current password"
                        className="password-input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="password-eye-btn"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="password-field">
                    <label className="password-label">New Password</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter new password"
                      className="password-input-plain"
                    />
                  </div>

                  <div className="password-field">
                    <label className="password-label">Confirm Password</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Confirm new password"
                      className="password-input-plain"
                    />
                  </div>

                  <button
                    onClick={updatePassword}
                    disabled={passwordLoading}
                    className="password-update-btn"
                  >
                    {passwordLoading ? (
                      <Loader2 size={18} className="spinner" />
                    ) : (
                      <Lock size={18} />
                    )}
                    Update Password
                  </button>
                </div>
              </div>

              {/* SAVE SETTINGS */}
              <div className="settings-save-card">
                <div className="settings-save-content">
                  <CheckCircle2 size={24} className="settings-save-icon" />
                  <div>
                    <h3 className="settings-save-title">Save Settings</h3>
                    <p className="settings-save-text">
                      Save all your provider preferences and dashboard
                      configurations.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="settings-save-btn"
                >
                  {loading ? (
                    <Loader2 size={18} className="spinner" />
                  ) : (
                    <Save size={18} />
                  )}
                  Save Provider Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProviderSettings;
