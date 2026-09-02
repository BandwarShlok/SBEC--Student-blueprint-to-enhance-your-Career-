import { useEffect, useMemo, useState } from "react";
import {
  FaClipboardCheck,
  FaArrowRight,
  FaArrowLeft,
  FaCheckCircle,
  FaRedo,
  FaTrophy,
  FaSyncAlt,
  FaExclamationCircle,
} from "react-icons/fa";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

import API_URL from "../../config/api";

const API_ROOT = String(API_URL || "").replace(/\/+$/, "");
const QUIZ_API = API_ROOT.endsWith("/api")
  ? `${API_ROOT}/quiz`
  : `${API_ROOT}/api/quiz`;

const SUBJECT_ID_MAP = {
  1: "Artificial Intelligence",
  2: "Computer Networks",
  3: "Software Engineering",
  4: "Internet of Things",
};

const getToken = () =>
  localStorage.getItem("sbec_token") ||
  localStorage.getItem("token");

const getStudentHeaders = (includeJson = false) => {
  const token = getToken();

  return {
    ...(includeJson
      ? { "Content-Type": "application/json" }
      : {}),
    ...(token
      ? { Authorization: `Bearer ${token}` }
      : {}),
  };
};

const readApiResponse = async (response) => {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      message: text || "Invalid server response.",
    };
  }
};

const normalizeQuestion = (item) => ({
  id: item._id || item.id,
  question: item.question || "",
  subject: item.subject || "",
  unit: item.unit || "",
  options: Array.isArray(item.options)
    ? item.options
    : [
        item.optionA || "",
        item.optionB || "",
        item.optionC || "",
        item.optionD || "",
      ],
});

