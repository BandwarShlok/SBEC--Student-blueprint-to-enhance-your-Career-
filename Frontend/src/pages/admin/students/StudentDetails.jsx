import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  FaArrowLeft,
  FaUserGraduate,
  FaEnvelope,
  FaBook,
  FaCalendarAlt,
  FaCheckCircle,
  FaCircle,
} from "react-icons/fa";

import API_URL from "../../../config/api";

function StudentDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [student, setStudent] = useState(null);
  const [progress, setProgress] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // FETCH STUDENT
  // =====================================================

  useEffect(() => {
    let cancelled = false;

    const fetchStudent = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("admin_token");

        if (!token) {
          throw new Error("Admin login session has expired.");
        }

        if (!id) {
          throw new Error("Student ID is missing.");
        }

        const response = await fetch(`${API_URL}/api/admin/students/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        console.log("STUDENT DETAILS API RESPONSE:", data);

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch student.");
        }

        if (!data.student) {
          throw new Error("Student data was not returned by the server.");
        }

        if (!cancelled) {
          setStudent(data.student);
          setProgress(data.progress || null);
        }
      } catch (err) {
        console.error("Student Details Error:", err);

        if (!cancelled) {
          setError(err.message || "Failed to load student details.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchStudent();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "Not available";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return String(date);
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // =====================================================
  // STUDENT VALUES
  // =====================================================

  const studentName = student?.name || student?.fullName || "Unnamed Student";

  const studentEmail = student?.email || "Not available";

  const studentCourse =
    student?.course ||
    student?.program ||
    student?.degree ||
    student?.branch ||
    "Not available";

  const studentYear = student?.year || student?.currentYear || "Not available";

  const studentSemester = student?.semester || "Not available";

  const studentRollNo =
    student?.rollNo || student?.rollNumber || student?.roll || "Not available";

  const studentStatus =
    student?.isActive === false
      ? "Inactive"
      : student?.status
        ? String(student.status).charAt(0).toUpperCase() +
          String(student.status).slice(1).toLowerCase()
        : "Active";

  const joinedDate =
    student?.createdAt || student?.joinedAt || student?.joined || null;

  const isActive = studentStatus === "Active";

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <>
        <style>{stylesCSS}</style>

        <div className="student-details-center">
          <div className="loading-icon">
            <FaUserGraduate />
          </div>

          <h2 className="loading-title">Loading Student</h2>

          <p className="loading-text">Fetching student information...</p>
        </div>
      </>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error || !student) {
    return (
      <>
        <style>{stylesCSS}</style>

        <div className="student-details-center">
          <div className="error-icon">!</div>

          <h2 className="error-title">Unable to Load Student</h2>

          <p className="error-text">
            {error || "Student information could not be found."}
          </p>

          <button
            type="button"
            onClick={() => navigate("/admin/students")}
            className="back-button error-back-button"
          >
            <FaArrowLeft />
            Back to Students
          </button>
        </div>
      </>
    );
  }

  // =====================================================
  // SUBJECT DATA
  // =====================================================

  const subjectList = progress?.subjects || [];

  const overallPercentage = progress?.percentage ?? 0;

  const completedUnits = progress?.completedUnits ?? 0;

  const totalUnits = progress?.totalUnits ?? 0;

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <>
      <style>{stylesCSS}</style>

      <div className="student-details-page">
        {/* =========================================
            BACK
        ========================================= */}

        <button
          type="button"
          onClick={() => navigate("/admin/students")}
          className="back-button"
        >
          <FaArrowLeft />
          Back to Students
        </button>

        {/* =========================================
            HEADER
        ========================================= */}

        <div className="student-header">
          <div className="profile-icon">
            {studentName.charAt(0).toUpperCase()}
          </div>

          <div className="header-info">
            <h1 className="student-title">{studentName}</h1>

            <p className="student-id">Student ID: {student._id || id}</p>
          </div>

          <span
            className={`status-badge ${
              isActive ? "status-active" : "status-inactive"
            }`}
          >
            {studentStatus}
          </span>
        </div>

        {/* =========================================
            BASIC INFORMATION
        ========================================= */}

        <div className="info-grid">
          <div className="info-card">
            <div className="info-icon">
              <FaEnvelope />
            </div>

            <div className="info-content">
              <p className="info-label">Email</p>

              <p className="info-value">{studentEmail}</p>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon">
              <FaBook />
            </div>

            <div className="info-content">
              <p className="info-label">Course</p>

              <p className="info-value">{studentCourse}</p>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon">
              <FaUserGraduate />
            </div>

            <div className="info-content">
              <p className="info-label">Semester</p>

              <p className="info-value">{studentSemester}</p>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon">
              <FaCalendarAlt />
            </div>

            <div className="info-content">
              <p className="info-label">Joined</p>

              <p className="info-value">{formatDate(joinedDate)}</p>
            </div>
          </div>
        </div>

        {/* =========================================
            ACADEMIC INFORMATION
        ========================================= */}

        <div className="details-card">
          <h2 className="card-title">Academic Information</h2>

          <p className="card-subtitle">Student academic details</p>

          <div className="academic-grid">
            <div className="academic-item">
              <p className="detail-label">Roll Number</p>

              <p className="detail-value">{studentRollNo}</p>
            </div>

            <div className="academic-item">
              <p className="detail-label">Course</p>

              <p className="detail-value">{studentCourse}</p>
            </div>

            <div className="academic-item">
              <p className="detail-label">Current Year</p>

              <p className="detail-value">{studentYear}</p>
            </div>

            <div className="academic-item">
              <p className="detail-label">Current Semester</p>

              <p className="detail-value">{studentSemester}</p>
            </div>

            <div className="academic-item">
              <p className="detail-label">Account Status</p>

              <p
                className={`detail-value ${
                  isActive ? "detail-active" : "detail-inactive"
                }`}
              >
                {studentStatus}
              </p>
            </div>
          </div>
        </div>

        {/* =========================================
            OVERALL LEARNING PROGRESS
        ========================================= */}

        <div className="details-card">
          <div className="progress-heading">
            <div>
              <h2 className="card-title">Learning Progress</h2>

              <p className="card-subtitle">
                Overall completion across subjects
              </p>
            </div>

            <div className="overall-percentage">{overallPercentage}%</div>
          </div>

          <div className="progress-bar-large">
            <div
              className="progress-fill"
              style={{
                width: `${overallPercentage}%`,
              }}
            />
          </div>

          <p className="progress-summary">
            {completedUnits} of {totalUnits} units completed
          </p>
        </div>

        {/* =========================================
            SUBJECT PROGRESS
        ========================================= */}

        <div className="details-card">
          <h2 className="card-title">Subject Progress</h2>

          <p className="card-subtitle">Unit completion for each subject</p>

          {subjectList.length === 0 ? (
            <div className="empty-progress">
              <FaBook />

              <p>No subjects available.</p>
            </div>
          ) : (
            <div className="subjects-list">
              {subjectList.map((subject) => (
                <div className="subject-progress-card" key={subject._id}>
                  {/* SUBJECT HEADER */}

                  <div className="subject-progress-header">
                    <div className="subject-title-wrapper">
                      <h3>{subject.name}</h3>

                      {subject.code && <span>{subject.code}</span>}
                    </div>

                    <strong>{subject.percentage}%</strong>
                  </div>

                  {/* PROGRESS BAR */}

                  <div className="subject-progress-bar">
                    <div
                      className="subject-progress-fill"
                      style={{
                        width: `${subject.percentage}%`,
                      }}
                    />
                  </div>

                  {/* UNIT SUMMARY */}

                  <div className="unit-summary">
                    <span>
                      {subject.completedUnits} / {subject.totalUnits} Units
                      Completed
                    </span>

                    <span>
                      {subject.totalUnits === 0
                        ? "No units"
                        : subject.percentage === 100
                          ? "Completed"
                          : "In Progress"}
                    </span>
                  </div>

                  {/* UNIT LIST */}

                  {subject.units?.length > 0 && (
                    <div className="unit-list">
                      {subject.units.map((unit, index) => (
                        <div className="unit-row" key={unit._id}>
                          <div className="unit-left">
                            {unit.completed ? (
                              <FaCheckCircle className="unit-completed-icon" />
                            ) : (
                              <FaCircle className="unit-pending-icon" />
                            )}

                            <div>
                              <p className="unit-name">
                                {unit.name || `Unit ${index + 1}`}
                              </p>

                              {unit.topics?.length > 0 && (
                                <p className="topic-count">
                                  {unit.topics.length}{" "}
                                  {unit.topics.length === 1
                                    ? "Topic"
                                    : "Topics"}
                                </p>
                              )}
                            </div>
                          </div>

                          <span
                            className={
                              unit.completed ? "completed-text" : "pending-text"
                            }
                          >
                            {unit.completed ? "Completed" : "Pending"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// =====================================================
// CSS
// =====================================================

const stylesCSS = `

* {
  box-sizing: border-box;
}

/* ==========================================
   PAGE
========================================== */

.student-details-page {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: 30px;
}

/* ==========================================
   BACK BUTTON
========================================== */

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;

  background: transparent;
  border: none;

  color: #94A3B8;

  cursor: pointer;

  font-size: 12px;

  padding: 0;

  margin-bottom: 22px;

  transition: color 0.2s ease;
}

.back-button:hover {
  color: #FFFFFF;
}

/* ==========================================
   HEADER
========================================== */

.student-header {
  display: flex;
  align-items: center;

  gap: 15px;

  margin-bottom: 25px;

  min-width: 0;
}

.profile-icon {
  width: 55px;
  height: 55px;

  border-radius: 14px;

  background: #312E81;
  color: #A78BFA;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 22px;
  font-weight: 700;

  flex-shrink: 0;
}

.header-info {
  min-width: 0;
  flex: 1;
}

.student-title {
  color: #FFFFFF;

  font-size: 25px;

  margin: 0;

  line-height: 1.3;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.student-id {
  color: #64748B;

  font-size: 12px;

  margin: 5px 0 0;

  word-break: break-all;
}

.status-badge {
  padding: 6px 10px;

  border-radius: 6px;

  font-size: 10px;

  font-weight: 700;

  flex-shrink: 0;
}

.status-active {
  background: #064E3B;
  color: #6EE7B7;
}

.status-inactive {
  background: #450A0A;
  color: #FCA5A5;
}

/* ==========================================
   BASIC INFORMATION
========================================== */

.info-grid {
  display: grid;

  grid-template-columns:
    repeat(4, 1fr);

  gap: 15px;

  margin-bottom: 20px;
}

.info-card {
  background: #0F172A;

  border: 1px solid #1E293B;

  border-radius: 14px;

  padding: 16px;

  display: flex;

  align-items: center;

  gap: 12px;

  min-width: 0;
}

.info-icon {
  width: 36px;
  height: 36px;

  border-radius: 9px;

  background: #312E81;
  color: #A78BFA;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 13px;

  flex-shrink: 0;
}

.info-content {
  min-width: 0;
}

.info-label {
  color: #64748B;

  font-size: 10px;

  margin: 0;
}

.info-value {
  color: #CBD5E1;

  font-size: 12px;

  font-weight: 600;

  margin: 4px 0 0;

  overflow: hidden;

  text-overflow: ellipsis;

  white-space: nowrap;
}

/* ==========================================
   CARDS
========================================== */

.details-card {
  background: #0F172A;

  border: 1px solid #1E293B;

  border-radius: 16px;

  padding: 20px;

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

  margin: 5px 0 20px;
}

/* ==========================================
   ACADEMIC
========================================== */

.academic-grid {
  display: grid;

  grid-template-columns:
    repeat(5, 1fr);

  gap: 15px;

  border-top: 1px solid #1E293B;

  padding-top: 20px;
}

.academic-item {
  min-width: 0;
}

.detail-label {
  color: #64748B;

  font-size: 10px;

  margin: 0;
}

.detail-value {
  color: #CBD5E1;

  font-size: 13px;

  margin: 5px 0 0;

  word-break: break-word;
}

.detail-active {
  color: #6EE7B7;
  font-weight: 600;
}

.detail-inactive {
  color: #FCA5A5;
  font-weight: 600;
}

/* ==========================================
   OVERALL PROGRESS
========================================== */

.progress-heading {
  display: flex;

  align-items: flex-start;

  justify-content: space-between;

  gap: 20px;
}

.overall-percentage {
  color: #A78BFA;

  font-size: 25px;

  font-weight: 700;
}

.progress-bar-large {
  width: 100%;

  height: 10px;

  background: #020617;

  border-radius: 999px;

  overflow: hidden;

  margin-top: 5px;
}

.progress-fill {
  height: 100%;

  background: #8B5CF6;

  border-radius: 999px;

  transition: width 0.3s ease;
}

.progress-summary {
  color: #64748B;

  font-size: 11px;

  margin: 9px 0 0;
}

/* ==========================================
   SUBJECT PROGRESS
========================================== */

.subjects-list {
  display: flex;

  flex-direction: column;

  gap: 14px;
}

.subject-progress-card {
  background: #020617;

  border: 1px solid #1E293B;

  border-radius: 12px;

  padding: 16px;
}

.subject-progress-header {
  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 15px;

  margin-bottom: 10px;
}

.subject-title-wrapper {
  min-width: 0;
}

.subject-title-wrapper h3 {
  color: #FFFFFF;

  font-size: 14px;

  margin: 0;

  word-break: break-word;
}

.subject-title-wrapper span {
  display: inline-block;

  color: #64748B;

  font-size: 9px;

  margin-top: 4px;

  text-transform: uppercase;
}

.subject-progress-header strong {
  color: #A78BFA;

  font-size: 14px;

  flex-shrink: 0;
}

/* ==========================================
   SUBJECT PROGRESS BAR
========================================== */

.subject-progress-bar {
  width: 100%;

  height: 7px;

  background: #1E293B;

  border-radius: 999px;

  overflow: hidden;
}

.subject-progress-fill {
  height: 100%;

  background: #8B5CF6;

  border-radius: 999px;

  transition: width 0.3s ease;
}

/* ==========================================
   UNIT SUMMARY
========================================== */

.unit-summary {
  display: flex;

  justify-content: space-between;

  align-items: center;

  gap: 10px;

  margin-top: 9px;

  color: #64748B;

  font-size: 10px;
}

/* ==========================================
   UNIT LIST
========================================== */

.unit-list {
  border-top: 1px solid #1E293B;

  margin-top: 14px;

  padding-top: 5px;
}

.unit-row {
  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 12px;

  padding: 10px 0;

  border-bottom: 1px solid #1E293B;
}

.unit-row:last-child {
  border-bottom: none;
}

.unit-left {
  display: flex;

  align-items: center;

  gap: 10px;

  min-width: 0;
}

.unit-completed-icon {
  color: #6EE7B7;

  font-size: 13px;

  flex-shrink: 0;
}

.unit-pending-icon {
  color: #475569;

  font-size: 9px;

  flex-shrink: 0;
}

.unit-name {
  color: #CBD5E1;

  font-size: 11px;

  margin: 0;

  word-break: break-word;
}

.topic-count {
  color: #475569;

  font-size: 9px;

  margin: 3px 0 0;
}

.completed-text {
  color: #6EE7B7;

  font-size: 9px;

  font-weight: 600;

  flex-shrink: 0;
}

.pending-text {
  color: #64748B;

  font-size: 9px;

  flex-shrink: 0;
}

/* ==========================================
   EMPTY
========================================== */

.empty-progress {
  min-height: 150px;

  display: flex;

  flex-direction: column;

  align-items: center;

  justify-content: center;

  color: #475569;

  text-align: center;
}

.empty-progress svg {
  font-size: 25px;

  margin-bottom: 10px;
}

.empty-progress p {
  font-size: 11px;

  margin: 0;
}

/* ==========================================
   LOADING / ERROR
========================================== */

.student-details-center {
  width: 100%;

  min-height: 400px;

  display: flex;

  flex-direction: column;

  align-items: center;

  justify-content: center;

  text-align: center;

  padding: 20px;
}

.loading-icon,
.error-icon {
  width: 50px;
  height: 50px;

  border-radius: 12px;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 20px;

  margin-bottom: 15px;
}

.loading-icon {
  background: #312E81;
  color: #A78BFA;
}

.error-icon {
  background: #450A0A;
  color: #FCA5A5;

  font-size: 22px;

  font-weight: 700;
}

.loading-title,
.error-title {
  color: #FFFFFF;

  font-size: 18px;

  margin: 0;
}

.loading-text {
  color: #64748B;

  font-size: 12px;

  margin-top: 7px;
}

.error-text {
  color: #FCA5A5;

  font-size: 12px;

  max-width: 450px;

  line-height: 1.6;

  margin: 8px 0 20px;
}

.error-back-button {
  margin-bottom: 0;
}

/* ==========================================
   TABLET
========================================== */

@media (max-width: 1000px) {

  .info-grid {
    grid-template-columns:
      repeat(2, 1fr);
  }

  .academic-grid {
    grid-template-columns:
      repeat(3, 1fr);
  }
}

/* ==========================================
   MOBILE
========================================== */

@media (max-width: 768px) {

  .student-details-page {
    width: 100%;

    padding: 0 0 20px;
  }

  .back-button {
    min-height: 40px;

    font-size: 12px;

    margin-bottom: 18px;
  }

  .student-header {
    align-items: flex-start;

    flex-wrap: wrap;

    gap: 12px;

    margin-bottom: 20px;
  }

  .profile-icon {
    width: 48px;
    height: 48px;

    border-radius: 12px;

    font-size: 19px;
  }

  .header-info {
    flex: 1;

    min-width: 0;

    padding-right: 4px;
  }

  .student-title {
    font-size: 20px;

    white-space: normal;

    word-break: break-word;

    line-height: 1.3;
  }

  .student-id {
    font-size: 9px;

    line-height: 1.5;
  }

  .status-badge {
    margin-left: 60px;

    margin-top: -4px;

    padding: 6px 9px;
  }

  /* INFO */

  .info-grid {
    grid-template-columns: 1fr;

    gap: 10px;

    margin-bottom: 15px;
  }

  .info-card {
    padding: 14px;

    border-radius: 12px;
  }

  .info-icon {
    width: 38px;
    height: 38px;
  }

  .info-value {
    font-size: 12px;

    white-space: normal;

    word-break: break-word;
  }

  /* CARDS */

  .details-card {
    padding: 15px;

    border-radius: 14px;

    margin-bottom: 15px;
  }

  .card-title {
    font-size: 16px;
  }

  .card-subtitle {
    font-size: 10px;

    line-height: 1.5;

    margin-bottom: 15px;
  }

  /* ACADEMIC */

  .academic-grid {
    grid-template-columns: 1fr 1fr;

    gap: 10px;

    padding-top: 15px;
  }

  .academic-item {
    background: #020617;

    border: 1px solid #1E293B;

    border-radius: 9px;

    padding: 11px;

    min-width: 0;
  }

  .detail-label {
    font-size: 9px;
  }

  .detail-value {
    font-size: 11px;

    margin-top: 5px;
  }

  /* PROGRESS */

  .overall-percentage {
    font-size: 21px;
  }

  .subject-progress-card {
    padding: 13px;
  }

  .subject-progress-header {
    align-items: flex-start;
  }

  .unit-summary {
    flex-direction: column;

    align-items: flex-start;

    gap: 4px;
  }

  .unit-row {
    align-items: flex-start;
  }

  /* CENTER */

  .student-details-center {
    min-height: 300px;
  }
}

/* ==========================================
   SMALL PHONE
========================================== */

@media (max-width: 400px) {

  .student-title {
    font-size: 18px;
  }

  .student-header {
    gap: 10px;
  }

  .profile-icon {
    width: 44px;
    height: 44px;

    font-size: 17px;
  }

  .status-badge {
    margin-left: 54px;

    font-size: 9px;
  }

  .academic-grid {
    grid-template-columns: 1fr;
  }

  .academic-item {
    padding: 10px;
  }

  .details-card {
    padding: 13px;
  }

  .overall-percentage {
    font-size: 19px;
  }
}

`;

export default StudentDetails;
