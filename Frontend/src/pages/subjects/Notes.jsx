import { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaBook,
  FaClipboardCheck,
  FaCheckCircle,
  FaExternalLinkAlt,
  FaFilePdf,
  FaSyncAlt,
} from "react-icons/fa";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import API_URL from "../../config/api";

const getToken = () =>
  localStorage.getItem("sbec_token") || localStorage.getItem("token") || "";

const getId = (item) => String(item?._id || item?.id || "");

const getUnitName = (unit) =>
  unit?.name || unit?.title || (unit?.number ? `Unit ${unit.number}` : "");

const getFileUrl = (url) => {
  if (!url) return "";

  const raw = String(url).trim();

  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw;
  }

  return `${String(API_URL).replace(/\/+$/, "")}/${raw.replace(/^\/+/, "")}`;
};

function Notes() {
  const navigate = useNavigate();
  const { id: subjectId } = useParams();
  const [searchParams] = useSearchParams();

  const requestedUnitId = searchParams.get("unit") || "";

  const [subject, setSubject] = useState(null);
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);

  const [completed, setCompleted] = useState(false);

  const [loading, setLoading] = useState(true);

  const [savingComplete, setSavingComplete] = useState(false);

  const [error, setError] = useState("");

  /*
  ========================================================
  LOAD NOTES AND UNIT PROGRESS
  ========================================================
  */

  useEffect(() => {
    let cancelled = false;

    const loadPage = async () => {
      try {
        setLoading(true);
        setError("");

        if (!subjectId) {
          throw new Error("Subject ID is missing.");
        }

        const token = getToken();

        if (!token) {
          throw new Error(
            "Student login session not found. Please login again.",
          );
        }

        /*
        ----------------------------------------------------
        LOAD NOTES
        ----------------------------------------------------
        */

        const response = await fetch(
          `${API_URL}/api/student/subjects/${subjectId}/notes`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        let data = {};

        try {
          data = await response.json();
        } catch {
          data = {};
        }

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("sbec_token");

          localStorage.removeItem("sbec_user");

          throw new Error(
            "Your login session has expired. Please login again.",
          );
        }

        if (!response.ok) {
          throw new Error(data?.message || "Failed to load notes.");
        }

        if (cancelled) return;

        const loadedSubject = data?.subject || null;

        const loadedNotes = Array.isArray(data?.notes) ? data.notes : [];

        /*
        ----------------------------------------------------
        FIND CURRENT UNIT
        ----------------------------------------------------
        */

        const units = Array.isArray(loadedSubject?.units)
          ? loadedSubject.units
          : [];

        const currentUnit =
          units.find((unit) => getId(unit) === String(requestedUnitId)) ||
          units.find(
            (unit) => String(unit?.name || "") === String(requestedUnitId),
          ) ||
          null;

        const currentUnitName = getUnitName(currentUnit);

        /*
        ----------------------------------------------------
        UNIT-WISE NOTE FILTER
        ----------------------------------------------------
        */

        let unitNotes = loadedNotes;

        if (requestedUnitId) {
          unitNotes = loadedNotes.filter((note) => {
            const noteUnit = note?.unit || note?.unitId || note?.unitName || "";

            /*
             * If this is the only note for the
             * subject and old data doesn't have
             * a unit field, allow it to display.
             */
            if (!noteUnit && loadedNotes.length === 1) {
              return true;
            }

            if (typeof noteUnit === "object") {
              return (
                getId(noteUnit) === String(requestedUnitId) ||
                String(noteUnit?.name || "") === String(currentUnitName)
              );
            }

            return (
              String(noteUnit) === String(requestedUnitId) ||
              String(noteUnit) === String(currentUnitName)
            );
          });
        }

        setSubject(loadedSubject);
        setNotes(unitNotes);
        setSelectedNote(unitNotes[0] || null);

        /*
        ----------------------------------------------------
        LOAD STUDENT PROGRESS
        ----------------------------------------------------
        */

        if (requestedUnitId) {
          try {
            const progressResponse = await fetch(
              `${API_URL}/api/student/progress`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
            );

            if (progressResponse.ok) {
              const progressData = await progressResponse.json();

              const rows = Array.isArray(progressData)
                ? progressData
                : Array.isArray(progressData?.progress)
                  ? progressData.progress
                  : Array.isArray(progressData?.data)
                    ? progressData.data
                    : [];

              const isCompleted = rows.some((row) => {
                const rowSubjectId =
                  typeof row?.subject === "object"
                    ? getId(row.subject)
                    : String(row?.subject || "");

                return (
                  rowSubjectId === String(subjectId) &&
                  String(row?.unitId || "") === String(requestedUnitId) &&
                  row?.completed !== false
                );
              });

              if (!cancelled) {
                setCompleted(isCompleted);
              }
            }
          } catch (progressError) {
            console.error("Progress load error:", progressError);
          }
        } else {
          setCompleted(false);
        }
      } catch (err) {
        console.error("Student Notes Error:", err);

        if (!cancelled) {
          setError(err?.message || "Failed to load notes.");

          setSubject(null);
          setNotes([]);
          setSelectedNote(null);
          setCompleted(false);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadPage();

    return () => {
      cancelled = true;
    };
  }, [subjectId, requestedUnitId]);

  /*
  ========================================================
  CURRENT UNIT
  ========================================================
  */

  const units = Array.isArray(subject?.units) ? subject.units : [];

  const selectedUnit =
    units.find((unit) => getId(unit) === String(requestedUnitId)) ||
    units.find(
      (unit) => String(unit?.name || "") === String(requestedUnitId),
    ) ||
    null;

  const selectedUnitName = getUnitName(selectedUnit);

  const subjectName = subject?.name || "Subject";

  /*
  ========================================================
  NOTE DATA
  ========================================================
  */

  const noteTitle = selectedNote?.title || "Study Notes";

  const noteDescription =
    selectedNote?.description ||
    `Study material for ${selectedUnitName || subjectName}.`;

  /*
   * THIS IS THE IMPORTANT FIX.
   * Actual content saved in MongoDB is
   * displayed here.
   */
  const noteContent = String(selectedNote?.content || "").trim();

  const fileUrl = getFileUrl(selectedNote?.fileUrl);

  const fileName = String(selectedNote?.fileName || "");

  const isPdf =
    fileName.toLowerCase().endsWith(".pdf") ||
    fileUrl.toLowerCase().includes(".pdf");

  /*
  ========================================================
  NAVIGATION
  ========================================================
  */

  const handleBack = () => {
    navigate(`/subjects/${subjectId}`);
  };

  const handleQuiz = () => {
    if (!subjectName || subjectName === "Subject") {
      toast.error("Subject information is not available.");
      return;
    }

    if (!selectedUnitName) {
      toast.error("Unit information is not available.");
      return;
    }

    navigate(
      `/quiz?subject=${encodeURIComponent(
        subjectName,
      )}&unit=${encodeURIComponent(selectedUnitName)}`,
    );
  };

  /*
  ========================================================
  COMPLETE / INCOMPLETE
  ========================================================
  */

  const handleComplete = async () => {
    if (!subjectId || !requestedUnitId) {
      toast.error("Open Notes from a specific unit first.");
      return;
    }

    const token = getToken();

    if (!token) {
      toast.error("Please login again.");
      return;
    }

    try {
      setSavingComplete(true);

      const response = await fetch(
        `${API_URL}/api/student/progress/subject/${subjectId}/unit/${requestedUnitId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("sbec_token");

        localStorage.removeItem("sbec_user");

        toast.error("Your login session has expired.");

        return;
      }

      if (!response.ok) {
        throw new Error(data?.message || "Unable to update unit progress.");
      }

      const newStatus =
        data?.completed === true || data?.progress?.completed === true;

      setCompleted(newStatus);

      toast.success(
        newStatus
          ? `${selectedUnitName || "Unit"} completed.`
          : `${selectedUnitName || "Unit"} marked incomplete.`,
      );
    } catch (err) {
      console.error("Complete Unit Error:", err);

      toast.error(err?.message || "Unable to update progress.");
    } finally {
      setSavingComplete(false);
    }
  };

  /*
  ========================================================
  LOADING
  ========================================================
  */

  if (loading) {
    return (
      <div className="notes-page">
        <div className="state-card">
          <div className="state-icon">
            <FaSyncAlt className="spin" />
          </div>

          <h2>Loading Notes</h2>

          <p>Fetching study material from the database...</p>
        </div>

        <style>{styles}</style>
      </div>
    );
  }

  /*
  ========================================================
  ERROR
  ========================================================
  */

  if (error) {
    return (
      <div className="notes-page">
        <div className="state-card">
          <div className="state-icon">
            <FaBook />
          </div>

          <h2>Unable to Load Notes</h2>

          <p>{error}</p>

          <button type="button" className="primary-button" onClick={handleBack}>
            <FaArrowLeft />
            Back to Subject
          </button>
        </div>

        <style>{styles}</style>
      </div>
    );
  }

  /*
  ========================================================
  NO NOTE
  ========================================================
  */

  if (!selectedNote) {
    return (
      <div className="notes-page">
        <div className="state-card">
          <div className="state-icon">
            <FaBook />
          </div>

          <h2>No Notes Available</h2>

          <p>
            No note has been added for {selectedUnitName || "this unit"} yet.
          </p>

          <button type="button" className="primary-button" onClick={handleBack}>
            <FaArrowLeft />
            Back to Subject
          </button>
        </div>

        <style>{styles}</style>
      </div>
    );
  }

  /*
  ========================================================
  MAIN PAGE
  ========================================================
  */

  return (
    <div className="notes-page">
      {/* TOP BAR */}

      <div className="top-bar">
        <button type="button" className="back-button" onClick={handleBack}>
          <FaArrowLeft />

          <span>Back to Subject</span>
        </button>

        <button type="button" className="quiz-button" onClick={handleQuiz}>
          <FaClipboardCheck />

          <span>Take Unit Quiz</span>
        </button>
      </div>

      {/* NOTE HEADER */}

      <div className="note-header">
        <div className="unit-label">
          {subjectName}

          {selectedUnitName && (
            <>
              <span>•</span>

              {selectedUnitName}
            </>
          )}
        </div>

        <h1>{noteTitle}</h1>

        <p>{noteDescription}</p>
      </div>

      {/* ACTUAL NOTE */}

      <section className="material-card">
        <div className="material-header">
          <div className="material-icon">
            {isPdf ? <FaFilePdf /> : <FaBook />}
          </div>

          <div className="material-info">
            <h2>{noteTitle}</h2>

            <p>
              {selectedUnitName
                ? `${selectedUnitName} study notes`
                : "Study notes"}
            </p>
          </div>

          {fileUrl && (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="open-button"
            >
              <FaExternalLinkAlt />
              Open File
            </a>
          )}
        </div>

        {/* =================================================
            ACTUAL MONGODB NOTE CONTENT
        ================================================= */}

        <article className="note-content">
          {noteContent || "No written content has been added to this note yet."}
        </article>

        {/* =================================================
            OPTIONAL PDF
        ================================================= */}

        {fileUrl && isPdf && (
          <div className="attached-file">
            <div className="attached-title">
              <FaFilePdf />

              <span>{fileName || "Attached PDF"}</span>
            </div>

            <div className="pdf-viewer">
              <iframe src={fileUrl} title={noteTitle} className="pdf-frame" />
            </div>
          </div>
        )}
      </section>

      {/* OTHER NOTES FOR SAME UNIT */}

      {notes.length > 1 && (
        <section className="other-notes">
          <span className="section-label">MORE NOTES</span>

          <h3>Notes for {selectedUnitName || "this unit"}</h3>

          <p>Select another note to continue studying.</p>

          <div className="notes-list">
            {notes.map((note, index) => {
              const noteId = getId(note) || `note-${index}`;

              return (
                <button
                  type="button"
                  key={noteId}
                  className={`note-item ${
                    getId(selectedNote) === noteId ? "active" : ""
                  }`}
                  onClick={() => setSelectedNote(note)}
                >
                  <FaBook />

                  <span>{note?.title || `Note ${index + 1}`}</span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* UNIT COMPLETION */}

      <section className={`completion-card ${completed ? "done" : ""}`}>
        <div className="completion-left">
          <div className="completion-icon">
            <FaCheckCircle />
          </div>

          <div>
            <h3>
              {completed
                ? `${selectedUnitName || "Unit"} Completed`
                : "Finished studying?"}
            </h3>

            <p>
              {completed
                ? "Your unit completion is saved."
                : "Mark this unit complete after studying the notes."}
            </p>
          </div>
        </div>

        <button
          type="button"
          className={`complete-button ${completed ? "done-button" : ""}`}
          onClick={handleComplete}
          disabled={savingComplete}
        >
          {savingComplete
            ? "Saving..."
            : completed
              ? "Mark Incomplete"
              : "Mark Complete"}
        </button>
      </section>

      <style>{styles}</style>
    </div>
  );
}

const styles = `
.notes-page{
  width:100%;
  max-width:1120px;
  margin:0 auto;
  padding:5px 0 35px;
  color:#fff;
  box-sizing:border-box;
  overflow-x:hidden;
}

.top-bar{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:15px;
  margin-bottom:28px;
}

.back-button{
  display:inline-flex;
  align-items:center;
  gap:9px;
  padding:9px 0;
  border:0;
  background:transparent;
  color:#94a3b8;
  font-size:13px;
  font-weight:600;
  cursor:pointer;
}

.back-button:hover{
  color:#fff;
}

.quiz-button,
.primary-button,
.open-button{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:8px;
  text-decoration:none;
  cursor:pointer;
  font-weight:700;
}

.quiz-button{
  min-height:42px;
  padding:10px 16px;
  border:1px solid #8b5cf6;
  border-radius:10px;
  background:#8b5cf6;
  color:#fff;
}

.quiz-button:hover{
  background:#7c3aed;
}

.note-header{
  max-width:900px;
  margin-bottom:25px;
}

.unit-label{
  display:inline-flex;
  align-items:center;
  gap:8px;
  margin-bottom:10px;
  color:#a78bfa;
  font-size:11px;
  font-weight:800;
  letter-spacing:.8px;
  text-transform:uppercase;
}

.unit-label span{
  color:#475569;
}

.note-header h1{
  margin:0 0 10px;
  color:#fff;
  font-size:32px;
  line-height:1.25;
  font-weight:800;
  overflow-wrap:anywhere;
}

.note-header p{
  margin:0;
  color:#94a3b8;
  font-size:14px;
  line-height:1.7;
}

.material-card,
.other-notes,
.completion-card{
  width:100%;
  box-sizing:border-box;
  background:#0f172a;
  border:1px solid #1e293b;
  border-radius:17px;
}

.material-card{
  padding:22px;
}

.material-header{
  display:flex;
  align-items:center;
  gap:15px;
  padding:17px;
  margin-bottom:18px;
  background:#111c31;
  border:1px solid #24324a;
  border-radius:13px;
}

.material-icon{
  width:48px;
  height:48px;
  min-width:48px;
  display:flex;
  align-items:center;
  justify-content:center;
  border-radius:12px;
  background:#312e81;
  color:#a78bfa;
  font-size:20px;
}

.material-info{
  min-width:0;
  flex:1;
}

.material-info h2{
  margin:0 0 5px;
  color:#fff;
  font-size:16px;
  overflow-wrap:anywhere;
}

.material-info p{
  margin:0;
  color:#94a3b8;
  font-size:12px;
  line-height:1.55;
}

.open-button{
  flex-shrink:0;
  padding:10px 14px;
  border-radius:9px;
  background:#8b5cf6;
  color:#fff;
  font-size:12px;
}

.open-button:hover{
  background:#7c3aed;
}

/* ACTUAL NOTE CONTENT */

.note-content{
  width:100%;
  min-height:300px;
  padding:30px;
  box-sizing:border-box;
  border:1px solid #24324a;
  border-radius:13px;
  background:#020617;
  color:#e2e8f0;
  font-size:15px;
  line-height:1.9;
  white-space:pre-wrap;
  overflow-wrap:anywhere;
  text-align:left;
}

/* OPTIONAL PDF */

.attached-file{
  margin-top:20px;
  padding-top:20px;
  border-top:1px solid #1e293b;
}

.attached-title{
  display:flex;
  align-items:center;
  gap:8px;
  margin-bottom:12px;
  color:#cbd5e1;
  font-size:13px;
  font-weight:700;
}

.attached-title svg{
  color:#f87171;
}

.pdf-viewer{
  width:100%;
  height:720px;
  overflow:hidden;
  border:1px solid #1e293b;
  border-radius:13px;
  background:#020617;
}

.pdf-frame{
  width:100%;
  height:100%;
  border:0;
}

.other-notes{
  margin-top:20px;
  padding:20px;
}

.section-label{
  color:#a78bfa;
  font-size:10px;
  font-weight:800;
  letter-spacing:.8px;
}

.other-notes h3{
  margin:7px 0 4px;
  color:#fff;
  font-size:17px;
}

.other-notes>p{
  margin:0;
  color:#64748b;
  font-size:12px;
}

.notes-list{
  display:flex;
  flex-wrap:wrap;
  gap:9px;
  margin-top:16px;
}

.note-item{
  display:inline-flex;
  align-items:center;
  gap:8px;
  padding:10px 13px;
  border:1px solid #334155;
  border-radius:9px;
  background:#111827;
  color:#cbd5e1;
  cursor:pointer;
  font-size:12px;
  font-weight:600;
}

.note-item:hover,
.note-item.active{
  border-color:#8b5cf6;
  background:#17112b;
  color:#a78bfa;
}

.completion-card{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:20px;
  margin-top:20px;
  padding:20px;
}

.completion-card.done{
  border-color:#14532d;
  background:#0b1f19;
}

.completion-left{
  display:flex;
  align-items:center;
  gap:13px;
  min-width:0;
}

.completion-icon{
  width:44px;
  height:44px;
  min-width:44px;
  display:flex;
  align-items:center;
  justify-content:center;
  border-radius:11px;
  background:#312e81;
  color:#a78bfa;
  font-size:19px;
}

.done .completion-icon{
  background:#065f46;
  color:#6ee7b7;
}

.completion-left h3{
  margin:0 0 4px;
  color:#fff;
  font-size:14px;
}

.completion-left p{
  margin:0;
  color:#64748b;
  font-size:11px;
  line-height:1.5;
}

.complete-button{
  min-height:42px;
  padding:10px 17px;
  border:0;
  border-radius:10px;
  background:#8b5cf6;
  color:#fff;
  cursor:pointer;
  font-size:12px;
  font-weight:700;
  white-space:nowrap;
}

.complete-button:hover:not(:disabled){
  background:#7c3aed;
}

.complete-button:disabled{
  opacity:.65;
  cursor:wait;
}

.complete-button.done-button{
  background:#065f46;
}

.complete-button.done-button:hover:not(:disabled){
  background:#047857;
}

.primary-button{
  margin-top:20px;
  padding:12px 18px;
  border:0;
  border-radius:10px;
  background:#8b5cf6;
  color:#fff;
}

.state-card{
  min-height:60vh;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  padding:30px;
  text-align:center;
}

.state-icon{
  width:65px;
  height:65px;
  display:flex;
  align-items:center;
  justify-content:center;
  margin-bottom:18px;
  border-radius:18px;
  background:#1e293b;
  color:#a78bfa;
  font-size:27px;
}

.state-card h2{
  margin:0 0 8px;
  color:#fff;
  font-size:22px;
}

.state-card p{
  max-width:430px;
  margin:0;
  color:#64748b;
  font-size:14px;
  line-height:1.6;
}

.spin{
  animation:notes-spin 1s linear infinite;
}

@keyframes notes-spin{
  from{
    transform:rotate(0);
  }

  to{
    transform:rotate(360deg);
  }
}

@media(max-width:768px){

  .top-bar{
    flex-direction:column;
    align-items:stretch;
  }

  .back-button{
    width:fit-content;
  }

  .quiz-button{
    width:100%;
  }

  .note-header h1{
    font-size:25px;
  }

  .material-card{
    padding:17px;
  }

  .material-header{
    align-items:flex-start;
    flex-wrap:wrap;
  }

  .material-info{
    width:calc(100% - 64px);
  }

  .open-button{
    width:100%;
  }

  .note-content{
    padding:20px;
    font-size:14px;
    line-height:1.8;
  }

  .pdf-viewer{
    height:600px;
  }

  .completion-card{
    flex-direction:column;
    align-items:stretch;
  }

  .complete-button{
    width:100%;
  }
}

@media(max-width:480px){

  .note-header h1{
    font-size:21px;
  }

  .note-header p{
    font-size:12px;
  }

  .material-card{
    padding:14px;
  }

  .material-header{
    padding:14px;
  }

  .note-content{
    padding:17px;
    font-size:13px;
    line-height:1.75;
  }

  .pdf-viewer{
    height:500px;
  }

  .completion-card{
    padding:15px;
  }
}
`;

export default Notes;
