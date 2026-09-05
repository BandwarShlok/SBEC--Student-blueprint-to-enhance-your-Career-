import { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaBook,
  FaFileAlt,
  FaSyncAlt,
  FaExclamationCircle,
  FaClipboardCheck,
  FaCheckCircle,
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "../../context/useAuth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function SubjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const authToken =
    token ||
    localStorage.getItem("sbec_token") ||
    localStorage.getItem("token");

  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [completedUnitIds, setCompletedUnitIds] = useState([]);
  const [progressLoading, setProgressLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadProgress = async () => {
      if (!id || !authToken) {
        setCompletedUnitIds([]);
        setProgressLoading(false);
        return;
      }

      try {
        setProgressLoading(true);

        const response = await fetch(
          `${API_URL}/api/student/progress/subject/${id}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load unit progress.");
        }

        if (!cancelled) {
          setCompletedUnitIds(
            Array.isArray(data.progress)
              ? data.progress.map((item) => String(item.unitId))
              : [],
          );
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Unit Progress Error:", err);
          setCompletedUnitIds([]);
        }
      } finally {
        if (!cancelled) setProgressLoading(false);
      }
    };

    loadProgress();

    return () => {
      cancelled = true;
    };
  }, [id, authToken]);

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
            ...(authToken
              ? {
                  Authorization: `Bearer ${authToken}`,
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
  }, [id, authToken]);

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
          ...(authToken
            ? {
                Authorization: `Bearer ${authToken}`,
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

  const units = Array.isArray(subject.units) ? subject.units : [];
  const totalUnits = units.length;

  const completedUnits = completedUnitIds.length;

  const progress =
    totalUnits === 0
      ? 0
      : Math.min(
          100,
          Math.max(0, Math.round((completedUnits / totalUnits) * 100)),
        );

  const handleToggleUnit = async (unit) => {
    const unitId = unit?._id || unit?.id;

    if (!unitId) {
      toast.error("Unit ID is missing.");
      return;
    }

    if (!authToken) {
      toast.error("Please login again.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/student/progress/subject/${id}/unit/${unitId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update unit progress.");
      }

      const normalizedId = String(unitId);

      setCompletedUnitIds((previous) => {
        if (data.completed) {
          return previous.includes(normalizedId)
            ? previous
            : [...previous, normalizedId];
        }
        return previous.filter((item) => String(item) !== normalizedId);
      });

      toast.success(
        data.completed
          ? "Unit completed successfully."
          : "Unit marked as incomplete.",
      );
    } catch (err) {
      console.error("Toggle Unit Error:", err);
      toast.error(err.message || "Unable to update unit progress.");
    }
  };

  const handleNotes = (unitId) => {
    navigate(`/subjects/${id}/notes?unit=${encodeURIComponent(unitId)}`);
  };

  const handleQuiz = (unit) => {
    const unitId = unit?._id || unit?.id;
    const unitName = unit?.name || unit?.title || "";

    if (!unitId) {
      toast.error("Unit ID is missing.");
      return;
    }

    if (!subject?.name || !unitName) {
      toast.error("Subject or unit information is missing.");
      return;
    }

    navigate(
      `/quiz?subject=${encodeURIComponent(
        subject.name,
      )}&unit=${encodeURIComponent(unitName)}`,
    );
  };

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
          <span>Units</span>

          <strong>{totalUnits}</strong>
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
          UNITS & TOPICS
      =================================================== */}

      <section className="units-section">
        <div className="section-header">
          <div>
            <p className="page-label">COURSE CONTENT</p>
            <h2>Units &amp; Topics</h2>
            <p className="section-description">
              Study each unit, view its topics, open notes, and take the
              unit-wise quiz.
            </p>
          </div>
        </div>

        {units.length === 0 ? (
          <div className="empty-units">
            <div className="empty-icon">
              <FaBook />
            </div>
            <h3>No Units Available</h3>
            <p>
              Units and topics will appear here when the administrator adds
              them.
            </p>
          </div>
        ) : (
          <div className="units-list">
            {units.map((unit, index) => {
              const unitId = unit?._id || unit?.id;
              const unitName = unit?.name || unit?.title || `Unit ${index + 1}`;
              const topics = Array.isArray(unit?.topics) ? unit.topics : [];
              const completed = completedUnitIds.includes(String(unitId));

              return (
                <article
                  className={`unit-card ${completed ? "unit-completed" : ""}`}
                  key={unitId || index}
                >
                  <div className="unit-number">
                    {completed ? <FaCheckCircle /> : index + 1}
                  </div>

                  <div className="unit-main">
                    <div className="unit-heading-row">
                      <div>
                        <p className="unit-label">UNIT {index + 1}</p>
                        <h3>{unitName}</h3>
                      </div>
                      <span
                        className={`unit-status ${completed ? "completed" : "pending"}`}
                      >
                        {completed ? "Completed" : "Not Completed"}
                      </span>
                    </div>

                    {unit.description && (
                      <p className="unit-description">{unit.description}</p>
                    )}

                    <div className="topics-block">
                      <div className="topics-title">
                        Topics ({topics.length})
                      </div>
                      {topics.length === 0 ? (
                        <p className="no-topics">
                          No topics added for this unit.
                        </p>
                      ) : (
                        <div className="topics-list">
                          {topics.map((topic, topicIndex) => (
                            <div
                              className="topic-item"
                              key={topic?._id || topicIndex}
                            >
                              <span>{topicIndex + 1}</span>
                              <strong>
                                {topic?.name ||
                                  topic?.title ||
                                  "Untitled Topic"}
                              </strong>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="unit-actions">
                      <button
                        className="unit-action secondary"
                        onClick={() => handleNotes(unitId)}
                        disabled={!unitId}
                      >
                        <FaFileAlt />
                        Notes
                      </button>

                      <button
                        className="unit-action primary"
                        onClick={() => handleQuiz(unitId)}
                        disabled={!unitId}
                      >
                        <FaClipboardCheck />
                        Unit Quiz
                      </button>

                      <button
                        className={`unit-action complete ${completed ? "done" : ""}`}
                        onClick={() => handleToggleUnit(unit)}
                        disabled={!unitId || progressLoading}
                      >
                        <FaCheckCircle />
                        {completed ? "Mark Incomplete" : "Mark Complete"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
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
     UNITS & TOPICS
  ======================================================== */

  .units-section {
    background: #0f172a;
    border: 1px solid #1e293b;
    border-radius: 16px;
    padding: 22px;
    margin-bottom: 18px;
  }

  .units-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-top: 20px;
  }

  .unit-card {
    display: flex;
    gap: 16px;
    padding: 18px;
    background: #020617;
    border: 1px solid #1e293b;
    border-radius: 14px;
    transition: border-color 0.2s ease, transform 0.2s ease;
  }

  .unit-card:hover {
    border-color: #4c1d95;
    transform: translateY(-1px);
  }

  .unit-card.unit-completed {
    border-color: #065f46;
  }

  .unit-number {
    width: 42px;
    height: 42px;
    min-width: 42px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    background: #312e81;
    color: #a78bfa;
    font-size: 14px;
    font-weight: 700;
  }

  .unit-completed .unit-number {
    background: #064e3b;
    color: #6ee7b7;
  }

  .unit-main { flex: 1; min-width: 0; }

  .unit-heading-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 15px;
  }

  .unit-label {
    color: #8b5cf6;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1px;
    margin: 0 0 5px;
  }

  .unit-heading-row h3 {
    color: #f8fafc;
    font-size: 17px;
    line-height: 1.4;
    margin: 0;
  }

  .unit-status {
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 10px;
    font-weight: 700;
    white-space: nowrap;
  }

  .unit-status.pending { background: #1e293b; color: #94a3b8; }
  .unit-status.completed { background: #064e3b; color: #6ee7b7; }

  .unit-description {
    color: #94a3b8;
    font-size: 11px;
    line-height: 1.6;
    margin: 9px 0 0;
  }

  .topics-block {
    margin-top: 15px;
    padding: 13px;
    background: #0f172a;
    border: 1px solid #1e293b;
    border-radius: 10px;
  }

  .topics-title {
    color: #cbd5e1;
    font-size: 11px;
    font-weight: 700;
    margin-bottom: 9px;
  }

  .topics-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 7px;
  }

  .topic-item {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    padding: 8px 9px;
    background: #020617;
    border: 1px solid #1e293b;
    border-radius: 8px;
  }

  .topic-item span {
    width: 20px;
    height: 20px;
    min-width: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    background: #312e81;
    color: #a78bfa;
    font-size: 9px;
    font-weight: 700;
  }

  .topic-item strong {
    min-width: 0;
    color: #cbd5e1;
    font-size: 10px;
    font-weight: 500;
    overflow-wrap: anywhere;
  }

  .no-topics { color: #64748b; font-size: 10px; margin: 0; }

  .unit-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 14px;
  }

  .unit-action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    min-height: 36px;
    padding: 0 12px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 10px;
    font-weight: 700;
    transition: 0.2s ease;
  }

  .unit-action:disabled { opacity: 0.5; cursor: not-allowed; }
  .unit-action.secondary { background: #1e293b; border: 1px solid #334155; color: #cbd5e1; }
  .unit-action.secondary:hover:not(:disabled) { background: #334155; color: #fff; }
  .unit-action.primary { background: #7c3aed; border: 1px solid #7c3aed; color: #fff; }
  .unit-action.primary:hover:not(:disabled) { background: #8b5cf6; }
  .unit-action.complete { background: #312e81; border: 1px solid #4338ca; color: #c4b5fd; }
  .unit-action.complete:hover:not(:disabled) { background: #4338ca; color: #fff; }
  .unit-action.complete.done { background: #064e3b; border-color: #047857; color: #6ee7b7; }

  .empty-units {
    min-height: 180px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    margin-top: 15px;
  }

  .empty-units h3 { color: #cbd5e1; font-size: 15px; margin: 12px 0 5px; }
  .empty-units p { color: #64748b; max-width: 450px; font-size: 11px; line-height: 1.6; margin: 0; }

  /* ========================================================
     EMPTY
  ======================================================== */

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

    .progress-card {
      padding: 17px;
      border-radius: 14px;
    }

    .section-header h2 {
      font-size: 17px;
    }

    .unit-heading-row {
      flex-direction: column;
      gap: 8px;
    }

    .topics-list {
      grid-template-columns: 1fr;
    }

    .unit-actions {
      flex-direction: column;
    }

    .unit-action {
      width: 100%;
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
