import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaGraduationCap,
  FaUserShield,
  FaLock,
  FaArrowRight,
} from "react-icons/fa";
import toast from "react-hot-toast";

import API_URL from "../../../config/api";

function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      toast.error("Please enter email and password.");
      return;
    }

    if (loading) return;

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/admin/auth/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      let data;

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        toast.error(
          data.message || "Admin login failed."
        );

        return;
      }

      /*
      ========================================
      VALIDATE LOGIN RESPONSE
      ========================================
      */

      if (!data.token) {
        toast.error(
          "Login failed: authentication token was not received."
        );

        return;
      }

      /*
      ========================================
      SAVE ADMIN AUTHENTICATION
      ========================================
      */

      localStorage.setItem(
        "admin_token",
        data.token
      );

      if (data.admin) {
        localStorage.setItem(
          "admin",
          JSON.stringify(data.admin)
        );
      }

      /*
      ========================================
      SUCCESS
      ========================================
      */

      toast.success("Admin login successful.");

      navigate("/admin/dashboard", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Admin Login Error:",
        error
      );

      toast.error(
        "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* ========================================
            LOGO
        ======================================== */}

        <div style={styles.logo}>
          <FaGraduationCap />
        </div>

        <h1 style={styles.title}>
          SBEC
        </h1>

        <p style={styles.subtitle}>
          Smart Blueprint to Enhance Career
        </p>

        {/* ========================================
            ADMIN BADGE
        ======================================== */}

        <div style={styles.adminBadge}>
          <FaUserShield />

          <span>
            ADMIN PANEL
          </span>
        </div>

        <h2 style={styles.heading}>
          Admin Login
        </h2>

        <p style={styles.description}>
          Login to manage students and study content.
        </p>

        {/* ========================================
            LOGIN FORM
        ======================================== */}

        <form onSubmit={handleSubmit}>

          {/* EMAIL */}

          <div style={styles.field}>
            <label style={styles.label}>
              Email
            </label>

            <div style={styles.inputWrapper}>
              <FaUserShield
                style={styles.inputIcon}
              />

              <input
                type="email"
                placeholder="Enter admin email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                style={styles.input}
                autoComplete="username"
                disabled={loading}
              />
            </div>
          </div>

          {/* PASSWORD */}

          <div style={styles.field}>
            <label style={styles.label}>
              Password
            </label>

            <div style={styles.inputWrapper}>
              <FaLock
                style={styles.inputIcon}
              />

              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                style={styles.input}
                autoComplete="current-password"
                disabled={loading}
              />
            </div>
          </div>

          {/* LOGIN BUTTON */}

          <button
            type="submit"
            style={{
              ...styles.loginButton,
              ...(loading
                ? styles.loginButtonDisabled
                : {}),
            }}
            disabled={loading}
          >
            {loading ? (
              <>
                <span style={styles.spinner}>
                  ⟳
                </span>

                Logging in...
              </>
            ) : (
              <>
                Login to Admin Panel

                <FaArrowRight />
              </>
            )}
          </button>
        </form>

        {/* ========================================
            BACK TO STUDENT LOGIN
        ======================================== */}

        <button
          type="button"
          onClick={() =>
            navigate("/login")
          }
          style={styles.backButton}
          disabled={loading}
        >
          ← Back to Student Login
        </button>

      </div>
    </div>
  );
}

/*
========================================
STYLES
========================================
*/

const styles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    background: "#020617",

    display: "flex",
    justifyContent: "center",
    alignItems: "center",

    padding: "20px",
    boxSizing: "border-box",
  },

  card: {
    width: "100%",
    maxWidth: "430px",

    background: "#0F172A",

    border: "1px solid #1E293B",
    borderRadius: "18px",

    padding: "35px",

    boxSizing: "border-box",

    textAlign: "center",

    boxShadow:
      "0 20px 60px rgba(0,0,0,0.35)",
  },

  logo: {
    width: "58px",
    height: "58px",

    margin: "0 auto 12px",

    borderRadius: "15px",

    background: "#8B5CF6",
    color: "#FFFFFF",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    fontSize: "26px",

    boxShadow:
      "0 10px 25px rgba(139,92,246,0.25)",
  },

  title: {
    color: "#FFFFFF",

    fontSize: "27px",

    margin: 0,

    fontWeight: "800",
  },

  subtitle: {
    color: "#64748B",

    fontSize: "12px",

    margin: "5px 0 20px",
  },

  adminBadge: {
    display: "inline-flex",

    alignItems: "center",
    justifyContent: "center",

    gap: "7px",

    background: "#312E81",

    color: "#A78BFA",

    borderRadius: "7px",

    padding: "7px 10px",

    fontSize: "10px",

    fontWeight: "700",

    letterSpacing: "0.7px",
  },

  heading: {
    color: "#FFFFFF",

    fontSize: "22px",

    margin: "22px 0 5px",

    fontWeight: "700",
  },

  description: {
    color: "#64748B",

    fontSize: "12px",

    margin: "0 0 25px",

    lineHeight: "1.5",
  },

  field: {
    textAlign: "left",

    marginBottom: "18px",
  },

  label: {
    display: "block",

    color: "#CBD5E1",

    fontSize: "12px",

    fontWeight: "600",

    marginBottom: "7px",
  },

  inputWrapper: {
    display: "flex",

    alignItems: "center",

    width: "100%",

    boxSizing: "border-box",

    background: "#020617",

    border: "1px solid #334155",

    borderRadius: "9px",

    padding: "0 12px",

    transition:
      "border-color 0.2s ease",
  },

  inputIcon: {
    color: "#64748B",

    fontSize: "13px",

    flexShrink: 0,
  },

  input: {
    width: "100%",

    minWidth: 0,

    background: "transparent",

    border: "none",

    outline: "none",

    color: "#FFFFFF",

    padding: "12px 10px",

    fontSize: "13px",

    boxSizing: "border-box",
  },

  loginButton: {
    width: "100%",

    minHeight: "46px",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    gap: "9px",

    background: "#8B5CF6",

    color: "#FFFFFF",

    border: "none",

    borderRadius: "9px",

    padding: "13px",

    fontSize: "13px",

    fontWeight: "700",

    cursor: "pointer",

    marginTop: "8px",

    transition:
      "all 0.2s ease",
  },

  loginButtonDisabled: {
    opacity: 0.65,

    cursor: "not-allowed",
  },

  spinner: {
    display: "inline-block",

    fontSize: "17px",

    animation:
      "sbec-spin 1s linear infinite",
  },

  backButton: {
    marginTop: "20px",

    background: "transparent",

    border: "none",

    color: "#94A3B8",

    fontSize: "12px",

    cursor: "pointer",
  },
};

export default AdminLogin;