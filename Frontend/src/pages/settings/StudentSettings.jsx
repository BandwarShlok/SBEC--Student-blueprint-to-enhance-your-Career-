import { useContext, useEffect, useState } from "react";
import {
  FaBell,
  FaLock,
  FaPalette,
  FaSignOutAlt,
  FaCheck,
  FaEye,
  FaEyeSlash,
  FaMoon,
  FaSun,
  FaDesktop,
  FaSave,
  FaCog,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import ThemeContext from "../../context/ThemeContextObject";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const SETTINGS_API = `${API_BASE_URL}/api/student/settings`;

// ============================================================
// AUTH HELPERS
// ============================================================

const getToken = () => {
  return localStorage.getItem("sbec_token");
};

const getHeaders = (includeJson = false) => {
  const token = getToken();

  return {
    ...(includeJson
      ? {
          "Content-Type": "application/json",
        }
      : {}),
    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
};

const readApiResponse = async (response) => {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      success: false,
      message: text,
    };
  }
};

// ============================================================
// STUDENT SETTINGS
// ============================================================

const StudentSettings = () => {
  const navigate = useNavigate();

  // ==========================================================
  // GLOBAL THEME
  // ==========================================================

  const themeContext = useContext(ThemeContext);

  if (!themeContext) {
    throw new Error("StudentSettings must be rendered inside ThemeProvider.");
  }

  const { theme, resolvedTheme, changeTheme } = themeContext;

  const activeTheme = resolvedTheme === "light" ? "light" : "dark";

  // ==========================================================
  // SETTINGS
  // ==========================================================

  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      examReminders: true,
      quizResults: true,
    },

    appearance: {
      theme: theme || "dark",
    },
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ==========================================================
  // PASSWORD
  // ==========================================================

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [changingPassword, setChangingPassword] = useState(false);

  const [currentPasswordError, setCurrentPasswordError] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ==========================================================
  // LOAD SETTINGS
  // ==========================================================

  useEffect(() => {
    let mounted = true;

    const loadSettings = async () => {
      const token = getToken();

      if (!token) {
        navigate("/login", {
          replace: true,
        });

        return;
      }

      try {
        setLoading(true);

        const response = await fetch(SETTINGS_API, {
          method: "GET",
          headers: getHeaders(),
        });

        const data = await readApiResponse(response);

        // ----------------------------------------------------
        // SESSION EXPIRED
        // ----------------------------------------------------

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("sbec_token");

          localStorage.removeItem("sbec_user");

          toast.error("Your session has expired. Please login again.");

          navigate("/login", {
            replace: true,
          });

          return;
        }

        // ----------------------------------------------------
        // OTHER ERROR
        // ----------------------------------------------------

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load settings.");
        }

        if (!mounted) {
          return;
        }

        const savedTheme = data.settings?.appearance?.theme || "dark";

        setSettings({
          notifications: {
            email: data.settings?.notifications?.email ?? true,

            examReminders: data.settings?.notifications?.examReminders ?? true,

            quizResults: data.settings?.notifications?.quizResults ?? true,
          },

          appearance: {
            theme: savedTheme,
          },
        });

        // Apply saved theme globally
        changeTheme(savedTheme);
      } catch (error) {
        console.error("LOAD SETTINGS ERROR:", error);

        if (mounted) {
          toast.error(error.message || "Unable to load settings.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadSettings();

    return () => {
      mounted = false;
    };
  }, [navigate, changeTheme]);

  // ==========================================================
  // NOTIFICATION CHANGE
  // ==========================================================

  const handleNotificationChange = (setting) => {
    setSettings((previous) => ({
      ...previous,

      notifications: {
        ...previous.notifications,

        [setting]: !previous.notifications[setting],
      },
    }));
  };

  // ==========================================================
  // THEME CHANGE
  // ==========================================================

  const handleThemeChange = (selectedTheme) => {
    // Change the global application theme immediately
    changeTheme(selectedTheme);

    // Only update the local settings state from the button click.
    // No useEffect is required.
    setSettings((previous) => ({
      ...previous,

      appearance: {
        ...previous.appearance,

        theme: selectedTheme,
      },
    }));
  };

  // ==========================================================
  // SAVE SETTINGS
  // ==========================================================

  const saveSettings = async () => {
    const token = getToken();

    if (!token) {
      toast.error("Your login session has expired. Please login again.");

      navigate("/login", {
        replace: true,
      });

      return;
    }

    try {
      setSaving(true);

      const response = await fetch(SETTINGS_API, {
        method: "PUT",

        headers: getHeaders(true),

        body: JSON.stringify({
          notifications: settings.notifications,

          appearance: settings.appearance,
        }),
      });

      const data = await readApiResponse(response);

      // ----------------------------------------------------
      // SESSION ERROR
      // ----------------------------------------------------

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("sbec_token");

        localStorage.removeItem("sbec_user");

        toast.error("Your session has expired. Please login again.");

        navigate("/login", {
          replace: true,
        });

        return;
      }

      // ----------------------------------------------------
      // BACKEND ERROR
      // ----------------------------------------------------

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to save settings.");
      }

      const savedTheme =
        data.settings?.appearance?.theme || settings.appearance.theme || "dark";

      const updatedSettings = {
        notifications: {
          email:
            data.settings?.notifications?.email ?? settings.notifications.email,

          examReminders:
            data.settings?.notifications?.examReminders ??
            settings.notifications.examReminders,

          quizResults:
            data.settings?.notifications?.quizResults ??
            settings.notifications.quizResults,
        },

        appearance: {
          theme: savedTheme,
        },
      };

      setSettings(updatedSettings);

      // Make absolutely sure the global theme
      // matches the saved backend value.
      changeTheme(savedTheme);

      toast.success("Settings saved successfully!");
    } catch (error) {
      console.error("SAVE SETTINGS ERROR:", error);

      toast.error(error.message || "Unable to save settings.");
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // PASSWORD INPUT
  // ==========================================================

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordData((previous) => ({
      ...previous,

      [name]: value,
    }));

    if (name === "currentPassword") {
      setCurrentPasswordError("");
    }
  };

  // ==========================================================
  // CHANGE PASSWORD
  // ==========================================================

  const changePassword = async (event) => {
    event.preventDefault();

    setCurrentPasswordError("");

    // --------------------------------------------------------
    // BASIC VALIDATION
    // --------------------------------------------------------

    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      toast.error("Please fill all password fields.");

      return;
    }

    // --------------------------------------------------------
    // NEW PASSWORD LENGTH
    // --------------------------------------------------------

    if (passwordData.newPassword.length < 6) {
      toast.error("New password must contain at least 6 characters.");

      return;
    }

    // --------------------------------------------------------
    // CONFIRM PASSWORD
    // --------------------------------------------------------

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New password and confirm password do not match.");

      return;
    }

    // --------------------------------------------------------
    // TOKEN
    // --------------------------------------------------------

    const token = getToken();

    if (!token) {
      toast.error("Your login session has expired. Please login again.");

      navigate("/login", {
        replace: true,
      });

      return;
    }

    try {
      setChangingPassword(true);

      const response = await fetch(`${SETTINGS_API}/password`, {
        method: "PUT",

        headers: getHeaders(true),

        body: JSON.stringify({
          currentPassword: passwordData.currentPassword.trim(),

          newPassword: passwordData.newPassword,

          confirmPassword: passwordData.confirmPassword,
        }),
      });

      const data = await readApiResponse(response);

      const message = data?.message || data?.error || data?.data?.message || "";

      const normalizedMessage = String(message).toLowerCase();

      // ======================================================
      // WRONG CURRENT PASSWORD
      // ======================================================

      const isWrongCurrentPassword =
        normalizedMessage.includes("current password") &&
        (normalizedMessage.includes("incorrect") ||
          normalizedMessage.includes("wrong") ||
          normalizedMessage.includes("invalid"));

      if (isWrongCurrentPassword) {
        setCurrentPasswordError("Current password is incorrect.");

        toast.error("Current password is incorrect.");

        return;
      }

      // ======================================================
      // SESSION ERROR
      // ======================================================

      if (
        (response.status === 401 || response.status === 403) &&
        !isWrongCurrentPassword
      ) {
        localStorage.removeItem("sbec_token");

        localStorage.removeItem("sbec_user");

        toast.error("Your session has expired. Please login again.");

        navigate("/login", {
          replace: true,
        });

        return;
      }

      // ======================================================
      // OTHER BACKEND ERROR
      // ======================================================

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Failed to change password.");
      }

      // ======================================================
      // SUCCESS
      // ======================================================

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setCurrentPasswordError("");

      setShowCurrentPassword(false);

      setShowNewPassword(false);

      setShowConfirmPassword(false);

      toast.success(data?.message || "Password changed successfully!");
    } catch (error) {
      console.error("CHANGE PASSWORD ERROR:", error);

      toast.error(error?.message || "Unable to change password.");
    } finally {
      setChangingPassword(false);
    }
  };

  // ==========================================================
  // LOGOUT
  // ==========================================================

  const handleLogout = () => {
    localStorage.removeItem("sbec_token");

    localStorage.removeItem("sbec_user");

    toast.success("Logged out successfully.");

    navigate("/login", {
      replace: true,
    });
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div
        style={{
          ...styles.page,

          ...(activeTheme === "light" ? styles.pageLight : {}),
        }}
      >
        <div style={styles.loadingContainer}>
          <div style={styles.spinner} />

          <h2
            style={{
              ...styles.loadingTitle,

              ...(activeTheme === "light" ? styles.titleLight : {}),
            }}
          >
            Loading Settings...
          </h2>

          <p style={styles.loadingText}>
            Please wait while we load your preferences.
          </p>
        </div>
      </div>
    );
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div
      style={{
        ...styles.page,

        ...(activeTheme === "light" ? styles.pageLight : {}),
      }}
    >
      <div style={styles.container}>
        {/* ==================================================
            HEADER
        ================================================== */}

        <div style={styles.header}>
          <div style={styles.headerIcon}>
            <FaCog />
          </div>

          <div>
            <h1
              style={{
                ...styles.title,

                ...(activeTheme === "light" ? styles.titleLight : {}),
              }}
            >
              Settings
            </h1>

            <p
              style={{
                ...styles.subtitle,

                ...(activeTheme === "light" ? styles.subtitleLight : {}),
              }}
            >
              Manage your SBEC preferences, notifications and security.
            </p>
          </div>
        </div>

        {/* ==================================================
            NOTIFICATIONS
        ================================================== */}

        <section
          style={{
            ...styles.card,

            ...(activeTheme === "light" ? styles.cardLight : {}),
          }}
        >
          <div style={styles.cardHeader}>
            <div
              style={{
                ...styles.sectionIcon,
                ...styles.notificationIcon,
              }}
            >
              <FaBell />
            </div>

            <div>
              <h2
                style={{
                  ...styles.cardTitle,

                  ...(activeTheme === "light" ? styles.cardTitleLight : {}),
                }}
              >
                Notifications
              </h2>

              <p
                style={{
                  ...styles.cardSubtitle,

                  ...(activeTheme === "light" ? styles.cardSubtitleLight : {}),
                }}
              >
                Choose which notifications you want to receive.
              </p>
            </div>
          </div>

          <div style={styles.settingsList}>
            <SettingToggle
              icon={<FaBell />}
              title="Email Notifications"
              description="Receive important SBEC updates through email."
              checked={settings.notifications.email}
              onChange={() => handleNotificationChange("email")}
              lightMode={activeTheme === "light"}
            />

            <SettingToggle
              icon={<FaBell />}
              title="Exam Reminders"
              description="Get reminders about upcoming examinations."
              checked={settings.notifications.examReminders}
              onChange={() => handleNotificationChange("examReminders")}
              lightMode={activeTheme === "light"}
            />

            <SettingToggle
              icon={<FaCheck />}
              title="Quiz Results"
              description="Receive notifications when quiz results are available."
              checked={settings.notifications.quizResults}
              onChange={() => handleNotificationChange("quizResults")}
              lightMode={activeTheme === "light"}
            />
          </div>
        </section>

        {/* ==================================================
            APPEARANCE
        ================================================== */}

        <section
          style={{
            ...styles.card,

            ...(activeTheme === "light" ? styles.cardLight : {}),
          }}
        >
          <div style={styles.cardHeader}>
            <div
              style={{
                ...styles.sectionIcon,
                ...styles.appearanceIcon,
              }}
            >
              <FaPalette />
            </div>

            <div>
              <h2
                style={{
                  ...styles.cardTitle,

                  ...(activeTheme === "light" ? styles.cardTitleLight : {}),
                }}
              >
                Appearance
              </h2>

              <p
                style={{
                  ...styles.cardSubtitle,

                  ...(activeTheme === "light" ? styles.cardSubtitleLight : {}),
                }}
              >
                Choose your preferred interface theme.
              </p>
            </div>
          </div>

          <div style={styles.themeGrid}>
            <ThemeOption
              icon={<FaMoon />}
              title="Dark"
              description="Dark interface"
              selected={settings.appearance.theme === "dark"}
              onClick={() => handleThemeChange("dark")}
              lightMode={activeTheme === "light"}
            />

            <ThemeOption
              icon={<FaSun />}
              title="Light"
              description="Light interface"
              selected={settings.appearance.theme === "light"}
              onClick={() => handleThemeChange("light")}
              lightMode={activeTheme === "light"}
            />

            <ThemeOption
              icon={<FaDesktop />}
              title="System"
              description="Use device preference"
              selected={settings.appearance.theme === "system"}
              onClick={() => handleThemeChange("system")}
              lightMode={activeTheme === "light"}
            />
          </div>
        </section>

        {/* ==================================================
            SAVE SETTINGS
        ================================================== */}

        <div style={styles.saveContainer}>
          <button
            type="button"
            onClick={saveSettings}
            disabled={saving}
            style={{
              ...styles.saveButton,

              ...(saving ? styles.disabledButton : {}),
            }}
          >
            <FaSave />

            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>

        {/* ==================================================
            SECURITY
        ================================================== */}

        <section
          style={{
            ...styles.card,

            ...(activeTheme === "light" ? styles.cardLight : {}),
          }}
        >
          <div style={styles.cardHeader}>
            <div
              style={{
                ...styles.sectionIcon,
                ...styles.securityIcon,
              }}
            >
              <FaLock />
            </div>

            <div>
              <h2
                style={{
                  ...styles.cardTitle,

                  ...(activeTheme === "light" ? styles.cardTitleLight : {}),
                }}
              >
                Security
              </h2>

              <p
                style={{
                  ...styles.cardSubtitle,

                  ...(activeTheme === "light" ? styles.cardSubtitleLight : {}),
                }}
              >
                Keep your account secure by updating your password.
              </p>
            </div>
          </div>

          <form onSubmit={changePassword} style={styles.passwordForm}>
            <PasswordField
              label="Current Password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              visible={showCurrentPassword}
              onToggle={() => setShowCurrentPassword((previous) => !previous)}
              error={currentPasswordError}
              lightMode={activeTheme === "light"}
            />

            <PasswordField
              label="New Password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              visible={showNewPassword}
              onToggle={() => setShowNewPassword((previous) => !previous)}
              lightMode={activeTheme === "light"}
            />

            <PasswordField
              label="Confirm New Password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              visible={showConfirmPassword}
              onToggle={() => setShowConfirmPassword((previous) => !previous)}
              lightMode={activeTheme === "light"}
            />

            <button
              type="submit"
              disabled={changingPassword}
              style={{
                ...styles.passwordButton,

                ...(changingPassword ? styles.disabledButton : {}),
              }}
            >
              <FaLock />

              {changingPassword ? "Changing Password..." : "Change Password"}
            </button>
          </form>
        </section>

        {/* ==================================================
            SIGN OUT
        ================================================== */}

        <section
          style={{
            ...styles.logoutCard,

            ...(activeTheme === "light" ? styles.logoutCardLight : {}),
          }}
        >
          <div>
            <h2
              style={{
                ...styles.logoutTitle,

                ...(activeTheme === "light" ? styles.logoutTitleLight : {}),
              }}
            >
              Sign Out
            </h2>

            <p
              style={{
                ...styles.logoutDescription,

                ...(activeTheme === "light"
                  ? styles.logoutDescriptionLight
                  : {}),
              }}
            >
              Sign out of your SBEC student account on this device.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            style={styles.logoutButton}
          >
            <FaSignOutAlt />
            Logout
          </button>
        </section>
      </div>
    </div>
  );
};

