import { useMemo, useState } from "react";
import {
  FaClipboardCheck,
  FaClock,
  FaArrowRight,
  FaArrowLeft,
  FaCheckCircle,
  FaTrophy,
  FaRedo,
} from "react-icons/fa";
import toast from "react-hot-toast";

const weeklyQuestions = [
  {
    id: 1,
    subject: "Artificial Intelligence",
    question:
      "Which algorithm uses a queue for traversal?",
    options: [
      "Depth First Search",
      "Breadth First Search",
      "Depth Limited Search",
      "Hill Climbing",
    ],
    answer: 1,
  },

  {
    id: 2,
    subject: "Computer Networks",
    question:
      "How many layers are present in the OSI model?",
    options: ["4", "5", "6", "7"],
    answer: 3,
  },

  {
    id: 3,
    subject: "Software Engineering",
    question:
      "Which model follows a sequential development approach?",
    options: [
      "Agile",
      "Waterfall",
      "Prototype",
      "Spiral",
    ],
    answer: 1,
  },

  {
    id: 4,
    subject: "Internet of Things",
    question:
      "What does IoT stand for?",
    options: [
      "Internet of Technology",
      "Internet of Things",
      "Information of Technology",
      "Internet of Tools",
    ],
    answer: 1,
  },

  {
    id: 5,
    subject: "Artificial Intelligence",
    question:
      "Which of the following is an AI application?",
    options: [
      "Recommendation System",
      "Calculator",
      "Text Editor",
      "File Manager",
    ],
    answer: 0,
  },

  {
    id: 6,
    subject: "Computer Networks",
    question:
      "Which device connects different networks?",
    options: [
      "Router",
      "Keyboard",
      "Monitor",
      "Printer",
    ],
    answer: 0,
  },

  {
    id: 7,
    subject: "Software Engineering",
    question:
      "Which activity identifies software defects?",
    options: [
      "Testing",
      "Planning",
      "Design",
      "Requirement Gathering",
    ],
    answer: 0,
  },

  {
    id: 8,
    subject: "Internet of Things",
    question:
      "Which device detects physical conditions?",
    options: [
      "Sensor",
      "Compiler",
      "Browser",
      "Database",
    ],
    answer: 0,
  },

  {
    id: 9,
    subject: "Artificial Intelligence",
    question:
      "Which algorithm commonly uses heuristic information?",
    options: [
      "A*",
      "Bubble Sort",
      "Linear Search",
      "Selection Sort",
    ],
    answer: 0,
  },

  {
    id: 10,
    subject: "Computer Networks",
    question:
      "Which transport protocol is connection-oriented?",
    options: [
      "UDP",
      "IP",
      "TCP",
      "ARP",
    ],
    answer: 2,
  },
];

