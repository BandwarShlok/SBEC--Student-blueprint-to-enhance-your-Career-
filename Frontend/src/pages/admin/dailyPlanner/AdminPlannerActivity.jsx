import { useCallback, useEffect, useMemo, useState } from "react";

import {
  FaChevronLeft,
  FaChevronRight,
  FaUser,
  FaEnvelope,
  FaBook,
  FaCheckCircle,
  FaClock,
  FaChartLine,
  FaCalendarAlt,
  FaExclamationCircle,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";

import API_URL from "../../../config/api";

/*
========================================================
ADMIN TOKEN
========================================================
*/

const getToken = () => {
  return localStorage.getItem("admin_token");
};

/*
========================================================
DATE HELPERS
========================================================
*/

const formatDateForAPI = (date) => {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const parseDate = (dateString) => {
  const [year, month, day] = dateString.split("-").map(Number);

  return new Date(year, month - 1, day);
};

const formatDisplayDate = (dateString) => {
  return parseDate(dateString).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
};

const formatLongDate = (dateString) => {
  return parseDate(dateString).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

/*
========================================================
START OF WEEK
========================================================
*/

const getStartOfWeek = (date) => {
  const result = new Date(date);

  const day = result.getDay();

  const difference = day === 0 ? -6 : 1 - day;

  result.setDate(result.getDate() + difference);

  result.setHours(0, 0, 0, 0);

  return result;
};

/*
========================================================
END OF WEEK
========================================================
*/

const getEndOfWeek = (date) => {
  const result = getStartOfWeek(date);

  result.setDate(result.getDate() + 6);

  result.setHours(23, 59, 59, 999);

  return result;
};

/*
========================================================
LAST 7 DAYS
========================================================
*/

const getLast7DaysStart = (date) => {
  const result = new Date(date);

  result.setDate(result.getDate() - 6);

  result.setHours(0, 0, 0, 0);

  return result;
};

/*
========================================================
MONTH START
========================================================
*/

const getMonthStart = (date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

/*
========================================================
MONTH END
========================================================
*/

const getMonthEnd = (date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

/*
========================================================
MAIN COMPONENT
========================================================
*/

export default function AdminPlannerActivity() {
  const navigate = useNavigate();

  /*
  ======================================================
  STATE
  ======================================================
  */

  const [students, setStudents] = useState([]);

  const [selectedStudent, setSelectedStudent] = useState("");

  const [selectedPeriod, setSelectedPeriod] = useState("week");

  const [selectedDate, setSelectedDate] = useState(new Date());

  const [customStartDate, setCustomStartDate] = useState(
    formatDateForAPI(getStartOfWeek(new Date())),
  );

  const [customEndDate, setCustomEndDate] = useState(
    formatDateForAPI(getEndOfWeek(new Date())),
  );

  const [studentInfo, setStudentInfo] = useState(null);

  const [dailyActivity, setDailyActivity] = useState([]);

  const [summary, setSummary] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    completionPercentage: 0,
  });

  const [loadingStudents, setLoadingStudents] = useState(true);

  const [loadingActivity, setLoadingActivity] = useState(false);

  const [error, setError] = useState("");

  /*
  ======================================================
  CALCULATE DATE RANGE
  ======================================================
  */

  const dateRange = useMemo(() => {
    let start;
    let end;

    if (selectedPeriod === "today") {
      start = new Date(selectedDate);

      end = new Date(selectedDate);
    } else if (selectedPeriod === "last7") {
      start = getLast7DaysStart(selectedDate);

      end = new Date(selectedDate);
    } else if (selectedPeriod === "week") {
      start = getStartOfWeek(selectedDate);

      end = getEndOfWeek(selectedDate);
    } else if (selectedPeriod === "month") {
      start = getMonthStart(selectedDate);

      end = getMonthEnd(selectedDate);
    } else {
      start = parseDate(customStartDate);

      end = parseDate(customEndDate);
    }

    return {
      startDate: formatDateForAPI(start),

      endDate: formatDateForAPI(end),
    };
  }, [selectedPeriod, selectedDate, customStartDate, customEndDate]);

  /*
  ======================================================
  FETCH STUDENTS
  ======================================================
  */

  const fetchStudents = useCallback(async () => {
    try {
      setLoadingStudents(true);

      setError("");

      const token = getToken();

      if (!token) {
        setError("Admin session expired. Please login again.");

        return;
      }

      const response = await fetch(
        `${API_URL}/api/admin/daily-planner/students`,
        {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (response.status === 401) {
        setError("Admin session expired. Please login again.");

        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to load students.");
      }

      setStudents(data.students || []);
    } catch (err) {
      console.error("Activity Students Error:", err);

      setError(err.message || "Unable to load students.");
    } finally {
      setLoadingStudents(false);
    }
  }, []);

  /*
  ======================================================
  FETCH ACTIVITY
  ======================================================
  */

  const fetchActivity = useCallback(async () => {
    if (!selectedStudent) {
      setDailyActivity([]);

      setStudentInfo(null);

      return;
    }

    if (!dateRange.startDate || !dateRange.endDate) {
      return;
    }

    if (dateRange.startDate > dateRange.endDate) {
      setError("Start date cannot be after end date.");

      return;
    }

    try {
      setLoadingActivity(true);

      setError("");

      const token = getToken();

      if (!token) {
        setError("Admin session expired. Please login again.");

        return;
      }

      const url = `${API_URL}/api/admin/daily-planner/activity/${selectedStudent}?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;

      const response = await fetch(url, {
        method: "GET",

        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.status === 401) {
        setError("Admin session expired. Please login again.");

        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to load planner activity.");
      }

      setStudentInfo(data.student || null);

      setDailyActivity(data.dailyActivity || []);

      setSummary(
        data.summary || {
          totalTasks: 0,
          completedTasks: 0,
          pendingTasks: 0,
          completionPercentage: 0,
        },
      );
    } catch (err) {
      console.error("Planner Activity Error:", err);

      setError(err.message || "Unable to load planner activity.");

      setDailyActivity([]);
    } finally {
      setLoadingActivity(false);
    }
  }, [selectedStudent, dateRange]);

  /*
  ======================================================
  INITIAL STUDENTS
  ======================================================
  */

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchStudents]);

  /*
  ======================================================
  LOAD ACTIVITY
  ======================================================
  */

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchActivity();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchActivity]);

  /*
  ======================================================
  PERIOD LABEL
  ======================================================
  */

  const periodLabel = useMemo(() => {
    if (selectedPeriod === "today") {
      return "Today";
    }

    if (selectedPeriod === "last7") {
      return "Last 7 Days";
    }

    if (selectedPeriod === "week") {
      return "This Week";
    }

    if (selectedPeriod === "month") {
      return "This Month";
    }

    return "Custom Range";
  }, [selectedPeriod]);

  /*
  ======================================================
  DATE NAVIGATION
  ======================================================
  */

  const changeDate = (days) => {
    const newDate = new Date(selectedDate);

    newDate.setDate(newDate.getDate() + days);

    setSelectedDate(newDate);
  };

  /*
  ======================================================
  GO TODAY
  ======================================================
  */

  const goToToday = () => {
    const today = new Date();

    setSelectedDate(today);

    setCustomStartDate(formatDateForAPI(getStartOfWeek(today)));

    setCustomEndDate(formatDateForAPI(getEndOfWeek(today)));
  };

  /*
  ======================================================
  OPEN DAILY PLANNER
  ======================================================
  */

  const openDay = (date) => {
    if (!selectedStudent) {
      return;
    }

    navigate(`/admin/daily-planner?student=${selectedStudent}&date=${date}`);
  };

  /*
  ======================================================
  RENDER
  ======================================================
  */

  return (
    <div className="admin-planner-activity">
      <style>{`
        .admin-planner-activity {
          min-height: 100vh;
          padding: 28px;
          background: #0f172a;
          color: #e5e7eb;
          box-sizing: border-box;
        }

        .activity-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 25px;
        }

        .activity-title h1 {
          margin: 0;
          color: #f8fafc;
          font-size: 30px;
          font-weight: 700;
        }

        .activity-title p {
          margin: 7px 0 0;
          color: #94a3b8;
          font-size: 14px;
        }

        .readonly-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 12px;
          border: 1px solid #334155;
          border-radius: 8px;
          background: #111c30;
          color: #a78bfa;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
        }

        .filters-card {
          padding: 20px;
          margin-bottom: 20px;
          border: 1px solid #1e293b;
          border-radius: 14px;
          background: #111c30;
        }

        .filters-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 15px;
        }

        .filter-group label {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 8px;
          color: #cbd5e1;
          font-size: 13px;
          font-weight: 600;
        }

        .filter-input,
        .filter-select {
          width: 100%;
          padding: 12px;
          box-sizing: border-box;
          border: 1px solid #334155;
          border-radius: 9px;
          outline: none;
          background: #0f172a;
          color: #f8fafc;
          font-size: 13px;
        }

        .filter-input:focus,
        .filter-select:focus {
          border-color: #8b5cf6;
        }

        .custom-range {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 15px;
        }

        .date-control {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .date-control label {
          margin: 0;
          white-space: nowrap;
        }

        .period-navigation {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 15px;
        }

        .period-arrow {
          width: 38px;
          height: 38px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #334155;
          border-radius: 8px;
          background: #0f172a;
          color: #cbd5e1;
          cursor: pointer;
        }

        .period-arrow:hover {
          border-color: #8b5cf6;
          color: #a78bfa;
        }

        .period-current {
          flex: 1;
          padding: 10px;
          text-align: center;
          border: 1px solid #1e293b;
          border-radius: 8px;
          background: #0f172a;
          color: #cbd5e1;
          font-size: 13px;
        }

        .today-button {
          padding: 9px 13px;
          border: 1px solid #8b5cf6;
          border-radius: 8px;
          background: transparent;
          color: #a78bfa;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }

        .today-button:hover {
          background: #8b5cf6;
          color: white;
        }

        .student-info {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }

        .student-info-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 15px;
          border: 1px solid #1e293b;
          border-radius: 12px;
          background: #111c30;
          min-width: 0;
        }

        .info-icon {
          width: 38px;
          height: 38px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
          background: rgba(139, 92, 246, 0.12);
          color: #a78bfa;
        }

        .info-content {
          min-width: 0;
        }

        .info-content span {
          display: block;
          margin-bottom: 3px;
          color: #64748b;
          font-size: 11px;
        }

        .info-content strong {
          display: block;
          color: #f8fafc;
          font-size: 13px;
          word-break: break-word;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }

        .summary-card {
          padding: 18px;
          border: 1px solid #1e293b;
          border-radius: 12px;
          background: #111c30;
        }

        .summary-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .summary-card-label {
          color: #64748b;
          font-size: 12px;
        }

        .summary-icon {
          color: #8b5cf6;
        }

        .summary-value {
          margin-top: 8px;
          color: #f8fafc;
          font-size: 25px;
          font-weight: 700;
        }

        .summary-progress {
          height: 5px;
          margin-top: 10px;
          overflow: hidden;
          border-radius: 10px;
          background: #1e293b;
        }

        .summary-progress-fill {
          height: 100%;
          border-radius: 10px;
          background: #8b5cf6;
        }

        .activity-card {
          overflow: hidden;
          border: 1px solid #1e293b;
          border-radius: 14px;
          background: #111c30;
        }

        .activity-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 18px 20px;
          border-bottom: 1px solid #1e293b;
        }

        .activity-card-header h2 {
          margin: 0;
          color: #f8fafc;
          font-size: 17px;
        }

        .activity-card-header span {
          color: #64748b;
          font-size: 12px;
        }

        .activity-list {
          display: flex;
          flex-direction: column;
        }

        .activity-row {
          display: grid;
          grid-template-columns: 1.2fr 0.7fr 0.7fr 0.7fr 1fr 90px;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          border-bottom: 1px solid #1e293b;
          transition: 0.2s ease;
        }

        .activity-row:last-child {
          border-bottom: none;
        }

        .activity-row:hover {
          background: #0f172a;
        }

        .activity-date {
          min-width: 0;
        }

        .activity-date strong {
          display: block;
          color: #f8fafc;
          font-size: 13px;
        }

        .activity-date span {
          display: block;
          margin-top: 3px;
          color: #64748b;
          font-size: 11px;
        }

        .activity-number {
          color: #cbd5e1;
          font-size: 13px;
          font-weight: 600;
        }

        .activity-number.completed {
          color: #86efac;
        }

        .activity-number.pending {
          color: #fcd34d;
        }

        .row-progress {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .row-progress-bar {
          flex: 1;
          height: 6px;
          overflow: hidden;
          border-radius: 10px;
          background: #1e293b;
        }

        .row-progress-fill {
          height: 100%;
          border-radius: 10px;
          background: #8b5cf6;
        }

        .row-progress-percent {
          width: 35px;
          color: #a78bfa;
          font-size: 11px;
          font-weight: 700;
          text-align: right;
        }

        .view-day-button {
          padding: 8px 10px;
          border: 1px solid #334155;
          border-radius: 7px;
          background: transparent;
          color: #cbd5e1;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
        }

        .view-day-button:hover {
          border-color: #8b5cf6;
          color: #a78bfa;
        }

        .empty-state,
        .loading-state {
          padding: 60px 20px;
          text-align: center;
          color: #64748b;
        }

        .empty-state h3 {
          margin: 0 0 7px;
          color: #cbd5e1;
          font-size: 16px;
        }

        .empty-state p {
          margin: 0;
          font-size: 13px;
        }

        .error-box {
          padding: 12px 15px;
          margin-bottom: 18px;
          border: 1px solid #7f1d1d;
          border-radius: 10px;
          background: #2b1215;
          color: #fca5a5;
          font-size: 13px;
        }

        .mobile-label {
          display: none;
        }

        @media (max-width: 1100px) {
          .activity-row {
            grid-template-columns: 1.2fr 0.6fr 0.6fr 0.6fr 1fr 80px;
          }

          .summary-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 850px) {
          .filters-grid {
            grid-template-columns: 1fr;
          }

          .student-info {
            grid-template-columns: 1fr;
          }

          .activity-row {
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }

          .activity-date {
            grid-column: 1 / -1;
          }

          .row-progress {
            grid-column: 1 / -1;
          }

          .view-day-button {
            width: 100%;
          }
        }

        @media (max-width: 600px) {
          .admin-planner-activity {
            padding: 20px 15px;
          }

          .activity-header {
            flex-direction: column;
          }

          .activity-title h1 {
            font-size: 24px;
          }

          .readonly-badge {
            width: 100%;
            justify-content: center;
            box-sizing: border-box;
          }

          .summary-grid {
            grid-template-columns: 1fr 1fr;
          }

          .summary-card {
            padding: 14px;
          }

          .summary-value {
            font-size: 21px;
          }

          .custom-range {
            grid-template-columns: 1fr;
          }

          .period-navigation {
            flex-wrap: wrap;
          }

          .period-current {
            min-width: 150px;
          }

          .activity-row {
            padding: 15px;
          }
        }

        @media (max-width: 400px) {
          .summary-grid {
            grid-template-columns: 1fr;
          }

          .period-current {
            order: 3;
            width: 100%;
            box-sizing: border-box;
          }
        }
      `}</style>

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="activity-header">
        <div className="activity-title">
          <h1>Planner Activity</h1>

          <p>Monitor student planner activity across different dates.</p>
        </div>

        <div className="readonly-badge">
          <FaExclamationCircle />
          Read Only
        </div>
      </div>

      {/* ==================================================
          FILTERS
      ================================================== */}

      <div className="filters-card">
        <div className="filters-grid">
          {/* STUDENT */}

          <div className="filter-group">
            <label>
              <FaUser />
              Select Student
            </label>

            <select
              className="filter-select"
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              disabled={loadingStudents}
            >
              <option value="">
                {loadingStudents ? "Loading students..." : "Select a student"}
              </option>

              {students.map((student) => (
                <option key={student._id} value={student._id}>
                  {student.name} — {student.email}
                </option>
              ))}
            </select>
          </div>

          {/* PERIOD */}

          <div className="filter-group">
            <label>
              <FaCalendarAlt />
              Period
            </label>

            <select
              className="filter-select"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="today">Today</option>

              <option value="last7">Last 7 Days</option>

              <option value="week">This Week</option>

              <option value="month">This Month</option>

              <option value="custom">Custom Range</option>
            </select>
          </div>
        </div>

        {/* CUSTOM DATE RANGE */}

        {selectedPeriod === "custom" && (
          <div className="custom-range">
            <div className="filter-group">
              <label>Start Date</label>

              <input
                className="filter-input"
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>End Date</label>

              <input
                className="filter-input"
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* PERIOD NAVIGATION */}

        {selectedPeriod !== "custom" && (
          <div className="period-navigation">
            <button
              className="period-arrow"
              onClick={() => changeDate(selectedPeriod === "month" ? -30 : -7)}
              title="Previous period"
            >
              <FaChevronLeft />
            </button>

            <div className="period-current">
              {formatLongDate(dateRange.startDate)} —{" "}
              {formatLongDate(dateRange.endDate)}
            </div>

            <button
              className="period-arrow"
              onClick={() => changeDate(selectedPeriod === "month" ? 30 : 7)}
              title="Next period"
            >
              <FaChevronRight />
            </button>

            <button className="today-button" onClick={goToToday}>
              Today
            </button>
          </div>
        )}
      </div>

      {/* ==================================================
          ERROR
      ================================================== */}

      {error && <div className="error-box">{error}</div>}

      {/* ==================================================
          STUDENT INFORMATION
      ================================================== */}

      {studentInfo && (
        <div className="student-info">
          <div className="student-info-card">
            <div className="info-icon">
              <FaUser />
            </div>

            <div className="info-content">
              <span>Student</span>

              <strong>{studentInfo.name}</strong>
            </div>
          </div>

          <div className="student-info-card">
            <div className="info-icon">
              <FaEnvelope />
            </div>

            <div className="info-content">
              <span>Email</span>

              <strong>{studentInfo.email}</strong>
            </div>
          </div>

          <div className="student-info-card">
            <div className="info-icon">
              <FaBook />
            </div>

            <div className="info-content">
              <span>Course</span>

              <strong>{studentInfo.course || "BSc Computer Science"}</strong>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================
          SUMMARY
      ================================================== */}

      {selectedStudent && !loadingActivity && (
        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-card-header">
              <span className="summary-card-label">Total Tasks</span>

              <FaCalendarAlt className="summary-icon" />
            </div>

            <div className="summary-value">{summary.totalTasks}</div>
          </div>

          <div className="summary-card">
            <div className="summary-card-header">
              <span className="summary-card-label">Completed</span>

              <FaCheckCircle className="summary-icon" />
            </div>

            <div className="summary-value">{summary.completedTasks}</div>
          </div>

          <div className="summary-card">
            <div className="summary-card-header">
              <span className="summary-card-label">Pending</span>

              <FaClock className="summary-icon" />
            </div>

            <div className="summary-value">{summary.pendingTasks}</div>
          </div>

          <div className="summary-card">
            <div className="summary-card-header">
              <span className="summary-card-label">Overall Progress</span>

              <FaChartLine className="summary-icon" />
            </div>

            <div className="summary-value">{summary.completionPercentage}%</div>

            <div className="summary-progress">
              <div
                className="summary-progress-fill"
                style={{
                  width: `${summary.completionPercentage}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ==================================================
          ACTIVITY
      ================================================== */}

      <div className="activity-card">
        <div className="activity-card-header">
          <h2>Daily Activity</h2>

          <span>{periodLabel}</span>
        </div>

        {!selectedStudent ? (
          <div className="empty-state">
            <h3>Select a student</h3>

            <p>Select a student to view their planner activity.</p>
          </div>
        ) : loadingActivity ? (
          <div className="loading-state">Loading planner activity...</div>
        ) : dailyActivity.length === 0 ? (
          <div className="empty-state">
            <h3>No activity found</h3>

            <p>No planner activity is available for the selected period.</p>
          </div>
        ) : (
          <div className="activity-list">
            {dailyActivity.map((day) => (
              <div className="activity-row" key={day.date}>
                {/* DATE */}

                <div className="activity-date">
                  <strong>{formatDisplayDate(day.date)}</strong>

                  <span>{day.date}</span>
                </div>

                {/* TOTAL */}

                <div>
                  <span className="mobile-label">Total</span>

                  <div className="activity-number">{day.totalTasks}</div>
                </div>

                {/* COMPLETED */}

                <div>
                  <span className="mobile-label">Completed</span>

                  <div className="activity-number completed">
                    {day.completedTasks}
                  </div>
                </div>

                {/* PENDING */}

                <div>
                  <span className="mobile-label">Pending</span>

                  <div className="activity-number pending">
                    {day.pendingTasks}
                  </div>
                </div>

                {/* PROGRESS */}

                <div className="row-progress">
                  <div className="row-progress-bar">
                    <div
                      className="row-progress-fill"
                      style={{
                        width: `${day.completionPercentage}%`,
                      }}
                    />
                  </div>

                  <div className="row-progress-percent">
                    {day.completionPercentage}%
                  </div>
                </div>

                {/* VIEW */}

                <button
                  className="view-day-button"
                  onClick={() => openDay(day.date)}
                >
                  View Day
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
