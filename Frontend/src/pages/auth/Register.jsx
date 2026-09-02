import { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";
import toast from "react-hot-toast";

import API_URL from "../../config/api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  // ========================================
  // HANDLE INPUT
  // ========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ========================================
  // REGISTER
  // ========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const name = formData.name.trim();
    const email = formData.email.trim();
    const password = formData.password;
    const confirmPassword =
      formData.confirmPassword;

    // ========================================
    // VALIDATION
    // ========================================

    if (!name) {
      toast.error("Please enter your name.");
      return;
    }

    if (name.length < 2) {
      toast.error(
        "Name must contain at least 2 characters."
      );
      return;
    }

    if (!email) {
      toast.error("Please enter your email.");
      return;
    }

    if (!password) {
      toast.error("Please enter a password.");
      return;
    }

    if (password.length < 6) {
      toast.error(
        "Password must contain at least 6 characters."
      );
      return;
    }

    if (!confirmPassword) {
      toast.error(
        "Please confirm your password."
      );
      return;
    }

    if (password !== confirmPassword) {
      toast.error(
        "Passwords do not match."
      );
      return;
    }

    if (loading) {
      return;
    }

    setLoading(true);

    try {
      console.log(
        "Register API:",
        `${API_URL}/api/auth/register`
      );

      const response = await fetch(
        `${API_URL}/api/auth/register`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name,
            email,
            password,

            // Default student information
            course: "BSc Computer Science",
            year: "",
            semester: "",
          }),
        }
      );

      // ========================================
      // SAFE JSON RESPONSE
      // ========================================

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "Server returned an invalid response."
        );
      }

      // ========================================
      // BACKEND ERROR
      // ========================================

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Registration failed."
        );
      }

      // ========================================
      // SUCCESS
      // ========================================

      toast.success(
        "Account created successfully!"
      );

      // Clear form
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      // Go to login
      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Student Register Error:",
        error
      );

      if (
        error instanceof TypeError
      ) {
        toast.error(
          "Unable to connect to the server."
        );
      } else {
        toast.error(
          error?.message ||
            "Unable to create account."
        );
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

        <div style={styles.logo}>
          SBEC
        </div>

        {/* TITLE */}

        <h1 style={styles.title}>
          Create Account
        </h1>

        <p style={styles.subtitle}>
          Start your personalized
          learning journey.
        </p>

        {/* FORM */}

        <form onSubmit={handleSubmit}>

          {/* FULL NAME */}

          <label style={styles.label}>
            Full Name
          </label>

          <input
            type="text"
            name="name"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleChange}
            style={styles.input}
            autoComplete="name"
            disabled={loading}
          />

          {/* EMAIL */}

          <label style={styles.label}>
            Email Address
          </label>

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

          <label style={styles.label}>
            Password
          </label>

          <input
            type="password"
            name="password"
            placeholder="Create a password"
            value={formData.password}
            onChange={handleChange}
            style={styles.input}
            autoComplete="new-password"
            disabled={loading}
          />

          {/* CONFIRM PASSWORD */}

          <label style={styles.label}>
            Confirm Password
          </label>

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            style={styles.input}
            autoComplete="new-password"
            disabled={loading}
          />

          {/* REGISTER BUTTON */}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.registerButton,

              opacity: loading
                ? 0.7
                : 1,

              cursor: loading
                ? "not-allowed"
                : "pointer",
            }}
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>

        </form>

        {/* LOGIN LINK */}

        <p style={styles.loginText}>
          Already have an account?{" "}

          <Link
            to="/login"
            style={styles.loginLink}
          >
            Sign In
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

    border:
      "1px solid #1E293B",

    borderRadius: "20px",

    padding: "40px",

    boxSizing: "border-box",

    boxShadow:
      "0 20px 50px rgba(0,0,0,0.3)",
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

    marginBottom: "18px",

    background: "#020617",

    color: "#FFFFFF",

    border:
      "1px solid #334155",

    borderRadius: "10px",

    outline: "none",

    fontSize: "15px",

    boxSizing: "border-box",
  },

  registerButton: {
    width: "100%",

    padding: "14px",

    marginTop: "5px",

    background: "#8B5CF6",

    color: "#FFFFFF",

    border: "none",

    borderRadius: "10px",

    fontSize: "16px",

    fontWeight: "700",
  },

  loginText: {
    color: "#94A3B8",

    textAlign: "center",

    marginTop: "25px",

    fontSize: "14px",
  },

  loginLink: {
    color: "#A78BFA",

    textDecoration: "none",

    fontWeight: "600",
  },
};

export default Register;