// ============================================================
// TOGGLE COMPONENT
// ============================================================

const SettingToggle = ({
  icon,
  title,
  description,
  checked,
  onChange,
  lightMode = false,
}) => {
  return (
    <div
      style={{
        ...styles.settingRow,

        ...(lightMode ? styles.settingRowLight : {}),
      }}
    >
      <div style={styles.settingInfo}>
        <div
          style={{
            ...styles.smallIcon,

            ...(lightMode ? styles.smallIconLight : {}),
          }}
        >
          {icon}
        </div>

        <div>
          <h3
            style={{
              ...styles.settingTitle,

              ...(lightMode ? styles.settingTitleLight : {}),
            }}
          >
            {title}
          </h3>

          <p
            style={{
              ...styles.settingDescription,

              ...(lightMode ? styles.settingDescriptionLight : {}),
            }}
          >
            {description}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onChange}
        aria-label={`Toggle ${title}`}
        style={{
          ...styles.toggle,

          ...(checked ? styles.toggleActive : {}),
        }}
      >
        <span
          style={{
            ...styles.toggleCircle,

            ...(checked ? styles.toggleCircleActive : {}),
          }}
        />
      </button>
    </div>
  );
};

// ============================================================
// THEME OPTION
// ============================================================

const ThemeOption = ({
  icon,
  title,
  description,
  selected,
  onClick,
  lightMode = false,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      style={{
        ...styles.themeOption,

        ...(selected ? styles.themeOptionSelected : {}),

        ...(lightMode ? styles.themeOptionLight : {}),
      }}
    >
      <div
        style={{
          ...styles.themeIcon,

          ...(lightMode ? styles.themeIconLight : {}),
        }}
      >
        {icon}
      </div>

      <div style={styles.themeContent}>
        <h3
          style={{
            ...styles.themeTitle,

            ...(lightMode ? styles.themeTitleLight : {}),
          }}
        >
          {title}
        </h3>

        <p
          style={{
            ...styles.themeDescription,

            ...(lightMode ? styles.themeDescriptionLight : {}),
          }}
        >
          {description}
        </p>
      </div>

      <div
        style={{
          ...styles.radio,

          ...(selected ? styles.radioSelected : {}),
        }}
      >
        {selected && <FaCheck />}
      </div>
    </button>
  );
};

