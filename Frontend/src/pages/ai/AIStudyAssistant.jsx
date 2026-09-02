import { useEffect, useRef, useState } from "react";
import {
  FaRobot,
  FaUser,
  FaPaperPlane,
  FaTrash,
  FaLightbulb,
  FaBook,
  FaQuestionCircle,
  FaFileAlt,
} from "react-icons/fa";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

function AIStudyAssistant() {
  const [searchParams] = useSearchParams();

  const subjectId =
    searchParams.get("subject");

  const unitId =
    searchParams.get("unit");

  const [selectedSubject, setSelectedSubject] =
    useState("General");

  const [input, setInput] = useState("");

  const [loading, setLoading] =
    useState(false);

  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      text:
        "Hello! I'm your SBEC AI Study Assistant. Ask me anything about your subjects, notes, exams or learning topics.",
    },
  ]);

  const messagesEndRef = useRef(null);

  const subjects = [
    {
      id: "1",
      name: "Artificial Intelligence",
    },
    {
      id: "2",
      name: "Computer Networks",
    },
    {
      id: "3",
      name: "Software Engineering",
    },
    {
      id: "4",
      name: "Internet of Things",
    },
  ];

  useEffect(() => {
    if (!subjectId) return;

    const subject = subjects.find(
      (item) => item.id === subjectId
    );

    if (subject) {
      setSelectedSubject(subject.name);
    }
  }, [subjectId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  const generateTemporaryResponse = (
    question
  ) => {
    const lowerQuestion =
      question.toLowerCase();

    if (
      lowerQuestion.includes("summarize")
    ) {
      return `Sure. I can summarize this topic into short exam-oriented points. Since you are currently studying ${selectedSubject}, I would organize the answer into definition, key concepts, examples and important points.`;
    }

    if (
      lowerQuestion.includes("mcq") ||
      lowerQuestion.includes("quiz")
    ) {
      return `I can generate practice questions for ${selectedSubject}. For example, I can create MCQs with four options, correct answers and explanations.`;
    }

    if (
      lowerQuestion.includes("explain")
    ) {
      return `I can explain the topic in simple language first and then provide an exam-oriented explanation. Your selected subject is ${selectedSubject}.`;
    }

    return `I understand your question about "${question}". In the connected version of SBEC, I will analyze your question using the AI model and provide a study-focused answer based on your selected subject and learning context.`;
  };

  const handleSend = async () => {
    const trimmedInput =
      input.trim();

    if (!trimmedInput) {
      toast.error(
        "Please enter a question."
      );
      return;
    }

    if (loading) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      text: trimmedInput,
    };

    setMessages((previous) => [
      ...previous,
      userMessage,
    ]);

    setInput("");
    setLoading(true);

    setTimeout(() => {
      const response =
        generateTemporaryResponse(
          trimmedInput
        );

      const assistantMessage = {
        id: Date.now() + 1,
        role: "assistant",
        text: response,
      };

      setMessages((previous) => [
        ...previous,
        assistantMessage,
      ]);

      setLoading(false);
    }, 900);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (action) => {
    let prompt = "";

    if (action === "explain") {
      prompt = `Explain ${selectedSubject} in simple language.`;
    }

    if (action === "summary") {
      prompt = `Give me a short exam-oriented summary of ${selectedSubject}.`;
    }

    if (action === "mcq") {
      prompt = `Generate 5 MCQs for ${selectedSubject}.`;
    }

    if (action === "revision") {
      prompt = `Create quick revision notes for ${selectedSubject}.`;
    }

    setInput(prompt);
  };

  const clearChat = () => {
    setMessages([
      {
        id: Date.now(),
        role: "assistant",
        text:
          "Chat cleared. What would you like to study?",
      },
    ]);

    toast.success("Chat cleared.");
  };

  return (
    <div style={styles.page}>
      {/* Header */}

      <div style={styles.header}>
        <div>
          <div style={styles.headingRow}>
            <div style={styles.robotIcon}>
              <FaRobot />
            </div>

            <div>
              <h1 style={styles.title}>
                AI Study Assistant
              </h1>

              <p style={styles.subtitle}>
                Your personal AI-powered learning
                companion.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={clearChat}
          style={styles.clearButton}
        >
          <FaTrash />
          Clear Chat
        </button>
      </div>

      {/* Subject Context */}

      <div style={styles.contextBar}>
        <div>
          <span style={styles.contextLabel}>
            Studying:
          </span>

          <select
            value={selectedSubject}
            onChange={(e) =>
              setSelectedSubject(
                e.target.value
              )
            }
            style={styles.subjectSelect}
          >
            <option value="General">
              General
            </option>

            {subjects.map((subject) => (
              <option
                key={subject.id}
                value={subject.name}
              >
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        {unitId && (
          <span style={styles.unitBadge}>
            Unit {unitId}
          </span>
        )}
      </div>

      {/* Chat Area */}

      <div style={styles.chatContainer}>
        <div style={styles.messages}>
          {messages.map((message) => (
            <div
              key={message.id}
              style={{
                ...styles.messageRow,
                justifyContent:
                  message.role === "user"
                    ? "flex-end"
                    : "flex-start",
              }}
            >
              {message.role ===
                "assistant" && (
                <div style={styles.aiAvatar}>
                  <FaRobot />
                </div>
              )}

              <div
                style={{
                  ...styles.messageBubble,
                  background:
                    message.role === "user"
                      ? "#8B5CF6"
                      : "#1E293B",
                }}
              >
                <p
                  style={{
                    ...styles.messageText,
                    color:
                      message.role === "user"
                        ? "#FFFFFF"
                        : "#CBD5E1",
                  }}
                >
                  {message.text}
                </p>
              </div>

              {message.role === "user" && (
                <div style={styles.userAvatar}>
                  <FaUser />
                </div>
              )}
            </div>
          ))}

          {/* Loading */}

          {loading && (
            <div style={styles.messageRow}>
              <div style={styles.aiAvatar}>
                <FaRobot />
              </div>

              <div style={styles.loadingBubble}>
                <span />
                <span />
                <span />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}

        <div style={styles.quickActions}>
          <span style={styles.quickLabel}>
            Quick Actions
          </span>

          <div style={styles.quickButtons}>
            <button
              onClick={() =>
                handleQuickAction(
                  "explain"
                )
              }
              style={styles.quickButton}
            >
              <FaLightbulb />
              Explain Topic
            </button>

            <button
              onClick={() =>
                handleQuickAction(
                  "summary"
                )
              }
              style={styles.quickButton}
            >
              <FaFileAlt />
              Make Summary
            </button>

            <button
              onClick={() =>
                handleQuickAction("mcq")
              }
              style={styles.quickButton}
            >
              <FaQuestionCircle />
              Generate MCQs
            </button>

            <button
              onClick={() =>
                handleQuickAction(
                  "revision"
                )
              }
              style={styles.quickButton}
            >
              <FaBook />
              Revision Notes
            </button>
          </div>
        </div>

        {/* Input */}

        <div style={styles.inputArea}>
          <textarea
            value={input}
            onChange={(e) =>
              setInput(e.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder="Ask your study question..."
            rows={1}
            style={styles.textarea}
            disabled={loading}
          />

          <button
            onClick={handleSend}
            disabled={
              loading || !input.trim()
            }
            style={{
              ...styles.sendButton,
              opacity:
                loading || !input.trim()
                  ? 0.5
                  : 1,
            }}
          >
            <FaPaperPlane />
          </button>
        </div>

        <p style={styles.disclaimer}>
          SBEC AI Assistant is designed for
          academic learning and study assistance.
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    maxWidth: "1100px",
    margin: "0 auto",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "22px",
  },

  headingRow: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },

  robotIcon: {
    width: "50px",
    height: "50px",
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
    fontSize: "28px",
    margin: 0,
  },

  subtitle: {
    color: "#64748B",
    fontSize: "13px",
    margin: "5px 0 0",
  },

  clearButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#1E293B",
    border: "1px solid #334155",
    color: "#94A3B8",
    borderRadius: "9px",
    padding: "10px 13px",
    cursor: "pointer",
    fontSize: "12px",
  },

  contextBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#0F172A",
    border: "1px solid #1E293B",
    borderRadius: "12px",
    padding: "12px 15px",
    marginBottom: "15px",
  },

  contextLabel: {
    color: "#64748B",
    fontSize: "12px",
    marginRight: "8px",
  },

  subjectSelect: {
    background: "#1E293B",
    color: "#CBD5E1",
    border: "1px solid #334155",
    borderRadius: "7px",
    padding: "7px 10px",
    outline: "none",
    fontSize: "12px",
  },

  unitBadge: {
    background: "#312E81",
    color: "#A78BFA",
    padding: "7px 10px",
    borderRadius: "7px",
    fontSize: "12px",
    fontWeight: "600",
  },

  chatContainer: {
    background: "#0F172A",
    border: "1px solid #1E293B",
    borderRadius: "16px",
    overflow: "hidden",
  },

  messages: {
    height: "480px",
    overflowY: "auto",
    padding: "25px",
  },

  messageRow: {
    display: "flex",
    alignItems: "flex-end",
    gap: "10px",
    marginBottom: "18px",
  },

  aiAvatar: {
    width: "34px",
    height: "34px",
    minWidth: "34px",
    borderRadius: "10px",
    background: "#312E81",
    color: "#A78BFA",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
  },

  userAvatar: {
    width: "34px",
    height: "34px",
    minWidth: "34px",
    borderRadius: "10px",
    background: "#334155",
    color: "#CBD5E1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
  },

  messageBubble: {
    maxWidth: "70%",
    borderRadius: "14px",
    padding: "12px 15px",
  },

  messageText: {
    margin: 0,
    fontSize: "14px",
    lineHeight: "23px",
    whiteSpace: "pre-wrap",
  },

  loadingBubble: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    background: "#1E293B",
    borderRadius: "14px",
    padding: "15px",
  },

  quickActions: {
    borderTop: "1px solid #1E293B",
    padding: "15px 20px",
  },

  quickLabel: {
    color: "#64748B",
    fontSize: "11px",
    fontWeight: "700",
    textTransform: "uppercase",
  },

  quickButtons: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginTop: "10px",
  },

  quickButton: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    background: "#1E293B",
    border: "1px solid #334155",
    color: "#CBD5E1",
    borderRadius: "8px",
    padding: "8px 11px",
    cursor: "pointer",
    fontSize: "12px",
  },

  inputArea: {
    display: "flex",
    alignItems: "flex-end",
    gap: "10px",
    borderTop: "1px solid #1E293B",
    padding: "15px",
  },

  textarea: {
    flex: 1,
    resize: "none",
    background: "#020617",
    color: "#FFFFFF",
    border: "1px solid #334155",
    borderRadius: "10px",
    padding: "12px",
    outline: "none",
    fontSize: "14px",
    lineHeight: "20px",
  },

  sendButton: {
    width: "43px",
    height: "43px",
    minWidth: "43px",
    borderRadius: "10px",
    border: "none",
    background: "#8B5CF6",
    color: "#FFFFFF",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  disclaimer: {
    color: "#475569",
    textAlign: "center",
    fontSize: "10px",
    padding: "0 15px 15px",
    margin: 0,
  },
};

export default AIStudyAssistant;