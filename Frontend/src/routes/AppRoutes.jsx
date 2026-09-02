import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import AdminLogin from "../pages/admin/auth/AdminLogin";

import ProtectedRoute from "./ProtectedRoute";
import AdminProtectedRoute from "./AdminProtectedRoute";
import MainLayout from "../layouts/MainLayout";
import AdminLayout from "../layouts/AdminLayout";

/* Admin */
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

/* Student */
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
import CGPACalculator from "../pages/calculator/CGPACalculator";

function AppRoutes() {
  return (
    <Routes>
      {/* STUDENT PUBLIC ROUTES */}

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      {/* ADMIN PUBLIC ROUTES */}

      <Route path="/admin/login" element={<AdminLogin />} />

      {/* STUDENT PROTECTED ROUTES */}

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/subjects" element={<Subjects />} />

          <Route path="/subjects/:id" element={<SubjectDetails />} />

          <Route path="/subjects/:id/notes" element={<Notes />} />

          <Route path="/ai-assistant" element={<AIStudyAssistant />} />

          <Route path="/exam-planner" element={<ExamPlanner />} />

          <Route path="/previous-papers" element={<PreviousYearPapers />} />

          <Route path="/quiz" element={<Quiz />} />

          <Route path="/weekly-test" element={<WeeklyTest />} />

          <Route path="/cgpa-calculator" element={<CGPACalculator />} />

          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      {/* ADMIN PROTECTED ROUTES */}

      <Route element={<AdminProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/students" element={<Students />} />
          <Route path="/admin/students/:id" element={<StudentDetails />} />
          <Route path="/admin/subjects" element={<AdminSubjects />} />
          <Route path="/admin/notes" element={<AdminNotes />} />
          <Route path="/admin/papers" element={<AdminPapers />} />
          <Route path="/admin/quiz" element={<AdminQuiz />} />
          <Route path="/admin/weekly-tests" element={<AdminWeeklyTests />} />
          <Route path="/admin/exams" element={<AdminExams />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Route>
      </Route>

      {/* DEFAULT ROUTE */}

      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* 404 ROUTE */}

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default AppRoutes;
