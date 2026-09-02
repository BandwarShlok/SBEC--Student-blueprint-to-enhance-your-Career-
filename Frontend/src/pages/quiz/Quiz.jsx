import { useState } from "react";
import {
  FaClipboardCheck,
  FaArrowRight,
  FaArrowLeft,
  FaCheckCircle,
  FaTimesCircle,
  FaRedo,
  FaTrophy,
} from "react-icons/fa";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

/*
  Temporary quiz data.

  Later these questions will come
  from the backend/database.
*/

const quizData = {
  "Artificial Intelligence": [
    {
      id: 1,
      question:
        "Which of the following is a branch of Artificial Intelligence?",
      options: [
        "Machine Learning",
        "Web Designing",
        "Database Management",
        "Operating System",
      ],
      answer: 0,
      explanation:
        "Machine Learning is a major branch of Artificial Intelligence.",
    },

    {
      id: 2,
      question:
        "Which search algorithm uses a queue?",
      options: [
        "DFS",
        "BFS",
        "DLS",
        "Hill Climbing",
      ],
      answer: 1,
      explanation:
        "Breadth First Search uses a queue to explore nodes level by level.",
    },

    {
      id: 3,
      question:
        "What does an intelligent agent perceive?",
      options: [
        "Only commands",
        "Its environment",
        "Only databases",
        "Only users",
      ],
      answer: 1,
      explanation:
        "An intelligent agent perceives its environment through sensors.",
    },

    {
      id: 4,
      question:
        "Which algorithm is commonly associated with heuristic search?",
      options: [
        "A*",
        "Bubble Sort",
        "Binary Search",
        "Linear Search",
      ],
      answer: 0,
      explanation:
        "A* uses heuristic information to guide the search.",
    },

    {
      id: 5,
      question:
        "Which is an example of an AI application?",
      options: [
        "Recommendation System",
        "Calculator",
        "Text Editor",
        "File Explorer",
      ],
      answer: 0,
      explanation:
        "Recommendation systems commonly use AI and machine learning.",
    },
  ],

  "Computer Networks": [
    {
      id: 1,
      question:
        "How many layers are present in the OSI model?",
      options: ["5", "6", "7", "8"],
      answer: 2,
      explanation:
        "The OSI reference model contains seven layers.",
    },

    {
      id: 2,
      question:
        "Which layer is responsible for routing?",
      options: [
        "Physical",
        "Data Link",
        "Network",
        "Application",
      ],
      answer: 2,
      explanation:
        "The Network layer handles logical addressing and routing.",
    },

    {
      id: 3,
      question:
        "Which protocol is connection-oriented?",
      options: [
        "UDP",
        "TCP",
        "IP",
        "ARP",
      ],
      answer: 1,
      explanation:
        "TCP is a connection-oriented transport protocol.",
    },

    {
      id: 4,
      question:
        "What does LAN stand for?",
      options: [
        "Large Area Network",
        "Local Area Network",
        "Logical Access Network",
        "Linked Area Node",
      ],
      answer: 1,
      explanation:
        "LAN stands for Local Area Network.",
    },

    {
      id: 5,
      question:
        "Which device connects different networks?",
      options: [
        "Router",
        "Keyboard",
        "Monitor",
        "Printer",
      ],
      answer: 0,
      explanation:
        "A router forwards packets between different networks.",
    },
  ],

  "Software Engineering": [
    {
      id: 1,
      question:
        "Which model follows a sequential development approach?",
      options: [
        "Waterfall",
        "Agile",
        "Prototype",
        "Spiral",
      ],
      answer: 0,
      explanation:
        "The Waterfall model follows sequential development phases.",
    },

    {
      id: 2,
      question:
        "What is the first major activity in software development?",
      options: [
        "Testing",
        "Requirement Analysis",
        "Maintenance",
        "Deployment",
      ],
      answer: 1,
      explanation:
        "Understanding and documenting requirements is an early major activity.",
    },

    {
      id: 3,
      question:
        "Which model emphasizes iterative development?",
      options: [
        "Waterfall",
        "Agile",
        "Big Bang",
        "Linear",
      ],
      answer: 1,
      explanation:
        "Agile development uses iterative and incremental development.",
    },

    {
      id: 4,
      question:
        "Which activity checks whether software works correctly?",
      options: [
        "Testing",
        "Planning",
        "Requirement Gathering",
        "Design",
      ],
      answer: 0,
      explanation:
        "Testing is used to identify defects and verify software behavior.",
    },

    {
      id: 5,
      question:
        "Which is a software quality attribute?",
      options: [
        "Maintainability",
        "Keyboard",
        "Monitor",
        "Cable",
      ],
      answer: 0,
      explanation:
        "Maintainability is an important software quality attribute.",
    },
  ],

  "Internet of Things": [
    {
      id: 1,
      question:
        "What does IoT stand for?",
      options: [
        "Internet of Technology",
        "Internet of Things",
        "Information of Things",
        "Internet of Tools",
      ],
      answer: 1,
      explanation:
        "IoT stands for Internet of Things.",
    },

    {
      id: 2,
      question:
        "Which component can sense physical conditions?",
      options: [
        "Sensor",
        "Compiler",
        "Browser",
        "Database",
      ],
      answer: 0,
      explanation:
        "Sensors detect physical conditions such as temperature or motion.",
    },

    {
      id: 3,
      question:
        "Which is an IoT application?",
      options: [
        "Smart Home",
        "Text Editor",
        "Calculator",
        "Word Processor",
      ],
      answer: 0,
      explanation:
        "Smart homes are a common application of IoT.",
    },

    {
      id: 4,
      question:
        "What allows IoT devices to communicate?",
      options: [
        "Communication Network",
        "Keyboard",
        "Monitor",
        "Mouse",
      ],
      answer: 0,
      explanation:
        "IoT devices communicate using wired or wireless networks.",
    },

    {
      id: 5,
      question:
        "Which is an important IoT concern?",
      options: [
        "Security",
        "Screen brightness",
        "Keyboard layout",
        "Font size",
      ],
      answer: 0,
      explanation:
        "Security is a major concern because IoT devices are connected to networks.",
    },
  ],
};

