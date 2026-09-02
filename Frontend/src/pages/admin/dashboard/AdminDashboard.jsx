import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaUsers,
  FaBook,
  FaStickyNote,
  FaFileAlt,
  FaQuestionCircle,
  FaClipboardCheck,
  FaCalendarAlt,
  FaArrowRight,
  FaSyncAlt,
  FaExclamationCircle,
} from "react-icons/fa";

import toast from "react-hot-toast";
import API_URL from "../../../config/api";

function AdminDashboard() {
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ==========================================================
  // API HELPER
  // ==========================================================

  const getApiBase = () => {
    /*
      API_URL should contain only the backend host, for example:

      http://localhost:5000

      OR

      http://172.16.2.3:5000

      The /api part is added here.
    */

    return String(API_URL || "").replace(/\/+$/, "");
  };

  // ==========================================================
  // LOAD DASHBOARD
  // ==========================================================

  const loadDashboard = useCallback(
    async (showRefreshToast = false) => {
      const token = localStorage.getItem("admin_token");

      if (!token) {
        setDashboardData(null);
        setLoading(false);
        setRefreshing(false);

        toast.error("Admin session not found.");
        navigate("/admin/login", { replace: true });

        return;
      }

      try {
        if (showRefreshToast) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const response = await fetch(`${getApiBase()}/api/admin/dashboard`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        let data = null;

        try {
          data = await response.json();
        } catch {
          data = null;
        }

        // ======================================================
        // AUTH ERROR
        // ======================================================

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("admin_token");
          localStorage.removeItem("admin");

          setDashboardData(null);

          toast.error("Admin session expired. Please login again.");

          navigate("/admin/login", {
            replace: true,
          });

          return;
        }

        // ======================================================
        // OTHER API ERROR
        // ======================================================

        if (!response.ok) {
          throw new Error(data?.message || "Failed to load dashboard.");
        }

        // ======================================================
        // VALID RESPONSE
        // ======================================================

        setDashboardData(data);

        if (showRefreshToast) {
          toast.success("Dashboard refreshed.");
        }
      } catch (error) {
        console.error("ADMIN DASHBOARD ERROR:", error);

        setDashboardData(null);

        toast.error(
          error?.message ||
            "Unable to load dashboard. Please check the backend.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [navigate],
  );

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!active) return;

      await loadDashboard(false);
    };

    const timer = setTimeout(() => {
      load();
    }, 0);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [loadDashboard]);

  // ==========================================================
  // REFRESH
  // ==========================================================

  const handleRefresh = () => {
    if (loading || refreshing) {
      return;
    }

    loadDashboard(true);
  };

  // ==========================================================
  // STATISTICS
  // ==========================================================

  const stats = [
    {
      title: "Total Students",
      value: loading ? "..." : (dashboardData?.stats?.totalStudents ?? 0),
      text: "Registered students",
      icon: <FaUsers />,
      path: "/admin/students",
    },
    {
      title: "Total Subjects",
      value: loading ? "..." : (dashboardData?.stats?.totalSubjects ?? 0),
      text: "Available subjects",
      icon: <FaBook />,
      path: "/admin/subjects",
    },
    {
      title: "Total Notes",
      value: loading ? "..." : (dashboardData?.stats?.totalNotes ?? 0),
      text: "Study notes",
      icon: <FaStickyNote />,
      path: "/admin/notes",
    },
    {
      title: "Previous Papers",
      value: loading ? "..." : (dashboardData?.stats?.totalPapers ?? 0),
      text: "Uploaded papers",
      icon: <FaFileAlt />,
      path: "/admin/papers",
    },
    {
      title: "Quiz Questions",
      value: loading ? "..." : (dashboardData?.stats?.totalQuizzes ?? 0),
      text: "Available questions",
      icon: <FaQuestionCircle />,
      path: "/admin/quiz",
    },
    {
      title: "Weekly Tests",
      value: loading ? "..." : (dashboardData?.stats?.totalWeeklyTests ?? 0),
      text: "Created tests",
      icon: <FaClipboardCheck />,
      path: "/admin/weekly-tests",
    },
  ];

  // ==========================================================
  // QUICK ACTIONS
  // ==========================================================

  const quickActions = [
    {
      title: "Manage Students",
      icon: <FaUsers />,
      path: "/admin/students",
    },
    {
      title: "Manage Subjects",
      icon: <FaBook />,
      path: "/admin/subjects",
    },
    {
      title: "Manage Notes",
      icon: <FaStickyNote />,
      path: "/admin/notes",
    },
    {
      title: "Manage Papers",
      icon: <FaFileAlt />,
      path: "/admin/papers",
    },
    {
      title: "Manage Quiz",
      icon: <FaQuestionCircle />,
      path: "/admin/quiz",
    },
    {
      title: "Manage Weekly Tests",
      icon: <FaClipboardCheck />,
      path: "/admin/weekly-tests",
    },
  ];

  // ==========================================================
  // FORMAT STUDENT YEAR
  // ==========================================================

  const getStudentYear = (student) => {
    return (
      student?.year || student?.currentYear || student?.semester || "Student"
    );
  };

  // ==========================================================
  // FORMAT STUDENT NAME
  // ==========================================================

  const getStudentName = (student) => {
    return student?.name || student?.fullName || "Student";
  };

  // ==========================================================
  // FORMAT STUDENT EMAIL
  // ==========================================================

  const getStudentEmail = (student) => {
    return student?.email || "No email available";
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }

        .admin-dashboard {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
        }

        /* =========================
           HEADER
        ========================= */

        .dashboard-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 25px;
        }

        .dashboard-title {
          color: #ffffff;
          font-size: 28px;
          font-weight: 700;
          margin: 0;
        }

        .dashboard-subtitle {
          color: #64748b;
          font-size: 13px;
          margin: 6px 0 0;
        }

        .refresh-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: #0f172a;
          color: #cbd5e1;
          border: 1px solid #1e293b;
          border-radius: 8px;
          padding: 10px 14px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .refresh-button:hover {
          background: #1e293b;
          border-color: #8b5cf6;
          color: #ffffff;
        }

        .refresh-button:active {
          background: #8b5cf6;
          color: #ffffff;
          transform: scale(0.97);
        }

        .refresh-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .refresh-icon {
          display: inline-flex;
        }

        .refreshing .refresh-icon {
          animation: dashboard-spin 0.8s linear infinite;
        }

        @keyframes dashboard-spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        /* =========================
           ERROR
        ========================= */

        .dashboard-error {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #450a0a;
          border: 1px solid #991b1b;
          color: #fecaca;
          border-radius: 10px;
          padding: 13px;
          margin-bottom: 20px;
          font-size: 12px;
          line-height: 1.5;
        }

        /* =========================
           WELCOME
        ========================= */

        .welcome-card {
          background: #0f172a;
          border: 1px solid #312e81;
          border-radius: 16px;
          padding: 25px;
          margin-bottom: 28px;
        }

        .welcome-label {
          color: #a78bfa;
          font-size: 12px;
          font-weight: 600;
          margin: 0;
        }

        .welcome-title {
          color: #ffffff;
          font-size: 22px;
          margin: 7px 0;
          line-height: 1.4;
        }

        .welcome-text {
          color: #94a3b8;
          font-size: 13px;
          line-height: 1.6;
          margin: 0;
        }

        /* =========================
           SECTION
        ========================= */

        .section-title {
          color: #ffffff;
          font-size: 18px;
          margin: 0 0 15px;
        }

        /* =========================
           STATISTICS
        ========================= */

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          margin-bottom: 22px;
        }

        .stat-card {
          width: 100%;
          background: #0f172a;
          border: 1px solid #1e293b;
          border-radius: 14px;
          padding: 18px;
          display: flex;
          align-items: center;
          gap: 15px;
          min-width: 0;
          transition: all 0.2s ease;
          cursor: pointer;
          text-align: left;
        }

        .stat-card:hover {
          border-color: #312e81;
          transform: translateY(-2px);
        }

        .stat-card:active {
          transform: scale(0.99);
        }

        .stat-icon {
          width: 42px;
          height: 42px;
          min-width: 42px;
          border-radius: 10px;
          background: #312e81;
          color: #a78bfa;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        }

        .stat-content {
          min-width: 0;
        }

        .stat-title {
          color: #cbd5e1;
          font-size: 12px;
          margin: 0;
        }

        .stat-value {
          color: #ffffff;
          font-size: 24px;
          margin: 4px 0;
        }

        .stat-text {
          color: #64748b;
          font-size: 10px;
          margin: 0;
        }

        /* =========================
           BOTTOM GRID
        ========================= */

        .bottom-grid {
          display: grid;
          grid-template-columns: 1.3fr 1fr;
          gap: 20px;
        }

        .dashboard-card {
          background: #0f172a;
          border: 1px solid #1e293b;
          border-radius: 16px;
          padding: 20px;
          min-width: 0;
        }

        .card-title {
          color: #ffffff;
          font-size: 17px;
          margin: 0;
        }

        .card-subtitle {
          color: #64748b;
          font-size: 11px;
          margin: 5px 0 20px;
        }

        /* =========================
           ACTIVITY
        ========================= */

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .activity-item {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #020617;
          border: 1px solid #1e293b;
          border-radius: 9px;
          padding: 10px;
          min-width: 0;
          transition: border-color 0.2s ease;
        }

        .activity-item:hover {
          border-color: #312e81;
        }

        .student-icon {
          width: 34px;
          height: 34px;
          min-width: 34px;
          border-radius: 8px;
          background: #312e81;
          color: #a78bfa;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
        }

        .student-info {
          flex: 1;
          min-width: 0;
        }

        .student-name {
          color: #ffffff;
          font-size: 11px;
          font-weight: 600;
          margin: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .student-email {
          color: #64748b;
          font-size: 9px;
          margin: 3px 0 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .student-year {
          color: #a78bfa;
          background: #312e81;
          padding: 4px 7px;
          border-radius: 5px;
          font-size: 9px;
          font-weight: 600;
          white-space: nowrap;
        }

        /* =========================
           EMPTY STATE
        ========================= */

        .empty-activity {
          border-top: 1px solid #1e293b;
          padding: 25px 10px;
          text-align: center;
        }

        .empty-icon {
          width: 42px;
          height: 42px;
          margin: 0 auto 12px;
          border-radius: 10px;
          background: #1e293b;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .empty-title {
          color: #cbd5e1;
          font-size: 13px;
          margin: 0;
        }

        .empty-text {
          color: #64748b;
          font-size: 11px;
          margin: 6px auto 0;
          max-width: 260px;
          line-height: 1.5;
        }

        /* =========================
           QUICK ACTIONS
        ========================= */

        .actions {
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .action-button {
          width: 100%;
          min-height: 45px;
          display: flex;
          align-items: center;
          gap: 10px;
          background: #020617;
          border: 1px solid #1e293b;
          border-radius: 9px;
          padding: 12px;
          color: #cbd5e1;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          text-align: left;
          transition: all 0.2s ease;
          -webkit-tap-highlight-color: transparent;
        }

        .action-button span {
          flex: 1;
        }

        .action-button:hover {
          background: #312e81;
          border-color: #8b5cf6;
          color: #ffffff;
        }

        .action-button:active {
          background: #8b5cf6;
          border-color: #8b5cf6;
          color: #ffffff;
          transform: scale(0.98);
        }

        /* =========================
           TABLET
        ========================= */

        @media (max-width: 900px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .bottom-grid {
            grid-template-columns: 1fr;
          }
        }

        /* =========================
           MOBILE
        ========================= */

        @media (max-width: 600px) {
          .admin-dashboard {
            width: 100%;
          }

          .dashboard-header {
            align-items: flex-start;
            flex-direction: column;
            gap: 12px;
          }

          .dashboard-title {
            font-size: 24px;
          }

          .dashboard-subtitle {
            font-size: 12px;
            line-height: 1.5;
          }

          .refresh-button {
            width: 100%;
            min-height: 44px;
          }

          .welcome-card {
            padding: 18px;
            border-radius: 14px;
            margin-bottom: 22px;
          }

          .welcome-title {
            font-size: 18px;
          }

          .welcome-text {
            font-size: 12px;
          }

          .section-title {
            font-size: 17px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .stat-card {
            padding: 15px;
          }

          .stat-value {
            font-size: 22px;
          }

          .bottom-grid {
            grid-template-columns: 1fr;
            gap: 15px;
          }

          .dashboard-card {
            padding: 16px;
            border-radius: 14px;
          }

          .activity-item {
            padding: 9px;
          }

          .student-year {
            font-size: 8px;
          }

          .action-button {
            min-height: 50px;
            padding: 13px;
            font-size: 12px;
          }

          .dashboard-error {
            align-items: flex-start;
          }
        }

        /* =========================
           SMALL PHONES
        ========================= */

        @media (max-width: 380px) {
          .dashboard-title {
            font-size: 22px;
          }

          .welcome-title {
            font-size: 17px;
          }

          .stat-card {
            gap: 11px;
          }

          .stat-icon {
            width: 38px;
            height: 38px;
            min-width: 38px;
          }

          .student-year {
            display: none;
          }

          .dashboard-card {
            padding: 14px;
          }
        }
      `}</style>

      <div className="admin-dashboard">
        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Admin Dashboard</h1>

            <p className="dashboard-subtitle">
              Manage students and academic content from here.
            </p>
          </div>

          <button
            type="button"
            className={`refresh-button ${refreshing ? "refreshing" : ""}`}
            onClick={handleRefresh}
            disabled={loading || refreshing}
          >
            <span className="refresh-icon">
              <FaSyncAlt />
            </span>

            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* =====================================================
            ERROR
        ====================================================== */}

        {!loading && !dashboardData && (
          <div className="dashboard-error">
            <FaExclamationCircle />

            <span>
              Unable to load dashboard data. Make sure the backend server is
              running and your admin session is valid.
            </span>
          </div>
        )}

        {/* =====================================================
            WELCOME
        ====================================================== */}

        <div className="welcome-card">
          <p className="welcome-label">Welcome to SBEC</p>

          <h2 className="welcome-title">Smart Blueprint to Enhance Career</h2>

          <p className="welcome-text">
            Manage students, subjects, notes, papers, quizzes and tests from one
            place.
          </p>
        </div>

        {/* =====================================================
            OVERVIEW
        ====================================================== */}

        <h2 className="section-title">Overview</h2>

        <div className="stats-grid">
          {stats.map((item) => (
            <button
              type="button"
              className="stat-card"
              key={item.title}
              onClick={() => navigate(item.path)}
            >
              <div className="stat-icon">{item.icon}</div>

              <div className="stat-content">
                <p className="stat-title">{item.title}</p>

                <h2 className="stat-value">{item.value}</h2>

                <p className="stat-text">{item.text}</p>
              </div>
            </button>
          ))}
        </div>

        {/* =====================================================
            BOTTOM
        ====================================================== */}

        <div className="bottom-grid">
          {/* ===================================================
              RECENT ACTIVITY
          ==================================================== */}

          <div className="dashboard-card">
            <h2 className="card-title">Recent Activity</h2>

            <p className="card-subtitle">Recently registered students</p>

            <div className="activity-list">
              {loading ? (
                <div className="empty-activity">
                  <div className="empty-icon">
                    <FaCalendarAlt />
                  </div>

                  <p className="empty-title">Loading...</p>

                  <p className="empty-text">Loading recent student activity.</p>
                </div>
              ) : Array.isArray(dashboardData?.recentStudents) &&
                dashboardData.recentStudents.length > 0 ? (
                dashboardData.recentStudents.map((student, index) => (
                  <div
                    className="activity-item"
                    key={student?._id || student?.id || `student-${index}`}
                  >
                    <div className="student-icon">
                      <FaUsers />
                    </div>

                    <div className="student-info">
                      <p className="student-name">{getStudentName(student)}</p>

                      <p className="student-email">
                        {getStudentEmail(student)}
                      </p>
                    </div>

                    <div className="student-year">
                      {getStudentYear(student)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-activity">
                  <div className="empty-icon">
                    <FaCalendarAlt />
                  </div>

                  <p className="empty-title">No students yet</p>

                  <p className="empty-text">
                    Recently registered students will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ===================================================
              QUICK ACTIONS
          ==================================================== */}

          <div className="dashboard-card">
            <h2 className="card-title">Quick Actions</h2>

            <p className="card-subtitle">Quickly access common admin tasks</p>

            <div className="actions">
              {quickActions.map((action) => (
                <button
                  type="button"
                  className="action-button"
                  key={action.path}
                  onClick={() => navigate(action.path)}
                >
                  {action.icon}

                  <span>{action.title}</span>

                  <FaArrowRight />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminDashboard;
