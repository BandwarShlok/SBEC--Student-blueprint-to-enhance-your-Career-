import { useState } from "react";
import {
  FaCalculator,
  FaPlus,
  FaTrash,
  FaRedo,
  FaGraduationCap,
} from "react-icons/fa";
import toast from "react-hot-toast";

const gradePoints = {
  O: 10,
  "A+": 9,
  A: 8,
  "B+": 7,
  B: 6,
  C: 5,
  D: 4,
  F: 0,
};

function CGPACalculator() {
  const [subjects, setSubjects] = useState([
    {
      id: 1,
      name: "",
      credits: "",
      grade: "",
    },
  ]);

  const [previousSemesters, setPreviousSemesters] =
    useState([
      {
        id: 1,
        sgpa: "",
        credits: "",
      },
    ]);

  const [result, setResult] = useState(null);

  const addSubject = () => {
    setSubjects((previous) => [
      ...previous,
      {
        id: Date.now(),
        name: "",
        credits: "",
        grade: "",
      },
    ]);
  };

  const removeSubject = (id) => {
    if (subjects.length === 1) {
      toast.error(
        "At least one subject is required."
      );
      return;
    }

    setSubjects((previous) =>
      previous.filter(
        (subject) => subject.id !== id
      )
    );
  };

  const updateSubject = (
    id,
    field,
    value
  ) => {
    setSubjects((previous) =>
      previous.map((subject) =>
        subject.id === id
          ? {
              ...subject,
              [field]: value,
            }
          : subject
      )
    );
  };

  const addSemester = () => {
    setPreviousSemesters(
      (previous) => [
        ...previous,
        {
          id: Date.now(),
          sgpa: "",
          credits: "",
        },
      ]
    );
  };

  const removeSemester = (id) => {
    setPreviousSemesters(
      (previous) =>
        previous.filter(
          (semester) =>
            semester.id !== id
        )
    );
  };

  const updateSemester = (
    id,
    field,
    value
  ) => {
    setPreviousSemesters(
      (previous) =>
        previous.map((semester) =>
          semester.id === id
            ? {
                ...semester,
                [field]: value,
              }
            : semester
        )
    );
  };

  const calculateSGPA = () => {
    for (const subject of subjects) {
      if (!subject.name.trim()) {
        toast.error(
          "Enter a name for every subject."
        );
        return;
      }

      if (!subject.credits) {
        toast.error(
          "Enter credits for every subject."
        );
        return;
      }

      if (!subject.grade) {
        toast.error(
          "Select a grade for every subject."
        );
        return;
      }

      if (
        Number(subject.credits) <= 0
      ) {
        toast.error(
          "Credits must be greater than 0."
        );
        return;
      }
    }

    let totalCredits = 0;
    let totalGradePoints = 0;

    subjects.forEach((subject) => {
      const credits =
        Number(subject.credits);

      const points =
        gradePoints[subject.grade];

      totalCredits += credits;

      totalGradePoints +=
        credits * points;
    });

    const sgpa =
      totalGradePoints /
      totalCredits;

    calculateOverallCGPA(
      sgpa,
      totalCredits
    );
  };

  const calculateOverallCGPA = (
    currentSGPA,
    currentCredits
  ) => {
    let totalWeightedPoints =
      currentSGPA * currentCredits;

    let totalCredits =
      currentCredits;

    for (const semester of previousSemesters) {
      if (
        semester.sgpa === "" &&
        semester.credits === ""
      ) {
        continue;
      }

      const sgpa =
        Number(semester.sgpa);

      const credits =
        Number(semester.credits);

      if (
        sgpa < 0 ||
        sgpa > 10 ||
        credits <= 0
      ) {
        toast.error(
          "Enter valid semester SGPA and credits."
        );
        return;
      }

      totalWeightedPoints +=
        sgpa * credits;

      totalCredits += credits;
    }

    const cgpa =
      totalWeightedPoints /
      totalCredits;

    setResult({
      sgpa: currentSGPA.toFixed(2),
      cgpa: cgpa.toFixed(2),
      currentCredits,
      totalCredits,
    });

    toast.success(
      "CGPA calculated successfully."
    );
  };

  const resetCalculator = () => {
    setSubjects([
      {
        id: Date.now(),
        name: "",
        credits: "",
        grade: "",
      },
    ]);

    setPreviousSemesters([
      {
        id: Date.now(),
        sgpa: "",
        credits: "",
      },
    ]);

    setResult(null);

    toast.success(
      "Calculator reset."
    );
  };

  return (
    <div>
      {/* Header */}

      <div style={styles.header}>
        <div>
          <div style={styles.headingRow}>
            <div style={styles.icon}>
              <FaCalculator />
            </div>

            <div>
              <h1 style={styles.title}>
                CGPA Calculator
              </h1>

              <p style={styles.subtitle}>
                Calculate your current SGPA
                and overall CGPA.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={resetCalculator}
          style={styles.resetButton}
        >
          <FaRedo />
          Reset
        </button>
      </div>

      {/* Result */}

      {result && (
        <div style={styles.resultCard}>
          <div style={styles.resultItem}>
            <span>Current SGPA</span>

            <strong>
              {result.sgpa}
            </strong>
          </div>

          <div style={styles.resultDivider} />

          <div style={styles.resultItem}>
            <span>Overall CGPA</span>

            <strong>
              {result.cgpa}
            </strong>
          </div>

          <div style={styles.resultDivider} />

          <div style={styles.resultItem}>
            <span>Total Credits</span>

            <strong>
              {result.totalCredits}
            </strong>
          </div>
        </div>
      )}

      {/* Current Semester */}

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div>
            <h2 style={styles.sectionTitle}>
              Current Semester
            </h2>

            <p style={styles.sectionSubtitle}>
              Enter your subjects, credits and
              grades.
            </p>
          </div>

          <span style={styles.badge}>
            SGPA
          </span>
        </div>

        {/* Table Header */}

        <div style={styles.tableHeader}>
          <span>Subject</span>
          <span>Credits</span>
          <span>Grade</span>
          <span>Points</span>
          <span />
        </div>

        {/* Subjects */}

        <div>
          {subjects.map(
            (subject, index) => (
              <div
                key={subject.id}
                style={styles.subjectRow}
              >
                <input
                  type="text"
                  value={subject.name}
                  onChange={(e) =>
                    updateSubject(
                      subject.id,
                      "name",
                      e.target.value
                    )
                  }
                  placeholder={`Subject ${
                    index + 1
                  }`}
                  style={styles.input}
                />

                <input
                  type="number"
                  min="1"
                  value={subject.credits}
                  onChange={(e) =>
                    updateSubject(
                      subject.id,
                      "credits",
                      e.target.value
                    )
                  }
                  placeholder="Credits"
                  style={styles.input}
                />

                <select
                  value={subject.grade}
                  onChange={(e) =>
                    updateSubject(
                      subject.id,
                      "grade",
                      e.target.value
                    )
                  }
                  style={styles.input}
                >
                  <option value="">
                    Grade
                  </option>

                  {Object.entries(
                    gradePoints
                  ).map(
                    ([
                      grade,
                      points,
                    ]) => (
                      <option
                        key={grade}
                        value={grade}
                      >
                        {grade}
                      </option>
                    )
                  )}
                </select>

                <div
                  style={styles.points}
                >
                  {subject.grade
                    ? gradePoints[
                        subject.grade
                      ]
                    : "-"}
                </div>

                <button
                  onClick={() =>
                    removeSubject(
                      subject.id
                    )
                  }
                  style={
                    styles.deleteButton
                  }
                >
                  <FaTrash />
                </button>
              </div>
            )
          )}
        </div>

        <button
          onClick={addSubject}
          style={styles.addButton}
        >
          <FaPlus />
          Add Subject
        </button>
      </div>

      {/* Previous Semesters */}

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div>
            <h2 style={styles.sectionTitle}>
              Previous Semesters
            </h2>

            <p style={styles.sectionSubtitle}>
              Add previous semester SGPA and
              total credits to calculate
              overall CGPA.
            </p>
          </div>

          <span style={styles.badge}>
            CGPA
          </span>
        </div>

        {previousSemesters.map(
          (semester, index) => (
            <div
              key={semester.id}
              style={styles.semesterRow}
            >
              <div
                style={
                  styles.semesterNumber
                }
              >
                Semester {index + 1}
              </div>

              <input
                type="number"
                min="0"
                max="10"
                step="0.01"
                value={semester.sgpa}
                onChange={(e) =>
                  updateSemester(
                    semester.id,
                    "sgpa",
                    e.target.value
                  )
                }
                placeholder="SGPA"
                style={styles.input}
              />

              <input
                type="number"
                min="1"
                value={semester.credits}
                onChange={(e) =>
                  updateSemester(
                    semester.id,
                    "credits",
                    e.target.value
                  )
                }
                placeholder="Total Credits"
                style={styles.input}
              />

              <button
                onClick={() =>
                  removeSemester(
                    semester.id
                  )
                }
                style={
                  styles.deleteButton
                }
              >
                <FaTrash />
              </button>
            </div>
          )
        )}

        <button
          onClick={addSemester}
          style={styles.addButton}
        >
          <FaPlus />
          Add Previous Semester
        </button>
      </div>

      {/* Calculate */}

      <div style={styles.calculateSection}>
        <button
          onClick={calculateSGPA}
          style={styles.calculateButton}
        >
          <FaCalculator />
          Calculate SGPA & CGPA
        </button>
      </div>

      {/* Grade Reference */}

      <div style={styles.gradeCard}>
        <div style={styles.gradeHeader}>
          <FaGraduationCap />

          <div>
            <h3>
              Grade Point Reference
            </h3>

            <p>
              Use the grade points applicable
              to your college/university.
            </p>
          </div>
        </div>

        <div style={styles.gradeGrid}>
          {Object.entries(
            gradePoints
          ).map(
            ([grade, points]) => (
              <div
                key={grade}
                style={styles.gradeItem}
              >
                <strong>
                  {grade}
                </strong>

                <span>
                  {points}
                </span>
              </div>
            )
          )}
        </div>
      </div>

      {/* Formula */}

      <div style={styles.formulaCard}>
        <h3>Calculation Formula</h3>

        <p>
          SGPA = Σ (Credit × Grade Point) /
          Σ Credits
        </p>

        <p>
          CGPA = Σ (SGPA × Semester Credits) /
          Σ Semester Credits
        </p>
      </div>
    </div>
  );
}

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "28px",
  },

  headingRow: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },

  icon: {
    width: "52px",
    height: "52px",
    borderRadius: "14px",
    background: "#312E81",
    color: "#A78BFA",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "21px",
  },

  title: {
    color: "#FFFFFF",
    fontSize: "29px",
    margin: 0,
  },

  subtitle: {
    color: "#64748B",
    fontSize: "13px",
    margin: "5px 0 0",
  },

  resetButton: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    background: "#1E293B",
    border: "1px solid #334155",
    color: "#CBD5E1",
    borderRadius: "9px",
    padding: "10px 13px",
    cursor: "pointer",
    fontSize: "12px",
  },

  resultCard: {
    display: "grid",
    gridTemplateColumns:
      "1fr auto 1fr auto 1fr",
    alignItems: "center",
    background: "#111827",
    border: "1px solid #312E81",
    borderRadius: "16px",
    padding: "20px",
    marginBottom: "20px",
  },

  resultItem: {
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },

  resultDivider: {
    width: "1px",
    height: "45px",
    background: "#334155",
  },

  card: {
    background: "#0F172A",
    border: "1px solid #1E293B",
    borderRadius: "16px",
    padding: "23px",
    marginBottom: "20px",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: "18px",
    margin: 0,
  },

  sectionSubtitle: {
    color: "#64748B",
    fontSize: "12px",
    margin: "6px 0 0",
  },

  badge: {
    background: "#312E81",
    color: "#A78BFA",
    borderRadius: "7px",
    padding: "6px 9px",
    fontSize: "10px",
    fontWeight: "700",
  },

  tableHeader: {
    display: "grid",
    gridTemplateColumns:
      "2fr 1fr 1fr 0.7fr 40px",
    gap: "10px",
    color: "#64748B",
    fontSize: "10px",
    textTransform: "uppercase",
    padding: "0 10px 8px",
  },

  subjectRow: {
    display: "grid",
    gridTemplateColumns:
      "2fr 1fr 1fr 0.7fr 40px",
    gap: "10px",
    alignItems: "center",
    marginBottom: "10px",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    background: "#020617",
    border: "1px solid #334155",
    borderRadius: "8px",
    color: "#FFFFFF",
    padding: "10px",
    outline: "none",
    fontSize: "12px",
  },

  points: {
    color: "#A78BFA",
    textAlign: "center",
    fontWeight: "700",
    fontSize: "13px",
  },

  deleteButton: {
    width: "35px",
    height: "35px",
    background: "transparent",
    border: "none",
    color: "#64748B",
    cursor: "pointer",
  },

  addButton: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    background: "#1E293B",
    border: "1px solid #334155",
    color: "#CBD5E1",
    borderRadius: "8px",
    padding: "9px 12px",
    cursor: "pointer",
    fontSize: "12px",
    marginTop: "10px",
  },

  semesterRow: {
    display: "grid",
    gridTemplateColumns:
      "1.5fr 1fr 1fr 40px",
    gap: "10px",
    alignItems: "center",
    marginBottom: "10px",
  },

  semesterNumber: {
    color: "#CBD5E1",
    background: "#020617",
    border: "1px solid #334155",
    borderRadius: "8px",
    padding: "10px",
    fontSize: "12px",
  },

  calculateSection: {
    display: "flex",
    justifyContent: "center",
    margin: "25px 0",
  },

  calculateButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#8B5CF6",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "10px",
    padding: "13px 20px",
    cursor: "pointer",
    fontWeight: "700",
  },

  gradeCard: {
    background: "#0F172A",
    border: "1px solid #1E293B",
    borderRadius: "16px",
    padding: "20px",
    marginBottom: "20px",
  },

  gradeHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    color: "#A78BFA",
  },

  gradeGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(7, 1fr)",
    gap: "8px",
    marginTop: "15px",
  },

  gradeItem: {
    background: "#020617",
    border: "1px solid #1E293B",
    borderRadius: "8px",
    padding: "10px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  formulaCard: {
    background: "#111827",
    border: "1px solid #1E293B",
    borderRadius: "14px",
    padding: "18px",
    marginBottom: "20px",
  },
};

export default CGPACalculator;