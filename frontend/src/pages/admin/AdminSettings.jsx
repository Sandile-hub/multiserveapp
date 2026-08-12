import { useEffect, useState } from "react";
import API from "../../api/axios";
import AdminLayout from "../../layouts/AdminLayout";
import {
  Save,
  ShieldCheck,
  Bell,
  Globe,
  Lock,
  User,
  Moon,
  Upload,
  RefreshCcw,
  Eye,
  EyeOff,
} from "lucide-react";
import "../../styles/Admin.css";

function AdminSettings() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState({
    platform_name: "MultiServe",
    support_email: "support@multiserve.com",
    maintenance_mode: false,
    enable_notifications: true,
    enable_reviews: true,
    currency: "ZAR",
    timezone: "Africa/Johannesburg",
    admin_name: "System Admin",
    admin_email: "admin@multiserve.com",
    current_password: "",
    new_password: "",
  });

  // FETCH SETTINGS
  const fetchSettings = async () => {
    try {
      const res = await API.get("/admin/settings");
      if (res.data) {
        setSettings({ ...settings, ...res.data });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // HANDLE CHANGE
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // SAVE SETTINGS
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await API.put("/admin/settings", settings);
      alert("Settings updated successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert(error.response?.data?.message || "Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      {/* PAGE HEADER */}
      <div className="settings-header">
        <div>
          <h1 className="settings-title">Settings</h1>
          <p className="settings-subtitle">
            Configure platform preferences and security
          </p>
        </div>
        <button onClick={fetchSettings} className="settings-refresh-btn">
          <RefreshCcw size={16} />
          Refresh
        </button>
      </div>

      <form onSubmit={handleSave} className="settings-form">
        {/* PLATFORM SETTINGS */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon indigo">
              <Globe size={22} />
            </div>
            <div>
              <h2 className="settings-card-title">Platform Settings</h2>
              <p className="settings-card-subtitle">
                Manage global platform configuration
              </p>
            </div>
          </div>

          <div className="settings-form-grid">
            <div className="settings-form-field">
              <label className="settings-label">Platform Name</label>
              <input
                type="text"
                name="platform_name"
                value={settings.platform_name}
                onChange={handleChange}
                className="settings-input"
              />
            </div>

            <div className="settings-form-field">
              <label className="settings-label">Support Email</label>
              <input
                type="email"
                name="support_email"
                value={settings.support_email}
                onChange={handleChange}
                className="settings-input"
              />
            </div>

            <div className="settings-form-field">
              <label className="settings-label">Currency</label>
              <select
                name="currency"
                value={settings.currency}
                onChange={handleChange}
                className="settings-select"
              >
                <option value="ZAR">ZAR - South African Rand</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
              </select>
            </div>

            <div className="settings-form-field">
              <label className="settings-label">Timezone</label>
              <select
                name="timezone"
                value={settings.timezone}
                onChange={handleChange}
                className="settings-select"
              >
                <option value="Africa/Johannesburg">
                  Africa/Johannesburg (SAST)
                </option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
              </select>
            </div>
          </div>
        </div>

        {/* SYSTEM SETTINGS */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon cyan">
              <Bell size={22} />
            </div>
            <div>
              <h2 className="settings-card-title">System Settings</h2>
              <p className="settings-card-subtitle">
                Configure features and system behavior
              </p>
            </div>
          </div>

          <div className="settings-options">
            <div className="settings-option">
              <div>
                <h3 className="settings-option-title">Enable Notifications</h3>
                <p className="settings-option-desc">
                  Send realtime alerts and updates
                </p>
              </div>
              <label className="settings-checkbox">
                <input
                  type="checkbox"
                  name="enable_notifications"
                  checked={settings.enable_notifications}
                  onChange={handleChange}
                />
                <span className="settings-checkbox-slider"></span>
              </label>
            </div>

            <div className="settings-option">
              <div>
                <h3 className="settings-option-title">Enable Reviews</h3>
                <p className="settings-option-desc">
                  Allow customers to leave reviews
                </p>
              </div>
              <label className="settings-checkbox">
                <input
                  type="checkbox"
                  name="enable_reviews"
                  checked={settings.enable_reviews}
                  onChange={handleChange}
                />
                <span className="settings-checkbox-slider"></span>
              </label>
            </div>

            <div className="settings-option">
              <div>
                <h3 className="settings-option-title">Maintenance Mode</h3>
                <p className="settings-option-desc">
                  Temporarily disable platform access
                </p>
              </div>
              <label className="settings-checkbox">
                <input
                  type="checkbox"
                  name="maintenance_mode"
                  checked={settings.maintenance_mode}
                  onChange={handleChange}
                />
                <span className="settings-checkbox-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* ADMIN PROFILE */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon green">
              <User size={22} />
            </div>
            <div>
              <h2 className="settings-card-title">Admin Profile</h2>
              <p className="settings-card-subtitle">Update admin information</p>
            </div>
          </div>

          <div className="settings-form-grid">
            <div className="settings-form-field">
              <label className="settings-label">Admin Name</label>
              <input
                type="text"
                name="admin_name"
                value={settings.admin_name}
                onChange={handleChange}
                className="settings-input"
              />
            </div>

            <div className="settings-form-field">
              <label className="settings-label">Admin Email</label>
              <input
                type="email"
                name="admin_email"
                value={settings.admin_email}
                onChange={handleChange}
                className="settings-input"
              />
            </div>
          </div>
        </div>

        {/* SECURITY */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon red">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 className="settings-card-title">Security</h2>
              <p className="settings-card-subtitle">
                Update password and security settings
              </p>
            </div>
          </div>

          <div className="settings-form-grid">
            <div className="settings-form-field">
              <label className="settings-label">Current Password</label>
              <div className="settings-password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="current_password"
                  value={settings.current_password}
                  onChange={handleChange}
                  className="settings-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="settings-password-toggle"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="settings-form-field">
              <label className="settings-label">New Password</label>
              <input
                type={showPassword ? "text" : "password"}
                name="new_password"
                value={settings.new_password}
                onChange={handleChange}
                className="settings-input"
              />
            </div>
          </div>
        </div>

        {/* SAVE BUTTON */}
        <div className="settings-save">
          <button
            type="submit"
            disabled={loading}
            className="settings-save-btn"
          >
            <Save size={18} />
            {loading ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}

export default AdminSettings;
