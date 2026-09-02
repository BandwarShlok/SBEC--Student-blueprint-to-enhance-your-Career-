import { Navigate, Outlet } from "react-router-dom";

function AdminProtectedRoute() {
  const token = localStorage.getItem("admin_token");
  const adminData = localStorage.getItem("admin");

  // Check login
  if (!token || !adminData) {
    return (
      <Navigate
        to="/admin/login"
        replace
      />
    );
  }

  // Read admin data
  let admin;

  try {
    admin = JSON.parse(adminData);
  } catch  {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin");

    return (
      <Navigate
        to="/admin/login"
        replace
      />
    );
  }

  // Check admin role
  if (admin.role !== "admin") {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin");

    return (
      <Navigate
        to="/admin/login"
        replace
      />
    );
  }

  // Admin authenticated
  return <Outlet />;
}

export default AdminProtectedRoute;