import { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaBook,
  FaFileAlt,
  FaSyncAlt,
  FaExclamationCircle,
  FaArrowRight,
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "../../context/useAuth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function SubjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [subject, setSubject] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // LOAD SUBJECT
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    const loadSubject = async () => {
      if (!id) {
        setError("Subject ID is missing.");
        setLoading(false);
        return;
      }

      try {
        await Promise.resolve();

        if (cancelled) return;

        setError("");

        const response = await fetch(`${API_URL}/api/student/subjects/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
        });

        let data = {};

        try {
          data = await response.json();
        } catch {
          throw new Error("Invalid response received from server.");
        }

        if (!response.ok) {
          throw new Error(data.message || "Unable to load subject.");
        }

        if (cancelled) return;

        /*
         * Support both possible backend formats:
         *
         * {
         *   subject: {...},
         *   notes: [...]
         * }
         *
         * OR
         *
         * {...subject data...}
         */

        const receivedSubject = data.subject || data.data || data;

        setSubject(receivedSubject);

        setNotes(
          Array.isArray(data.notes)
            ? data.notes
            : Array.isArray(receivedSubject.notes)
              ? receivedSubject.notes
              : [],
        );
      } catch (err) {
        if (cancelled) return;

        console.error("Subject Details Error:", err);

        setError(err.message || "Unable to load subject.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadSubject();

    return () => {
      cancelled = true;
    };
  }, [id, token]);

  // =========================================================
  // REFRESH
  // =========================================================

  const handleRefresh = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/student/subjects/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load subject.");
      }

      const receivedSubject = data.subject || data.data || data;

      setSubject(receivedSubject);

      setNotes(
        Array.isArray(data.notes)
          ? data.notes
          : Array.isArray(receivedSubject.notes)
            ? receivedSubject.notes
            : [],
      );

      toast.success("Subject refreshed");
    } catch (err) {
      console.error(err);

      setError(err.message || "Unable to load subject.");

      toast.error("Failed to refresh subject");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="subject-details-page">
        <div className="state-card">
          <div className="loading-icon">
            <FaSyncAlt />
          </div>

          <h2>Loading Subject...</h2>

          <p>Getting subject information.</p>
        </div>

        <style>{styles}</style>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error || !subject) {
    return (
      <div className="subject-details-page">
        <button className="back-button" onClick={() => navigate("/subjects")}>
          <FaArrowLeft />
          Back to Subjects
        </button>

        <div className="state-card error-state">
          <div className="error-icon">
            <FaExclamationCircle />
          </div>

          <h2>Unable to Load Subject</h2>

          <p>{error || "Subject was not found."}</p>

          <button className="retry-button" onClick={handleRefresh}>
            <FaSyncAlt />
            Try Again
          </button>
        </div>

        <style>{styles}</style>
      </div>
    );
  }

  // =========================================================
  // SUBJECT DATA
  // =========================================================

  const progress = Math.min(100, Math.max(0, Number(subject.progress || 0)));

  const completedUnits = Number(subject.completedUnits || 0);

  const totalUnits = Number(subject.units || 0);

  // =========================================================
  // MAIN
  // =========================================================

  return (
    <div className="subject-details-page">
      {/* ===================================================
          TOP BAR
      =================================================== */}

      <div className="top-bar">
        <button className="back-button" onClick={() => navigate("/subjects")}>
          <FaArrowLeft />
          <span>Back to Subjects</span>
        </button>

        <button className="refresh-button" onClick={handleRefresh}>
          <FaSyncAlt />
          <span>Refresh</span>
        </button>
      </div>

      {/* ===================================================
          SUBJECT HERO
      =================================================== */}

      <section className="subject-hero">
        <div className="hero-icon">
          <FaBook />
        </div>

        <div className="hero-content">
          <p className="page-label">SUBJECT</p>

          <h1>{subject.name || "Untitled Subject"}</h1>

          <p className="hero-code">{subject.code || "Subject"}</p>

          {subject.description && (
            <p className="hero-description">{subject.description}</p>
          )}
        </div>
      </section>

      {/* ===================================================
          INFORMATION
      =================================================== */}

      <section className="info-grid">
        {subject.course && (
          <div className="info-card">
            <span>Course</span>

            <strong>{subject.course}</strong>
          </div>
        )}

        {subject.year && (
          <div className="info-card">
            <span>Year</span>

            <strong>{subject.year}</strong>
          </div>
        )}

        {subject.semester && (
          <div className="info-card">
            <span>Semester</span>

            <strong>{subject.semester}</strong>
          </div>
        )}

        <div className="info-card">
          <span>Notes</span>

          <strong>{notes.length}</strong>
        </div>
      </section>

      {/* ===================================================
          PROGRESS
      =================================================== */}

      <section className="progress-card">
        <div className="section-header">
          <div>
            <p className="page-label">YOUR PROGRESS</p>

            <h2>Learning Progress</h2>
          </div>

          <strong className="progress-number">{progress}%</strong>
        </div>

        <div className="large-progress-track">
          <div
            className="large-progress-bar"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        <div className="progress-footer">
          <span>Overall learning progress</span>

          {totalUnits > 0 && (
            <span>
              {completedUnits} / {totalUnits} units
            </span>
          )}
        </div>
      </section>

      {/* ===================================================
          NOTES
      =================================================== */}

      <section className="notes-section">
        <div className="section-header">
          <div>
            <p className="page-label">STUDY MATERIAL</p>

            <h2>Subject Notes</h2>

            <p className="section-description">
              Access notes and study material for this subject.
            </p>
          </div>

          <button
            className="view-all-button"
            onClick={() => navigate(`/subjects/${id}/notes`)}
          >
            View All
            <FaArrowRight />
          </button>
        </div>

        {notes.length === 0 ? (
          <div className="empty-notes">
            <div className="empty-icon">
              <FaFileAlt />
            </div>

            <h3>No Notes Available</h3>

            <p>
              Notes for this subject will appear here when they are added by the
              administrator.
            </p>
          </div>
        ) : (
          <div className="notes-grid">
            {notes.slice(0, 6).map((note, index) => (
              <div className="note-card" key={note._id || note.id || index}>
                <div className="note-icon">
                  <FaFileAlt />
                </div>

                <div className="note-content">
                  <h3>{note.title || note.name || "Study Note"}</h3>

                  {note.description && <p>{note.description}</p>}
                </div>

                <button
                  className="note-arrow"
                  onClick={() => navigate(`/subjects/${id}/notes`)}
                >
                  <FaArrowRight />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <style>{styles}</style>
    </div>
  );
}

// ===========================================================
// STYLES
// ===========================================================

const styles = `

  .subject-details-page {
    width: 100%;
    min-width: 0;
    color: #ffffff;
  }


  /* ========================================================
     TOP BAR
  ======================================================== */

  .top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    margin-bottom: 24px;
  }

  .back-button {
    display: flex;
    align-items: center;
    gap: 8px;

    background: transparent;
    border: none;

    color: #94a3b8;

    cursor: pointer;

    font-size: 12px;
    font-weight: 600;

    padding: 8px 0;
  }

  .back-button:hover {
    color: #ffffff;
  }


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
  }

  .refresh-button:hover {
    background: #1e293b;
    color: #ffffff;
  }


  /* ========================================================
     HERO
  ======================================================== */

  .subject-hero {
    display: flex;
    align-items: flex-start;
    gap: 22px;

    padding: 28px;

    background: #0f172a;

    border: 1px solid #312e81;

    border-radius: 18px;

    margin-bottom: 18px;
  }

  .hero-icon {
    width: 64px;
    height: 64px;

    min-width: 64px;

    display: flex;
    align-items: center;
    justify-content: center;

    background: #312e81;

    color: #a78bfa;

    border-radius: 16px;

    font-size: 25px;
  }

  .hero-content {
    min-width: 0;
  }

  .page-label {
    color: #8b5cf6;

    font-size: 10px;

    font-weight: 700;

    letter-spacing: 1px;

    margin: 0 0 7px;
  }

  .hero-content h1 {
    color: #ffffff;

    font-size: 30px;

    line-height: 1.25;

    margin: 0;

    overflow-wrap: anywhere;
  }

  .hero-code {
    color: #64748b;

    font-size: 11px;

    font-weight: 600;

    margin: 6px 0 0;

    text-transform: uppercase;
  }

  .hero-description {
    color: #94a3b8;

    font-size: 13px;

    line-height: 1.7;

    margin: 14px 0 0;

    max-width: 800px;
  }


  /* ========================================================
     INFO
  ======================================================== */

  .info-grid {
    display: grid;

    grid-template-columns:
      repeat(
        4,
        minmax(0, 1fr)
      );

    gap: 14px;

    margin-bottom: 18px;
  }

  .info-card {
    background: #0f172a;

    border: 1px solid #1e293b;

    border-radius: 14px;

    padding: 17px;
  }

  .info-card span {
    display: block;

    color: #64748b;

    font-size: 10px;

    margin-bottom: 7px;
  }

  .info-card strong {
    display: block;

    color: #cbd5e1;

    font-size: 13px;

    overflow-wrap: anywhere;
  }


  /* ========================================================
     PROGRESS
  ======================================================== */

  .progress-card {
    background: #0f172a;

    border: 1px solid #1e293b;

    border-radius: 16px;

    padding: 22px;

    margin-bottom: 18px;
  }

  .section-header {
    display: flex;

    align-items: flex-start;

    justify-content: space-between;

    gap: 15px;
  }

  .section-header h2 {
    color: #ffffff;

    font-size: 20px;

    margin: 0;
  }

  .progress-number {
    color: #a78bfa;

    font-size: 22px;
  }

  .large-progress-track {
    width: 100%;

    height: 10px;

    background: #334155;

    border-radius: 20px;

    overflow: hidden;

    margin-top: 20px;
  }

  .large-progress-bar {
    height: 100%;

    background: #8b5cf6;

    border-radius: 20px;

    transition: width 0.4s ease;
  }

  .progress-footer {
    display: flex;

    align-items: center;

    justify-content: space-between;

    gap: 10px;

    margin-top: 10px;
  }

  .progress-footer span {
    color: #64748b;

    font-size: 10px;
  }


  /* ========================================================
     NOTES
  ======================================================== */

  .notes-section {
    background: #0f172a;

    border: 1px solid #1e293b;

    border-radius: 16px;

    padding: 22px;
  }

  .section-description {
    color: #64748b;

    font-size: 11px;

    margin: 6px 0 0;
  }

  .view-all-button {
    display: flex;

    align-items: center;

    gap: 7px;

    background: transparent;

    border: none;

    color: #a78bfa;

    cursor: pointer;

    font-size: 11px;

    font-weight: 600;
  }

  .view-all-button:hover {
    color: #ffffff;
  }

  .notes-grid {
    display: grid;

    grid-template-columns:
      repeat(
        2,
        minmax(0, 1fr)
      );

    gap: 12px;

    margin-top: 20px;
  }

  .note-card {
    display: flex;

    align-items: center;

    gap: 12px;

    background: #020617;

    border: 1px solid #1e293b;

    border-radius: 12px;

    padding: 14px;
  }

  .note-icon {
    width: 42px;
    height: 42px;

    min-width: 42px;

    display: flex;

    align-items: center;

    justify-content: center;

    background: #312e81;

    color: #a78bfa;

    border-radius: 10px;
  }

  .note-content {
    flex: 1;

    min-width: 0;
  }

  .note-content h3 {
    color: #e2e8f0;

    font-size: 12px;

    margin: 0;

    overflow-wrap: anywhere;
  }

  .note-content p {
    color: #64748b;

    font-size: 10px;

    margin: 5px 0 0;

    overflow: hidden;

    text-overflow: ellipsis;

    white-space: nowrap;
  }

  .note-arrow {
    width: 32px;
    height: 32px;

    min-width: 32px;

    display: flex;

    align-items: center;

    justify-content: center;

    background: #1e293b;

    border: none;

    border-radius: 8px;

    color: #94a3b8;

    cursor: pointer;
  }

  .note-arrow:hover {
    background: #334155;

    color: #ffffff;
  }


  /* ========================================================
     EMPTY
  ======================================================== */

  .empty-notes {
    min-height: 220px;

    display: flex;

    flex-direction: column;

    align-items: center;

    justify-content: center;

    text-align: center;

    margin-top: 15px;
  }

  .empty-icon {
    color: #475569;

    font-size: 35px;
  }

  .empty-notes h3 {
    color: #cbd5e1;

    font-size: 15px;

    margin: 12px 0 5px;
  }

  .empty-notes p {
    color: #64748b;

    max-width: 450px;

    font-size: 11px;

    line-height: 1.6;

    margin: 0;
  }


  /* ========================================================
     STATE
  ======================================================== */

  .state-card {
    min-height: 350px;

    display: flex;

    flex-direction: column;

    align-items: center;

    justify-content: center;

    text-align: center;

    background: #0f172a;

    border: 1px solid #1e293b;

    border-radius: 16px;

    padding: 30px;
  }

  .state-card h2 {
    color: #ffffff;

    font-size: 18px;

    margin: 14px 0 6px;
  }

  .state-card p {
    color: #64748b;

    font-size: 12px;

    line-height: 1.6;

    margin: 0;
  }

  .loading-icon {
    color: #8b5cf6;

    font-size: 30px;

    animation:
      subjectSpin 1s linear infinite;
  }

  .error-icon {
    color: #ef4444;

    font-size: 38px;
  }

  .retry-button {
    display: flex;

    align-items: center;

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


  @keyframes subjectSpin {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }


  /* ========================================================
     TABLET
  ======================================================== */

  @media (max-width: 900px) {

    .info-grid {
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

    .top-bar {
      margin-bottom: 16px;
    }

    .back-button {
      font-size: 11px;
    }

    .refresh-button {
      min-height: 42px;

      padding: 0 13px;
    }

    .subject-hero {
      padding: 20px;

      gap: 15px;

      border-radius: 15px;
    }

    .hero-icon {
      width: 50px;
      height: 50px;

      min-width: 50px;

      border-radius: 13px;

      font-size: 20px;
    }

    .hero-content h1 {
      font-size: 23px;
    }

    .hero-description {
      font-size: 12px;
    }

    .info-grid {
      grid-template-columns:
        repeat(
          2,
          minmax(0, 1fr)
        );

      gap: 10px;
    }

    .info-card {
      padding: 14px;
    }

    .progress-card,
    .notes-section {
      padding: 17px;

      border-radius: 14px;
    }

    .section-header h2 {
      font-size: 17px;
    }

    .notes-grid {
      grid-template-columns: 1fr;
    }

  }


  /* ========================================================
     SMALL PHONE
  ======================================================== */

  @media (max-width: 400px) {

    .top-bar {
      align-items: flex-start;
    }

    .back-button span {
      display: none;
    }

    .refresh-button span {
      display: none;
    }

    .subject-hero {
      padding: 17px;
    }

    .hero-icon {
      width: 44px;
      height: 44px;

      min-width: 44px;
    }

    .hero-content h1 {
      font-size: 20px;
    }

    .info-grid {
      grid-template-columns: 1fr;
    }

    .progress-footer {
      flex-direction: column;

      align-items: flex-start;
    }

  }

`;

export default SubjectDetails;
