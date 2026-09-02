import { Navigate, Outlet } from "react-router-dom";

function AdminProtectedRoute() {
  const token = localStorage.getItem("admin_token");
  const adminData = localStorage.getItem("admin");

  // ---------------------------------------------
  // CHECK ADMIN LOGIN
  // ---------------------------------------------
  if (!token || !adminData) {
    return <Navigate to="/admin/login" replace />;
  }

  // ---------------------------------------------
  // READ ADMIN DATA
  // ---------------------------------------------
  let admin;

  try {
    admin = JSON.parse(adminData);
  } catch (error) {
    console.error("Admin data parsing error:", error);

    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin");

    return <Navigate to="/admin/login" replace />;
  }

  // ---------------------------------------------
  // CHECK ADMIN DATA
  // ---------------------------------------------
  if (!admin || typeof admin !== "object") {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin");

    return <Navigate to="/admin/login" replace />;
  }

  // ---------------------------------------------
  // CHECK ADMIN ROLE
  // ---------------------------------------------
  if (admin.role !== "admin") {
    console.error("Access denied: account is not an admin.");

    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin");

    return <Navigate to="/admin/login" replace />;
  }

  // ---------------------------------------------
  // ADMIN AUTHENTICATED
  // ---------------------------------------------
  return <Outlet />;
}

export default AdminProtectedRoute;