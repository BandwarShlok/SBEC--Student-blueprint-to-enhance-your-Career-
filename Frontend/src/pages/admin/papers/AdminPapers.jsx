import { useEffect, useMemo, useState } from "react";
import {
  FaPlus,
  FaSearch,
  FaTrash,
  FaFilePdf,
  FaDownload,
  FaTimes,
  FaSyncAlt,
  FaEye,
} from "react-icons/fa";
import API_URL from "../../../config/api";

function AdminPapers() {
  // ==========================================================
  // STATE
  // ==========================================================

  const [papers, setPapers] = useState([]);
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    subject: "",
    year: "",
    semester: "",
    file: null,
  });

  // ==========================================================
  // FETCH PAPERS
  // ==========================================================

  const fetchPapers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/papers`);

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Failed to load papers.");
      }

      setPapers(Array.isArray(data.papers) ? data.papers : []);
    } catch (err) {
      console.error("FETCH PAPERS ERROR:", err);

      setError(
        err.message ||
          "Unable to load papers. Please make sure the backend is running.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    let active = true;

    const loadInitialPapers = async () => {
      try {
        const response = await fetch(`${API_URL}/api/papers`);

        const data = await response.json();

        if (!response.ok || data.success === false) {
          throw new Error(data.message || "Failed to load papers.");
        }

        if (active) {
          setPapers(Array.isArray(data.papers) ? data.papers : []);
        }
      } catch (err) {
        console.error("INITIAL PAPERS LOAD ERROR:", err);

        if (active) {
          setError(err.message || "Unable to load papers.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadInitialPapers();

    return () => {
      active = false;
    };
  }, []);

  // ==========================================================
  // FORM CHANGE
  // ==========================================================

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "file") {
      setFormData((previous) => ({
        ...previous,
        file: files && files.length > 0 ? files[0] : null,
      }));

      return;
    }

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================================
  // RESET FORM
  // ==========================================================

  const resetForm = () => {
    setFormData({
      subject: "",
      year: "",
      semester: "",
      file: null,
    });

    setShowForm(false);
  };

  // ==========================================================
  // UPLOAD PAPER
  // ==========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Validation
    if (!formData.subject) {
      setError("Please select a subject.");
      return;
    }

    if (!formData.year) {
      setError("Please select a year.");
      return;
    }

    if (!formData.semester) {
      setError("Please select a semester.");
      return;
    }

    if (!formData.file) {
      setError("Please select a PDF file.");
      return;
    }

    // PDF validation
    if (
      formData.file.type !== "application/pdf" &&
      !formData.file.name.toLowerCase().endsWith(".pdf")
    ) {
      setError("Only PDF files are allowed.");
      return;
    }

    try {
      setUploading(true);

      const uploadData = new FormData();

      uploadData.append("subject", formData.subject);
      uploadData.append("year", formData.year);
      uploadData.append("semester", formData.semester);
      uploadData.append("file", formData.file);

      const response = await fetch(`${API_URL}/api/papers`, {
        method: "POST",
        body: uploadData,
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Paper upload failed.");
      }

      setSuccess("Paper uploaded successfully.");

      resetForm();

      // Reload real data from MongoDB
      await fetchPapers();
    } catch (err) {
      console.error("UPLOAD ERROR:", err);

      setError(
        err.message || "Unable to upload paper. Please check your backend.",
      );
    } finally {
      setUploading(false);
    }
  };

  // ==========================================================
  // DELETE PAPER
  // ==========================================================

  const handleDelete = async (paper) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${paper.subject}" (${paper.year})?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(paper._id);
      setError("");
      setSuccess("");

      const response = await fetch(`${API_URL}/api/papers/${paper._id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Failed to delete paper.");
      }

      setSuccess("Paper deleted successfully.");

      await fetchPapers();
    } catch (err) {
      console.error("DELETE ERROR:", err);

      setError(
        err.message ||
          "Unable to delete paper. Check your backend DELETE route.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ==========================================================
  // PDF URL
  // ==========================================================

  const getFileUrl = (paper) => {
    if (!paper || !paper.fileUrl) {
      return null;
    }

    // If backend ever returns a complete URL
    if (paper.fileUrl.startsWith("http")) {
      return paper.fileUrl;
    }

    return `${API_URL}${paper.fileUrl}`;
  };

  // ==========================================================
  // VIEW PDF
  // ==========================================================

  const handleView = (paper) => {
    const fileUrl = getFileUrl(paper);

    if (!fileUrl) {
      setError("PDF file URL is not available.");
      return;
    }

    window.open(fileUrl, "_blank", "noopener,noreferrer");
  };

  // ==========================================================
  // DOWNLOAD PDF
  // ==========================================================

  const handleDownload = (paper) => {
    const fileUrl = getFileUrl(paper);

    if (!fileUrl) {
      setError("PDF file URL is not available.");
      return;
    }

    const link = document.createElement("a");

    link.href = fileUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    link.click();
  };

  // ==========================================================
  // REFRESH
  // ==========================================================

  const handleRefresh = async () => {
    setSearch("");
    setError("");
    setSuccess("");

    await fetchPapers();
  };

  // ==========================================================
  // FILTER
  // ==========================================================

  const filteredPapers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return papers;
    }

    return papers.filter((paper) => {
      const text = `
        ${paper.subject || ""}
        ${paper.year || ""}
        ${paper.semester || ""}
        ${paper.fileName || ""}
      `.toLowerCase();

      return text.includes(query);
    });
  }, [papers, search]);

  // ==========================================================
  // STATISTICS
  // ==========================================================

  const totalPapers = papers.length;

  const totalSubjects = new Set(
    papers.map((paper) => paper.subject).filter(Boolean),
  ).size;

  const showingPapers = filteredPapers.length;

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div style={styles.container}>
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="papers-header" style={styles.header}>
        <div style={styles.headerText}>
          <h1 style={styles.title}>Previous Papers</h1>

          <p style={styles.subtitle}>
            Upload and manage previous examination papers.
          </p>
        </div>

        <div className="papers-header-actions" style={styles.headerActions}>
          <button
            type="button"
            style={styles.refreshButton}
            onClick={handleRefresh}
            disabled={loading}
          >
            <FaSyncAlt className={loading ? "spin" : ""} />

            <span>{loading ? "Loading..." : "Refresh"}</span>
          </button>

          <button
            type="button"
            style={styles.addButton}
            onClick={() => {
              setError("");
              setSuccess("");

              if (showForm) {
                resetForm();
              } else {
                setShowForm(true);
              }
            }}
          >
            {showForm ? <FaTimes /> : <FaPlus />}

            <span>{showForm ? "Close" : "Add Paper"}</span>
          </button>
        </div>
      </div>

      {/* ======================================================
          MESSAGES
      ====================================================== */}

      {error && (
        <div style={styles.errorMessage}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {success && <div style={styles.successMessage}>{success}</div>}

      {/* ======================================================
          STATISTICS
      ====================================================== */}

      <div className="papers-stats-grid" style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>
            <FaFilePdf />
          </div>

          <div style={styles.statContent}>
            <p style={styles.statLabel}>Total Papers</p>

            <h2 style={styles.statValue}>{totalPapers}</h2>

            <p style={styles.statDescription}>All previous papers</p>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>
            <FaFilePdf />
          </div>

          <div style={styles.statContent}>
            <p style={styles.statLabel}>Subjects</p>

            <h2 style={styles.statValue}>{totalSubjects}</h2>

            <p style={styles.statDescription}>Subjects covered</p>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>
            <FaSearch />
          </div>

          <div style={styles.statContent}>
            <p style={styles.statLabel}>Showing</p>

            <h2 style={styles.statValue}>{showingPapers}</h2>

            <p style={styles.statDescription}>Filtered papers</p>
          </div>
        </div>
      </div>

      {/* ======================================================
          ADD PAPER FORM
      ====================================================== */}

      {showForm && (
        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <div>
              <h2 style={styles.formTitle}>Add Previous Paper</h2>

              <p style={styles.formSubtitle}>
                Upload a previous examination paper.
              </p>
            </div>

            <button
              type="button"
              style={styles.closeButton}
              onClick={resetForm}
            >
              <FaTimes />
            </button>
          </div>

          <form
            className="papers-form"
            onSubmit={handleSubmit}
            style={styles.form}
          >
            {/* SUBJECT */}

            <div style={styles.field}>
              <label style={styles.label}>Subject *</label>

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

                <option value="Web Development">Web Development</option>
              </select>
            </div>

            {/* YEAR */}

            <div style={styles.field}>
              <label style={styles.label}>Year *</label>

              <select
                name="year"
                value={formData.year}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="">Select Year</option>

                <option value="2026">2026</option>

                <option value="2025">2025</option>

                <option value="2024">2024</option>

                <option value="2023">2023</option>

                <option value="2022">2022</option>
              </select>
            </div>

            {/* SEMESTER */}

            <div style={styles.field}>
              <label style={styles.label}>Semester *</label>

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

            {/* FILE */}

            <div className="paper-file-field" style={styles.field}>
              <label style={styles.label}>PDF File *</label>

              <input
                type="file"
                name="file"
                accept="application/pdf,.pdf"
                onChange={handleChange}
                style={styles.fileInput}
              />

              {formData.file && (
                <p style={styles.selectedFile}>
                  Selected: {formData.file.name}
                </p>
              )}
            </div>

            {/* ACTIONS */}

            <div className="papers-form-actions" style={styles.formActions}>
              <button
                type="button"
                style={styles.cancelButton}
                onClick={resetForm}
                disabled={uploading}
              >
                Cancel
              </button>

              <button
                type="submit"
                style={{
                  ...styles.saveButton,
                  opacity: uploading ? 0.7 : 1,
                }}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <FaSyncAlt className="spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <FaPlus />
                    Upload Paper
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ======================================================
          ALL PAPERS
      ====================================================== */}

      <div className="papers-card" style={styles.card}>
        <div className="papers-card-header" style={styles.cardHeader}>
          <div>
            <h2 style={styles.cardTitle}>All Papers</h2>

            <p style={styles.cardSubtitle}>
              {totalPapers} previous {totalPapers === 1 ? "paper" : "papers"}{" "}
              available
            </p>
          </div>

          <div style={styles.searchBox}>
            <FaSearch style={styles.searchIcon} />

            <input
              type="text"
              placeholder="Search papers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
          </div>
        </div>

        {/* ====================================================
            LOADING
        ==================================================== */}

        {loading ? (
          <div style={styles.loadingBox}>
            <FaSyncAlt className="spin" />

            <span>Loading papers...</span>
          </div>
        ) : (
          <>
            {/* ================================================
                DESKTOP TABLE
            ================================================= */}

            <div className="papers-desktop-table" style={styles.desktopTable}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Subject</th>

                    <th style={styles.th}>Year</th>

                    <th style={styles.th}>Semester</th>

                    <th style={styles.th}>File</th>

                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredPapers.length > 0 ? (
                    filteredPapers.map((paper) => (
                      <tr key={paper._id}>
                        {/* SUBJECT */}

                        <td style={styles.td}>
                          <div style={styles.subjectCell}>
                            <div style={styles.pdfIcon}>
                              <FaFilePdf />
                            </div>

                            <span>{paper.subject}</span>
                          </div>
                        </td>

                        {/* YEAR */}

                        <td style={styles.td}>{paper.year}</td>

                        {/* SEMESTER */}

                        <td style={styles.td}>
                          <span style={styles.badge}>{paper.semester}</span>
                        </td>

                        {/* FILE */}

                        <td style={styles.td}>
                          <span style={styles.pdfBadge}>
                            <FaFilePdf />
                            PDF
                          </span>
                        </td>

                        {/* ACTIONS */}

                        <td style={styles.td}>
                          <div style={styles.actions}>
                            <button
                              type="button"
                              style={styles.viewButton}
                              onClick={() => handleView(paper)}
                              title="View PDF"
                            >
                              <FaEye />
                            </button>

                            <button
                              type="button"
                              style={styles.downloadButton}
                              onClick={() => handleDownload(paper)}
                              title="Download PDF"
                            >
                              <FaDownload />
                            </button>

                            <button
                              type="button"
                              style={styles.deleteButton}
                              onClick={() => handleDelete(paper)}
                              disabled={deletingId === paper._id}
                              title="Delete"
                            >
                              {deletingId === paper._id ? (
                                <FaSyncAlt className="spin" />
                              ) : (
                                <FaTrash />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={styles.noResults}>
                        {search
                          ? "No papers match your search."
                          : "No previous papers available."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* ================================================
                MOBILE CARDS
            ================================================= */}

            <div className="papers-mobile-list" style={styles.mobileList}>
              {filteredPapers.length > 0 ? (
                filteredPapers.map((paper) => (
                  <div key={paper._id} style={styles.mobilePaper}>
                    {/* TOP */}

                    <div style={styles.mobilePaperTop}>
                      <div style={styles.mobileSubject}>
                        <div style={styles.mobilePdfIcon}>
                          <FaFilePdf />
                        </div>

                        <div style={styles.mobileSubjectContent}>
                          <h3 style={styles.mobileSubjectName}>
                            {paper.subject}
                          </h3>

                          <span style={styles.mobilePdfText}>
                            <FaFilePdf />

                            {paper.fileName || "PDF Document"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* INFORMATION */}

                    <div style={styles.mobileInfoGrid}>
                      <div style={styles.mobileInfo}>
                        <span style={styles.mobileInfoLabel}>Year</span>

                        <strong>{paper.year}</strong>
                      </div>

                      <div style={styles.mobileInfo}>
                        <span style={styles.mobileInfoLabel}>Semester</span>

                        <strong>{paper.semester}</strong>
                      </div>
                    </div>

                    {/* ACTIONS */}

                    <div style={styles.mobileActions}>
                      <button
                        type="button"
                        style={styles.mobileView}
                        onClick={() => handleView(paper)}
                      >
                        <FaEye />

                        <span>View</span>
                      </button>

                      <button
                        type="button"
                        style={styles.mobileDownload}
                        onClick={() => handleDownload(paper)}
                      >
                        <FaDownload />

                        <span>Download</span>
                      </button>

                      <button
                        type="button"
                        style={styles.mobileDelete}
                        onClick={() => handleDelete(paper)}
                        disabled={deletingId === paper._id}
                      >
                        {deletingId === paper._id ? (
                          <FaSyncAlt className="spin" />
                        ) : (
                          <FaTrash />
                        )}

                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div style={styles.mobileNoResults}>
                  {search
                    ? "No papers match your search."
                    : "No previous papers available."}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ======================================================
          RESPONSIVE CSS
      ====================================================== */}

      <style>
        {`
          * {
            box-sizing: border-box;
          }

          .spin {
            animation: sbecSpin 0.8s linear infinite;
          }

          @keyframes sbecSpin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          button:disabled {
            cursor: not-allowed !important;
          }

          input::placeholder {
            color: #64748B;
          }

          select option {
            background: #020617;
            color: #FFFFFF;
          }

          @media (max-width: 900px) {
            .papers-form {
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            }

            .paper-file-field {
              grid-column: 1 / -1 !important;
            }
          }

          @media (max-width: 768px) {
            .papers-header {
              flex-direction: column !important;
              align-items: stretch !important;
              gap: 15px !important;
              margin-bottom: 18px !important;
            }

            .papers-header h1 {
              font-size: 30px !important;
              line-height: 1.15 !important;
            }

            .papers-header p {
              font-size: 13px !important;
              max-width: 300px !important;
            }

            .papers-header-actions {
              width: 100% !important;
              display: grid !important;
              grid-template-columns: 1fr 1fr !important;
              gap: 10px !important;
            }

            .papers-header-actions button {
              width: 100% !important;
              min-height: 48px !important;
            }

            .papers-stats-grid {
              grid-template-columns: 1fr !important;
              gap: 11px !important;
            }

            .papers-stats-grid > div {
              width: 100% !important;
            }

            .papers-form {
              grid-template-columns: 1fr !important;
            }

            .paper-file-field {
              grid-column: auto !important;
            }

            .papers-form-actions {
              display: grid !important;
              grid-template-columns: 1fr 1fr !important;
            }

            .papers-form-actions button {
              width: 100% !important;
            }

            .papers-card {
              padding: 16px !important;
            }

            .papers-card-header {
              flex-direction: column !important;
              align-items: stretch !important;
              gap: 14px !important;
            }

            .papers-card-header > div {
              width: 100% !important;
            }

            .papers-card-header input {
              width: 100% !important;
            }

            .papers-desktop-table {
              display: none !important;
            }

            .papers-mobile-list {
              display: block !important;
            }
          }

          @media (max-width: 420px) {
            .papers-header h1 {
              font-size: 27px !important;
            }

            .papers-header-actions {
              grid-template-columns: 1fr 1fr !important;
            }

            .papers-header-actions button {
              font-size: 12px !important;
              padding: 0 8px !important;
            }

            .papers-card {
              padding: 13px !important;
            }

            .papers-form-actions {
              grid-template-columns: 1fr !important;
            }

            .mobilePaper {
              padding: 14px !important;
            }

            .mobileActions {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>
    </div>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = {
  container: {
    width: "100%",
    maxWidth: "1200px",
    margin: "0 auto",
    boxSizing: "border-box",
  },

  // ==========================================================
  // HEADER
  // ==========================================================

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "22px",
  },

  headerText: {
    minWidth: 0,
  },

  title: {
    color: "#FFFFFF",
    fontSize: "30px",
    fontWeight: "700",
    margin: 0,
  },

  subtitle: {
    color: "#64748B",
    fontSize: "14px",
    margin: "7px 0 0",
    lineHeight: "1.5",
  },

  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexShrink: 0,
  },

  refreshButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    minHeight: "46px",
    padding: "0 17px",
    background: "#0F172A",
    border: "1px solid #1E293B",
    borderRadius: "10px",
    color: "#CBD5E1",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
  },

  addButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    minHeight: "46px",
    padding: "0 18px",
    background: "#8B5CF6",
    border: "none",
    borderRadius: "10px",
    color: "#FFFFFF",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "700",
  },

  // ==========================================================
  // MESSAGES
  // ==========================================================

  errorMessage: {
    background: "#450A0A",
    border: "1px solid #7F1D1D",
    color: "#FCA5A5",
    borderRadius: "10px",
    padding: "12px 14px",
    marginBottom: "15px",
    fontSize: "13px",
  },

  successMessage: {
    background: "#052E16",
    border: "1px solid #166534",
    color: "#86EFAC",
    borderRadius: "10px",
    padding: "12px 14px",
    marginBottom: "15px",
    fontSize: "13px",
  },

  // ==========================================================
  // STATS
  // ==========================================================

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "15px",
    marginBottom: "20px",
  },

  statCard: {
    minWidth: 0,
    background: "#0F172A",
    border: "1px solid #1E293B",
    borderRadius: "15px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },

  statIcon: {
    width: "50px",
    height: "50px",
    minWidth: "50px",
    borderRadius: "13px",
    background: "#312E81",
    color: "#A78BFA",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "19px",
  },

  statContent: {
    minWidth: 0,
  },

  statLabel: {
    margin: 0,
    color: "#94A3B8",
    fontSize: "13px",
  },

  statValue: {
    margin: "4px 0",
    color: "#FFFFFF",
    fontSize: "27px",
    lineHeight: 1.1,
  },

  statDescription: {
    margin: 0,
    color: "#64748B",
    fontSize: "11px",
  },

  // ==========================================================
  // FORM
  // ==========================================================

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
    gap: "15px",
    marginBottom: "20px",
  },

  formTitle: {
    color: "#FFFFFF",
    fontSize: "19px",
    margin: 0,
  },

  formSubtitle: {
    color: "#64748B",
    fontSize: "12px",
    margin: "5px 0 0",
  },

  closeButton: {
    width: "34px",
    height: "34px",
    border: "none",
    borderRadius: "8px",
    background: "#1E293B",
    color: "#94A3B8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },

  form: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "14px",
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

  input: {
    width: "100%",
    minHeight: "43px",
    background: "#020617",
    border: "1px solid #334155",
    borderRadius: "9px",
    color: "#FFFFFF",
    padding: "10px 11px",
    outline: "none",
    fontSize: "12px",
  },

  fileInput: {
    width: "100%",
    minHeight: "43px",
    background: "#020617",
    border: "1px solid #334155",
    borderRadius: "9px",
    color: "#94A3B8",
    padding: "9px",
    fontSize: "11px",
  },

  selectedFile: {
    margin: "7px 0 0",
    color: "#A78BFA",
    fontSize: "11px",
    wordBreak: "break-word",
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
    padding: "0 16px",
    background: "#1E293B",
    border: "none",
    borderRadius: "9px",
    color: "#CBD5E1",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
  },

  saveButton: {
    minHeight: "42px",
    padding: "0 17px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    background: "#8B5CF6",
    border: "none",
    borderRadius: "9px",
    color: "#FFFFFF",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "700",
  },

  // ==========================================================
  // MAIN CARD
  // ==========================================================

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
    color: "#FFFFFF",
    fontSize: "19px",
    margin: 0,
  },

  cardSubtitle: {
    color: "#64748B",
    fontSize: "12px",
    margin: "5px 0 0",
  },

  searchBox: {
    width: "250px",
    minHeight: "43px",
    display: "flex",
    alignItems: "center",
    background: "#020617",
    border: "1px solid #334155",
    borderRadius: "9px",
    padding: "0 11px",
  },

  searchIcon: {
    color: "#64748B",
    fontSize: "13px",
    flexShrink: 0,
  },

  searchInput: {
    width: "100%",
    minWidth: 0,
    background: "transparent",
    border: "none",
    outline: "none",
    color: "#FFFFFF",
    padding: "0 9px",
    fontSize: "13px",
  },

  // ==========================================================
  // LOADING
  // ==========================================================

  loadingBox: {
    minHeight: "180px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    color: "#94A3B8",
    fontSize: "13px",
  },

  // ==========================================================
  // TABLE
  // ==========================================================

  desktopTable: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "700px",
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
    padding: "15px 12px",
    borderBottom: "1px solid #1E293B",
  },

  subjectCell: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontWeight: "600",
  },

  pdfIcon: {
    width: "36px",
    height: "36px",
    minWidth: "36px",
    borderRadius: "9px",
    background: "#450A0A",
    color: "#FCA5A5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
  },

  badge: {
    display: "inline-flex",
    background: "#312E81",
    color: "#C4B5FD",
    padding: "5px 9px",
    borderRadius: "6px",
    fontSize: "10px",
    fontWeight: "600",
  },

  pdfBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    background: "#450A0A",
    color: "#FCA5A5",
    padding: "5px 9px",
    borderRadius: "6px",
    fontSize: "10px",
    fontWeight: "600",
  },

  actions: {
    display: "flex",
    gap: "7px",
  },

  viewButton: {
    width: "32px",
    height: "32px",
    border: "none",
    borderRadius: "7px",
    background: "#312E81",
    color: "#C4B5FD",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  downloadButton: {
    width: "32px",
    height: "32px",
    border: "none",
    borderRadius: "7px",
    background: "#1E293B",
    color: "#CBD5E1",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  deleteButton: {
    width: "32px",
    height: "32px",
    border: "none",
    borderRadius: "7px",
    background: "#450A0A",
    color: "#FCA5A5",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  noResults: {
    textAlign: "center",
    color: "#64748B",
    padding: "40px",
    fontSize: "13px",
  },

  // ==========================================================
  // MOBILE
  // ==========================================================

  mobileList: {
    display: "none",
    width: "100%",
  },

  mobilePaper: {
    width: "100%",
    background: "#020617",
    border: "1px solid #1E293B",
    borderRadius: "14px",
    padding: "16px",
    marginBottom: "12px",
    overflow: "hidden",
  },

  mobilePaperTop: {
    marginBottom: "15px",
  },

  mobileSubject: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    minWidth: 0,
  },

  mobileSubjectContent: {
    minWidth: 0,
    flex: 1,
  },

  mobilePdfIcon: {
    width: "44px",
    height: "44px",
    minWidth: "44px",
    borderRadius: "11px",
    background: "#450A0A",
    color: "#FCA5A5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "17px",
  },

  mobileSubjectName: {
    color: "#FFFFFF",
    fontSize: "15px",
    lineHeight: "1.3",
    margin: 0,
    wordBreak: "break-word",
  },

  mobilePdfText: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    color: "#64748B",
    fontSize: "10px",
    marginTop: "5px",
    wordBreak: "break-word",
  },

  mobileInfoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "9px",
    marginBottom: "14px",
  },

  mobileInfo: {
    background: "#0F172A",
    borderRadius: "9px",
    padding: "10px",
    minWidth: 0,
    color: "#CBD5E1",
  },

  mobileInfoLabel: {
    display: "block",
    color: "#64748B",
    fontSize: "10px",
    marginBottom: "4px",
  },

  mobileActions: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "7px",
  },

  mobileView: {
    minHeight: "40px",
    border: "none",
    borderRadius: "8px",
    background: "#312E81",
    color: "#C4B5FD",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: "600",
  },

  mobileDownload: {
    minHeight: "40px",
    border: "none",
    borderRadius: "8px",
    background: "#1E293B",
    color: "#CBD5E1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: "600",
  },

  mobileDelete: {
    minHeight: "40px",
    border: "none",
    borderRadius: "8px",
    background: "#450A0A",
    color: "#FCA5A5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: "600",
  },

  mobileNoResults: {
    textAlign: "center",
    color: "#64748B",
    padding: "35px 10px",
    fontSize: "12px",
  },
};

export default AdminPapers;
