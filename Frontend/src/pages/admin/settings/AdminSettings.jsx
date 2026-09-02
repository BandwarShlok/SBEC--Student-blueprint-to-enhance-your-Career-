import { useEffect, useState } from "react";
import {
  FaSave,
  FaUserShield,
  FaBell,
  FaLock,
  FaCog,
} from "react-icons/fa";

import API_URL from "../../../config/api";

function AdminSettings() {
  const [settings, setSettings] = useState({
    adminName: "",
    email: "",
    notifications: true,
    studentRegistration: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const [changingPassword, setChangingPassword] = useState(false);

  /*
  ========================================
  LOAD SETTINGS
  ========================================
  */

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/admin/settings`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to load settings."
          );
        }

        setSettings({
          adminName: data.settings.adminName || "",
          email: data.settings.email || "",
          notifications:
            data.settings.notifications ?? true,
          studentRegistration:
            data.settings.studentRegistration ?? true,
        });
      } catch (err) {
        console.error("LOAD SETTINGS ERROR:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  /*
  ========================================
  FORM CHANGE
  ========================================
  */

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setSettings((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  /*
  ========================================
  SAVE SETTINGS
  ========================================
  */

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const response = await fetch(
        `${API_URL}/api/admin/settings`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(settings),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to update settings."
        );
      }

      setSettings({
        adminName: data.settings.adminName,
        email: data.settings.email,
        notifications: data.settings.notifications,
        studentRegistration:
          data.settings.studentRegistration,
      });

      setMessage(
        "Settings saved successfully."
      );
    } catch (err) {
      console.error("SAVE SETTINGS ERROR:", err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  /*
  ========================================
  PASSWORD CHANGE
  ========================================
  */

  const handlePasswordChange = async () => {
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword
    ) {
      setError(
        "Enter both current and new password."
      );
      return;
    }

    try {
      setChangingPassword(true);
      setMessage("");
      setError("");

      const response = await fetch(
        `${API_URL}/api/admin/settings/password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(passwordData),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to change password."
        );
      }

      setPasswordData({
        currentPassword: "",
        newPassword: "",
      });

      setMessage(
        "Password changed successfully."
      );
    } catch (err) {
      console.error(
        "CHANGE PASSWORD ERROR:",
        err
      );

      setError(err.message);
    } finally {
      setChangingPassword(false);
    }
  };

  /*
  ========================================
  LOADING
  ========================================
  */

  if (loading) {
    return (
      <div style={styles.loading}>
        Loading settings...
      </div>
    );
  }

  return (
    <div style={styles.container}>

      {/* HEADER */}

      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            Settings
          </h1>

          <p style={styles.subtitle}>
            Manage your admin account and platform
            settings.
          </p>
        </div>
      </div>

      {/* SUCCESS */}

      {message && (
        <div style={styles.successBox}>
          ✓ {message}
        </div>
      )}

      {/* ERROR */}

      {error && (
        <div style={styles.errorBox}>
          ⚠ {error}
        </div>
      )}

      <form onSubmit={handleSave}>

        {/* ADMIN ACCOUNT */}

        <div style={styles.card}>

          <div style={styles.cardHeader}>

            <div style={styles.iconBox}>
              <FaUserShield />
            </div>

            <div>
              <h2 style={styles.cardTitle}>
                Admin Account
              </h2>

              <p style={styles.cardSubtitle}>
                Manage your administrator information.
              </p>
            </div>

          </div>

          <div style={styles.formGrid}>

            <div style={styles.field}>
              <label style={styles.label}>
                Admin Name
              </label>

              <input
                type="text"
                name="adminName"
                value={settings.adminName}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                Email
              </label>

              <input
                type="email"
                name="email"
                value={settings.email}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

          </div>

        </div>

        {/* NOTIFICATIONS */}

        <div style={styles.card}>

          <div style={styles.cardHeader}>

            <div style={styles.iconBox}>
              <FaBell />
            </div>

            <div>
              <h2 style={styles.cardTitle}>
                Notifications
              </h2>

              <p style={styles.cardSubtitle}>
                Manage admin notifications.
              </p>
            </div>

          </div>

          <label style={styles.settingRow}>

            <div>
              <p style={styles.settingTitle}>
                Admin Notifications
              </p>

              <p style={styles.settingDescription}>
                Receive notifications about important
                platform activity.
              </p>
            </div>

            <input
              type="checkbox"
              name="notifications"
              checked={settings.notifications}
              onChange={handleChange}
              style={styles.checkbox}
            />

          </label>

        </div>

        {/* PLATFORM */}

        <div style={styles.card}>

          <div style={styles.cardHeader}>

            <div style={styles.iconBox}>
              <FaCog />
            </div>

            <div>
              <h2 style={styles.cardTitle}>
                Platform Settings
              </h2>

              <p style={styles.cardSubtitle}>
                Control basic student access.
              </p>
            </div>

          </div>

          <label style={styles.settingRow}>

            <div>
              <p style={styles.settingTitle}>
                Student Registration
              </p>

              <p style={styles.settingDescription}>
                Allow new students to create accounts.
              </p>
            </div>

            <input
              type="checkbox"
              name="studentRegistration"
              checked={
                settings.studentRegistration
              }
              onChange={handleChange}
              style={styles.checkbox}
            />

          </label>

        </div>

        {/* SECURITY */}

        <div style={styles.card}>

          <div style={styles.cardHeader}>

            <div style={styles.iconBox}>
              <FaLock />
            </div>

            <div>
              <h2 style={styles.cardTitle}>
                Security
              </h2>

              <p style={styles.cardSubtitle}>
                Manage admin account security.
              </p>
            </div>

          </div>

          <div style={styles.securityBox}>

            <div style={styles.passwordFields}>

              <div style={styles.field}>
                <label style={styles.label}>
                  Current Password
                </label>

                <input
                  type="password"
                  value={
                    passwordData.currentPassword
                  }
                  onChange={(e) =>
                    setPasswordData(
                      (previous) => ({
                        ...previous,
                        currentPassword:
                          e.target.value,
                      })
                    )
                  }
                  style={styles.input}
                  placeholder="Current password"
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
                  New Password
                </label>

                <input
                  type="password"
                  value={
                    passwordData.newPassword
                  }
                  onChange={(e) =>
                    setPasswordData(
                      (previous) => ({
                        ...previous,
                        newPassword:
                          e.target.value,
                      })
                    )
                  }
                  style={styles.input}
                  placeholder="New password"
                />
              </div>

            </div>

            <button
              type="button"
              style={styles.passwordButton}
              onClick={handlePasswordChange}
              disabled={changingPassword}
            >
              {changingPassword
                ? "Changing..."
                : "Change Password"}
            </button>

          </div>

        </div>

        {/* SAVE */}

        <div style={styles.saveContainer}>

          <button
            type="submit"
            style={styles.saveButton}
            disabled={saving}
          >
            <FaSave />

            {saving
              ? "Saving..."
              : "Save Settings"}
          </button>

        </div>

      </form>

    </div>
  );
}

