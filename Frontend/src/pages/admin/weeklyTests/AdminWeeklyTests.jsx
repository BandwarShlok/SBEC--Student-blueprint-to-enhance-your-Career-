import { useEffect, useMemo, useState } from "react";

import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaClipboardCheck,
  FaEye,
  FaTimes,
  FaSyncAlt,
  FaCheckCircle,
  FaBook,
  FaClock,
  FaCalendarAlt,
  FaListOl,
} from "react-icons/fa";

import API_URL from "../../../config/api";

/*
==================================================
API CONFIGURATION
==================================================
Works whether API_URL is:

http://172.16.2.10:5000

OR

http://172.16.2.10:5000/api
==================================================
*/

const API_ROOT = String(API_URL || "").replace(/\/+$/, "");

const API_BASE_URL = API_ROOT.endsWith("/api") ? API_ROOT : `${API_ROOT}/api`;

const WEEKLY_TEST_API = `${API_BASE_URL}/admin/weekly-tests`;

/*
==================================================
HELPERS
==================================================
*/

const getAdminToken = () => {
  return (
    localStorage.getItem("admin_token") || localStorage.getItem("token") || ""
  );
};

const getHeaders = (includeJson = false) => {
  const token = getAdminToken();

  return {
    ...(includeJson
      ? {
          "Content-Type": "application/json",
        }
      : {}),
    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
};

/*
Safely read JSON responses.
This prevents the page from crashing if the
backend returns HTML/text instead of JSON.
*/

const readResponse = async (response) => {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      message: text,
    };
  }
};

/*
==================================================
EMPTY FORM
==================================================
*/

const EMPTY_FORM = {
  title: "",
  subject: "",
  week: "",
  questions: "",
  duration: "",
  status: "Draft",
};

/*
==================================================
COMPONENT
==================================================
*/