// ============================================================
// PASSWORD FIELD
// ============================================================

const PasswordField = ({
  label,
  name,
  value,
  onChange,
  visible,
  onToggle,
  error = "",
  lightMode = false,
}) => {
  return (
    <div style={styles.inputGroup}>
      <label
        htmlFor={name}
        style={{
          ...styles.inputLabel,

          ...(lightMode ? styles.inputLabelLight : {}),
        }}
      >
        {label}
      </label>

      <div style={styles.passwordWrapper}>
        <input
          id={name}
          type={visible ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={`Enter ${label.toLowerCase()}`}
          autoComplete="off"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${name}-error` : undefined}
          style={{
            ...styles.passwordInput,

            ...(lightMode ? styles.passwordInputLight : {}),

            ...(error ? styles.passwordInputError : {}),
          }}
        />

        <button
          type="button"
          onClick={onToggle}
          style={{
            ...styles.eyeButton,

            ...(lightMode ? styles.eyeButtonLight : {}),
          }}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>

      {error && (
        <div id={`${name}-error`} style={styles.passwordError} role="alert">
          <span>⚠</span>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

// ============================================================
// STYLES
// ============================================================

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #070b16 0%, #10172a 50%, #070b16 100%)",
    color: "#f8fafc",
    padding: "32px",
    boxSizing: "border-box",
    transition: "background 0.25s ease, color 0.25s ease",
  },

  pageLight: {
    background:
      "linear-gradient(135deg, #f1f5f9 0%, #eef2ff 50%, #f8fafc 100%)",
    color: "#0f172a",
  },

  container: {
    width: "100%",
    maxWidth: "1050px",
    margin: "0 auto",
  },

  header: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
    marginBottom: "30px",
  },

  headerIcon: {
    width: "58px",
    height: "58px",
    borderRadius: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
    color: "#ffffff",
    boxShadow: "0 10px 30px rgba(79,70,229,0.25)",
    flexShrink: 0,
  },

  title: {
    margin: 0,
    fontSize: "32px",
    fontWeight: 800,
    letterSpacing: "-0.5px",
    color: "#f8fafc",
  },

  titleLight: {
    color: "#0f172a",
  },

  subtitle: {
    margin: "7px 0 0",
    color: "#94a3b8",
    fontSize: "15px",
  },

  subtitleLight: {
    color: "#475569",
  },

  card: {
    background: "rgba(15,23,42,0.82)",
    border: "1px solid rgba(148,163,184,0.12)",
    borderRadius: "22px",
    padding: "28px",
    marginBottom: "22px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.18)",
    backdropFilter: "blur(14px)",
  },

  cardLight: {
    background: "#ffffff",
    border: "1px solid #dbe2ea",
    boxShadow: "0 20px 50px rgba(15,23,42,0.08)",
  },

  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginBottom: "25px",
  },

  sectionIcon: {
    width: "46px",
    height: "46px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    flexShrink: 0,
  },

  notificationIcon: {
    background: "rgba(59,130,246,0.14)",
    color: "#60a5fa",
  },

  appearanceIcon: {
    background: "rgba(168,85,247,0.14)",
    color: "#c084fc",
  },

  securityIcon: {
    background: "rgba(34,197,94,0.14)",
    color: "#4ade80",
  },

  cardTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: 750,
    color: "#f8fafc",
  },

  cardTitleLight: {
    color: "#0f172a",
  },

  cardSubtitle: {
    margin: "5px 0 0",
    color: "#94a3b8",
    fontSize: "13px",
  },

  cardSubtitleLight: {
    color: "#64748b",
  },

  settingsList: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  settingRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    padding: "17px 4px",
    borderBottom: "1px solid rgba(148,163,184,0.08)",
  },

  settingRowLight: {
    borderBottom: "1px solid #e2e8f0",
  },

  settingInfo: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    minWidth: 0,
  },

  smallIcon: {
    width: "38px",
    height: "38px",
    borderRadius: "11px",
    background: "rgba(148,163,184,0.08)",
    color: "#94a3b8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    flexShrink: 0,
  },

  smallIconLight: {
    background: "#e2e8f0",
    color: "#475569",
  },

  settingTitle: {
    margin: 0,
    fontSize: "15px",
    fontWeight: 650,
    color: "#f8fafc",
  },

  settingTitleLight: {
    color: "#0f172a",
  },

  settingDescription: {
    margin: "4px 0 0",
    color: "#64748b",
    fontSize: "12px",
  },

  settingDescriptionLight: {
    color: "#64748b",
  },

  toggle: {
    width: "52px",
    height: "29px",
    borderRadius: "20px",
    border: "none",
    background: "#334155",
    padding: "3px",
    cursor: "pointer",
    position: "relative",
    flexShrink: 0,
  },

  toggleActive: {
    background: "linear-gradient(135deg,#6366f1,#7c3aed)",
  },

  toggleCircle: {
    display: "block",
    width: "23px",
    height: "23px",
    borderRadius: "50%",
    background: "#ffffff",
    transform: "translateX(0)",
    transition: "transform 0.2s ease",
  },

  toggleCircleActive: {
    transform: "translateX(23px)",
  },

  themeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "14px",
  },

  themeOption: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
    textAlign: "left",
    padding: "17px",
    borderRadius: "15px",
    border: "1px solid rgba(148,163,184,0.12)",
    background: "rgba(30,41,59,0.45)",
    color: "#ffffff",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },

  themeOptionLight: {
    border: "1px solid #dbe2ea",
    background: "#f8fafc",
    color: "#0f172a",
  },

  themeOptionSelected: {
    border: "1px solid rgba(99,102,241,0.65)",
    background: "rgba(99,102,241,0.12)",
    boxShadow: "0 8px 25px rgba(79,70,229,0.12)",
  },

  themeIcon: {
    width: "38px",
    height: "38px",
    borderRadius: "11px",
    background: "rgba(148,163,184,0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#a5b4fc",
    flexShrink: 0,
  },

  themeIconLight: {
    background: "#e2e8f0",
    color: "#4f46e5",
  },

  themeContent: {
    flex: 1,
    minWidth: 0,
  },

  themeTitle: {
    margin: 0,
    fontSize: "14px",
    fontWeight: 700,
    color: "#f8fafc",
  },

  themeTitleLight: {
    color: "#0f172a",
  },

  themeDescription: {
    margin: "4px 0 0",
    fontSize: "11px",
    color: "#64748b",
  },

  themeDescriptionLight: {
    color: "#64748b",
  },

  radio: {
    width: "21px",
    height: "21px",
    borderRadius: "50%",
    border: "2px solid #475569",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#ffffff",
    fontSize: "9px",
    flexShrink: 0,
  },

  radioSelected: {
    border: "2px solid #6366f1",
    background: "#6366f1",
  },

  saveContainer: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: "22px",
  },

  saveButton: {
    border: "none",
    borderRadius: "13px",
    padding: "13px 22px",
    background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    gap: "9px",
    cursor: "pointer",
    boxShadow: "0 10px 25px rgba(79,70,229,0.25)",
  },

  disabledButton: {
    opacity: 0.6,
    cursor: "not-allowed",
  },

  passwordForm: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },

  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  inputLabel: {
    fontSize: "13px",
    fontWeight: 650,
    color: "#cbd5e1",
  },

  inputLabelLight: {
    color: "#334155",
  },

  passwordWrapper: {
    position: "relative",
    width: "100%",
  },

  passwordInput: {
    width: "100%",
    boxSizing: "border-box",
    padding: "13px 48px 13px 14px",
    borderRadius: "12px",
    border: "1px solid rgba(148,163,184,0.14)",
    background: "rgba(15,23,42,0.7)",
    color: "#ffffff",
    outline: "none",
    fontSize: "14px",
  },

  passwordInputLight: {
    background: "#ffffff",
    border: "1px solid #cbd5e1",
    color: "#0f172a",
  },

  passwordInputError: {
    border: "1px solid #ef4444",
    boxShadow: "0 0 0 3px rgba(239,68,68,0.10)",
  },

  passwordError: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    color: "#ef4444",
    fontSize: "12px",
    fontWeight: 600,
  },

  eyeButton: {
    position: "absolute",
    right: "8px",
    top: "50%",
    transform: "translateY(-50%)",
    border: "none",
    background: "transparent",
    color: "#64748b",
    cursor: "pointer",
    width: "35px",
    height: "35px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  eyeButtonLight: {
    color: "#64748b",
  },

  passwordButton: {
    alignSelf: "flex-start",
    border: "none",
    borderRadius: "12px",
    padding: "12px 19px",
    background: "linear-gradient(135deg,#16a34a,#15803d)",
    color: "#ffffff",
    fontWeight: 700,
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    gap: "9px",
    cursor: "pointer",
  },

  logoutCard: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    padding: "23px 26px",
    borderRadius: "20px",
    background: "rgba(127,29,29,0.12)",
    border: "1px solid rgba(248,113,113,0.14)",
    marginBottom: "30px",
  },

  logoutCardLight: {
    background: "#fff1f2",
    border: "1px solid #fecdd3",
  },

  logoutTitle: {
    margin: 0,
    fontSize: "17px",
    color: "#f8fafc",
  },

  logoutTitleLight: {
    color: "#0f172a",
  },

  logoutDescription: {
    margin: "5px 0 0",
    color: "#94a3b8",
    fontSize: "12px",
  },

  logoutDescriptionLight: {
    color: "#64748b",
  },

  logoutButton: {
    border: "1px solid rgba(248,113,113,0.25)",
    borderRadius: "11px",
    padding: "11px 17px",
    background: "rgba(127,29,29,0.22)",
    color: "#f87171",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    flexShrink: 0,
  },

  loadingContainer: {
    minHeight: "80vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  spinner: {
    width: "42px",
    height: "42px",
    border: "4px solid rgba(148,163,184,0.15)",
    borderTop: "4px solid #6366f1",
    borderRadius: "50%",
    animation: "sbecSettingsSpin 0.8s linear infinite",
  },

  loadingTitle: {
    margin: "18px 0 5px",
    fontSize: "20px",
  },

  loadingText: {
    margin: 0,
    color: "#64748b",
    fontSize: "13px",
  },
};

// ============================================================
// ANIMATION
// ============================================================

if (
  typeof document !== "undefined" &&
  !document.getElementById("sbec-settings-style")
) {
  const style = document.createElement("style");

  style.id = "sbec-settings-style";

  style.innerHTML = `
    @keyframes sbecSettingsSpin {
      from {
        transform: rotate(0deg);
      }

      to {
        transform: rotate(360deg);
      }
    }

    @media (max-width: 768px) {
      .sbec-settings-page {
        padding: 20px !important;
      }
    }

    @media (max-width: 650px) {
      .sbec-settings-page {
        padding: 16px !important;
      }

      .themeGrid {
        grid-template-columns: 1fr !important;
      }
    }
  `;

  document.head.appendChild(style);
}

export default StudentSettings;
