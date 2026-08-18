import { useState } from "react";
import API from "../../api/axios";
import CustomerSidebar from "../../components/customer/CustomerSidebar";
import CustomerNavbar from "../../components/customer/CustomerNavbar";
import {
  Settings,
  Shield,
  Bell,
  Moon,
  Lock,
  Mail,
  Smartphone,
  Eye,
  Globe,
  Sparkles,
  BadgeCheck,
  Palette,
  Save,
  Loader2,
  ChevronRight,
  Monitor,
  Volume2,
  CheckCircle2,
} from "lucide-react";
import "../../styles/Customer.css";

function CustomerSettings() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    darkMode: true,
    pushNotifications: true,
    emailNotifications: true,
    marketingEmails: false,
    twoFactorAuth: true,
    loginAlerts: true,
    publicProfile: false,
    soundEffects: true,
    autoUpdates: true,
  });

  // TOGGLE SETTING
  const toggleSetting = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  // SAVE SETTINGS
  const saveSettings = async () => {
    try {
      setLoading(true);
      await API.put("/customer/settings", settings);
      alert("Settings updated successfully");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  // TOGGLE COMPONENT
  const Toggle = ({ active, onClick }) => (
    <button
      onClick={onClick}
      className={`settings-toggle ${active ? "settings-toggle-active" : ""}`}
    >
      <div
        className={`settings-toggle-knob ${active ? "settings-toggle-knob-active" : ""}`}
      />
    </button>
  );

  return (
    <div className="customer-dashboard">
      <CustomerSidebar
  isOpen={sidebarOpen}
  onClose={() => setSidebarOpen(false)}
/>

      <div className="customer-main">
        <CustomerNavbar
  toggleSidebar={() =>
    setSidebarOpen((previous) => !previous)
  }
/>

        <div className="customer-main-content">
          {/* HERO SECTION */}
          <div className="settings-hero">
            <div className="settings-hero-bg-1" />
            <div className="settings-hero-bg-2" />
            <div className="settings-hero-content">
              <div>
                <div className="settings-hero-badge">
                  <Sparkles size={16} />
                  Smart Preferences
                </div>
                <h1 className="settings-hero-title">Settings</h1>
                <p className="settings-hero-description">
                  Customize your MultiServe experience, security, notifications,
                  and account preferences.
                </p>
              </div>

              {/* STATUS CARD */}
              <div className="settings-status-card">
                <div className="settings-status-header">
                  <div className="settings-status-icon">
                    <BadgeCheck size={30} />
                  </div>
                  <CheckCircle2 size={28} className="settings-status-check" />
                </div>
                <p className="settings-status-label">Account Security</p>
                <h2 className="settings-status-value">Protected</h2>
              </div>
            </div>
          </div>

          {/* SETTINGS GRID */}
          <div className="settings-grid">
            {/* LEFT COLUMN */}
            <div className="settings-left">
              {/* ACCOUNT SETTINGS */}
              <div className="settings-card">
                <div className="settings-card-header">
                  <div className="settings-card-icon cyan">
                    <Settings size={24} />
                  </div>
                  <div>
                    <h2 className="settings-card-title">Account Settings</h2>
                    <p className="settings-card-subtitle">
                      Manage your account
                    </p>
                  </div>
                </div>

                <div className="settings-account-buttons">
                  <button className="settings-account-btn">
                    <span className="settings-account-btn-content">
                      <Lock size={20} />
                      Change Password
                    </span>
                    <ChevronRight size={18} />
                  </button>
                  <button className="settings-account-btn">
                    <span className="settings-account-btn-content">
                      <Mail size={20} />
                      Update Email
                    </span>
                    <ChevronRight size={18} />
                  </button>
                  <button className="settings-account-btn">
                    <span className="settings-account-btn-content">
                      <Smartphone size={20} />
                      Update Phone
                    </span>
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              {/* SECURITY */}
              <div className="settings-card">
                <div className="settings-card-header">
                  <div className="settings-card-icon green">
                    <Shield size={24} />
                  </div>
                  <div>
                    <h2 className="settings-card-title">Security</h2>
                    <p className="settings-card-subtitle">
                      Protect your account
                    </p>
                  </div>
                </div>

                <div className="settings-security-options">
                  <div className="settings-option">
                    <div>
                      <h3 className="settings-option-title">
                        Two-Factor Authentication
                      </h3>
                      <p className="settings-option-desc">
                        Extra security layer
                      </p>
                    </div>
                    <Toggle
                      active={settings.twoFactorAuth}
                      onClick={() => toggleSetting("twoFactorAuth")}
                    />
                  </div>
                  <div className="settings-option">
                    <div>
                      <h3 className="settings-option-title">Login Alerts</h3>
                      <p className="settings-option-desc">
                        Receive login notifications
                      </p>
                    </div>
                    <Toggle
                      active={settings.loginAlerts}
                      onClick={() => toggleSetting("loginAlerts")}
                    />
                  </div>
                </div>
              </div>

              {/* NOTIFICATIONS */}
              <div className="settings-card">
                <div className="settings-card-header">
                  <div className="settings-card-icon yellow">
                    <Bell size={24} />
                  </div>
                  <div>
                    <h2 className="settings-card-title">Notifications</h2>
                    <p className="settings-card-subtitle">
                      Notification preferences
                    </p>
                  </div>
                </div>

                <div className="settings-notification-options">
                  <div className="settings-option">
                    <div>
                      <h3 className="settings-option-title">
                        Push Notifications
                      </h3>
                      <p className="settings-option-desc">
                        Receive app notifications
                      </p>
                    </div>
                    <Toggle
                      active={settings.pushNotifications}
                      onClick={() => toggleSetting("pushNotifications")}
                    />
                  </div>
                  <div className="settings-option">
                    <div>
                      <h3 className="settings-option-title">
                        Email Notifications
                      </h3>
                      <p className="settings-option-desc">
                        Receive updates via email
                      </p>
                    </div>
                    <Toggle
                      active={settings.emailNotifications}
                      onClick={() => toggleSetting("emailNotifications")}
                    />
                  </div>
                  <div className="settings-option">
                    <div>
                      <h3 className="settings-option-title">
                        Marketing Emails
                      </h3>
                      <p className="settings-option-desc">
                        Special offers and promotions
                      </p>
                    </div>
                    <Toggle
                      active={settings.marketingEmails}
                      onClick={() => toggleSetting("marketingEmails")}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="settings-right">
              {/* APPEARANCE */}
              <div className="settings-card">
                <div className="settings-card-header">
                  <div className="settings-card-icon purple">
                    <Palette size={24} />
                  </div>
                  <div>
                    <h2 className="settings-card-title">Appearance</h2>
                    <p className="settings-card-subtitle">
                      Customize interface
                    </p>
                  </div>
                </div>

                <div className="settings-appearance-options">
                  <div className="settings-option-icon">
                    <Moon size={20} className="settings-option-icon-cyan" />
                    <div>
                      <h3 className="settings-option-title">Dark Mode</h3>
                      <p className="settings-option-desc">
                        Modern dark interface
                      </p>
                    </div>
                    <Toggle
                      active={settings.darkMode}
                      onClick={() => toggleSetting("darkMode")}
                    />
                  </div>
                  <div className="settings-option-icon">
                    <Volume2 size={20} className="settings-option-icon-teal" />
                    <div>
                      <h3 className="settings-option-title">Sound Effects</h3>
                      <p className="settings-option-desc">
                        Enable interface sounds
                      </p>
                    </div>
                    <Toggle
                      active={settings.soundEffects}
                      onClick={() => toggleSetting("soundEffects")}
                    />
                  </div>
                  <div className="settings-option-icon">
                    <Eye size={20} className="settings-option-icon-pink" />
                    <div>
                      <h3 className="settings-option-title">Public Profile</h3>
                      <p className="settings-option-desc">
                        Show your public info
                      </p>
                    </div>
                    <Toggle
                      active={settings.publicProfile}
                      onClick={() => toggleSetting("publicProfile")}
                    />
                  </div>
                </div>
              </div>

              {/* SYSTEM STATUS */}
              <div className="settings-system-card">
                <div className="settings-system-glow" />
                <div className="settings-system-content">
                  <div className="settings-system-icon">
                    <Monitor size={40} />
                  </div>
                  <h2 className="settings-system-title">System Status</h2>
                  <p className="settings-system-text">
                    All services are operational and synced successfully.
                  </p>
                  <button className="settings-system-btn">
                    System Details
                  </button>
                </div>
              </div>

              {/* SAVE BUTTON */}
              <button
                onClick={saveSettings}
                disabled={loading}
                className="settings-save-btn"
              >
                {loading ? (
                  <Loader2 size={22} className="spinner" />
                ) : (
                  <Save size={22} />
                )}
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerSettings;
