import { useState } from "react";
import {
  FaArrowLeft,
  FaBook,
  FaBookmark,
  FaRegBookmark,
  FaClipboardCheck,
  FaCheckCircle,
} from "react-icons/fa";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

/* =========================================================
   TEMPORARY NOTES DATA
   ========================================================= */

const notesData = {
  1: {
    1: {
      subject: "Artificial Intelligence",
      unit: "Unit 1",
      title: "Introduction to Artificial Intelligence",
      content: [
        {
          heading: "What is Artificial Intelligence?",
          text: "Artificial Intelligence (AI) is a branch of computer science that focuses on creating systems capable of performing tasks that normally require human intelligence.",
        },
        {
          heading: "Characteristics of AI",
          points: [
            "Learning from data and experience",
            "Reasoning and problem solving",
            "Knowledge representation",
            "Decision making",
            "Understanding natural language",
          ],
        },
        {
          heading: "Intelligent Agents",
          text: "An intelligent agent perceives its environment through sensors and acts upon that environment using actuators.",
        },
        {
          heading: "Applications of AI",
          points: [
            "Healthcare",
            "Education",
            "Robotics",
            "Finance",
            "Natural Language Processing",
            "Computer Vision",
          ],
        },
      ],
    },

    2: {
      subject: "Artificial Intelligence",
      unit: "Unit 2",
      title: "Uninformed Search",
      content: [
        {
          heading: "Introduction",
          text: "Uninformed search algorithms explore the search space without using additional domain-specific knowledge.",
        },
        {
          heading: "Breadth First Search",
          text: "Breadth First Search explores nodes level by level and uses a queue data structure.",
        },
        {
          heading: "Depth First Search",
          text: "Depth First Search explores as far as possible along one branch before backtracking.",
        },
        {
          heading: "Common Algorithms",
          points: [
            "Breadth First Search",
            "Depth First Search",
            "Depth Limited Search",
            "Iterative Deepening Search",
          ],
        },
      ],
    },
  },

  2: {
    1: {
      subject: "Computer Networks",
      unit: "Unit 1",
      title: "Introduction to Computer Networks",
      content: [
        {
          heading: "What is a Computer Network?",
          text: "A computer network is a collection of interconnected devices that communicate with each other and share resources.",
        },
        {
          heading: "Network Types",
          points: [
            "LAN - Local Area Network",
            "MAN - Metropolitan Area Network",
            "WAN - Wide Area Network",
            "PAN - Personal Area Network",
          ],
        },
        {
          heading: "Network Components",
          points: [
            "Sender",
            "Receiver",
            "Transmission Medium",
            "Network Devices",
            "Protocols",
          ],
        },
      ],
    },

    2: {
      subject: "Computer Networks",
      unit: "Unit 2",
      title: "OSI and TCP/IP Model",
      content: [
        {
          heading: "OSI Model",
          text: "The OSI model is a seven-layer reference model used to understand network communication.",
        },
        {
          heading: "Seven OSI Layers",
          points: [
            "Physical Layer",
            "Data Link Layer",
            "Network Layer",
            "Transport Layer",
            "Session Layer",
            "Presentation Layer",
            "Application Layer",
          ],
        },
        {
          heading: "TCP/IP Model",
          points: [
            "Network Access Layer",
            "Internet Layer",
            "Transport Layer",
            "Application Layer",
          ],
        },
      ],
    },
  },

  3: {
    1: {
      subject: "Software Engineering",
      unit: "Unit 1",
      title: "Introduction to Software Engineering",
      content: [
        {
          heading: "What is Software Engineering?",
          text: "Software engineering is a systematic approach to the development, operation, maintenance and testing of software.",
        },
        {
          heading: "Characteristics of Good Software",
          points: [
            "Correctness",
            "Reliability",
            "Efficiency",
            "Maintainability",
            "Usability",
            "Security",
          ],
        },
        {
          heading: "Software Engineering Principles",
          points: [
            "Modularity",
            "Abstraction",
            "Reusability",
            "Maintainability",
            "Testing",
          ],
        },
      ],
    },

    2: {
      subject: "Software Engineering",
      unit: "Unit 2",
      title: "Software Development Models",
      content: [
        {
          heading: "Software Development Model",
          text: "A software development model defines the process followed to develop and maintain software.",
        },
        {
          heading: "Common Models",
          points: [
            "Waterfall Model",
            "Agile Model",
            "Spiral Model",
            "Prototype Model",
            "Incremental Model",
          ],
        },
        {
          heading: "Agile Development",
          text: "Agile development focuses on iterative development, continuous feedback and delivering working software frequently.",
        },
      ],
    },
  },

  4: {
    1: {
      subject: "Internet of Things",
      unit: "Unit 1",
      title: "Introduction to IoT",
      content: [
        {
          heading: "What is IoT?",
          text: "The Internet of Things is a network of physical objects equipped with sensors, software and connectivity that allows them to collect and exchange data.",
        },
        {
          heading: "Characteristics of IoT",
          points: [
            "Connectivity",
            "Sensing",
            "Data Processing",
            "Automation",
            "Real-time communication",
          ],
        },
        {
          heading: "Applications of IoT",
          points: [
            "Smart Homes",
            "Smart Cities",
            "Healthcare",
            "Agriculture",
            "Industrial Automation",
          ],
        },
      ],
    },

    2: {
      subject: "Internet of Things",
      unit: "Unit 2",
      title: "IoT Architecture",
      content: [
        {
          heading: "IoT Architecture",
          text: "IoT architecture defines the layers and components involved in sensing, communication, processing and application of IoT data.",
        },
        {
          heading: "Common Layers",
          points: [
            "Perception Layer",
            "Network Layer",
            "Processing Layer",
            "Application Layer",
          ],
        },
      ],
    },
  },
};

