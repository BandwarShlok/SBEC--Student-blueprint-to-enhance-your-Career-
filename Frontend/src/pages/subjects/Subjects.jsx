import { useEffect, useState } from "react";
import {
  FaBook,
  FaArrowRight,
  FaExclamationCircle,
  FaSyncAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "../../context/useAuth";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

function Subjects() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // LOAD SUBJECTS
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    const loadSubjects = async () => {
      try {
        /*
         * Wait until the async operation starts.
         * This avoids the React setState-in-effect warning.
         */
        await Promise.resolve();

        if (cancelled) return;

        setError("");

        const response = await fetch(
          `${API_URL}/api/student/subjects`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...(token
                ? {
                    Authorization: `Bearer ${token}`,
                  }
                : {}),
            },
          }
        );

        let data = {};

        try {
          data = await response.json();
        } catch {
          throw new Error(
            "Invalid response received from server."
          );
        }

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load subjects."
          );
        }

        if (cancelled) return;

        setSubjects(
          Array.isArray(data.subjects)
            ? data.subjects
            : []
        );
      } catch (err) {
        if (cancelled) return;

        console.error(
          "Subjects API Error:",
          err
        );

        setError(
          err.message ||
            "Unable to load subjects."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadSubjects();

    return () => {
      cancelled = true;
    };
  }, [token]);

  // =========================================================
  // REFRESH
  // =========================================================

  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/student/subjects`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load subjects."
        );
      }

      setSubjects(
        Array.isArray(data.subjects)
          ? data.subjects
          : []
      );

      toast.success(
        "Subjects refreshed"
      );
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to load subjects."
      );

      toast.error(
        "Failed to refresh subjects"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // OPEN SUBJECT
  // =========================================================

  const openSubject = (id) => {
    if (!id) {
      toast.error(
        "Subject ID is missing."
      );
      return;
    }

    navigate(`/subjects/${id}`);
  };

  // =========================================================
  // LOADING UI
  // =========================================================

  if (loading) {
    return (
      <div className="subjects-page">
        <div className="page-header">
          <div>
            <p className="page-label">
              LEARNING
            </p>

            <h1 className="page-title">
              My Subjects
            </h1>

            <p className="page-description">
              Manage your subjects and track
              your learning progress.
            </p>
          </div>
        </div>

        <div className="state-card">
          <div className="loading-icon">
            <FaSyncAlt />
          </div>

          <h2>
            Loading Subjects...
          </h2>

          <p>
            Getting your subjects from SBEC.
          </p>
        </div>

        <style>{styles}</style>
      </div>
    );
  }

  // =========================================================
  // ERROR UI
  // =========================================================

  if (error) {
    return (
      <div className="subjects-page">
        <div className="page-header">
          <div>
            <p className="page-label">
              LEARNING
            </p>

            <h1 className="page-title">
              My Subjects
            </h1>

            <p className="page-description">
              Manage your subjects and track
              your learning progress.
            </p>
          </div>

          <button
            className="refresh-button"
            onClick={handleRefresh}
          >
            <FaSyncAlt />
            Refresh
          </button>
        </div>

        <div className="state-card error-state">
          <div className="error-icon">
            <FaExclamationCircle />
          </div>

          <h2>
            Unable to Load Subjects
          </h2>

          <p>{error}</p>

          <button
            className="retry-button"
            onClick={handleRefresh}
          >
            <FaSyncAlt />
            Try Again
          </button>
        </div>

        <style>{styles}</style>
      </div>
    );
  }

  // =========================================================
  // MAIN PAGE
  // =========================================================

  return (
    <div className="subjects-page">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="page-header">

        <div>
          <p className="page-label">
            LEARNING
          </p>

          <h1 className="page-title">
            My Subjects
          </h1>

          <p className="page-description">
            Manage your subjects and track
            your learning progress.
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={handleRefresh}
        >
          <FaSyncAlt />
          Refresh
        </button>

      </div>


      {/* ===================================================
          SUBJECT COUNT
      =================================================== */}

      <div className="subject-count">
        {subjects.length}{" "}
        {subjects.length === 1
          ? "Subject"
          : "Subjects"}
      </div>


      {/* ===================================================
          EMPTY STATE
      =================================================== */}

      {subjects.length === 0 ? (

        <div className="state-card">

          <div className="empty-icon">
            <FaBook />
          </div>

          <h2>
            No Subjects Available
          </h2>

          <p>
            Subjects added by the administrator
            will appear here.
          </p>

          <button
            className="retry-button"
            onClick={handleRefresh}
          >
            <FaSyncAlt />
            Refresh
          </button>

        </div>

      ) : (

        /* =================================================
           SUBJECT GRID
        ================================================= */

        <div className="subjects-grid">

          {subjects.map((subject) => {

            const progress = Math.min(
              100,
              Math.max(
                0,
                Number(
                  subject.progress || 0
                )
              )
            );

            const completedUnits =
              Number(
                subject.completedUnits || 0
              );

            const totalUnits =
              Number(
                subject.units || 0
              );

            return (

              <div
                className="subject-card"
                key={
                  subject._id ||
                  subject.id
                }
              >

                {/* =============================
                    SUBJECT TOP
                ============================= */}

                <div className="subject-top">

                  <div className="subject-icon">
                    <FaBook />
                  </div>

                  <div className="subject-heading">

                    <h2>
                      {subject.name ||
                        "Untitled Subject"}
                    </h2>

                    <p>
                      {subject.code ||
                        "SUBJECT"}
                    </p>

                  </div>

                </div>


                {/* =============================
                    DESCRIPTION
                ============================= */}

                {subject.description && (
                  <p className="subject-description">
                    {subject.description}
                  </p>
                )}


                {/* =============================
                    META
                ============================= */}

                <div className="subject-meta">

                  {subject.course && (
                    <span>
                      {subject.course}
                    </span>
                  )}

                  {subject.year && (
                    <span>
                      Year {subject.year}
                    </span>
                  )}

                  {subject.semester && (
                    <span>
                      Semester{" "}
                      {subject.semester}
                    </span>
                  )}

                </div>


                {/* =============================
                    PROGRESS
                ============================= */}

                <div className="progress-area">

                  <div className="progress-header">

                    <span>
                      Learning Progress
                    </span>

                    <strong>
                      {progress}%
                    </strong>

                  </div>

                  <div className="progress-track">

                    <div
                      className="progress-bar"
                      style={{
                        width:
                          `${progress}%`,
                      }}
                    />

                  </div>

                </div>


                {/* =============================
                    UNITS
                ============================= */}

                {totalUnits > 0 && (

                  <p className="units-text">
                    {completedUnits} of{" "}
                    {totalUnits} units completed
                  </p>

                )}


                {/* =============================
                    OPEN BUTTON
                ============================= */}

                <button
                  className="open-button"
                  onClick={() =>
                    openSubject(
                      subject._id ||
                      subject.id
                    )
                  }
                >

                  <span>
                    Open Subject
                  </span>

                  <FaArrowRight />

                </button>

              </div>

            );
          })}

        </div>

      )}


      <style>{styles}</style>

    </div>
  );
}


// ===========================================================
// STYLES
// ===========================================================

const styles = `

  /* ========================================================
     PAGE
  ======================================================== */

  .subjects-page {
    width: 100%;
    min-width: 0;
    color: #ffffff;
  }


  /* ========================================================
     HEADER
  ======================================================== */

  .page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 25px;
    margin-bottom: 25px;
  }

  .page-label {
    color: #8b5cf6;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1px;
    margin: 0 0 7px;
  }

  .page-title {
    color: #ffffff;
    font-size: 32px;
    line-height: 1.2;
    font-weight: 700;
    margin: 0;
  }

  .page-description {
    color: #94a3b8;
    font-size: 14px;
    line-height: 1.6;
    margin: 9px 0 0;
  }


  /* ========================================================
     REFRESH
  ======================================================== */

  .refresh-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 9px;

    min-height: 42px;

    padding: 0 17px;

    background: #0f172a;

    color: #cbd5e1;

    border: 1px solid #1e293b;

    border-radius: 10px;

    cursor: pointer;

    font-size: 12px;
    font-weight: 600;

    transition: 0.2s ease;

    flex-shrink: 0;
  }

  .refresh-button:hover {
    background: #1e293b;
    border-color: #334155;
    color: #ffffff;
  }


  /* ========================================================
     COUNT
  ======================================================== */

  .subject-count {
    color: #64748b;
    font-size: 12px;
    margin-bottom: 14px;
  }


  /* ========================================================
     GRID
  ======================================================== */

  .subjects-grid {
    width: 100%;

    display: grid;

    grid-template-columns:
      repeat(
        auto-fit,
        minmax(280px, 1fr)
      );

    gap: 18px;
  }


  /* ========================================================
     SUBJECT CARD
  ======================================================== */

  .subject-card {
    min-width: 0;

    background: #0f172a;

    border: 1px solid #1e293b;

    border-radius: 16px;

    padding: 21px;

    transition:
      transform 0.2s ease,
      border-color 0.2s ease;
  }

  .subject-card:hover {
    transform: translateY(-2px);

    border-color: #334155;
  }


  /* ========================================================
     SUBJECT TOP
  ======================================================== */

  .subject-top {
    display: flex;
    align-items: center;
    gap: 13px;
  }

  .subject-icon {
    width: 46px;
    height: 46px;

    min-width: 46px;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 12px;

    background: #312e81;

    color: #a78bfa;

    font-size: 18px;
  }

  .subject-heading {
    min-width: 0;
  }

  .subject-heading h2 {
    color: #ffffff;

    font-size: 16px;

    line-height: 1.35;

    margin: 0;

    overflow-wrap: anywhere;
  }

  .subject-heading p {
    color: #64748b;

    font-size: 10px;

    font-weight: 600;

    margin: 5px 0 0;

    text-transform: uppercase;

    letter-spacing: 0.5px;
  }


  /* ========================================================
     DESCRIPTION
  ======================================================== */

  .subject-description {
    color: #94a3b8;

    font-size: 12px;

    line-height: 1.6;

    margin: 17px 0 0;

    display: -webkit-box;

    -webkit-line-clamp: 3;

    -webkit-box-orient: vertical;

    overflow: hidden;

    overflow-wrap: anywhere;
  }


  /* ========================================================
     META
  ======================================================== */

  .subject-meta {
    display: flex;

    flex-wrap: wrap;

    gap: 6px;

    margin-top: 13px;
  }

  .subject-meta span {
    color: #64748b;

    background: #020617;

    border: 1px solid #1e293b;

    border-radius: 6px;

    padding: 5px 7px;

    font-size: 9px;
  }


  /* ========================================================
     PROGRESS
  ======================================================== */

  .progress-area {
    margin-top: 21px;
  }

  .progress-header {
    display: flex;

    align-items: center;

    justify-content: space-between;

    margin-bottom: 8px;
  }

  .progress-header span {
    color: #94a3b8;

    font-size: 11px;
  }

  .progress-header strong {
    color: #a78bfa;

    font-size: 12px;
  }

  .progress-track {
    width: 100%;

    height: 7px;

    background: #334155;

    border-radius: 20px;

    overflow: hidden;
  }

  .progress-bar {
    height: 100%;

    background: #8b5cf6;

    border-radius: 20px;

    transition: width 0.4s ease;
  }


  /* ========================================================
     UNITS
  ======================================================== */

  .units-text {
    color: #64748b;

    font-size: 10px;

    margin: 10px 0 0;
  }


  /* ========================================================
     OPEN BUTTON
  ======================================================== */

  .open-button {
    width: 100%;

    min-height: 42px;

    margin-top: 18px;

    display: flex;

    align-items: center;

    justify-content: center;

    gap: 8px;

    background: #1e293b;

    border: 1px solid #334155;

    border-radius: 9px;

    color: #cbd5e1;

    cursor: pointer;

    font-size: 12px;

    font-weight: 600;

    transition: 0.2s ease;
  }

  .open-button:hover {
    background: #334155;

    color: #ffffff;
  }

  .open-button svg {
    font-size: 10px;
  }


  /* ========================================================
     LOADING / EMPTY / ERROR CARD
  ======================================================== */

  .state-card {
    min-height: 340px;

    width: 100%;

    box-sizing: border-box;

    display: flex;

    flex-direction: column;

    align-items: center;

    justify-content: center;

    text-align: center;

    background: #0f172a;

    border: 1px solid #1e293b;

    border-radius: 16px;

    padding: 30px 20px;
  }

  .state-card h2 {
    color: #ffffff;

    font-size: 18px;

    margin: 14px 0 6px;
  }

  .state-card p {
    max-width: 500px;

    color: #64748b;

    font-size: 13px;

    line-height: 1.6;

    margin: 0;
  }


  /* ========================================================
     LOADING
  ======================================================== */

  .loading-icon {
    color: #8b5cf6;

    font-size: 30px;

    animation:
      subjectsSpin 1s linear infinite;
  }


  @keyframes subjectsSpin {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }


  /* ========================================================
     EMPTY
  ======================================================== */

  .empty-icon {
    color: #475569;

    font-size: 40px;
  }


  /* ========================================================
     ERROR
  ======================================================== */

  .error-icon {
    color: #ef4444;

    font-size: 38px;
  }


  /* ========================================================
     RETRY
  ======================================================== */

  .retry-button {
    display: flex;

    align-items: center;

    justify-content: center;

    gap: 8px;

    margin-top: 18px;

    min-height: 40px;

    padding: 0 16px;

    background: #8b5cf6;

    border: none;

    border-radius: 9px;

    color: #ffffff;

    cursor: pointer;

    font-size: 12px;

    font-weight: 600;
  }

  .retry-button:hover {
    background: #7c3aed;
  }


  /* ========================================================
     TABLET
  ======================================================== */

  @media (max-width: 900px) {

    .subjects-grid {
      grid-template-columns:
        repeat(
          2,
          minmax(0, 1fr)
        );
    }

  }


  /* ========================================================
     MOBILE
  ======================================================== */

  @media (max-width: 768px) {

    .page-header {
      display: flex;

      flex-direction: column;

      gap: 16px;

      margin-bottom: 22px;
    }

    .page-title {
      font-size: 27px;
    }

    .page-description {
      font-size: 13px;
    }

    .refresh-button {
      width: 100%;

      min-height: 48px;

      font-size: 13px;
    }

    .subjects-grid {
      grid-template-columns: 1fr;

      gap: 14px;
    }

    .subject-card {
      padding: 17px;

      border-radius: 14px;
    }

    .subject-card:hover {
      transform: none;
    }

    .subject-icon {
      width: 43px;
      height: 43px;

      min-width: 43px;

      border-radius: 11px;
    }

    .subject-heading h2 {
      font-size: 14px;
    }

    .subject-description {
      font-size: 11px;
    }

    .state-card {
      min-height: 300px;

      border-radius: 14px;
    }

  }


  /* ========================================================
     SMALL PHONE
  ======================================================== */

  @media (max-width: 400px) {

    .page-title {
      font-size: 24px;
    }

    .page-description {
      font-size: 12px;
    }

    .subject-card {
      padding: 15px;
    }

    .subject-icon {
      width: 40px;
      height: 40px;

      min-width: 40px;

      font-size: 16px;
    }

    .subject-heading h2 {
      font-size: 13px;
    }

  }

`;

export default Subjects;