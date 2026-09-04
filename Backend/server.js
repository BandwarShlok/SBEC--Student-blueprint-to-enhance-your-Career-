const express = require("express");
const cors = require("cors");
const path = require("path");

require("dotenv").config();

const connectDB = require("./config/db");

/*
=========================================================
AUTH ROUTES
=========================================================
*/

const authRoutes = require("./routes/authRoutes");
const adminAuthRoutes = require("./routes/adminAuthRoutes");

/*
=========================================================
ADMIN ROUTES
=========================================================
*/

const adminRoutes = require("./routes/adminRoutes");
const adminNoteRoutes = require("./routes/adminNoteRoutes");

const paperRoutes = require("./routes/paperRoutes");
const quizRoutes = require("./routes/quizRoutes");
const weeklyTestRoutes = require("./routes/weeklyTestRoutes");
const examRoutes = require("./routes/examRoutes");
const adminSettingsRoutes = require("./routes/adminSettingsRoutes");

/*
=========================================================
ADMIN DAILY PLANNER
READ ONLY
=========================================================
*/

const adminDailyPlannerRoutes = require("./routes/adminDailyPlannerRoutes");

/*
=========================================================
ADMIN PLANNER ACTIVITY
READ ONLY
=========================================================
*/

const adminPlannerActivityRoutes = require("./routes/adminPlannerActivityRoutes");

/*
=========================================================
STUDENT ROUTES
=========================================================
*/

const studentDashboardRoutes = require("./routes/studentDashboardRoutes");

const studentQuizRoutes = require("./routes/studentQuizRoutes");

const studentSubjectRoutes = require("./routes/studentSubjectRoutes");

const dailyPlannerRoutes = require("./routes/dailyPlannerRoutes");

/*
=========================================================
STUDENT EXAM PLANNER
=========================================================
*/

const studentExamRoutes = require("./routes/studentExamRoutes");

/*
=========================================================
PROFILE ROUTE
=========================================================
*/

const profileRoutes = require("./routes/profileRoutes");

/*
=========================================================
APP
=========================================================
*/

const app = express();

/*
=========================================================
MIDDLEWARE
=========================================================
*/

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(
  express.json({
    limit: "10mb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  }),
);

/*
=========================================================
DATABASE
=========================================================
*/

connectDB();

/*
=========================================================
STATIC FILES
=========================================================
*/

// Uploaded files / PDFs / images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/*
=========================================================
AUTH
=========================================================
*/

/*
Student Login / Register
*/

app.use("/api/auth", authRoutes);

/*
Admin Login
*/

app.use("/api/admin/auth", adminAuthRoutes);

/*
=========================================================
ADMIN API
=========================================================
*/

/*
Admin Subjects / Students / Dashboard
*/

app.use("/api/admin", adminRoutes);

/*
Admin Notes
*/

app.use("/api/admin/notes", adminNoteRoutes);

/*
Previous Year Papers
*/

app.use("/api/papers", paperRoutes);

/*
=========================================================
ADMIN DAILY PLANNER
READ ONLY
=========================================================
*/

app.use("/api/admin/daily-planner", adminDailyPlannerRoutes);

/*
=========================================================
ADMIN PLANNER ACTIVITY
READ ONLY
=========================================================
*/

app.use("/api/admin/daily-planner/activity", adminPlannerActivityRoutes);

/*
Admin Quiz
*/

app.use("/api/admin/quiz", quizRoutes);

/*
Admin Weekly Tests
*/

app.use("/api/admin/weekly-tests", weeklyTestRoutes);

/*
Admin Exams
*/

app.use("/api/admin/exams", examRoutes);

/*
Admin Settings
*/

app.use("/api/admin/settings", adminSettingsRoutes);

/*
=========================================================
STUDENT API
=========================================================
*/

/*
Student Dashboard
*/

app.use("/api/student/dashboard", studentDashboardRoutes);

/*
Student Quiz
*/

app.use("/api/quiz", studentQuizRoutes);

/*
Student Subjects
*/

app.use("/api/student/subjects", studentSubjectRoutes);

/*
Student Daily Planner
*/

app.use("/api/daily-planner", dailyPlannerRoutes);

/*
Student Exam Planner
*/

app.use("/api/exam-planner", studentExamRoutes);

/*
Student Profile
*/

app.use("/api/profile", profileRoutes);

/*
=========================================================
ROOT ROUTE
=========================================================
*/

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SBEC Backend is running",
  });
});

/*
=========================================================
HEALTH CHECK
=========================================================
*/

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SBEC API is healthy",
  });
});

/*
=========================================================
API INFORMATION
=========================================================
*/

app.get("/api", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SBEC API",

    routes: {
      /*
      ================================================
      AUTH
      ================================================
      */

      auth: "/api/auth",

      adminAuth: "/api/admin/auth",

      /*
      ================================================
      ADMIN
      ================================================
      */

      admin: "/api/admin",

      adminNotes: "/api/admin/notes",

      adminDailyPlanner: "/api/admin/daily-planner",

      adminPlannerActivity: "/api/admin/daily-planner/activity",

      papers: "/api/papers",

      quiz: "/api/admin/quiz",

      weeklyTests: "/api/admin/weekly-tests",

      exams: "/api/admin/exams",

      settings: "/api/admin/settings",

      /*
      ================================================
      STUDENT
      ================================================
      */

      studentDashboard: "/api/student/dashboard",

      studentSubjects: "/api/student/subjects",

      dailyPlanner: "/api/daily-planner",

      studentExamPlanner: "/api/exam-planner",

      profile: "/api/profile",
    },
  });
});

/*
=========================================================
404 HANDLER
=========================================================
*/

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found.",
    path: req.originalUrl,
  });
});

/*
=========================================================
ERROR HANDLER
=========================================================
*/

app.use((err, req, res, next) => {
  console.error("================================");

  console.error("SBEC SERVER ERROR");

  console.error(err);

  console.error("================================");

  res.status(err.status || 500).json({
    success: false,

    message: err.message || "Internal server error.",

    ...(process.env.NODE_ENV === "development" && {
      error: err.stack,
    }),
  });
});

/*
=========================================================
START SERVER
=========================================================
*/

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("================================");

  console.log("SBEC BACKEND STARTED");

  console.log(`Port: ${PORT}`);

  console.log(`Local: http://localhost:${PORT}`);

  console.log(`Health: http://localhost:${PORT}/api/health`);

  console.log("================================");
});
