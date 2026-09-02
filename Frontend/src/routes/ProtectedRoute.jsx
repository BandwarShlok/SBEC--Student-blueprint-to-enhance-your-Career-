import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function ProtectedRoute() {
  const { token, user, loading } = useAuth();
  const location = useLocation();

  // ==========================================
  // WAIT FOR AUTH CHECK
  // ==========================================

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.spinner}></div>

        <p style={styles.loadingText}>
          Checking authentication...
        </p>
      </div>
    );
  }

  // ==========================================
  // NO LOGIN
  // ==========================================

  if (!token || !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  // ==========================================
  // ADMIN CANNOT ACCESS STUDENT ROUTES
  // ==========================================

  if (user.role === "admin") {
    return (
      <Navigate
        to="/admin/dashboard"
        replace
      />
    );
  }

  // ==========================================
  // STUDENT ONLY
  // ==========================================

  if (user.role !== "student") {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  // ==========================================
  // AUTHENTICATED STUDENT
  // ==========================================

  return <Outlet />;
}

const styles = {
  loadingPage: {
    minHeight: "100vh",
    width: "100%",
    background: "#020617",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  spinner: {
    width: "35px",
    height: "35px",
    border: "4px solid #1E293B",
    borderTop: "4px solid #8B5CF6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },

  loadingText: {
    color: "#94A3B8",
    marginTop: "15px",
    fontSize: "14px",
  },
};

export default ProtectedRoute;