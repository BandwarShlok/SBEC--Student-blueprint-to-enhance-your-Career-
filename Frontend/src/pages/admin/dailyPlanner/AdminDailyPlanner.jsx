import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaCheckCircle,
  FaClock,
  FaUser,
  FaEnvelope,
  FaBook,
  FaExclamationCircle,
} from "react-icons/fa";
import API_URL from "../../../config/api";

/*
========================================================
ADMIN TOKEN
Supports the token keys used by the existing admin system.
========================================================
*/

const getToken = () => {
  return (
    localStorage.getItem("admin_token") ||
    localStorage.getItem("adminToken") ||
    localStorage.getItem("sbec_admin_token") ||
    sessionStorage.getItem("admin_token") ||
    sessionStorage.getItem("adminToken") ||
    sessionStorage.getItem("sbec_admin_token")
  );
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

const formatDisplayDate = (date) => {
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

/*
========================================================
MAIN COMPONENT
========================================================
*/

export default function AdminDailyPlanner() {
  const [students, setStudents] = useState([]);

  const [selectedStudent, setSelectedStudent] = useState("");

  const [selectedDate, setSelectedDate] = useState(new Date());

  const [plans, setPlans] = useState([]);

  const [studentInfo, setStudentInfo] = useState(null);

  const [loadingStudents, setLoadingStudents] = useState(true);

  const [loadingPlans, setLoadingPlans] = useState(false);

  const [error, setError] = useState("");

  /*
  ========================================================
  CURRENT DATE
  ========================================================
  */

  const apiDate = formatDateForAPI(selectedDate);

  const todayDate = formatDateForAPI(new Date());

  const isToday = apiDate === todayDate;

  /*
  ========================================================
  GET ALL STUDENTS
  ========================================================
  */

  const fetchStudents = useCallback(async () => {
    try {
      setLoadingStudents(true);

      setError("");

      const token = getToken();

      if (!token) {
        setError(
          "Admin session expired. Please login again."
        );

        return;
      }

      const response = await fetch(
        `${API_URL}/api/admin/daily-planner/students`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      /*
      ====================================================
      TOKEN ERROR
      ====================================================
      */

      if (response.status === 401) {
        setError(
          "Admin session expired. Please login again."
        );

        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load students."
        );
      }

      setStudents(data.students || []);
    } catch (err) {
      console.error(
        "Admin Students Error:",
        err
      );

      setError(
        err.message ||
          "Unable to load students."
      );
    } finally {
      setLoadingStudents(false);
    }
  }, []);

  /*
  ========================================================
  GET SELECTED STUDENT PLANS
  ========================================================
  */

  const fetchPlans = useCallback(async () => {
    if (!selectedStudent) {
      setPlans([]);

      setStudentInfo(null);

      return;
    }

    try {
      setLoadingPlans(true);

      setError("");

      const token = getToken();

      if (!token) {
        setError(
          "Admin session expired. Please login again."
        );

        return;
      }

      const response = await fetch(
        `${API_URL}/api/admin/daily-planner/student/${selectedStudent}?date=${apiDate}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      /*
      ====================================================
      TOKEN ERROR
      ====================================================
      */

      if (response.status === 401) {
        setError(
          "Admin session expired. Please login again."
        );

        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load student's planner."
        );
      }

      setPlans(data.plans || []);

      setStudentInfo(
        data.student || null
      );
    } catch (err) {
      console.error(
        "Admin Daily Planner Error:",
        err
      );

      setError(
        err.message ||
          "Unable to load student's planner."
      );

      setPlans([]);

      setStudentInfo(null);
    } finally {
      setLoadingPlans(false);
    }
  }, [selectedStudent, apiDate]);

  /*
  ========================================================
  INITIAL LOAD
  ========================================================
  */

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents();
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [fetchStudents]);

  /*
  ========================================================
  LOAD PLANS WHEN STUDENT / DATE CHANGES
  ========================================================
  */

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPlans();
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [fetchPlans]);

  /*
  ========================================================
  DATE NAVIGATION
  ========================================================
  */

  const changeDate = (days) => {
    const newDate = new Date(
      selectedDate
    );

    newDate.setDate(
      newDate.getDate() + days
    );

    setSelectedDate(newDate);
  };

  /*
  ========================================================
  GO TO TODAY
  ========================================================
  */

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  /*
  ========================================================
  SORT PLANS
  ========================================================
  */

  const sortedPlans = useMemo(() => {
    return [...plans].sort((a, b) => {
      if (!a.startTime && !b.startTime) {
        return 0;
      }

      if (!a.startTime) {
        return 1;
      }

      if (!b.startTime) {
        return -1;
      }

      return a.startTime.localeCompare(
        b.startTime
      );
    });
  }, [plans]);

  /*
  ========================================================
  PROGRESS
  ========================================================
  */

  const totalCount = plans.length;

  const completedCount = plans.filter(
    (plan) => plan.completed
  ).length;

  const pendingCount =
    totalCount - completedCount;

  const progress =
    totalCount === 0
      ? 0
      : Math.round(
          (completedCount / totalCount) * 100
        );

  /*
  ========================================================
  PRIORITY CLASS
  ========================================================
  */

  const getPriorityClass = (
    priority
  ) => {
    if (priority === "High") {
      return "priority-high";
    }

    if (priority === "Low") {
      return "priority-low";
    }

    return "priority-medium";
  };

  /*
  ========================================================
  UI
  ========================================================
  */

  return (
    <div className="admin-daily-planner">
      <style>{`
        .admin-daily-planner {
          min-height: 100vh;
          padding: 28px;
          background: #0f172a;
          color: #e5e7eb;
          box-sizing: border-box;
        }

        .planner-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 25px;
        }

        .planner-heading h1 {
          margin: 0;
          color: #f8fafc;
          font-size: 30px;
          font-weight: 700;
        }

        .planner-heading p {
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

        .student-selector {
          margin-bottom: 20px;
          padding: 20px;
          border: 1px solid #1e293b;
          border-radius: 14px;
          background: #111c30;
        }

        .selector-label {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 8px;
          color: #cbd5e1;
          font-size: 13px;
          font-weight: 600;
        }

        .student-select {
          width: 100%;
          box-sizing: border-box;
          padding: 12px;
          border: 1px solid #334155;
          border-radius: 9px;
          outline: none;
          background: #0f172a;
          color: #f8fafc;
          font-size: 14px;
        }

        .student-select:focus {
          border-color: #8b5cf6;
        }

        .student-select:disabled {
          opacity: 0.7;
          cursor: not-allowed;
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
          color: #64748b;
          font-size: 11px;
          margin-bottom: 3px;
        }

        .info-content strong {
          display: block;
          color: #f8fafc;
          font-size: 13px;
          word-break: break-word;
        }

        .date-navigation {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 16px;
          margin-bottom: 20px;
          border: 1px solid #1e293b;
          border-radius: 14px;
          background: #111c30;
        }

        .date-arrow {
          width: 40px;
          height: 40px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #334155;
          border-radius: 9px;
          background: #0f172a;
          color: #cbd5e1;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .date-arrow:hover {
          border-color: #8b5cf6;
          color: #a78bfa;
          background: #151f35;
        }

        .date-center {
          flex: 1;
          text-align: center;
          min-width: 0;
        }

        .date-center h2 {
          margin: 0;
          color: #f8fafc;
          font-size: 18px;
          font-weight: 700;
        }

        .date-center span {
          display: block;
          margin-top: 5px;
          color: #64748b;
          font-size: 12px;
        }

        .today-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-top: 10px;
          padding: 7px 12px;
          border: 1px solid #8b5cf6;
          border-radius: 8px;
          background: rgba(139, 92, 246, 0.08);
          color: #a78bfa;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .today-btn:hover {
          background: #8b5cf6;
          color: white;
        }

        .progress-card {
          padding: 20px;
          margin-bottom: 25px;
          border: 1px solid #1e293b;
          border-radius: 14px;
          background: #111c30;
        }

        .progress-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 15px;
        }

        .progress-top h3 {
          margin: 0;
          color: #f8fafc;
          font-size: 17px;
        }

        .progress-percent {
          color: #a78bfa;
          font-weight: 700;
        }

        .progress-bar {
          height: 9px;
          overflow: hidden;
          border-radius: 20px;
          background: #1e293b;
        }

        .progress-fill {
          height: 100%;
          border-radius: 20px;
          background: #8b5cf6;
          transition: width 0.3s ease;
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-top: 18px;
        }

        .stat {
          padding: 12px;
          border: 1px solid #1e293b;
          border-radius: 10px;
          background: #0f172a;
        }

        .stat strong {
          display: block;
          color: #f8fafc;
          font-size: 20px;
        }

        .stat span {
          color: #64748b;
          font-size: 12px;
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

        .loading,
        .empty-state {
          padding: 60px 20px;
          text-align: center;
          border: 1px dashed #334155;
          border-radius: 14px;
          color: #64748b;
        }

        .empty-state h3 {
          margin: 0 0 8px;
          color: #cbd5e1;
        }

        .empty-state p {
          margin: 0;
          font-size: 13px;
        }

        .timeline {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .timeline-item {
          display: grid;
          grid-template-columns: 90px 1fr;
          gap: 15px;
        }

        .timeline-time {
          padding-top: 20px;
          text-align: right;
          color: #94a3b8;
          font-size: 13px;
        }

        .task-card {
          padding: 18px;
          border: 1px solid #1e293b;
          border-radius: 14px;
          background: #111c30;
          transition: 0.2s ease;
        }

        .task-card:hover {
          border-color: #334155;
        }

        .task-card.completed {
          opacity: 0.7;
        }

        .task-main {
          display: flex;
          align-items: flex-start;
          gap: 13px;
        }

        .status-icon {
          width: 25px;
          height: 25px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 1px;
          color: #64748b;
        }

        .status-icon.completed {
          color: #8b5cf6;
        }

        .task-info {
          flex: 1;
          min-width: 0;
        }

        .task-title {
          margin: 0;
          color: #f8fafc;
          font-size: 16px;
          font-weight: 600;
        }

        .completed .task-title {
          text-decoration: line-through;
        }

        .task-description {
          margin: 7px 0 12px;
          color: #94a3b8;
          font-size: 13px;
          line-height: 1.5;
          word-break: break-word;
        }

        .task-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .meta-tag {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 8px;
          border-radius: 6px;
          background: #0f172a;
          color: #94a3b8;
          font-size: 11px;
        }

        .priority-high {
          color: #fca5a5;
        }

        .priority-medium {
          color: #fcd34d;
        }

        .priority-low {
          color: #86efac;
        }

        .readonly-note {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-top: 12px;
          color: #64748b;
          font-size: 11px;
        }

        @media (max-width: 900px) {
          .student-info {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .admin-daily-planner {
            padding: 20px 15px;
          }

          .planner-heading h1 {
            font-size: 24px;
          }

          .student-info {
            grid-template-columns: 1fr;
          }

          .timeline-item {
            grid-template-columns: 65px 1fr;
            gap: 10px;
          }

          .timeline-time {
            font-size: 11px;
          }
        }

        @media (max-width: 500px) {
          .planner-header {
            flex-direction: column;
          }

          .readonly-badge {
            width: 100%;
            justify-content: center;
            box-sizing: border-box;
          }

          .date-navigation {
            padding: 12px;
            gap: 8px;
          }

          .date-center h2 {
            font-size: 15px;
          }

          .stats {
            grid-template-columns: 1fr;
          }

          .timeline-item {
            display: block;
          }

          .timeline-time {
            padding: 0 0 7px 3px;
            text-align: left;
          }

          .task-card {
            padding: 14px;
          }

          .task-main {
            gap: 10px;
          }

          .task-title {
            font-size: 15px;
          }
        }
      `}</style>

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="planner-header">
        <div className="planner-heading">
          <h1>Daily Planner</h1>

          <p>
            View student daily activities and progress.
          </p>
        </div>

        <div className="readonly-badge">
          <FaExclamationCircle />
          Read Only
        </div>
      </div>

      {/* ==================================================
          STUDENT SELECTOR
      ================================================== */}

      <div className="student-selector">
        <div className="selector-label">
          <FaUser />
          Select Student
        </div>

        <select
          className="student-select"
          value={selectedStudent}
          onChange={(e) =>
            setSelectedStudent(e.target.value)
          }
          disabled={loadingStudents}
        >
          <option value="">
            {loadingStudents
              ? "Loading students..."
              : "Select a student"}
          </option>

          {students.map((student) => (
            <option
              key={student._id}
              value={student._id}
            >
              {student.name} — {student.email}
            </option>
          ))}
        </select>
      </div>

      {/* ==================================================
          ERROR
      ================================================== */}

      {error && (
        <div className="error-box">
          {error}
        </div>
      )}

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

              <strong>
                {studentInfo.name}
              </strong>
            </div>
          </div>

          <div className="student-info-card">
            <div className="info-icon">
              <FaEnvelope />
            </div>

            <div className="info-content">
              <span>Email</span>

              <strong>
                {studentInfo.email}
              </strong>
            </div>
          </div>

          <div className="student-info-card">
            <div className="info-icon">
              <FaBook />
            </div>

            <div className="info-content">
              <span>Course</span>

              <strong>
                {studentInfo.course ||
                  "BSc Computer Science"}
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================
          DATE NAVIGATION
      ================================================== */}

      <div className="date-navigation">
        <button
          className="date-arrow"
          onClick={() =>
            changeDate(-1)
          }
          title="Previous day"
        >
          <FaChevronLeft />
        </button>

        <div className="date-center">
          <h2>
            {formatDisplayDate(
              selectedDate
            )}
          </h2>

          <span>
            {apiDate}
          </span>

          {!isToday && (
            <button
              className="today-btn"
              onClick={goToToday}
            >
              Go to Today
            </button>
          )}
        </div>

        <button
          className="date-arrow"
          onClick={() =>
            changeDate(1)
          }
          title="Next day"
        >
          <FaChevronRight />
        </button>
      </div>

      {/* ==================================================
          PROGRESS
      ================================================== */}

      {selectedStudent && (
        <div className="progress-card">
          <div className="progress-top">
            <h3>
              {isToday
                ? "Today's Progress"
                : "Progress for this day"}
            </h3>

            <span className="progress-percent">
              {progress}%
            </span>
          </div>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          <div className="stats">
            <div className="stat">
              <strong>
                {totalCount}
              </strong>

              <span>
                Total Tasks
              </span>
            </div>

            <div className="stat">
              <strong>
                {completedCount}
              </strong>

              <span>
                Completed
              </span>
            </div>

            <div className="stat">
              <strong>
                {pendingCount}
              </strong>

              <span>
                Pending
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================
          CONTENT
      ================================================== */}

      {!selectedStudent ? (
        <div className="empty-state">
          <h3>
            Select a student
          </h3>

          <p>
            Select a student above to view
            their daily planner.
          </p>
        </div>
      ) : loadingPlans ? (
        <div className="loading">
          Loading student's planner...
        </div>
      ) : sortedPlans.length === 0 ? (
        <div className="empty-state">
          <h3>
            No tasks planned
          </h3>

          <p>
            {studentInfo?.name ||
              "This student"}{" "}
            has no planner tasks for this
            date.
          </p>
        </div>
      ) : (
        <div className="timeline">
          {sortedPlans.map((plan) => (
            <div
              className="timeline-item"
              key={plan._id}
            >
              {/* TIME */}

              <div className="timeline-time">
                {plan.startTime ||
                  "Anytime"}
              </div>

              {/* TASK */}

              <div
                className={`task-card ${
                  plan.completed
                    ? "completed"
                    : ""
                }`}
              >
                <div className="task-main">
                  {/* STATUS */}

                  <div
                    className={`status-icon ${
                      plan.completed
                        ? "completed"
                        : ""
                    }`}
                  >
                    <FaCheckCircle />
                  </div>

                  {/* TASK INFORMATION */}

                  <div className="task-info">
                    <h3 className="task-title">
                      {plan.title}
                    </h3>

                    {plan.description && (
                      <p className="task-description">
                        {plan.description}
                      </p>
                    )}

                    {/* META */}

                    <div className="task-meta">
                      {plan.startTime && (
                        <span className="meta-tag">
                          <FaClock />

                          {plan.startTime}

                          {plan.endTime
                            ? ` - ${plan.endTime}`
                            : ""}
                        </span>
                      )}

                      <span className="meta-tag">
                        {plan.category}
                      </span>

                      <span
                        className={`meta-tag ${getPriorityClass(
                          plan.priority
                        )}`}
                      >
                        {plan.priority}{" "}
                        Priority
                      </span>

                      <span className="meta-tag">
                        {plan.completed
                          ? "Completed"
                          : "Pending"}
                      </span>
                    </div>

                    {/* READ ONLY */}

                    <div className="readonly-note">
                      <FaExclamationCircle />

                      Admin view is read-only
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}