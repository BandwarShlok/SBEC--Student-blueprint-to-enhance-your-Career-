import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUsers,
  FaBook,
  FaStickyNote,
  FaFileAlt,
  FaQuestionCircle,
  FaClipboardCheck,
  FaCalendarAlt,
  FaCog,
  FaSignOutAlt,
  FaGraduationCap,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import toast from "react-hot-toast";

function AdminSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  // ========================================
  // MENU ITEMS
  // ========================================

  const menuItems = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: <FaTachometerAlt />,
    },
    {
      name: "Students",
      path: "/admin/students",
      icon: <FaUsers />,
    },
    {
      name: "Subjects",
      path: "/admin/subjects",
      icon: <FaBook />,
    },
    {
      name: "Notes",
      path: "/admin/notes",
      icon: <FaStickyNote />,
    },
    {
      name: "Previous Papers",
      path: "/admin/papers",
      icon: <FaFileAlt />,
    },
    {
      name: "Quiz Questions",
      path: "/admin/quiz",
      icon: <FaQuestionCircle />,
    },
    {
      name: "Weekly Tests",
      path: "/admin/weekly-tests",
      icon: <FaClipboardCheck />,
    },
    {
      name: "Exam Data",
      path: "/admin/exams",
      icon: <FaCalendarAlt />,
    },
    {
      name: "Settings",
      path: "/admin/settings",
      icon: <FaCog />,
    },
  ];

  // ========================================
  // LOGOUT
  // ========================================

  const handleLogout = () => {
    try {
      // ------------------------------------
      // REMOVE ADMIN AUTH DATA
      // ------------------------------------

      localStorage.removeItem("admin_token");
      localStorage.removeItem("adminToken");
      localStorage.removeItem("admin");
      localStorage.removeItem("admin_logged_in");
      localStorage.removeItem("adminLoggedIn");

      // ------------------------------------
      // REMOVE SESSION DATA
      // ------------------------------------

      sessionStorage.removeItem("admin_token");
      sessionStorage.removeItem("adminToken");
      sessionStorage.removeItem("admin");
      sessionStorage.removeItem("admin_logged_in");
      sessionStorage.removeItem("adminLoggedIn");

      // ------------------------------------
      // CLOSE MOBILE SIDEBAR
      // ------------------------------------

      setMobileOpen(false);

      // ------------------------------------
      // SHOW SUCCESS MESSAGE
      // ------------------------------------

      toast.success("Logged out successfully");

      // ------------------------------------
      // REDIRECT TO LOGIN
      // ------------------------------------

      setTimeout(() => {
        window.location.replace("/admin/login");
      }, 300);
    } catch (error) {
      console.error("Logout error:", error);

      // Force login page even if an error occurs
      window.location.replace("/admin/login");
    }
  };

  // ========================================
  // CLOSE MOBILE MENU
  // ========================================

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  // ========================================
  // UI
  // ========================================

  return (
    <>
      {/* =====================================================
          MOBILE TOP BAR
      ===================================================== */}

      <div className="admin-mobile-topbar">
        <div className="admin-mobile-brand">
          <div className="admin-mobile-logo">
            <FaGraduationCap />
          </div>

          <div>
            <div className="admin-mobile-title">
              SBEC
            </div>

            <div className="admin-mobile-subtitle">
              Admin Panel
            </div>
          </div>
        </div>

        <button
          type="button"
          className="admin-mobile-menu-button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open admin menu"
        >
          <FaBars />
        </button>
      </div>

      {/* =====================================================
          MOBILE OVERLAY
      ===================================================== */}

      {mobileOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={closeMobileMenu}
        />
      )}

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={`admin-sidebar ${
          mobileOpen ? "admin-sidebar-open" : ""
        }`}
      >
        {/* ===================================================
            BRAND
        =================================================== */}

        <div className="admin-sidebar-brand">
          <div className="admin-sidebar-brand-content">
            <div className="admin-sidebar-logo">
              <FaGraduationCap />
            </div>

            <div>
              <h2>SBEC</h2>
              <p>Admin Panel</p>
            </div>
          </div>

          {/* Mobile close button */}

          <button
            type="button"
            className="admin-mobile-close"
            onClick={closeMobileMenu}
            aria-label="Close admin menu"
          >
            <FaTimes />
          </button>
        </div>

        {/* ===================================================
            NAVIGATION
        =================================================== */}

        <nav className="admin-sidebar-nav">
          <p className="admin-sidebar-heading">
            Management
          </p>

          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                `admin-sidebar-link ${
                  isActive
                    ? "admin-sidebar-link-active"
                    : ""
                }`
              }
            >
              <span className="admin-sidebar-icon">
                {item.icon}
              </span>

              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* ===================================================
            LOGOUT
        =================================================== */}

        <div className="admin-sidebar-logout-wrapper">
          <button
            type="button"
            onClick={handleLogout}
            className="admin-sidebar-logout"
          >
            <FaSignOutAlt />

            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* =====================================================
          RESPONSIVE CSS
      ===================================================== */}

      <style>
        {`

          /* ================================================
             DESKTOP SIDEBAR
          ================================================= */

          .admin-sidebar {
            position: fixed;
            left: 0;
            top: 0;

            width: 260px;
            height: 100vh;

            background: #0F172A;
            border-right: 1px solid #1E293B;

            display: flex;
            flex-direction: column;

            z-index: 200;

            overflow-y: auto;

            transition: transform 0.3s ease;
          }


          /* ================================================
             BRAND
          ================================================= */

          .admin-sidebar-brand {
            padding: 28px 25px;

            border-bottom: 1px solid #1E293B;
          }

          .admin-sidebar-brand-content {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .admin-sidebar-logo {
            width: 40px;
            height: 40px;

            border-radius: 12px;

            background: #8B5CF6;

            display: flex;
            align-items: center;
            justify-content: center;

            color: #FFFFFF;

            font-size: 20px;

            flex-shrink: 0;
          }

          .admin-sidebar-brand h2 {
            color: #FFFFFF;

            font-size: 22px;

            margin: 0;
          }

          .admin-sidebar-brand p {
            color: #64748B;

            font-size: 11px;

            margin: 3px 0 0;
          }


          /* ================================================
             NAVIGATION
          ================================================= */

          .admin-sidebar-nav {
            flex: 1;

            padding: 20px 14px;

            overflow-y: auto;
          }

          .admin-sidebar-heading {
            color: #64748B;

            font-size: 11px;

            font-weight: 700;

            text-transform: uppercase;

            letter-spacing: 1px;

            padding: 0 12px;

            margin: 0 0 12px;
          }

          .admin-sidebar-link {
            display: flex;

            align-items: center;

            gap: 13px;

            padding: 12px 13px;

            margin-bottom: 5px;

            border-radius: 10px;

            text-decoration: none;

            color: #94A3B8;

            background: transparent;

            font-size: 14px;

            font-weight: 500;

            transition:
              background 0.2s ease,
              color 0.2s ease,
              transform 0.2s ease;
          }

          .admin-sidebar-link:hover {
            background: #1E293B;

            color: #FFFFFF;
          }

          .admin-sidebar-link-active {
            color: #FFFFFF !important;

            background: #8B5CF6 !important;

            font-weight: 600;

            box-shadow:
              0 8px 20px rgba(139, 92, 246, 0.20);
          }

          .admin-sidebar-icon {
            width: 20px;

            display: flex;

            align-items: center;

            justify-content: center;

            font-size: 15px;

            flex-shrink: 0;
          }


          /* ================================================
             LOGOUT
          ================================================= */

          .admin-sidebar-logout-wrapper {
            padding: 15px 14px 20px;

            border-top: 1px solid #1E293B;
          }

          .admin-sidebar-logout {
            width: 100%;

            display: flex;

            align-items: center;

            gap: 13px;

            padding: 12px 13px;

            background: transparent;

            border: none;

            border-radius: 10px;

            color: #94A3B8;

            cursor: pointer;

            font-size: 14px;

            text-align: left;

            transition:
              background 0.2s ease,
              color 0.2s ease;
          }

          .admin-sidebar-logout:hover {
            background: #1E293B;

            color: #FFFFFF;
          }


          /* ================================================
             MOBILE TOP BAR
          ================================================= */

          .admin-mobile-topbar {
            display: none;
          }

          .admin-mobile-brand {
            display: flex;

            align-items: center;

            gap: 10px;
          }

          .admin-mobile-logo {
            width: 40px;
            height: 40px;

            border-radius: 10px;

            background: #8B5CF6;

            color: #FFFFFF;

            display: flex;

            align-items: center;

            justify-content: center;

            font-size: 20px;
          }

          .admin-mobile-title {
            color: #FFFFFF;

            font-size: 18px;

            font-weight: 800;
          }

          .admin-mobile-subtitle {
            color: #64748B;

            font-size: 10px;

            margin-top: 1px;
          }

          .admin-mobile-menu-button {
            width: 42px;
            height: 42px;

            display: flex;

            align-items: center;

            justify-content: center;

            border-radius: 10px;

            border: 1px solid #334155;

            background: #1E293B;

            color: #FFFFFF;

            font-size: 18px;

            cursor: pointer;
          }

          .admin-mobile-menu-button:active {
            background: #8B5CF6;
          }


          /* ================================================
             MOBILE OVERLAY
          ================================================= */

          .admin-sidebar-overlay {
            position: fixed;

            inset: 0;

            background: rgba(0, 0, 0, 0.60);

            z-index: 199;
          }


          /* ================================================
             MOBILE CLOSE BUTTON
          ================================================= */

          .admin-mobile-close {
            display: none;

            width: 38px;
            height: 38px;

            border-radius: 9px;

            border: 1px solid #334155;

            background: #1E293B;

            color: #FFFFFF;

            align-items: center;
            justify-content: center;

            font-size: 16px;

            cursor: pointer;
          }


          /* ================================================
             TABLET / MOBILE
          ================================================= */

          @media (max-width: 768px) {

            .admin-mobile-topbar {
              position: fixed;

              top: 0;
              left: 0;
              right: 0;

              height: 65px;

              padding: 10px 15px;

              background: #0F172A;

              border-bottom: 1px solid #1E293B;

              display: flex;

              align-items: center;

              justify-content: space-between;

              z-index: 198;
            }


            .admin-sidebar {
              width: 280px;

              max-width: 85vw;

              transform: translateX(-100%);

              box-shadow:
                10px 0 30px rgba(0, 0, 0, 0.40);
            }


            .admin-sidebar.admin-sidebar-open {
              transform: translateX(0);
            }


            .admin-sidebar-brand {
              padding: 18px 18px;

              display: flex;

              align-items: center;

              justify-content: space-between;
            }


            .admin-mobile-close {
              display: flex;
            }


            .admin-sidebar-nav {
              padding: 18px 14px;
            }


            .admin-sidebar-link {
              padding: 14px 13px;

              font-size: 14px;
            }


            .admin-sidebar-logout-wrapper {
              padding-bottom: 18px;
            }
          }


          /* ================================================
             SMALL PHONES
          ================================================= */

          @media (max-width: 480px) {

            .admin-mobile-topbar {
              height: 60px;

              padding: 9px 12px;
            }


            .admin-mobile-logo {
              width: 36px;
              height: 36px;

              font-size: 18px;
            }


            .admin-mobile-title {
              font-size: 17px;
            }


            .admin-mobile-subtitle {
              font-size: 9px;
            }


            .admin-mobile-menu-button {
              width: 40px;
              height: 40px;

              font-size: 17px;
            }


            .admin-sidebar {
              width: 275px;
            }
          }

        `}
      </style>
    </>
  );
}

export default AdminSidebar;