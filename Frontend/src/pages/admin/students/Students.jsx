import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaSearch,
  FaEye,
  FaUserGraduate,
  FaUserCheck,
  FaUserTimes,
  FaSyncAlt,
} from "react-icons/fa";

import toast from "react-hot-toast";

import API_URL from "../../../config/api";

function Students() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // FETCH STUDENTS
  // =====================================================

  const fetchStudents = useCallback(async () => {
    const token = localStorage.getItem("admin_token");

    if (!token) {
      setStudents([]);
      setError("Admin login session not found.");
      setLoading(false);

      navigate("/admin/login", { replace: true });
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `${API_URL}/api/admin/students`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      console.log("ADMIN STUDENTS API RESPONSE:", data);

      // =================================================
      // TOKEN EXPIRED / UNAUTHORIZED
      // =================================================

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin");

        setStudents([]);
        setError("Admin session expired. Please login again.");
        setLoading(false);

        toast.error("Admin session expired.");

        navigate("/admin/login", {
          replace: true,
        });

        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch students."
        );
      }

      // =================================================
      // HANDLE DIFFERENT API RESPONSE FORMATS
      // =================================================

      let studentList = [];

      if (Array.isArray(data.students)) {
        studentList = data.students;
      } else if (Array.isArray(data.users)) {
        studentList = data.users;
      } else if (Array.isArray(data.data)) {
        studentList = data.data;
      } else if (Array.isArray(data)) {
        studentList = data;
      }

      setStudents(studentList);
      setError("");
    } catch (err) {
      console.error("Students API Error:", err);

      setStudents([]);

      const message =
        err?.message ||
        "Failed to load students.";

      setError(message);

      toast.error(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigate]);

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchStudents]);

  // =====================================================
  // REFRESH
  // =====================================================

  const handleRefresh = () => {
    if (refreshing) return;

    setRefreshing(true);

    fetchStudents();
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredStudents = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) {
      return students;
    }

    return students.filter((student) => {
      const name =
        student.name ||
        student.fullName ||
        "";

      const email =
        student.email ||
        "";

      const course =
        student.course ||
        student.program ||
        student.degree ||
        student.branch ||
        "";

      const semester =
        student.semester ||
        student.year ||
        student.currentYear ||
        "";

      const searchableText = `
        ${name}
        ${email}
        ${course}
        ${semester}
      `.toLowerCase();

      return searchableText.includes(searchValue);
    });
  }, [students, search]);

  // =====================================================
  // ACTIVE STUDENTS
  // =====================================================

  const activeStudents = useMemo(() => {
    return students.filter((student) => {
      if (student.isActive !== undefined) {
        return student.isActive === true;
      }

      if (student.status) {
        return (
          String(student.status).toLowerCase() ===
          "active"
        );
      }

      return true;
    }).length;
  }, [students]);

  // =====================================================
  // INACTIVE STUDENTS
  // =====================================================

  const inactiveStudents =
    students.length - activeStudents;

  // =====================================================
  // VIEW STUDENT
  // =====================================================

  const handleViewStudent = (id) => {
    if (!id) {
      toast.error("Student ID is missing.");
      return;
    }

    navigate(`/admin/students/${id}`);
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <>
        <style>{responsiveCSS}</style>

        <div className="students-loading">
          <div className="loading-icon">
            <FaUserGraduate />
          </div>

          <p className="loading-title">
            Loading students...
          </p>

          <p className="loading-text">
            Fetching registered students.
          </p>
        </div>
      </>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <>
      <style>{responsiveCSS}</style>

      <div className="students-page">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="students-header">

          <div>
            <h1 className="students-title">
              Students
            </h1>

            <p className="students-subtitle">
              View and manage registered students.
            </p>
          </div>

          <div className="header-actions">

            <div className="total-box">
              <FaUserGraduate />

              <span>
                {students.length} Students
              </span>
            </div>

            <button
              type="button"
              className="refresh-button"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <FaSyncAlt
                className={
                  refreshing
                    ? "refresh-spinning"
                    : ""
                }
              />

              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>

          </div>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="error-box">

            <div>
              <strong>
                Failed to load students
              </strong>

              <p>
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
            >
              Try Again
            </button>

          </div>
        )}

        {/* =================================================
            STATISTICS
        ================================================= */}

        <div className="stats-grid">

          {/* TOTAL */}

          <div className="stat-card">

            <div
              className="icon-box"
              style={{
                background: "#312E81",
                color: "#A78BFA",
              }}
            >
              <FaUserGraduate />
            </div>

            <div>
              <p className="stat-label">
                Total Students
              </p>

              <h2 className="stat-value">
                {students.length}
              </h2>

              <p className="stat-description">
                Registered students
              </p>
            </div>

          </div>

          {/* ACTIVE */}

          <div className="stat-card">

            <div
              className="icon-box"
              style={{
                background: "#064E3B",
                color: "#6EE7B7",
              }}
            >
              <FaUserCheck />
            </div>

            <div>
              <p className="stat-label">
                Active Students
              </p>

              <h2 className="stat-value">
                {activeStudents}
              </h2>

              <p className="stat-description">
                Currently active
              </p>
            </div>

          </div>

          {/* INACTIVE */}

          <div className="stat-card">

            <div
              className="icon-box"
              style={{
                background: "#450A0A",
                color: "#FCA5A5",
              }}
            >
              <FaUserTimes />
            </div>

            <div>
              <p className="stat-label">
                Inactive Students
              </p>

              <h2 className="stat-value">
                {inactiveStudents}
              </h2>

              <p className="stat-description">
                Currently inactive
              </p>
            </div>

          </div>

        </div>

        {/* =================================================
            STUDENTS CARD
        ================================================= */}

        <div className="students-card">

          {/* CARD HEADER */}

          <div className="students-card-header">

            <div>
              <h2 className="card-title">
                All Students
              </h2>

              <p className="card-subtitle">
                {filteredStudents.length} student
                {filteredStudents.length !== 1
                  ? "s"
                  : ""}{" "}
                available
              </p>
            </div>

            {/* SEARCH */}

            <div className="search-box">

              <FaSearch className="search-icon" />

              <input
                type="text"
                placeholder="Search student..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

            </div>

          </div>

          {/* =================================================
              DESKTOP TABLE
          ================================================= */}

          <div className="desktop-table">

            <table>

              <thead>
                <tr>
                  <th>Student</th>
                  <th>Email</th>
                  <th>Course</th>
                  <th>Semester</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {filteredStudents.length > 0 ? (

                  filteredStudents.map((student) => {

                    const studentId =
                      student._id ||
                      student.id;

                    const studentName =
                      student.name ||
                      student.fullName ||
                      "Unnamed Student";

                    const studentEmail =
                      student.email ||
                      "No email";

                    const studentCourse =
                      student.course ||
                      student.program ||
                      student.degree ||
                      student.branch ||
                      "-";

                    const studentSemester =
                      student.semester ||
                      student.year ||
                      student.currentYear ||
                      "-";

                    let studentStatus =
                      "Active";

                    if (
                      student.isActive === false
                    ) {
                      studentStatus =
                        "Inactive";
                    } else if (
                      student.status
                    ) {
                      studentStatus =
                        String(
                          student.status
                        )
                          .charAt(0)
                          .toUpperCase() +
                        String(
                          student.status
                        )
                          .slice(1)
                          .toLowerCase();
                    }

                    return (
                      <tr key={studentId}>

                        {/* STUDENT */}

                        <td>
                          <div className="student-cell">

                            <div className="avatar">
                              {studentName
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <span>
                              {studentName}
                            </span>

                          </div>
                        </td>

                        {/* EMAIL */}

                        <td>
                          {studentEmail}
                        </td>

                        {/* COURSE */}

                        <td>
                          {studentCourse}
                        </td>

                        {/* SEMESTER */}

                        <td>
                          {studentSemester}
                        </td>

                        {/* STATUS */}

                        <td>

                          <span
                            className="status"
                            style={{
                              background:
                                studentStatus ===
                                "Active"
                                  ? "#064E3B"
                                  : "#450A0A",

                              color:
                                studentStatus ===
                                "Active"
                                  ? "#6EE7B7"
                                  : "#FCA5A5",
                            }}
                          >
                            {studentStatus}
                          </span>

                        </td>

                        {/* ACTION */}

                        <td>

                          <button
                            type="button"
                            className="view-button"
                            onClick={() =>
                              handleViewStudent(
                                studentId
                              )
                            }
                          >
                            <FaEye />

                            View
                          </button>

                        </td>

                      </tr>
                    );
                  })

                ) : (

                  <tr>
                    <td
                      colSpan="6"
                      className="no-results"
                    >
                      {search
                        ? "No students found."
                        : "No registered students found."}
                    </td>
                  </tr>

                )}

              </tbody>

            </table>

          </div>

          {/* =================================================
              MOBILE CARDS
          ================================================= */}

          <div className="mobile-students">

            {filteredStudents.length > 0 ? (

              filteredStudents.map((student) => {

                const studentId =
                  student._id ||
                  student.id;

                const studentName =
                  student.name ||
                  student.fullName ||
                  "Unnamed Student";

                const studentEmail =
                  student.email ||
                  "No email";

                const studentCourse =
                  student.course ||
                  student.program ||
                  student.degree ||
                  student.branch ||
                  "-";

                const studentSemester =
                  student.semester ||
                  student.year ||
                  student.currentYear ||
                  "-";

                let studentStatus =
                  "Active";

                if (
                  student.isActive === false
                ) {
                  studentStatus =
                    "Inactive";
                } else if (
                  student.status
                ) {
                  studentStatus =
                    String(
                      student.status
                    )
                      .charAt(0)
                      .toUpperCase() +
                    String(
                      student.status
                    )
                      .slice(1)
                      .toLowerCase();
                }

                return (
                  <div
                    className="mobile-student-card"
                    key={studentId}
                  >

                    {/* TOP */}

                    <div className="mobile-student-top">

                      <div className="mobile-student-info">

                        <div className="mobile-avatar">
                          {studentName
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>

                          <h3>
                            {studentName}
                          </h3>

                          <p>
                            {studentEmail}
                          </p>

                        </div>

                      </div>

                      <span
                        className="mobile-status"
                        style={{
                          background:
                            studentStatus ===
                            "Active"
                              ? "#064E3B"
                              : "#450A0A",

                          color:
                            studentStatus ===
                            "Active"
                              ? "#6EE7B7"
                              : "#FCA5A5",
                        }}
                      >
                        {studentStatus}
                      </span>

                    </div>

                    {/* DETAILS */}

                    <div className="mobile-details">

                      <div className="mobile-detail">

                        <span>
                          Course
                        </span>

                        <strong>
                          {studentCourse}
                        </strong>

                      </div>

                      <div className="mobile-detail">

                        <span>
                          Semester
                        </span>

                        <strong>
                          {studentSemester}
                        </strong>

                      </div>

                    </div>

                    {/* VIEW */}

                    <button
                      type="button"
                      className="mobile-view-button"
                      onClick={() =>
                        handleViewStudent(
                          studentId
                        )
                      }
                    >
                      <FaEye />

                      View Student
                    </button>

                  </div>
                );
              })

            ) : (

              <div className="mobile-no-results">
                {search
                  ? "No students found."
                  : "No registered students found."}
              </div>

            )}

          </div>

        </div>

      </div>
    </>
  );
}

