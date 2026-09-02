const express = require("express");
const cors = require("cors");
const path = require("path");

require("dotenv").config();

const connectDB = require("./config/db");

/* =========================================================
   AUTH ROUTES
========================================================= */

const authRoutes = require("./routes/authRoutes");
const adminAuthRoutes = require("./routes/adminAuthRoutes");

/* =========================================================
   ADMIN ROUTES
========================================================= */

const adminRoutes = require("./routes/adminRoutes");
const adminNoteRoutes = require("./routes/adminNoteRoutes");

const paperRoutes = require("./routes/paperRoutes");
const quizRoutes = require("./routes/quizRoutes");
const weeklyTestRoutes = require("./routes/weeklyTestRoutes");
const examRoutes = require("./routes/examRoutes");
const adminSettingsRoutes = require("./routes/adminSettingsRoutes");

/* =========================================================
   STUDENT ROUTES
========================================================= */

const studentDashboardRoutes = require("./routes/studentDashboardRoutes");
const studentSubjectRoutes = require("./routes/studentSubjectRoutes");

/* =========================================================
   PROFILE ROUTE
========================================================= */

// Student profile
const profileRoutes = require("./routes/profileRoutes");

/* =========================================================
   APP
========================================================= */

const app = express();

/* =========================================================
   MIDDLEWARE
========================================================= */

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

/* =========================================================
   DATABASE
========================================================= */

connectDB();

/* =========================================================
   STATIC FILES
========================================================= */

// Uploaded files / PDFs / images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* =========================================================
   AUTH
========================================================= */

/*
=========================================================
Student Login / Register
=========================================================
*/

app.use("/api/auth", authRoutes);

/*
=========================================================
Admin Login
=========================================================
*/

app.use("/api/admin/auth", adminAuthRoutes);

/* =========================================================
   ADMIN API
========================================================= */

/*
=========================================================
Admin Subjects / Students / Dashboard
=========================================================
*/

app.use("/api/admin", adminRoutes);

/*
=========================================================
Admin Notes
=========================================================
*/

app.use("/api/admin/notes", adminNoteRoutes);

/*
=========================================================
Previous Year Papers
=========================================================
*/

app.use("/api/papers", paperRoutes);

/*
=========================================================
Admin Quiz
=========================================================
*/

app.use("/api/admin/quiz", quizRoutes);

/*
=========================================================
Admin Weekly Tests
=========================================================
*/

app.use("/api/admin/weekly-tests", weeklyTestRoutes);

/*
=========================================================
Admin Exams
=========================================================
*/

app.use("/api/admin/exams", examRoutes);

/*
=========================================================
Admin Settings
=========================================================
*/

app.use("/api/admin/settings", adminSettingsRoutes);

/* =========================================================
   STUDENT API
========================================================= */

/*
=========================================================
Student Dashboard
=========================================================
*/

app.use("/api/student/dashboard", studentDashboardRoutes);

/*
=========================================================
Student Subjects
=========================================================
*/

app.use("/api/student/subjects", studentSubjectRoutes);

/*
=========================================================
Student Profile

GET:
    /api/profile

PUT:
    /api/profile

Authentication:
    Bearer JWT token
=========================================================
*/

app.use("/api/profile", profileRoutes);

/* =========================================================
   ROOT ROUTE
========================================================= */

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SBEC Backend is running",
  });
});

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SBEC API is healthy",
  });
});

/* =========================================================
   API INFORMATION
========================================================= */

app.get("/api", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SBEC API",
    routes: {
      auth: "/api/auth",
      adminAuth: "/api/admin/auth",

      admin: "/api/admin",
      adminNotes: "/api/admin/notes",
      papers: "/api/papers",
      quiz: "/api/admin/quiz",
      weeklyTests: "/api/admin/weekly-tests",
      exams: "/api/admin/exams",
      settings: "/api/admin/settings",

      studentDashboard: "/api/student/dashboard",

      studentSubjects: "/api/student/subjects",

      profile: "/api/profile",
    },
  });
});

/* =========================================================
   404 HANDLER
========================================================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found.",
    path: req.originalUrl,
  });
});

/* =========================================================
   ERROR HANDLER
========================================================= */

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

/* =========================================================
   START SERVER
========================================================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("================================");

  console.log("SBEC BACKEND STARTED");

  console.log(`Port: ${PORT}`);

  console.log(`Local: http://localhost:${PORT}`);

  console.log(`Health: http://localhost:${PORT}/api/health`);

  console.log(`Profile: http://localhost:${PORT}/api/profile`);

  console.log("================================");
});