/* =========================================================
   NOTES PAGE
   ========================================================= */

function Notes() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  const unitId = Number(searchParams.get("unit") || 1);

  const note = notesData[id]?.[unitId];

  const [bookmarked, setBookmarked] = useState(false);
  const [completed, setCompleted] = useState(false);

  /* =======================================================
     NOTE NOT FOUND
     ======================================================= */

  if (!note) {
    return (
      <div className="notes-page">
        <div className="not-found-card">
          <div className="not-found-icon">
            <FaBook />
          </div>

          <h2>Notes Not Available</h2>

          <p>Notes for this subject or unit are currently not available.</p>

          <button
            className="primary-button"
            onClick={() => navigate(`/subjects/${id}`)}
          >
            <FaArrowLeft />
            Back to Subject
          </button>
        </div>

        <style>{styles}</style>
      </div>
    );
  }

  /* =======================================================
     BOOKMARK
     ======================================================= */

  const handleBookmark = () => {
    setBookmarked((previous) => {
      const nextValue = !previous;

      toast.success(nextValue ? "Note bookmarked." : "Removed from bookmarks.");

      return nextValue;
    });
  };

  /* =======================================================
     COMPLETE
     ======================================================= */

  const handleComplete = () => {
    setCompleted((previous) => {
      const nextValue = !previous;

      toast.success(
        nextValue ? "Unit marked as completed." : "Unit marked incomplete.",
      );

      return nextValue;
    });
  };

  /* =======================================================
     QUIZ
     ======================================================= */

  const handleQuiz = () => {
    navigate(`/quiz?subject=${id}&unit=${unitId}`);
  };

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="notes-page">
      {/* =================================================
          TOP BAR
      ================================================= */}

      <div className="notes-top-bar">
        <button
          className="back-button"
          onClick={() => navigate(`/subjects/${id}`)}
        >
          <FaArrowLeft />
          <span>Back to Subject</span>
        </button>

        <div className="notes-actions">
          <button
            className={`action-button bookmark-button ${
              bookmarked ? "active" : ""
            }`}
            onClick={handleBookmark}
          >
            {bookmarked ? <FaBookmark /> : <FaRegBookmark />}

            <span>{bookmarked ? "Bookmarked" : "Bookmark"}</span>
          </button>

          <button className="action-button quiz-button" onClick={handleQuiz}>
            <FaClipboardCheck />
            <span>Take Quiz</span>
          </button>
        </div>
      </div>

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="note-header">
        <div className="unit-label">
          {note.subject} <span>•</span> {note.unit}
        </div>

        <h1>{note.title}</h1>

        <p>
          Study the notes carefully and take the quiz after completing the unit.
        </p>
      </div>

      {/* =================================================
          NOTE CONTENT
      ================================================= */}

      <div className="note-container">
        {note.content.map((section, index) => (
          <section key={index} className="note-section">
            <h2>
              <span className="section-number">
                {String(index + 1).padStart(2, "0")}
              </span>

              {section.heading}
            </h2>

            {section.text && <p className="note-text">{section.text}</p>}

            {section.points && (
              <ul className="note-list">
                {section.points.map((point, pointIndex) => (
                  <li key={pointIndex}>
                    <span className="bullet">✓</span>

                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      {/* =================================================
          COMPLETE CARD
      ================================================= */}

      <div className={`completion-card ${completed ? "completion-done" : ""}`}>
        <div className="completion-info">
          <div className="completion-icon">
            <FaCheckCircle />
          </div>

          <div>
            <h3>{completed ? "Unit Completed" : "Finished studying?"}</h3>

            <p>
              {completed
                ? "You have completed this unit."
                : "Mark this unit as completed when you finish studying."}
            </p>
          </div>
        </div>

        <button
          className={`completion-button ${
            completed ? "completion-button-done" : ""
          }`}
          onClick={handleComplete}
        >
          {completed ? "Completed" : "Mark Complete"}
        </button>
      </div>

      <style>{styles}</style>
    </div>
  );
}

/* =========================================================
   STYLES
   ========================================================= */

const styles = `

/* =========================================================
   PAGE
   ========================================================= */

.notes-page {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  color: #FFFFFF;
  box-sizing: border-box;
  overflow-x: hidden;
}


/* =========================================================
   TOP BAR
   ========================================================= */

.notes-top-bar {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 28px;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 9px;

  background: transparent;
  border: none;

  color: #94A3B8;

  padding: 8px 0;

  font-size: 13px;
  font-weight: 600;

  cursor: pointer;

  transition: 0.2s;
}

.back-button:hover {
  color: #FFFFFF;
  transform: translateX(-2px);
}

.notes-actions {
  display: flex;
  align-items: center;
  gap: 9px;
}

.action-button {
  min-height: 42px;

  display: flex;
  align-items: center;
  justify-content: center;

  gap: 8px;

  padding: 10px 15px;

  border-radius: 10px;

  cursor: pointer;

  font-size: 12px;
  font-weight: 600;

  transition: 0.2s;
}

.bookmark-button {
  background: #0F172A;
  border: 1px solid #334155;
  color: #CBD5E1;
}

.bookmark-button:hover,
.bookmark-button.active {
  color: #A78BFA;
  border-color: #8B5CF6;
  background: #17112B;
}

.quiz-button {
  background: #8B5CF6;
  border: 1px solid #8B5CF6;
  color: #FFFFFF;
}

.quiz-button:hover {
  background: #7C3AED;
}


/* =========================================================
   HEADER
   ========================================================= */

.note-header {
  margin-bottom: 28px;
  max-width: 850px;
}

.unit-label {
  display: inline-flex;
  align-items: center;
  gap: 7px;

  color: #A78BFA;

  font-size: 11px;
  font-weight: 800;

  text-transform: uppercase;
  letter-spacing: 0.8px;

  margin-bottom: 10px;
}

.unit-label span {
  color: #475569;
}

.note-header h1 {
  margin: 0 0 11px;

  color: #FFFFFF;

  font-size: 32px;
  line-height: 1.25;
  font-weight: 800;

  overflow-wrap: anywhere;
}

.note-header p {
  margin: 0;

  color: #94A3B8;

  font-size: 14px;
  line-height: 1.7;
}


/* =========================================================
   NOTES CONTAINER
   ========================================================= */

.note-container {
  width: 100%;

  background: #0F172A;

  border: 1px solid #1E293B;

  border-radius: 18px;

  padding: 30px;

  box-sizing: border-box;

  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.12);
}

.note-section {
  padding-bottom: 26px;
  margin-bottom: 26px;

  border-bottom: 1px solid #1E293B;
}

.note-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.note-section h2 {
  display: flex;
  align-items: center;
  gap: 12px;

  margin: 0 0 13px;

  color: #FFFFFF;

  font-size: 19px;
  line-height: 1.4;

  font-weight: 700;
}

.section-number {
  min-width: 32px;
  height: 32px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  border-radius: 9px;

  background: #312E81;

  color: #A78BFA;

  font-size: 10px;
  font-weight: 800;

  flex-shrink: 0;
}

.note-text {
  margin: 0;

  color: #CBD5E1;

  font-size: 14px;
  line-height: 1.85;

  overflow-wrap: anywhere;
}

.note-list {
  display: flex;
  flex-direction: column;
  gap: 10px;

  padding: 0;
  margin: 0;

  list-style: none;
}

.note-list li {
  display: flex;
  align-items: flex-start;

  gap: 10px;

  color: #CBD5E1;

  font-size: 14px;
  line-height: 1.65;

  overflow-wrap: anywhere;
}

.bullet {
  width: 22px;
  height: 22px;

  min-width: 22px;

  display: flex;
  align-items: center;
  justify-content: center;

  margin-top: 1px;

  border-radius: 7px;

  background: #312E81;

  color: #A78BFA;

  font-size: 11px;
  font-weight: 800;
}


/* =========================================================
   COMPLETION
   ========================================================= */

.completion-card {
  width: 100%;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 20px;

  margin-top: 20px;
  padding: 20px;

  box-sizing: border-box;

  background: #0F172A;

  border: 1px solid #1E293B;

  border-radius: 16px;
}

.completion-done {
  border-color: #14532D;
  background: #0B1F19;
}

.completion-info {
  display: flex;
  align-items: center;

  gap: 13px;

  min-width: 0;
}

.completion-icon {
  width: 44px;
  height: 44px;

  min-width: 44px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 11px;

  background: #312E81;
  color: #A78BFA;

  font-size: 19px;
}

.completion-done .completion-icon {
  background: #065F46;
  color: #6EE7B7;
}

.completion-info h3 {
  margin: 0 0 4px;

  color: #FFFFFF;

  font-size: 14px;
}

.completion-info p {
  margin: 0;

  color: #64748B;

  font-size: 11px;
  line-height: 1.5;
}

.completion-button {
  min-height: 42px;

  padding: 10px 17px;

  background: #8B5CF6;

  border: none;
  border-radius: 10px;

  color: #FFFFFF;

  cursor: pointer;

  font-size: 12px;
  font-weight: 700;

  white-space: nowrap;

  transition: 0.2s;
}

.completion-button:hover {
  background: #7C3AED;
}

.completion-button-done {
  background: #065F46;
}

.completion-button-done:hover {
  background: #047857;
}


/* =========================================================
   NOT FOUND
   ========================================================= */

.not-found-card {
  min-height: 60vh;

  display: flex;
  flex-direction: column;

  align-items: center;
  justify-content: center;

  text-align: center;

  padding: 30px;
}

.not-found-icon {
  width: 65px;
  height: 65px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 18px;

  background: #1E293B;

  color: #64748B;

  font-size: 27px;

  margin-bottom: 18px;
}

.not-found-card h2 {
  margin: 0 0 8px;

  color: #FFFFFF;

  font-size: 22px;
}

.not-found-card p {
  max-width: 400px;

  margin: 0;

  color: #64748B;

  font-size: 14px;
  line-height: 1.6;
}

.primary-button {
  display: flex;
  align-items: center;
  justify-content: center;

  gap: 8px;

  margin-top: 20px;

  padding: 12px 18px;

  background: #8B5CF6;

  color: #FFFFFF;

  border: none;
  border-radius: 10px;

  cursor: pointer;

  font-weight: 700;
}

.primary-button:hover {
  background: #7C3AED;
}


/* =========================================================
   TABLET
   ========================================================= */

@media (max-width: 768px) {

  .notes-page {
    max-width: 100%;
  }

  .notes-top-bar {
    flex-direction: column;
    align-items: stretch;

    gap: 14px;

    margin-bottom: 22px;
  }

  .back-button {
    width: fit-content;
  }

  .notes-actions {
    width: 100%;

    display: grid;
    grid-template-columns: 1fr 1fr;

    gap: 9px;
  }

  .action-button {
    width: 100%;
    min-height: 44px;
  }

  .note-header {
    margin-bottom: 20px;
  }

  .note-header h1 {
    font-size: 25px;
    line-height: 1.3;
  }

  .note-header p {
    font-size: 13px;
  }

  .note-container {
    padding: 20px;
    border-radius: 15px;
  }

  .note-section {
    padding-bottom: 21px;
    margin-bottom: 21px;
  }

  .note-section h2 {
    font-size: 17px;
  }

  .note-text,
  .note-list li {
    font-size: 13px;
  }

  .completion-card {
    flex-direction: column;
    align-items: stretch;

    gap: 15px;

    padding: 17px;
  }

  .completion-button {
    width: 100%;
  }
}


/* =========================================================
   MOBILE
   ========================================================= */

@media (max-width: 480px) {

  .notes-top-bar {
    margin-bottom: 18px;
  }

  .back-button {
    font-size: 12px;
  }

  .notes-actions {
    grid-template-columns: 1fr 1fr;
  }

  .action-button {
    min-height: 43px;

    padding: 9px 7px;

    font-size: 11px;
  }

  .note-header {
    margin-bottom: 17px;
  }

  .unit-label {
    font-size: 9px;
  }

  .note-header h1 {
    font-size: 21px;
  }

  .note-header p {
    font-size: 12px;
    line-height: 1.65;
  }

  .note-container {
    padding: 16px;
    border-radius: 14px;
  }

  .note-section {
    padding-bottom: 18px;
    margin-bottom: 18px;
  }

  .note-section h2 {
    align-items: flex-start;

    gap: 9px;

    font-size: 15px;
  }

  .section-number {
    width: 28px;
    height: 28px;

    min-width: 28px;

    font-size: 9px;
  }

  .note-text,
  .note-list li {
    font-size: 12px;
    line-height: 1.7;
  }

  .bullet {
    width: 20px;
    height: 20px;

    min-width: 20px;

    font-size: 10px;
  }

  .completion-card {
    padding: 15px;
    border-radius: 14px;
  }

  .completion-icon {
    width: 40px;
    height: 40px;

    min-width: 40px;

    font-size: 17px;
  }

  .completion-info h3 {
    font-size: 13px;
  }

  .completion-info p {
    font-size: 10px;
  }

  .completion-button {
    min-height: 43px;

    font-size: 11px;
  }
}


/* =========================================================
   VERY SMALL PHONE
   ========================================================= */

@media (max-width: 360px) {

  .notes-actions {
    gap: 6px;
  }

  .action-button {
    font-size: 10px;
    padding: 8px 4px;
  }

  .note-header h1 {
    font-size: 19px;
  }

  .note-container {
    padding: 14px;
  }

  .note-section h2 {
    font-size: 14px;
  }

  .note-text,
  .note-list li {
    font-size: 11px;
  }
}

`;

export default Notes;