// =====================================================
// RESPONSIVE CSS
// =====================================================

const responsiveCSS = `

* {
  box-sizing: border-box;
}

.students-page {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.students-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 25px;
}

.students-title {
  color: #FFFFFF;
  font-size: 28px;
  margin: 0;
}

.students-subtitle {
  color: #64748B;
  font-size: 13px;
  margin: 6px 0 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.total-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #312E81;
  color: #A78BFA;
  padding: 10px 13px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.refresh-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #0F172A;
  color: #CBD5E1;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 10px 13px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.refresh-button:hover {
  background: #1E293B;
}

.refresh-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.refresh-spinning {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 22px;
}

.stat-card {
  background: #0F172A;
  border: 1px solid #1E293B;
  border-radius: 14px;
  padding: 18px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.icon-box {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.stat-label {
  color: #94A3B8;
  font-size: 11px;
  margin: 0;
}

.stat-value {
  color: #FFFFFF;
  font-size: 23px;
  margin: 4px 0 0;
}

.stat-description {
  color: #64748B;
  font-size: 10px;
  margin: 4px 0 0;
}

.students-card {
  background: #0F172A;
  border: 1px solid #1E293B;
  border-radius: 16px;
  padding: 20px;
}

.students-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.card-title {
  color: #FFFFFF;
  font-size: 17px;
  margin: 0;
}

.card-subtitle {
  color: #64748B;
  font-size: 11px;
  margin: 5px 0 0;
}

.search-box {
  width: 240px;
  display: flex;
  align-items: center;
  background: #020617;
  border: 1px solid #334155;
  border-radius: 9px;
  padding: 0 11px;
}

.search-icon {
  color: #64748B;
  font-size: 12px;
  flex-shrink: 0;
}

.search-box input {
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  color: #FFFFFF;
  padding: 10px;
  font-size: 12px;
}

.search-box input::placeholder {
  color: #64748B;
}

.desktop-table {
  width: 100%;
  overflow-x: auto;
}

.desktop-table table {
  width: 100%;
  border-collapse: collapse;
}

.desktop-table th {
  color: #64748B;
  font-size: 10px;
  font-weight: 700;
  text-align: left;
  padding: 12px;
  border-bottom: 1px solid #1E293B;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.desktop-table td {
  color: #CBD5E1;
  font-size: 12px;
  padding: 14px 12px;
  border-bottom: 1px solid #1E293B;
}

.desktop-table tbody tr:hover {
  background: #111827;
}

.student-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #312E81;
  color: #A78BFA;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.status {
  display: inline-block;
  padding: 5px 9px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
}

.view-button {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #1E293B;
  border: none;
  border-radius: 7px;
  color: #CBD5E1;
  padding: 7px 10px;
  cursor: pointer;
  font-size: 11px;
}

.view-button:hover {
  background: #334155;
}

.no-results {
  text-align: center;
  color: #64748B !important;
  padding: 35px !important;
  font-size: 12px;
}

.mobile-students {
  display: none;
}

.students-loading {
  width: 100%;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.loading-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #312E81;
  color: #A78BFA;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  margin-bottom: 12px;
}

.loading-title {
  color: #CBD5E1;
  font-size: 14px;
  margin: 0;
}

.loading-text {
  color: #64748B;
  font-size: 11px;
  margin-top: 6px;
}

.error-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  background: #450A0A;
  border: 1px solid #7F1D1D;
  border-radius: 10px;
  padding: 12px 15px;
  margin-bottom: 20px;
  color: #FCA5A5;
  font-size: 12px;
}

.error-box p {
  margin: 5px 0 0;
}

.error-box button {
  background: #7F1D1D;
  border: none;
  border-radius: 7px;
  color: #FFFFFF;
  padding: 8px 12px;
  cursor: pointer;
  white-space: nowrap;
}

/* =====================================================
   MOBILE
===================================================== */

@media (max-width: 768px) {

  .students-page {
    width: 100%;
    padding: 0;
  }

  .students-header {
    align-items: flex-start;
    flex-direction: column;
    margin-bottom: 18px;
  }

  .students-title {
    font-size: 25px;
  }

  .students-subtitle {
    font-size: 12px;
  }

  .header-actions {
    width: 100%;
    flex-direction: column;
  }

  .total-box,
  .refresh-button {
    width: 100%;
    justify-content: center;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 10px;
    margin-bottom: 16px;
  }

  .stat-card {
    padding: 14px;
  }

  .icon-box {
    width: 40px;
    height: 40px;
  }

  .stat-value {
    font-size: 21px;
  }

  .students-card {
    padding: 14px;
    border-radius: 14px;
  }

  .students-card-header {
    flex-direction: column;
    align-items: stretch;
    gap: 14px;
    margin-bottom: 16px;
  }

  .card-title {
    font-size: 16px;
  }

  .search-box {
    width: 100%;
    height: 44px;
  }

  .search-box input {
    font-size: 13px;
    padding: 10px;
  }

  .desktop-table {
    display: none;
  }

  .mobile-students {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .mobile-student-card {
    background: #020617;
    border: 1px solid #1E293B;
    border-radius: 13px;
    padding: 14px;
  }

  .mobile-student-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
  }

  .mobile-student-info {
    display: flex;
    align-items: center;
    gap: 11px;
    min-width: 0;
  }

  .mobile-avatar {
    width: 42px;
    height: 42px;
    border-radius: 11px;
    background: #312E81;
    color: #A78BFA;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    font-weight: 700;
    flex-shrink: 0;
  }

  .mobile-student-info h3 {
    color: #FFFFFF;
    font-size: 14px;
    margin: 0 0 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 150px;
  }

  .mobile-student-info p {
    color: #64748B;
    font-size: 10px;
    margin: 0;
    max-width: 160px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .mobile-status {
    padding: 5px 8px;
    border-radius: 6px;
    font-size: 9px;
    font-weight: 700;
    flex-shrink: 0;
  }

  .mobile-details {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-top: 14px;
    padding-top: 12px;
    border-top: 1px solid #1E293B;
  }

  .mobile-detail {
    background: #0F172A;
    border-radius: 8px;
    padding: 9px;
  }

  .mobile-detail span {
    display: block;
    color: #64748B;
    font-size: 9px;
    margin-bottom: 4px;
  }

  .mobile-detail strong {
    display: block;
    color: #CBD5E1;
    font-size: 11px;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .mobile-view-button {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    margin-top: 12px;
    padding: 11px;
    background: #8B5CF6;
    color: #FFFFFF;
    border: none;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
  }

  .mobile-view-button:active {
    background: #7C3AED;
    transform: scale(0.98);
  }

  .mobile-no-results {
    text-align: center;
    color: #64748B;
    padding: 30px 10px;
    font-size: 12px;
  }

  .error-box {
    flex-direction: column;
    align-items: stretch;
  }

  .error-box button {
    width: 100%;
  }
}

/* =====================================================
   SMALL PHONES
===================================================== */

@media (max-width: 400px) {

  .students-title {
    font-size: 22px;
  }

  .students-card {
    padding: 11px;
  }

  .mobile-student-card {
    padding: 12px;
  }

  .mobile-student-info h3 {
    max-width: 125px;
  }

  .mobile-student-info p {
    max-width: 135px;
  }
}

`;

export default Students;