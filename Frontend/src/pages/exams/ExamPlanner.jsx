import { useEffect, useMemo, useState } from "react";

import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaSyncAlt,
  FaClipboardList,
  FaCheckCircle,
  FaTimes,
  FaSave,
  FaCalendarAlt,
  FaClock,
  FaHourglassHalf,
  FaStickyNote,
} from "react-icons/fa";

// IMPORTANT: correct path
import API_URL from "../../config/api";

/* =========================================================
   STUDENT AUTH HELPERS
========================================================= */

const getStudentToken = () =>
  localStorage.getItem("sbec_token") || localStorage.getItem("token") || "";

const getStudentHeaders = (includeJson = false) => {
  const token = getStudentToken();

  return {
    ...(includeJson ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/* =========================================================
   HELPERS
========================================================= */

const getId = (exam) => exam?._id || exam?.id;

const getTitle = (exam) =>
  exam?.title ||
  exam?.name ||
  exam?.examName ||
  exam?.examTitle ||
  "Untitled Exam";

const getSubject = (exam) => exam?.subject || exam?.subjectName || "";

const getYear = (exam) => exam?.year || exam?.examYear || "";

const getSemester = (exam) => exam?.semester || exam?.examSemester || "";

const getDuration = (exam) => exam?.duration || "";

const getExamDate = (exam) => exam?.examDate || exam?.date || "";

/* =========================================================
   EMPTY FORM
========================================================= */

const EMPTY_FORM = {
  title: "",
  subject: "",
  examDate: "",
  examTime: "",
  year: "",
  semester: "",
  duration: "180",
  examType: "University",
  notes: "",
};

/* =========================================================
   DATE HELPERS
========================================================= */

const formatDate = (date) => {
  if (!date) return "Date not set";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Date not set";
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateForInput = (date) => {
  if (!date) return "";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/* =========================================================
   PLANNER CALCULATION HELPERS
========================================================= */

const startOfDay = (value = new Date()) => {
  const date = value instanceof Date ? new Date(value) : new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const getDaysRemaining = (examDate) => {
  if (!examDate) return null;

  const target = startOfDay(examDate);
  if (Number.isNaN(target.getTime())) return null;

  const today = startOfDay();
  return Math.ceil((target.getTime() - today.getTime()) / 86400000);
};

const getExamStatus = (examDate) => {
  const days = getDaysRemaining(examDate);

  if (days === null) return "Unknown";
  if (days < 0) return "Completed";
  if (days === 0) return "Today";
  if (days <= 7) return "This Week";
  return "Upcoming";
};

const getMonthKey = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

const getDateKey = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const formatMonthYear = (date) =>
  date.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

/* =========================================================
   COMPONENT
========================================================= */

function ExamPlanner() {
  const [exams, setExams] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [deleting, setDeleting] = useState(false);

  const [showForm, setShowForm] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const [formData, setFormData] = useState({
    ...EMPTY_FORM,
  });

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  /* =========================================================
     FETCH EXAMS
  ========================================================= */

  const fetchExams = async () => {
    try {
      const token = getStudentToken();

      if (!token) {
        throw new Error("Student login session not found. Please login again.");
      }

      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/exam-planner`, {
        headers: getStudentHeaders(),
      });

      const data = await response.json();

      console.log("GET EXAMS:", data);

      if (!response.ok) {
        throw new Error(data?.message || "Failed to fetch exams.");
      }

      const list = data?.exams || data?.data || [];

      setExams(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("FETCH EXAMS ERROR:", err);

      setError(err?.message || "Unable to connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    const loadExams = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/api/exam-planner`, {
          headers: getStudentHeaders(),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || "Failed to fetch exams.");
        }

        const list = data?.exams || data?.data || [];

        if (!cancelled) {
          setExams(Array.isArray(list) ? list : []);
        }
      } catch (err) {
        console.error("INITIAL LOAD ERROR:", err);

        if (!cancelled) {
          setError(err?.message || "Unable to load exams.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadExams();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =========================================================
     SEARCH
  ========================================================= */

  const filteredExams = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return exams;
    }

    return exams.filter((exam) => {
      const text = `
        ${getTitle(exam)}
        ${getSubject(exam)}
        ${getYear(exam)}
        ${getSemester(exam)}
        ${getExamDate(exam)}
      `.toLowerCase();

      return text.includes(query);
    });
  }, [exams, search]);

  /* =========================================================
     PLANNER CALCULATIONS
  ========================================================= */

  const today = useMemo(() => startOfDay(), []);

  const upcomingExams = useMemo(() => {
    return [...exams]
      .filter((exam) => {
        const days = getDaysRemaining(getExamDate(exam));
        return days !== null && days >= 0;
      })
      .sort((a, b) => {
        return (
          new Date(getExamDate(a)).getTime() -
          new Date(getExamDate(b)).getTime()
        );
      });
  }, [exams]);

  const completedExams = useMemo(() => {
    return exams.filter((exam) => {
      const days = getDaysRemaining(getExamDate(exam));
      return days !== null && days < 0;
    });
  }, [exams]);

  const nextExam = upcomingExams[0] || null;

  const thisMonthExams = useMemo(() => {
    const currentMonth = getMonthKey(today);
    return exams.filter(
      (exam) => getMonthKey(getExamDate(exam)) === currentMonth,
    );
  }, [exams, today]);

  const filteredUpcomingExams = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return upcomingExams;

    return upcomingExams.filter((exam) => {
      const text =
        `${getTitle(exam)} ${getSubject(exam)} ${getYear(exam)} ${getSemester(exam)} ${getExamDate(exam)} ${exam?.examType || ""}`.toLowerCase();
      return text.includes(query);
    });
  }, [upcomingExams, search]);

  const calendarData = useMemo(() => {
    const baseDate = nextExam ? new Date(getExamDate(nextExam)) : new Date();

    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startOffset = firstDay.getDay();
    const cells = [];

    for (let i = 0; i < startOffset; i += 1) cells.push(null);
    for (let day = 1; day <= daysInMonth; day += 1) cells.push(day);
    while (cells.length % 7 !== 0) cells.push(null);

    const examsByDate = {};
    exams.forEach((exam) => {
      const key = getDateKey(getExamDate(exam));
      if (!key) return;
      examsByDate[key] = examsByDate[key] || [];
      examsByDate[key].push(exam);
    });

    return { year, month, cells, examsByDate };
  }, [exams, nextExam]);

  /* =========================================================
     INPUT CHANGE
  ========================================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =========================================================
     ADD FORM
  ========================================================= */

  const openAddForm = () => {
    setEditingId(null);

    setFormData({
      ...EMPTY_FORM,
    });

    setError("");
    setSuccess("");

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =========================================================
     EDIT FORM
  ========================================================= */

  const openEditForm = (exam) => {
    const id = getId(exam);

    if (!id) {
      setError("Exam ID is missing.");
      return;
    }

    setEditingId(id);

    setFormData({
      title: getTitle(exam) === "Untitled Exam" ? "" : getTitle(exam),

      subject: getSubject(exam),

      examDate: formatDateForInput(getExamDate(exam)),

      year: getYear(exam) ? String(getYear(exam)) : "",

      semester: getSemester(exam),

      duration: getDuration(exam) ? String(getDuration(exam)) : "180",
      examTime: exam?.examTime || "",
      examType: exam?.examType || "University",
      notes: exam?.notes || "",
    });

    setError("");
    setSuccess("");

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =========================================================
     CLOSE FORM
  ========================================================= */

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);

    setEditingId(null);

    setFormData({
      ...EMPTY_FORM,
    });
  };

  /* =========================================================
     SAVE / UPDATE
  ========================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!getStudentToken()) {
      setError("Student login session not found. Please login again.");
      return;
    }

    setError("");
    setSuccess("");

    if (!formData.title.trim()) {
      setError("Please enter exam title.");
      return;
    }

    if (!formData.subject) {
      setError("Please select subject.");
      return;
    }

    if (!formData.examDate) {
      setError("Please select exam date.");
      return;
    }

    if (!formData.year) {
      setError("Please enter academic year.");
      return;
    }

    if (!formData.semester) {
      setError("Please select semester.");
      return;
    }

    if (formData.duration && Number(formData.duration) <= 0) {
      setError("Duration must be greater than 0.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        title: formData.title.trim(),
        subject: formData.subject,
        examDate: formData.examDate,
        examTime: formData.examTime || "",
        year: Number(formData.year),
        semester: formData.semester,
        duration: formData.duration ? Number(formData.duration) : 180,
        examType: formData.examType || "University",
        notes: formData.notes.trim(),
      };

      const isEdit = Boolean(editingId);

      const url = isEdit
        ? `${API_URL}/api/exam-planner/${editingId}`
        : `${API_URL}/api/exam-planner`;

      const method = isEdit ? "PUT" : "POST";

      console.log("REQUEST:", method, url);

      console.log("PAYLOAD:", payload);

      const response = await fetch(url, {
        method,

        headers: getStudentHeaders(true),

        body: JSON.stringify(payload),
      });

      const data = await response.json();

      console.log("SAVE RESPONSE:", data);

      if (!response.ok) {
        throw new Error(data?.message || "Failed to save exam.");
      }

      setSuccess(
        isEdit ? "Exam updated successfully." : "Exam created successfully.",
      );

      setShowForm(false);

      setEditingId(null);

      setFormData({
        ...EMPTY_FORM,
      });

      await fetchExams();
    } catch (err) {
      console.error("SAVE ERROR:", err);

      setError(err?.message || "Failed to save exam.");
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     DELETE CONFIRMATION
  ========================================================= */

  const askDelete = (exam) => {
    const id = getId(exam);

    if (!id) {
      setError("Exam ID is missing.");
      return;
    }

    setError("");
    setSuccess("");

    setDeleteTarget(exam);
  };

  /* =========================================================
     DELETE EXAM
  ========================================================= */

  const handleDelete = async () => {
    if (!deleteTarget || deleting) {
      return;
    }

    if (!getStudentToken()) {
      setDeleteTarget(null);
      setError("Student login session not found. Please login again.");
      return;
    }

    const id = getId(deleteTarget);

    if (!id) {
      setDeleteTarget(null);

      setError("Exam ID is missing.");

      return;
    }

    try {
      setDeleting(true);

      setError("");
      setSuccess("");

      const response = await fetch(`${API_URL}/api/exam-planner/${id}`, {
        method: "DELETE",
        headers: getStudentHeaders(),
      });

      const data = await response.json();

      console.log("DELETE RESPONSE:", data);

      if (!response.ok) {
        throw new Error(data?.message || "Failed to delete exam.");
      }

      setDeleteTarget(null);

      setSuccess("Exam deleted successfully.");

      await fetchExams();
    } catch (err) {
      console.error("DELETE ERROR:", err);

      setDeleteTarget(null);

      setError(err?.message || "Failed to delete exam.");
    } finally {
      setDeleting(false);
    }
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div style={styles.page}>
      {/* HEADER */}

      <div className="exam-header" style={styles.header}>
        <div>
          <h1 style={styles.title}>Exam Planner</h1>

          <p style={styles.subtitle}>
            Plan and manage your upcoming examinations.
          </p>
        </div>

        <div className="exam-header-buttons" style={styles.headerButtons}>
          <button
            style={styles.refreshButton}
            onClick={fetchExams}
            disabled={loading}
          >
            <FaSyncAlt />

            <span>Refresh</span>
          </button>

          <button style={styles.addButton} onClick={openAddForm}>
            <FaPlus />

            <span>Add Exam</span>
          </button>
        </div>
      </div>

      {/* ALERT */}

      {(error || success) && (
        <div
          className="sbec-alert-toast"
          style={{
            ...styles.alertToast,

            ...(error ? styles.alertToastError : styles.alertToastSuccess),
          }}
        >
          <div style={styles.alertToastIcon}>
            {error ? "!" : <FaCheckCircle />}
          </div>

          <div style={styles.alertToastContent}>
            <strong>{error ? "Action failed" : "Success"}</strong>

            <span>{error || success}</span>
          </div>

          <button
            type="button"
            style={styles.alertToastClose}
            onClick={() => {
              setError("");
              setSuccess("");
            }}
          >
            <FaTimes />
          </button>
        </div>
      )}

      {/* DELETE MODAL */}

      {deleteTarget && (
        <div
          className="sbec-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !deleting) {
              setDeleteTarget(null);
            }
          }}
        >
          <div className="sbec-delete-modal" style={styles.deleteModal}>
            <div style={styles.deleteModalIcon}>
              <FaTrash />
            </div>

            <h3 style={styles.deleteModalTitle}>Delete exam?</h3>

            <p style={styles.deleteModalText}>
              Are you sure you want to delete{" "}
              <strong>{getTitle(deleteTarget)}</strong>? This action cannot be
              undone.
            </p>

            <div
              className="sbec-modal-actions"
              style={styles.deleteModalActions}
            >
              <button
                type="button"
                style={styles.modalCancelButton}
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                type="button"
                style={styles.modalDeleteButton}
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <FaSyncAlt style={styles.spin} />
                    Deleting...
                  </>
                ) : (
                  <>
                    <FaTrash />
                    Delete Exam
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT FORM */}

      {showForm && (
        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <div>
              <h2 style={styles.formTitle}>
                {editingId ? "Edit Exam" : "Add Exam"}
              </h2>

              <p style={styles.formSubtitle}>
                {editingId
                  ? "Update examination details."
                  : "Enter examination details."}
              </p>
            </div>

            <button type="button" style={styles.closeForm} onClick={closeForm}>
              <FaTimes />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="exam-form"
            style={styles.form}
          >
            {/* TITLE */}

            <div className="exam-full-field" style={styles.fullField}>
              <label style={styles.label}>Exam Title</label>

              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Example: Artificial Intelligence"
                style={styles.input}
              />
            </div>

            {/* SUBJECT */}

            <div style={styles.field}>
              <label style={styles.label}>Subject</label>

              <select
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="">Select Subject</option>

                <option value="Artificial Intelligence">
                  Artificial Intelligence
                </option>

                <option value="Computer Networks">Computer Networks</option>

                <option value="Software Engineering">
                  Software Engineering
                </option>

                <option value="Data Analytics">Data Analytics</option>

                <option value="Internet of Things">Internet of Things</option>

                <option value="DAA">DAA</option>

                <option value="Python">Python</option>

                <option value="OOP">OOP</option>
              </select>
            </div>

            {/* DATE */}

            <div style={styles.field}>
              <label style={styles.label}>Exam Date</label>

              <div style={styles.dateInputWrapper}>
                <FaCalendarAlt style={styles.dateIcon} />

                <input
                  type="date"
                  name="examDate"
                  value={formData.examDate}
                  onChange={handleChange}
                  style={styles.dateInput}
                  required
                />
              </div>

              <small style={styles.help}>
                Select the scheduled examination date.
              </small>
            </div>

            {/* YEAR */}

            <div style={styles.field}>
              <label style={styles.label}>Academic Year</label>

              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                placeholder="2026"
                min="2000"
                max="2100"
                style={styles.input}
              />
            </div>

            {/* SEMESTER */}

            <div style={styles.field}>
              <label style={styles.label}>Semester</label>

              <select
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="">Select Semester</option>

                <option value="I">Semester I</option>

                <option value="II">Semester II</option>

                <option value="III">Semester III</option>

                <option value="IV">Semester IV</option>

                <option value="V">Semester V</option>

                <option value="VI">Semester VI</option>
              </select>
            </div>

            {/* DURATION */}

            <div style={styles.field}>
              <label style={styles.label}>Duration</label>

              <div style={styles.durationWrapper}>
                <FaClock style={styles.durationIcon} />

                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="180"
                  min="1"
                  style={styles.durationInput}
                />
              </div>

              <small style={styles.help}>Duration in minutes.</small>
            </div>

            {/* EXAM TIME */}

            <div style={styles.field}>
              <label style={styles.label}>Exam Time</label>

              <div style={styles.dateInputWrapper}>
                <FaClock style={styles.dateIcon} />

                <input
                  type="time"
                  name="examTime"
                  value={formData.examTime}
                  onChange={handleChange}
                  style={styles.dateInput}
                />
              </div>

              <small style={styles.help}>
                Optional examination start time.
              </small>
            </div>

            {/* EXAM TYPE */}

            <div style={styles.field}>
              <label style={styles.label}>Exam Type</label>

              <select
                name="examType"
                value={formData.examType}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="University">University</option>
                <option value="Internal">Internal</option>
                <option value="Practical">Practical</option>
                <option value="Viva">Viva</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* NOTES */}

            <div className="exam-full-field" style={styles.fullField}>
              <label style={styles.label}>Notes</label>

              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Add any preparation notes or important details..."
                style={styles.textarea}
                maxLength={1000}
                rows={4}
              />

              <small style={styles.help}>
                Optional notes for this examination.
              </small>
            </div>

            {/* ACTIONS */}

            <div className="exam-form-actions" style={styles.formActions}>
              <button
                type="button"
                style={styles.cancelButton}
                onClick={closeForm}
                disabled={saving}
              >
                Cancel
              </button>

              <button type="submit" style={styles.saveButton} disabled={saving}>
                {saving ? (
                  <>
                    <FaSyncAlt style={styles.spin} />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave />

                    {editingId ? "Update Exam" : "Save Exam"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PLANNER SUMMARY */}

      <div className="exam-stats" style={styles.stats}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>
            <FaClipboardList />
          </div>
          <div>
            <span style={styles.statLabel}>Upcoming Exams</span>
            <strong style={styles.statNumber}>{upcomingExams.length}</strong>
            <small style={styles.statSmall}>
              {completedExams.length} completed
            </small>
          </div>
        </div>

        <div style={styles.statCard}>
          <div
            style={{
              ...styles.statIcon,
              background: "#064E3B",
              color: "#6EE7B7",
            }}
          >
            <FaCalendarAlt />
          </div>
          <div>
            <span style={styles.statLabel}>This Month</span>
            <strong style={styles.statNumber}>{thisMonthExams.length}</strong>
            <small style={styles.statSmall}>Exams scheduled</small>
          </div>
        </div>

        <div style={styles.statCard}>
          <div
            style={{
              ...styles.statIcon,
              background: "#422006",
              color: "#FCD34D",
            }}
          >
            <FaHourglassHalf />
          </div>
          <div>
            <span style={styles.statLabel}>Next Exam</span>
            <strong style={styles.statNumber}>
              {nextExam
                ? getDaysRemaining(getExamDate(nextExam)) === 0
                  ? "Today"
                  : `${getDaysRemaining(getExamDate(nextExam))}d`
                : "—"}
            </strong>
            <small style={styles.statSmall}>
              {nextExam ? getSubject(nextExam) : "No upcoming exam"}
            </small>
          </div>
        </div>

        <div style={styles.statCard}>
          <div
            style={{
              ...styles.statIcon,
              background: "#312E81",
              color: "#C4B5FD",
            }}
          >
            <FaCheckCircle />
          </div>
          <div>
            <span style={styles.statLabel}>Total Exams</span>
            <strong style={styles.statNumber}>{exams.length}</strong>
            <small style={styles.statSmall}>All examinations</small>
          </div>
        </div>
      </div>

      {/* NEXT EXAM */}

      {nextExam && (
        <div style={styles.nextExamCard}>
          <div style={styles.nextExamIcon}>
            <FaHourglassHalf />
          </div>
          <div style={styles.nextExamContent}>
            <span style={styles.nextExamLabel}>NEXT EXAM</span>
            <h2 style={styles.nextExamTitle}>{getTitle(nextExam)}</h2>
            <div style={styles.nextExamMeta}>
              <span>{getSubject(nextExam)}</span>
              <span>•</span>
              <span>{formatDate(getExamDate(nextExam))}</span>
              {nextExam.examTime && (
                <>
                  <span>•</span>
                  <span>{nextExam.examTime}</span>
                </>
              )}
            </div>
          </div>
          <div style={styles.countdownBox}>
            <strong>
              {getDaysRemaining(getExamDate(nextExam)) === 0
                ? "Today"
                : getDaysRemaining(getExamDate(nextExam))}
            </strong>
            <span>
              {getDaysRemaining(getExamDate(nextExam)) === 0
                ? "Exam Day"
                : "Days Left"}
            </span>
          </div>
        </div>
      )}

      {/* UPCOMING EXAMS */}

      <div style={styles.card}>
        <div className="exam-card-header" style={styles.cardHeader}>
          <div>
            <h2 style={styles.cardTitle}>Upcoming Exams</h2>
            <p style={styles.cardSubtitle}>
              {filteredUpcomingExams.length} upcoming exam
              {filteredUpcomingExams.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="exam-search" style={styles.search}>
            <FaSearch style={styles.searchIcon} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search exams..."
              style={styles.searchInput}
            />
          </div>
        </div>

        {loading ? (
          <div style={styles.center}>
            <FaSyncAlt style={styles.loading} />
            <p>Loading exams...</p>
          </div>
        ) : filteredUpcomingExams.length === 0 ? (
          <div style={styles.center}>
            <FaClipboardList style={styles.emptyIcon} />
            <h3>
              {search ? "No matching upcoming exams" : "No upcoming exams"}
            </h3>
            <p>
              {search
                ? "Try another search."
                : "Add an exam to start planning."}
            </p>
          </div>
        ) : (
          <div style={styles.examList}>
            {filteredUpcomingExams.map((exam, index) => {
              const days = getDaysRemaining(getExamDate(exam));
              const status = getExamStatus(getExamDate(exam));

              return (
                <div
                  key={getId(exam) || index}
                  className="exam-item"
                  style={styles.exam}
                >
                  <div style={styles.number}>{index + 1}</div>

                  <div className="exam-content" style={styles.examContent}>
                    <div style={styles.examTitleRow}>
                      <h3 style={styles.examTitle}>{getTitle(exam)}</h3>
                      <span
                        style={
                          days <= 7
                            ? styles.urgentStatus
                            : styles.upcomingStatus
                        }
                      >
                        {status}
                      </span>
                    </div>

                    <div style={styles.badges}>
                      {getSubject(exam) && (
                        <span style={styles.subject}>{getSubject(exam)}</span>
                      )}
                      <span style={styles.dateBadge}>
                        <FaCalendarAlt />
                        {formatDate(getExamDate(exam))}
                      </span>
                      {exam.examTime && (
                        <span style={styles.badge}>
                          <FaClock />
                          {exam.examTime}
                        </span>
                      )}
                      {getSemester(exam) && (
                        <span style={styles.badge}>
                          Semester {getSemester(exam)}
                        </span>
                      )}
                      {getDuration(exam) && (
                        <span style={styles.badge}>
                          <FaClock />
                          {getDuration(exam)} min
                        </span>
                      )}
                      {exam.examType && (
                        <span style={styles.badge}>{exam.examType}</span>
                      )}
                    </div>

                    {exam.notes && (
                      <div style={styles.notesPreview}>
                        <FaStickyNote />
                        <span>{exam.notes}</span>
                      </div>
                    )}
                  </div>

                  <div style={styles.countdownMini}>
                    <strong>{days === 0 ? "Today" : days}</strong>
                    <span>{days === 0 ? "Exam" : "Days"}</span>
                  </div>

                  <div className="exam-actions" style={styles.actions}>
                    <button
                      style={styles.edit}
                      onClick={() => openEditForm(exam)}
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      style={styles.delete}
                      onClick={() => askDelete(exam)}
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CALENDAR + NEXT EXAM DETAILS */}

      <div className="exam-bottom-grid" style={styles.bottomGrid}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>Exam Calendar</h2>
              <p style={styles.cardSubtitle}>
                {formatMonthYear(
                  new Date(calendarData.year, calendarData.month, 1),
                )}
              </p>
            </div>
          </div>

          <div className="calendar-grid" style={styles.calendarGrid}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} style={styles.calendarWeekday}>
                {day}
              </div>
            ))}
            {calendarData.cells.map((day, index) => {
              const key = day
                ? `${calendarData.year}-${String(calendarData.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                : `empty-${index}`;
              const dayExams = day ? calendarData.examsByDate[key] || [] : [];
              const isToday = day && getDateKey(today) === key;

              return (
                <div
                  key={key}
                  style={{
                    ...styles.calendarDay,
                    ...(isToday ? styles.calendarToday : {}),
                    ...(dayExams.length ? styles.calendarHasExam : {}),
                  }}
                >
                  {day && (
                    <>
                      <span>{day}</span>
                      {dayExams.length > 0 && (
                        <i style={styles.calendarDot}>{dayExams.length}</i>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>Next Exam Details</h2>
              <p style={styles.cardSubtitle}>
                Your nearest scheduled examination
              </p>
            </div>
          </div>

          {nextExam ? (
            <div style={styles.detailPanel}>
              <h3 style={styles.detailTitle}>{getTitle(nextExam)}</h3>
              <div style={styles.detailRows}>
                <div>
                  <span>Subject</span>
                  <strong>{getSubject(nextExam) || "—"}</strong>
                </div>
                <div>
                  <span>Date</span>
                  <strong>{formatDate(getExamDate(nextExam))}</strong>
                </div>
                <div>
                  <span>Time</span>
                  <strong>{nextExam.examTime || "Not set"}</strong>
                </div>
                <div>
                  <span>Duration</span>
                  <strong>
                    {getDuration(nextExam)
                      ? `${getDuration(nextExam)} minutes`
                      : "Not set"}
                  </strong>
                </div>
                <div>
                  <span>Type</span>
                  <strong>{nextExam.examType || "University"}</strong>
                </div>
                <div>
                  <span>Semester</span>
                  <strong>{getSemester(nextExam) || "—"}</strong>
                </div>
              </div>
              {nextExam.notes && (
                <div style={styles.detailNotes}>
                  <FaStickyNote />
                  <div>
                    <span>Notes</span>
                    <p>{nextExam.notes}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={styles.centerSmall}>
              <FaCalendarAlt style={styles.emptyIcon} />
              <p>Add your first exam to see its details here.</p>
            </div>
          )}
        </div>
      </div>

      {/* ALL EXAMS / HISTORY */}

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div>
            <h2 style={styles.cardTitle}>Exam Overview</h2>
            <p style={styles.cardSubtitle}>
              {exams.length} total examination{exams.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div style={styles.overviewGrid}>
          <div style={styles.overviewItem}>
            <span>Upcoming</span>
            <strong>{upcomingExams.length}</strong>
          </div>
          <div style={styles.overviewItem}>
            <span>This Month</span>
            <strong>{thisMonthExams.length}</strong>
          </div>
          <div style={styles.overviewItem}>
            <span>Completed</span>
            <strong>{completedExams.length}</strong>
          </div>
          <div style={styles.overviewItem}>
            <span>Filtered</span>
            <strong>{filteredExams.length}</strong>
          </div>
        </div>
      </div>

      {/* =====================================================
          RESPONSIVE CSS
      ===================================================== */}

      <style>
        {`
          @keyframes sbecSpin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          @keyframes sbecAlertIn {
            from {
              opacity: 0;
              transform: translate3d(0, -12px, 0) scale(0.98);
            }

            to {
              opacity: 1;
              transform: translate3d(0, 0, 0) scale(1);
            }
          }

          @keyframes sbecModalIn {
            from {
              opacity: 0;
              transform: translate3d(0, 12px, 0) scale(0.96);
            }

            to {
              opacity: 1;
              transform: translate3d(0, 0, 0) scale(1);
            }
          }

          .sbec-alert-toast {
            animation: sbecAlertIn 0.22s ease-out;
          }

          .sbec-modal-backdrop {
            position: fixed;
            inset: 0;
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            background: rgba(2, 6, 23, 0.78);
            backdrop-filter: blur(7px);
            -webkit-backdrop-filter: blur(7px);
          }

          .sbec-delete-modal {
            animation: sbecModalIn 0.2s ease-out;
          }

          .countdownBox strong { display: block; color: #FFFFFF; font-size: 23px; line-height: 1; }
          .countdownBox span { display: block; margin-top: 5px; color: #94A3B8; font-size: 10px; }
          .countdownMini strong { display: block; color: #FFFFFF; font-size: 16px; line-height: 1; }
          .countdownMini span { display: block; margin-top: 4px; color: #64748B; font-size: 9px; }
          .detailRows > div { display: flex; flex-direction: column; gap: 4px; }
          .detailRows > div > span { color: #64748B; font-size: 10px; }
          .detailRows > div > strong { color: #CBD5E1; font-size: 12px; }
          .detailNotes > div > span { display: block; color: #64748B; font-size: 10px; margin-bottom: 3px; }
          .detailNotes > div > p { margin: 0; color: #CBD5E1; line-height: 1.5; }

          @media (max-width: 900px) {
            .exam-bottom-grid { grid-template-columns: 1fr !important; }
            .overviewGrid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          }

          @media (max-width: 900px) {

            .exam-header {
              flex-direction: column !important;
              align-items: stretch !important;
            }

            .exam-header-buttons {
              width: 100% !important;
            }

            .exam-header-buttons button {
              flex: 1 !important;
            }

            .exam-card-header {
              flex-direction: column !important;
              align-items: stretch !important;
            }

            .exam-search {
              width: 100% !important;
            }

            .exam-item {
              align-items: flex-start !important;
            }

            .exam-content {
              width: 100% !important;
            }
          }

          @media (max-width: 700px) {

            .exam-form {
              grid-template-columns: 1fr !important;
            }

            .exam-full-field {
              grid-column: auto !important;
            }

            .exam-form-actions {
              grid-column: auto !important;
              flex-direction: column-reverse !important;
            }

            .exam-form-actions button {
              width: 100% !important;
            }

            .exam-stats {
              grid-template-columns: 1fr !important;
            }

            .exam-item {
              flex-wrap: wrap !important;
            }

            .exam-actions {
              width: 100% !important;
              justify-content: flex-end !important;
              padding-top: 5px !important;
            }
          }

          @media (max-width: 600px) {
            .nextExamCard { align-items: flex-start !important; flex-wrap: wrap !important; }
            .countdownBox { margin-left: 70px !important; width: calc(100% - 70px) !important; box-sizing: border-box !important; }
            .countdownMini { min-width: 50px !important; }
            .overviewGrid { grid-template-columns: 1fr 1fr !important; }
            .detailRows { grid-template-columns: 1fr !important; }
          }

          @media (max-width: 600px) {

            .sbec-alert-toast {
              left: 14px !important;
              right: 14px !important;
              top: 14px !important;
              width: auto !important;
              max-width: none !important;
            }

            .sbec-delete-modal {
              width: 100% !important;
              max-width: none !important;
            }

            .sbec-modal-actions {
              flex-direction: column-reverse !important;
            }

            .sbec-modal-actions button {
              width: 100% !important;
            }
          }

          @media (max-width: 480px) {

            .exam-header-buttons {
              flex-direction: column !important;
            }

            .exam-header-buttons button {
              width: 100% !important;
            }

            .exam-item {
              padding: 14px !important;
            }

            .exam-actions {
              justify-content: stretch !important;
            }

            .exam-actions button {
              flex: 1 !important;
            }
          }

          input[type="date"]::-webkit-calendar-picker-indicator {
            cursor: pointer;
          }
        `}
      </style>
    </div>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = {
  page: {
    width: "100%",
    maxWidth: "1200px",
    margin: "0 auto",
    boxSizing: "border-box",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "24px",
  },

  title: {
    margin: 0,
    color: "#FFFFFF",
    fontSize: "32px",
    fontWeight: "800",
  },

  subtitle: {
    margin: "8px 0 0",
    color: "#64748B",
    fontSize: "14px",
  },

  headerButtons: {
    display: "flex",
    gap: "10px",
    flexShrink: 0,
  },

  refreshButton: {
    minHeight: "46px",
    padding: "0 18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    background: "#0F172A",
    border: "1px solid #334155",
    borderRadius: "10px",
    color: "#CBD5E1",
    cursor: "pointer",
    fontWeight: "600",
  },

  addButton: {
    minHeight: "46px",
    padding: "0 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    background: "linear-gradient(135deg,#7C3AED,#8B5CF6)",
    border: "none",
    borderRadius: "10px",
    color: "#FFFFFF",
    cursor: "pointer",
    fontWeight: "700",
  },

  alertToast: {
    position: "fixed",
    top: "22px",
    right: "22px",
    zIndex: 10000,
    width: "min(420px, calc(100vw - 44px))",
    minHeight: "72px",
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "13px 14px",
    borderRadius: "14px",
    boxShadow: "0 18px 50px rgba(0,0,0,0.45)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
  },

  alertToastError: {
    background: "rgba(69,10,10,0.97)",
    border: "1px solid #991B1B",
    color: "#FECACA",
  },

  alertToastSuccess: {
    background: "rgba(6,78,59,0.97)",
    border: "1px solid #047857",
    color: "#A7F3D0",
  },

  alertToastIcon: {
    width: "38px",
    height: "38px",
    minWidth: "38px",
    borderRadius: "11px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255,255,255,0.09)",
    fontSize: "18px",
    fontWeight: "800",
  },

  alertToastContent: {
    minWidth: 0,
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "3px",
  },

  alertToastClose: {
    width: "32px",
    height: "32px",
    flexShrink: 0,
    border: "none",
    borderRadius: "8px",
    background: "rgba(255,255,255,0.07)",
    color: "#CBD5E1",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  deleteModal: {
    width: "min(430px, 100%)",
    boxSizing: "border-box",
    background: "#0F172A",
    border: "1px solid #334155",
    borderRadius: "20px",
    padding: "28px",
    textAlign: "center",
    boxShadow: "0 25px 80px rgba(0,0,0,0.55)",
  },

  deleteModalIcon: {
    width: "58px",
    height: "58px",
    margin: "0 auto 16px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#450A0A",
    border: "1px solid #7F1D1D",
    color: "#FCA5A5",
    fontSize: "21px",
  },

  deleteModalTitle: {
    margin: 0,
    color: "#FFFFFF",
    fontSize: "22px",
    fontWeight: "800",
  },

  deleteModalText: {
    margin: "10px 0 24px",
    color: "#94A3B8",
    fontSize: "13px",
    lineHeight: 1.6,
  },

  deleteModalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
  },

  modalCancelButton: {
    minHeight: "44px",
    padding: "0 18px",
    border: "1px solid #334155",
    borderRadius: "10px",
    background: "#1E293B",
    color: "#CBD5E1",
    cursor: "pointer",
    fontWeight: "600",
  },

  modalDeleteButton: {
    minHeight: "44px",
    padding: "0 18px",
    border: "none",
    borderRadius: "10px",
    background: "#DC2626",
    color: "#FFFFFF",
    cursor: "pointer",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },

  nextExamCard: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
    background: "linear-gradient(135deg,#17134A,#111827)",
    border: "1px solid #4C1D95",
    borderRadius: "16px",
    padding: "20px",
    marginBottom: "20px",
    boxShadow: "0 14px 35px rgba(76,29,149,0.18)",
  },
  nextExamIcon: {
    width: "52px",
    height: "52px",
    minWidth: "52px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#4C1D95",
    color: "#C4B5FD",
    fontSize: "21px",
  },
  nextExamContent: { flex: 1, minWidth: 0 },
  nextExamLabel: {
    color: "#A78BFA",
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "1.2px",
  },
  nextExamTitle: {
    margin: "5px 0",
    color: "#FFFFFF",
    fontSize: "20px",
    fontWeight: "800",
  },
  nextExamMeta: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    color: "#94A3B8",
    fontSize: "12px",
  },
  countdownBox: {
    minWidth: "95px",
    textAlign: "center",
    padding: "12px",
    borderRadius: "12px",
    background: "rgba(124,58,237,0.14)",
    border: "1px solid #4C1D95",
  },
  countdownBoxStrong: {},
  countdownMini: {
    minWidth: "55px",
    textAlign: "center",
    padding: "7px 9px",
    borderRadius: "9px",
    background: "#111827",
    border: "1px solid #334155",
    marginLeft: "auto",
  },
  examTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },
  urgentStatus: {
    padding: "4px 8px",
    borderRadius: "999px",
    background: "#450A0A",
    color: "#FCA5A5",
    fontSize: "10px",
    fontWeight: "700",
  },
  upcomingStatus: {
    padding: "4px 8px",
    borderRadius: "999px",
    background: "#312E81",
    color: "#C4B5FD",
    fontSize: "10px",
    fontWeight: "700",
  },
  notesPreview: {
    display: "flex",
    gap: "7px",
    alignItems: "flex-start",
    marginTop: "9px",
    color: "#64748B",
    fontSize: "11px",
    lineHeight: 1.5,
  },
  bottomGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(0,1.2fr) minmax(0,0.8fr)",
    gap: "20px",
    marginBottom: "20px",
  },
  calendarGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, minmax(0,1fr))",
    gap: "6px",
  },
  calendarWeekday: {
    textAlign: "center",
    color: "#64748B",
    fontSize: "10px",
    fontWeight: "700",
    padding: "6px 0",
  },
  calendarDay: {
    minHeight: "44px",
    borderRadius: "8px",
    background: "#111827",
    border: "1px solid #1E293B",
    color: "#CBD5E1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    fontSize: "12px",
  },
  calendarToday: {
    border: "1px solid #8B5CF6",
    boxShadow: "inset 0 0 0 1px #8B5CF6",
  },
  calendarHasExam: { background: "#21164D", color: "#DDD6FE" },
  calendarDot: {
    position: "absolute",
    bottom: "4px",
    right: "5px",
    minWidth: "13px",
    height: "13px",
    borderRadius: "999px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#7C3AED",
    color: "#FFFFFF",
    fontSize: "8px",
    fontStyle: "normal",
  },
  detailPanel: {
    background: "#0B1220",
    border: "1px solid #1E293B",
    borderRadius: "12px",
    padding: "16px",
  },
  detailTitle: {
    margin: "0 0 15px",
    color: "#FFFFFF",
    fontSize: "17px",
    fontWeight: "800",
  },
  detailRows: {
    display: "grid",
    gridTemplateColumns: "repeat(2,minmax(0,1fr))",
    gap: "12px",
  },
  detailRowsItem: {},
  detailNotes: {
    display: "flex",
    gap: "10px",
    marginTop: "16px",
    paddingTop: "14px",
    borderTop: "1px solid #1E293B",
    color: "#A78BFA",
    fontSize: "12px",
  },
  detailNotesSpan: {},
  detailNotesP: {},
  centerSmall: {
    minHeight: "170px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    color: "#64748B",
    fontSize: "13px",
  },
  overviewGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4,minmax(0,1fr))",
    gap: "10px",
  },
  overviewItem: {
    padding: "14px",
    background: "#0B1220",
    border: "1px solid #1E293B",
    borderRadius: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },

  formCard: {
    background: "#0F172A",
    border: "1px solid #312E81",
    borderRadius: "16px",
    padding: "22px",
    marginBottom: "20px",
  },

  formHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "22px",
  },

  formTitle: {
    margin: 0,
    color: "#FFFFFF",
    fontSize: "21px",
  },

  formSubtitle: {
    margin: "6px 0 0",
    color: "#64748B",
    fontSize: "12px",
  },

  closeForm: {
    width: "38px",
    height: "38px",
    border: "1px solid #334155",
    borderRadius: "9px",
    background: "#1E293B",
    color: "#94A3B8",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  form: {
    display: "grid",
    gridTemplateColumns: "repeat(2,minmax(0,1fr))",
    gap: "16px",
  },

  fullField: {
    gridColumn: "1 / -1",
    display: "flex",
    flexDirection: "column",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },

  label: {
    color: "#CBD5E1",
    fontSize: "12px",
    fontWeight: "600",
    marginBottom: "7px",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    background: "#020617",
    border: "1px solid #334155",
    borderRadius: "9px",
    color: "#FFFFFF",
    padding: "12px",
    outline: "none",
    fontSize: "13px",
    resize: "vertical",
    fontFamily: "inherit",
    lineHeight: 1.5,
  },

  input: {
    width: "100%",
    minHeight: "45px",
    boxSizing: "border-box",
    background: "#020617",
    border: "1px solid #334155",
    borderRadius: "9px",
    color: "#FFFFFF",
    padding: "0 12px",
    outline: "none",
    fontSize: "13px",
  },

  dateInputWrapper: {
    width: "100%",
    minHeight: "45px",
    display: "flex",
    alignItems: "center",
    background: "#020617",
    border: "1px solid #334155",
    borderRadius: "9px",
    padding: "0 12px",
    boxSizing: "border-box",
  },

  dateIcon: {
    color: "#8B5CF6",
    fontSize: "14px",
    flexShrink: 0,
  },

  dateInput: {
    width: "100%",
    height: "43px",
    border: "none",
    outline: "none",
    background: "transparent",
    color: "#FFFFFF",
    padding: "0 8px",
    fontSize: "13px",
    colorScheme: "dark",
  },

  durationWrapper: {
    width: "100%",
    minHeight: "45px",
    display: "flex",
    alignItems: "center",
    background: "#020617",
    border: "1px solid #334155",
    borderRadius: "9px",
    padding: "0 12px",
    boxSizing: "border-box",
  },

  durationIcon: {
    color: "#8B5CF6",
    fontSize: "14px",
    flexShrink: 0,
  },

  durationInput: {
    width: "100%",
    height: "43px",
    border: "none",
    outline: "none",
    background: "transparent",
    color: "#FFFFFF",
    padding: "0 8px",
    fontSize: "13px",
  },

  help: {
    color: "#64748B",
    fontSize: "10px",
    marginTop: "5px",
  },

  formActions: {
    gridColumn: "1 / -1",
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "5px",
  },

  cancelButton: {
    minHeight: "42px",
    padding: "0 18px",
    background: "#1E293B",
    border: "1px solid #334155",
    borderRadius: "9px",
    color: "#CBD5E1",
    cursor: "pointer",
  },

  saveButton: {
    minHeight: "42px",
    padding: "0 18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    background: "#8B5CF6",
    border: "none",
    borderRadius: "9px",
    color: "#FFFFFF",
    cursor: "pointer",
    fontWeight: "700",
  },

  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(2,minmax(0,1fr))",
    gap: "16px",
    marginBottom: "20px",
  },

  statCard: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    background: "#0F172A",
    border: "1px solid #1E293B",
    borderRadius: "16px",
    padding: "20px",
  },

  statIcon: {
    width: "58px",
    height: "58px",
    minWidth: "58px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#312E81",
    color: "#A78BFA",
    borderRadius: "13px",
    fontSize: "22px",
  },

  statLabel: {
    display: "block",
    color: "#94A3B8",
    fontSize: "12px",
  },

  statNumber: {
    display: "block",
    color: "#FFFFFF",
    fontSize: "28px",
  },

  statSmall: {
    color: "#64748B",
    fontSize: "10px",
  },

  card: {
    background: "#0F172A",
    border: "1px solid #1E293B",
    borderRadius: "16px",
    padding: "22px",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "20px",
  },

  cardTitle: {
    margin: 0,
    color: "#FFFFFF",
    fontSize: "20px",
  },

  cardSubtitle: {
    margin: "5px 0 0",
    color: "#64748B",
    fontSize: "12px",
  },

  search: {
    width: "280px",
    height: "44px",
    display: "flex",
    alignItems: "center",
    background: "#020617",
    border: "1px solid #334155",
    borderRadius: "9px",
    padding: "0 12px",
    boxSizing: "border-box",
  },

  searchIcon: {
    color: "#64748B",
    flexShrink: 0,
  },

  searchInput: {
    width: "100%",
    height: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    color: "#FFFFFF",
    padding: "0 10px",
  },

  examList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  exam: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    background: "#020617",
    border: "1px solid #1E293B",
    borderRadius: "12px",
    padding: "16px",
  },

  number: {
    width: "38px",
    height: "38px",
    minWidth: "38px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#312E81",
    color: "#A78BFA",
    borderRadius: "10px",
    fontWeight: "700",
  },

  examContent: {
    flex: 1,
    minWidth: 0,
  },

  examTitle: {
    margin: "0 0 9px",
    color: "#FFFFFF",
    fontSize: "16px",
    overflowWrap: "anywhere",
  },

  badges: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "7px",
  },

  subject: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    background: "#312E81",
    color: "#C4B5FD",
    borderRadius: "6px",
    padding: "6px 9px",
    fontSize: "10px",
  },

  dateBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    background: "#064E3B",
    color: "#6EE7B7",
    borderRadius: "6px",
    padding: "6px 9px",
    fontSize: "10px",
  },

  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    background: "#1E293B",
    color: "#94A3B8",
    borderRadius: "6px",
    padding: "6px 9px",
    fontSize: "10px",
  },

  actions: {
    display: "flex",
    gap: "8px",
    flexShrink: 0,
  },

  edit: {
    width: "42px",
    height: "42px",
    border: "none",
    borderRadius: "9px",
    background: "#1E293B",
    color: "#A78BFA",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  delete: {
    width: "42px",
    height: "42px",
    border: "none",
    borderRadius: "9px",
    background: "#450A0A",
    color: "#FCA5A5",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  center: {
    minHeight: "220px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#64748B",
    textAlign: "center",
  },

  loading: {
    color: "#8B5CF6",
    fontSize: "24px",
    animation: "sbecSpin 1s linear infinite",
  },

  emptyIcon: {
    fontSize: "35px",
    color: "#4C1D95",
  },

  spin: {
    animation: "sbecSpin 1s linear infinite",
  },
};

export default ExamPlanner;
