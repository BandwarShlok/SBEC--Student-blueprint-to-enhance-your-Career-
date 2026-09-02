import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import AdminLogin from "../pages/admin/auth/AdminLogin";

import ProtectedRoute from "./ProtectedRoute";
import AdminProtectedRoute from "./AdminProtectedRoute";
import MainLayout from "../layouts/MainLayout";
import AdminLayout from "../layouts/AdminLayout";

/* =========================================================
   ADMIN
========================================================= */

import AdminDashboard from "../pages/admin/dashboard/AdminDashboard";
import Students from "../pages/admin/students/Students";
import StudentDetails from "../pages/admin/students/StudentDetails";
import AdminSubjects from "../pages/admin/subjects/AdminSubjects";
import AdminNotes from "../pages/admin/notes/AdminNotes";
import AdminPapers from "../pages/admin/papers/AdminPapers";
import AdminQuiz from "../pages/admin/quiz/AdminQuiz";
import AdminWeeklyTests from "../pages/admin/weeklyTests/AdminWeeklyTests";
import AdminExams from "../pages/admin/exams/AdminExams";
import AdminSettings from "../pages/admin/settings/AdminSettings";

/* =========================================================
   ADMIN DAILY PLANNER
========================================================= */

import AdminDailyPlanner from "../pages/admin/dailyPlanner/AdminDailyPlanner";
import AdminPlannerActivity from "../pages/admin/dailyPlanner/AdminPlannerActivity";

/* =========================================================
   STUDENT
========================================================= */

import Dashboard from "../components/Dashboard";
import Subjects from "../pages/subjects/Subjects";
import Profile from "../pages/profile/Profile";
import SubjectDetails from "../pages/subjects/SubjectDetails";
import Notes from "../pages/subjects/Notes";
import AIStudyAssistant from "../pages/ai/AIStudyAssistant";
import ExamPlanner from "../pages/exams/ExamPlanner";
import PreviousYearPapers from "../pages/papers/PreviousYearPapers";
import Quiz from "../pages/quiz/Quiz";
import WeeklyTest from "../pages/quiz/WeeklyTest";
import DailyPlanner from "../pages/daily-planner/DailyPlanner";

/* =========================================================
   APP ROUTES
========================================================= */

function AppRoutes() {
  return (
    <Routes>
      {/* =====================================================
          STUDENT PUBLIC ROUTES
      ===================================================== */}

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      {/* =====================================================
          ADMIN PUBLIC ROUTES
      ===================================================== */}

      <Route path="/admin/login" element={<AdminLogin />} />

      {/* =====================================================
          STUDENT PROTECTED ROUTES
      ===================================================== */}

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          {/* Dashboard */}

          <Route path="/dashboard" element={<Dashboard />} />

          {/* Daily Planner */}

          <Route path="/daily-planner" element={<DailyPlanner />} />

          {/* Subjects */}

          <Route path="/subjects" element={<Subjects />} />

          {/* Subject Details */}

          <Route path="/subjects/:id" element={<SubjectDetails />} />

          {/* Subject Notes */}

          <Route path="/subjects/:id/notes" element={<Notes />} />

          {/* AI Study Assistant */}

          <Route path="/ai-assistant" element={<AIStudyAssistant />} />

          {/* Exam Planner */}

          <Route path="/exam-planner" element={<ExamPlanner />} />

          {/* Previous Year Papers */}

          <Route path="/previous-papers" element={<PreviousYearPapers />} />

          {/* Quiz */}

          <Route path="/quiz" element={<Quiz />} />

          {/* Weekly Test */}

          <Route path="/weekly-test" element={<WeeklyTest />} />

          {/* Profile */}

          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      {/* =====================================================
          ADMIN PROTECTED ROUTES
      ===================================================== */}

      <Route element={<AdminProtectedRoute />}>
        <Route element={<AdminLayout />}>
          {/* Admin Dashboard */}

          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          {/* Students */}

          <Route path="/admin/students" element={<Students />} />

          {/* Student Details */}

          <Route path="/admin/students/:id" element={<StudentDetails />} />

          {/* Subjects */}

          <Route path="/admin/subjects" element={<AdminSubjects />} />

          {/* Notes */}

          <Route path="/admin/notes" element={<AdminNotes />} />

          {/* Previous Year Papers */}

          <Route path="/admin/papers" element={<AdminPapers />} />

          {/* Quiz */}

          <Route path="/admin/quiz" element={<AdminQuiz />} />

          {/* Weekly Tests */}

          <Route path="/admin/weekly-tests" element={<AdminWeeklyTests />} />

          {/* =================================================
              ADMIN DAILY PLANNER
          ================================================= */}

          <Route path="/admin/daily-planner" element={<AdminDailyPlanner />} />

          {/* =================================================
              ADMIN PLANNER ACTIVITY
          ================================================= */}

          <Route
            path="/admin/daily-planner/activity"
            element={<AdminPlannerActivity />}
          />

          {/* Exams */}

          <Route path="/admin/exams" element={<AdminExams />} />

          {/* Settings */}

          <Route path="/admin/settings" element={<AdminSettings />} />
        </Route>
      </Route>

      {/* =====================================================
          DEFAULT ROUTE
      ===================================================== */}

      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* =====================================================
          404 ROUTE
      ===================================================== */}

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default AppRoutes;