function Quiz() {
  const [searchParams] = useSearchParams();

  const subjectParam = searchParams.get("subject");

  const initialSubject =
    SUBJECT_ID_MAP[subjectParam] ||
    (subjectParam ? subjectParam : "");

  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] =
    useState(initialSubject);

  const [questions, setQuestions] = useState([]);
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const [result, setResult] = useState(null);

  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // ============================================================
  // FETCH SUBJECTS FROM BACKEND
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    const loadSubjects = async () => {
      try {
        setLoadingSubjects(true);
        setError("");

        const response = await fetch(`${QUIZ_API}/subjects`, {
          method: "GET",
          headers: getStudentHeaders(),
        });

        const data = await readApiResponse(response);

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("sbec_token");
          localStorage.removeItem("sbec_user");
          window.location.href = "/login";
          return;
        }

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to load quiz subjects."
          );
        }

        const list = Array.isArray(data.subjects)
          ? data.subjects
          : [];

        if (cancelled) {
          return;
        }

        setSubjects(list);

        if (list.length > 0) {
          setSelectedSubject((previous) => {
            if (previous && list.includes(previous)) {
              return previous;
            }

            return list[0];
          });
        }
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error("QUIZ SUBJECT ERROR:", err);
        setError(
          err.message || "Unable to load quiz subjects."
        );
      } finally {
        if (!cancelled) {
          setLoadingSubjects(false);
        }
      }
    };

    const timer = setTimeout(loadSubjects, 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  // ============================================================
  // FETCH QUESTIONS FROM BACKEND
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    const loadQuestions = async () => {
      if (!selectedSubject) {
        setQuestions([]);
        return;
      }

      try {
        setLoadingQuestions(true);
        setError("");

        const response = await fetch(
          `${QUIZ_API}?subject=${encodeURIComponent(
            selectedSubject
          )}&limit=5`,
          {
            method: "GET",
            headers: getStudentHeaders(),
          }
        );

        const data = await readApiResponse(response);

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("sbec_token");
          localStorage.removeItem("sbec_user");
          window.location.href = "/login";
          return;
        }

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to load quiz questions."
          );
        }

        const list = Array.isArray(data.questions)
          ? data.questions.map(normalizeQuestion)
          : [];

        if (cancelled) {
          return;
        }

        setQuestions(list);
        setStarted(false);
        setCurrentQuestion(0);
        setAnswers({});
        setSubmitted(false);
        setResult(null);

        if (list.length === 0) {
          setError(
            `No quiz questions are available for ${selectedSubject}.`
          );
        }
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error("QUIZ QUESTIONS ERROR:", err);
        setQuestions([]);
        setError(
          err.message || "Unable to load quiz questions."
        );
      } finally {
        if (!cancelled) {
          setLoadingQuestions(false);
        }
      }
    };

    const timer = setTimeout(loadQuestions, 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [selectedSubject]);

  // ============================================================
  // SAFE QUESTION DATA
  // ============================================================

  const safeQuestions = useMemo(
    () =>
      questions.filter(
        (item) =>
          item &&
          item.id &&
          item.question &&
          Array.isArray(item.options) &&
          item.options.length === 4
      ),
    [questions]
  );

  const selectedAnswer =
    answers[safeQuestions[currentQuestion]?.id];

  // ============================================================
  // START QUIZ
  // ============================================================

  const handleStart = () => {
    if (safeQuestions.length === 0) {
      toast.error("No questions available for this subject.");
      return;
    }

    setStarted(true);
    setCurrentQuestion(0);
    setAnswers({});
    setSubmitted(false);
    setResult(null);
  };

  // ============================================================
  // SELECT ANSWER
  // ============================================================

  const handleAnswer = (answerIndex) => {
    if (submitted || submitting) {
      return;
    }

    const questionId =
      safeQuestions[currentQuestion]?.id;

    if (!questionId) {
      return;
    }

    setAnswers((previous) => ({
      ...previous,
      [questionId]: answerIndex,
    }));
  };

  // ============================================================
  // NEXT
  // ============================================================

  const handleNext = () => {
    if (selectedAnswer === undefined) {
      toast.error("Please select an answer first.");
      return;
    }

    if (currentQuestion < safeQuestions.length - 1) {
      setCurrentQuestion((previous) => previous + 1);
    }
  };

  // ============================================================
  // PREVIOUS
  // ============================================================

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((previous) => previous - 1);
    }
  };

  // ============================================================
  // SUBMIT TO BACKEND
  // ============================================================

  const handleSubmit = async () => {
    const answeredCount = Object.keys(answers).length;

    if (answeredCount < safeQuestions.length) {
      toast.error(
        "Please answer all questions before submitting."
      );
      return;
    }

    const token = getToken();

    if (!token) {
      toast.error("Your session has expired. Please login again.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const payload = {
        subject: selectedSubject,
        answers: safeQuestions.map((question) => ({
          questionId: question.id,
          answer: String.fromCharCode(
            65 + answers[question.id]
          ),
        })),
      };

      const response = await fetch(`${QUIZ_API}/submit`, {
        method: "POST",
        headers: getStudentHeaders(true),
        body: JSON.stringify(payload),
      });

      const data = await readApiResponse(response);

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("sbec_token");
        localStorage.removeItem("sbec_user");

        toast.error(
          "Session expired. Please login again."
        );

        window.location.href = "/login";
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to submit quiz."
        );
      }

      setResult({
        score: Number(data.result?.score || 0),
        correct: Number(data.result?.correct || 0),
        wrong: Number(data.result?.wrong || 0),
        total: Number(
          data.result?.total || safeQuestions.length
        ),
        percentage: Number(
          data.result?.percentage || 0
        ),
      });

      setSubmitted(true);

      toast.success("Quiz submitted successfully!");
    } catch (err) {
      console.error("QUIZ SUBMIT ERROR:", err);

      setError(
        err.message || "Unable to submit quiz."
      );

      toast.error(
        err.message || "Unable to submit quiz."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================
  // RESTART
  // ============================================================

  const restartQuiz = () => {
    setStarted(false);
    setCurrentQuestion(0);
    setAnswers({});
    setSubmitted(false);
    setResult(null);
    setError("");
  };

  const score = result?.correct || 0;
  const total = result?.total || safeQuestions.length || 0;

  const percentage =
    result?.percentage ??
    (total > 0
      ? Math.round((score / total) * 100)
      : 0);

  // ============================================================
  // LOADING
  // ============================================================

  if (loadingSubjects || loadingQuestions) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingSpinner}>
          <FaSyncAlt />
        </div>

        <h2 style={styles.loadingTitle}>
          Loading Quiz...
        </h2>

        <p style={styles.loadingText}>
          Getting questions from the server.
        </p>

        <style>
          {`
            @keyframes quizSpin {
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

  // ============================================================
  // ERROR / EMPTY
  // ============================================================

  if (!selectedSubject || safeQuestions.length === 0) {
    return (
      <div style={styles.errorPage}>
        <FaExclamationCircle style={styles.errorIcon} />

        <h2 style={styles.errorTitle}>
          {error
            ? "Unable to Load Quiz"
            : "No Quiz Questions"}
        </h2>

        <p style={styles.errorText}>
          {error ||
            "There are no quiz questions available yet."}
        </p>

        {subjects.length > 0 && (
          <select
            value={selectedSubject}
            onChange={(event) =>
              setSelectedSubject(event.target.value)
            }
            style={{
              ...styles.subjectSelect,
              maxWidth: "350px",
              marginTop: "10px",
            }}
          >
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        )}

        <button
          onClick={() => window.location.reload()}
          style={styles.retryButton}
        >
          <FaSyncAlt />
          Try Again
        </button>
      </div>
    );
  }

  // ============================================================
  // START PAGE
  // ============================================================

  if (!started) {
    return (
      <div style={styles.startPage}>
        <div style={styles.startCard}>
          <div style={styles.startIcon}>
            <FaClipboardCheck />
          </div>

          <h1 style={styles.startTitle}>
            Quiz & Practice
          </h1>

          <p style={styles.startDescription}>
            Test your understanding of your subjects with
            short practice quizzes.
          </p>

          <div style={styles.subjectSelection}>
            <label style={styles.label}>
              Select Subject
            </label>

            <select
              value={selectedSubject}
              onChange={(event) =>
                setSelectedSubject(event.target.value)
              }
              style={styles.subjectSelect}
            >
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.quizInfo}>
            <div>
              <strong>{safeQuestions.length}</strong>
              <span>Questions</span>
            </div>

            <div>
              <strong>MCQ</strong>
              <span>Format</span>
            </div>

            <div>
              <strong>100%</strong>
              <span>Evaluation</span>
            </div>
          </div>

          <button
            onClick={handleStart}
            style={styles.startButton}
          >
            Start Quiz
            <FaArrowRight />
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // RESULT
  // ============================================================

  if (submitted) {
    return (
      <div style={styles.resultPage}>
        <div style={styles.resultCard}>
          <div style={styles.trophy}>
            <FaTrophy />
          </div>

          <h1 style={styles.resultTitle}>
            Quiz Completed!
          </h1>

          <p style={styles.resultSubject}>
            {selectedSubject}
          </p>

          <div
            style={{
              ...styles.scoreCircle,
              background: `conic-gradient(
                #8B5CF6 ${percentage * 3.6}deg,
                #1E293B 0deg
              )`,
            }}
          >
            <div style={styles.resultScoreInner}>
              <strong>{percentage}%</strong>
              <span>Score</span>
            </div>
          </div>

          <div style={styles.scoreDetails}>
            <div>
              <strong>{score}</strong>
              <span>Correct</span>
            </div>

            <div>
              <strong>
                {result?.wrong ?? total - score}
              </strong>
              <span>Wrong</span>
            </div>

            <div>
              <strong>{total}</strong>
              <span>Total</span>
            </div>
          </div>

          <div style={styles.resultActions}>
            <button
              onClick={restartQuiz}
              style={styles.restartButton}
            >
              <FaRedo />
              Try Again
            </button>

            <button
              onClick={() => {
                setStarted(true);
                setSubmitted(false);
                setCurrentQuestion(0);
              }}
              style={styles.reviewButton}
            >
              Review Answers
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // QUESTION
  // ============================================================

  const question = safeQuestions[currentQuestion];

  const isLastQuestion =
    currentQuestion === safeQuestions.length - 1;

  return (
    <div>
      {/* Header */}

      <div style={styles.quizHeader}>
        <div>
          <p style={styles.quizLabel}>QUIZ</p>

          <h1 style={styles.quizTitle}>
            {selectedSubject}
          </h1>
        </div>

        <div style={styles.questionCounter}>
          {currentQuestion + 1} / {safeQuestions.length}
        </div>
      </div>

      {/* Progress */}

      <div style={styles.progressBackground}>
        <div
          style={{
            ...styles.progressFill,
            width: `${
              ((currentQuestion + 1) /
                safeQuestions.length) *
              100
            }%`,
          }}
        />
      </div>

      {/* Question */}

      <div style={styles.questionCard}>
        <span style={styles.questionNumber}>
          Question {currentQuestion + 1}
        </span>

        <h2 style={styles.questionText}>
          {question.question}
        </h2>

        {/* Options */}

        <div style={styles.options}>
          {question.options.map((option, index) => {
            const selected =
              selectedAnswer === index;

            return (
              <button
                key={`${question.id}-${index}`}
                onClick={() => handleAnswer(index)}
                disabled={submitting}
                style={{
                  ...styles.option,
                  border: selected
                    ? "1px solid #8B5CF6"
                    : "1px solid #334155",
                  background: selected
                    ? "#312E81"
                    : "#020617",
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                <span
                  style={{
                    ...styles.optionNumber,
                    background: selected
                      ? "#8B5CF6"
                      : "#1E293B",
                  }}
                >
                  {String.fromCharCode(65 + index)}
                </span>

                <span style={styles.optionText}>
                  {option}
                </span>
              </button>
            );
          })}
        </div>

        {/* Navigation */}

        <div style={styles.navigation}>
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0 || submitting}
            style={{
              ...styles.previousButton,
              opacity:
                currentQuestion === 0 || submitting
                  ? 0.4
                  : 1,
            }}
          >
            <FaArrowLeft />
            Previous
          </button>

          {!isLastQuestion ? (
            <button
              onClick={handleNext}
              disabled={submitting}
              style={styles.nextButton}
            >
              Next
              <FaArrowRight />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                ...styles.submitButton,
                opacity: submitting ? 0.6 : 1,
              }}
            >
              {submitting ? "Submitting..." : "Submit Quiz"}
              {!submitting && <FaCheckCircle />}
            </button>
          )}
        </div>
      </div>

      {/* Question Indicator */}

      <div style={styles.indicators}>
        {safeQuestions.map((item, index) => (
          <button
            key={item.id}
            onClick={() => {
              if (!submitting) {
                setCurrentQuestion(index);
              }
            }}
            disabled={submitting}
            style={{
              ...styles.indicator,
              background:
                answers[item.id] !== undefined
                  ? "#8B5CF6"
                  : "#1E293B",
              border:
                currentQuestion === index
                  ? "1px solid #A78BFA"
                  : "1px solid #334155",
            }}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {error && (
        <p style={styles.inlineError}>
          {error}
        </p>
      )}

      <style>
        {`
          @keyframes quizSpin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          @media (max-width: 768px) {
            .quiz-page-container {
              width: 100%;
            }
          }

          @media (max-width: 600px) {
            .quiz-header {
              flex-direction: column !important;
              align-items: stretch !important;
              gap: 18px !important;
            }

            .quiz-question-card {
              padding: 20px !important;
            }

            .quiz-navigation {
              gap: 10px !important;
            }

            .quiz-result-actions {
              flex-direction: column !important;
            }
          }
        `}
      </style>
    </div>
  );
}

const styles = {
  startPage: {
    minHeight: "70vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  startCard: {
    width: "100%",
    maxWidth: "520px",
    background: "#0F172A",
    border: "1px solid #1E293B",
    borderRadius: "20px",
    padding: "35px",
    textAlign: "center",
  },

  startIcon: {
    width: "65px",
    height: "65px",
    margin: "0 auto 20px",
    borderRadius: "18px",
    background: "#312E81",
    color: "#A78BFA",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "27px",
  },

  startTitle: {
    color: "#FFFFFF",
    fontSize: "28px",
    margin: 0,
  },

  startDescription: {
    color: "#94A3B8",
    fontSize: "14px",
    lineHeight: "22px",
    margin: "10px auto 25px",
    maxWidth: "400px",
  },

  subjectSelection: {
    textAlign: "left",
  },

  label: {
    display: "block",
    color: "#CBD5E1",
    fontSize: "13px",
    fontWeight: "600",
    marginBottom: "8px",
  },

  subjectSelect: {
    width: "100%",
    boxSizing: "border-box",
    background: "#020617",
    border: "1px solid #334155",
    borderRadius: "10px",
    color: "#FFFFFF",
    padding: "13px",
    outline: "none",
  },

  quizInfo: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, 1fr)",
    gap: "10px",
    margin: "25px 0",
  },

  quizInfoDiv: {
    background: "#020617",
    borderRadius: "10px",
    padding: "12px",
  },

  startButton: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "9px",
    background: "#8B5CF6",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "10px",
    padding: "14px",
    cursor: "pointer",
    fontWeight: "700",
  },

  quizHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },

  quizLabel: {
    color: "#A78BFA",
    fontSize: "11px",
    fontWeight: "700",
    margin: 0,
  },

  quizTitle: {
    color: "#FFFFFF",
    fontSize: "26px",
    margin: "5px 0 0",
  },

  questionCounter: {
    color: "#CBD5E1",
    background: "#1E293B",
    padding: "8px 12px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "600",
  },

  progressBackground: {
    height: "7px",
    background: "#1E293B",
    borderRadius: "10px",
    overflow: "hidden",
    marginBottom: "25px",
  },

  progressFill: {
    height: "100%",
    background: "#8B5CF6",
    borderRadius: "10px",
    transition: "width 0.3s ease",
  },

  questionCard: {
    maxWidth: "850px",
    margin: "0 auto",
    background: "#0F172A",
    border: "1px solid #1E293B",
    borderRadius: "18px",
    padding: "30px",
  },

  questionNumber: {
    color: "#A78BFA",
    fontSize: "12px",
    fontWeight: "700",
  },

  questionText: {
    color: "#FFFFFF",
    fontSize: "21px",
    lineHeight: "30px",
    margin: "10px 0 25px",
  },

  options: {
    display: "grid",
    gap: "12px",
  },

  option: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "13px",
    textAlign: "left",
    borderRadius: "11px",
    color: "#CBD5E1",
    padding: "13px",
    cursor: "pointer",
  },

  optionNumber: {
    width: "30px",
    height: "30px",
    minWidth: "30px",
    borderRadius: "8px",
    color: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "12px",
  },

  optionText: {
    fontSize: "14px",
  },

  navigation: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "25px",
    paddingTop: "20px",
    borderTop: "1px solid #1E293B",
  },

  previousButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#1E293B",
    border: "1px solid #334155",
    color: "#CBD5E1",
    borderRadius: "9px",
    padding: "11px 15px",
    cursor: "pointer",
  },

  nextButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#8B5CF6",
    border: "none",
    color: "#FFFFFF",
    borderRadius: "9px",
    padding: "11px 17px",
    cursor: "pointer",
    fontWeight: "600",
  },

  submitButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#059669",
    border: "none",
    color: "#FFFFFF",
    borderRadius: "9px",
    padding: "11px 17px",
    cursor: "pointer",
    fontWeight: "600",
  },

  indicators: {
    display: "flex",
    justifyContent: "center",
    gap: "7px",
    flexWrap: "wrap",
    marginTop: "20px",
  },

  indicator: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    color: "#FFFFFF",
    cursor: "pointer",
    fontSize: "11px",
  },

  resultPage: {
    minHeight: "70vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  resultCard: {
    width: "100%",
    maxWidth: "500px",
    background: "#0F172A",
    border: "1px solid #1E293B",
    borderRadius: "20px",
    padding: "35px",
    textAlign: "center",
  },

  trophy: {
    width: "65px",
    height: "65px",
    margin: "0 auto 15px",
    borderRadius: "50%",
    background: "#713F12",
    color: "#FCD34D",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "25px",
  },

  resultTitle: {
    color: "#FFFFFF",
    margin: 0,
  },

  resultSubject: {
    color: "#A78BFA",
    fontSize: "13px",
  },

  scoreCircle: {
    width: "140px",
    height: "140px",
    borderRadius: "50%",
    background: "#312E81",
    margin: "25px auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  scoreDetails: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, 1fr)",
    gap: "10px",
  },

  resultActions: {
    display: "flex",
    gap: "10px",
    marginTop: "25px",
  },

  restartButton: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "7px",
    background: "#8B5CF6",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "9px",
    padding: "11px",
    cursor: "pointer",
    fontWeight: "600",
  },

  reviewButton: {
    flex: 1,
    background: "#1E293B",
    color: "#CBD5E1",
    border: "1px solid #334155",
    borderRadius: "9px",
    padding: "11px",
    cursor: "pointer",
  },
};
// Additional styles used by the backend-connected quiz.
styles.loadingPage = {
  minHeight: "400px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
};

styles.loadingSpinner = {
  color: "#8B5CF6",
  fontSize: "30px",
  animation: "quizSpin 1s linear infinite",
};

styles.loadingTitle = {
  color: "#FFFFFF",
  margin: "15px 0 5px",
};

styles.loadingText = {
  color: "#64748B",
  margin: 0,
};

styles.errorPage = {
  minHeight: "400px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  padding: "20px",
  boxSizing: "border-box",
};

styles.errorIcon = {
  color: "#EF4444",
  fontSize: "40px",
};

styles.errorTitle = {
  color: "#FFFFFF",
  margin: "15px 0 8px",
};

styles.errorText = {
  color: "#64748B",
  maxWidth: "450px",
  lineHeight: "1.6",
};

styles.retryButton = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  background: "#8B5CF6",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "10px",
  padding: "12px 18px",
  cursor: "pointer",
  fontWeight: "600",
  marginTop: "12px",
};

styles.resultScoreInner = {
  color: "#FFFFFF",
  width: "112px",
  height: "112px",
  borderRadius: "50%",
  background: "#1E293B",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
};

styles.resultScoreInnerStrong = {
  color: "#FFFFFF",
};

styles.inlineError = {
  color: "#F87171",
  textAlign: "center",
  fontSize: "13px",
  marginTop: "15px",
};

export default Quiz;
