import { useEffect, useState } from "react";
import {
  FaBook,
  FaClipboardCheck,
  FaCalendarAlt,
  FaChartLine,
  FaArrowRight,
  FaSyncAlt,
  FaExclamationCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "../context/useAuth";

const API_URL =
  import.meta.env.VITE_API_URL ||
  `${window.location.protocol}//${window.location.hostname}:5000`;

function Dashboard() {
  const navigate = useNavigate();

  const { user, token, logout } = useAuth();

  const [dashboardData, setDashboardData] = useState(null);
  const [studentExams, setStudentExams] = useState([]);
  const [studentExamsLoaded, setStudentExamsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // LOAD DASHBOARD DATA

  const loadDashboard = async (isRefresh = false) => {
    const storedToken = token || localStorage.getItem("sbec_token");

    if (!storedToken) {
      setLoading(false);
      return;
    }

    if (isRefresh) {
      setRefreshing(true);
    }

    try {
      const response = await fetch(`${API_URL}/api/student/dashboard`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${storedToken}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      // AUTH ERROR

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("sbec_token");
        localStorage.removeItem("sbec_user");

        if (logout) {
          logout();
        }

        toast.error("Session expired. Please login again.");

        navigate("/login", {
          replace: true,
        });

        return;
      }

      // API ERROR

      if (!response.ok) {
        throw new Error(data.message || "Unable to load dashboard.");
      }

      if (!data.success) {
        throw new Error(data.message || "Dashboard request failed.");
      }

      // REAL BACKEND DATA

      setDashboardData(data);

      // Load the student's own exams from Exam Planner.
      // This is intentionally separate from the admin exam API.
      try {
        const examResponse = await fetch(`${API_URL}/api/exam-planner`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${storedToken}`,
            "Content-Type": "application/json",
          },
        });

        const examData = await examResponse.json();

        if (examResponse.ok && examData?.success) {
          setStudentExams(Array.isArray(examData.exams) ? examData.exams : []);
          setStudentExamsLoaded(true);
        } else {
          console.warn(
            "Student Exam Planner:",
            examData?.message || "Could not load student exams.",
          );
        }
      } catch (examError) {
        console.warn(
          "Student Exam Planner Error:",
          examError?.message || examError,
        );
      }
    } catch (error) {
      console.error("Student Dashboard Error:", error);

      toast.error(error.message || "Unable to load dashboard.");

      setDashboardData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // INITIAL LOAD

  useEffect(() => {
    let cancelled = false;

    const fetchDashboard = async () => {
      const storedToken = token || localStorage.getItem("sbec_token");

      if (!storedToken) {
        if (!cancelled) {
          setLoading(false);
        }

        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/student/dashboard`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${storedToken}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (cancelled) {
          return;
        }

        // ======================================
        // AUTH ERROR
        // ======================================

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("sbec_token");

          localStorage.removeItem("sbec_user");

          if (logout) {
            logout();
          }

          toast.error("Session expired. Please login again.");

          navigate("/login", {
            replace: true,
          });

          return;
        }

        // ======================================
        // API ERROR
        // ======================================

        if (!response.ok) {
          throw new Error(data.message || "Unable to load dashboard.");
        }

        if (!data.success) {
          throw new Error(data.message || "Dashboard request failed.");
        }

        // ======================================
        // REAL DATA
        // ======================================

        setDashboardData(data);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("Student Dashboard Error:", error);

        toast.error(error.message || "Unable to load dashboard.");

        setDashboardData(null);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchDashboard();

    return () => {
      cancelled = true;
    };
  }, [token, logout, navigate]);

  // REFRESH

  const handleRefresh = async () => {
    await loadDashboard(true);
  };

  // USER NAME

  const firstName =
    user?.name?.split(" ")[0] ||
    dashboardData?.user?.name?.split(" ")[0] ||
    "Student";

  const currentHour = new Date().getHours();

  const greeting =
    currentHour < 12
      ? "GOOD MORNING"
      : currentHour < 17
        ? "GOOD AFTERNOON"
        : "GOOD EVENING";

  // SAFE DATA

  const stats = dashboardData?.stats || {};

  const plannerStats = stats.planner || {
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    completionPercentage: 0,
  };

  const subjects = Array.isArray(dashboardData?.subjects)
    ? dashboardData.subjects
    : [];

  const weeklyTests = Array.isArray(dashboardData?.weeklyTests)
    ? dashboardData.weeklyTests
    : [];

  const todayTestScore =
    typeof stats.todayTestScore === "number" ? stats.todayTestScore : null;

  const learningProgress =
    typeof stats.learningProgress === "number" ? stats.learningProgress : null;

  const pendingItems = Array.isArray(stats.pendingItems)
    ? stats.pendingItems
    : [];

  const dashboardExams = Array.isArray(stats.upcomingExams)
    ? stats.upcomingExams
    : [];

  const rawUpcomingExams = studentExamsLoaded ? studentExams : dashboardExams;

  const upcomingExams = rawUpcomingExams
    .filter((exam) => {
      const value = exam?.examDate || exam?.date;
      if (!value) return false;

      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return false;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);

      return date >= today;
    })
    .sort(
      (a, b) =>
        new Date(a.examDate || a.date).getTime() -
        new Date(b.examDate || b.date).getTime(),
    );

  // LOADING

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingSpinner}>
          <FaSyncAlt />
        </div>

        <h2 style={styles.loadingTitle}>Loading Dashboard...</h2>

        <p style={styles.loadingText}>Getting your latest learning data.</p>

        <style>
          {`
            @keyframes spin {
              from {
                transform: rotate(0deg);
              }

              to {
                transform: rotate(360deg);
              }
            }
          `}
        </style>
      </div>
    );
  }

  // ERROR

  if (!dashboardData) {
    return (
      <div style={styles.errorPage}>
        <FaExclamationCircle style={styles.errorIcon} />

        <h2 style={styles.errorTitle}>Unable to Load Dashboard</h2>

        <p style={styles.errorText}>
          Something went wrong while loading your dashboard.
        </p>

        <button onClick={() => loadDashboard()} style={styles.retryButton}>
          <FaSyncAlt />
          Try Again
        </button>
      </div>
    );
  }

  // DASHBOARD

  return (
    <div className="student-dashboard">
      {/* ======================================
          HEADER
      ====================================== */}

      <div className="dashboard-header" style={styles.header}>
        <div className="dashboard-header-text">
          <p style={styles.greeting}>{greeting}</p>

          <h1 className="dashboard-main-title" style={styles.mainTitle}>
            Welcome back, {firstName} 👋
          </h1>

          <p className="dashboard-description" style={styles.description}>
            Here's what is happening with your learning today.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="dashboard-refresh"
          style={{
            ...styles.refreshButton,
            opacity: refreshing ? 0.6 : 1,
          }}
        >
          <FaSyncAlt
            style={{
              animation: refreshing ? "spin 1s linear infinite" : "none",
            }}
          />

          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* ======================================
          STAT CARDS
      ====================================== */}

      <div className="dashboard-stats-grid" style={styles.statsGrid}>
        <StatCard
          icon={<FaClipboardCheck />}
          title="Pending Items"
          value={plannerStats.pendingTasks}
          subtitle="Need your attention"
          iconBackground="#7C3AED"
        />

        <StatCard
          icon={<FaChartLine />}
          title="Today's Test"
          value={todayTestScore !== null ? `${todayTestScore}%` : "—"}
          subtitle={
            todayTestScore !== null
              ? "Latest test score"
              : "No test taken today"
          }
          iconBackground="#059669"
        />

        <StatCard
          icon={<FaBook />}
          title="Learning Progress"
          value={learningProgress !== null ? `${learningProgress}%` : "—"}
          subtitle="Overall progress"
          iconBackground="#2563EB"
        />

        <StatCard
          icon={<FaCalendarAlt />}
          title="Upcoming Exams"
          value={upcomingExams.length}
          subtitle={
            upcomingExams.length === 0 ? "No upcoming exams" : "Exams scheduled"
          }
          iconBackground="#D97706"
        />
      </div>

      {/* ======================================
          DAILY PLANNER SUMMARY
      ====================================== */}

      <div
        className="dashboard-card"
        style={{
          ...styles.card,
          marginBottom: "25px",
        }}
      >
        <div style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionTitle}>Today's Daily Planner</h2>

            <p style={styles.sectionSubtitle}>
              Track your tasks and today's progress.
            </p>
          </div>

          <button
            onClick={() => navigate("/daily-planner")}
            className="dashboard-view-button"
            style={styles.viewButton}
          >
            View Planner
            <FaArrowRight />
          </button>
        </div>

        <div className="planner-stats-grid" style={styles.plannerStatsGrid}>
          <div style={styles.plannerStat}>
            <span style={styles.plannerStatLabel}>Total Tasks</span>
            <strong style={styles.plannerStatValue}>
              {plannerStats.totalTasks}
            </strong>
          </div>

          <div style={styles.plannerStat}>
            <span style={styles.plannerStatLabel}>Completed</span>
            <strong style={styles.plannerStatValue}>
              {plannerStats.completedTasks}
            </strong>
          </div>

          <div style={styles.plannerStat}>
            <span style={styles.plannerStatLabel}>Pending</span>
            <strong style={styles.plannerStatValue}>
              {plannerStats.pendingTasks}
            </strong>
          </div>

          <div style={styles.plannerStat}>
            <span style={styles.plannerStatLabel}>Completion</span>
            <strong style={styles.plannerStatValue}>
              {plannerStats.completionPercentage}%
            </strong>
          </div>
        </div>

        <div style={styles.plannerProgressBackground}>
          <div
            style={{
              ...styles.plannerProgressFill,
              width: `${Math.min(100, Math.max(0, plannerStats.completionPercentage))}%`,
            }}
          />
        </div>
      </div>

      {/* ======================================
          MAIN GRID
      ====================================== */}

      <div className="dashboard-main-grid">
        {/* ====================================
            LEFT COLUMN
        ==================================== */}

        <div>
          {/* SUBJECT PROGRESS */}

          <div className="dashboard-card" style={styles.card}>
            <div
              className="dashboard-section-header"
              style={styles.sectionHeader}
            >
              <div>
                <h2 style={styles.sectionTitle}>Subject Progress</h2>

                <p style={styles.sectionSubtitle}>
                  Track how much you have learned.
                </p>
              </div>

              <button
                onClick={() => navigate("/subjects")}
                className="dashboard-view-button"
                style={styles.viewButton}
              >
                View Subjects
                <FaArrowRight />
              </button>
            </div>

            {subjects.length === 0 ? (
              <EmptyState message="No subjects available yet." />
            ) : (
              <div style={styles.subjectList}>
                {subjects.map((subject, index) => {
                  const progress = Math.min(
                    100,
                    Math.max(
                      0,
                      Number(
                        subject.progress ??
                          subject.progressPercentage ??
                          subject.completion ??
                          0,
                      ),
                    ),
                  );

                  return (
                    <div
                      key={subject._id || subject.id || subject.name || index}
                    >
                      <div style={styles.progressHeader}>
                        <span style={styles.subjectName}>
                          {subject.name || subject.title || "Subject"}
                        </span>

                        <span style={styles.progressText}>{progress}%</span>
                      </div>

                      <div style={styles.progressBackground}>
                        <div
                          style={{
                            ...styles.progressFill,
                            width: `${progress}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* PENDING ITEMS */}

          <div
            className="dashboard-card dashboard-card-spacing"
            style={{
              ...styles.card,
              marginTop: "25px",
            }}
          >
            <div style={styles.sectionHeader}>
              <div>
                <h2 style={styles.sectionTitle}>What Needs Your Attention</h2>

                <p style={styles.sectionSubtitle}>
                  Complete these items to stay on track.
                </p>
              </div>
            </div>

            {pendingItems.length === 0 ? (
              <EmptyState message="You're all caught up! 🎉" />
            ) : (
              <div style={styles.pendingList}>
                {pendingItems.map((item, index) => (
                  <div
                    key={item._id || item.id || index}
                    style={styles.pendingItem}
                  >
                    <div>
                      <p style={styles.pendingTitle}>
                        {item.title ||
                          item.name ||
                          item.subject ||
                          "Pending Item"}
                      </p>

                      <span style={styles.pendingType}>
                        {item.type || item.category || "Task"}
                      </span>
                    </div>

                    <span style={styles.pendingDot} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ====================================
            RIGHT COLUMN
        ==================================== */}

        <div>
          {/* TODAY'S TEST */}

          <div className="dashboard-card" style={styles.card}>
            <h2 style={styles.sectionTitle}>Today's Test</h2>

            <div
              className="dashboard-score-container"
              style={styles.scoreContainer}
            >
              <div
                className="dashboard-score-circle"
                style={{
                  ...styles.scoreCircle,
                  background:
                    todayTestScore !== null
                      ? `conic-gradient(#8B5CF6 ${
                          todayTestScore * 3.6
                        }deg, #334155 0deg)`
                      : "#334155",
                }}
              >
                <div
                  className="dashboard-score-inner"
                  style={styles.scoreInner}
                >
                  <strong
                    className="dashboard-score-number"
                    style={styles.scoreNumber}
                  >
                    {todayTestScore !== null ? `${todayTestScore}%` : "—"}
                  </strong>

                  <span style={styles.scoreLabel}>Score</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate("/quiz")}
              className="dashboard-primary-button"
              style={styles.primaryButton}
            >
              Take Another Test
            </button>
          </div>

          {/* UPCOMING EXAMS */}

          <div
            className="dashboard-card"
            style={{
              ...styles.card,
              marginTop: "25px",
            }}
          >
            <div
              className="dashboard-section-header"
              style={styles.sectionHeader}
            >
              <h2 style={styles.sectionTitle}>Upcoming Exams</h2>

              <button
                onClick={() => navigate("/exam-planner")}
                className="dashboard-view-button"
                style={styles.viewButton}
              >
                View All
              </button>
            </div>

            {upcomingExams.length === 0 ? (
              <EmptyState message="No upcoming exams." />
            ) : (
              <div style={styles.examList}>
                {upcomingExams.slice(0, 3).map((exam, index) => {
                  const examDate = new Date(exam.examDate || exam.date);
                  const today = new Date();

                  today.setHours(0, 0, 0, 0);
                  examDate.setHours(0, 0, 0, 0);

                  const daysRemaining = Math.ceil(
                    (examDate.getTime() - today.getTime()) /
                      (1000 * 60 * 60 * 24),
                  );

                  return (
                    <div
                      key={exam._id || exam.id || index}
                      className="dashboard-exam-item"
                      style={styles.examItem}
                    >
                      <div style={{ minWidth: 0 }}>
                        <p style={styles.examSubject}>
                          {exam.subject || exam.name || exam.title || "Exam"}
                        </p>

                        <p style={styles.examDate}>
                          {examDate.toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                          {exam.examTime ? ` • ${exam.examTime}` : ""}
                        </p>
                      </div>

                      <span style={styles.examCountdown}>
                        {daysRemaining === 0
                          ? "Today"
                          : `${daysRemaining} day${
                              daysRemaining === 1 ? "" : "s"
                            } left`}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* WEEKLY TESTS */}

          <div
            className="dashboard-card"
            style={{
              ...styles.card,
              marginTop: "25px",
            }}
          >
            <div
              className="dashboard-section-header"
              style={styles.sectionHeader}
            >
              <div>
                <h2 style={styles.sectionTitle}>Weekly Tests</h2>

                <p style={styles.sectionSubtitle}>Tests available for you.</p>
              </div>

              <button
                onClick={() => navigate("/weekly-tests")}
                className="dashboard-view-button"
                style={styles.viewButton}
              >
                View All
                <FaArrowRight />
              </button>
            </div>

            {weeklyTests.length === 0 ? (
              <EmptyState message="No weekly tests available." />
            ) : (
              <div style={styles.pendingList}>
                {weeklyTests.slice(0, 3).map((test, index) => (
                  <div
                    key={test._id || test.id || index}
                    style={styles.pendingItem}
                  >
                    <div>
                      <p style={styles.pendingTitle}>
                        {test.title || test.name || `Weekly Test ${index + 1}`}
                      </p>

                      <span style={styles.pendingType}>
                        {test.subject || "Weekly Test"}
                      </span>
                    </div>

                    <FaArrowRight
                      style={{
                        color: "#A78BFA",
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ======================================
          RESPONSIVE CSS
      ====================================== */}

      <style>
        {`

          @keyframes spin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }


          /* =====================================
             DESKTOP GRID
          ===================================== */

          .dashboard-main-grid {
            display: grid;

            grid-template-columns:
              minmax(0, 1.4fr)
              minmax(280px, 0.8fr);

            gap: 25px;

            width: 100%;
          }


          /* =====================================
             TABLET
          ===================================== */

          @media (max-width: 1000px) {

            .dashboard-main-grid {
              grid-template-columns: 1fr;
            }

          }


          /* =====================================
             MOBILE
          ===================================== */

          @media (max-width: 768px) {

            .student-dashboard {
              width: 100%;
              max-width: 100%;
              overflow-x: hidden;
            }


            /* Header */

            .dashboard-header {
              flex-direction: column !important;

              align-items: stretch !important;

              gap: 16px !important;

              margin-bottom: 22px !important;
            }


            .dashboard-main-title {
              font-size: 27px !important;

              line-height: 1.25 !important;

              word-break: normal;
            }


            .dashboard-description {
              font-size: 13px !important;

              line-height: 1.55 !important;

              margin-top: 8px !important;
            }


            .dashboard-refresh {
              width: 100% !important;

              min-height: 44px;

              justify-content: center !important;
            }


            /* Stats */

            .dashboard-stats-grid {
              grid-template-columns:
                repeat(2, minmax(0, 1fr)) !important;

              gap: 12px !important;

              margin-bottom: 22px !important;
            }


            /* Daily Planner */

            .planner-stats-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
              gap: 10px !important;
            }

            /* Main */

            .dashboard-main-grid {
              grid-template-columns: 1fr !important;

              gap: 18px !important;
            }


            /* Cards */

            .dashboard-card {
              width: 100%;

              box-sizing: border-box;

              padding: 17px !important;

              border-radius: 14px !important;

              overflow: hidden;
            }


            .dashboard-card-spacing {
              margin-top: 18px !important;
            }


            /* Section header */

            .dashboard-section-header {
              gap: 10px !important;

              margin-bottom: 18px !important;
            }


            .dashboard-section-header > div {
              min-width: 0;
            }


            .dashboard-view-button {
              font-size: 11px !important;

              flex-shrink: 0;

              padding: 4px 0 !important;
            }


            /* Score */

            .dashboard-score-container {
              margin: 22px 0 !important;
            }


            .dashboard-score-circle {
              width: 125px !important;

              height: 125px !important;
            }


            .dashboard-score-inner {
              width: 104px !important;

              height: 104px !important;
            }


            .dashboard-score-number {
              font-size: 25px !important;
            }


            /* Subject list */

            .dashboard-subject-list {
              gap: 16px !important;
            }


            /* Pending */

            .dashboard-pending-item {
              min-width: 0;
            }


            /* Exam */

            .dashboard-exam-item {
              min-width: 0;
              align-items: flex-start !important;
            }

            .dashboard-exam-item > span {
              white-space: normal !important;
              text-align: right;
            }

          }


          /* =====================================
             SMALL PHONES
          ===================================== */

          @media (max-width: 480px) {

            .dashboard-main-title {
              font-size: 24px !important;
            }


            .dashboard-stats-grid {
              grid-template-columns: 1fr !important;

              gap: 10px !important;
            }


            .dashboard-card {
              padding: 15px !important;
            }

            .planner-stats-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            }


            .dashboard-section-header {
              align-items: flex-start !important;
            }


            .dashboard-section-header h2 {
              font-size: 17px !important;
            }


            .dashboard-section-header p {
              font-size: 11px !important;
            }


            .dashboard-view-button {
              font-size: 10px !important;
            }

          }

        `}
      </style>
    </div>
  );
}

// STAT CARD

function StatCard({ icon, title, value, subtitle, iconBackground }) {
  return (
    <div className="dashboard-stat-card" style={styles.statCard}>
      <div className="dashboard-stat-top" style={styles.statTop}>
        <div
          className="dashboard-stat-icon"
          style={{
            ...styles.statIcon,
            background: iconBackground,
          }}
        >
          {icon}
        </div>

        <div>
          <p className="dashboard-stat-title" style={styles.statTitle}>
            {title}
          </p>

          <h2 className="dashboard-stat-value" style={styles.statValue}>
            {value}
          </h2>
        </div>
      </div>

      <p className="dashboard-stat-subtitle" style={styles.statSubtitle}>
        {subtitle}
      </p>

      <style>
        {`

          @media (max-width: 768px) {

            .dashboard-stat-card {
              padding: 15px !important;

              border-radius: 14px !important;

              min-width: 0;

              box-sizing: border-box;
            }


            .dashboard-stat-top {
              gap: 10px !important;
            }


            .dashboard-stat-icon {
              width: 38px !important;

              height: 38px !important;

              border-radius: 10px !important;

              font-size: 13px !important;
            }


            .dashboard-stat-title {
              font-size: 11px !important;

              white-space: nowrap;
            }


            .dashboard-stat-value {
              font-size: 21px !important;
            }


            .dashboard-stat-subtitle {
              font-size: 10px !important;

              line-height: 1.4 !important;

              margin-top: 10px !important;
            }

          }

        `}
      </style>
    </div>
  );
}

// EMPTY STATE

function EmptyState({ message }) {
  return (
    <div style={styles.emptyState}>
      <FaBook style={styles.emptyIcon} />

      <p style={styles.emptyText}>{message}</p>
    </div>
  );
}

// STYLES

const styles = {
  header: {
    display: "flex",

    justifyContent: "space-between",

    alignItems: "flex-start",

    gap: "20px",

    marginBottom: "35px",
  },

  greeting: {
    color: "#8B5CF6",

    fontSize: "14px",

    fontWeight: "600",

    margin: "0 0 8px",
  },

  mainTitle: {
    color: "#FFFFFF",

    fontSize: "36px",

    margin: 0,

    fontWeight: "700",
  },

  description: {
    color: "#94A3B8",

    marginTop: "10px",

    fontSize: "15px",
  },

  refreshButton: {
    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    gap: "8px",

    background: "#0F172A",

    color: "#CBD5E1",

    border: "1px solid #1E293B",

    borderRadius: "10px",

    padding: "11px 16px",

    cursor: "pointer",

    fontWeight: "600",

    whiteSpace: "nowrap",
  },

  statsGrid: {
    display: "grid",

    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",

    gap: "18px",

    marginBottom: "30px",
  },

  statCard: {
    background: "#0F172A",

    border: "1px solid #1E293B",

    borderRadius: "16px",

    padding: "20px",

    boxSizing: "border-box",

    minWidth: 0,
  },

  statTop: {
    display: "flex",

    alignItems: "center",

    gap: "14px",

    minWidth: 0,
  },

  statIcon: {
    width: "44px",

    height: "44px",

    borderRadius: "12px",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    color: "#FFFFFF",

    flexShrink: 0,
  },

  statTitle: {
    color: "#94A3B8",

    margin: "0 0 5px",

    fontSize: "13px",
  },

  statValue: {
    color: "#FFFFFF",

    margin: 0,

    fontSize: "25px",
  },

  statSubtitle: {
    color: "#64748B",

    fontSize: "12px",

    margin: "15px 0 0",

    lineHeight: "1.4",
  },

  card: {
    background: "#0F172A",

    border: "1px solid #1E293B",

    borderRadius: "16px",

    padding: "22px",

    boxSizing: "border-box",

    width: "100%",
  },

  sectionHeader: {
    display: "flex",

    justifyContent: "space-between",

    alignItems: "flex-start",

    gap: "15px",

    marginBottom: "22px",
  },

  sectionTitle: {
    color: "#FFFFFF",

    margin: 0,

    fontSize: "19px",

    lineHeight: "1.3",
  },

  sectionSubtitle: {
    color: "#64748B",

    margin: "6px 0 0",

    fontSize: "13px",

    lineHeight: "1.4",
  },

  viewButton: {
    display: "flex",

    alignItems: "center",

    gap: "7px",

    background: "transparent",

    border: "none",

    color: "#A78BFA",

    cursor: "pointer",

    fontSize: "13px",

    fontWeight: "600",

    whiteSpace: "nowrap",
  },

  plannerStatsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "12px",
    marginBottom: "18px",
  },

  plannerStat: {
    background: "#1E293B",
    border: "1px solid #334155",
    borderRadius: "12px",
    padding: "15px",
    minWidth: 0,
    boxSizing: "border-box",
  },

  plannerStatLabel: {
    display: "block",
    color: "#94A3B8",
    fontSize: "12px",
    marginBottom: "7px",
  },

  plannerStatValue: {
    display: "block",
    color: "#FFFFFF",
    fontSize: "22px",
    fontWeight: "700",
  },

  plannerProgressBackground: {
    width: "100%",
    height: "8px",
    background: "#334155",
    borderRadius: "10px",
    overflow: "hidden",
  },

  plannerProgressFill: {
    height: "100%",
    background: "#8B5CF6",
    borderRadius: "10px",
    transition: "width 0.4s ease",
  },

  subjectList: {
    display: "grid",

    gap: "20px",
  },

  progressHeader: {
    display: "flex",

    justifyContent: "space-between",

    alignItems: "center",

    gap: "10px",

    marginBottom: "8px",
  },

  subjectName: {
    color: "#CBD5E1",

    fontSize: "14px",

    overflow: "hidden",

    textOverflow: "ellipsis",

    whiteSpace: "nowrap",
  },

  progressText: {
    color: "#A78BFA",

    fontSize: "14px",

    fontWeight: "600",

    flexShrink: 0,
  },

  progressBackground: {
    height: "8px",

    background: "#334155",

    borderRadius: "10px",

    overflow: "hidden",
  },

  progressFill: {
    height: "100%",

    background: "#8B5CF6",

    borderRadius: "10px",

    transition: "width 0.4s ease",
  },

  pendingList: {
    display: "grid",

    gap: "12px",
  },

  pendingItem: {
    display: "flex",

    alignItems: "center",

    justifyContent: "space-between",

    gap: "12px",

    padding: "15px",

    background: "#0F172A",

    border: "1px solid #1E293B",

    borderRadius: "12px",

    boxSizing: "border-box",

    minWidth: 0,
  },

  pendingTitle: {
    color: "#FFFFFF",

    margin: 0,

    fontSize: "14px",

    fontWeight: "600",

    overflow: "hidden",

    textOverflow: "ellipsis",

    whiteSpace: "nowrap",
  },

  pendingType: {
    color: "#64748B",

    fontSize: "12px",

    display: "block",

    marginTop: "5px",
  },

  pendingDot: {
    width: "8px",

    height: "8px",

    background: "#F59E0B",

    borderRadius: "50%",

    flexShrink: 0,
  },

  scoreContainer: {
    display: "flex",

    justifyContent: "center",

    alignItems: "center",

    margin: "30px 0",
  },

  scoreCircle: {
    width: "150px",

    height: "150px",

    borderRadius: "50%",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",
  },

  scoreInner: {
    width: "125px",

    height: "125px",

    borderRadius: "50%",

    background: "#1E293B",

    display: "flex",

    flexDirection: "column",

    alignItems: "center",

    justifyContent: "center",
  },

  scoreNumber: {
    color: "#FFFFFF",

    fontSize: "30px",
  },

  scoreLabel: {
    color: "#94A3B8",

    fontSize: "12px",
  },

  primaryButton: {
    width: "100%",

    padding: "13px",

    background: "#8B5CF6",

    color: "#FFFFFF",

    border: "none",

    borderRadius: "10px",

    cursor: "pointer",

    fontWeight: "600",
  },

  examList: {
    display: "grid",

    gap: "12px",
  },

  examItem: {
    padding: "14px",

    background: "#0F172A",

    border: "1px solid #1E293B",

    borderRadius: "12px",

    boxSizing: "border-box",

    minWidth: 0,
  },

  examSubject: {
    color: "#FFFFFF",

    margin: "0 0 6px",

    fontSize: "14px",

    fontWeight: "600",

    overflow: "hidden",

    textOverflow: "ellipsis",

    whiteSpace: "nowrap",
  },

  examDate: {
    color: "#94A3B8",

    margin: 0,

    fontSize: "13px",
  },

  examCountdown: {
    color: "#A78BFA",

    fontSize: "12px",

    fontWeight: "700",

    whiteSpace: "nowrap",

    flexShrink: 0,
  },

  emptyState: {
    padding: "25px 15px",

    textAlign: "center",
  },

  emptyIcon: {
    color: "#475569",

    fontSize: "25px",

    marginBottom: "8px",
  },

  emptyText: {
    color: "#64748B",

    fontSize: "13px",

    margin: 0,
  },

  loadingPage: {
    minHeight: "400px",

    display: "flex",

    flexDirection: "column",

    alignItems: "center",

    justifyContent: "center",

    textAlign: "center",
  },

  loadingSpinner: {
    color: "#8B5CF6",

    fontSize: "30px",

    animation: "spin 1s linear infinite",
  },

  loadingTitle: {
    color: "#FFFFFF",

    margin: "15px 0 5px",
  },

  loadingText: {
    color: "#64748B",

    margin: 0,
  },

  errorPage: {
    minHeight: "400px",

    display: "flex",

    flexDirection: "column",

    alignItems: "center",

    justifyContent: "center",

    textAlign: "center",

    padding: "20px",

    boxSizing: "border-box",
  },

  errorIcon: {
    color: "#EF4444",

    fontSize: "40px",
  },

  errorTitle: {
    color: "#FFFFFF",

    margin: "15px 0 8px",
  },

  errorText: {
    color: "#64748B",

    maxWidth: "400px",

    lineHeight: "1.6",
  },

  retryButton: {
    display: "flex",

    alignItems: "center",

    gap: "8px",

    background: "#8B5CF6",

    color: "#FFFFFF",

    border: "none",

    borderRadius: "10px",

    padding: "12px 18px",

    cursor: "pointer",

    fontWeight: "600",

    marginTop: "10px",
  },
};

export default Dashboard;
