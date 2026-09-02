import { useEffect, useMemo, useState } from "react";

import {
  FaFilePdf,
  FaSearch,
  FaFilter,
  FaExternalLinkAlt,
  FaDownload,
  FaBook,
  FaTimes,
  FaSyncAlt,
  FaExclamationCircle,
} from "react-icons/fa";

import API_URL from "../../config/api";

/* =========================================================
   HELPERS
========================================================= */

const getPaperId = (paper) => paper?._id || paper?.id;

const getSubject = (paper) => {
  if (typeof paper?.subject === "object") {
    return paper.subject?.name || paper.subject?.title || "Unknown Subject";
  }

  return paper?.subject || paper?.subjectName || "Unknown Subject";
};

const getYear = (paper) => paper?.year || "";

const getSemester = (paper) => paper?.semester || "";

const getFileName = (paper) =>
  paper?.fileName ||
  paper?.filename ||
  paper?.originalName ||
  "Question Paper.pdf";

/* =========================================================
   COMPONENT
========================================================= */

function PreviousYearPapers() {
  /* =======================================================
     STATE
  ======================================================= */

  const [papers, setPapers] = useState([]);

  const [search, setSearch] = useState("");

  const [selectedSubject, setSelectedSubject] = useState("All Subjects");

  const [selectedYear, setSelectedYear] = useState("All Years");

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [message, setMessage] = useState("");

  /* =======================================================
     FETCH PAPERS FROM BACKEND
     
     Backend:
     GET /api/papers
  ======================================================= */

  const fetchPapers = async () => {
    try {
      setError("");

      const response = await fetch(`${API_URL}/api/papers`);

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to load previous year papers.",
        );
      }

      const list = data?.papers || data?.data || [];

      if (!Array.isArray(list)) {
        throw new Error("Invalid papers data received from backend.");
      }

      setPapers(list);
    } catch (err) {
      console.error("FETCH PREVIOUS PAPERS ERROR:", err);

      setError(err?.message || "Unable to connect to the backend.");

      setPapers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* =======================================================
     INITIAL LOAD

     Timeout avoids the React lint warning you were
     getting elsewhere in the project.
  ======================================================= */

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPapers();
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  /* =======================================================
     REFRESH
  ======================================================= */

  const handleRefresh = async () => {
    setRefreshing(true);
    setMessage("");
    setError("");

    await fetchPapers();
  };

  /* =======================================================
     SUBJECT OPTIONS
     
     These now come from MongoDB instead of hard-coded data.
  ======================================================= */

  const subjects = useMemo(() => {
    const uniqueSubjects = [
      ...new Set(
        papers
          .map((paper) => getSubject(paper))
          .filter((subject) => subject && subject !== "Unknown Subject"),
      ),
    ];

    return ["All Subjects", ...uniqueSubjects.sort()];
  }, [papers]);

  /* =======================================================
     YEAR OPTIONS
     
     These also come from backend data.
  ======================================================= */

  const years = useMemo(() => {
    const uniqueYears = [
      ...new Set(
        papers
          .map((paper) => getYear(paper))
          .filter(Boolean)
          .map(Number),
      ),
    ];

    uniqueYears.sort((a, b) => b - a);

    return ["All Years", ...uniqueYears];
  }, [papers]);

  /* =======================================================
     FILTER PAPERS
  ======================================================= */

  const filteredPapers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return papers.filter((paper) => {
      const subject = getSubject(paper).toLowerCase();

      const year = String(getYear(paper)).toLowerCase();

      const semester = String(getSemester(paper)).toLowerCase();

      const fileName = getFileName(paper).toLowerCase();

      const matchesSearch =
        !query ||
        subject.includes(query) ||
        year.includes(query) ||
        semester.includes(query) ||
        fileName.includes(query);

      const matchesSubject =
        selectedSubject === "All Subjects" ||
        subject === selectedSubject.toLowerCase();

      const matchesYear =
        selectedYear === "All Years" ||
        Number(getYear(paper)) === Number(selectedYear);

      return matchesSearch && matchesSubject && matchesYear;
    });
  }, [papers, search, selectedSubject, selectedYear]);

  /* =======================================================
     CLEAR FILTERS
  ======================================================= */

  const clearFilters = () => {
    setSearch("");

    setSelectedSubject("All Subjects");

    setSelectedYear("All Years");

    setMessage("");
  };

  /* =======================================================
     GET PDF URL
     
     Backend may return:
     
     /uploads/papers/file.pdf
     
     OR:
     
     http://server:5000/uploads/papers/file.pdf
  ======================================================= */

  const getFileUrl = (paper) => {
    if (!paper) {
      return null;
    }

    const rawUrl = paper.fileUrl || paper.file || paper.url || "";

    if (!rawUrl) {
      return null;
    }

    if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
      return rawUrl;
    }

    if (rawUrl.startsWith("/")) {
      return `${API_URL}${rawUrl}`;
    }

    return `${API_URL}/${rawUrl}`;
  };

  /* =======================================================
     VIEW PDF
  ======================================================= */

  const handleOpen = (paper) => {
    const fileUrl = getFileUrl(paper);

    if (!fileUrl) {
      setMessage("PDF file is not available for this paper.");

      return;
    }

    window.open(fileUrl, "_blank", "noopener,noreferrer");
  };

  /* =======================================================
     DOWNLOAD PDF
  ======================================================= */

  const handleDownload = (paper) => {
    const fileUrl = getFileUrl(paper);

    if (!fileUrl) {
      setMessage("PDF file is not available for this paper.");

      return;
    }

    const link = document.createElement("a");

    link.href = fileUrl;

    link.target = "_blank";

    link.rel = "noopener noreferrer";

    link.download = getFileName(paper);

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  };

  /* =======================================================
     STATISTICS
  ======================================================= */

  const totalPapers = papers.length;

  const totalSubjects = new Set(
    papers.map((paper) => getSubject(paper)).filter(Boolean),
  ).size;

  const showingPapers = filteredPapers.length;

  /* =======================================================
     LOADING SCREEN
  ======================================================= */

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <FaSyncAlt style={styles.loadingIcon} className="pyp-spin" />

        <h2 style={styles.loadingTitle}>Loading Previous Papers</h2>

        <p style={styles.loadingText}>Fetching papers from the database...</p>

        <style>
          {`
            .pyp-spin {
              animation:
                pypSpin 0.8s linear infinite;
            }

            @keyframes pypSpin {
              from {
                transform: rotate(0deg);
              }

              to {
                transform: rotate(360deg);
              }
            }
          `}
        </style>
      </div>
    );
  }

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <div style={styles.page}>
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="pyp-header" style={styles.header}>
        <div>
          <h1 style={styles.title}>Previous Year Papers</h1>

          <p style={styles.subtitle}>
            Practice previous examination papers and understand the exam
            pattern.
          </p>
        </div>

        <div className="pyp-header-actions" style={styles.headerActions}>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            style={styles.refreshButton}
          >
            <FaSyncAlt className={refreshing ? "pyp-spin" : ""} />

            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>

          <div className="pyp-total-badge" style={styles.totalBadge}>
            <FaFilePdf />

            <span>{totalPapers} Papers</span>
          </div>
        </div>
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="pyp-alert pyp-alert-error" style={styles.errorAlert}>
          <div style={styles.alertContent}>
            <FaExclamationCircle />

            <div>
              <strong>Unable to load papers</strong>

              <span>{error}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setError("")}
            style={styles.alertClose}
          >
            <FaTimes />
          </button>
        </div>
      )}

      {/* =====================================================
          SUCCESS / INFORMATION
      ===================================================== */}

      {message && (
        <div className="pyp-alert pyp-alert-info" style={styles.infoAlert}>
          <div style={styles.alertContent}>
            <FaFilePdf />

            <span>{message}</span>
          </div>

          <button
            type="button"
            onClick={() => setMessage("")}
            style={styles.alertClose}
          >
            <FaTimes />
          </button>
        </div>
      )}

      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <div className="pyp-stats-grid" style={styles.statsGrid}>
        <div className="pyp-stat-card" style={styles.statCard}>
          <div style={styles.statIconPurple}>
            <FaFilePdf />
          </div>

          <div>
            <p style={styles.statLabel}>Total Papers</p>

            <h2 style={styles.statValue}>{totalPapers}</h2>

            <span style={styles.statText}>All available papers</span>
          </div>
        </div>

        <div className="pyp-stat-card" style={styles.statCard}>
          <div style={styles.statIconBlue}>
            <FaBook />
          </div>

          <div>
            <p style={styles.statLabel}>Subjects</p>

            <h2 style={styles.statValue}>{totalSubjects}</h2>

            <span style={styles.statText}>Subjects covered</span>
          </div>
        </div>

        <div className="pyp-stat-card" style={styles.statCard}>
          <div style={styles.statIconGreen}>
            <FaSearch />
          </div>

          <div>
            <p style={styles.statLabel}>Showing</p>

            <h2 style={styles.statValue}>{showingPapers}</h2>

            <span style={styles.statText}>Filtered papers</span>
          </div>
        </div>
      </div>

      {/* =====================================================
          SEARCH + FILTERS
      ===================================================== */}

      <div className="pyp-filter-card" style={styles.filterCard}>
        <div style={styles.searchWrapper}>
          <FaSearch style={styles.searchIcon} />

          <input
            type="text"
            placeholder="Search subject, year or PDF..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              style={styles.clearSearch}
            >
              <FaTimes />
            </button>
          )}
        </div>

        <div className="pyp-filter-wrapper" style={styles.filterWrapper}>
          <FaFilter style={styles.filterIcon} />

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            style={styles.select}
          >
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            style={styles.select}
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          {(search ||
            selectedSubject !== "All Subjects" ||
            selectedYear !== "All Years") && (
            <button
              type="button"
              onClick={clearFilters}
              style={styles.clearButton}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* =====================================================
          RESULTS HEADER
      ===================================================== */}

      <div style={styles.resultHeader}>
        <div>
          <h2 style={styles.sectionTitle}>Available Papers</h2>

          <p style={styles.sectionSubtitle}>
            {showingPapers} paper
            {showingPapers !== 1 ? "s" : ""} found
          </p>
        </div>
      </div>

      {/* =====================================================
          EMPTY STATE
      ===================================================== */}

      {filteredPapers.length === 0 ? (
        <div style={styles.emptyState}>
          <FaFilePdf style={styles.emptyIcon} />

          <h2>No Papers Found</h2>

          <p>
            {papers.length === 0
              ? "No previous year papers have been uploaded yet."
              : "Try changing your search or filters."}
          </p>

          {(search ||
            selectedSubject !== "All Subjects" ||
            selectedYear !== "All Years") && (
            <button
              type="button"
              onClick={clearFilters}
              style={styles.emptyButton}
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        /* ===================================================
           PAPER GRID
        =================================================== */

        <div className="pyp-paper-grid" style={styles.paperGrid}>
          {filteredPapers.map((paper) => {
            const subject = getSubject(paper);

            const year = getYear(paper);

            const semester = getSemester(paper);

            const fileName = getFileName(paper);

            const hasFile = Boolean(getFileUrl(paper));

            return (
              <div
                key={getPaperId(paper)}
                className="pyp-paper-card"
                style={styles.paperCard}
              >
                {/* CARD TOP */}

                <div style={styles.cardTop}>
                  <div style={styles.pdfIcon}>
                    <FaFilePdf />
                  </div>

                  <div style={styles.yearBadge}>{year || "Year"}</div>
                </div>

                {/* TITLE */}

                <h3 style={styles.paperTitle}>{subject}</h3>

                {/* FILE NAME */}

                <p style={styles.fileName} title={fileName}>
                  {fileName}
                </p>

                {/* INFORMATION */}

                <div style={styles.infoGrid}>
                  <div>
                    <span style={styles.infoLabel}>Year</span>

                    <strong style={styles.infoValue}>{year || "—"}</strong>
                  </div>

                  <div>
                    <span style={styles.infoLabel}>Semester</span>

                    <strong style={styles.infoValue}>{semester || "—"}</strong>
                  </div>
                </div>

                {/* ACTIONS */}

                <div style={styles.actions}>
                  <button
                    type="button"
                    onClick={() => handleOpen(paper)}
                    disabled={!hasFile}
                    style={{
                      ...styles.viewButton,
                      opacity: hasFile ? 1 : 0.5,
                      cursor: hasFile ? "pointer" : "not-allowed",
                    }}
                  >
                    <FaExternalLinkAlt />

                    <span>View Paper</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownload(paper)}
                    disabled={!hasFile}
                    style={{
                      ...styles.downloadButton,
                      opacity: hasFile ? 1 : 0.5,
                      cursor: hasFile ? "pointer" : "not-allowed",
                    }}
                    title="Download PDF"
                    aria-label="Download PDF"
                  >
                    <FaDownload />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =====================================================
          PREPARATION TIP
      ===================================================== */}

      <div className="pyp-tip-card" style={styles.tipCard}>
        <div style={styles.tipIcon}>
          <FaBook />
        </div>

        <div>
          <h3 style={styles.tipTitle}>How to use Previous Year Papers</h3>

          <p style={styles.tipText}>
            First study your subject notes, then solve older papers without
            looking at the answers. Use repeated questions to identify important
            topics for your preparation.
          </p>
        </div>
      </div>

      {/* =====================================================
          RESPONSIVE CSS
      ===================================================== */}

      <style>
        {`

          * {
            box-sizing: border-box;
          }

          .pyp-spin {
            animation:
              pypSpin 0.8s linear infinite;
          }

          @keyframes pypSpin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          .pyp-paper-card {
            transition:
              transform 0.18s ease,
              border-color 0.18s ease,
              box-shadow 0.18s ease;
          }

          .pyp-paper-card:hover {
            transform: translateY(-3px);

            border-color:
              #312E81 !important;

            box-shadow:
              0 12px 35px
              rgba(0, 0, 0, 0.22);
          }

          .pyp-paper-card button {
            transition:
              transform 0.15s ease,
              background 0.15s ease,
              opacity 0.15s ease;
          }

          .pyp-paper-card button:not(:disabled):hover {
            transform: translateY(-1px);
          }

          input::placeholder {
            color: #64748B;
          }

          select option {
            background: #020617;
            color: #FFFFFF;
          }

          @media (max-width: 1000px) {

            .pyp-stats-grid {
              grid-template-columns:
                repeat(2, minmax(0, 1fr))
                !important;
            }

            .pyp-filter-card {
              flex-direction:
                column !important;

              align-items:
                stretch !important;
            }

            .pyp-filter-wrapper {
              width: 100% !important;
            }

            .pyp-filter-wrapper select {
              flex: 1 !important;
            }

          }


          @media (max-width: 768px) {

            .pyp-header {
              flex-direction:
                column !important;

              align-items:
                stretch !important;

              gap: 15px !important;

              margin-bottom:
                20px !important;
            }

            .pyp-header h1 {
              font-size:
                28px !important;
            }

            .pyp-header-actions {
              width: 100% !important;

              display:
                grid !important;

              grid-template-columns:
                1fr 1fr !important;

              gap: 10px !important;
            }

            .pyp-header-actions button,
            .pyp-total-badge {
              width: 100% !important;

              min-height:
                46px !important;
            }

            .pyp-stats-grid {
              grid-template-columns:
                1fr !important;

              gap: 10px !important;
            }

            .pyp-filter-wrapper {
              display:
                grid !important;

              grid-template-columns:
                1fr !important;

              gap: 10px !important;
            }

            .pyp-filter-wrapper select,
            .pyp-filter-wrapper button {
              width: 100% !important;

              min-height:
                44px !important;
            }

            .pyp-paper-grid {
              grid-template-columns:
                1fr !important;
            }

          }


          @media (max-width: 480px) {

            .pyp-header h1 {
              font-size:
                25px !important;
            }

            .pyp-header p {
              font-size:
                12px !important;
            }

            .pyp-filter-card {
              padding:
                12px !important;
            }

            .pyp-paper-card {
              padding:
                16px !important;
            }

            .pyp-tip-card {
              flex-direction:
                column !important;

              align-items:
                flex-start !important;
            }

            .pyp-actions {
              width: 100%;
            }

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

  /* =======================================================
     HEADER
  ======================================================= */

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "30px",
  },

  title: {
    color: "#FFFFFF",
    fontSize: "32px",
    fontWeight: "800",
    margin: 0,
    lineHeight: 1.2,
  },

  subtitle: {
    color: "#94A3B8",
    fontSize: "14px",
    margin: "8px 0 0",
    lineHeight: 1.6,
  },

  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  refreshButton: {
    minHeight: "42px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    background: "#0F172A",
    border: "1px solid #334155",
    borderRadius: "10px",
    color: "#CBD5E1",
    padding: "0 15px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
  },

  totalBadge: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    background: "#312E81",
    color: "#A78BFA",
    borderRadius: "9px",
    padding: "10px 14px",
    fontSize: "12px",
    fontWeight: "600",
    minHeight: "42px",
  },

  /* =======================================================
     ALERTS
  ======================================================= */

  errorAlert: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "15px",
    background: "#450A0A",
    border: "1px solid #991B1B",
    borderRadius: "11px",
    color: "#FCA5A5",
    padding: "13px 15px",
    marginBottom: "18px",
  },

  infoAlert: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "15px",
    background: "#172554",
    border: "1px solid #1D4ED8",
    borderRadius: "11px",
    color: "#BFDBFE",
    padding: "13px 15px",
    marginBottom: "18px",
  },

  alertContent: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    minWidth: 0,
    fontSize: "12px",
  },

  alertClose: {
    width: "30px",
    height: "30px",
    flexShrink: 0,
    border: "none",
    borderRadius: "7px",
    background: "rgba(255,255,255,0.08)",
    color: "inherit",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  /* =======================================================
     STATS
  ======================================================= */

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "16px",
    marginBottom: "25px",
  },

  statCard: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    background: "#0F172A",
    border: "1px solid #1E293B",
    borderRadius: "15px",
    padding: "18px",
    minWidth: 0,
  },

  statIconPurple: {
    width: "48px",
    height: "48px",
    minWidth: "48px",
    borderRadius: "12px",
    background: "#312E81",
    color: "#A78BFA",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "19px",
  },

  statIconBlue: {
    width: "48px",
    height: "48px",
    minWidth: "48px",
    borderRadius: "12px",
    background: "#172554",
    color: "#93C5FD",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "19px",
  },

  statIconGreen: {
    width: "48px",
    height: "48px",
    minWidth: "48px",
    borderRadius: "12px",
    background: "#064E3B",
    color: "#6EE7B7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "19px",
  },

  statLabel: {
    color: "#94A3B8",
    fontSize: "12px",
    margin: 0,
  },

  statValue: {
    color: "#FFFFFF",
    fontSize: "24px",
    fontWeight: "800",
    margin: "3px 0",
  },

  statText: {
    color: "#64748B",
    fontSize: "10px",
  },

  /* =======================================================
     FILTER CARD
  ======================================================= */

  filterCard: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    background: "#0F172A",
    border: "1px solid #1E293B",
    borderRadius: "15px",
    padding: "15px",
    marginBottom: "28px",
    boxSizing: "border-box",
  },

  searchWrapper: {
    flex: 1,
    minWidth: 0,
    height: "44px",
    display: "flex",
    alignItems: "center",
    background: "#020617",
    border: "1px solid #334155",
    borderRadius: "9px",
    paddingLeft: "13px",
  },

  searchIcon: {
    color: "#64748B",
    fontSize: "13px",
    flexShrink: 0,
  },

  searchInput: {
    width: "100%",
    height: "100%",
    background: "transparent",
    border: "none",
    outline: "none",
    color: "#FFFFFF",
    padding: "0 10px",
    fontSize: "13px",
  },

  clearSearch: {
    width: "30px",
    height: "30px",
    marginRight: "6px",
    border: "none",
    borderRadius: "7px",
    background: "#1E293B",
    color: "#94A3B8",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  filterWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexShrink: 0,
  },

  filterIcon: {
    color: "#64748B",
    fontSize: "13px",
    flexShrink: 0,
  },

  select: {
    minHeight: "44px",
    maxWidth: "230px",
    background: "#020617",
    border: "1px solid #334155",
    borderRadius: "9px",
    color: "#CBD5E1",
    padding: "0 11px",
    outline: "none",
    fontSize: "12px",
    cursor: "pointer",
  },

  clearButton: {
    minHeight: "44px",
    padding: "0 13px",
    background: "#1E293B",
    border: "1px solid #334155",
    borderRadius: "9px",
    color: "#CBD5E1",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
  },

  /* =======================================================
     RESULT
  ======================================================= */

  resultHeader: {
    marginBottom: "18px",
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: "19px",
    fontWeight: "700",
    margin: 0,
  },

  sectionSubtitle: {
    color: "#64748B",
    fontSize: "12px",
    margin: "5px 0 0",
  },

  /* =======================================================
     PAPERS
  ======================================================= */

  paperGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "18px",
  },

  paperCard: {
    background: "#0F172A",
    border: "1px solid #1E293B",
    borderRadius: "16px",
    padding: "20px",
    minWidth: 0,
    boxSizing: "border-box",
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  pdfIcon: {
    width: "45px",
    height: "45px",
    borderRadius: "11px",
    background: "#7F1D1D",
    color: "#FCA5A5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "19px",
  },

  yearBadge: {
    background: "#1E293B",
    color: "#CBD5E1",
    borderRadius: "6px",
    padding: "5px 8px",
    fontSize: "11px",
    fontWeight: "700",
  },

  paperTitle: {
    color: "#FFFFFF",
    fontSize: "16px",
    fontWeight: "700",
    margin: "18px 0 5px",
    lineHeight: 1.4,
  },

  fileName: {
    color: "#64748B",
    fontSize: "11px",
    margin: 0,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    marginTop: "20px",
    padding: "12px 0",
    borderTop: "1px solid #1E293B",
    borderBottom: "1px solid #1E293B",
  },

  infoLabel: {
    display: "block",
    color: "#64748B",
    fontSize: "10px",
    marginBottom: "4px",
  },

  infoValue: {
    color: "#CBD5E1",
    fontSize: "12px",
  },

  /* =======================================================
     ACTIONS
  ======================================================= */

  actions: {
    display: "flex",
    gap: "8px",
    marginTop: "15px",
  },

  viewButton: {
    flex: 1,
    minHeight: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    background: "#8B5CF6",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "9px",
    padding: "10px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
  },

  downloadButton: {
    width: "42px",
    minHeight: "40px",
    background: "#1E293B",
    color: "#CBD5E1",
    border: "1px solid #334155",
    borderRadius: "9px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  /* =======================================================
     EMPTY
  ======================================================= */

  emptyState: {
    background: "#0F172A",
    border: "1px solid #1E293B",
    borderRadius: "16px",
    padding: "70px 20px",
    textAlign: "center",
    color: "#FFFFFF",
  },

  emptyIcon: {
    color: "#475569",
    fontSize: "45px",
    marginBottom: "15px",
  },

  emptyButton: {
    marginTop: "10px",
    background: "#8B5CF6",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "9px",
    padding: "10px 16px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
  },

  /* =======================================================
     TIP
  ======================================================= */

  tipCard: {
    display: "flex",
    gap: "15px",
    background: "#111827",
    border: "1px solid #1E293B",
    borderRadius: "15px",
    padding: "20px",
    marginTop: "25px",
  },

  tipIcon: {
    width: "42px",
    height: "42px",
    minWidth: "42px",
    borderRadius: "11px",
    background: "#312E81",
    color: "#A78BFA",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  tipTitle: {
    color: "#FFFFFF",
    fontSize: "14px",
    fontWeight: "700",
    margin: 0,
  },

  tipText: {
    color: "#64748B",
    fontSize: "12px",
    lineHeight: "20px",
    margin: "5px 0 0",
  },

  /* =======================================================
     LOADING
  ======================================================= */

  loadingPage: {
    minHeight: "400px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },

  loadingIcon: {
    color: "#8B5CF6",
    fontSize: "30px",
    marginBottom: "15px",
  },

  loadingTitle: {
    color: "#FFFFFF",
    fontSize: "18px",
    margin: "0 0 6px",
  },

  loadingText: {
    color: "#64748B",
    fontSize: "12px",
    margin: 0,
  },
};

export default PreviousYearPapers;