function AdminWeeklyTests() {
  const [tests, setTests] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [showEdit, setShowEdit] = useState(false);

  const [showView, setShowView] = useState(false);

  const [selectedTest, setSelectedTest] = useState(null);

  const [formData, setFormData] = useState({
    ...EMPTY_FORM,
  });

  /*
  ==================================================
  FETCH TESTS
  ==================================================
  */

  const fetchTests = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("WEEKLY TEST GET:", WEEKLY_TEST_API);

      const response = await fetch(WEEKLY_TEST_API, {
        method: "GET",
        headers: getHeaders(),
      });

      const data = await readResponse(response);

      console.log("WEEKLY TEST RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Failed to load weekly tests. HTTP ${response.status}`,
        );
      }

      const list = data?.tests || data?.weeklyTests || data?.data || [];

      setTests(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("FETCH WEEKLY TESTS ERROR:", err);

      setError(err?.message || "Unable to connect to the backend.");

      setTests([]);
    } finally {
      setLoading(false);
    }
  };

  /*
  ==================================================
  INITIAL LOAD
  ==================================================
  */

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTests();
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  /*
  ==================================================
  FORM CHANGE
  ==================================================
  */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /*
  ==================================================
  RESET FORM
  ==================================================
  */

  const resetForm = () => {
    setFormData({
      ...EMPTY_FORM,
    });

    setSelectedTest(null);
  };

  /*
  ==================================================
  OPEN CREATE FORM
  ==================================================
  */

  const openAddForm = () => {
    resetForm();

    setError("");
    setSuccess("");

    setShowEdit(false);
    setShowView(false);

    setShowForm(true);
  };

  /*
  ==================================================
  CLOSE MODALS
  ==================================================
  */

  const closeAll = () => {
    if (saving) {
      return;
    }

    setShowForm(false);
    setShowEdit(false);
    setShowView(false);

    setSelectedTest(null);

    resetForm();

    setError("");
  };

  /*
  ==================================================
  CREATE TEST
  ==================================================
  */

  const handleCreateTest = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const title = formData.title.trim();

    const subject = formData.subject.trim();

    const week = formData.week.trim();

    const questions = Number(formData.questions);

    const duration = Number(formData.duration);

    const status = formData.status || "Draft";

    if (!title) {
      setError("Please enter test title.");
      return;
    }

    if (!subject) {
      setError("Please enter subject.");
      return;
    }

    if (!week) {
      setError("Please enter week.");
      return;
    }

    if (!questions || questions < 1) {
      setError("Questions must be greater than 0.");
      return;
    }

    if (!duration || duration < 1) {
      setError("Duration must be greater than 0.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(WEEKLY_TEST_API, {
        method: "POST",

        headers: getHeaders(true),

        body: JSON.stringify({
          title,
          subject,
          week,
          questions,
          duration,
          status,
        }),
      });

      const data = await readResponse(response);

      console.log("CREATE WEEKLY TEST:", data);

      if (!response.ok) {
        throw new Error(data?.message || "Failed to create weekly test.");
      }

      if (data?.test) {
        setTests((previous) => [data.test, ...previous]);
      } else {
        await fetchTests();
      }

      setSuccess("Weekly test created successfully.");

      setShowForm(false);

      resetForm();
    } catch (err) {
      console.error("CREATE WEEKLY TEST ERROR:", err);

      setError(err?.message || "Failed to create weekly test.");
    } finally {
      setSaving(false);
    }
  };

  /*
  ==================================================
  OPEN EDIT
  ==================================================
  */

  const openEdit = (test) => {
    setSelectedTest(test);

    setFormData({
      title: test?.title || "",
      subject: test?.subject || "",
      week: test?.week || "",
      questions: test?.questions ?? "",
      duration: test?.duration ?? "",
      status: test?.status || "Draft",
    });

    setError("");
    setSuccess("");

    setShowForm(false);
    setShowView(false);

    setShowEdit(true);
  };

  /*
  ==================================================
  UPDATE TEST
  ==================================================
  */

  const handleUpdateTest = async (event) => {
    event.preventDefault();

    if (!selectedTest?._id) {
      setError("Weekly test ID is missing.");
      return;
    }

    setError("");
    setSuccess("");

    const title = formData.title.trim();

    const subject = formData.subject.trim();

    const week = formData.week.trim();

    const questions = Number(formData.questions);

    const duration = Number(formData.duration);

    const status = formData.status || "Draft";

    if (!title) {
      setError("Please enter test title.");
      return;
    }

    if (!subject) {
      setError("Please enter subject.");
      return;
    }

    if (!week) {
      setError("Please enter week.");
      return;
    }

    if (!questions || questions < 1) {
      setError("Questions must be greater than 0.");
      return;
    }

    if (!duration || duration < 1) {
      setError("Duration must be greater than 0.");
      return;
    }

    try {
      setSaving(true);

      const url = `${WEEKLY_TEST_API}/${selectedTest._id}`;

      console.log("WEEKLY TEST UPDATE:", url);

      const response = await fetch(url, {
        method: "PUT",

        headers: getHeaders(true),

        body: JSON.stringify({
          title,
          subject,
          week,
          questions,
          duration,
          status,
        }),
      });

      const data = await readResponse(response);

      console.log("UPDATE WEEKLY TEST:", data);

      if (!response.ok) {
        throw new Error(data?.message || "Failed to update weekly test.");
      }

      if (data?.test) {
        setTests((previous) =>
          previous.map((test) =>
            test._id === selectedTest._id ? data.test : test,
          ),
        );
      } else {
        await fetchTests();
      }

      setSuccess("Weekly test updated successfully.");

      setShowEdit(false);

      setSelectedTest(null);

      resetForm();
    } catch (err) {
      console.error("UPDATE WEEKLY TEST ERROR:", err);

      setError(err?.message || "Failed to update weekly test.");
    } finally {
      setSaving(false);
    }
  };

  /*
  ==================================================
  DELETE TEST
  ==================================================
  */

  const handleDelete = async (id) => {
    if (!id) {
      setError("Weekly test ID is missing.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this weekly test?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);

      setError("");
      setSuccess("");

      const response = await fetch(`${WEEKLY_TEST_API}/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      const data = await readResponse(response);

      console.log("DELETE WEEKLY TEST:", data);

      if (!response.ok) {
        throw new Error(data?.message || "Failed to delete weekly test.");
      }

      setTests((previous) => previous.filter((test) => test._id !== id));

      setSuccess("Weekly test deleted successfully.");
    } catch (err) {
      console.error("DELETE WEEKLY TEST ERROR:", err);

      setError(err?.message || "Failed to delete weekly test.");
    } finally {
      setDeletingId(null);
    }
  };

  /*
  ==================================================
  VIEW TEST
  ==================================================
  */

  const handleView = (test) => {
    setSelectedTest(test);

    setError("");

    setShowForm(false);
    setShowEdit(false);

    setShowView(true);
  };

  /*
  ==================================================
  REFRESH
  ==================================================
  */

  const handleRefresh = async () => {
    setSearch("");

    setError("");
    setSuccess("");

    await fetchTests();
  };

  /*
  ==================================================
  FILTER
  ==================================================
  */

  const filteredTests = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return tests;
    }

    return tests.filter((test) => {
      const text = `
            ${test?.title || ""}
            ${test?.subject || ""}
            ${test?.week || ""}
            ${test?.questions || ""}
            ${test?.duration || ""}
            ${test?.status || ""}
          `.toLowerCase();

      return text.includes(query);
    });
  }, [tests, search]);

  /*
  ==================================================
  STATISTICS
  ==================================================
  */

  const totalTests = tests.length;

  const activeTests = tests.filter(
    (test) => String(test?.status || "").toLowerCase() === "active",
  ).length;

  const draftTests = tests.filter(
    (test) => String(test?.status || "").toLowerCase() === "draft",
  ).length;

  const totalSubjects = new Set(
    tests.map((test) => test?.subject).filter(Boolean),
  ).size;

  /*
  ==================================================
  LOADING SCREEN
  ==================================================
  */

  if (loading) {
    return (
      <>
        <style>{responsiveCSS}</style>

        <div style={styles.loadingPage}>
          <FaSyncAlt style={styles.loadingSpinner} />

          <h2 style={styles.loadingTitle}>Loading Weekly Tests...</h2>

          <p style={styles.loadingText}>
            Fetching weekly tests from the SBEC backend.
          </p>
        </div>
      </>
    );
  }

  /*
  ==================================================
  RENDER
  ==================================================
  */

  return (
    <>
      <style>{responsiveCSS}</style>

      <div style={styles.container}>
        {/* ========================================
            HEADER
        ======================================== */}

        <div className="weekly-header" style={styles.header}>
          <div>
            <h1 className="weekly-title" style={styles.title}>
              Weekly Tests
            </h1>

            <p style={styles.subtitle}>
              Create and manage weekly tests for students.
            </p>
          </div>

          <div style={styles.headerActions}>
            <button
              className="weekly-header-button"
              style={styles.refreshButton}
              onClick={handleRefresh}
              disabled={loading}
            >
              <FaSyncAlt />
              Refresh
            </button>

            <button
              className="weekly-header-button"
              style={styles.createButton}
              onClick={openAddForm}
            >
              <FaPlus />
              Create Test
            </button>
          </div>
        </div>

        {/* ========================================
            ERROR
        ======================================== */}

        {error && (
          <div style={styles.errorBox}>
            <span>{error}</span>

            <button style={styles.alertClose} onClick={() => setError("")}>
              <FaTimes />
            </button>
          </div>
        )}

        {/* ========================================
            SUCCESS
        ======================================== */}

        {success && (
          <div style={styles.successBox}>
            <FaCheckCircle />

            <span>{success}</span>

            <button style={styles.alertClose} onClick={() => setSuccess("")}>
              <FaTimes />
            </button>
          </div>
        )}

        {/* ========================================
            STATISTICS
        ======================================== */}

        <div className="weekly-stats" style={styles.statsGrid}>
          {/* TOTAL */}

          <div style={styles.statCard}>
            <div
              style={{
                ...styles.statIcon,
                background: "#312E81",
                color: "#A78BFA",
              }}
            >
              <FaClipboardCheck />
            </div>

            <div>
              <span style={styles.statLabel}>Total Tests</span>

              <strong style={styles.statNumber}>{totalTests}</strong>

              <small style={styles.statDescription}>All weekly tests</small>
            </div>
          </div>

          {/* ACTIVE */}

          <div style={styles.statCard}>
            <div
              style={{
                ...styles.statIcon,
                background: "#064E3B",
                color: "#6EE7B7",
              }}
            >
              <FaCheckCircle />
            </div>

            <div>
              <span style={styles.statLabel}>Active Tests</span>

              <strong style={styles.statNumber}>{activeTests}</strong>

              <small style={styles.statDescription}>
                Available to students
              </small>
            </div>
          </div>

          {/* SUBJECTS */}

          <div style={styles.statCard}>
            <div
              style={{
                ...styles.statIcon,
                background: "#172554",
                color: "#93C5FD",
              }}
            >
              <FaBook />
            </div>

            <div>
              <span style={styles.statLabel}>Subjects</span>

              <strong style={styles.statNumber}>{totalSubjects}</strong>

              <small style={styles.statDescription}>Subjects covered</small>
            </div>
          </div>

          {/* DRAFT */}

          <div style={styles.statCard}>
            <div
              style={{
                ...styles.statIcon,
                background: "#451A03",
                color: "#FBBF24",
              }}
            >
              <FaCalendarAlt />
            </div>

            <div>
              <span style={styles.statLabel}>Draft Tests</span>

              <strong style={styles.statNumber}>{draftTests}</strong>

              <small style={styles.statDescription}>Not published yet</small>
            </div>
          </div>
        </div>

        {/* ========================================
            MAIN TEST SECTION
        ======================================== */}

        <div style={styles.mainCard}>
          {/* SECTION HEADER */}

          <div className="weekly-card-header" style={styles.cardHeader}>
            <div>
              <h2 style={styles.sectionTitle}>All Weekly Tests</h2>

              <p style={styles.sectionSubtitle}>
                {filteredTests.length} of {tests.length} tests showing
              </p>
            </div>

            {/* SEARCH */}

            <div className="weekly-search" style={styles.searchBox}>
              <FaSearch style={styles.searchIcon} />

              <input
                type="text"
                placeholder="Search tests..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                style={styles.searchInput}
              />
            </div>
          </div>

          {/* ========================================
              TEST LIST
          ======================================== */}

          <div style={styles.testList}>
            {filteredTests.length > 0 ? (
              filteredTests.map((test) => (
                <div
                  key={test._id}
                  className="weekly-test-card"
                  style={styles.testCard}
                >
                  {/* ICON */}

                  <div style={styles.testIcon}>
                    <FaClipboardCheck />
                  </div>

                  {/* INFORMATION */}

                  <div className="weekly-test-main" style={styles.testInfo}>
                    <h3 style={styles.testTitle}>
                      {test.title || "Untitled Test"}
                    </h3>

                    <div style={styles.meta}>
                      <span style={styles.metaSpan}>
                        <FaBook />
                        {test.subject || "No Subject"}
                      </span>

                      <span style={styles.metaSpan}>
                        <FaCalendarAlt />
                        {test.week || "No Week"}
                      </span>

                      <span style={styles.metaSpan}>
                        <FaListOl />
                        {test.questions || 0} Questions
                      </span>

                      <span style={styles.metaSpan}>
                        <FaClock />
                        {test.duration || 0} min
                      </span>
                    </div>
                  </div>

                  {/* STATUS */}

                  <span
                    className="weekly-status"
                    style={{
                      ...styles.status,
                      background:
                        String(test.status || "").toLowerCase() === "active"
                          ? "#064E3B"
                          : "#1E293B",

                      color:
                        String(test.status || "").toLowerCase() === "active"
                          ? "#6EE7B7"
                          : "#94A3B8",
                    }}
                  >
                    {test.status || "Draft"}
                  </span>

                  {/* ACTIONS */}

                  <div className="weekly-test-actions" style={styles.actions}>
                    <button
                      style={styles.viewButton}
                      onClick={() => handleView(test)}
                      title="View"
                    >
                      <FaEye />
                    </button>

                    <button
                      style={styles.editButton}
                      onClick={() => openEdit(test)}
                      title="Edit"
                    >
                      <FaEdit />
                    </button>

                    <button
                      style={{
                        ...styles.deleteButton,
                        opacity: deletingId === test._id ? 0.5 : 1,
                      }}
                      onClick={() => handleDelete(test._id)}
                      disabled={deletingId === test._id}
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              /* EMPTY STATE */

              <div style={styles.noResults}>
                <FaClipboardCheck style={styles.noResultsIcon} />

                <h3 style={styles.emptyTitle}>
                  {search ? "No tests found" : "No weekly tests yet"}
                </h3>

                <p style={styles.emptyText}>
                  {search
                    ? "Try changing your search."
                    : "Create your first weekly test to get started."}
                </p>

                {!search && (
                  <button style={styles.smallAddButton} onClick={openAddForm}>
                    <FaPlus />
                    Create First Test
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================
          CREATE MODAL
      ======================================== */}

      {showForm && (
        <div style={styles.overlay}>
          <div className="weekly-modal" style={styles.modal}>
            <div style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalTitle}>Create Weekly Test</h2>

                <p style={styles.modalSubtitle}>
                  Add a new weekly test for students.
                </p>
              </div>

              <button style={styles.closeButton} onClick={closeAll}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleCreateTest}>
              <div className="weekly-modal-form" style={styles.formGrid}>
                {/* TITLE */}

                <div className="weekly-modal-full" style={styles.formGroupFull}>
                  <label style={styles.label}>Test Title</label>

                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Week 1 Web Development Test"
                    style={styles.input}
                  />
                </div>

                {/* SUBJECT */}

                <div style={styles.formGroup}>
                  <label style={styles.label}>Subject</label>

                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="e.g. Web Development"
                    style={styles.input}
                  />
                </div>

                {/* WEEK */}

                <div style={styles.formGroup}>
                  <label style={styles.label}>Week</label>

                  <input
                    type="text"
                    name="week"
                    value={formData.week}
                    onChange={handleChange}
                    placeholder="e.g. Week 1"
                    style={styles.input}
                  />
                </div>

                {/* QUESTIONS */}

                <div style={styles.formGroup}>
                  <label style={styles.label}>Number of Questions</label>

                  <input
                    type="number"
                    min="1"
                    name="questions"
                    value={formData.questions}
                    onChange={handleChange}
                    placeholder="10"
                    style={styles.input}
                  />
                </div>

                {/* DURATION */}

                <div style={styles.formGroup}>
                  <label style={styles.label}>Duration (minutes)</label>

                  <input
                    type="number"
                    min="1"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    placeholder="30"
                    style={styles.input}
                  />
                </div>

                {/* STATUS */}

                <div className="weekly-modal-full" style={styles.formGroupFull}>
                  <label style={styles.label}>Status</label>

                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    style={styles.input}
                  >
                    <option value="Draft">Draft</option>

                    <option value="Active">Active</option>
                  </select>
                </div>
              </div>

              {/* FORM ACTIONS */}

              <div style={styles.modalActions}>
                <button
                  type="button"
                  style={styles.cancelButton}
                  onClick={closeAll}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  style={styles.submitButton}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <FaSyncAlt className="spin-icon" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <FaPlus />
                      Create Test
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================
          EDIT MODAL
      ======================================== */}

      {showEdit && selectedTest && (
        <div style={styles.overlay}>
          <div className="weekly-modal" style={styles.modal}>
            <div style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalTitle}>Edit Weekly Test</h2>

                <p style={styles.modalSubtitle}>
                  Update weekly test information.
                </p>
              </div>

              <button style={styles.closeButton} onClick={closeAll}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleUpdateTest}>
              <div className="weekly-modal-form" style={styles.formGrid}>
                <div className="weekly-modal-full" style={styles.formGroupFull}>
                  <label style={styles.label}>Test Title</label>

                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Subject</label>

                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Week</label>

                  <input
                    type="text"
                    name="week"
                    value={formData.week}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Questions</label>

                  <input
                    type="number"
                    min="1"
                    name="questions"
                    value={formData.questions}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Duration (minutes)</label>

                  <input
                    type="number"
                    min="1"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>

                <div className="weekly-modal-full" style={styles.formGroupFull}>
                  <label style={styles.label}>Status</label>

                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    style={styles.input}
                  >
                    <option value="Draft">Draft</option>

                    <option value="Active">Active</option>
                  </select>
                </div>
              </div>

              <div style={styles.modalActions}>
                <button
                  type="button"
                  style={styles.cancelButton}
                  onClick={closeAll}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  style={styles.submitButton}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <FaSyncAlt className="spin-icon" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaCheckCircle />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================
          VIEW MODAL
      ======================================== */}

      {showView && selectedTest && (
        <div style={styles.overlay}>
          <div className="weekly-modal" style={styles.modal}>
            <div style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalTitle}>Test Details</h2>

                <p style={styles.modalSubtitle}>Weekly test information</p>
              </div>

              <button style={styles.closeButton} onClick={closeAll}>
                <FaTimes />
              </button>
            </div>

            <div style={styles.viewContent}>
              <div style={styles.viewIcon}>
                <FaClipboardCheck />
              </div>

              <h2 style={styles.viewTitle}>
                {selectedTest.title || "Untitled Test"}
              </h2>

              <div className="weekly-details-grid" style={styles.detailsGrid}>
                <div style={styles.detailBox}>
                  <span>Subject</span>

                  <strong>{selectedTest.subject || "Not specified"}</strong>
                </div>

                <div style={styles.detailBox}>
                  <span>Week</span>

                  <strong>{selectedTest.week || "Not specified"}</strong>
                </div>

                <div style={styles.detailBox}>
                  <span>Questions</span>

                  <strong>{selectedTest.questions || 0}</strong>
                </div>

                <div style={styles.detailBox}>
                  <span>Duration</span>

                  <strong>{selectedTest.duration || 0} minutes</strong>
                </div>

                <div style={styles.detailBox}>
                  <span>Status</span>

                  <strong>{selectedTest.status || "Draft"}</strong>
                </div>

                <div style={styles.detailBox}>
                  <span>Created</span>

                  <strong>
                    {selectedTest.createdAt
                      ? new Date(selectedTest.createdAt).toLocaleDateString(
                          "en-IN",
                        )
                      : "Not available"}
                  </strong>
                </div>
              </div>
            </div>

            <div style={styles.modalActions}>
              <button style={styles.cancelButton} onClick={closeAll}>
                Close
              </button>

              <button
                style={styles.submitButton}
                onClick={() => openEdit(selectedTest)}
              >
                <FaEdit />
                Edit Test
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/*
==================================================
RESPONSIVE CSS
==================================================
*/

const responsiveCSS = `
  * {
    box-sizing: border-box;
  }

  @keyframes weeklySpin {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }

  .spin-icon {
    animation: weeklySpin 0.9s linear infinite;
  }

  @media (max-width: 1100px) {
    .weekly-stats {
      grid-template-columns: repeat(2, 1fr) !important;
    }
  }

  @media (max-width: 768px) {
    .weekly-header {
      flex-direction: column !important;
      align-items: stretch !important;
      gap: 18px !important;
    }

    .weekly-header-button {
      flex: 1 !important;
      justify-content: center !important;
    }

    .weekly-card-header {
      flex-direction: column !important;
      align-items: stretch !important;
      gap: 18px !important;
    }

    .weekly-search {
      width: 100% !important;
    }

    .weekly-test-card {
      flex-direction: column !important;
      align-items: stretch !important;
      gap: 14px !important;
    }

    .weekly-test-main {
      width: 100% !important;
    }

    .weekly-status {
      align-self: flex-start !important;
    }

    .weekly-test-actions {
      width: 100% !important;
      justify-content: flex-end !important;
    }

    .weekly-form {
      grid-template-columns: 1fr !important;
    }

    .weekly-modal-form {
      grid-template-columns: 1fr !important;
    }

    .weekly-modal-full {
      grid-column: auto !important;
    }

    .weekly-modal {
      width: calc(100% - 24px) !important;
      max-height: 90vh !important;
      overflow-y: auto !important;
    }

    .weekly-details-grid {
      grid-template-columns: 1fr !important;
    }
  }

  @media (max-width: 520px) {
    .weekly-stats {
      grid-template-columns: 1fr !important;
    }

    .weekly-header-button {
      width: 100% !important;
    }

    .weekly-title {
      font-size: 32px !important;
    }

    .weekly-actions {
      justify-content: flex-start !important;
    }
  }
`;

/*
==================================================
STYLES
==================================================
*/

const styles = {
  container: {
    minHeight: "100vh",
    width: "100%",
    background: "#020617",
    color: "#FFFFFF",
    padding: "50px 44px 70px",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "28px",
    gap: "20px",
  },

  title: {
    margin: 0,
    fontSize: "42px",
    lineHeight: 1.1,
    fontWeight: 800,
    letterSpacing: "-1.2px",
    color: "#FFFFFF",
  },

  subtitle: {
    margin: "12px 0 0",
    color: "#64748B",
    fontSize: "16px",
  },

  headerActions: {
    display: "flex",
    gap: "14px",
  },

  refreshButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    height: "52px",
    padding: "0 22px",
    borderRadius: "13px",
    border: "1px solid #334155",
    background: "#0F172A",
    color: "#CBD5E1",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: 700,
  },

  createButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    height: "52px",
    padding: "0 24px",
    border: "none",
    borderRadius: "13px",
    background: "#8B5CF6",
    color: "#FFFFFF",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: 800,
    boxShadow: "0 10px 30px rgba(139,92,246,0.25)",
  },

  errorBox: {
    minHeight: "58px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    padding: "0 18px",
    marginBottom: "20px",
    borderRadius: "13px",
    border: "1px solid #991B1B",
    background: "#450A0A",
    color: "#FCA5A5",
    fontSize: "14px",
    fontWeight: 600,
  },

  successBox: {
    minHeight: "58px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "0 18px",
    marginBottom: "20px",
    borderRadius: "13px",
    border: "1px solid #065F46",
    background: "#022C22",
    color: "#6EE7B7",
    fontSize: "14px",
    fontWeight: 600,
  },

  alertClose: {
    border: "none",
    background: "transparent",
    color: "inherit",
    cursor: "pointer",
    fontSize: "16px",
    padding: "6px",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "20px",
    marginBottom: "28px",
  },

  statCard: {
    minHeight: "160px",
    display: "flex",
    alignItems: "center",
    gap: "18px",
    padding: "24px",
    border: "1px solid #1E293B",
    borderRadius: "17px",
    background: "#0F172A",
  },

  statIcon: {
    flexShrink: 0,
    width: "68px",
    height: "68px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "18px",
    fontSize: "25px",
  },

  statLabel: {
    display: "block",
    color: "#94A3B8",
    fontSize: "15px",
    marginBottom: "7px",
  },

  statNumber: {
    display: "block",
    color: "#FFFFFF",
    fontSize: "29px",
    lineHeight: 1,
    fontWeight: 800,
    marginBottom: "8px",
  },

  statDescription: {
    display: "block",
    color: "#64748B",
    fontSize: "12px",
  },

  mainCard: {
    background: "#0F172A",
    border: "1px solid #1E293B",
    borderRadius: "18px",
    overflow: "hidden",
  },

  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    padding: "30px 30px 25px",
    borderBottom: "1px solid #1E293B",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "25px",
    fontWeight: 800,
    color: "#FFFFFF",
  },

  sectionSubtitle: {
    margin: "8px 0 0",
    color: "#64748B",
    fontSize: "13px",
  },

  searchBox: {
    position: "relative",
    width: "360px",
  },

  searchIcon: {
    position: "absolute",
    left: "17px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#64748B",
    fontSize: "16px",
  },

  searchInput: {
    width: "100%",
    height: "50px",
    padding: "0 18px 0 48px",
    border: "1px solid #334155",
    borderRadius: "12px",
    outline: "none",
    background: "#020617",
    color: "#FFFFFF",
    fontSize: "14px",
  },

  testList: {
    padding: "20px",
  },

  testCard: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
    padding: "20px 18px",
    marginBottom: "12px",
    border: "1px solid #1E293B",
    borderRadius: "13px",
    background: "#111827",
    transition: "border-color 0.2s ease",
  },

  testIcon: {
    flexShrink: 0,
    width: "54px",
    height: "54px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "14px",
    background: "#312E81",
    color: "#A78BFA",
    fontSize: "21px",
  },

  testInfo: {
    flex: 1,
    minWidth: 0,
  },

  testTitle: {
    margin: 0,
    color: "#F8FAFC",
    fontSize: "17px",
    fontWeight: 750,
  },

  meta: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "13px",
    marginTop: "10px",
  },

  metaSpan: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    color: "#64748B",
    fontSize: "12px",
  },

  status: {
    flexShrink: 0,
    padding: "7px 12px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: 800,
    textTransform: "capitalize",
  },

  actions: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexShrink: 0,
  },

  viewButton: {
    width: "38px",
    height: "38px",
    borderRadius: "9px",
    border: "1px solid #1E3A8A",
    background: "#172554",
    color: "#93C5FD",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },

  editButton: {
    width: "38px",
    height: "38px",
    borderRadius: "9px",
    border: "1px solid #4C1D95",
    background: "#2E1065",
    color: "#C4B5FD",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },

  deleteButton: {
    width: "38px",
    height: "38px",
    borderRadius: "9px",
    border: "1px solid #7F1D1D",
    background: "#450A0A",
    color: "#FCA5A5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },

  noResults: {
    minHeight: "260px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "40px",
  },

  noResultsIcon: {
    fontSize: "42px",
    color: "#334155",
    marginBottom: "16px",
  },

  emptyTitle: {
    margin: 0,
    color: "#CBD5E1",
    fontSize: "18px",
  },

  emptyText: {
    margin: "8px 0 15px",
    color: "#64748B",
    fontSize: "13px",
  },

  smallAddButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    border: "none",
    borderRadius: "9px",
    background: "#8B5CF6",
    color: "#FFFFFF",
    padding: "10px 15px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: 700,
  },

  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    background: "rgba(2,6,23,0.82)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
    backdropFilter: "blur(4px)",
  },

  modal: {
    width: "650px",
    maxWidth: "100%",
    maxHeight: "90vh",
    overflowY: "auto",
    background: "#0F172A",
    border: "1px solid #312E81",
    borderRadius: "17px",
    padding: "24px",
    boxShadow: "0 25px 70px rgba(0,0,0,0.6)",
  },

  modalHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "20px",
    marginBottom: "24px",
  },

  modalTitle: {
    margin: 0,
    color: "#FFFFFF",
    fontSize: "21px",
    fontWeight: 800,
  },

  modalSubtitle: {
    margin: "6px 0 0",
    color: "#64748B",
    fontSize: "12px",
  },

  closeButton: {
    width: "36px",
    height: "36px",
    flexShrink: 0,
    border: "1px solid #334155",
    borderRadius: "9px",
    background: "#020617",
    color: "#94A3B8",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "18px",
  },

  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  formGroupFull: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    gridColumn: "1 / -1",
  },

  label: {
    color: "#CBD5E1",
    fontSize: "12px",
    fontWeight: 700,
  },

  input: {
    width: "100%",
    height: "46px",
    padding: "0 13px",
    border: "1px solid #334155",
    borderRadius: "9px",
    outline: "none",
    background: "#020617",
    color: "#FFFFFF",
    fontSize: "13px",
  },

  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "25px",
    paddingTop: "18px",
    borderTop: "1px solid #1E293B",
  },

  cancelButton: {
    height: "44px",
    padding: "0 17px",
    border: "1px solid #334155",
    borderRadius: "9px",
    background: "#1E293B",
    color: "#CBD5E1",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 700,
  },

  submitButton: {
    height: "44px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "0 19px",
    border: "none",
    borderRadius: "9px",
    background: "#8B5CF6",
    color: "#FFFFFF",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 800,
  },

  viewContent: {
    textAlign: "center",
    padding: "5px 0 20px",
  },

  viewIcon: {
    width: "60px",
    height: "60px",
    margin: "0 auto 15px",
    borderRadius: "15px",
    background: "#312E81",
    color: "#A78BFA",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
  },

  viewTitle: {
    margin: "0 0 22px",
    color: "#FFFFFF",
    fontSize: "21px",
    fontWeight: 800,
  },

  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "11px",
    textAlign: "left",
  },

  detailBox: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    padding: "14px",
    border: "1px solid #1E293B",
    borderRadius: "10px",
    background: "#020617",
  },

  loadingPage: {
    minHeight: "80vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#020617",
    color: "#FFFFFF",
  },

  loadingSpinner: {
    fontSize: "34px",
    color: "#8B5CF6",
    animation: "weeklySpin 1s linear infinite",
    marginBottom: "18px",
  },

  loadingTitle: {
    margin: 0,
    fontSize: "22px",
  },

  loadingText: {
    marginTop: "8px",
    color: "#64748B",
    fontSize: "13px",
  },
};

export default AdminWeeklyTests;
