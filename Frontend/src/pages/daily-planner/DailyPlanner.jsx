import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FaPlus,
  FaChevronLeft,
  FaChevronRight,
  FaCheck,
  FaEdit,
  FaTrash,
  FaTimes,
  FaClock,
  FaCalendarAlt,
} from "react-icons/fa";
import API_URL from "../../config/api";

const getToken = () => localStorage.getItem("sbec_token");

const formatDateForAPI = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatDisplayDate = (date) => {
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const initialForm = {
  title: "",
  description: "",
  date: "",
  startTime: "",
  endTime: "",
  priority: "Medium",
  category: "Study",
};

export default function DailyPlanner() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [plans, setPlans] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");

  const apiDate = formatDateForAPI(selectedDate);

  const todayDate = formatDateForAPI(new Date());

  const isToday = apiDate === todayDate;

  // --------------------------------------------------
  // Fetch daily plans
  // --------------------------------------------------

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        setError("Please login again.");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/daily-planner?date=${apiDate}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load planner.");
      }

      setPlans(data.plans || data.data || []);
    } catch (err) {
      console.error("Daily Planner Error:", err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [apiDate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPlans();
    }, 0);

    return () => clearTimeout(timer);
  }, [apiDate, fetchPlans]);
  // --------------------------------------------------
  // Date navigation
  // --------------------------------------------------

  const changeDate = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);

    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  // --------------------------------------------------
  // Progress
  // --------------------------------------------------

  const completedCount = plans.filter((plan) => plan.completed).length;

  const totalCount = plans.length;

  const pendingCount = totalCount - completedCount;

  const progress =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  // --------------------------------------------------
  // Sort plans by time
  // --------------------------------------------------

  const sortedPlans = useMemo(() => {
    return [...plans].sort((a, b) => {
      if (!a.startTime) return 1;
      if (!b.startTime) return -1;

      return a.startTime.localeCompare(b.startTime);
    });
  }, [plans]);

  // --------------------------------------------------
  // Form handling
  // --------------------------------------------------

  const openAddModal = () => {
    setEditingPlan(null);

    setForm({
      ...initialForm,
      date: apiDate,
    });

    setError("");
    setShowModal(true);
  };

  const openEditModal = (plan) => {
    setEditingPlan(plan);

    setForm({
      title: plan.title || "",
      description: plan.description || "",
      date: plan.date
        ? new Date(plan.date).toISOString().split("T")[0]
        : apiDate,
      startTime: plan.startTime || "",
      endTime: plan.endTime || "",
      priority: plan.priority || "Medium",
      category: plan.category || "Study",
    });

    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingPlan(null);
    setForm(initialForm);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // --------------------------------------------------
  // Add / Update
  // --------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      setError("Task title is required.");
      return;
    }

    if (!form.date) {
      setError("Please select a date.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const token = getToken();

      const url = editingPlan
        ? `${API_URL}/api/daily-planner/${editingPlan._id}`
        : `${API_URL}/api/daily-planner`;

      const response = await fetch(url, {
        method: editingPlan ? "PUT" : "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save task.");
      }

      setShowModal(false);
      setEditingPlan(null);
      setForm(initialForm);

      await fetchPlans();
    } catch (err) {
      console.error("Save Planner Error:", err);
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // Complete / Pending
  // --------------------------------------------------

  const toggleComplete = async (id) => {
    try {
      const token = getToken();

      const response = await fetch(
        `${API_URL}/api/daily-planner/${id}/complete`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update task.");
      }

      await fetchPlans();
    } catch (err) {
      console.error("Complete Error:", err);
      setError(err.message || "Unable to update task.");
    }
  };

  // --------------------------------------------------
  // Delete
  // --------------------------------------------------

  const deletePlan = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?",
    );

    if (!confirmed) return;

    try {
      const token = getToken();

      const response = await fetch(`${API_URL}/api/daily-planner/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete task.");
      }

      await fetchPlans();
    } catch (err) {
      console.error("Delete Error:", err);
      setError(err.message || "Unable to delete task.");
    }
  };

  // --------------------------------------------------
  // Priority class
  // --------------------------------------------------

  const getPriorityClass = (priority) => {
    if (priority === "High") return "priority-high";
    if (priority === "Low") return "priority-low";

    return "priority-medium";
  };

  return (
    <div className="daily-planner-page">
      <style>{`
        .daily-planner-page {
          min-height: 100vh;
          padding: 28px;
          color: #e5e7eb;
          background: #0f172a;
        }

        .planner-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 25px;
        }

        .planner-title h1 {
          margin: 0;
          font-size: 30px;
          font-weight: 700;
          color: #f8fafc;
        }

        .planner-title p {
          margin: 7px 0 0;
          color: #94a3b8;
          font-size: 14px;
        }

        .add-task-btn {
          display: flex;
          align-items: center;
          gap: 9px;
          border: none;
          border-radius: 10px;
          padding: 12px 18px;
          color: white;
          background: #8b5cf6;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s;
        }

        .add-task-btn:hover {
          background: #7c3aed;
          transform: translateY(-1px);
        }

        .date-navigation {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 16px;
          margin-bottom: 20px;
          border: 1px solid #1e293b;
          border-radius: 14px;
          background: #111c30;
        }

        .date-center {
          flex: 1;
          text-align: center;
}
        .date-center h2 {
          margin: 0;
          font-size: 18px;
          color: #f8fafc;
        }

        .date-center span {
          display: block;
          margin-top: 5px;
          font-size: 12px;
          color: #64748b;
        }

        .date-arrow {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #334155;
          border-radius: 9px;
          background: #0f172a;
          color: #cbd5e1;
          cursor: pointer;
        }

        .date-arrow:hover {
          border-color: #8b5cf6;
          color: #a78bfa;
        }

        .today-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-top: 10px;
          padding: 7px 12px;
          border: 1px solid #8b5cf6;
          border-radius: 8px;
          background: rgba(139, 92, 246, 0.08);
          color: #a78bfa;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s;
        }

        .today-btn:hover {
          background: #8b5cf6;
          color: white;
        }

        .progress-card {
          padding: 20px;
          margin-bottom: 25px;
          border: 1px solid #1e293b;
          border-radius: 14px;
          background: #111c30;
        }

        .progress-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .progress-top h3 {
          margin: 0;
          color: #f8fafc;
          font-size: 17px;
        }

        .progress-percent {
          color: #a78bfa;
          font-weight: 700;
        }

        .progress-bar {
          height: 9px;
          overflow: hidden;
          border-radius: 20px;
          background: #1e293b;
        }

        .progress-fill {
          height: 100%;
          border-radius: 20px;
          background: #8b5cf6;
          transition: width 0.3s ease;
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-top: 18px;
        }

        .stat {
          padding: 12px;
          border-radius: 10px;
          background: #0f172a;
          border: 1px solid #1e293b;
        }

        .stat strong {
          display: block;
          font-size: 20px;
          color: #f8fafc;
        }

        .stat span {
          font-size: 12px;
          color: #64748b;
        }

        .planner-content {
          position: relative;
        }

        .error-box {
          padding: 12px 15px;
          margin-bottom: 18px;
          border: 1px solid #7f1d1d;
          border-radius: 10px;
          background: #2b1215;
          color: #fca5a5;
          font-size: 13px;
        }

        .loading,
        .empty-state {
          padding: 60px 20px;
          text-align: center;
          border: 1px dashed #334155;
          border-radius: 14px;
          color: #64748b;
        }

        .empty-state h3 {
          margin: 0 0 8px;
          color: #cbd5e1;
        }

        .empty-state p {
          margin: 0 0 20px;
          font-size: 13px;
        }

        .timeline {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .timeline-item {
          display: grid;
          grid-template-columns: 90px 1fr;
          gap: 15px;
        }

        .timeline-time {
          padding-top: 20px;
          text-align: right;
          color: #94a3b8;
          font-size: 13px;
        }

        .task-card {
          padding: 18px;
          border: 1px solid #1e293b;
          border-radius: 14px;
          background: #111c30;
          transition: 0.2s;
        }

        .task-card:hover {
          border-color: #334155;
        }

        .task-card.completed {
          opacity: 0.7;
        }

        .task-main {
          display: flex;
          align-items: flex-start;
          gap: 13px;
        }

        .complete-btn {
          width: 25px;
          height: 25px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 1px;
          border: 1px solid #475569;
          border-radius: 50%;
          background: transparent;
          color: white;
          cursor: pointer;
        }

        .complete-btn.done {
          border-color: #8b5cf6;
          background: #8b5cf6;
        }

        .task-info {
          flex: 1;
          min-width: 0;
        }

        .task-title {
          margin: 0;
          font-size: 16px;
          color: #f8fafc;
          font-weight: 600;
        }

        .completed .task-title {
          text-decoration: line-through;
        }

        .task-description {
          margin: 7px 0 12px;
          color: #94a3b8;
          font-size: 13px;
          line-height: 1.5;
        }

        .task-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .meta-tag {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 8px;
          border-radius: 6px;
          background: #0f172a;
          color: #94a3b8;
          font-size: 11px;
        }

        .priority-high {
          color: #fca5a5;
        }

        .priority-medium {
          color: #fcd34d;
        }

        .priority-low {
          color: #86efac;
        }

        .task-actions {
          display: flex;
          gap: 7px;
          margin-left: auto;
        }

        .action-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #334155;
          border-radius: 7px;
          background: transparent;
          color: #94a3b8;
          cursor: pointer;
        }

        .action-btn:hover {
          border-color: #8b5cf6;
          color: #a78bfa;
        }

        .action-btn.delete:hover {
          border-color: #ef4444;
          color: #f87171;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(2, 6, 23, 0.78);
        }

        .modal {
          width: 100%;
          max-width: 560px;
          max-height: 90vh;
          overflow-y: auto;
          border: 1px solid #334155;
          border-radius: 16px;
          background: #111c30;
          box-shadow: 0 25px 60px rgba(0,0,0,0.45);
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px;
          border-bottom: 1px solid #1e293b;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 19px;
          color: #f8fafc;
        }

        .close-btn {
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          border-radius: 8px;
          background: transparent;
          color: #94a3b8;
          cursor: pointer;
        }

        .close-btn:hover {
          background: #1e293b;
          color: white;
        }

        .form {
          padding: 20px;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          margin-bottom: 7px;
          color: #cbd5e1;
          font-size: 13px;
          font-weight: 500;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #334155;
          border-radius: 9px;
          outline: none;
          padding: 11px 12px;
          background: #0f172a;
          color: #f8fafc;
          font-size: 13px;
        }

        .form-group textarea {
          min-height: 90px;
          resize: vertical;
        }

        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
          border-color: #8b5cf6;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding-top: 5px;
        }

        .cancel-btn,
        .save-btn {
          border-radius: 9px;
          padding: 11px 17px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }

        .cancel-btn {
          border: 1px solid #334155;
          background: transparent;
          color: #cbd5e1;
        }

        .save-btn {
          border: none;
          background: #8b5cf6;
          color: white;
        }

        .save-btn:hover {
          background: #7c3aed;
        }

        .save-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .daily-planner-page {
            padding: 20px 15px;
          }

          .planner-header {
            align-items: flex-start;
          }

          .planner-title h1 {
            font-size: 24px;
          }

          .add-task-btn {
            padding: 10px 13px;
          }

          .date-navigation {
            padding: 12px;
          }

          .stats {
            gap: 8px;
          }

          .timeline-item {
            grid-template-columns: 65px 1fr;
            gap: 10px;
          }

          .timeline-time {
            font-size: 11px;
          }
        }

        @media (max-width: 500px) {
          .planner-header {
            flex-direction: column;
          }

          .add-task-btn {
            width: 100%;
            justify-content: center;
          }

          .date-center h2 {
            font-size: 15px;
          }

          .today-btn {
            padding: 8px 9px;
            font-size: 11px;
          }

          .stats {
            grid-template-columns: 1fr;
          }

          .timeline-item {
            display: block;
          }

          .timeline-time {
            padding: 0 0 7px 3px;
            text-align: left;
          }

          .task-card {
            padding: 14px;
          }

          .task-main {
            gap: 9px;
          }

          .task-actions {
            margin-top: 12px;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .modal-overlay {
            padding: 10px;
          }

          .modal {
            max-height: 95vh;
          }
        }
      `}</style>

      {/* Header */}
      <div className="planner-header">
        <div className="planner-title">
          <h1>Daily Planner</h1>
          <p>Plan your day and stay productive.</p>
        </div>

        <button className="add-task-btn" onClick={openAddModal}>
          <FaPlus />
          Add Task
        </button>
      </div>

      {/* Date Navigation */}
      <div className="date-navigation">
        <button
          className="date-arrow"
          onClick={() => changeDate(-1)}
          title="Previous day"
        >
          <FaChevronLeft />
        </button>

        <div className="date-center">
          <h2>{formatDisplayDate(selectedDate)}</h2>

          <span>{apiDate}</span>

          {!isToday && (
            <button className="today-btn" onClick={goToToday}>
              Go to Today
            </button>
          )}
        </div>

        <button
          className="date-arrow"
          onClick={() => changeDate(1)}
          title="Next day"
        >
          <FaChevronRight />
        </button>
      </div>

      {/* Progress */}
      <div className="progress-card">
        <div className="progress-top">
          <h3>{isToday ? "Today's Progress" : "Progress for this day"}</h3>

          <span className="progress-percent">{progress}%</span>
        </div>

        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="stats">
          <div className="stat">
            <strong>{totalCount}</strong>
            <span>Total Tasks</span>
          </div>

          <div className="stat">
            <strong>{completedCount}</strong>
            <span>Completed</span>
          </div>

          <div className="stat">
            <strong>{pendingCount}</strong>
            <span>Pending</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="planner-content">
        {error && <div className="error-box">{error}</div>}

        {loading ? (
          <div className="loading">Loading your daily planner...</div>
        ) : sortedPlans.length === 0 ? (
          <div className="empty-state">
            <h3>No tasks planned</h3>

            <p>You don't have any tasks for this day.</p>

            <button className="add-task-btn" onClick={openAddModal}>
              <FaPlus />
              Add Your First Task
            </button>
          </div>
        ) : (
          <div className="timeline">
            {sortedPlans.map((plan) => (
              <div className="timeline-item" key={plan._id}>
                <div className="timeline-time">
                  {plan.startTime || "Anytime"}
                </div>

                <div
                  className={`task-card ${plan.completed ? "completed" : ""}`}
                >
                  <div className="task-main">
                    <button
                      className={`complete-btn ${plan.completed ? "done" : ""}`}
                      onClick={() => toggleComplete(plan._id)}
                      title={plan.completed ? "Mark pending" : "Mark complete"}
                    >
                      {plan.completed && <FaCheck size={11} />}
                    </button>

                    <div className="task-info">
                      <h3 className="task-title">{plan.title}</h3>

                      {plan.description && (
                        <p className="task-description">{plan.description}</p>
                      )}

                      <div className="task-meta">
                        {plan.startTime && (
                          <span className="meta-tag">
                            <FaClock />
                            {plan.startTime}
                            {plan.endTime ? ` - ${plan.endTime}` : ""}
                          </span>
                        )}

                        <span className="meta-tag">{plan.category}</span>

                        <span
                          className={`meta-tag ${getPriorityClass(
                            plan.priority,
                          )}`}
                        >
                          {plan.priority} Priority
                        </span>
                      </div>
                    </div>

                    <div className="task-actions">
                      <button
                        className="action-btn"
                        onClick={() => openEditModal(plan)}
                        title="Edit"
                      >
                        <FaEdit size={13} />
                      </button>

                      <button
                        className="action-btn delete"
                        onClick={() => deletePlan(plan._id)}
                        title="Delete"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingPlan ? "Edit Task" : "Add New Task"}</h2>

              <button className="close-btn" onClick={closeModal}>
                <FaTimes />
              </button>
            </div>

            <form className="form" onSubmit={handleSubmit}>
              {error && <div className="error-box">{error}</div>}

              <div className="form-group">
                <label>Task Title *</label>

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Study React"
                  maxLength={150}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Add some details..."
                  maxLength={500}
                />
              </div>

              <div className="form-group">
                <label>
                  <FaCalendarAlt size={11} /> Date *
                </label>

                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Time</label>

                  <input
                    type="time"
                    name="startTime"
                    value={form.startTime}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>End Time</label>

                  <input
                    type="time"
                    name="endTime"
                    value={form.endTime}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Priority</label>

                  <select
                    name="priority"
                    value={form.priority}
                    onChange={handleChange}
                  >
                    <option value="Low">Low</option>

                    <option value="Medium">Medium</option>

                    <option value="High">High</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Category</label>

                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                  >
                    <option value="Study">Study</option>

                    <option value="Assignment">Assignment</option>

                    <option value="Revision">Revision</option>

                    <option value="Personal">Personal</option>

                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button type="submit" className="save-btn" disabled={saving}>
                  {saving
                    ? "Saving..."
                    : editingPlan
                      ? "Update Task"
                      : "Add Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
