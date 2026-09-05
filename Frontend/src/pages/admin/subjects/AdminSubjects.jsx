import { useEffect, useState } from "react";
import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaBook,
  FaSyncAlt,
  FaTimes,
} from "react-icons/fa";

import API_URL from "../../../config/api";

function AdminSubjects() {
  const [search, setSearch] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    course: "B.Sc Computer Science",
    year: "",
    semester: "",
    description: "",
    units: [],
  });

  const getToken = () => {
    return localStorage.getItem("admin_token");
  };

  // =========================
  // FETCH SUBJECTS
  // =========================

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error("Admin login session not found.");
      }

      const response = await fetch(`${API_URL}/api/admin/subjects`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch subjects.");
      }

      setSubjects(Array.isArray(data.subjects) ? data.subjects : []);
    } catch (err) {
      console.error("Fetch Subjects Error:", err);
      setError(err.message || "Failed to load subjects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSubjects();
    }, 0);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =========================
  // SEARCH
  // =========================

  const filteredSubjects = subjects.filter((subject) => {
    const text = `
      ${subject.name || ""}
      ${subject.code || ""}
      ${subject.course || ""}
      ${subject.year || ""}
      ${subject.semester || ""}
    `.toLowerCase();

    return text.includes(search.toLowerCase());
  });

  // =========================
  // FORM
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================
  // UNITS & TOPICS
  // =========================

  const addUnit = () => {
    setFormData((previous) => ({
      ...previous,
      units: [
        ...(Array.isArray(previous.units) ? previous.units : []),
        {
          name: `Unit ${(previous.units?.length || 0) + 1}`,
          topics: [],
        },
      ],
    }));
  };

  const removeUnit = (unitIndex) => {
    setFormData((previous) => ({
      ...previous,
      units: previous.units.filter((_, index) => index !== unitIndex),
    }));
  };

  const updateUnitName = (unitIndex, value) => {
    setFormData((previous) => ({
      ...previous,
      units: previous.units.map((unit, index) =>
        index === unitIndex ? { ...unit, name: value } : unit,
      ),
    }));
  };

  const addTopic = (unitIndex) => {
    setFormData((previous) => ({
      ...previous,
      units: previous.units.map((unit, index) =>
        index === unitIndex
          ? {
              ...unit,
              topics: [
                ...(Array.isArray(unit.topics) ? unit.topics : []),
                { name: "" },
              ],
            }
          : unit,
      ),
    }));
  };

  const removeTopic = (unitIndex, topicIndex) => {
    setFormData((previous) => ({
      ...previous,
      units: previous.units.map((unit, index) =>
        index === unitIndex
          ? {
              ...unit,
              topics: unit.topics.filter((_, tIndex) => tIndex !== topicIndex),
            }
          : unit,
      ),
    }));
  };

  const updateTopic = (unitIndex, topicIndex, value) => {
    setFormData((previous) => ({
      ...previous,
      units: previous.units.map((unit, index) =>
        index === unitIndex
          ? {
              ...unit,
              topics: unit.topics.map((topic, tIndex) =>
                tIndex === topicIndex ? { ...topic, name: value } : topic,
              ),
            }
          : unit,
      ),
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      course: "B.Sc Computer Science",
      year: "",
      semester: "",
      description: "",
      units: [],
    });

    setEditingId(null);
    setShowForm(false);
    setError("");
  };

  const openAddForm = () => {
    setEditingId(null);

    setFormData({
      name: "",
      code: "",
      course: "B.Sc Computer Science",
      year: "",
      semester: "",
      description: "",
      units: [],
    });

    setError("");
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // ADD / UPDATE
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const name = formData.name.trim();
    const code = formData.code.trim().toUpperCase();
    const course = formData.course.trim();
    const year = formData.year.trim();
    const semester = formData.semester.trim();
    const description = formData.description.trim();
    const units = (Array.isArray(formData.units) ? formData.units : [])
      .map((unit) => ({
        name: String(unit.name || "").trim(),
        topics: (Array.isArray(unit.topics) ? unit.topics : [])
          .map((topic) => ({ name: String(topic.name || "").trim() }))
          .filter((topic) => topic.name),
      }))
      .filter((unit) => unit.name);

    if (!name) {
      setError("Please enter subject name.");
      return;
    }

    if (!code) {
      setError("Please enter subject code.");
      return;
    }

    if (!year) {
      setError("Please select year.");
      return;
    }

    if (!semester) {
      setError("Please select semester.");
      return;
    }

    try {
      setSaving(true);

      const token = getToken();

      if (!token) {
        throw new Error("Admin login session not found.");
      }

      const url = editingId
        ? `${API_URL}/api/admin/subjects/${editingId}`
        : `${API_URL}/api/admin/subjects`;

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          code,
          course: course || "B.Sc Computer Science",
          year,
          semester,
          description,
          units,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save subject.");
      }

      resetForm();
      await fetchSubjects();
    } catch (err) {
      console.error("Save Subject Error:", err);
      setError(err.message || "Failed to save subject.");
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // EDIT
  // =========================

  const handleEdit = (subject) => {
    setEditingId(subject._id);

    setFormData({
      name: subject.name || "",
      code: subject.code || "",
      course: subject.course || "B.Sc Computer Science",
      year: subject.year || "",
      semester: subject.semester || "",
      description: subject.description || "",
      units: Array.isArray(subject.units)
        ? subject.units.map((unit) => ({
            _id: unit._id,
            name: unit.name || "",
            topics: Array.isArray(unit.topics)
              ? unit.topics.map((topic) => ({
                  _id: topic._id,
                  name: topic.name || "",
                }))
              : [],
          }))
        : [],
    });

    setError("");
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // DELETE
  // =========================

  const handleDelete = async (id) => {
    if (!id) {
      setError("Subject ID is missing.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this subject?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error("Admin login session not found.");
      }

      const response = await fetch(`${API_URL}/api/admin/subjects/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete subject.");
      }

      await fetchSubjects();
    } catch (err) {
      console.error("Delete Subject Error:", err);
      setError(err.message || "Failed to delete subject.");
    } finally {
      setDeletingId(null);
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingIcon}>
          <FaBook />
        </div>

        <p style={styles.loadingTitle}>Loading subjects...</p>

        <p style={styles.loadingText}>Fetching subjects from MongoDB.</p>
      </div>
    );
  }

  // =========================
  // PAGE
  // =========================

  return (
    <div className="subjects-container" style={styles.container}>
      {/* HEADER */}

      <div className="subjects-header" style={styles.header}>
        <div>
          <h1 className="subjects-title" style={styles.title}>
            Subjects
          </h1>

          <p style={styles.subtitle}>Add and manage subjects for students.</p>
        </div>

        <div className="subjects-header-buttons" style={styles.headerButtons}>
          <button
            type="button"
            style={styles.refreshButton}
            onClick={fetchSubjects}
            disabled={loading}
          >
            <FaSyncAlt />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            style={styles.addButton}
            onClick={() => {
              if (showForm) {
                resetForm();
              } else {
                openAddForm();
              }
            }}
          >
            {showForm ? <FaTimes /> : <FaPlus />}

            {showForm ? "Close Form" : "Add Subject"}
          </button>
        </div>
      </div>

      {/* ERROR */}

      {error && (
        <div style={styles.errorBox}>
          <strong>Something went wrong</strong>

          <p style={styles.errorText}>{error}</p>
        </div>
      )}

      {/* STATS */}

      <div className="subjects-stats" style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>
            <FaBook />
          </div>

          <div>
            <p style={styles.statLabel}>Total Subjects</p>

            <h2 style={styles.statValue}>{subjects.length}</h2>

            <p style={styles.statSub}>Available subjects</p>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>
            <FaBook />
          </div>

          <div>
            <p style={styles.statLabel}>Years</p>

            <h2 style={styles.statValue}>
              {new Set(subjects.map((s) => s.year).filter(Boolean)).size}
            </h2>

            <p style={styles.statSub}>Academic years</p>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>
            <FaBook />
          </div>

          <div>
            <p style={styles.statLabel}>Semesters</p>

            <h2 style={styles.statValue}>
              {new Set(subjects.map((s) => s.semester).filter(Boolean)).size}
            </h2>

            <p style={styles.statSub}>Available semesters</p>
          </div>
        </div>
      </div>

      {/* FORM */}

      {showForm && (
        <div className="subjects-form-card" style={styles.formCard}>
          <div style={styles.formHeader}>
            <div>
              <h2 style={styles.formTitle}>
                {editingId ? "Edit Subject" : "Add New Subject"}
              </h2>

              <p style={styles.formSubtitle}>
                {editingId
                  ? "Update subject information."
                  : "Enter subject information."}
              </p>
            </div>
          </div>

          <form
            className="subjects-form"
            onSubmit={handleSubmit}
            style={styles.form}
          >
            <div style={styles.field}>
              <label style={styles.label}>Subject Name</label>

              <input
                type="text"
                name="name"
                placeholder="e.g. Artificial Intelligence"
                value={formData.name}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Subject Code</label>

              <input
                type="text"
                name="code"
                placeholder="e.g. AI"
                value={formData.code}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Course</label>

              <input
                type="text"
                name="course"
                placeholder="B.Sc Computer Science"
                value={formData.course}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Year</label>

              <select
                name="year"
                value={formData.year}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="">Select Year</option>

                <option value="FY">FY</option>
                <option value="SY">SY</option>
                <option value="TY">TY</option>
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Semester</label>

              <select
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="">Select Semester</option>

                <option value="I">I</option>
                <option value="II">II</option>
                <option value="III">III</option>
                <option value="IV">IV</option>
                <option value="V">V</option>
                <option value="VI">VI</option>
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Description</label>

              <input
                type="text"
                name="description"
                placeholder="Subject description"
                value={formData.description}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            {/* UNITS & TOPICS */}
            <div className="subjects-units-section" style={styles.unitsSection}>
              <div className="subjects-units-header" style={styles.unitsHeader}>
                <div>
                  <h3 style={styles.unitsTitle}>Units & Topics</h3>
                  <p style={styles.unitsSubtitle}>
                    Create units and add topics inside each unit.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addUnit}
                  className="subjects-add-unit-button"
                  style={styles.addUnitButton}
                  disabled={saving}
                >
                  <FaPlus />
                  Add Unit
                </button>
              </div>

              {formData.units.length === 0 ? (
                <div style={styles.emptyUnits}>
                  No units added yet. Click <strong>+ Add Unit</strong> to
                  create the first unit.
                </div>
              ) : (
                <div style={styles.unitsList}>
                  {formData.units.map((unit, unitIndex) => (
                    <div
                      key={unit._id || `unit-${unitIndex}`}
                      style={styles.unitCard}
                    >
                      <div style={styles.unitTopRow}>
                        <div style={styles.unitNumber}>
                          Unit {unitIndex + 1}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeUnit(unitIndex)}
                          style={styles.removeUnitButton}
                          disabled={saving}
                          title="Remove unit"
                        >
                          <FaTrash />
                        </button>
                      </div>

                      <input
                        type="text"
                        value={unit.name || ""}
                        onChange={(e) =>
                          updateUnitName(unitIndex, e.target.value)
                        }
                        placeholder={`Unit ${unitIndex + 1}: e.g. Introduction to Networks`}
                        style={styles.input}
                      />

                      <div style={styles.topicsHeader}>
                        <span style={styles.topicsTitle}>Topics</span>
                        <button
                          type="button"
                          onClick={() => addTopic(unitIndex)}
                          style={styles.addTopicButton}
                          disabled={saving}
                        >
                          <FaPlus />
                          Add Topic
                        </button>
                      </div>

                      {unit.topics?.length > 0 ? (
                        <div style={styles.topicsList}>
                          {unit.topics.map((topic, topicIndex) => (
                            <div
                              key={
                                topic._id || `topic-${unitIndex}-${topicIndex}`
                              }
                              style={styles.topicRow}
                            >
                              <span style={styles.topicNumber}>
                                {topicIndex + 1}
                              </span>
                              <input
                                type="text"
                                value={topic.name || ""}
                                onChange={(e) =>
                                  updateTopic(
                                    unitIndex,
                                    topicIndex,
                                    e.target.value,
                                  )
                                }
                                placeholder={`Topic ${topicIndex + 1}`}
                                style={styles.topicInput}
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  removeTopic(unitIndex, topicIndex)
                                }
                                style={styles.removeTopicButton}
                                disabled={saving}
                                title="Remove topic"
                              >
                                <FaTimes />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={styles.noTopics}>
                          No topics added to this unit.
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="subjects-form-actions" style={styles.formActions}>
              <button
                type="button"
                style={styles.cancelButton}
                onClick={resetForm}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                style={{
                  ...styles.saveButton,
                  opacity: saving ? 0.6 : 1,
                }}
                disabled={saving}
              >
                {editingId ? <FaEdit /> : <FaPlus />}

                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Subject"
                    : "Add Subject"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SUBJECTS */}

      <div className="subjects-card" style={styles.card}>
        <div className="subjects-card-header" style={styles.cardHeader}>
          <div>
            <h2 style={styles.cardTitle}>All Subjects</h2>

            <p style={styles.cardSubtitle}>
              {filteredSubjects.length} of {subjects.length} subjects showing
            </p>
          </div>

          <div className="subjects-search" style={styles.searchBox}>
            <FaSearch style={styles.searchIcon} />

            <input
              type="text"
              placeholder="Search subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
          </div>
        </div>

        {/* DESKTOP TABLE */}

        <div className="subjects-desktop-table" style={styles.desktopTable}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Subject</th>
                <th style={styles.th}>Code</th>
                <th style={styles.th}>Year</th>
                <th style={styles.th}>Semester</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredSubjects.length > 0 ? (
                filteredSubjects.map((subject) => (
                  <tr key={subject._id}>
                    <td style={styles.td}>
                      <div style={styles.subjectCell}>
                        <div style={styles.subjectIcon}>
                          <FaBook />
                        </div>

                        <div>
                          <div style={styles.subjectName}>{subject.name}</div>

                          <div style={styles.courseName}>
                            {subject.course || "B.Sc Computer Science"}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={styles.td}>
                      <span style={styles.codeBadge}>{subject.code}</span>
                    </td>

                    <td style={styles.td}>
                      <span style={styles.badge}>{subject.year || "-"}</span>
                    </td>

                    <td style={styles.td}>
                      <span style={styles.badge}>
                        {subject.semester || "-"}
                      </span>
                    </td>

                    <td style={styles.td}>
                      <div style={styles.actions}>
                        <button
                          type="button"
                          style={styles.editButton}
                          onClick={() => handleEdit(subject)}
                          disabled={deletingId !== null}
                        >
                          <FaEdit />
                        </button>

                        <button
                          type="button"
                          style={styles.deleteButton}
                          onClick={() => handleDelete(subject._id)}
                          disabled={deletingId === subject._id}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={styles.noResults}>
                    {search ? "No subjects found." : "No subjects available."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARDS */}

        <div className="subjects-mobile-cards" style={styles.mobileSubjects}>
          {filteredSubjects.length > 0 ? (
            filteredSubjects.map((subject) => (
              <div
                key={subject._id}
                className="subjects-mobile-card"
                style={styles.mobileSubjectCard}
              >
                <div style={styles.mobileTop}>
                  <div style={styles.mobileSubjectInfo}>
                    <div style={styles.mobileIcon}>
                      <FaBook />
                    </div>

                    <div>
                      <h3 style={styles.mobileName}>{subject.name}</h3>

                      <p style={styles.mobileCode}>{subject.code}</p>
                    </div>
                  </div>
                </div>

                <div style={styles.mobileDivider} />

                <div style={styles.mobileDetails}>
                  <div style={styles.detailBox}>
                    <span style={styles.detailLabel}>Year</span>

                    <strong style={styles.detailValue}>
                      {subject.year || "-"}
                    </strong>
                  </div>

                  <div style={styles.detailBox}>
                    <span style={styles.detailLabel}>Semester</span>

                    <strong style={styles.detailValue}>
                      {subject.semester || "-"}
                    </strong>
                  </div>
                </div>

                <div style={styles.mobileCourse}>
                  <span>Course</span>

                  <strong>{subject.course || "B.Sc Computer Science"}</strong>
                </div>

                {subject.description && (
                  <p style={styles.mobileDescription}>{subject.description}</p>
                )}

                <div style={styles.mobileActions}>
                  <button
                    type="button"
                    style={styles.mobileEditButton}
                    onClick={() => handleEdit(subject)}
                    disabled={deletingId !== null}
                  >
                    <FaEdit />
                    Edit
                  </button>

                  <button
                    type="button"
                    style={styles.mobileDeleteButton}
                    onClick={() => handleDelete(subject._id)}
                    disabled={deletingId === subject._id}
                  >
                    <FaTrash />
                    {deletingId === subject._id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div style={styles.mobileNoResults}>
              {search ? "No subjects found." : "No subjects available."}
            </div>
          )}
        </div>
      </div>

      {/* MOBILE CSS */}
      <style>
        {`
          .subjects-container {
            width: 100%;
            box-sizing: border-box;
          }

          .subjects-mobile-cards {
            display: none;
          }

          @media (max-width: 768px) {
            .subjects-container {
              width: 100% !important;
              max-width: 100% !important;
              margin: -70px 0 0 0 !important;
              padding: 0 !important;
              box-sizing: border-box !important;
              overflow-x: hidden !important;
            }

            .subjects-header {
              display: flex !important;
              flex-direction: column !important;
              align-items: stretch !important;
              gap: 14px !important;
              margin-bottom: 18px !important;
            }

            .subjects-title {
              font-size: 34px !important;
              line-height: 1.1 !important;
              margin: 0 !important;
            }

            .subjects-header-buttons {
              display: grid !important;
              grid-template-columns: 1fr 1fr !important;
              width: 100% !important;
              gap: 10px !important;
            }

            .subjects-header-buttons button {
              width: 100% !important;
              min-height: 52px !important;
              padding: 10px 12px !important;
              font-size: 14px !important;
            }

            .subjects-stats {
              display: grid !important;
              grid-template-columns: 1fr !important;
              width: 100% !important;
              gap: 12px !important;
              margin-bottom: 18px !important;
            }

            .subjects-stats > div {
              width: 100% !important;
              min-width: 0 !important;
              box-sizing: border-box !important;
              padding: 16px !important;
            }

            .subjects-card {
              width: 100% !important;
              box-sizing: border-box !important;
              padding: 16px !important;
              border-radius: 16px !important;
              overflow: hidden !important;
            }

            .subjects-card-header {
              display: flex !important;
              flex-direction: column !important;
              align-items: stretch !important;
              gap: 14px !important;
              margin-bottom: 16px !important;
            }

            .subjects-search {
              width: 100% !important;
              min-width: 0 !important;
            }

            .subjects-search input {
              min-width: 0 !important;
            }

            .subjects-desktop-table {
              display: none !important;
            }

            .subjects-mobile-cards {
              display: flex !important;
              flex-direction: column !important;
              gap: 12px !important;
              width: 100% !important;
            }

            .subjects-mobile-card {
              width: 100% !important;
              box-sizing: border-box !important;
              padding: 15px !important;
            }

            .subjects-form-card {
              width: 100% !important;
              box-sizing: border-box !important;
              padding: 16px !important;
            }

            .subjects-form {
              grid-template-columns: 1fr !important;
              gap: 13px !important;
            }

            .subjects-form-actions {
              grid-column: auto !important;
              display: grid !important;
              grid-template-columns: 1fr 1fr !important;
              gap: 10px !important;
            }

            .subjects-form-actions button {
              width: 100% !important;
            }

            .subjects-units-section {
              grid-column: auto !important;
            }

            .subjects-units-header {
              align-items: stretch !important;
              flex-direction: column !important;
            }

            .subjects-add-unit-button {
              width: 100% !important;
            }
          }

          @media (max-width: 480px) {
            .subjects-container {
              margin-top: -72px !important;
            }

            .subjects-title {
              font-size: 32px !important;
            }

            .subjects-header-buttons {
              grid-template-columns: 1fr 1fr !important;
            }

            .subjects-header-buttons button {
              min-height: 50px !important;
              font-size: 13px !important;
            }

            .subjects-card {
              padding: 14px !important;
            }

            .subjects-card-title {
              font-size: 20px !important;
            }
          }
        `}
      </style>
    </div>
  );
}

const styles = {
  container: {
    width: "100%",
    maxWidth: "1200px",
    margin: "0 auto",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "25px",
  },

  title: {
    color: "#FFFFFF",
    fontSize: "28px",
    margin: 0,
    fontWeight: "700",
  },

  subtitle: {
    color: "#64748B",
    fontSize: "13px",
    margin: "6px 0 0",
  },

  headerButtons: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  refreshButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    background: "#0F172A",
    border: "1px solid #1E293B",
    borderRadius: "9px",
    color: "#CBD5E1",
    padding: "11px 15px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
  },

  addButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    background: "#8B5CF6",
    border: "none",
    borderRadius: "9px",
    color: "#FFFFFF",
    padding: "11px 15px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
  },

  errorBox: {
    background: "#450A0A",
    border: "1px solid #7F1D1D",
    borderRadius: "10px",
    padding: "12px 15px",
    marginBottom: "20px",
    color: "#FCA5A5",
    fontSize: "12px",
  },

  errorText: {
    margin: "5px 0 0",
    color: "#FCA5A5",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "15px",
    marginBottom: "20px",
  },

  statCard: {
    background: "#0F172A",
    border: "1px solid #1E293B",
    borderRadius: "15px",
    padding: "18px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },

  statIcon: {
    width: "48px",
    height: "48px",
    minWidth: "48px",
    borderRadius: "12px",
    background: "#312E81",
    color: "#A78BFA",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
  },

  statLabel: {
    color: "#94A3B8",
    margin: 0,
    fontSize: "12px",
  },

  statValue: {
    color: "#FFFFFF",
    fontSize: "25px",
    margin: "3px 0",
  },

  statSub: {
    color: "#64748B",
    fontSize: "10px",
    margin: 0,
  },

  formCard: {
    background: "#0F172A",
    border: "1px solid #312E81",
    borderRadius: "16px",
    padding: "20px",
    marginBottom: "20px",
  },

  formHeader: {
    marginBottom: "18px",
  },

  formTitle: {
    color: "#FFFFFF",
    fontSize: "18px",
    margin: 0,
  },

  formSubtitle: {
    color: "#64748B",
    fontSize: "11px",
    margin: "5px 0 0",
  },

  form: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "15px",
    alignItems: "end",
  },

  field: {
    display: "flex",
    flexDirection: "column",
  },

  label: {
    color: "#CBD5E1",
    fontSize: "11px",
    fontWeight: "600",
    marginBottom: "7px",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    background: "#020617",
    border: "1px solid #334155",
    borderRadius: "8px",
    color: "#FFFFFF",
    padding: "11px",
    outline: "none",
    fontSize: "12px",
  },

  unitsSection: {
    gridColumn: "1 / -1",
    background: "#0B1220",
    border: "1px solid #1E293B",
    borderRadius: "14px",
    padding: "18px",
    marginTop: "4px",
  },

  unitsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    marginBottom: "16px",
  },

  unitsTitle: {
    color: "#FFFFFF",
    margin: 0,
    fontSize: "16px",
    fontWeight: "700",
  },

  unitsSubtitle: {
    color: "#64748B",
    margin: "5px 0 0",
    fontSize: "12px",
  },

  addUnitButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    background: "#8B5CF6",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "8px",
    padding: "9px 13px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },

  emptyUnits: {
    border: "1px dashed #334155",
    borderRadius: "10px",
    padding: "18px",
    textAlign: "center",
    color: "#64748B",
    fontSize: "12px",
  },

  unitsList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  unitCard: {
    background: "#111827",
    border: "1px solid #243044",
    borderRadius: "12px",
    padding: "14px",
  },

  unitTopRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },

  unitNumber: {
    color: "#A78BFA",
    fontSize: "13px",
    fontWeight: "700",
  },

  removeUnitButton: {
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #7F1D1D",
    background: "#450A0A",
    color: "#FCA5A5",
    borderRadius: "7px",
    cursor: "pointer",
  },

  topicsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "13px",
    marginBottom: "9px",
  },

  topicsTitle: {
    color: "#CBD5E1",
    fontSize: "12px",
    fontWeight: "700",
  },

  addTopicButton: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    background: "transparent",
    border: "1px solid #334155",
    color: "#A78BFA",
    borderRadius: "7px",
    padding: "6px 9px",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: "600",
  },

  topicsList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  topicRow: {
    display: "grid",
    gridTemplateColumns: "28px 1fr 32px",
    alignItems: "center",
    gap: "8px",
  },

  topicNumber: {
    width: "28px",
    height: "28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#1E293B",
    color: "#94A3B8",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "700",
  },

  topicInput: {
    width: "100%",
    boxSizing: "border-box",
    background: "#0F172A",
    border: "1px solid #263449",
    borderRadius: "8px",
    color: "#FFFFFF",
    padding: "9px 11px",
    outline: "none",
    fontSize: "12px",
  },

  removeTopicButton: {
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    border: "1px solid #334155",
    color: "#94A3B8",
    borderRadius: "7px",
    cursor: "pointer",
  },

  noTopics: {
    color: "#64748B",
    fontSize: "11px",
    margin: "8px 0 0",
  },

  formActions: {
    gridColumn: "1 / -1",
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "5px",
  },

  cancelButton: {
    background: "#1E293B",
    border: "none",
    borderRadius: "8px",
    color: "#CBD5E1",
    padding: "10px 14px",
    cursor: "pointer",
    fontSize: "12px",
  },

  saveButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    background: "#8B5CF6",
    border: "none",
    borderRadius: "8px",
    color: "#FFFFFF",
    padding: "10px 14px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
  },

  card: {
    background: "#0F172A",
    border: "1px solid #1E293B",
    borderRadius: "16px",
    padding: "20px",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "20px",
  },

  cardTitle: {
    color: "#FFFFFF",
    fontSize: "18px",
    margin: 0,
  },

  cardSubtitle: {
    color: "#64748B",
    fontSize: "11px",
    margin: "5px 0 0",
  },

  searchBox: {
    width: "240px",
    display: "flex",
    alignItems: "center",
    background: "#020617",
    border: "1px solid #334155",
    borderRadius: "9px",
    padding: "0 11px",
    boxSizing: "border-box",
  },

  searchIcon: {
    color: "#64748B",
    fontSize: "12px",
  },

  searchInput: {
    width: "100%",
    background: "transparent",
    border: "none",
    outline: "none",
    color: "#FFFFFF",
    padding: "10px",
    fontSize: "12px",
  },

  desktopTable: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    color: "#64748B",
    fontSize: "10px",
    fontWeight: "700",
    textAlign: "left",
    padding: "12px",
    borderBottom: "1px solid #1E293B",
    textTransform: "uppercase",
  },

  td: {
    color: "#CBD5E1",
    fontSize: "12px",
    padding: "14px 12px",
    borderBottom: "1px solid #1E293B",
  },

  subjectCell: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontWeight: "600",
  },

  subjectIcon: {
    width: "35px",
    height: "35px",
    borderRadius: "9px",
    background: "#312E81",
    color: "#A78BFA",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
  },

  subjectName: {
    color: "#FFFFFF",
    fontWeight: "600",
  },

  courseName: {
    color: "#64748B",
    fontSize: "10px",
    marginTop: "3px",
  },

  codeBadge: {
    color: "#A78BFA",
    background: "#312E81",
    padding: "5px 8px",
    borderRadius: "6px",
    fontSize: "10px",
    fontWeight: "700",
  },

  badge: {
    background: "#1E293B",
    color: "#CBD5E1",
    padding: "5px 8px",
    borderRadius: "6px",
    fontSize: "10px",
    fontWeight: "600",
  },

  actions: {
    display: "flex",
    gap: "7px",
  },

  editButton: {
    width: "31px",
    height: "31px",
    border: "none",
    borderRadius: "7px",
    background: "#1E293B",
    color: "#A78BFA",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  deleteButton: {
    width: "31px",
    height: "31px",
    border: "none",
    borderRadius: "7px",
    background: "#450A0A",
    color: "#FCA5A5",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  mobileSubjects: {
    display: "none",
    flexDirection: "column",
    gap: "12px",
  },

  mobileSubjectCard: {
    background: "#020617",
    border: "1px solid #1E293B",
    borderRadius: "14px",
    padding: "16px",
  },

  mobileTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  mobileSubjectInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  mobileIcon: {
    width: "45px",
    height: "45px",
    minWidth: "45px",
    borderRadius: "11px",
    background: "#312E81",
    color: "#A78BFA",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
  },

  mobileName: {
    color: "#FFFFFF",
    fontSize: "16px",
    margin: 0,
  },

  mobileCode: {
    color: "#A78BFA",
    fontSize: "11px",
    margin: "4px 0 0",
    fontWeight: "600",
  },

  mobileDivider: {
    height: "1px",
    background: "#1E293B",
    margin: "15px 0",
  },

  mobileDetails: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
  },

  detailBox: {
    background: "#0F172A",
    borderRadius: "9px",
    padding: "10px",
  },

  detailLabel: {
    display: "block",
    color: "#64748B",
    fontSize: "10px",
    marginBottom: "4px",
  },

  detailValue: {
    color: "#CBD5E1",
    fontSize: "13px",
  },

  mobileCourse: {
    background: "#0F172A",
    borderRadius: "9px",
    padding: "10px",
    marginTop: "10px",
  },

  mobileDescription: {
    color: "#94A3B8",
    fontSize: "11px",
    lineHeight: "18px",
    margin: "10px 0 0",
  },

  mobileActions: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    marginTop: "14px",
  },

  mobileEditButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    background: "#1E293B",
    color: "#A78BFA",
    border: "none",
    borderRadius: "8px",
    padding: "11px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
  },

  mobileDeleteButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    background: "#450A0A",
    color: "#FCA5A5",
    border: "none",
    borderRadius: "8px",
    padding: "11px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
  },

  noResults: {
    textAlign: "center",
    color: "#64748B",
    padding: "35px",
    fontSize: "12px",
  },

  mobileNoResults: {
    textAlign: "center",
    color: "#64748B",
    padding: "30px 10px",
    fontSize: "12px",
  },

  loadingContainer: {
    width: "100%",
    minHeight: "350px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },

  loadingIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    background: "#312E81",
    color: "#A78BFA",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    marginBottom: "12px",
  },

  loadingTitle: {
    color: "#CBD5E1",
    fontSize: "14px",
    margin: 0,
  },

  loadingText: {
    color: "#64748B",
    fontSize: "11px",
    marginTop: "6px",
  },
};

export default AdminSubjects;
