import { useState } from "react";
import { NavLink } from "react-router-dom";

import {
  FaHome,
  FaBook,
  FaRobot,
  FaCalendarAlt,
  FaFileAlt,
  FaClipboardCheck,
  FaCog,
  FaUser,
  FaGraduationCap,
  FaBars,
  FaTimes,
} from "react-icons/fa";

function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  // =========================================
  // STUDENT MENU
  // =========================================

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <FaHome />,
    },
    {
      name: "Daily Planner",
      path: "/daily-planner",
      icon: <FaCalendarAlt />,
    },
    {
      name: "Subjects",
      path: "/subjects",
      icon: <FaBook />,
    },
    {
      name: "AI Study Assistant",
      path: "/ai-assistant",
      icon: <FaRobot />,
    },
    {
      name: "Exam Planner",
      path: "/exam-planner",
      icon: <FaCalendarAlt />,
    },
    {
      name: "Previous Papers",
      path: "/previous-papers",
      icon: <FaFileAlt />,
    },
    {
      name: "Quiz & Tests",
      path: "/quiz",
      icon: <FaClipboardCheck />,
    },
    {
      name: "Profile",
      path: "/profile",
      icon: <FaUser />,
    },
    {
      name: "Settings",
      path: "/settings",
      icon: <FaCog />,
    },
  ];

  return (
    <>
      {/* =========================================
          MOBILE TOP HEADER
      ========================================= */}

      <header className="student-mobile-header">
        <div className="student-mobile-brand">
          <div className="student-mobile-logo">
            <FaGraduationCap />
          </div>

          <div>
            <div className="student-mobile-title">SBEC</div>
            <div className="student-mobile-subtitle">
              Student Panel
            </div>
          </div>
        </div>

        <button
          type="button"
          className="student-mobile-menu-button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation"
        >
          <FaBars />
        </button>
      </header>

      {/* =========================================
          MOBILE OVERLAY
      ========================================= */}

      {mobileOpen && (
        <div
          className="student-sidebar-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* =========================================
          SIDEBAR
      ========================================= */}

      <aside
        className={`student-sidebar ${
          mobileOpen ? "student-sidebar-open" : ""
        }`}
      >
        {/* =========================================
            SIDEBAR LOGO
        ========================================= */}

        <div className="student-sidebar-logo">
          <div className="student-sidebar-brand">
            <div className="student-sidebar-logo-icon">
              <FaGraduationCap />
            </div>

            <div>
              <h2>SBEC</h2>
              <p>Smart Career Platform</p>
            </div>
          </div>

          {/* Mobile Close Button */}

          <button
            type="button"
            className="student-mobile-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          >
            <FaTimes />
          </button>
        </div>

        {/* =========================================
            NAVIGATION
        ========================================= */}

        <nav className="student-sidebar-nav">
          <p className="student-menu-heading">Main Menu</p>

          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `student-sidebar-link ${
                  isActive ? "student-sidebar-link-active" : ""
                }`
              }
            >
              <span className="student-sidebar-icon">
                {item.icon}
              </span>

              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* =========================================
          CSS
      ========================================= */}

      <style>
        {`
          /* =========================================
             DESKTOP SIDEBAR
          ========================================= */

          .student-sidebar {
            position: fixed;
            left: 0;
            top: 0;

            width: 260px;
            height: 100vh;

            background: #0F172A;

            border-right: 1px solid #1E293B;

            display: flex;
            flex-direction: column;

            z-index: 1000;

            overflow-y: auto;
            overflow-x: hidden;

            box-sizing: border-box;
          }


          /* =========================================
             DESKTOP LOGO
          ========================================= */

          .student-sidebar-logo {
            height: 116px;

            padding: 0 24px;

            display: flex;
            align-items: center;

            border-bottom: 1px solid #1E293B;

            box-sizing: border-box;

            flex-shrink: 0;
          }


          .student-sidebar-brand {
            display: flex;
            align-items: center;

            gap: 12px;
          }


          .student-sidebar-logo-icon {
            width: 40px;
            height: 40px;

            border-radius: 12px;

            background: #8B5CF6;

            display: flex;
            align-items: center;
            justify-content: center;

            color: white;

            font-size: 20px;

            flex-shrink: 0;
          }


          .student-sidebar-brand h2 {
            margin: 0;

            color: white;

            font-size: 22px;

            font-weight: 800;
          }


          .student-sidebar-brand p {
            margin: 4px 0 0;

            color: #64748B;

            font-size: 11px;
          }


          /* =========================================
             NAVIGATION
          ========================================= */

          .student-sidebar-nav {
            flex: 1;

            padding: 22px 14px;

            box-sizing: border-box;
          }


          .student-menu-heading {
            margin: 0 0 12px;

            padding: 0 12px;

            color: #64748B;

            font-size: 11px;

            font-weight: 700;

            text-transform: uppercase;

            letter-spacing: 1px;
          }


          .student-sidebar-link {
            display: flex;

            align-items: center;

            gap: 13px;

            width: 100%;

            padding: 12px 13px;

            margin-bottom: 5px;

            border-radius: 10px;

            color: #94A3B8;

            background: transparent;

            text-decoration: none;

            font-size: 14px;

            font-weight: 500;

            box-sizing: border-box;

            transition:
              background 0.2s ease,
              color 0.2s ease;
          }


          .student-sidebar-link:hover {
            background: #1E293B;

            color: white;
          }


          .student-sidebar-link-active {
            background: #8B5CF6 !important;

            color: white !important;

            font-weight: 600;

            box-shadow:
              0 8px 20px rgba(139, 92, 246, 0.20);
          }


          .student-sidebar-icon {
            width: 20px;

            min-width: 20px;

            display: flex;

            align-items: center;

            justify-content: center;

            font-size: 15px;
          }


          /* =========================================
             MOBILE HEADER
          ========================================= */

          .student-mobile-header {
            display: none;
          }


          .student-mobile-close {
            display: none;
          }


          .student-sidebar-overlay {
            display: none;
          }


          /* =========================================
             MOBILE
          ========================================= */

          @media (max-width: 768px) {

            .student-mobile-header {
              position: fixed;

              top: 0;
              left: 0;
              right: 0;

              height: 92px;

              background: #0F172A;

              border-bottom: 1px solid #1E293B;

              display: flex;

              align-items: center;

              justify-content: space-between;

              padding: 0 20px;

              box-sizing: border-box;

              z-index: 900;
            }


            .student-mobile-brand {
              display: flex;

              align-items: center;

              gap: 12px;
            }


            .student-mobile-logo {
              width: 54px;
              height: 54px;

              border-radius: 15px;

              background: #8B5CF6;

              color: white;

              display: flex;

              align-items: center;

              justify-content: center;

              font-size: 25px;

              flex-shrink: 0;
            }


            .student-mobile-title {
              color: white;

              font-size: 25px;

              line-height: 1;

              font-weight: 800;
            }


            .student-mobile-subtitle {
              color: #64748B;

              font-size: 12px;

              margin-top: 5px;
            }


            /* =========================================
               MOBILE MENU BUTTON
            ========================================= */

            .student-mobile-menu-button {
              width: 56px;
              height: 56px;

              border-radius: 15px;

              border: 2px solid #334155;

              background: #1E293B;

              color: white;

              display: flex;

              align-items: center;

              justify-content: center;

              font-size: 24px;

              cursor: pointer;

              transition: 0.2s ease;
            }


            .student-mobile-menu-button:hover {
              background: #8B5CF6;

              border-color: #8B5CF6;
            }


            .student-mobile-menu-button:active {
              transform: scale(0.96);
            }


            /* =========================================
               MOBILE SIDEBAR DRAWER
            ========================================= */

            .student-sidebar {
              width: 280px;

              max-width: 85vw;

              transform: translateX(-100%);

              transition:
                transform 0.25s ease;

              box-shadow:
                10px 0 30px rgba(0, 0, 0, 0.4);

              z-index: 1100;
            }


            .student-sidebar-open {
              transform: translateX(0);
            }


            /* =========================================
               MOBILE SIDEBAR HEADER
            ========================================= */

            .student-sidebar-logo {
              height: 88px;

              padding: 0 18px;

              justify-content: space-between;
            }


            .student-sidebar-logo-icon {
              width: 40px;
              height: 40px;

              font-size: 20px;
            }


            .student-sidebar-brand h2 {
              font-size: 21px;
            }


            .student-sidebar-brand p {
              font-size: 10px;
            }


            /* =========================================
               CLOSE BUTTON
            ========================================= */

            .student-mobile-close {
              display: flex;

              width: 40px;
              height: 40px;

              margin-left: auto;

              border: none;

              border-radius: 10px;

              background: #1E293B;

              color: #CBD5E1;

              align-items: center;

              justify-content: center;

              font-size: 18px;

              cursor: pointer;

              transition: 0.2s ease;
            }


            .student-mobile-close:hover {
              background: #8B5CF6;

              color: white;
            }


            /* =========================================
               OVERLAY
            ========================================= */

            .student-sidebar-overlay {
              display: block;

              position: fixed;

              inset: 0;

              background: rgba(0, 0, 0, 0.65);

              z-index: 1050;
            }


            /* =========================================
               MOBILE NAVIGATION
            ========================================= */

            .student-sidebar-nav {
              padding: 20px 12px;

              overflow-y: auto;
            }


            .student-menu-heading {
              margin-bottom: 12px;
            }


            .student-sidebar-link {
              padding: 14px 13px;

              margin-bottom: 6px;

              font-size: 14px;
            }

          }


          /* =========================================
             VERY SMALL PHONES
          ========================================= */

          @media (max-width: 400px) {

            .student-mobile-header {
              height: 84px;

              padding: 0 16px;
            }


            .student-mobile-logo {
              width: 48px;
              height: 48px;

              border-radius: 13px;

              font-size: 22px;
            }


            .student-mobile-title {
              font-size: 23px;
            }


            .student-mobile-subtitle {
              font-size: 11px;
            }


            .student-mobile-menu-button {
              width: 50px;
              height: 50px;

              font-size: 21px;
            }


            .student-sidebar {
              width: 275px;
            }

          }

        `}
      </style>
    </>
  );
}

export default Sidebar;