const styles = {
  container: {
    width: "100%",
    maxWidth: "900px",
    margin: "0 auto",
  },

  loading: {
    color: "#CBD5E1",
    textAlign: "center",
    padding: "60px 20px",
    fontSize: "14px",
  },

  header: {
    marginBottom: "25px",
  },

  title: {
    color: "#FFFFFF",
    fontSize: "28px",
    margin: 0,
  },

  subtitle: {
    color: "#64748B",
    fontSize: "13px",
    margin: "6px 0 0",
  },

  successBox: {
    background: "#064E3B",
    border: "1px solid #10B981",
    color: "#A7F3D0",
    padding: "12px 15px",
    borderRadius: "9px",
    marginBottom: "18px",
    fontSize: "12px",
  },

  errorBox: {
    background: "#450A0A",
    border: "1px solid #991B1B",
    color: "#FCA5A5",
    padding: "12px 15px",
    borderRadius: "9px",
    marginBottom: "18px",
    fontSize: "12px",
  },

  card: {
    background: "#0F172A",
    border: "1px solid #1E293B",
    borderRadius: "16px",
    padding: "20px",
    marginBottom: "18px",
  },

  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "20px",
  },

  iconBox: {
    width: "38px",
    height: "38px",
    borderRadius: "9px",
    background: "#312E81",
    color: "#A78BFA",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    flexShrink: 0,
  },

  cardTitle: {
    color: "#FFFFFF",
    fontSize: "16px",
    margin: 0,
  },

  cardSubtitle: {
    color: "#64748B",
    fontSize: "11px",
    margin: "4px 0 0",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "15px",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
  },

  label: {
    color: "#CBD5E1",
    fontSize: "11px",
    fontWeight: "600",
    marginBottom: "7px",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    background: "#020617",
    border: "1px solid #334155",
    borderRadius: "8px",
    color: "#FFFFFF",
    padding: "11px",
    outline: "none",
    fontSize: "12px",
  },

  settingRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    padding: "14px",
    background: "#020617",
    border: "1px solid #1E293B",
    borderRadius: "10px",
    cursor: "pointer",
  },

  settingTitle: {
    color: "#FFFFFF",
    fontSize: "12px",
    fontWeight: "600",
    margin: 0,
  },

  settingDescription: {
    color: "#64748B",
    fontSize: "10px",
    margin: "4px 0 0",
  },

  checkbox: {
    width: "18px",
    height: "18px",
    cursor: "pointer",
    accentColor: "#8B5CF6",
    flexShrink: 0,
  },

  securityBox: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    padding: "14px",
    background: "#020617",
    border: "1px solid #1E293B",
    borderRadius: "10px",
  },

  passwordFields: {
    display: "flex",
    gap: "15px",
    width: "100%",
  },

  passwordButton: {
    alignSelf: "flex-end",
    background: "#1E293B",
    border: "none",
    borderRadius: "8px",
    color: "#CBD5E1",
    padding: "9px 13px",
    cursor: "pointer",
    fontSize: "11px",
  },

  saveContainer: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: "30px",
  },

  saveButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#8B5CF6",
    border: "none",
    borderRadius: "9px",
    color: "#FFFFFF",
    padding: "11px 17px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
  },
};

export default AdminSettings;