function WeeklyTest() {
  const [started, setStarted] =
    useState(false);

  const [submitted, setSubmitted] =
    useState(false);

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [answers, setAnswers] =
    useState({});

  const [timeLeft, setTimeLeft] =
    useState(600);

  /*
    Randomize the question order only
    when the component starts.
  */

  const questions = useMemo(() => {
    return [...weeklyQuestions].sort(
      () => Math.random() - 0.5
    );
  }, [started]);

  const question =
    questions[currentQuestion];

  const answeredCount =
    Object.keys(answers).length;

  const handleStart = () => {
    setStarted(true);
    setSubmitted(false);
    setCurrentQuestion(0);
    setAnswers({});
    setTimeLeft(600);
  };

  const handleAnswer = (index) => {
    if (submitted) return;

    setAnswers((previous) => ({
      ...previous,
      [question.id]: index,
    }));
  };

  const handleNext = () => {
    if (
      answers[question.id] === undefined
    ) {
      toast.error(
        "Please select an answer."
      );
      return;
    }

    if (
      currentQuestion <
      questions.length - 1
    ) {
      setCurrentQuestion(
        currentQuestion + 1
      );
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(
        currentQuestion - 1
      );
    }
  };

  const handleSubmit = () => {
    if (
      answeredCount <
      questions.length
    ) {
      toast.error(
        "Answer all questions before submitting."
      );
      return;
    }

    setSubmitted(true);

    toast.success(
      "Weekly test submitted."
    );
  };

  const calculateScore = () => {
    return questions.reduce(
      (score, item) => {
        return (
          score +
          (answers[item.id] ===
          item.answer
            ? 1
            : 0)
        );
      },
      0
    );
  };

  const score = calculateScore();

  const percentage = Math.round(
    (score / questions.length) * 100
  );

  const formatTime = (seconds) => {
    const minutes = Math.floor(
      seconds / 60
    );

    const remainingSeconds =
      seconds % 60;

    return `${String(minutes).padStart(
      2,
      "0"
    )}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  const restart = () => {
    setStarted(false);
    setSubmitted(false);
    setCurrentQuestion(0);
    setAnswers({});
  };

  /*
    START SCREEN
  */

  if (!started) {
    return (
      <div style={styles.centerPage}>
        <div style={styles.startCard}>
          <div style={styles.icon}>
            <FaClipboardCheck />
          </div>

          <span style={styles.label}>
            WEEKLY ASSESSMENT
          </span>

          <h1 style={styles.title}>
            Weekly Test
          </h1>

          <p style={styles.description}>
            Test what you learned during the
            week across your subjects.
          </p>

          <div style={styles.infoGrid}>
            <div style={styles.infoBox}>
              <strong>
                {weeklyQuestions.length}
              </strong>

              <span>Questions</span>
            </div>

            <div style={styles.infoBox}>
              <strong>10</strong>

              <span>Minutes</span>
            </div>

            <div style={styles.infoBox}>
              <strong>4</strong>

              <span>Subjects</span>
            </div>
          </div>

          <div style={styles.instructions}>
            <h3>Before you begin</h3>

            <ul>
              <li>
                Answer every question.
              </li>

              <li>
                You cannot submit an
                incomplete test.
              </li>

              <li>
                Your final score will be
                calculated automatically.
              </li>

              <li>
                This test is designed to
                measure your weekly progress.
              </li>
            </ul>
          </div>

          <button
            onClick={handleStart}
            style={styles.startButton}
          >
            Start Weekly Test
            <FaArrowRight />
          </button>
        </div>
      </div>
    );
  }

  /*
    RESULT SCREEN
  */

  if (submitted) {
    return (
      <div style={styles.centerPage}>
        <div style={styles.resultCard}>
          <div style={styles.trophy}>
            <FaTrophy />
          </div>

          <span style={styles.label}>
            WEEKLY TEST RESULT
          </span>

          <h1 style={styles.resultTitle}>
            Test Completed
          </h1>

          <div style={styles.scoreCircle}>
            <strong>
              {percentage}%
            </strong>

            <span>
              Your Score
            </span>
          </div>

          <div style={styles.resultGrid}>
            <div>
              <strong>
                {score}
              </strong>

              <span>Correct</span>
            </div>

            <div>
              <strong>
                {questions.length - score}
              </strong>

              <span>Wrong</span>
            </div>

            <div>
              <strong>
                {questions.length}
              </strong>

              <span>Total</span>
            </div>
          </div>

          <div style={styles.performance}>
            {percentage >= 80
              ? "Excellent performance! Keep it up."
              : percentage >= 60
              ? "Good work! Revise the topics you missed."
              : "Keep practicing and improve your weak areas."}
          </div>

          <button
            onClick={restart}
            style={styles.restartButton}
          >
            <FaRedo />
            Take Another Test
          </button>
        </div>
      </div>
    );
  }

  /*
    TEST SCREEN
  */

  return (
    <div>
      {/* Header */}

      <div style={styles.testHeader}>
        <div>
          <span style={styles.label}>
            WEEKLY TEST
          </span>

          <h1 style={styles.testTitle}>
            Weekly Assessment
          </h1>
        </div>

        <div style={styles.timer}>
          <FaClock />

          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Progress */}

      <div style={styles.progressSection}>
        <div
          style={styles.progressBackground}
        >
          <div
            style={{
              ...styles.progressFill,
              width: `${
                ((currentQuestion + 1) /
                  questions.length) *
                100
              }%`,
            }}
          />
        </div>

        <div style={styles.progressInfo}>
          <span>
            Question{" "}
            {currentQuestion + 1} of{" "}
            {questions.length}
          </span>

          <span>
            {answeredCount}/
            {questions.length} Answered
          </span>
        </div>
      </div>

      {/* Question */}

      <div style={styles.questionCard}>
        <div style={styles.questionTop}>
          <span style={styles.questionNumber}>
            Question {currentQuestion + 1}
          </span>

          <span style={styles.subjectBadge}>
            {question.subject}
          </span>
        </div>

        <h2 style={styles.question}>
          {question.question}
        </h2>

        <div style={styles.options}>
          {question.options.map(
            (option, index) => {
              const selected =
                answers[question.id] ===
                index;

              return (
                <button
                  key={option}
                  onClick={() =>
                    handleAnswer(index)
                  }
                  style={{
                    ...styles.option,
                    background: selected
                      ? "#312E81"
                      : "#020617",
                    border: selected
                      ? "1px solid #8B5CF6"
                      : "1px solid #334155",
                  }}
                >
                  <span
                    style={{
                      ...styles.optionLetter,
                      background: selected
                        ? "#8B5CF6"
                        : "#1E293B",
                    }}
                  >
                    {String.fromCharCode(
                      65 + index
                    )}
                  </span>

                  {option}
                </button>
              );
            }
          )}
        </div>

        {/* Navigation */}

        <div style={styles.navigation}>
          <button
            onClick={handlePrevious}
            disabled={
              currentQuestion === 0
            }
            style={{
              ...styles.previousButton,
              opacity:
                currentQuestion === 0
                  ? 0.4
                  : 1,
            }}
          >
            <FaArrowLeft />
            Previous
          </button>

          {currentQuestion <
          questions.length - 1 ? (
            <button
              onClick={handleNext}
              style={styles.nextButton}
            >
              Next
              <FaArrowRight />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              style={styles.submitButton}
            >
              Submit Test
              <FaCheckCircle />
            </button>
          )}
        </div>
      </div>

      {/* Question Navigator */}

      <div style={styles.navigator}>
        {questions.map(
          (item, index) => (
            <button
              key={item.id}
              onClick={() =>
                setCurrentQuestion(index)
              }
              style={{
                ...styles.numberButton,
                background:
                  answers[item.id] !==
                  undefined
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
          )
        )}
      </div>
    </div>
  );
}

const styles = {
  centerPage: {
    minHeight: "70vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  startCard: {
    width: "100%",
    maxWidth: "550px",
    background: "#0F172A",
    border: "1px solid #1E293B",
    borderRadius: "20px",
    padding: "35px",
    textAlign: "center",
  },

  icon: {
    width: "65px",
    height: "65px",
    margin: "0 auto 18px",
    borderRadius: "17px",
    background: "#312E81",
    color: "#A78BFA",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "27px",
  },

  label: {
    color: "#A78BFA",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "0.5px",
  },

  title: {
    color: "#FFFFFF",
    fontSize: "29px",
    margin: "7px 0",
  },

  description: {
    color: "#94A3B8",
    fontSize: "14px",
    lineHeight: "22px",
    maxWidth: "430px",
    margin: "10px auto 25px",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, 1fr)",
    gap: "10px",
  },

  infoBox: {
    background: "#020617",
    borderRadius: "10px",
    padding: "13px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  instructions: {
    textAlign: "left",
    background: "#111827",
    borderRadius: "11px",
    padding: "15px",
    margin: "20px 0",
  },

  startButton: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    background: "#8B5CF6",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "10px",
    padding: "14px",
    cursor: "pointer",
    fontWeight: "700",
  },

  testHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },

  testTitle: {
    color: "#FFFFFF",
    fontSize: "26px",
    margin: "5px 0 0",
  },

  timer: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#7F1D1D",
    color: "#FCA5A5",
    borderRadius: "9px",
    padding: "10px 14px",
    fontSize: "14px",
    fontWeight: "700",
  },

  progressSection: {
    marginBottom: "20px",
  },

  progressBackground: {
    height: "7px",
    background: "#1E293B",
    borderRadius: "10px",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    background: "#8B5CF6",
    borderRadius: "10px",
  },

  progressInfo: {
    display: "flex",
    justifyContent: "space-between",
    color: "#64748B",
    fontSize: "11px",
    marginTop: "8px",
  },

  questionCard: {
    maxWidth: "850px",
    margin: "0 auto",
    background: "#0F172A",
    border: "1px solid #1E293B",
    borderRadius: "18px",
    padding: "30px",
  },

  questionTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
  },

  questionNumber: {
    color: "#A78BFA",
    fontSize: "12px",
    fontWeight: "700",
  },

  subjectBadge: {
    background: "#1E293B",
    color: "#CBD5E1",
    borderRadius: "7px",
    padding: "6px 9px",
    fontSize: "11px",
  },

  question: {
    color: "#FFFFFF",
    fontSize: "21px",
    lineHeight: "30px",
    margin: "18px 0 25px",
  },

  options: {
    display: "grid",
    gap: "12px",
  },

  option: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    width: "100%",
    color: "#CBD5E1",
    textAlign: "left",
    borderRadius: "10px",
    padding: "13px",
    cursor: "pointer",
    fontSize: "13px",
  },

  optionLetter: {
    width: "30px",
    height: "30px",
    minWidth: "30px",
    borderRadius: "8px",
    color: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: "700",
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
    color: "#CBD5E1",
    border: "1px solid #334155",
    borderRadius: "9px",
    padding: "11px 15px",
    cursor: "pointer",
  },

  nextButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#8B5CF6",
    color: "#FFFFFF",
    border: "none",
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
    color: "#FFFFFF",
    border: "none",
    borderRadius: "9px",
    padding: "11px 17px",
    cursor: "pointer",
    fontWeight: "600",
  },

  navigator: {
    display: "flex",
    justifyContent: "center",
    gap: "7px",
    flexWrap: "wrap",
    marginTop: "20px",
  },

  numberButton: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    color: "#FFFFFF",
    cursor: "pointer",
    fontSize: "11px",
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
    margin: "7px 0 20px",
  },

  scoreCircle: {
    width: "140px",
    height: "140px",
    margin: "0 auto 25px",
    borderRadius: "50%",
    background: "#312E81",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },

  resultGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, 1fr)",
    gap: "10px",
  },

  performance: {
    background: "#111827",
    color: "#94A3B8",
    borderRadius: "10px",
    padding: "13px",
    margin: "20px 0",
    fontSize: "13px",
  },

  restartButton: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "8px",
    background: "#8B5CF6",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "9px",
    padding: "12px",
    cursor: "pointer",
    fontWeight: "600",
  },
};

export default WeeklyTest;