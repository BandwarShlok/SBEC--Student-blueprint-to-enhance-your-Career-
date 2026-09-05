import { useEffect, useMemo, useState } from "react";
import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaQuestionCircle,
  FaSyncAlt,
  FaCheck,
  FaTimes,
} from "react-icons/fa";

import API_URL from "../../../config/api";

// Normalize the API base so this works whether config/api.js exports:
//   http://HOST:5000
// or:
//   http://HOST:5000/api
const API_ROOT = String(API_URL || "").replace(/\/+$/, "");

const API_BASE_URL = API_ROOT.endsWith("/api") ? API_ROOT : `${API_ROOT}/api`;

const QUIZ_API = `${API_BASE_URL}/admin/quiz`;

// Admin authentication token used by the rest of the admin panel.
const getAdminHeaders = (includeJson = false) => {
  const token = localStorage.getItem("admin_token");

  return {
    ...(includeJson ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Safely parse API responses, including non-JSON error responses.
const readApiResponse = async (response) => {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

const EMPTY_FORM = {
  question: "",
  subject: "",
  unit: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  answer: "",
};

function AdminQuiz() {
  const [questions, setQuestions] = useState([]);

  const [subjects, setSubjects] = useState([]);

  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState(EMPTY_FORM);

  const [loading, setLoading] = useState(false);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  /*
  ====================================================
  FETCH QUESTIONS
  ====================================================
  */

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(QUIZ_API, {
        method: "GET",
        headers: getAdminHeaders(),
      });

      const data = await readApiResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Failed to load quiz questions.");
      }

      /*
      Support different backend response formats.
      */

      const list = data.questions || data.quizQuestions || data.data || [];

      setQuestions(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("FETCH QUIZ ERROR:", err);

      setError(err.message || "Unable to connect to the quiz server.");
    } finally {
      setLoading(false);
    }
  };

  /*
  ====================================================
  FETCH SUBJECTS
  ====================================================
  */

  const fetchSubjects = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/subjects`, {
        method: "GET",
        headers: getAdminHeaders(),
      });

      const data = await readApiResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Failed to load subjects.");
      }

      setSubjects(Array.isArray(data.subjects) ? data.subjects : []);
    } catch (err) {
      console.error("FETCH SUBJECTS ERROR:", err);
      setError(err.message || "Unable to load subjects.");
    }
  };

  const getSelectedSubject = () => {
    return subjects.find((subject) => subject.name === formData.subject);
  };

  const selectedSubject = getSelectedSubject();

  const selectedUnits = Array.isArray(selectedSubject?.units)
    ? selectedSubject.units
    : [];

  /*
  ====================================================
  INITIAL LOAD

  setTimeout prevents the React hooks lint error:
  "Calling setState synchronously within an effect..."
  ====================================================
  */

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchQuestions();
      fetchSubjects();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  /*
  ====================================================
  FORM CHANGE
  ====================================================
  */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
      ...(name === "subject" ? { unit: "" } : {}),
    }));
  };

  /*
  ====================================================
  OPEN ADD FORM
  ====================================================
  */

  const openAddForm = () => {
    setEditingId(null);

    setFormData(EMPTY_FORM);

    setError("");

    setShowForm(true);
  };

  /*
  ====================================================
  CLOSE FORM
  ====================================================
  */

  const closeForm = () => {
    setShowForm(false);

    setEditingId(null);

    setFormData(EMPTY_FORM);
  };

  /*
  ====================================================
  ADD / UPDATE QUESTION
  ====================================================
  */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !formData.question.trim() ||
      !formData.subject.trim() ||
      !formData.unit.trim() ||
      !formData.optionA.trim() ||
      !formData.optionB.trim() ||
      !formData.optionC.trim() ||
      !formData.optionD.trim() ||
      !formData.answer
    ) {
      setError("Please fill all fields.");

      return;
    }

    try {
      setSaving(true);

      setError("");

      const isEditing = Boolean(editingId);

      const url = isEditing ? `${QUIZ_API}/${editingId}` : QUIZ_API;

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: getAdminHeaders(true),
        body: JSON.stringify({
          question: formData.question.trim(),
          subject: formData.subject.trim(),
          unit: formData.unit.trim(),
          optionA: formData.optionA.trim(),
          optionB: formData.optionB.trim(),
          optionC: formData.optionC.trim(),
          optionD: formData.optionD.trim(),
          answer: formData.answer,
        }),
      });

      const data = await readApiResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Unable to save the question.");
      }

      closeForm();

      await fetchQuestions();
    } catch (err) {
      console.error("SAVE QUIZ ERROR:", err);

      setError(err.message || "Unable to save the question.");
    } finally {
      setSaving(false);
    }
  };

  /*
  ====================================================
  EDIT QUESTION
  ====================================================
  */

  const handleEdit = (item) => {
    const id = item._id || item.id;

    setEditingId(id);

    setFormData({
      question: item.question || "",
      subject: item.subject || "",
      unit: item.unit || "",
      optionA: item.optionA || "",
      optionB: item.optionB || "",
      optionC: item.optionC || "",
      optionD: item.optionD || "",
      answer: item.answer || "",
    });

    setError("");

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /*
  ====================================================
  DELETE QUESTION
  ====================================================
  */

  const handleDelete = async (item) => {
    const id = item._id || item.id;

    if (!id) {
      alert("Question ID not found.");

      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this question?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const response = await fetch(`${QUIZ_API}/${id}`, {
        method: "DELETE",
        headers: getAdminHeaders(),
      });

      const data = await readApiResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete question.");
      }

      /*
      Remove immediately from UI.
      */

      setQuestions((previous) =>
        previous.filter((question) => (question._id || question.id) !== id),
      );
    } catch (err) {
      console.error("DELETE QUIZ ERROR:", err);

      setError(err.message || "Unable to delete question.");
    }
  };

  /*
  ====================================================
  SEARCH
  ====================================================
  */

  const filteredQuestions = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return questions;
    }

    return questions.filter((item) =>
      [
        item.question,
        item.subject,
        item.unit,
        item.optionA,
        item.optionB,
        item.optionC,
        item.optionD,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(value),
    );
  }, [questions, search]);

  /*
  ====================================================
  UNIQUE SUBJECTS
  ====================================================
  */

  const subjectCount = useMemo(() => {
    return new Set(questions.map((item) => item.subject).filter(Boolean)).size;
  }, [questions]);

  /*
  ====================================================
  RENDER
  ====================================================
  */

  return (
    <div className="quiz-page">
      {/* ==================================================
          RESPONSIVE CSS
      ================================================== */}

      <style>
        {`

        * {
          box-sizing: border-box;
        }

        .quiz-page {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          color: #ffffff;
          overflow-x: hidden;
        }

        /* ============================
           HEADER
        ============================ */

        .quiz-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 28px;
        }

        .quiz-header-text {
          min-width: 0;
        }

        .quiz-title {
          margin: 0;
          color: #ffffff;
          font-size: 38px;
          line-height: 1.15;
          font-weight: 800;
        }

        .quiz-subtitle {
          margin: 8px 0 0;
          color: #64748b;
          font-size: 15px;
          line-height: 1.6;
        }

        .quiz-header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        .quiz-refresh-button,
        .quiz-add-button {
          min-height: 54px;
          border-radius: 14px;
          padding: 0 22px;
          border: 1px solid #334155;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
          font-size: 15px;
          font-weight: 700;
          transition: 0.2s ease;
        }

        .quiz-refresh-button {
          background: #111b30;
          color: #cbd5e1;
        }

        .quiz-refresh-button:hover {
          background: #1e293b;
        }

        .quiz-add-button {
          background: linear-gradient(
            135deg,
            #7c3aed,
            #8b5cf6
          );
          color: #ffffff;
          border: none;
        }

        .quiz-add-button:hover {
          transform: translateY(-1px);
          box-shadow:
            0 10px 25px rgba(139, 92, 246, 0.25);
        }

        /* ============================
           ERROR
        ============================ */

        .quiz-error {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          background: #450a0a;
          border: 1px solid #7f1d1d;
          color: #fecaca;
          padding: 13px 15px;
          border-radius: 12px;
          margin-bottom: 18px;
          font-size: 13px;
        }

        .quiz-error-close {
          border: none;
          background: transparent;
          color: #fecaca;
          cursor: pointer;
          font-size: 16px;
        }

        /* ============================
           STATS
        ============================ */

        .quiz-stats {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .quiz-stat-card {
          min-width: 0;
          min-height: 145px;
          background: #0f172a;
          border: 1px solid #1e293b;
          border-radius: 18px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .quiz-stat-icon {
          width: 64px;
          height: 64px;
          min-width: 64px;
          border-radius: 17px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 27px;
          background: #312e81;
          color: #a78bfa;
        }

        .quiz-stat-icon.green {
          background: #064e3b;
          color: #6ee7b7;
        }

        .quiz-stat-icon.blue {
          background: #172554;
          color: #93c5fd;
        }

        .quiz-stat-label {
          color: #94a3b8;
          font-size: 14px;
          margin-bottom: 4px;
        }

        .quiz-stat-value {
          color: #ffffff;
          font-size: 34px;
          line-height: 1;
          font-weight: 800;
        }

        .quiz-stat-description {
          color: #64748b;
          font-size: 11px;
          margin-top: 7px;
        }

        /* ============================
           MAIN CARD
        ============================ */

        .quiz-card {
          width: 100%;
          background: #0f172a;
          border: 1px solid #1e293b;
          border-radius: 20px;
          padding: 24px;
          overflow: hidden;
        }

        .quiz-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 22px;
        }

        .quiz-card-title {
          margin: 0;
          color: #ffffff;
          font-size: 24px;
          line-height: 1.25;
          font-weight: 800;
        }

        .quiz-card-subtitle {
          margin: 7px 0 0;
          color: #64748b;
          font-size: 13px;
        }

        /* ============================
           SEARCH
        ============================ */

        .quiz-search {
          width: 300px;
          max-width: 100%;
          min-height: 52px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 14px;
          background: #020617;
          border: 1px solid #334155;
          border-radius: 12px;
          flex-shrink: 0;
        }

        .quiz-search-icon {
          color: #64748b;
          font-size: 15px;
          flex-shrink: 0;
        }

        .quiz-search-input {
          width: 100%;
          min-width: 0;
          border: none;
          outline: none;
          background: transparent;
          color: #ffffff;
          font-size: 14px;
        }

        .quiz-search-input::placeholder {
          color: #64748b;
        }

        /* ============================
           QUESTIONS
        ============================ */

        .quiz-question-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .quiz-question-card {
          width: 100%;
          background: #020617;
          border: 1px solid #1e293b;
          border-radius: 15px;
          padding: 18px;
          overflow: hidden;
        }

        .quiz-question-top {
          display: flex;
          align-items: flex-start;
          gap: 13px;
        }

        .quiz-question-number {
          width: 40px;
          height: 40px;
          min-width: 40px;
          border-radius: 10px;
          background: #312e81;
          color: #a78bfa;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 14px;
        }

        .quiz-question-content {
          flex: 1;
          min-width: 0;
        }

        .quiz-question-title {
          margin: 2px 0 9px;
          color: #ffffff;
          font-size: 17px;
          line-height: 1.45;
          font-weight: 700;
          overflow-wrap: anywhere;
        }

        .quiz-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
        }

        .quiz-meta span {
          background: #1e293b;
          color: #94a3b8;
          padding: 5px 9px;
          border-radius: 7px;
          font-size: 10px;
        }

        .quiz-question-actions {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }

        .quiz-edit-button,
        .quiz-delete-button {
          width: 42px;
          height: 42px;
          border: none;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 15px;
        }

        .quiz-edit-button {
          background: #1e293b;
          color: #a78bfa;
        }

        .quiz-delete-button {
          background: #450a0a;
          color: #fca5a5;
        }

        .quiz-edit-button:hover {
          background: #312e81;
        }

        .quiz-delete-button:hover {
          background: #7f1d1d;
        }

        /* ============================
           OPTIONS
        ============================ */

        .quiz-options {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 9px;
          margin-top: 17px;
        }

        .quiz-option {
          min-width: 0;
          display: flex;
          align-items: flex-start;
          gap: 9px;
          background: #0f172a;
          border: 1px solid #1e293b;
          border-radius: 9px;
          padding: 10px;
          color: #94a3b8;
          font-size: 12px;
          line-height: 1.45;
          overflow-wrap: anywhere;
        }

        .quiz-option.correct {
          border-color: #065f46;
          background: #052e2b;
          color: #a7f3d0;
        }

        .quiz-option-label {
          width: 23px;
          height: 23px;
          min-width: 23px;
          border-radius: 6px;
          background: #1e293b;
          color: #a78bfa;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 800;
        }

        .quiz-option.correct .quiz-option-label {
          background: #065f46;
          color: #6ee7b7;
        }

        .quiz-answer {
          margin-top: 13px;
          color: #64748b;
          font-size: 11px;
        }

        .quiz-answer strong {
          color: #6ee7b7;
        }

        /* ============================
           LOADING
        ============================ */

        .quiz-loading {
          padding: 50px 20px;
          text-align: center;
          color: #64748b;
          font-size: 14px;
        }

        .quiz-loading-icon {
          animation: quiz-spin 1s linear infinite;
          margin-right: 8px;
        }

        @keyframes quiz-spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        /* ============================
           EMPTY
        ============================ */

        .quiz-empty {
          padding: 55px 20px;
          text-align: center;
          color: #64748b;
        }

        .quiz-empty-icon {
          font-size: 35px;
          color: #475569;
          margin-bottom: 12px;
        }

        .quiz-empty p {
          margin: 0;
          font-size: 13px;
        }

        /* ============================
           FORM
        ============================ */

        .quiz-form-card {
          width: 100%;
          background: #0f172a;
          border: 1px solid #312e81;
          border-radius: 18px;
          padding: 22px;
          margin-bottom: 22px;
        }

        .quiz-form-title {
          margin: 0;
          color: #ffffff;
          font-size: 20px;
          font-weight: 800;
        }

        .quiz-form-subtitle {
          color: #64748b;
          font-size: 12px;
          margin: 6px 0 20px;
        }

        .quiz-form {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 15px;
        }

        .quiz-field {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .quiz-full-field {
          grid-column: 1 / -1;
        }

        .quiz-label {
          color: #cbd5e1;
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 7px;
        }

        .quiz-input,
        .quiz-textarea,
        .quiz-select {
          width: 100%;
          min-width: 0;
          background: #020617;
          border: 1px solid #334155;
          border-radius: 10px;
          color: #ffffff;
          padding: 12px;
          outline: none;
          font-family: inherit;
          font-size: 13px;
        }

        .quiz-input:focus,
        .quiz-textarea:focus,
        .quiz-select:focus {
          border-color: #8b5cf6;
          box-shadow:
            0 0 0 3px rgba(139, 92, 246, 0.1);
        }

        .quiz-textarea {
          resize: vertical;
          min-height: 95px;
        }

        .quiz-select option {
          background: #020617;
          color: #ffffff;
        }

        .quiz-form-actions {
          grid-column: 1 / -1;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 5px;
        }

        .quiz-cancel-button,
        .quiz-save-button {
          min-height: 44px;
          padding: 0 17px;
          border-radius: 9px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 700;
        }

        .quiz-cancel-button {
          background: #1e293b;
          color: #cbd5e1;
        }

        .quiz-save-button {
          background: #8b5cf6;
          color: #ffffff;
        }

        .quiz-save-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* ============================
           TABLET
        ============================ */

        @media (max-width: 900px) {

          .quiz-header {
            flex-direction: column;
            align-items: stretch;
          }

          .quiz-header-actions {
            width: 100%;
          }

          .quiz-refresh-button,
          .quiz-add-button {
            flex: 1;
          }

          .quiz-stats {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

          .quiz-card-header {
            flex-direction: column;
          }

          .quiz-search {
            width: 100%;
          }
        }

        /* ============================
           MOBILE
        ============================ */

        @media (max-width: 768px) {

          .quiz-page {
            width: 100%;
            max-width: 100%;
            padding: 0;
          }

          .quiz-header {
            gap: 16px;
            margin-bottom: 22px;
          }

          .quiz-title {
            font-size: 31px;
          }

          .quiz-subtitle {
            font-size: 13px;
            max-width: 320px;
          }

          .quiz-header-actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }

          .quiz-refresh-button,
          .quiz-add-button {
            width: 100%;
            min-width: 0;
            padding: 0 10px;
            min-height: 50px;
            font-size: 13px;
          }

          .quiz-stats {
            grid-template-columns: 1fr;
            gap: 11px;
          }

          .quiz-stat-card {
            width: 100%;
            min-height: 105px;
            padding: 16px;
            border-radius: 15px;
          }

          .quiz-stat-icon {
            width: 54px;
            height: 54px;
            min-width: 54px;
            font-size: 22px;
          }

          .quiz-stat-value {
            font-size: 29px;
          }

          .quiz-stat-label {
            font-size: 13px;
          }

          .quiz-card {
            padding: 15px;
            border-radius: 16px;
          }

          .quiz-card-header {
            gap: 13px;
          }

          .quiz-card-title {
            font-size: 23px;
          }

          .quiz-search {
            width: 100%;
            min-height: 50px;
          }

          .quiz-question-card {
            padding: 14px;
            border-radius: 13px;
          }

          .quiz-question-top {
            display: grid;
            grid-template-columns:
              38px minmax(0, 1fr);
            gap: 10px;
          }

          .quiz-question-number {
            width: 38px;
            height: 38px;
            min-width: 38px;
          }

          .quiz-question-title {
            font-size: 14px;
          }

          .quiz-question-actions {
            grid-column: 1 / -1;
            width: 100%;
            display: grid;
            grid-template-columns: 1fr 1fr;
          }

          .quiz-edit-button,
          .quiz-delete-button {
            width: 100%;
            height: 40px;
          }

          .quiz-options {
            grid-template-columns: 1fr;
          }

          .quiz-form-card {
            padding: 16px;
          }

          .quiz-form {
            grid-template-columns: 1fr;
          }

          .quiz-full-field {
            grid-column: auto;
          }

          .quiz-form-actions {
            grid-column: auto;
            display: grid;
            grid-template-columns: 1fr 1fr;
          }

          .quiz-cancel-button,
          .quiz-save-button {
            width: 100%;
          }
        }

        /* ============================
           SMALL PHONE
        ============================ */

        @media (max-width: 420px) {

          .quiz-title {
            font-size: 28px;
          }

          .quiz-header-actions {
            grid-template-columns: 1fr;
          }

          .quiz-stat-card {
            min-height: 95px;
          }

          .quiz-card {
            padding: 12px;
          }

          .quiz-card-title {
            font-size: 21px;
          }

          .quiz-question-card {
            padding: 12px;
          }

          .quiz-question-title {
            font-size: 13px;
          }

          .quiz-form-actions {
            grid-template-columns: 1fr;
          }
        }

        `}
      </style>

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="quiz-header">
        <div className="quiz-header-text">
          <h1 className="quiz-title">Quiz Questions</h1>

          <p className="quiz-subtitle">
            Create and manage quiz questions for students.
          </p>
        </div>

        <div className="quiz-header-actions">
          <button
            type="button"
            className="quiz-refresh-button"
            onClick={fetchQuestions}
            disabled={loading}
          >
            <FaSyncAlt className={loading ? "quiz-loading-icon" : ""} />

            {loading ? "Loading..." : "Refresh"}
          </button>

          <button
            type="button"
            className="quiz-add-button"
            onClick={openAddForm}
          >
            <FaPlus />
            Add Question
          </button>
        </div>
      </div>

      {/* ==================================================
          ERROR
      ================================================== */}

      {error && (
        <div className="quiz-error">
          <span>{error}</span>

          <button className="quiz-error-close" onClick={() => setError("")}>
            <FaTimes />
          </button>
        </div>
      )}

      {/* ==================================================
          STATS
      ================================================== */}

      <div className="quiz-stats">
        <div className="quiz-stat-card">
          <div className="quiz-stat-icon">
            <FaQuestionCircle />
          </div>

          <div>
            <div className="quiz-stat-label">Total Questions</div>

            <div className="quiz-stat-value">{questions.length}</div>

            <div className="quiz-stat-description">All quiz questions</div>
          </div>
        </div>

        <div className="quiz-stat-card">
          <div className="quiz-stat-icon green">
            <FaCheck />
          </div>

          <div>
            <div className="quiz-stat-label">Showing</div>

            <div className="quiz-stat-value">{filteredQuestions.length}</div>

            <div className="quiz-stat-description">Filtered questions</div>
          </div>
        </div>

        <div className="quiz-stat-card">
          <div className="quiz-stat-icon blue">
            <FaQuestionCircle />
          </div>

          <div>
            <div className="quiz-stat-label">Subjects</div>

            <div className="quiz-stat-value">{subjectCount}</div>

            <div className="quiz-stat-description">Subjects covered</div>
          </div>
        </div>
      </div>

      {/* ==================================================
          ADD / EDIT FORM
      ================================================== */}

      {showForm && (
        <div className="quiz-form-card">
          <h2 className="quiz-form-title">
            {editingId ? "Edit Quiz Question" : "Add Quiz Question"}
          </h2>

          <p className="quiz-form-subtitle">
            Enter the question, options and correct answer.
          </p>

          <form className="quiz-form" onSubmit={handleSubmit}>
            {/* QUESTION */}

            <div className="quiz-field quiz-full-field">
              <label className="quiz-label">Question</label>

              <textarea
                className="quiz-textarea"
                name="question"
                value={formData.question}
                onChange={handleChange}
                placeholder="Enter quiz question"
                rows="4"
              />
            </div>

            {/* SUBJECT */}

            <div className="quiz-field">
              <label className="quiz-label">Subject</label>

              <select
                className="quiz-select"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
              >
                <option value="">Select Subject</option>

                {subjects.map((subject) => (
                  <option key={subject._id} value={subject.name}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            {/* UNIT */}

            <div className="quiz-field">
              <label className="quiz-label">Unit</label>

              <select
                className="quiz-select"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                disabled={!formData.subject || selectedUnits.length === 0}
              >
                <option value="">
                  {!formData.subject
                    ? "Select Subject First"
                    : selectedUnits.length === 0
                      ? "No Units Available"
                      : "Select Unit"}
                </option>

                {selectedUnits.map((unit) => (
                  <option key={unit._id || unit.name} value={unit.name}>
                    {unit.name}
                  </option>
                ))}

                {/* Keep an existing unit selectable while editing if it is
                    not present in the current subject configuration. */}
                {editingId &&
                  formData.unit &&
                  !selectedUnits.some(
                    (unit) => unit.name === formData.unit,
                  ) && <option value={formData.unit}>{formData.unit}</option>}
              </select>
            </div>

            {/* OPTION A */}

            <div className="quiz-field">
              <label className="quiz-label">Option A</label>

              <input
                className="quiz-input"
                type="text"
                name="optionA"
                value={formData.optionA}
                onChange={handleChange}
                placeholder="Enter option A"
              />
            </div>

            {/* OPTION B */}

            <div className="quiz-field">
              <label className="quiz-label">Option B</label>

              <input
                className="quiz-input"
                type="text"
                name="optionB"
                value={formData.optionB}
                onChange={handleChange}
                placeholder="Enter option B"
              />
            </div>

            {/* OPTION C */}

            <div className="quiz-field">
              <label className="quiz-label">Option C</label>

              <input
                className="quiz-input"
                type="text"
                name="optionC"
                value={formData.optionC}
                onChange={handleChange}
                placeholder="Enter option C"
              />
            </div>

            {/* OPTION D */}

            <div className="quiz-field">
              <label className="quiz-label">Option D</label>

              <input
                className="quiz-input"
                type="text"
                name="optionD"
                value={formData.optionD}
                onChange={handleChange}
                placeholder="Enter option D"
              />
            </div>

            {/* ANSWER */}

            <div className="quiz-field">
              <label className="quiz-label">Correct Answer</label>

              <select
                className="quiz-select"
                name="answer"
                value={formData.answer}
                onChange={handleChange}
              >
                <option value="">Select Answer</option>

                <option value="A">Option A</option>

                <option value="B">Option B</option>

                <option value="C">Option C</option>

                <option value="D">Option D</option>
              </select>
            </div>

            {/* ACTIONS */}

            <div className="quiz-form-actions">
              <button
                type="button"
                className="quiz-cancel-button"
                onClick={closeForm}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="quiz-save-button"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <FaSyncAlt className="quiz-loading-icon" />
                    Saving...
                  </>
                ) : (
                  <>
                    {editingId ? <FaEdit /> : <FaPlus />}

                    {editingId ? "Update Question" : "Add Question"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ==================================================
          ALL QUESTIONS
      ================================================== */}

      <div className="quiz-card">
        <div className="quiz-card-header">
          <div>
            <h2 className="quiz-card-title">All Questions</h2>

            <p className="quiz-card-subtitle">
              {questions.length}{" "}
              {questions.length === 1 ? "question" : "questions"} available
            </p>
          </div>

          <div className="quiz-search">
            <FaSearch className="quiz-search-icon" />

            <input
              className="quiz-search-input"
              type="text"
              placeholder="Search questions..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        {/* ==================================================
            LOADING
        ================================================== */}

        {loading && questions.length === 0 ? (
          <div className="quiz-loading">
            <FaSyncAlt className="quiz-loading-icon" />
            Loading questions...
          </div>
        ) : filteredQuestions.length === 0 ? (
          /* ==================================================
              EMPTY
          ================================================== */

          <div className="quiz-empty">
            <FaQuestionCircle className="quiz-empty-icon" />

            <p>
              {search
                ? "No questions match your search."
                : "No quiz questions available."}
            </p>
          </div>
        ) : (
          /* ==================================================
              QUESTION LIST
          ================================================== */

          <div className="quiz-question-list">
            {filteredQuestions.map((item, index) => {
              const itemId = item._id || item.id;

              const correctAnswer = String(item.answer || "").toUpperCase();

              return (
                <div key={itemId} className="quiz-question-card">
                  {/* QUESTION TOP */}

                  <div className="quiz-question-top">
                    <div className="quiz-question-number">{index + 1}</div>

                    <div className="quiz-question-content">
                      <h3 className="quiz-question-title">{item.question}</h3>

                      <div className="quiz-meta">
                        {item.subject && <span>{item.subject}</span>}

                        {item.unit && <span>{item.unit}</span>}
                      </div>
                    </div>

                    {/* ACTIONS */}

                    <div className="quiz-question-actions">
                      <button
                        type="button"
                        className="quiz-edit-button"
                        title="Edit question"
                        onClick={() => handleEdit(item)}
                      >
                        <FaEdit />
                      </button>

                      <button
                        type="button"
                        className="quiz-delete-button"
                        title="Delete question"
                        onClick={() => handleDelete(item)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>

                  {/* OPTIONS */}

                  <div className="quiz-options">
                    <div
                      className={`quiz-option ${
                        correctAnswer === "A" ? "correct" : ""
                      }`}
                    >
                      <span className="quiz-option-label">A</span>

                      <span>{item.optionA}</span>
                    </div>

                    <div
                      className={`quiz-option ${
                        correctAnswer === "B" ? "correct" : ""
                      }`}
                    >
                      <span className="quiz-option-label">B</span>

                      <span>{item.optionB}</span>
                    </div>

                    <div
                      className={`quiz-option ${
                        correctAnswer === "C" ? "correct" : ""
                      }`}
                    >
                      <span className="quiz-option-label">C</span>

                      <span>{item.optionC}</span>
                    </div>

                    <div
                      className={`quiz-option ${
                        correctAnswer === "D" ? "correct" : ""
                      }`}
                    >
                      <span className="quiz-option-label">D</span>

                      <span>{item.optionD}</span>
                    </div>
                  </div>

                  {/* ANSWER */}

                  <div className="quiz-answer">
                    Correct Answer:{" "}
                    <strong>Option {correctAnswer || "-"}</strong>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminQuiz;