function Quiz() {
  const [searchParams] = useSearchParams();

  const subjectId =
    searchParams.get("subject");

  const subjectMap = {
    1: "Artificial Intelligence",
    2: "Computer Networks",
    3: "Software Engineering",
    4: "Internet of Things",
  };

  const initialSubject =
    subjectMap[subjectId] ||
    "Artificial Intelligence";

  const [selectedSubject, setSelectedSubject] =
    useState(initialSubject);

  const [started, setStarted] =
    useState(false);

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [answers, setAnswers] =
    useState({});

  const [submitted, setSubmitted] =
    useState(false);

  const questions =
    quizData[selectedSubject];

  const selectedAnswer =
    answers[currentQuestion];

  const handleStart = () => {
    setStarted(true);
    setCurrentQuestion(0);
    setAnswers({});
    setSubmitted(false);
  };

  const handleAnswer = (answerIndex) => {
    if (submitted) return;

    setAnswers((previous) => ({
      ...previous,
      [currentQuestion]: answerIndex,
    }));
  };

  const handleNext = () => {
    if (
      selectedAnswer === undefined
    ) {
      toast.error(
        "Please select an answer first."
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
    const answeredCount =
      Object.keys(answers).length;

    if (
      answeredCount <
      questions.length
    ) {
      toast.error(
        "Please answer all questions before submitting."
      );
      return;
    }

    setSubmitted(true);

    toast.success(
      "Quiz submitted successfully!"
    );
  };

  const calculateScore = () => {
    return questions.reduce(
      (score, question, index) => {
        return (
          score +
          (answers[index] ===
          question.answer
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

  const restartQuiz = () => {
    setStarted(false);
    setCurrentQuestion(0);
    setAnswers({});
    setSubmitted(false);
  };

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
            Test your understanding of your
            subjects with short practice quizzes.
          </p>

          <div style={styles.subjectSelection}>
            <label style={styles.label}>
              Select Subject
            </label>

            <select
              value={selectedSubject}
              onChange={(e) =>
                setSelectedSubject(
                  e.target.value
                )
              }
              style={styles.subjectSelect}
            >
              {Object.keys(
                quizData
              ).map((subject) => (
                <option
                  key={subject}
                  value={subject}
                >
                  {subject}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.quizInfo}>
            <div>
              <strong>
                {questions.length}
              </strong>

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

          <div style={styles.scoreCircle}>
            <strong>{percentage}%</strong>

            <span>Score</span>
          </div>

          <div style={styles.scoreDetails}>
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
                setAnswers({});
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

  const question =
    questions[currentQuestion];

  const isLastQuestion =
    currentQuestion ===
    questions.length - 1;

  return (
    <div>
      {/* Header */}

      <div style={styles.quizHeader}>
        <div>
          <p style={styles.quizLabel}>
            QUIZ
          </p>

          <h1 style={styles.quizTitle}>
            {selectedSubject}
          </h1>
        </div>

        <div style={styles.questionCounter}>
          {currentQuestion + 1} /{" "}
          {questions.length}
        </div>
      </div>

      {/* Progress */}

      <div style={styles.progressBackground}>
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
          {question.options.map(
            (option, index) => {
              const selected =
                selectedAnswer === index;

              return (
                <button
                  key={option}
                  onClick={() =>
                    handleAnswer(index)
                  }
                  style={{
                    ...styles.option,
                    border: selected
                      ? "1px solid #8B5CF6"
                      : "1px solid #334155",
                    background: selected
                      ? "#312E81"
                      : "#020617",
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
                    {String.fromCharCode(
                      65 + index
                    )}
                  </span>

                  <span
                    style={
                      styles.optionText
                    }
                  >
                    {option}
                  </span>
                </button>
              );
            }
          )}
        </div>

        {/* Navigation */}

        <div style={styles.navigation}>
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
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

          {!isLastQuestion ? (
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
              Submit Quiz
              <FaCheckCircle />
            </button>
          )}
        </div>
      </div>

      {/* Question Indicator */}

      <div style={styles.indicators}>
        {questions.map(
          (item, index) => (
            <button
              key={item.id}
              onClick={() =>
                setCurrentQuestion(index)
              }
              style={{
                ...styles.indicator,
                background:
                  answers[index] !==
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

export default Quiz;