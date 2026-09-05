import { useEffect, useState } from "react";
import {
  FaUser,
  FaGraduationCap,
  FaBook,
  FaClock,
  FaSave,
  FaEdit,
  FaUndo,
  FaSpinner,
  FaCheckCircle,
} from "react-icons/fa";
import toast from "react-hot-toast";

import API_URL from "../../config/api";
import { useAuth } from "../../context/useAuth";

/* =========================================================
   TOKEN
========================================================= */

const getToken = (token) => {
  return (
    token || localStorage.getItem("sbec_token") || localStorage.getItem("token")
  );
};

/* =========================================================
   DEFAULT PROFILE
========================================================= */

const defaultProfile = {
  name: "",
  email: "",
  phone: "",
  college: "",
  course: "BSc Computer Science",
  year: "",
  semester: "",
  rollNumber: "",
  studyHours: "2",
  difficulty: "Medium",
  priority: "Exam Preparation",
  subjects: [],
};

/* =========================================================
   AVAILABLE SUBJECTS
========================================================= */

const availableSubjects = [
  "Artificial Intelligence",
  "Computer Networks",
  "Software Engineering",
  "Internet of Things",
];

/* =========================================================
   NORMALIZE PROFILE
========================================================= */

const normalizeProfile = (profile = {}) => {
  return {
    name: profile.name || "",
    email: profile.email || "",
    phone: profile.phone || "",
    college: profile.college || "",
    course: profile.course || "BSc Computer Science",
    year: profile.year || "",
    semester: profile.semester || "",
    rollNumber: profile.rollNumber || "",
    studyHours: profile.studyHours || "2",
    difficulty: profile.difficulty || "Medium",
    priority: profile.priority || "Exam Preparation",
    subjects: Array.isArray(profile.subjects) ? profile.subjects : [],
  };
};

/* =========================================================
   PROFILE COMPONENT
========================================================= */

