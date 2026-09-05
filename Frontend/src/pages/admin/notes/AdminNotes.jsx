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
  FaLayerGroup,
} from "react-icons/fa";
import toast from "react-hot-toast";

import API_URL from "../../../config/api";

const API_ROOT = String(API_URL || "").replace(/\/+$/, "");
const API_BASE_URL = API_ROOT.endsWith("/api") ? API_ROOT : `${API_ROOT}/api`;

const getNoteId = (note) => note?._id || note?.id || "";

const getSubjectId = (subject) => subject?._id || subject?.id || "";

const getUnitId = (unit) => unit?._id || unit?.id || "";

const getUnitName = (unit, index = 0) =>
  unit?.name || unit?.title || `Unit ${index + 1}`;

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
    unit: "",
    year: "",
    semester: "",
    content: "",
  });

  /*
  =========================================================
  AUTH
  =========================================================
  */

  const getHeaders = useCallback(() => {
    const token = localStorage.getItem("admin_token");

    return {
      "Content-Type": "application/json",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    };
  }, []);

  const readResponse = async (response) => {
    const text = await response.text();

    if (!text) return {};

    try {
      return JSON.parse(text);
    } catch {
      return {
        message: text,
      };
    }
  };

  /*
  =========================================================
  GET SUBJECTS
  =========================================================
  */

  const fetchSubjects = useCallback(async () => {
    try {
      setSubjectsLoading(true);

      const token = localStorage.getItem("admin_token");

      if (!token) {
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
      setSubjects([]);
    } finally {
      setSubjectsLoading(false);
    }
  }, [getHeaders]);

  /*
  =========================================================
  GET NOTES
  =========================================================
  */

  const fetchNotes = useCallback(async () => {
    try {
      setError("");

      const token = localStorage.getItem("admin_token");

      if (!token) {
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
  }, [getHeaders]);

  /*
  =========================================================
  INITIAL LOAD
  =========================================================
  */

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);

        await Promise.all([fetchNotes(), fetchSubjects()]);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [fetchNotes, fetchSubjects]);

  /*
  =========================================================
  REFRESH
  =========================================================
  */

  const handleRefresh = async () => {
    setLoading(true);
    setError("");

    try {
      await Promise.all([fetchNotes(), fetchSubjects()]);

      toast.success("Notes refreshed.");
    } catch (err) {
      console.error("Refresh Error:", err);
      setError(err.message || "Unable to refresh notes.");
    } finally {
      setLoading(false);
    }
  };

  /*
  =========================================================
  SELECTED SUBJECT
  =========================================================
  */

  const selectedSubject = useMemo(() => {
    return subjects.find(
      (subject) => String(getSubjectId(subject)) === String(form.subject),
    );
  }, [subjects, form.subject]);

  const selectedUnits = useMemo(() => {
    return Array.isArray(selectedSubject?.units) ? selectedSubject.units : [];
  }, [selectedSubject]);

  /*
  =========================================================
  FILTER
  =========================================================
  */

  const filteredNotes = useMemo(() => {
    const text = search.trim().toLowerCase();

    return notes.filter((note) => {
      const title = String(note?.title || "").toLowerCase();

      const description = String(
        note?.description || note?.content || "",
      ).toLowerCase();

      const subjectName =
        typeof note?.subject === "object"
          ? String(
              note.subject?.name || note.subject?.title || "",
            ).toLowerCase()
          : String(note?.subject || "").toLowerCase();

      const matchesSearch =
        !text ||
        title.includes(text) ||
        description.includes(text) ||
        subjectName.includes(text);

      if (subjectFilter === "all") {
        return matchesSearch;
      }

      const noteSubjectId =
        typeof note?.subject === "object"
          ? getSubjectId(note.subject)
          : note.subject;

      return matchesSearch && String(noteSubjectId) === String(subjectFilter);
    });
  }, [notes, search, subjectFilter]);

  /*
  =========================================================
  FORM
  =========================================================
  */

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      subject: "",
      unit: "",
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
    const noteSubjectId =
      typeof note?.subject === "object"
        ? getSubjectId(note.subject)
        : note?.subject || "";

    setEditingNote(note);

    setForm({
      title: note?.title || "",
      description: note?.description || "",
      subject: noteSubjectId || "",
      unit: note?.unit || "",
      year: note?.year || "",
      semester: note?.semester || "",
      content: note?.content || "",
    });

    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    resetForm();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubjectChange = (event) => {
    const subjectId = event.target.value;

    setForm((previous) => ({
      ...previous,
      subject: subjectId,
      unit: "",
    }));
  };

  /*
  =========================================================
  SAVE NOTE
  =========================================================
  */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      toast.error("Please enter note title.");
      return;
    }

    if (!form.subject) {
      toast.error("Please select a subject.");
      return;
    }

    if (!form.unit) {
      toast.error("Please select a unit.");
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

    const validUnit = selectedUnits.some(
      (unit) => String(getUnitId(unit)) === String(form.unit),
    );

    if (!validUnit) {
      toast.error("Selected unit does not belong to this subject.");
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

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          subject: form.subject,
          unit: String(form.unit),
          year: form.year,
          semester: form.semester,
          content: form.content.trim(),
        }),
      });

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message || `Failed to ${isEditing ? "update" : "create"} note.`,
        );
      }

      toast.success(
        isEditing ? "Note updated successfully." : "Note added successfully.",
      );

      setShowModal(false);
      resetForm();

      await fetchNotes();
    } catch (err) {
      console.error("Save Note Error:", err);

      toast.error(err.message || "Unable to save note.");
    } finally {
      setSaving(false);
    }
  };

  /*
  =========================================================
  DELETE
  =========================================================
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
      const response = await fetch(`${API_BASE_URL}/admin/notes/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete note.");
      }

      toast.success("Note deleted successfully.");

      await fetchNotes();
    } catch (err) {
      console.error("Delete Note Error:", err);

      toast.error(err.message || "Unable to delete note.");
    }
  };

  /*
  =========================================================
  HELPERS
  =========================================================
  */

  const getSubjectName = (note) => {
    if (!note?.subject) {
      return "No subject";
    }

    if (typeof note.subject === "object") {
      return note.subject?.name || note.subject?.title || "Unknown Subject";
    }

    const subject = subjects.find(
      (item) => String(getSubjectId(item)) === String(note.subject),
    );

    return subject?.name || subject?.title || String(note.subject);
  };

  const getNoteUnitName = (note) => {
    const subject =
      typeof note?.subject === "object"
        ? note.subject
        : subjects.find(
            (item) => String(getSubjectId(item)) === String(note?.subject),
          );

    const units = Array.isArray(subject?.units) ? subject.units : [];

    const index = units.findIndex(
      (unit) => String(getUnitId(unit)) === String(note?.unit),
    );

    if (index >= 0) {
      return getUnitName(units[index], index);
    }

    return note?.unit ? `Unit ${note.unit}` : "Unit not assigned";
  };

  const totalNotes = notes.length;

  const uniqueSubjects = new Set(
    notes
      .map((note) => {
        if (typeof note?.subject === "object") {
          return getSubjectId(note.subject);
        }

        return note?.subject;
      })
      .filter(Boolean),
  ).size;

  /*
  =========================================================
  RENDER
  =========================================================
  */

  return (
    <div className="admin-notes-page">
      <div className="admin-notes-container">
        {/* HEADER */}

        <section className="page-header">
          <div>
            <span className="page-label">STUDY MATERIAL</span>

            <h1>Notes</h1>

            <p>Create and manage unit-wise study notes.</p>
          </div>

          <div className="header-actions">
            <button
              type="button"
              className="refresh-btn"
              onClick={handleRefresh}
              disabled={loading}
            >
              <FaSyncAlt className={loading ? "spin" : ""} />

              {loading ? "Refreshing..." : "Refresh"}
            </button>

            <button type="button" className="add-btn" onClick={openAddModal}>
              <FaPlus />
              Add Note
            </button>
          </div>
        </section>

        {/* ERROR */}

        {error && (
          <div className="error-box">
            <span>{error}</span>

            <button type="button" onClick={handleRefresh}>
              Try Again
            </button>
          </div>
        )}

        {/* STATS */}

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon purple">
              <FaStickyNote />
            </div>

            <div>
              <span>Total Notes</span>
              <strong>{loading ? "..." : totalNotes}</strong>
              <small>Notes in database</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue">
              <FaBook />
            </div>

            <div>
              <span>Subjects</span>
              <strong>{subjectsLoading ? "..." : uniqueSubjects}</strong>
              <small>Subjects with notes</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">
              <FaLayerGroup />
            </div>

            <div>
              <span>Showing</span>
              <strong>{loading ? "..." : filteredNotes.length}</strong>
              <small>Filtered notes</small>
            </div>
          </div>
        </section>

        {/* NOTES */}

        <section className="notes-section">
          <div className="section-header">
            <div>
              <h2>All Notes</h2>

              <p>Every note is connected to a subject and unit.</p>
            </div>

            <span className="result-count">
              {filteredNotes.length} / {notes.length}
            </span>
          </div>

          {/* FILTERS */}

          <div className="filters">
            <div className="search-box">
              <FaSearch />

              <input
                type="text"
                placeholder="Search notes..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />

              {search && (
                <button type="button" onClick={() => setSearch("")}>
                  <FaTimes />
                </button>
              )}
            </div>

            <div className="select-box">
              <FaBook />

              <select
                value={subjectFilter}
                onChange={(event) => setSubjectFilter(event.target.value)}
              >
                <option value="all">All Subjects</option>

                {subjects.map((subject) => (
                  <option
                    key={getSubjectId(subject)}
                    value={getSubjectId(subject)}
                  >
                    {subject.name || subject.title || "Unnamed Subject"}
                  </option>
                ))}
              </select>

              <FaChevronDown />
            </div>
          </div>

          {/* CONTENT */}

          {loading ? (
            <div className="state-box">
              <FaSyncAlt className="spin" />
              <p>Loading notes...</p>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="state-box empty">
              <div className="empty-icon">
                <FaStickyNote />
              </div>

              <h3>No Notes Found</h3>

              <p>
                {search || subjectFilter !== "all"
                  ? "Try changing your search or subject filter."
                  : "No notes have been added yet."}
              </p>

              {!search && subjectFilter === "all" && (
                <button
                  type="button"
                  className="empty-add-btn"
                  onClick={openAddModal}
                >
                  <FaPlus />
                  Add First Note
                </button>
              )}
            </div>
          ) : (
            <div className="notes-list">
              {filteredNotes.map((note) => (
                <article className="note-card" key={getNoteId(note)}>
                  <div className="note-main-row">
                    <div className="note-icon">
                      <FaStickyNote />
                    </div>

                    <div className="note-info">
                      <h3>{note.title || "Untitled Note"}</h3>

                      <p className="description">
                        {note.description || "No description"}
                      </p>

                      <div className="meta">
                        <span className="subject-badge">
                          <FaBook />
                          {getSubjectName(note)}
                        </span>

                        <span className="unit-badge">
                          <FaLayerGroup />
                          {getNoteUnitName(note)}
                        </span>

                        {note.year && (
                          <span className="meta-badge">{note.year}</span>
                        )}

                        {note.semester && (
                          <span className="meta-badge">
                            Semester {note.semester}
                          </span>
                        )}
                      </div>

                      <div className="content-preview">
                        {note.content || "No note content available."}
                      </div>
                    </div>
                  </div>

                  <div className="note-actions">
                    <button
                      type="button"
                      className="edit-btn"
                      onClick={() => openEditModal(note)}
                    >
                      <FaEdit />
                      Edit
                    </button>

                    <button
                      type="button"
                      className="delete-btn"
                      onClick={() => handleDelete(getNoteId(note))}
                    >
                      <FaTrash />
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ADD / EDIT MODAL */}

      {showModal && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="note-modal">
            <div className="modal-header">
              <div>
                <span className="modal-label">
                  {editingNote ? "UPDATE NOTE" : "NEW NOTE"}
                </span>

                <h2>{editingNote ? "Edit Note" : "Add Note"}</h2>

                <p>Add actual study content for a specific unit.</p>
              </div>

              <button
                type="button"
                className="close-btn"
                onClick={closeModal}
                disabled={saving}
              >
                <FaTimes />
              </button>
            </div>

            <form className="note-form" onSubmit={handleSubmit}>
              {/* TITLE */}

              <div className="form-group">
                <label>Note Title</label>

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Introduction to HTML"
                  required
                />
              </div>

              {/* DESCRIPTION */}

              <div className="form-group">
                <label>Description</label>

                <input
                  type="text"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Short description of this note"
                />
              </div>

              {/* SUBJECT */}

              <div className="form-group">
                <label>Subject</label>

                <select
                  name="subject"
                  value={form.subject}
                  onChange={handleSubjectChange}
                  required
                >
                  <option value="">Select Subject</option>

                  {subjects.map((subject) => (
                    <option
                      key={getSubjectId(subject)}
                      value={getSubjectId(subject)}
                    >
                      {subject.name || subject.title || "Unnamed Subject"}
                    </option>
                  ))}
                </select>
              </div>

              {/* UNIT */}

              <div className="form-group">
                <label>Unit</label>

                <select
                  name="unit"
                  value={form.unit}
                  onChange={handleChange}
                  required
                  disabled={!form.subject}
                >
                  <option value="">
                    {!form.subject
                      ? "Select Subject First"
                      : selectedUnits.length
                        ? "Select Unit"
                        : "No units available"}
                  </option>

                  {selectedUnits.map((unit, index) => (
                    <option key={getUnitId(unit)} value={getUnitId(unit)}>
                      {getUnitName(unit, index)}
                    </option>
                  ))}
                </select>

                {form.subject && selectedUnits.length === 0 && (
                  <small className="field-warning">
                    Add units to this subject first from Admin Subjects.
                  </small>
                )}
              </div>

              {/* YEAR */}

              <div className="form-row">
                <div className="form-group">
                  <label>Year</label>

                  <select
                    name="year"
                    value={form.year}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Year</option>
                    <option value="FY">FY</option>
                    <option value="SY">SY</option>
                    <option value="TY">TY</option>
                  </select>
                </div>

                {/* SEMESTER */}

                <div className="form-group">
                  <label>Semester</label>

                  <select
                    name="semester"
                    value={form.semester}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Semester</option>

                    <option value="1">Semester 1</option>

                    <option value="2">Semester 2</option>

                    <option value="3">Semester 3</option>

                    <option value="4">Semester 4</option>

                    <option value="5">Semester 5</option>

                    <option value="6">Semester 6</option>
                  </select>
                </div>
              </div>

              {/* CONTENT */}

              <div className="form-group">
                <label>Note Content</label>

                <textarea
                  name="content"
                  value={form.content}
                  onChange={handleChange}
                  placeholder={
                    "Write the actual study notes here...\n\nExample:\nHTML is a markup language used to structure web pages.\n\nImportant points:\n• HTML uses elements and tags.\n• <h1> is used for headings.\n• <p> is used for paragraphs."
                  }
                  rows={12}
                  required
                />

                <small className="content-help">
                  This content is saved in MongoDB and displayed directly to
                  students.
                </small>
              </div>

              {/* ACTIONS */}

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
                  disabled={saving || !form.subject || !form.unit}
                >
                  {saving ? (
                    <>
                      <FaSyncAlt className="spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave />
                      {editingNote ? "Update Note" : "Save Note"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        * {
          box-sizing: border-box;
        }

        .admin-notes-page {
          width: 100%;
          min-height: 100vh;
          color: #fff;
        }

        .admin-notes-container {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 25px;
          margin-bottom: 30px;
        }

        .page-label,
        .modal-label {
          display: inline-block;
          color: #a78bfa;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.5px;
          margin-bottom: 7px;
        }

        .page-header h1 {
          margin: 0;
          font-size: 42px;
          line-height: 1.1;
          font-weight: 800;
        }

        .page-header p {
          margin: 10px 0 0;
          color: #64748b;
          font-size: 16px;
        }

        .header-actions {
          display: flex;
          gap: 10px;
        }

        .refresh-btn,
        .add-btn {
          min-height: 50px;
          padding: 0 20px;
          border-radius: 11px;
          border: 1px solid #26354d;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .refresh-btn {
          background: #0f172a;
          color: #cbd5e1;
        }

        .refresh-btn:hover {
          background: #162033;
          border-color: #475569;
        }

        .add-btn {
          min-width: 135px;
          border: none;
          background: #8b5cf6;
          color: #fff;
        }

        .add-btn:hover {
          background: #7c3aed;
          transform: translateY(-1px);
        }

        .refresh-btn:disabled,
        .add-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .error-box {
          margin-bottom: 22px;
          padding: 14px 17px;
          border: 1px solid #7f1d1d;
          border-radius: 11px;
          background: #450a0a;
          color: #fecaca;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
        }

        .error-box button {
          border: none;
          border-radius: 8px;
          padding: 8px 13px;
          background: #ef4444;
          color: #fff;
          font-weight: 700;
          cursor: pointer;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
          margin-bottom: 24px;
        }

        .stat-card {
          min-height: 125px;
          padding: 21px;
          background: #0f172a;
          border: 1px solid #1e293b;
          border-radius: 17px;
          display: flex;
          align-items: center;
          gap: 17px;
        }

        .stat-icon {
          width: 57px;
          height: 57px;
          min-width: 57px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 21px;
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

        .stat-card span {
          display: block;
          color: #94a3b8;
          font-size: 13px;
          margin-bottom: 4px;
        }

        .stat-card strong {
          display: block;
          color: #fff;
          font-size: 29px;
        }

        .stat-card small {
          display: block;
          margin-top: 4px;
          color: #64748b;
          font-size: 11px;
        }

        .notes-section {
          padding: 27px;
          background: #0f172a;
          border: 1px solid #1e293b;
          border-radius: 20px;
          overflow: hidden;
        }

        .section-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 20px;
        }

        .section-header h2 {
          margin: 0;
          font-size: 25px;
        }

        .section-header p {
          margin: 6px 0 0;
          color: #64748b;
          font-size: 13px;
        }

        .result-count {
          padding: 7px 11px;
          border-radius: 8px;
          background: #312e81;
          color: #c4b5fd;
          font-size: 12px;
          font-weight: 800;
          white-space: nowrap;
        }

        .filters {
          display: grid;
          grid-template-columns: 1fr 280px;
          gap: 12px;
          margin-bottom: 10px;
        }

        .search-box,
        .select-box {
          position: relative;
          min-height: 50px;
          background: #020617;
          border: 1px solid #334155;
          border-radius: 11px;
          display: flex;
          align-items: center;
        }

        .search-box > svg,
        .select-box > svg:first-child {
          margin-left: 14px;
          color: #64748b;
          flex-shrink: 0;
        }

        .search-box input,
        .select-box select {
          width: 100%;
          height: 48px;
          padding: 0 13px;
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
          color: #fff;
        }

        .select-box > svg:last-child {
          position: absolute;
          right: 14px;
          color: #64748b;
          pointer-events: none;
        }

        .search-box button {
          width: 29px;
          height: 29px;
          margin-right: 8px;
          border: none;
          border-radius: 7px;
          background: #1e293b;
          color: #94a3b8;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .notes-list {
          width: 100%;
        }

        .note-card {
          padding: 23px 0;
          border-bottom: 1px solid #1e293b;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 25px;
        }

        .note-card:last-child {
          border-bottom: none;
        }

        .note-main-row {
          min-width: 0;
          flex: 1;
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }

        .note-icon {
          width: 57px;
          height: 57px;
          min-width: 57px;
          border-radius: 14px;
          background: #312e81;
          color: #a78bfa;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 21px;
        }

        .note-info {
          min-width: 0;
          flex: 1;
        }

        .note-info h3 {
          margin: 0 0 7px;
          font-size: 19px;
          overflow-wrap: anywhere;
        }

        .description {
          margin: 0 0 11px;
          color: #94a3b8;
          font-size: 13px;
          line-height: 1.55;
        }

        .meta {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          margin-bottom: 13px;
        }

        .subject-badge,
        .unit-badge,
        .meta-badge {
          min-height: 29px;
          padding: 5px 9px;
          border-radius: 8px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          font-weight: 700;
        }

        .subject-badge {
          background: #312e81;
          color: #c4b5fd;
        }

        .unit-badge {
          background: #064e3b;
          color: #6ee7b7;
        }

        .meta-badge {
          background: #1e293b;
          color: #cbd5e1;
        }

        .content-preview {
          max-width: 850px;
          padding: 13px 15px;
          border-left: 3px solid #8b5cf6;
          border-radius: 7px;
          background: #020617;
          color: #cbd5e1;
          font-size: 13px;
          line-height: 1.65;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
          max-height: 150px;
          overflow: hidden;
        }

        .note-actions {
          width: 175px;
          min-width: 175px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .edit-btn,
        .delete-btn {
          min-height: 43px;
          border: none;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
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

        .state-box {
          min-height: 280px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: #64748b;
        }

        .state-box > svg {
          color: #8b5cf6;
          font-size: 25px;
        }

        .state-box.empty .empty-icon {
          width: 70px;
          height: 70px;
          border-radius: 17px;
          background: #312e81;
          color: #a78bfa;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
        }

        .state-box h3 {
          margin: 15px 0 5px;
          color: #fff;
        }

        .state-box p {
          margin: 7px 0 0;
          font-size: 13px;
        }

        .empty-add-btn {
          margin-top: 17px;
          padding: 10px 15px;
          border: none;
          border-radius: 8px;
          background: #8b5cf6;
          color: #fff;
          display: flex;
          align-items: center;
          gap: 7px;
          cursor: pointer;
          font-weight: 700;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          padding: 20px;
          background: rgba(0, 0, 0, 0.78);
          backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .note-modal {
          width: 100%;
          max-width: 680px;
          max-height: 92vh;
          overflow-y: auto;
          background: #0f172a;
          border: 1px solid #334155;
          border-radius: 18px;
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.55);
        }

        .modal-header {
          padding: 21px 22px;
          border-bottom: 1px solid #1e293b;
          display: flex;
          justify-content: space-between;
          gap: 20px;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 23px;
        }

        .modal-header p {
          margin: 5px 0 0;
          color: #64748b;
          font-size: 12px;
        }

        .close-btn {
          width: 36px;
          height: 36px;
          border: none;
          border-radius: 9px;
          background: #1e293b;
          color: #94a3b8;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .note-form {
          padding: 22px;
        }

        .form-group {
          margin-bottom: 17px;
        }

        .form-group label {
          display: block;
          margin-bottom: 7px;
          color: #cbd5e1;
          font-size: 12px;
          font-weight: 800;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          border: 1px solid #334155;
          border-radius: 10px;
          background: #020617;
          color: #fff;
          outline: none;
          padding: 12px;
          font-family: inherit;
          font-size: 13px;
        }

        .form-group input,
        .form-group select {
          min-height: 47px;
        }

        .form-group textarea {
          resize: vertical;
          min-height: 230px;
          line-height: 1.65;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          border-color: #8b5cf6;
        }

        .form-group select option {
          background: #0f172a;
          color: #fff;
        }

        .form-group select:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .field-warning,
        .content-help {
          display: block;
          margin-top: 6px;
          color: #64748b;
          font-size: 10px;
          line-height: 1.5;
        }

        .field-warning {
          color: #fbbf24;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 9px;
          padding-top: 4px;
        }

        .cancel-btn,
        .save-btn {
          min-height: 45px;
          padding: 0 17px;
          border: none;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-weight: 700;
          cursor: pointer;
        }

        .cancel-btn {
          background: #1e293b;
          color: #cbd5e1;
        }

        .save-btn {
          background: #8b5cf6;
          color: #fff;
        }

        .save-btn:hover {
          background: #7c3aed;
        }

        .cancel-btn:disabled,
        .save-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

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

        @media (max-width: 900px) {
          .page-header {
            flex-direction: column;
            align-items: flex-start;
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

        @media (max-width: 700px) {
          .filters {
            grid-template-columns: 1fr;
          }

          .form-row {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 520px) {
          .page-header h1 {
            font-size: 32px;
          }

          .header-actions {
            display: grid;
            grid-template-columns: 1fr;
          }

          .notes-section {
            padding: 16px;
          }

          .section-header {
            display: block;
          }

          .result-count {
            display: inline-block;
            margin-top: 10px;
          }

          .note-main-row {
            display: grid;
            grid-template-columns: 46px minmax(0, 1fr);
            gap: 11px;
          }

          .note-icon {
            width: 46px;
            height: 46px;
            min-width: 46px;
            font-size: 17px;
          }

          .note-info h3 {
            font-size: 16px;
          }

          .content-preview {
            font-size: 12px;
          }

          .note-actions {
            grid-template-columns: 1fr;
            margin-top: 12px;
          }

          .modal-overlay {
            padding: 10px;
            align-items: flex-end;
          }

          .note-modal {
            max-height: 94vh;
            border-radius: 17px 17px 0 0;
          }

          .modal-header,
          .note-form {
            padding: 17px;
          }
        }
      `}</style>
    </div>
  );
}

export default AdminNotes;
