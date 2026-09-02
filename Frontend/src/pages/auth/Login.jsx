import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import toast from "react-hot-toast";

import { useAuth } from "../../context/useAuth";
import API_URL from "../../config/api";

function Login() {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  // ========================================
  // HANDLE INPUT CHANGE
  // ========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ========================================
  // LOGIN
  // ========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = formData.email.trim();
    const password = formData.password;

    // Validation
    if (!email) {
      toast.error("Please enter your email.");
      return;
    }

    if (!password) {
      toast.error("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      console.log("Login API:", `${API_URL}/api/auth/login`);

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email,
          password,
        }),
      });

      // Try to read JSON safely
      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error("Server returned an invalid response.");
      }

      // Backend error
      if (!response.ok) {
        throw new Error(data?.message || "Login failed.");
      }

      // Check token
      if (!data?.token) {
        throw new Error("Login token was not received from server.");
      }

      // Check user
      if (!data?.user) {
        throw new Error("User information was not received from server.");
      }

      // ========================================
      // SAVE AUTH DATA THROUGH AUTH CONTEXT
      // ========================================

      const loginSuccess = login(data.token, data.user);

      if (!loginSuccess) {
        throw new Error("Unable to save login session.");
      }

      toast.success("Login successful!");

      // ========================================
      // GO TO STUDENT DASHBOARD
      // ========================================

      navigate("/dashboard", {
        replace: true,
      });
    } catch (error) {
      console.error("Student Login Error:", error);

      // Network error
      if (
        error instanceof TypeError &&
        error.message.toLowerCase().includes("fetch")
      ) {
        toast.error("Unable to connect to the server.");
      } else {
        toast.error(error?.message || "Unable to login.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // UI
  // ========================================

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* LOGO */}

        <div style={styles.logo}>SBEC</div>

        {/* TITLE */}

        <h1 style={styles.title}>Welcome Back</h1>

        <p style={styles.subtitle}>
          Sign in to continue your learning journey.
        </p>

        {/* FORM */}

        <form onSubmit={handleSubmit}>
          {/* EMAIL */}

          <label style={styles.label}>Email Address</label>

          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            style={styles.input}
            autoComplete="email"
            disabled={loading}
          />

          {/* PASSWORD */}

          <label style={styles.label}>Password</label>

          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            style={styles.input}
            autoComplete="current-password"
            disabled={loading}
          />

          {/* FORGOT PASSWORD */}

          <div style={styles.forgotContainer}>
            <button
              type="button"
              style={styles.forgotButton}
              onClick={() => toast("Password recovery will be added later.")}
            >
              Forgot Password?
            </button>
          </div>

          {/* LOGIN BUTTON */}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.loginButton,

              opacity: loading ? 0.7 : 1,

              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {/* REGISTER */}

        <p style={styles.registerText}>
          Don't have an account?{" "}
          <Link to="/register" style={styles.registerLink}>
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}

// ========================================
// STYLES
// ========================================

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

    borderRadius: "20px",

    padding: "40px",

    boxSizing: "border-box",

    boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
  },

  logo: {
    textAlign: "center",

    color: "#8B5CF6",

    fontSize: "32px",

    fontWeight: "800",

    letterSpacing: "2px",

    marginBottom: "25px",
  },

  title: {
    color: "#FFFFFF",

    textAlign: "center",

    fontSize: "30px",

    margin: "0 0 10px",
  },

  subtitle: {
    color: "#94A3B8",

    textAlign: "center",

    lineHeight: "24px",

    margin: "0 0 30px",
  },

  label: {
    display: "block",

    color: "#CBD5E1",

    fontSize: "14px",

    fontWeight: "600",

    marginBottom: "8px",
  },

  input: {
    width: "100%",

    padding: "14px",

    marginBottom: "20px",

    background: "#020617",

    color: "#FFFFFF",

    border: "1px solid #334155",

    borderRadius: "10px",

    outline: "none",

    fontSize: "15px",

    boxSizing: "border-box",
  },

  forgotContainer: {
    textAlign: "right",

    marginBottom: "20px",
  },

  forgotButton: {
    background: "transparent",

    border: "none",

    color: "#A78BFA",

    cursor: "pointer",

    fontSize: "13px",

    padding: 0,
  },

  loginButton: {
    width: "100%",

    padding: "14px",

    background: "#8B5CF6",

    color: "#FFFFFF",

    border: "none",

    borderRadius: "10px",

    fontSize: "16px",

    fontWeight: "700",
  },

  registerText: {
    color: "#94A3B8",

    textAlign: "center",

    marginTop: "25px",

    fontSize: "14px",
  },

  registerLink: {
    color: "#A78BFA",

    textDecoration: "none",

    fontWeight: "600",
  },
};

export default Login;