function Profile() {
  const { token, logout } = useAuth();

  const [profile, setProfile] = useState(defaultProfile);
  const [originalProfile, setOriginalProfile] = useState(defaultProfile);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  /* =======================================================
     LOAD PROFILE
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      const authToken = getToken(token);

      if (!authToken) {
        if (!cancelled) {
          setLoading(false);
          toast.error("Please login to view your profile.");
        }
        return;
      }

      try {
        if (!cancelled) {
          setLoading(true);
        }

        const response = await fetch(`${API_URL}/api/profile`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });

        let data = {};

        try {
          data = await response.json();
        } catch {
          data = {};
        }

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("sbec_token");
          localStorage.removeItem("sbec_user");
          localStorage.removeItem("token");

          if (logout) {
            logout();
          }

          if (!cancelled) {
            toast.error("Session expired. Please login again.");
            setLoading(false);
          }

          return;
        }

        if (!response.ok) {
          throw new Error(data.message || "Failed to load profile.");
        }

        const loadedProfile = normalizeProfile(data.profile);

        if (!cancelled) {
          setProfile(loadedProfile);
          setOriginalProfile(loadedProfile);
        }
      } catch (error) {
        console.error("LOAD PROFILE ERROR:", error);

        if (!cancelled) {
          toast.error(error.message || "Unable to load profile.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [token, logout]);

  /* =======================================================
     HANDLE INPUT
  ======================================================= */

  const handleChange = (field, value) => {
    setProfile((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  /* =======================================================
     SUBJECT SELECTION
  ======================================================= */

  const toggleSubject = (subject) => {
    if (!isEditing || saving) {
      return;
    }

    setProfile((previous) => {
      const subjects = Array.isArray(previous.subjects)
        ? previous.subjects
        : [];

      const exists = subjects.includes(subject);

      return {
        ...previous,
        subjects: exists
          ? subjects.filter((item) => item !== subject)
          : [...subjects, subject],
      };
    });
  };

  /* =======================================================
     SAVE PROFILE
  ======================================================= */

  const handleSave = async () => {
    const authToken = getToken(token);

    if (!authToken) {
      toast.error("Session expired. Please login again.");
      return;
    }

    /* -----------------------------------------------------
       VALIDATION
    ----------------------------------------------------- */

    if (!profile.name.trim()) {
      toast.error("Name is required.");
      return;
    }

    if (!profile.email.trim()) {
      toast.error("Email is required.");
      return;
    }

    if (profile.subjects.length === 0) {
      toast.error("Select at least one priority subject.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: profile.name.trim(),
        phone: profile.phone.trim(),
        college: profile.college.trim(),
        course: profile.course.trim(),
        year: profile.year.trim(),
        semester: profile.semester.trim(),
        rollNumber: profile.rollNumber.trim(),
        studyHours: profile.studyHours,
        difficulty: profile.difficulty,
        priority: profile.priority,
        subjects: profile.subjects,
      };

      const response = await fetch(`${API_URL}/api/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      /* -----------------------------------------------------
         SESSION EXPIRED
      ----------------------------------------------------- */

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("sbec_token");
        localStorage.removeItem("sbec_user");
        localStorage.removeItem("token");

        if (logout) {
          logout();
        }

        toast.error("Session expired. Please login again.");
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile.");
      }

      const updatedProfile = normalizeProfile(data.profile || payload);

      setProfile(updatedProfile);
      setOriginalProfile(updatedProfile);
      setIsEditing(false);

      /* -----------------------------------------------------
         KEEP LOCAL SESSION DATA UPDATED
      ----------------------------------------------------- */

      try {
        const existingUser = JSON.parse(
          localStorage.getItem("sbec_user") || "{}",
        );

        localStorage.setItem(
          "sbec_user",
          JSON.stringify({
            ...existingUser,
            ...updatedProfile,
          }),
        );
      } catch (error) {
        console.warn("LOCAL USER UPDATE WARNING:", error);
      }

      toast.success(data.message || "Profile updated successfully.");
    } catch (error) {
      console.error("SAVE PROFILE ERROR:", error);

      toast.error(error.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     CANCEL
  ======================================================= */

  const handleCancel = () => {
    setProfile({
      ...originalProfile,
      subjects: [...originalProfile.subjects],
    });

    setIsEditing(false);

    toast("Changes discarded.");
  };

  /* =======================================================
     PROFILE COMPLETION
  ======================================================= */

  const getCompletion = () => {
    const fields = [
      profile.name,
      profile.email,
      profile.phone,
      profile.college,
      profile.course,
      profile.year,
      profile.semester,
      profile.rollNumber,
      profile.studyHours,
      profile.priority,
    ];

    const completed = fields.filter(
      (field) =>
        field !== undefined && field !== null && String(field).trim() !== "",
    ).length;

    return Math.round((completed / fields.length) * 100);
  };

  const completion = getCompletion();

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <>
        <div style={styles.loadingContainer}>
          <FaSpinner className="profile-spinner" style={styles.loadingIcon} />

          <h2 style={styles.loadingTitle}>Loading Profile</h2>

          <p style={styles.loadingText}>Fetching your profile information...</p>
        </div>

        <style>
          {`
            .profile-spinner {
              animation: profileSpin 0.8s linear infinite;
            }

            @keyframes profileSpin {
              from {
                transform: rotate(0deg);
              }

              to {
                transform: rotate(360deg);
              }
            }
          `}
        </style>
      </>
    );
  }

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <div className="profile-page" style={styles.page}>
      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="profile-header" style={styles.header}>
        <div>
          <h1 className="profile-title" style={styles.title}>
            My Profile
          </h1>

          <p className="profile-subtitle" style={styles.subtitle}>
            Manage your academic information and study preferences.
          </p>
        </div>

        {!isEditing ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            style={styles.editButton}
          >
            <FaEdit />
            Edit Profile
          </button>
        ) : (
          <div className="profile-header-actions" style={styles.headerActions}>
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              style={styles.cancelButton}
            >
              <FaUndo />
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              style={{
                ...styles.saveButton,
                opacity: saving ? 0.6 : 1,
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? <FaSpinner className="profile-spinner" /> : <FaSave />}

              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>

      {/* ===================================================
          PROFILE OVERVIEW
      =================================================== */}

      <div className="profile-overview" style={styles.profileOverview}>
        <div className="profile-avatar" style={styles.avatar}>
          <FaUser />
        </div>

        <div className="profile-info" style={styles.profileInfo}>
          <h2 style={styles.profileName}>{profile.name || "Student"}</h2>

          <p style={styles.profileEmail}>
            {profile.email || "Email not available"}
          </p>

          <span className="profile-academic" style={styles.profileAcademic}>
            {profile.course || "BSc Computer Science"}

            {" • "}

            {profile.year || "Year not set"}

            {" • "}

            {profile.semester || "Semester not set"}
          </span>
        </div>

        <div className="completion-box" style={styles.completionBox}>
          <div style={styles.completionHeader}>
            <span>Profile Completion</span>

            <strong>{completion}%</strong>
          </div>

          <div style={styles.completionBackground}>
            <div
              style={{
                ...styles.completionFill,
                width: `${completion}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* ===================================================
          PERSONAL INFORMATION
      =================================================== */}

      <div className="profile-card" style={styles.card}>
        <SectionHeader
          icon={<FaUser />}
          title="Personal Information"
          description="Your basic account information."
        />

        <div className="profile-form-grid" style={styles.formGrid}>
          <FormField
            label="Full Name"
            value={profile.name}
            editing={isEditing}
            onChange={(value) => handleChange("name", value)}
          />

          <FormField
            label="Email"
            type="email"
            value={profile.email}
            editing={false}
            onChange={() => {}}
          />

          <FormField
            label="Phone Number"
            value={profile.phone}
            editing={isEditing}
            onChange={(value) => handleChange("phone", value)}
            placeholder="Enter phone number"
          />

          <FormField
            label="Roll Number"
            value={profile.rollNumber}
            editing={isEditing}
            onChange={(value) => handleChange("rollNumber", value)}
            placeholder="Enter roll number"
          />
        </div>
      </div>

      {/* ===================================================
          ACADEMIC INFORMATION
      =================================================== */}

      <div className="profile-card" style={styles.card}>
        <SectionHeader
          icon={<FaGraduationCap />}
          title="Academic Information"
          description="Information used to personalize your study experience."
        />

        <div className="profile-form-grid" style={styles.formGrid}>
          <FormField
            label="College"
            value={profile.college}
            editing={isEditing}
            onChange={(value) => handleChange("college", value)}
            placeholder="Enter college name"
          />

          <FormField
            label="Course"
            value={profile.course}
            editing={isEditing}
            onChange={(value) => handleChange("course", value)}
          />

          <FormField
            label="Year"
            value={profile.year}
            editing={isEditing}
            onChange={(value) => handleChange("year", value)}
            placeholder="e.g. FY / SY / TY"
          />

          <div>
            <label style={styles.label}>Semester</label>

            {isEditing ? (
              <select
                value={profile.semester}
                onChange={(e) => handleChange("semester", e.target.value)}
                style={styles.input}
              >
                <option value="">Select Semester</option>

                <option value="Semester 1">Semester 1</option>

                <option value="Semester 2">Semester 2</option>

                <option value="Semester 3">Semester 3</option>

                <option value="Semester 4">Semester 4</option>

                <option value="Semester 5">Semester 5</option>

                <option value="Semester 6">Semester 6</option>
              </select>
            ) : (
              <div style={styles.displayValue}>
                {profile.semester || "Not provided"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===================================================
          STUDY PREFERENCES
      =================================================== */}

      <div className="profile-card" style={styles.card}>
        <SectionHeader
          icon={<FaBook />}
          title="Study Preferences"
          description="Customize SBEC according to your priorities."
        />

        <div className="profile-preference-grid" style={styles.preferenceGrid}>
          {/* STUDY HOURS */}

          <div>
            <label style={styles.label}>Daily Study Target</label>

            {isEditing ? (
              <select
                value={profile.studyHours}
                onChange={(e) => handleChange("studyHours", e.target.value)}
                style={styles.input}
              >
                <option value="1">1 hour</option>

                <option value="2">2 hours</option>

                <option value="3">3 hours</option>

                <option value="4">4 hours</option>

                <option value="5">5+ hours</option>
              </select>
            ) : (
              <div style={styles.displayValue}>
                <FaClock />
                {profile.studyHours || "2"} hour/day
              </div>
            )}
          </div>

          {/* DIFFICULTY */}

          <div>
            <label style={styles.label}>Preferred Difficulty</label>

            {isEditing ? (
              <select
                value={profile.difficulty}
                onChange={(e) => handleChange("difficulty", e.target.value)}
                style={styles.input}
              >
                <option value="Easy">Easy</option>

                <option value="Medium">Medium</option>

                <option value="Hard">Hard</option>
              </select>
            ) : (
              <div style={styles.displayValue}>
                {profile.difficulty || "Medium"}
              </div>
            )}
          </div>

          {/* PRIORITY */}

          <div>
            <label style={styles.label}>Main Priority</label>

            {isEditing ? (
              <select
                value={profile.priority}
                onChange={(e) => handleChange("priority", e.target.value)}
                style={styles.input}
              >
                <option value="Exam Preparation">Exam Preparation</option>

                <option value="Daily Learning">Daily Learning</option>

                <option value="Improve Weak Subjects">
                  Improve Weak Subjects
                </option>

                <option value="Complete Syllabus">Complete Syllabus</option>
              </select>
            ) : (
              <div style={styles.displayValue}>
                {profile.priority || "Exam Preparation"}
              </div>
            )}
          </div>
        </div>

        {/* =================================================
            PRIORITY SUBJECTS
        ================================================= */}

        <div style={styles.subjectSection}>
          <label style={styles.label}>Priority Subjects</label>

          <div style={styles.subjects}>
            {availableSubjects.map((subject) => {
              const selected = profile.subjects.includes(subject);

              return (
                <button
                  key={subject}
                  type="button"
                  disabled={!isEditing || saving}
                  onClick={() => toggleSubject(subject)}
                  style={{
                    ...styles.subjectChip,

                    background: selected ? "#312E81" : "#1E293B",

                    border: selected
                      ? "1px solid #8B5CF6"
                      : "1px solid #334155",

                    color: selected ? "#A78BFA" : "#94A3B8",

                    cursor: isEditing && !saving ? "pointer" : "default",

                    opacity: isEditing ? 1 : 0.8,
                  }}
                >
                  {selected && <FaCheckCircle />}

                  {subject}
                </button>
              );
            })}
          </div>

          {isEditing && profile.subjects.length === 0 && (
            <p style={styles.warningText}>
              Select at least one priority subject.
            </p>
          )}
        </div>
      </div>

      {/* ===================================================
          BOTTOM SAVE AREA
      =================================================== */}

      {isEditing && (
        <div className="profile-bottom-actions" style={styles.bottomActions}>
          <button
            type="button"
            onClick={handleCancel}
            disabled={saving}
            style={styles.cancelButton}
          >
            <FaUndo />
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              ...styles.saveButton,
              opacity: saving ? 0.6 : 1,
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? <FaSpinner className="profile-spinner" /> : <FaSave />}

            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      )}

      {/* ===================================================
          RESPONSIVE CSS
      =================================================== */}

      <style>
        {`
          * {
            box-sizing: border-box;
          }

          .profile-spinner {
            animation: profileSpin 0.8s linear infinite;
          }

          @keyframes profileSpin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          .profile-page input:focus,
          .profile-page select:focus {
            border-color: #8B5CF6 !important;
            box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.12);
          }

          .profile-page button {
            transition:
              opacity 0.15s ease,
              transform 0.15s ease;
          }

          .profile-page button:not(:disabled):hover {
            transform: translateY(-1px);
          }

          @media (max-width: 900px) {
            .profile-overview {
              flex-wrap: wrap !important;
            }

            .completion-box {
              width: 100% !important;
              margin-top: 8px;
            }

            .profile-preference-grid {
              grid-template-columns: repeat(2, 1fr) !important;
            }
          }

          @media (max-width: 700px) {
            .profile-header {
              flex-direction: column !important;
              align-items: stretch !important;
              gap: 15px !important;
            }

            .profile-header > button {
              width: 100% !important;
            }

            .profile-header-actions {
              display: grid !important;
              grid-template-columns: 1fr 1fr !important;
              width: 100% !important;
            }

            .profile-header-actions button {
              width: 100% !important;
            }

            .profile-form-grid {
              grid-template-columns: 1fr !important;
            }

            .profile-preference-grid {
              grid-template-columns: 1fr !important;
            }

            .profile-overview {
              align-items: flex-start !important;
              padding: 18px !important;
              gap: 12px !important;
            }

            .profile-info {
              min-width: 0;
            }

            .profile-info h2 {
              font-size: 18px !important;
            }

            .profile-info p {
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }

            .profile-academic {
              font-size: 11px !important;
            }

            .profile-card {
              padding: 18px !important;
            }

            .profile-bottom-actions {
              display: grid !important;
              grid-template-columns: 1fr 1fr !important;
            }

            .profile-bottom-actions button {
              width: 100% !important;
            }
          }

          @media (max-width: 480px) {
            .profile-page {
              width: 100% !important;
            }

            .profile-title {
              font-size: 25px !important;
            }

            .profile-subtitle {
              font-size: 12px !important;
            }

            .profile-overview {
              display: grid !important;
              grid-template-columns: auto 1fr !important;
            }

            .completion-box {
              grid-column: 1 / -1 !important;
              width: 100% !important;
            }

            .profile-avatar {
              width: 52px !important;
              height: 52px !important;
              min-width: 52px !important;
              border-radius: 14px !important;
              font-size: 20px !important;
            }

            .profile-card {
              padding: 16px !important;
              border-radius: 13px !important;
            }

            .profile-section-title {
              font-size: 15px !important;
            }

            .profile-section-description {
              font-size: 11px !important;
            }

            .profile-bottom-actions {
              grid-template-columns: 1fr !important;
              gap: 8px !important;
            }
          }
        `}
      </style>
    </div>
  );
}

/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({ icon, title, description }) {
  return (
    <div style={styles.sectionHeader}>
      <div className="profile-section-icon" style={styles.sectionIcon}>
        {icon}
      </div>

      <div>
        <h2 className="profile-section-title" style={styles.sectionTitle}>
          {title}
        </h2>

        <p
          className="profile-section-description"
          style={styles.sectionDescription}
        >
          {description}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   FORM FIELD
========================================================= */

function FormField({
  label,
  type = "text",
  value,
  editing,
  onChange,
  placeholder,
}) {
  return (
    <div>
      <label style={styles.label}>{label}</label>

      {editing ? (
        <input
          type={type}
          value={value || ""}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          style={styles.input}
        />
      ) : (
        <div style={styles.displayValue}>{value || "Not provided"}</div>
      )}
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
    alignItems: "center",
    gap: "20px",
    marginBottom: "28px",
  },

  title: {
    color: "#FFFFFF",
    fontSize: "30px",
    margin: 0,
  },

  subtitle: {
    color: "#64748B",
    fontSize: "13px",
    marginTop: "7px",
    marginBottom: 0,
  },

  editButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    background: "#8B5CF6",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "9px",
    padding: "11px 15px",
    cursor: "pointer",
    fontWeight: "600",
  },

  headerActions: {
    display: "flex",
    gap: "8px",
  },

  saveButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    background: "#8B5CF6",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "9px",
    padding: "11px 15px",
    cursor: "pointer",
    fontWeight: "600",
  },

  cancelButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    background: "#1E293B",
    color: "#CBD5E1",
    border: "1px solid #334155",
    borderRadius: "9px",
    padding: "11px 15px",
    cursor: "pointer",
  },

  profileOverview: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
    background: "#0F172A",
    border: "1px solid #1E293B",
    borderRadius: "16px",
    padding: "22px",
    marginBottom: "20px",
  },

  avatar: {
    width: "65px",
    height: "65px",
    minWidth: "65px",
    borderRadius: "18px",
    background: "#312E81",
    color: "#A78BFA",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
  },

  profileInfo: {
    flex: 1,
    minWidth: 0,
  },

  profileName: {
    color: "#FFFFFF",
    fontSize: "20px",
    margin: 0,
  },

  profileEmail: {
    color: "#94A3B8",
    fontSize: "12px",
    margin: "5px 0",
  },

  profileAcademic: {
    color: "#64748B",
    fontSize: "11px",
  },

  completionBox: {
    width: "220px",
  },

  completionHeader: {
    display: "flex",
    justifyContent: "space-between",
    color: "#94A3B8",
    fontSize: "11px",
    marginBottom: "7px",
  },

  completionBackground: {
    height: "7px",
    background: "#1E293B",
    borderRadius: "10px",
    overflow: "hidden",
  },

  completionFill: {
    height: "100%",
    background: "#8B5CF6",
    borderRadius: "10px",
    transition: "width 0.25s ease",
  },

  card: {
    background: "#0F172A",
    border: "1px solid #1E293B",
    borderRadius: "16px",
    padding: "23px",
    marginBottom: "20px",
  },

  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "22px",
  },

  sectionIcon: {
    width: "40px",
    height: "40px",
    minWidth: "40px",
    borderRadius: "10px",
    background: "#312E81",
    color: "#A78BFA",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: "16px",
    margin: 0,
  },

  sectionDescription: {
    color: "#64748B",
    fontSize: "11px",
    margin: "4px 0 0",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "18px",
  },

  preferenceGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "18px",
  },

  label: {
    display: "block",
    color: "#CBD5E1",
    fontSize: "12px",
    fontWeight: "600",
    marginBottom: "8px",
  },

  input: {
    width: "100%",
    minHeight: "41px",
    boxSizing: "border-box",
    background: "#020617",
    border: "1px solid #334155",
    borderRadius: "9px",
    color: "#FFFFFF",
    padding: "11px",
    outline: "none",
    fontSize: "12px",
  },

  displayValue: {
    minHeight: "41px",
    boxSizing: "border-box",
    background: "#020617",
    border: "1px solid #1E293B",
    borderRadius: "9px",
    color: "#CBD5E1",
    padding: "11px",
    fontSize: "12px",
    display: "flex",
    alignItems: "center",
    gap: "7px",
  },

  subjectSection: {
    marginTop: "22px",
  },

  subjects: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },

  subjectChip: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    borderRadius: "8px",
    padding: "8px 11px",
    fontSize: "11px",
  },

  warningText: {
    color: "#F59E0B",
    fontSize: "11px",
    marginTop: "10px",
  },

  bottomActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "8px",
    marginBottom: "25px",
  },

  loadingContainer: {
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

export default Profile;
