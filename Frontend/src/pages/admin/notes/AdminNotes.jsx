import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FaStickyNote,
  FaSearch,
  FaSyncAlt,
  FaPlus,
  FaEdit,
  FaTrash,
  FaBook,
  FaTimes,
  FaSave,
  FaChevronDown,
} from "react-icons/fa";
import toast from "react-hot-toast";

import API_URL from "../../../config/api";

// API_URL is the backend root. Express mounts admin routes under /api.
const API_ROOT = String(API_URL).replace(/\/+$/, "");
const API_BASE_URL = API_ROOT.endsWith("/api")
  ? API_ROOT
  : `${API_ROOT}/api`;

const getNoteId = (note) => note?._id || note?.id || "";

function AdminNotes() {
  const [notes, setNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [subjectsLoading, setSubjectsLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    subject: "",
    year: "",
    semester: "",
    content: "",
  });

  /*
   * ---------------------------------------------------------
   * AUTH HEADER
   * ---------------------------------------------------------
   */

  const getHeaders = () => {
    const token = localStorage.getItem("admin_token");

    return {
      "Content-Type": "application/json",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    };
  };

  const readResponse = async (response) => {
    const text = await response.text();

    if (!text) return {};

    try {
      return JSON.parse(text);
    } catch {
      return { message: text };
    }
  };

  /*
   * ---------------------------------------------------------
   * LOAD NOTES
   * ---------------------------------------------------------
   */

  const fetchNotes = useCallback(async () => {
    try {
      setError("");

      if (!localStorage.getItem("admin_token")) {
        throw new Error("Admin login session not found. Please login again.");
      }

      const response = await fetch(`${API_BASE_URL}/admin/notes`, {
        method: "GET",
        headers: getHeaders(),
      });

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Failed to load notes.");
      }

      /*
       * Supports:
       * { notes: [...] }
       * or direct [...]
       */

      const loadedNotes = Array.isArray(data)
        ? data
        : Array.isArray(data.notes)
          ? data.notes
          : [];

      setNotes(loadedNotes);
    } catch (err) {
      console.error("Fetch Notes Error:", err);

      setError(err.message || "Failed to load notes.");
    }
  }, []);

  /*
   * ---------------------------------------------------------
   * LOAD SUBJECTS
   * ---------------------------------------------------------
   */

  const fetchSubjects = useCallback(async () => {
    try {
      setSubjectsLoading(true);

      if (!localStorage.getItem("admin_token")) {
        throw new Error("Admin login session not found. Please login again.");
      }

      const response = await fetch(`${API_BASE_URL}/admin/subjects`, {
        method: "GET",
        headers: getHeaders(),
      });

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Failed to load subjects.");
      }

      const loadedSubjects = Array.isArray(data)
        ? data
        : Array.isArray(data.subjects)
          ? data.subjects
          : [];

      setSubjects(loadedSubjects);
    } catch (err) {
      console.error("Fetch Subjects Error:", err);

      /*
       * Don't block the Notes page if subjects API
       * has a problem.
       */
      setSubjects([]);
    } finally {
      setSubjectsLoading(false);
    }
  }, []);

  /*
   * ---------------------------------------------------------
   * INITIAL LOAD
   * ---------------------------------------------------------
   */

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        if (!mounted) return;

        setLoading(true);

        await Promise.all([
          fetchNotes(),
          fetchSubjects(),
        ]);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    /*
     * Small async delay prevents the React hooks lint
     * warning caused by synchronous state updates inside
     * an effect.
     */
    const timer = setTimeout(() => {
      loadData();
    }, 0);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [fetchNotes, fetchSubjects]);

  /*
   * ---------------------------------------------------------
   * REFRESH
   * ---------------------------------------------------------
   */

  const handleRefresh = async () => {
    setLoading(true);
    setError("");

    try {
      await Promise.all([
        fetchNotes(),
        fetchSubjects(),
      ]);

      toast.success("Notes refreshed.");
    } catch (err) {
      console.error("Refresh Error:", err);
      setError(err.message || "Unable to refresh notes.");
    } finally {
      setLoading(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * FILTER NOTES
   * ---------------------------------------------------------
   */

  const filteredNotes = useMemo(() => {
    const text = search.trim().toLowerCase();

    return notes.filter((note) => {
      const title = String(note.title || "").toLowerCase();

      const description = String(
        note.description || note.content || "",
      ).toLowerCase();

      const subjectName =
        typeof note.subject === "object"
          ? String(
              note.subject?.name ||
                note.subject?.title ||
                "",
            ).toLowerCase()
          : String(note.subject || "").toLowerCase();

      const matchesSearch =
        !text ||
        title.includes(text) ||
        description.includes(text) ||
        subjectName.includes(text);

      let matchesSubject = true;

      if (subjectFilter !== "all") {
        const noteSubjectId =
          typeof note.subject === "object"
            ? note.subject?._id || note.subject?.id
            : note.subject;

        matchesSubject =
          String(noteSubjectId) === String(subjectFilter);
      }

      return matchesSearch && matchesSubject;
    });
  }, [notes, search, subjectFilter]);

  /*
   * ---------------------------------------------------------
   * FORM HANDLERS
   * ---------------------------------------------------------
   */

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      subject: "",
      year: "",
      semester: "",
      content: "",
    });

    setEditingNote(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (note) => {
    setEditingNote(note);

    const subjectValue =
      typeof note.subject === "object"
        ? note.subject?._id || note.subject?.id || ""
        : note.subject || "";

    setForm({
      title: note.title || "",
      description: note.description || "",
      subject: subjectValue,
      year: note.year || "",
      semester: note.semester || "",
      content: note.content || "",
    });

    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    resetForm();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /*
   * ---------------------------------------------------------
   * SAVE NOTE
   * ---------------------------------------------------------
   */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      toast.error("Please enter note title.");
      return;
    }

    if (!form.subject) {
      toast.error("Please select a subject.");
      return;
    }

    if (!form.year) {
      toast.error("Please select the year.");
      return;
    }

    if (!form.semester) {
      toast.error("Please select the semester.");
      return;
    }

    if (!form.content.trim()) {
      toast.error("Please enter note content.");
      return;
    }

    try {
      setSaving(true);

      const isEditing = Boolean(editingNote);
      const noteId = getNoteId(editingNote);

      if (isEditing && !noteId) {
        throw new Error("Note ID is missing.");
      }

      const url = isEditing
        ? `${API_BASE_URL}/admin/notes/${noteId}`
        : `${API_BASE_URL}/admin/notes`;

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          subject: form.subject,
          year: form.year,
          semester: form.semester,
          content: form.content.trim(),
        }),
      });

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Failed to ${isEditing ? "update" : "create"} note.`,
        );
      }

      toast.success(
        isEditing
          ? "Note updated successfully."
          : "Note added successfully.",
      );

      setShowModal(false);
      resetForm();

      await fetchNotes();
    } catch (err) {
      console.error("Save Note Error:", err);

      toast.error(
        err.message ||
          "Unable to save note.",
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * DELETE NOTE
   * ---------------------------------------------------------
   */

  const handleDelete = async (id) => {
    if (!id) {
      toast.error("Note ID is missing.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this note?",
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/notes/${id}`,
        {
          method: "DELETE",
          headers: getHeaders(),
        },
      );

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete note.",
        );
      }

      toast.success("Note deleted successfully.");

      await fetchNotes();
    } catch (err) {
      console.error("Delete Note Error:", err);

      toast.error(
        err.message ||
          "Unable to delete note.",
      );
    }
  };

  /*
   * ---------------------------------------------------------
   * HELPERS
   * ---------------------------------------------------------
   */

  const getSubjectName = (note) => {
    if (!note?.subject) {
      return "No subject";
    }

    if (typeof note.subject === "object") {
      return (
        note.subject.name ||
        note.subject.title ||
        "Unknown Subject"
      );
    }

    const found = subjects.find(
      (subject) =>
        String(subject._id || subject.id) ===
        String(note.subject),
    );

    return (
      found?.name ||
      found?.title ||
      String(note.subject)
    );
  };

  const getSubjectId = (subject) => {
    return subject?._id || subject?.id || "";
  };

  /*
   * ---------------------------------------------------------
   * STATS
   * ---------------------------------------------------------
   */

  const totalNotes = notes.length;

  const uniqueSubjects = new Set(
    notes
      .map((note) => {
        if (typeof note.subject === "object") {
          return note.subject?._id || note.subject?.id;
        }

        return note.subject;
      })
      .filter(Boolean),
  ).size;

  /*
   * ---------------------------------------------------------
   * RENDER
   * ---------------------------------------------------------
   */

  return (
    <div className="admin-notes-page">
      <div className="admin-notes-container">

        {/* ============================================
            HEADER
        ============================================ */}

        <section className="page-header">

          <div className="page-header-text">
            <h1>Notes</h1>

            <p>
              View and manage study notes.
            </p>
          </div>

          <div className="header-actions">

            <button
              type="button"
              className="refresh-btn"
              onClick={handleRefresh}
              disabled={loading}
            >
              <FaSyncAlt
                className={loading ? "spin" : ""}
              />

              <span>
                {loading ? "Refreshing..." : "Refresh"}
              </span>
            </button>

            <button
              type="button"
              className="add-btn"
              onClick={openAddModal}
            >
              <FaPlus />
              <span>Add Note</span>
            </button>

          </div>

        </section>

        {/* ============================================
            ERROR
        ============================================ */}

        {error && (
          <div className="error-box">
            <span>{error}</span>

            <button
              type="button"
              onClick={handleRefresh}
            >
              Try Again
            </button>
          </div>
        )}

        {/* ============================================
            STATS
        ============================================ */}

        <section className="stats-grid">

          <div className="stat-card">

            <div className="stat-icon purple">
              <FaStickyNote />
            </div>

            <div className="stat-info">
              <span>Total Notes</span>

              <strong>
                {loading ? "..." : totalNotes}
              </strong>

              <small>
                All notes
              </small>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon blue">
              <FaBook />
            </div>

            <div className="stat-info">
              <span>Subjects</span>

              <strong>
                {subjectsLoading
                  ? "..."
                  : uniqueSubjects}
              </strong>

              <small>
                Available subjects
              </small>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon green">
              <FaSearch />
            </div>

            <div className="stat-info">
              <span>Showing</span>

              <strong>
                {loading
                  ? "..."
                  : filteredNotes.length}
              </strong>

              <small>
                Filtered notes
              </small>
            </div>

          </div>

        </section>

        {/* ============================================
            NOTES SECTION
        ============================================ */}

        <section className="notes-section">

          <div className="notes-section-header">

            <div>
              <h2>All Notes</h2>

              <p>
                Notes loaded from your database.
              </p>
            </div>

            <div className="result-count">
              {filteredNotes.length} of {notes.length}
            </div>

          </div>

          {/* SEARCH */}

          <div className="filters">

            <div className="search-box">

              <FaSearch />

              <input
                type="text"
                placeholder="Search notes..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

              {search && (
                <button
                  type="button"
                  className="clear-search"
                  onClick={() => setSearch("")}
                >
                  <FaTimes />
                </button>
              )}

            </div>

            <div className="select-box">

              <FaBook />

              <select
                value={subjectFilter}
                onChange={(e) =>
                  setSubjectFilter(e.target.value)
                }
              >
                <option value="all">
                  All Subjects
                </option>

                {subjects.map((subject) => (
                  <option
                    key={getSubjectId(subject)}
                    value={getSubjectId(subject)}
                  >
                    {subject.name ||
                      subject.title ||
                      "Unnamed Subject"}
                  </option>
                ))}
              </select>

              <FaChevronDown className="select-arrow" />

            </div>

          </div>

          {/* ============================================
              LOADING
          ============================================ */}

          {loading ? (
            <div className="loading-state">

              <FaSyncAlt className="spin" />

              <p>
                Loading notes...
              </p>

            </div>
          ) : filteredNotes.length === 0 ? (

            /* ============================================
               EMPTY
            ============================================ */

            <div className="empty-state">

              <div className="empty-icon">
                <FaStickyNote />
              </div>

              <h3>
                No Notes Found
              </h3>

              <p>
                {search || subjectFilter !== "all"
                  ? "Try changing your search or filter."
                  : "No notes have been added yet."}
              </p>

              {!search &&
                subjectFilter === "all" && (
                  <button
                    type="button"
                    onClick={openAddModal}
                    className="empty-add-btn"
                  >
                    <FaPlus />
                    Add First Note
                  </button>
                )}

            </div>
          ) : (

            /* ============================================
               NOTES LIST
            ============================================ */

            <div className="notes-list">

              {filteredNotes.map((note) => (

                <article
                  className="note-card"
                  key={getNoteId(note)}
                >

                  {/* TOP CONTENT */}

                  <div className="note-content-row">

                    <div className="note-icon">
                      <FaStickyNote />
                    </div>

                    <div className="note-main">

                      <h3>
                        {note.title ||
                          "Untitled Note"}
                      </h3>

                      <p className="note-description">
                        {note.description ||
                          note.content ||
                          "No description available."}
                      </p>

                      <div className="note-meta">

                        <span className="subject-badge">
                          <FaBook />
                          {getSubjectName(note)}
                        </span>

                        {note.year && (
                          <span className="meta-badge">
                            {note.year}
                          </span>
                        )}

                        {note.semester && (
                          <span className="meta-badge">
                            {note.semester}
                          </span>
                        )}

                      </div>

                    </div>

                  </div>

                  {/* ACTIONS */}

                  <div className="note-actions">

                    <button
                      type="button"
                      className="edit-btn"
                      onClick={() =>
                        openEditModal(note)
                      }
                    >
                      <FaEdit />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      className="delete-btn"
                      onClick={() =>
                        handleDelete(getNoteId(note))
                      }
                    >
                      <FaTrash />
                      <span>Delete</span>
                    </button>

                  </div>

                </article>

              ))}

            </div>
          )}

        </section>

      </div>

      {/* ================================================
          ADD / EDIT MODAL
      ================================================ */}

      {showModal && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget
            ) {
              closeModal();
            }
          }}
        >

          <div className="note-modal">

            <div className="modal-header">

              <div>
                <h2>
                  {editingNote
                    ? "Edit Note"
                    : "Add Note"}
                </h2>

                <p>
                  {editingNote
                    ? "Update study note details."
                    : "Create a new study note."}
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                <FaTimes />
              </button>

            </div>

            <form
              className="note-form"
              onSubmit={handleSubmit}
            >

              {/* TITLE */}

              <div className="form-group">

                <label>
                  Note Title
                </label>

                <input
                  type="text"
                  name="title"
                  placeholder="Enter note title"
                  value={form.title}
                  onChange={handleChange}
                  required
                />

              </div>

              {/* DESCRIPTION */}

              <div className="form-group">

                <label>
                  Description
                </label>

                <input
                  type="text"
                  name="description"
                  placeholder="Short description"
                  value={form.description}
                  onChange={handleChange}
                />

              </div>

              {/* SUBJECT */}

              <div className="form-group">

                <label>
                  Subject
                </label>

                <select
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  required
                >

                  <option value="">
                    Select Subject
                  </option>

                  {subjects.map((subject) => (
                    <option
                      key={getSubjectId(subject)}
                      value={getSubjectId(subject)}
                    >
                      {subject.name ||
                        subject.title ||
                        "Unnamed Subject"}
                    </option>
                  ))}

                </select>

              </div>

              {/* YEAR */}

              <div className="form-group">

                <label>
                  Year
                </label>

                <select
                  name="year"
                  value={form.year}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select Year
                  </option>
                  <option value="FY">FY</option>
                  <option value="SY">SY</option>
                  <option value="TY">TY</option>
                </select>

              </div>

              {/* SEMESTER */}

              <div className="form-group">

                <label>
                  Semester
                </label>

                <select
                  name="semester"
                  value={form.semester}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select Semester
                  </option>
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                  <option value="3">Semester 3</option>
                  <option value="4">Semester 4</option>
                  <option value="5">Semester 5</option>
                  <option value="6">Semester 6</option>
                </select>

              </div>

              {/* CONTENT */}

              <div className="form-group">

                <label>
                  Note Content
                </label>

                <textarea
                  name="content"
                  placeholder="Write your note content..."
                  value={form.content}
                  onChange={handleChange}
                  rows={7}
                  required
                />

              </div>

              {/* MODAL ACTIONS */}

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-btn"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <FaSyncAlt className="spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave />
                      {editingNote
                        ? "Update Note"
                        : "Save Note"}
                    </>
                  )}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* ================================================
          STYLES
      ================================================ */}

      <style>{`

        * {
          box-sizing: border-box;
        }

        .admin-notes-page {
          width: 100%;
          min-height: 100vh;
          color: #ffffff;
        }

        .admin-notes-container {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
        }

        /* ==============================
           HEADER
        ============================== */

        .page-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 25px;
          margin-bottom: 30px;
        }

        .page-header-text h1 {
          margin: 0;
          color: #ffffff;
          font-size: 42px;
          line-height: 1.15;
          font-weight: 750;
        }

        .page-header-text p {
          margin: 10px 0 0;
          color: #64748b;
          font-size: 17px;
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .refresh-btn,
        .add-btn {
          min-height: 52px;
          border-radius: 12px;
          border: 1px solid #26354d;
          padding: 0 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .refresh-btn {
          background: #0f172a;
          color: #cbd5e1;
        }

        .refresh-btn:hover {
          border-color: #475569;
          background: #162033;
        }

        .add-btn {
          border: none;
          background: #8b5cf6;
          color: white;
          min-width: 145px;
        }

        .add-btn:hover {
          background: #7c3aed;
          transform: translateY(-1px);
        }

        .refresh-btn:disabled,
        .add-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* ==============================
           ERROR
        ============================== */

        .error-box {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;

          margin-bottom: 25px;
          padding: 15px 18px;

          border: 1px solid #7f1d1d;
          border-radius: 12px;

          background: #450a0a;
          color: #fecaca;
        }

        .error-box button {
          border: none;
          border-radius: 8px;
          padding: 8px 14px;
          background: #ef4444;
          color: white;
          cursor: pointer;
          font-weight: 600;
        }

        /* ==============================
           STATS
        ============================== */

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
          margin-bottom: 25px;
        }

        .stat-card {
          min-height: 135px;

          display: flex;
          align-items: center;
          gap: 18px;

          padding: 22px;

          background: #0f172a;
          border: 1px solid #1e293b;
          border-radius: 18px;
        }

        .stat-icon {
          width: 58px;
          height: 58px;
          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 15px;
          font-size: 22px;
        }

        .stat-icon.purple {
          background: #312e81;
          color: #a78bfa;
        }

        .stat-icon.blue {
          background: #172554;
          color: #93c5fd;
        }

        .stat-icon.green {
          background: #064e3b;
          color: #6ee7b7;
        }

        .stat-info {
          min-width: 0;
        }

        .stat-info span {
          display: block;
          color: #94a3b8;
          font-size: 14px;
          margin-bottom: 4px;
        }

        .stat-info strong {
          display: block;
          color: white;
          font-size: 30px;
          line-height: 1.1;
        }

        .stat-info small {
          display: block;
          color: #64748b;
          margin-top: 5px;
          font-size: 12px;
        }

        /* ==============================
           NOTES SECTION
        ============================== */

        .notes-section {
          background: #0f172a;
          border: 1px solid #1e293b;
          border-radius: 20px;
          padding: 28px;
          overflow: hidden;
        }

        .notes-section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 22px;
        }

        .notes-section-header h2 {
          margin: 0;
          color: white;
          font-size: 25px;
        }

        .notes-section-header p {
          margin: 6px 0 0;
          color: #64748b;
          font-size: 14px;
        }

        .result-count {
          color: #a78bfa;
          background: #312e81;
          border-radius: 8px;
          padding: 7px 11px;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
        }

        /* ==============================
           FILTERS
        ============================== */

        .filters {
          display: grid;
          grid-template-columns: 1fr 280px;
          gap: 12px;
          margin-bottom: 8px;
        }

        .search-box,
        .select-box {
          position: relative;

          min-height: 52px;

          display: flex;
          align-items: center;

          background: #020617;
          border: 1px solid #334155;
          border-radius: 12px;
        }

        .search-box > svg,
        .select-box > svg:first-child {
          margin-left: 15px;
          color: #64748b;
          flex-shrink: 0;
        }

        .search-box input,
        .select-box select {
          width: 100%;
          height: 50px;

          padding: 0 14px;

          background: transparent;
          border: none;
          outline: none;

          color: #e2e8f0;
          font-size: 14px;
        }

        .search-box input::placeholder {
          color: #64748b;
        }

        .select-box select {
          appearance: none;
          padding-right: 40px;
          cursor: pointer;
        }

        .select-box select option {
          background: #0f172a;
          color: white;
        }

        .select-arrow {
          position: absolute;
          right: 15px;
          color: #64748b;
          pointer-events: none;
        }

        .clear-search {
          margin-right: 10px;
          width: 28px;
          height: 28px;

          border: none;
          border-radius: 7px;

          display: flex;
          align-items: center;
          justify-content: center;

          background: #1e293b;
          color: #94a3b8;

          cursor: pointer;
        }

        /* ==============================
           NOTE LIST
        ============================== */

        .notes-list {
          width: 100%;
        }

        .note-card {
          width: 100%;

          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 25px;

          padding: 22px 0;

          border-bottom: 1px solid #1e293b;
        }

        .note-card:last-child {
          border-bottom: none;
        }

        .note-content-row {
          min-width: 0;
          flex: 1;

          display: flex;
          align-items: flex-start;
          gap: 16px;
        }

        .note-icon {
          width: 58px;
          height: 58px;
          min-width: 58px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 15px;

          background: #312e81;
          color: #a78bfa;

          font-size: 21px;
        }

        .note-main {
          min-width: 0;
          flex: 1;
        }

        .note-main h3 {
          margin: 0 0 7px;

          color: #ffffff;
          font-size: 19px;
          line-height: 1.35;

          overflow-wrap: anywhere;
        }

        .note-description {
          margin: 0 0 12px;

          color: #64748b;
          font-size: 14px;
          line-height: 1.6;

          overflow-wrap: anywhere;
        }

        .note-meta {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 7px;
        }

        .subject-badge,
        .meta-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;

          min-height: 30px;

          padding: 5px 9px;

          border-radius: 8px;

          font-size: 11px;
          font-weight: 600;
        }

        .subject-badge {
          background: #312e81;
          color: #a78bfa;
        }

        .meta-badge {
          background: #1e293b;
          color: #cbd5e1;
        }

        .note-actions {
          width: 190px;
          min-width: 190px;

          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .edit-btn,
        .delete-btn {
          width: 100%;
          min-height: 44px;

          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;

          border: none;
          border-radius: 10px;

          font-size: 13px;
          font-weight: 700;

          cursor: pointer;
          transition: 0.2s ease;
        }

        .edit-btn {
          background: #1e293b;
          color: #a78bfa;
        }

        .edit-btn:hover {
          background: #293548;
        }

        .delete-btn {
          background: #450a0a;
          color: #fca5a5;
        }

        .delete-btn:hover {
          background: #5f0909;
        }

        /* ==============================
           LOADING / EMPTY
        ============================== */

        .loading-state,
        .empty-state {
          min-height: 260px;

          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          text-align: center;
        }

        .loading-state svg {
          color: #8b5cf6;
          font-size: 25px;
        }

        .loading-state p {
          color: #64748b;
          margin-top: 12px;
        }

        .empty-icon {
          width: 70px;
          height: 70px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 18px;

          background: #312e81;
          color: #a78bfa;

          font-size: 28px;
        }

        .empty-state h3 {
          margin: 15px 0 5px;
          color: white;
        }

        .empty-state p {
          margin: 0;
          color: #64748b;
          font-size: 14px;
        }

        .empty-add-btn {
          margin-top: 18px;

          border: none;
          border-radius: 9px;

          background: #8b5cf6;
          color: white;

          padding: 11px 16px;

          display: flex;
          align-items: center;
          gap: 8px;

          cursor: pointer;
          font-weight: 700;
        }

        /* ==============================
           MODAL
        ============================== */

        .modal-overlay {
          position: fixed;
          inset: 0;

          z-index: 1000;

          padding: 20px;

          display: flex;
          align-items: center;
          justify-content: center;

          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(5px);
        }

        .note-modal {
          width: 100%;
          max-width: 600px;
          max-height: 90vh;

          overflow-y: auto;

          background: #0f172a;
          border: 1px solid #334155;
          border-radius: 18px;

          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;

          padding: 22px;

          border-bottom: 1px solid #1e293b;
        }

        .modal-header h2 {
          margin: 0;
          color: white;
          font-size: 22px;
        }

        .modal-header p {
          margin: 5px 0 0;
          color: #64748b;
          font-size: 13px;
        }

        .modal-close {
          width: 36px;
          height: 36px;

          border: none;
          border-radius: 9px;

          display: flex;
          align-items: center;
          justify-content: center;

          background: #1e293b;
          color: #94a3b8;

          cursor: pointer;
        }

        .note-form {
          padding: 22px;
        }

        .form-group {
          margin-bottom: 18px;
        }

        .form-group label {
          display: block;
          margin-bottom: 7px;

          color: #cbd5e1;

          font-size: 13px;
          font-weight: 700;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;

          border: 1px solid #334155;
          border-radius: 10px;

          background: #020617;
          color: white;

          outline: none;

          padding: 12px;

          font-family: inherit;
          font-size: 14px;
        }

        .form-group input,
        .form-group select {
          min-height: 48px;
        }

        .form-group textarea {
          resize: vertical;
          line-height: 1.6;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          border-color: #8b5cf6;
        }

        .form-group select option {
          background: #0f172a;
          color: white;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;

          padding-top: 5px;
        }

        .cancel-btn,
        .save-btn {
          min-height: 45px;

          border: none;
          border-radius: 9px;

          padding: 0 18px;

          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;

          cursor: pointer;

          font-weight: 700;
        }

        .cancel-btn {
          background: #1e293b;
          color: #cbd5e1;
        }

        .save-btn {
          background: #8b5cf6;
          color: white;
        }

        .save-btn:hover {
          background: #7c3aed;
        }

        /* ==============================
           ANIMATION
        ============================== */

        .spin {
          animation: spin 0.9s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        /* ==============================
           TABLET
        ============================== */

        @media (max-width: 900px) {

          .page-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .header-actions {
            width: 100%;
          }

          .refresh-btn,
          .add-btn {
            flex: 1;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .note-card {
            flex-direction: column;
          }

          .note-actions {
            width: 100%;
            min-width: 0;

            display: grid;
            grid-template-columns: 1fr 1fr;
          }

        }

        /* ==============================
           MOBILE
        ============================== */

        @media (max-width: 768px) {

          .admin-notes-page {
            width: 100%;
          }

          .admin-notes-container {
            width: 100%;
            max-width: 100%;
          }

          .page-header {
            margin-bottom: 20px;
            gap: 15px;
          }

          .page-header-text h1 {
            font-size: 32px;
          }

          .page-header-text p {
            font-size: 14px;
            line-height: 1.5;
          }

          .header-actions {
            display: grid;
            grid-template-columns: 1fr;
            width: 100%;
            gap: 9px;
          }

          .refresh-btn,
          .add-btn {
            width: 100%;
            min-height: 48px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .stat-card {
            min-height: 105px;
            padding: 17px;
            border-radius: 15px;
          }

          .stat-icon {
            width: 48px;
            height: 48px;
            min-width: 48px;
            border-radius: 13px;
            font-size: 18px;
          }

          .stat-info span {
            font-size: 12px;
          }

          .stat-info strong {
            font-size: 25px;
          }

          .notes-section {
            padding: 16px;
            border-radius: 16px;
          }

          .notes-section-header {
            display: block;
            margin-bottom: 16px;
          }

          .notes-section-header h2 {
            font-size: 21px;
          }

          .notes-section-header p {
            font-size: 12px;
          }

          .result-count {
            display: inline-block;
            margin-top: 10px;
          }

          .filters {
            grid-template-columns: 1fr;
            gap: 9px;
          }

          .search-box,
          .select-box {
            min-height: 48px;
          }

          .search-box input,
          .select-box select {
            height: 46px;
            font-size: 13px;
          }

          /*
           * IMPORTANT:
           * Mobile note card uses separate rows.
           * Buttons NEVER overlap the content.
           */

          .note-card {
            display: block;
            width: 100%;

            padding: 18px 0;
          }

          .note-content-row {
            display: grid;

            grid-template-columns: 46px minmax(0, 1fr);

            gap: 11px;

            width: 100%;
          }

          .note-icon {
            width: 46px;
            height: 46px;
            min-width: 46px;

            border-radius: 12px;

            font-size: 17px;
          }

          .note-main {
            width: 100%;
            min-width: 0;
          }

          .note-main h3 {
            font-size: 16px;
            line-height: 1.35;

            margin-bottom: 6px;
          }

          .note-description {
            font-size: 12px;
            line-height: 1.55;

            margin-bottom: 10px;

            /*
             * DO NOT limit height.
             * This prevents text from being hidden.
             */
            max-height: none;
            overflow: visible;
          }

          .note-meta {
            width: 100%;
            gap: 5px;
          }

          .subject-badge,
          .meta-badge {
            font-size: 10px;
            min-height: 27px;
            padding: 4px 7px;
          }

          /*
           * ACTIONS ARE A SEPARATE ROW
           */

          .note-actions {
            width: 100%;
            min-width: 0;

            display: grid;
            grid-template-columns: 1fr 1fr;

            gap: 8px;

            margin-top: 14px;
          }

          .edit-btn,
          .delete-btn {
            min-height: 43px;
            border-radius: 9px;

            font-size: 12px;
          }

          .error-box {
            flex-direction: column;
            align-items: stretch;
          }

          .modal-overlay {
            padding: 12px;
            align-items: flex-end;
          }

          .note-modal {
            max-height: 92vh;
            border-radius: 18px 18px 0 0;
          }

          .modal-header {
            padding: 18px;
          }

          .note-form {
            padding: 18px;
          }

          .modal-actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
          }

          .cancel-btn,
          .save-btn {
            width: 100%;
          }

        }

        /* ==============================
           SMALL PHONE
        ============================== */

        @media (max-width: 420px) {

          .page-header-text h1 {
            font-size: 29px;
          }

          .notes-section {
            padding: 13px;
          }

          .note-content-row {
            grid-template-columns: 42px minmax(0, 1fr);
            gap: 9px;
          }

          .note-icon {
            width: 42px;
            height: 42px;
            min-width: 42px;
          }

          .note-main h3 {
            font-size: 15px;
          }

          .note-description {
            font-size: 11px;
          }

          .note-actions {
            grid-template-columns: 1fr;
            gap: 7px;
          }

          .edit-btn,
          .delete-btn {
            min-height: 40px;
          }

          .stat-card {
            padding: 14px;
          }

        }

      `}</style>
    </div>
  );
}

export default AdminNotes;